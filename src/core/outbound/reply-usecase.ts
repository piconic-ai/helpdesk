import { decideSend } from './schedule'
import { z } from 'zod'
import {
  actorSchema,
  approvalSchema,
  instantSchema,
  numberSchema,
} from '../conversations/state'
import { replyDelivery, operatorApproval } from './approval'
import { composeReply } from './compose'
import {
  insertReply,
  insertStanding,
  discardDraft,
  requeueReply,
  claim,
  finish,
  waiting,
  interrupted,
} from './reply-store'
import {
  undoHeldReply,
  releaseReplyNow,
  scheduledSend,
  holdInterruptedSend,
  replyHolds,
  holdDelay,
  replyDelayFor,
} from './reply-hold-store'
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
const approvalInput = mutationSchema.extend({
  body: z.string().trim().min(1).max(100000).optional(),
})
const submitSchema = mutationSchema.omit({ id: true }).extend({
  number: numberSchema,
  body: z.string().trim().min(1).max(131072),
  close: z.boolean().optional(),
  undoable: z.boolean().optional(),
})
async function notify(env: QueueEnv, id: string, delaySeconds = 0) {
  // Cron also polls the durable outbox if the queue is unavailable after commit.
  await env.JOBS.send({ kind: 'outbound', id }, { delaySeconds }).catch(
    () => undefined,
  )
}

export async function queueReply(
  env: QueueEnv,
  input: z.input<typeof submitSchema>,
) {
  const reply = submitSchema.parse(input)
  if (reply.close) operatorApproval(reply.actor)
  const delivery = replyDelivery(reply.actor)
  const id = crypto.randomUUID()
  const delay =
    reply.undoable && reply.actor.kind === 'operator'
      ? await replyDelayFor(env.DB, reply.actor.id, reply.number)
      : 0
  await insertReply(env.DB, {
    holdUntil: delay ? reply.now + delay * 1000 : undefined,
    ...reply,
    id,
    approval: delivery.kind === 'queued' ? delivery.approval : null,
  })
  if (delivery.kind === 'queued') await notify(env, id, delay)
  return { id }
}

export async function sendReplyNow(
  env: QueueEnv,
  input: z.input<typeof mutationSchema>,
) {
  const command = mutationSchema.parse(input)
  const approval = operatorApproval(command.actor)
  await releaseReplyNow(env.DB, command.id, approval.by, command.now)
  await notify(env, command.id)
  return { id: command.id }
}

export function undoReply(
  env: QueueEnv,
  input: z.input<typeof mutationSchema>,
) {
  const command = mutationSchema.parse(input)
  operatorApproval(command.actor)
  return undoHeldReply(env.DB, command.id, command.actor, command.now)
}

export function pendingReplyUndos(
  env: QueueEnv,
  number: number,
  operator: string,
  now: number,
) {
  return replyHolds(env.DB, number, operator, now)
}

async function queueExisting(
  env: QueueEnv,
  input: z.input<typeof approvalInput>,
  from: 'failed' | 'awaiting_approval',
) {
  const command = approvalInput.parse(input)
  const approval = operatorApproval(command.actor)
  const delay =
    from === 'awaiting_approval'
      ? await replyDelayFor(env.DB, approval.by, command.id)
      : 0
  await requeueReply(
    env.DB,
    {
      ...command,
      approval,
      holdUntil: delay ? command.now + delay * 1000 : undefined,
      restoreDraft: delay > 0,
    },
    from,
  )
  await notify(env, command.id, delay)
  return { id: command.id }
}
export function approveReply(
  env: QueueEnv,
  input: z.input<typeof approvalInput>,
) {
  return queueExisting(env, input, 'awaiting_approval')
}
export async function discardReply(
  env: QueueEnv,
  input: z.input<typeof mutationSchema>,
) {
  const command = mutationSchema.parse(input)
  operatorApproval(command.actor)
  await discardDraft(env.DB, command)
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
  clock: number | (() => number) = Date.now,
) {
  const time = typeof clock === 'number' ? () => clock : clock
  const now = time()
  const schedule = await scheduledSend(env.DB, id)
  const decision = decideSend(schedule, now)
  if (!schedule || decision === 'skip') return
  if (decision === 'wait') return Math.ceil((schedule.sendAt - now) / 1000)
  if (decision === 'hold') {
    if (schedule.queuedEvent !== null)
      await holdInterruptedSend(env.DB, id, schedule.queuedEvent, now)
    return
  }
  const reply = await claim(env.DB, id, now)
  if (!reply) return holdDelay(env.DB, id, now)
  const payload = composeReply(reply)
  if (reply.automatic) payload.headers['Auto-Submitted'] = 'auto-generated'
  const result = await sendReply(env.EMAIL, payload)
  await finish(env.DB, id, reply.attempt, reply.actor, time(), result)
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
  const ids = await waiting(env.DB, now)
  await Promise.all(ids.map((id) => notify(env, id)))
}

const standingSchema = z.object({
  number: numberSchema,
  body: z.string().trim().min(1).max(131072),
  key: z.string().min(1).max(1024),
  policy: z.string().min(1),
  enabledBy: z.email(),
  now: instantSchema,
  operatorRecipient: z.email().optional(),
})
export async function queueStanding(
  env: QueueEnv,
  raw: z.input<typeof standingSchema>,
) {
  const i = standingSchema.parse(raw)
  const id = 'standing/' + JSON.stringify([i.policy, i.number, i.key])
  const approval = approvalSchema.parse({
    kind: 'standing',
    policy: i.policy,
    enabledBy: i.enabledBy,
  })
  const actor = actorSchema.parse({ kind: 'extension', id: i.policy })
  if (
    await insertStanding(env.DB, {
      ...i,
      id,
      approval,
      actor,
      to: i.operatorRecipient ?? null,
    })
  )
    await notify(env, id)
  return { id }
}
