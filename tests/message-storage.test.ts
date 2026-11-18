import { beforeAll, afterAll, it, expect } from 'vitest'
import fc from 'fast-check'
import { testPlatform } from './platform'
import { messageRow } from '../src/core/conversations/conversations-schema'

let platform: Awaited<ReturnType<typeof testPlatform>>
const author = JSON.stringify({ kind: 'operator', id: 'staff' })
const approval = JSON.stringify({ kind: 'operator', by: 'staff' })

beforeAll(async () => {
  platform = await testPlatform()
  await platform.DB.batch([
    platform.DB.prepare("INSERT INTO products VALUES('alpha','Alpha')"),
    platform.DB.prepare(
      "INSERT INTO mailboxes VALUES('alpha@example.com','alpha')",
    ),
    platform.DB.prepare(
      "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES('alpha','alpha@example.com','sender@example.com','Hello','open',1)",
    ),
  ])
})
afterAll(() => platform?.dispose())

function sent(value: string | null) {
  return {
    id: 'reply',
    number: 1,
    kind: 'outbound',
    body: 'Hello',
    html: null,
    raw_key: null,
    message_id: null,
    in_reply_to: null,
    refs: null,
    delivery: 'sent',
    approval: value,
    actor: author,
    reason: null,
    provider_id: 'm@example.com',
    created_at: 1,
    sent_at: 2,
  }
}
function insert(row: ReturnType<typeof sent>) {
  const fields = Object.keys(row)
  return platform.DB.prepare(
    `INSERT INTO messages(${fields.join(',')}) VALUES(${fields.map(() => '?').join(',')})`,
  )
    .bind(...Object.values(row))
    .run()
}
it('validates approval identity in the database and at the read boundary', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.oneof(
        fc.constant(null),
        fc.string().map((by) => JSON.stringify({ kind: 'agent', by })),
        fc.constantFrom(
          '{}',
          '{"kind":"operator"}',
          '{"kind":"standing","policy":"ack"}',
        ),
      ),
      async (malformed) => {
        expect(messageRow.safeParse(sent(malformed)).success).toBe(false)
        await expect(insert(sent(malformed))).rejects.toThrow(
          /CHECK constraint/,
        )
      },
    ),
    { numRuns: 15 },
  )
  expect(messageRow.parse(sent(approval)).delivery).toBe('sent')
  await expect(insert(sent(approval))).resolves.toMatchObject({ success: true })
})
it('rejects notes with delivery metadata and outbound rows without authors', async () => {
  for (const row of [
    { ...sent(approval), kind: 'note' },
    { ...sent(approval), actor: '' },
    { ...sent(approval), sent_at: null },
  ]) {
    expect(messageRow.safeParse(row).success).toBe(false)
  }
})
