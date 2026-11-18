import { beforeAll, afterAll, it, expect, vi } from 'vitest'
import fc from 'fast-check'
import { actorSchema, deliverySchema } from '../conversations/state'
import { replyDelivery } from './approval'
import {
  queueReply,
  retryReply,
  approveReply,
  deliverReply,
  recoverReplies,
} from './reply-usecase'
import { testPlatform } from '../../../tests/platform'
import type { EmailPayload } from './send-client'

let local: Awaited<ReturnType<typeof testPlatform>>
const operator = { kind: 'operator', id: 'team@example.org' } as const
const agent = {
  kind: 'agent',
  id: 'bot',
  onBehalfOf: 'team@example.org',
} as const
const now = 7
beforeAll(async () => {
  local = await testPlatform()
  await local.DB.batch([
    local.DB.prepare("INSERT INTO products VALUES ('test','Product')"),
    local.DB.prepare(
      "INSERT INTO mailboxes VALUES ('support@example.org','test')",
    ),
  ])
})
afterAll(async () => {
  await local?.dispose()
})

async function receive() {
  const r =
    await local.DB.prepare(`INSERT INTO conversations(product,mailbox,contact,subject,status,created_at)
    VALUES('test','support@example.org','user@example.org','Subject','open',1) RETURNING number`).first<number>(
      'number',
    )
  if (!r) throw new Error('Missing number')
  await local.DB.prepare(`INSERT INTO messages(id,number,kind,message_id,refs,created_at)
    VALUES (?,?,'inbound','<in@example.org>','<original@example.org>',1)`)
    .bind(crypto.randomUUID(), r)
    .run()
  return r
}
function state(id: string) {
  return local.DB.prepare(
    'SELECT delivery,reason,provider_id FROM messages WHERE id=?',
  )
    .bind(id)
    .first()
}
function success() {
  return vi.fn(async (_message: EmailPayload) => ({
    messageId: 'sent@example.org',
  }))
}

it('F01-AC17 F01-AC18 F01-AC19 F01-AC21 F01-AC31: two deliveries send one threaded reply from the original mailbox', async () => {
  const number = await receive()
  const { id } = await queueReply(local, {
    number,
    actor: operator,
    body: 'Working!',
    now,
  })
  const send = success()
  const env = { ...local, EMAIL: { send } }
  await Promise.all([deliverReply(env, id, now), deliverReply(env, id, now)])
  expect(send).toHaveBeenCalledTimes(1)
  expect(send).toHaveBeenCalledWith({
    from: 'support@example.org',
    to: 'user@example.org',
    text: 'Working!',
    subject: `Re: Subject [#${number}]`,
    headers: {
      'In-Reply-To': '<in@example.org>',
      References: '<original@example.org> <in@example.org>',
    },
  })
  expect(await state(id)).toMatchObject({
    delivery: 'sent',
    provider_id: 'sent@example.org',
  })
  expect(
    await local.DB.prepare('SELECT status FROM conversations WHERE number=?')
      .bind(number)
      .first('status'),
  ).toBe('pending')
  expect(
    (
      await local.DB.prepare(
        'SELECT kind FROM events WHERE number=? AND actor=? AND at=? ORDER BY id',
      )
        .bind(number, JSON.stringify(operator), now)
        .all()
    ).results,
  ).toEqual([
    { kind: 'reply_queued' },
    { kind: 'status_changed' },
    { kind: 'reply_sent' },
  ])
})

it('F01-AC20 F01-AC31: a rejected delivery can be retried once', async () => {
  const number = await receive()
  const { id } = await queueReply(local, {
    number,
    actor: operator,
    body: 'Repaired',
    now,
  })
  const send = success().mockRejectedValueOnce({
    code: 'E_RATE_LIMIT_EXCEEDED',
  })
  const env = { ...local, EMAIL: { send } }
  await deliverReply(env, id, now)
  expect(await state(id)).toMatchObject({
    delivery: 'failed',
    reason: 'E_RATE_LIMIT_EXCEEDED',
  })
  expect(
    await local.DB.prepare(
      "SELECT actor,at FROM events WHERE kind='reply_failed' AND number=?",
    )
      .bind(number)
      .first(),
  ).toEqual({ actor: JSON.stringify(operator), at: now })
  await retryReply(local, { id, actor: operator, now })
  await expect(
    retryReply(local, { id, actor: operator, now }),
  ).rejects.toThrow()
  await deliverReply(env, id, now)
  expect(await state(id)).toMatchObject({ delivery: 'sent' })
  expect(send).toHaveBeenCalledTimes(2)
})
it('F01-AC21: an unknown delivery outcome is visible and cannot automatically resend', async () => {
  const number = await receive()
  const { id } = await queueReply(local, {
    number,
    actor: operator,
    body: 'Update',
    now,
  })
  const send = success().mockRejectedValueOnce(new Error('Connection lost'))
  const env = { ...local, EMAIL: { send } }
  await deliverReply(env, id, now)
  await recoverReplies(env)
  await deliverReply(env, id, now)
  await expect(
    retryReply(local, { id, actor: operator, now }),
  ).rejects.toThrow()
  expect(send).toHaveBeenCalledTimes(1)
  expect(await state(id)).toMatchObject({
    delivery: 'failed',
    reason: 'Email Service delivery outcome unknown',
  })
})
it('F01-AC22: a note cannot enter the delivery path through submit, retry or approval', async () => {
  const number = await receive()
  const id = crypto.randomUUID()
  await local.DB.prepare(
    'INSERT INTO messages(id,number,kind,body,created_at,actor) VALUES(?,?,\'note\',\'Internal\',1,\'{"kind":"operator","id":"staff"}\')',
  )
    .bind(id, number)
    .run()
  const send = success()
  const env = { ...local, EMAIL: { send } }
  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.constantFrom('retry', 'approve', 'deliver')),
      async (sequence) => {
        for (const action of sequence) {
          if (action === 'deliver') await deliverReply(env, id, now)
          else
            await expect(
              (action === 'retry' ? retryReply : approveReply)(env, {
                id,
                now,
                actor: operator,
              }),
            ).rejects.toThrow()
        }
        expect(send).not.toHaveBeenCalled()
      },
    ),
    { numRuns: 12 },
  )
})
it('requires a human approval for an agent reply', async () => {
  const number = await receive()
  const { id } = await queueReply(local, {
    number,
    actor: agent,
    body: 'Draft',
    now,
  })
  const send = success()
  const env = { ...local, EMAIL: { send } }
  await expect(approveReply(env, { id, actor: agent, now })).rejects.toThrow()
  await deliverReply(env, id, now)
  expect(send).not.toHaveBeenCalled()
  await approveReply(env, { id, actor: operator, now })
  await deliverReply(env, id, now)
  expect(send).toHaveBeenCalledTimes(1)
})
it('only the operator creates a sendable reply and sent always requires approval', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }),
      fc.string({ minLength: 1 }),
      (id, providerId) => {
        expect(replyDelivery(actorSchema.parse({ ...agent, id }))).toEqual({
          kind: 'awaiting_approval',
        })
        expect(
          deliverySchema.safeParse({ kind: 'sent', providerId, sentAt: 42 })
            .success,
        ).toBe(false)
      },
    ),
  )
})

it('F01-AC21: cron exposes an interrupted claim without sending a second message', async () => {
  const number = await receive()
  const { id } = await queueReply(local, {
    number,
    actor: operator,
    body: 'Update',
    now,
  })
  await local.DB.prepare(
    "UPDATE outbox SET phase='sending',claimed_at=? WHERE message=?",
  )
    .bind(now, id)
    .run()
  await recoverReplies(local, now + 60 * 60 * 1000)
  const send = success()
  await deliverReply({ ...local, EMAIL: { send } }, id, now)
  expect(send).not.toHaveBeenCalled()
  expect(await state(id)).toMatchObject({
    delivery: 'failed',
    reason: 'Delivery interrupted; verify the provider activity log',
  })
  await expect(
    retryReply(local, { id, actor: operator, now }),
  ).rejects.toThrow()
})
