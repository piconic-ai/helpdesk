import { expect, it } from 'vitest'
import { applyMigrations, testPlatform } from './platform'
import { listConversations } from '../src/core/conversations/conversations-store'
import { filterSchema } from '../src/core/conversations/filters'
import { deleteContent } from '../src/core/retention/retention-store'

it('F01-AC13 searches migrated and new text, merged history, edits and erasure in D1', async () => {
  const migration = '0010_search.sql'
  const platform = await testPlatform((name) => name < migration)
  const db = platform.DB
  const search = async (query: string) =>
    (
      await listConversations(
        db,
        filterSchema.parse({ query, status: 'all' }),
        { 1: 2 },
      )
    ).map((c) => c.number)
  try {
    await db.batch([
      db.prepare("INSERT INTO products VALUES('shop','Shop')"),
      db.prepare("INSERT INTO mailboxes VALUES('help@example.org','shop')"),
      db.prepare(
        "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES('shop','help@example.org','reader@example.org','発送について','open',1)",
      ),
      db.prepare(
        "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES('shop','help@example.org','reader@example.org','New title','open',2)",
      ),
      db
        .prepare(
          "INSERT INTO messages(id,number,kind,body,created_at) VALUES('mail',1,'inbound',?,1)",
        )
        .bind('配送日時は "10%_OFF" 📨'),
    ])
    await applyMigrations(db, (name) => name >= migration)
    expect(
      await db
        .prepare(
          "SELECT count(*) AS n FROM message_search WHERE message_search MATCH '配送日'",
        )
        .first('n'),
    ).toBe(1)
    for (const q of [
      '送につ',
      '配送日',
      '10%_off',
      '"10',
      '%_',
      '日',
      '📨',
      'DER@EX',
    ])
      expect(await search(q)).toContain(2)
    expect(await search('10__off')).toEqual([])
    await db
      .prepare("UPDATE messages SET body='Edited copy' WHERE id='mail'")
      .run()
    expect(await search('配送日')).toEqual([])
    expect(await search('ted c')).toContain(2)
    await db
      .prepare(
        "UPDATE conversations SET subject='Different subject' WHERE number=2",
      )
      .run()
    expect(await search('New title')).toEqual([])
    expect(await search('rent sub')).toContain(2)
    await db
      .prepare(
        "INSERT INTO messages(id,number,kind,body,created_at) VALUES('second',2,'inbound','Private content',2)",
      )
      .run()
    expect(await search('ate con')).toContain(2)
    await db
      .prepare(
        "UPDATE conversations SET status='closed',closed_at=3 WHERE number=2",
      )
      .run()
    await deleteContent(db, { before: 4 })
    expect(await search('Private')).toEqual([])
    await deleteContent(db, { contact: 'reader@example.org' })
    expect(await search('ted c')).toEqual([])
    for (const [table, query] of [
      ['message_search', 'edited'],
      ['conversation_search', 'different'],
    ])
      expect(
        await db
          .prepare(`SELECT count(*) AS n FROM ${table} WHERE ${table} MATCH ?`)
          .bind(query)
          .first('n'),
      ).toBe(0)
  } finally {
    await platform.dispose()
  }
})
