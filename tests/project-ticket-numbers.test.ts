import { expect, it } from 'vitest'
import { applyMigrations, testPlatform } from './platform'
import { listConversations } from '../src/core/conversations/conversations-store'
import { filterSchema } from '../src/core/conversations/filters'
import { ticketPrefixSchema } from '../src/core/conversations/ticket-reference'
import { conversationFor } from '../src/core/inbound/inbound-store'
import { inboundJob } from '../src/core/inbound/job'
import { parseMail } from '../src/core/inbound/parse'
import { intakeSchema } from '../src/core/intakes/intake'
import { contactInfo, open } from '../src/core/intakes/intake-store'
import { setTicketPrefix } from '../src/core/operations/operator-store'

const audit = { actor: '{"kind":"system"}', now: 1 }
const sender = 'customer@example.org'

async function configure(db: D1Database, project: string, prefix: string) {
  await db.batch([
    db.prepare('INSERT INTO products VALUES(?,?)').bind(project, project),
    db
      .prepare('INSERT INTO mailboxes VALUES(?,?)')
      .bind(project + '@example.org', project),
  ])
  await setTicketPrefix(db, audit, project, ticketPrefixSchema.parse(prefix))
}

function intake(db: D1Database, product: string, subject: string) {
  return open(
    db,
    intakeSchema.parse({
      product,
      email: sender,
      origin: 'form',
      subject,
      body: subject,
    }),
    {
      actor: { kind: 'system' },
      now: 1,
      id: crypto.randomUUID(),
    },
  )
}

async function match(
  db: D1Database,
  to: string,
  reference: string,
  from = sender,
) {
  const raw = new TextEncoder().encode(
    'From: ' +
      from +
      '\r\nTo: ' +
      to +
      '\r\nSubject: Re: [' +
      reference +
      ']\r\n\r\nA reply',
  )
  return conversationFor(
    db,
    inboundJob.parse({
      kind: 'inbound',
      rawKey: 'raw/' + crypto.randomUUID(),
      from,
      to,
      receivedAt: 2,
    }),
    await parseMail(raw.buffer, from),
  )
}

it('allocates locally, resolves the original case after moves and prefix changes, and never recycles a deleted ticket', async () => {
  const local = await testPlatform()
  const db = local.DB
  try {
    await configure(db, 'slide', 'SLD')
    await configure(db, 'desk', 'DSK')
    const first = await intake(db, 'slide', 'Slide question')
    const second = await intake(db, 'desk', 'Desk question')
    const more = await Promise.all(
      ['One', 'Two', 'Three'].map((subject) => intake(db, 'slide', subject)),
    )
    const refs = await Promise.all(
      more.map(async ({ number }) => (await contactInfo(db, number)).reference),
    )
    expect(refs.sort()).toEqual(['SLD-2', 'SLD-3', 'SLD-4'])
    expect((await contactInfo(db, first.number)).reference).toBe('SLD-1')
    expect((await contactInfo(db, second.number)).reference).toBe('DSK-1')
    expect(await match(db, 'desk@example.org', 'SLD-1')).toBeNull()
    expect(await match(db, 'slide@example.org', 'DSK-1')).toBeNull()
    expect(await match(db, 'desk@example.org', 'DSK-1')).toBe(second.number)
    expect(
      await match(db, 'desk@example.org', 'DSK-1', 'other@example.org'),
    ).toBeNull()

    await db
      .prepare("UPDATE conversations SET product='desk' WHERE number=?")
      .bind(first.number)
      .run()
    expect((await contactInfo(db, first.number)).reference).toBe('DSK-2')
    expect(await match(db, 'slide@example.org', 'SLD-1')).toBe(first.number)
    await setTicketPrefix(db, audit, 'desk', ticketPrefixSchema.parse('HELP'))
    expect((await contactInfo(db, first.number)).reference).toBe('HELP-2')
    expect(await match(db, 'slide@example.org', 'DSK-2')).toBe(first.number)
    expect(
      await setTicketPrefix(
        db,
        audit,
        'slide',
        ticketPrefixSchema.parse('DSK'),
      ),
    ).toBe('duplicate')
    const search = filterSchema.parse({ query: 'sld-1', status: 'all' })
    expect(await listConversations(db, search, {}, ['slide'])).toEqual([])
    expect(await listConversations(db, search, {}, ['desk'])).toMatchObject([
      { number: first.number, ticketNumber: 2, reference: 'HELP-2' },
    ])

    await db
      .prepare('DELETE FROM conversations WHERE number=?')
      .bind(first.number)
      .run()
    const next = await intake(db, 'desk', 'After erasure')
    expect((await contactInfo(db, next.number)).reference).toBe('HELP-3')
    expect(await match(db, 'desk@example.org', 'DSK-2')).toBeNull()
  } finally {
    await local.dispose()
  }
})

it('keeps already published numbers and reserves erased legacy IDs during migration', async () => {
  const local = await testPlatform((file) => file < '0031')
  const db = local.DB
  try {
    await db.batch([
      db.prepare("INSERT INTO products VALUES('legacy','Existing project')"),
      db.prepare("INSERT INTO mailboxes VALUES('legacy@example.org','legacy')"),
      db.prepare(
        "UPDATE product_ticket_prefixes SET prefix='LEG' WHERE product='legacy'",
      ),
      db
        .prepare(
          "INSERT INTO conversations(number,product,mailbox,contact,subject,status,created_at) VALUES (18,'legacy','legacy@example.org',?,'Old','open',1),(30,'legacy','legacy@example.org',?,'Erased','open',1)",
        )
        .bind(sender, sender),
      db.prepare('DELETE FROM conversations WHERE number=30'),
    ])
    await applyMigrations(db, (file) => file.startsWith('0031'))
    expect((await contactInfo(db, 18)).reference).toBe('LEG-18')
    expect(await match(db, 'legacy@example.org', '#18')).toBe(18)
    expect(await match(db, 'legacy@example.org', 'LEG-18')).toBe(18)
    expect(await match(db, 'legacy@example.org', 'AAAAA-18')).toBe(18)
    const next = await intake(db, 'legacy', 'Next')
    expect((await contactInfo(db, next.number)).reference).toBe('LEG-31')
    await configure(db, 'new', 'NEW')
    expect(await match(db, 'legacy@example.org', 'NEW-18')).toBeNull()
    expect(await match(db, 'legacy@example.org', 'PAST-31')).toBeNull()
    const fresh = await intake(db, 'new', 'First')
    expect((await contactInfo(db, fresh.number)).reference).toBe('NEW-1')
  } finally {
    await local.dispose()
  }
})
