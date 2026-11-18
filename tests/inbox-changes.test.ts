import { afterAll, beforeAll, expect, test } from 'vitest'
import { app } from '../worker'
import type { Bindings } from '../src/core/settings/bindings'
import { testPlatform } from './platform'

let platform: Awaited<ReturnType<typeof testPlatform>>
const owner = 'owner@example.com',
  second = 'agent@example.com',
  origin = 'https://desk.example'
function request(path: string, actor: string, input?: unknown) {
  return app.request(
    origin + path,
    input
      ? {
          method: 'POST',
          body: JSON.stringify(input),
          headers: { origin, 'content-type': 'application/json' },
        }
      : {},
    {
      ...platform,
      ENVIRONMENT: 'local',
      LOCAL_OPERATOR: actor,
    } as unknown as Bindings,
  )
}
async function apply(input: unknown) {
  const response = await request('/inbox/change', owner, input)
  expect(response.status).toBe(200)
  return (await response.json()) as { token: string; count: number }
}
const undo = (token: string, actor = owner) =>
  request('/inbox/undo', actor, { token })
beforeAll(async () => {
  platform = await testPlatform()
  await request('/', owner)
  await request('/', second)
  const db = platform.DB
  await db.batch([
    db.prepare("INSERT INTO products(id,name) VALUES('test','Test')"),
    db.prepare("INSERT INTO mailboxes VALUES('support@example.com','test')"),
    db.prepare(
      "WITH RECURSIVE n(v) AS(VALUES(1) UNION ALL SELECT v+1 FROM n WHERE v<12) INSERT INTO conversations(number,product,mailbox,contact,subject,kind,status,created_at) SELECT v,'test','support@example.com','reader@example.net','Test','inquiry','open',1 FROM n",
    ),
    db
      .prepare("INSERT INTO extension_settings VALUES('merge',1,?)")
      .bind(owner),
  ])
})
afterAll(() => platform?.dispose())

test('bulk restores heterogeneous previous statuses and closed timestamps only once for the original operator', async () => {
  await platform.DB.batch([
    platform.DB.prepare(
      "UPDATE conversations SET status='closed',closed_at=123 WHERE number=1",
    ),
    platform.DB.prepare(
      "UPDATE conversations SET status='pending' WHERE number=2",
    ),
    platform.DB.prepare(
      "UPDATE conversations SET kind='feedback',status='reviewed',reviewed_by=? WHERE number=3",
    ).bind(owner),
  ])
  const change = await apply({ numbers: [1, 2, 3], action: 'marked_spam' })
  expect(change.count).toBe(3)
  expect((await undo(change.token, second)).status).toBe(409)
  const raced = await Promise.all([undo(change.token), undo(change.token)])
  expect(raced.map((r) => r.status).sort()).toEqual([200, 409])
  const rows = await platform.DB.prepare(
    'SELECT status,closed_at,reviewed_by FROM conversations WHERE number<=3 ORDER BY number',
  ).all()
  expect(rows.results).toEqual([
    { status: 'closed', closed_at: 123, reviewed_by: null },
    { status: 'pending', closed_at: null, reviewed_by: null },
    { status: 'reviewed', closed_at: null, reviewed_by: owner },
  ])
})

test('a later assignment prevents the entire bulk undo and invalid targets leave every selected conversation untouched', async () => {
  const change = await apply({
    numbers: [4, 5],
    action: 'assign',
    email: second,
  })
  await apply({ numbers: [5], action: 'assign', email: owner })
  expect((await undo(change.token)).status).toBe(409)
  expect(
    await platform.DB.prepare(
      'SELECT assignee FROM conversations WHERE number=4',
    ).first('assignee'),
  ).toBe(second)
  const invalid = await request('/inbox/change', owner, {
    numbers: [4, 5],
    action: 'assign',
    email: 'unregistered@example.com',
  })
  expect(invalid.status).toBe(409)
  expect(
    await platform.DB.prepare(
      "SELECT count(*) AS n FROM events WHERE kind='assigned' AND number IN (4,5)",
    ).first('n'),
  ).toBe(3)
})
test('a newer state even without a matching event is preserved by undo', async () => {
  const change = await apply({ numbers: [6, 7], action: 'closed' })
  await platform.DB.prepare(
    "UPDATE conversations SET status='pending',closed_at=NULL WHERE number=6",
  ).run()
  expect((await undo(change.token)).status).toBe(409)
  expect(
    await platform.DB.prepare(
      'SELECT status FROM conversations WHERE number=7',
    ).first('status'),
  ).toBe('closed')
})
test('removing and restoring a shared label across merged aliases preserves the original membership', async () => {
  const db = platform.DB
  await db
    .prepare("INSERT INTO merge_data VALUES('aliases',?)")
    .bind(JSON.stringify({ 8: 9 }))
    .run()
  await db
    .prepare("INSERT INTO labels VALUES(8,'common'),(9,'common'),(10,'other')")
    .run()
  expect(
    (await apply({ numbers: [8, 9, 10], action: 'add', label: 'common' }))
      .count,
  ).toBe(1)
  const removed = await apply({
    numbers: [8, 9],
    action: 'remove',
    label: 'common',
  })
  expect(removed.count).toBe(1)
  expect(
    await db
      .prepare("SELECT count(*) n FROM labels WHERE name='common'")
      .first('n'),
  ).toBe(1)
  expect((await undo(removed.token)).status).toBe(200)
  expect(
    (
      await db
        .prepare(
          "SELECT number FROM labels WHERE name='common' ORDER BY number",
        )
        .all()
    ).results,
  ).toEqual([{ number: 8 }, { number: 9 }, { number: 10 }])
})
