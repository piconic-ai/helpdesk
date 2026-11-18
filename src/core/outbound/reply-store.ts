import { z } from 'zod'
import {
  actorSchema,
  approvalSchema,
  type Actor,
  type Approval,
} from '../conversations/state'
import { replyEnvelopeSchema } from './compose'
import { outboxRowSchema } from './outbound-schema'
import type { SendResult } from './send-client'

const threadSql = `SELECT message_id,in_reply_to,refs FROM messages
  WHERE number=? AND kind='inbound' AND message_id IS NOT NULL ORDER BY created_at DESC,rowid DESC LIMIT 1`
const threadSchema = z.object({
  message_id: z.string(),
  refs: z.string().nullable(),
})
type Submission = {
  id: string
  number: number
  body: string
  actor: Actor
  now: number
  approval: Approval | null
}
type Enqueue = { id: string; actor: Actor; now: number; approval: Approval }
function event(
  db: D1Database,
  kind: string,
  input: { id: string; actor: Actor; now: number },
  predicate: string,
  ...params: (number | string)[]
) {
  return db
    .prepare(`INSERT INTO events(number,kind,actor,at,payload)
    SELECT number,?,?,?,json_object('message',id,'approval',json(approval)) FROM messages WHERE id=? AND ${predicate}`)
    .bind(kind, JSON.stringify(input.actor), input.now, input.id, ...params)
}

const hasAttempt = 'EXISTS (SELECT 1 FROM outbox WHERE attempt=?)'
function queueWrites(db: D1Database, input: Enqueue, attempt: string) {
  return [
    db
      .prepare(`INSERT INTO outbox(message,attempt,phase,queued_at)
      SELECT id,?,'ready',? FROM messages WHERE id=? AND changes()=1`)
      .bind(attempt, input.now, input.id),
    event(db, 'reply_queued', input, hasAttempt, attempt),
    ...statusWrites(db, input, attempt),
  ]
}
function statusWrites(db: D1Database, input: Enqueue, attempt: string) {
  return [
    db
      .prepare(`INSERT INTO events(number,kind,actor,at,payload)
      SELECT number,'status_changed',?,?,json_object('from','open','to','pending') FROM conversations
      WHERE status='open' AND number=(SELECT number FROM messages WHERE id=?) AND ${hasAttempt} AND ? NOT IN(SELECT message FROM standing_messages)`)
      .bind(
        JSON.stringify(input.actor),
        input.now,
        input.id,
        attempt,
        input.id,
      ),
    db
      .prepare(`UPDATE conversations SET status='pending' WHERE status='open' AND
      number=(SELECT number FROM messages WHERE id=?) AND ${hasAttempt} AND ? NOT IN(SELECT message FROM standing_messages)`)
      .bind(input.id, attempt, input.id),
  ]
}

export async function insertReply(db: D1Database, input: Submission) {
  const parent = threadSchema
    .nullable()
    .parse(await db.prepare(threadSql).bind(input.number).first())
  const insert = db
    .prepare(`INSERT INTO messages(id,number,kind,body,actor,created_at,delivery,approval,in_reply_to,refs)
    SELECT ?,number,'outbound',?,?,?,?,?,?,? FROM conversations WHERE number=? AND kind='inquiry' AND status IN ('open','pending')`)
    .bind(
      input.id,
      input.body,
      JSON.stringify(input.actor),
      input.now,
      input.approval ? 'queued' : 'awaiting_approval',
      input.approval ? JSON.stringify(input.approval) : null,
      parent?.message_id ?? null,
      parent?.refs ?? null,
      input.number,
    )
  const more = input.approval
    ? queueWrites(
        db,
        { ...input, approval: input.approval },
        crypto.randomUUID(),
      )
    : [event(db, 'reply_awaiting_approval', input, 'changes()=1')]
  const [result] = await db.batch([insert, ...more])
  if (result.meta.changes !== 1)
    throw new Error('Reply requires an open or pending inquiry')
}

export async function insertDraft(
  db: D1Database,
  input: Omit<Submission, 'approval'>,
) {
  const parent = threadSchema
    .nullable()
    .parse(await db.prepare(threadSql).bind(input.number).first())
  const [, , persisted] = await db.batch([
    db
      .prepare(`INSERT INTO messages(id,number,kind,body,actor,created_at,delivery,in_reply_to,refs)
      SELECT ?,number,'outbound',?,?,?,'draft',?,? FROM conversations WHERE number=? AND kind='inquiry' AND status!='spam'
      ON CONFLICT(id) DO NOTHING`)
      .bind(
        input.id,
        input.body,
        JSON.stringify(input.actor),
        input.now,
        parent?.message_id ?? null,
        parent?.refs ?? null,
        input.number,
      ),
    event(db, 'reply_drafted', input, 'changes()=1'),
    db
      .prepare(
        "SELECT id FROM messages WHERE id=? AND number=? AND kind='outbound'",
      )
      .bind(input.id, input.number),
  ])
  if (!persisted.results.length)
    throw new Error('Cannot draft a reply to this conversation')
}

export async function requeueReply(
  db: D1Database,
  input: Enqueue,
  from: 'failed' | 'awaiting_approval',
) {
  const update = db
    .prepare(`UPDATE messages SET delivery='queued',approval=?,reason=NULL,provider_id=NULL,sent_at=NULL WHERE id=? AND kind='outbound'
    AND (delivery=? OR (delivery='draft' AND ?='awaiting_approval')) AND number IN (SELECT number FROM conversations WHERE kind='inquiry' AND status IN ('open','pending'))
    AND NOT EXISTS (SELECT 1 FROM outbox WHERE message=messages.id)`)
    .bind(JSON.stringify(input.approval), input.id, from, from)
  const [result] = await db.batch([
    update,
    ...queueWrites(db, input, crypto.randomUUID()),
  ])
  if (result.meta.changes !== 1)
    throw new Error(`Reply cannot be queued from ${from}`)
}

const claimSchema = replyEnvelopeSchema.extend({
  actor: z.string().transform((value) => actorSchema.parse(JSON.parse(value))),
  approval: z
    .string()
    .transform((value) => approvalSchema.parse(JSON.parse(value))),
  attempt: z.string().min(1),
  automatic: z.number().transform(Boolean),
})
export async function claim(db: D1Database, id: string, now: number) {
  const [changed, rows] = await db.batch([
    db
      .prepare(`UPDATE outbox SET phase='sending',claimed_at=? WHERE message=? AND phase='ready' AND EXISTS
      (SELECT id FROM messages WHERE id=? AND kind='outbound' AND delivery='queued' AND approval IS NOT NULL)`)
      .bind(now, id, id),
    db
      .prepare(`SELECT c.mailbox,coalesce(s.operator_recipient,c.contact) AS contact,c.number,c.subject,m.body,m.in_reply_to,m.refs,m.actor,m.approval,o.attempt,(s.message IS NOT NULL) AS automatic
      FROM messages m JOIN conversations c ON c.number=m.number JOIN outbox o ON o.message=m.id LEFT JOIN standing_messages s ON s.message=m.id WHERE m.id=?`)
      .bind(id),
  ])
  if (changed.meta.changes === 0) return null
  return claimSchema.parse(rows.results[0])
}

export async function finish(
  db: D1Database,
  id: string,
  attempt: string,
  actor: Actor,
  now: number,
  result: SendResult,
) {
  const input = { id, actor, now }
  const accepted = result.kind === 'accepted'
  const provider = accepted ? result.providerId : null
  const messageId =
    provider && /^[^<>\s]+@[^<>\s]+$/.test(provider)
      ? `<${provider}>`
      : provider
  const [updated] = await db.batch([
    db
      .prepare(`UPDATE messages SET delivery=?,reason=?,provider_id=?,message_id=?,sent_at=? WHERE id=? AND delivery='queued'
      AND EXISTS (SELECT 1 FROM outbox WHERE message=? AND phase='sending' AND attempt=?)`)
      .bind(
        accepted ? 'sent' : 'failed',
        accepted ? null : result.reason,
        provider,
        messageId,
        accepted ? now : null,
        id,
        id,
        attempt,
      ),
    event(db, accepted ? 'reply_sent' : 'reply_failed', input, 'changes()=1'),
    db
      .prepare(`DELETE FROM outbox WHERE attempt=? AND ? != 'unknown'`)
      .bind(attempt, result.kind),
  ])
  return updated.meta.changes === 1
}

export async function waiting(db: D1Database) {
  const rows = await db
    .prepare(`SELECT message,phase,attempt,queued_at AS queuedAt, claimed_at AS claimedAt FROM outbox
    WHERE phase='ready' ORDER BY queued_at, message LIMIT 100`)
    .all()
  return z
    .array(outboxRowSchema)
    .parse(rows.results)
    .map((row) => row.message)
}

export async function interrupted(db: D1Database, cutoff: number) {
  const rows = await db
    .prepare(`SELECT message,attempt FROM outbox JOIN messages ON messages.id=outbox.message
    WHERE phase='sending' AND claimed_at<=? AND delivery='queued' ORDER BY claimed_at LIMIT 100`)
    .bind(cutoff)
    .all()
  return outboxRowSchema
    .pick({ message: true, attempt: true })
    .array()
    .parse(rows.results)
}

export async function insertStanding(
  db: D1Database,
  input: Submission & { approval: Approval; to: string | null },
) {
  const attempt = crypto.randomUUID()
  const target = input.to
  const parent =
    target === null
      ? threadSchema
          .nullable()
          .parse(await db.prepare(threadSql).bind(input.number).first())
      : null
  const [result, , , existing] = await db.batch([
    db
      .prepare(`INSERT INTO messages(id,number,kind,body,actor,created_at,delivery,approval,in_reply_to,refs)
      SELECT ?,number,'outbound',?,?,?,'queued',?,?,? FROM conversations
      WHERE number=? AND (? IS NOT NULL OR (kind='inquiry' AND status!='spam'))
      AND (? IS NULL OR EXISTS(SELECT 1 FROM operators WHERE email=?))
      AND EXISTS(SELECT 1 FROM operators WHERE email=?) ON CONFLICT(id) DO NOTHING`)
      .bind(
        input.id,
        input.body,
        JSON.stringify(input.actor),
        input.now,
        JSON.stringify(input.approval),
        parent?.message_id ?? null,
        parent?.refs ?? null,
        input.number,
        target,
        target,
        target,
        input.approval.kind === 'standing' ? input.approval.enabledBy : null,
      ),
    db
      .prepare('INSERT INTO standing_messages SELECT ?,? WHERE changes()=1')
      .bind(input.id, target),
    db
      .prepare(
        "INSERT INTO outbox(message,attempt,phase,queued_at) SELECT ?,?,'ready',? WHERE changes()=1",
      )
      .bind(input.id, attempt, input.now),
    db
      .prepare('SELECT message FROM standing_messages WHERE message=?')
      .bind(input.id),
    event(db, 'reply_queued', input, hasAttempt, attempt),
  ])
  if (!existing.results.length)
    throw new Error('Invalid recipient, conversation or standing approval')
  return result.meta.changes === 1
}
