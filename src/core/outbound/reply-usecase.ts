import { z } from 'zod'
import {
  actorSchema,
  instantSchema,
  numberSchema,
} from '../conversations/state'
import { replyDelivery, operatorApproval } from './approval'
import { composeReply } from './compose'
import {
  insertReply,
  requeueReply,
  claim,
  finish,
  waiting,
  interrupted,
} from './reply-store'
import { sendReply, type EmailBinding } from './send-client'

type QueueEnv = {
  DB: D1Database
  JOBS: Pick<Queue<{ kind: 'outbound'; id: string }>, 'send'>
}
const mutationSchema = z.object({
  id: z.string().min(1),
  actor: actorSchema,
  now: instantSchema,
})
const submitSchema = mutationSchema
  .omit({ id: true })
  .extend({ number: numberSchema, body: z.string().trim().min(1).max(131072) })
async function notify(env: QueueEnv, id: string) {
  // Cron also polls the durable outbox if the queue is unavailable after commit.
  await env.JOBS.send({ kind: 'outbound', id }).catch(() => undefined)
}

export async function queueReply(
  env: QueueEnv,
  input: z.input<typeof submitSchema>,
) {
  const reply = submitSchema.parse(input)
  const delivery = replyDelivery(reply.actor)
  const id = crypto.randomUUID()
  await insertReply(env.DB, {
    ...reply,
    id,
    approval: delivery.kind === 'queued' ? delivery.approval : null,
  })
  if (delivery.kind === 'queued') await notify(env, id)
  return { id }
}

async function queueExisting(
  env: QueueEnv,
  input: z.input<typeof mutationSchema>,
  from: 'failed' | 'awaiting_approval',
) {
  const command = mutationSchema.parse(input)
  const approval = operatorApproval(command.actor)
  await requeueReply(env.DB, { ...command, approval }, from)
  await notify(env, command.id)
  return { id: command.id }
}
export function approveReply(
  env: QueueEnv,
  input: z.input<typeof mutationSchema>,
) {
  return queueExisting(env, input, 'awaiting_approval')
}
export function retryReply(
  env: QueueEnv,
  input: z.input<typeof mutationSchema>,
) {
  return queueExisting(env, input, 'failed')
}
export async function deliverReply(
  env: { DB: D1Database; EMAIL: EmailBinding },
  id: string,
  now: number,
) {
  const reply = await claim(env.DB, id, now)
  if (!reply) return
  const result = await sendReply(env.EMAIL, composeReply(reply))
  await finish(env.DB, id, reply.attempt, reply.actor, now, result)
}
export async function recoverReplies(env: QueueEnv, now = Date.now()) {
  // A consumer can terminate between provider acceptance and the D1 commit.
  // The claim outlives the worker so queue redelivery cannot send twice.
  const claims = await interrupted(env.DB, now - 60 * 60 * 1000)
  for (const { message, attempt } of claims) {
    await finish(env.DB, message, attempt, { kind: 'system' }, now, {
      kind: 'unknown',
      reason: 'Delivery interrupted; verify the provider activity log',
    })
  }
  const ids = await waiting(env.DB)
  await Promise.all(ids.map((id) => notify(env, id)))
}
