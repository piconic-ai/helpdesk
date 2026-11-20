import type { ScheduledSend } from './schedule'
import { operatorApproval } from './approval'
import {
  defaultReplyDelay,
  replyDelay,
  sendDelay,
} from '../settings/reply-delay'
import { z } from 'zod'
import type { Actor } from '../conversations/state'

export async function replyDelayFor(
  db: D1Database,
  operator: string,
  source: number | string,
) {
  const conversation =
    typeof source === 'number'
      ? '?'
      : '(SELECT number FROM messages WHERE id=?)'
  const row = await db
    .prepare(`SELECT
    (SELECT reply_delay FROM operator_profiles WHERE email=?) AS preference,
    (SELECT minimum_reply_delay FROM product_senders s JOIN conversations c ON c.product=s.product WHERE c.number=${conversation}) AS minimum`)
    .bind(operator, source)
    .first()
  const settings = z
    .object({
      preference: replyDelay.nullable(),
      minimum: replyDelay.nullable(),
    })
    .parse(row)
  return sendDelay(settings.preference ?? defaultReplyDelay, settings.minimum)
}

export function holdReply(
  db: D1Database,
  id: string,
  until: number,
  target: string,
  restoreDraft: boolean,
) {
  return db
    .prepare(`INSERT INTO reply_holds(message,until_at,target,queued_event,restore_draft)
    SELECT ?,?,?,id,? FROM events WHERE id=last_insert_rowid() AND kind='reply_queued'
    AND json_extract(payload,'$.message')=?`)
    .bind(id, until, target, Number(restoreDraft), id)
}

export async function undoHeldReply(
  db: D1Database,
  id: string,
  actor: Actor,
  now: number,
) {
  const match = `id=?1 AND json_extract(approval,'$.by')=?2 AND json_extract(approval,'$.kind')='operator' AND delivery='queued' AND id IN (
    SELECT h.message FROM reply_holds h JOIN outbox o USING(message)
    WHERE o.phase='ready' AND h.until_at>?3)`
  const approval = operatorApproval(actor)
  const args = [id, approval.by, now]
  const [, restored, removed] = await db.batch([
    db
      .prepare(`INSERT INTO events(number,kind,actor,at,payload)
      SELECT number,'reply_undone',?4,?3,json_object('message',id) FROM messages WHERE ${match}`)
      .bind(...args, JSON.stringify(actor)),
    db
      .prepare(`UPDATE messages SET approval=NULL,delivery='awaiting_approval' WHERE ${match}
      AND id IN (SELECT message FROM reply_holds WHERE restore_draft=1) RETURNING number,body`)
      .bind(...args),
    db
      .prepare(`DELETE FROM messages WHERE ${match} RETURNING number,body`)
      .bind(...args),
    db
      .prepare(`DELETE FROM outbox WHERE message=? AND phase='ready' AND EXISTS
      (SELECT 1 FROM messages WHERE id=outbox.message AND delivery='awaiting_approval' AND approval IS NULL)`)
      .bind(id),
  ])
  const row = restored.results[0] ?? removed.results[0]
  if (!row) throw new Error('Reply can no longer be undone')
  const result = z
    .object({ number: z.int().positive(), body: z.string() })
    .parse(row)
  return restored.results.length ? { ...result, restoredDraft: id } : result
}

export async function releaseReplyNow(
  db: D1Database,
  id: string,
  by: string,
  now: number,
) {
  const row = await db
    .prepare(`UPDATE reply_holds SET until_at=0 WHERE message=? AND until_at>? AND EXISTS (
    SELECT 1 FROM messages m JOIN outbox o ON o.message=m.id WHERE m.id=reply_holds.message AND o.phase='ready'
      AND m.delivery='queued' AND json_extract(m.approval,'$.by')=?) RETURNING message`)
    .bind(id, now, by)
    .first()
  if (!row) throw new Error('This scheduled reply cannot be sent now')
}

export async function replyHolds(
  db: D1Database,
  number: number,
  operator: string,
  now: number,
) {
  const rows = await db
    .prepare(`SELECT h.message AS id,h.until_at-?1 AS remaining,h.target,json_extract(m.approval,'$.by')=?3 AS canManage
    FROM reply_holds h JOIN messages m ON m.id=h.message
    WHERE m.number=?2 AND m.delivery='queued' AND h.until_at>?1
    ORDER BY m.rowid DESC`)
    .bind(now, number, operator)
    .all()
  return z
    .object({
      id: z.string(),
      remaining: z.number(),
      canManage: z.number().transform(Boolean),
      target: z.enum(['pending', 'closed']),
    })
    .array()
    .parse(rows.results)
}

export async function scheduledSend(db: D1Database, id: string) {
  return db
    .prepare(`SELECT coalesce(h.until_at,0) AS sendAt,h.queued_event AS queuedEvent,
    CASE WHEN h.message IS NOT NULL THEN
      (SELECT max(e.id) FROM events e WHERE e.number=m.number AND e.kind='message_received' AND json_extract(e.payload,'$.category')='human' AND e.id>h.queued_event)
    END AS lastInbound
    FROM outbox o JOIN messages m ON m.id=o.message LEFT JOIN reply_holds h ON h.message=o.message
    WHERE o.message=? AND o.phase='ready' AND m.delivery='queued' AND m.approval IS NOT NULL`)
    .bind(id)
    .first<ScheduledSend>()
}

// Recover schedules created before the incoming-message trigger was installed.
export async function holdInterruptedSend(
  db: D1Database,
  id: string,
  queuedEvent: number,
  now: number,
) {
  await db.batch([
    db
      .prepare(`INSERT INTO events(number,kind,actor,payload,at)
      SELECT m.number,'reply_held',json_object('kind','system'),json_object('message',m.id,'by',json_extract(m.approval,'$.by'),'reason','customer_replied'),?
      FROM messages m JOIN reply_holds h ON h.message=m.id JOIN outbox o ON o.message=m.id
      WHERE m.id=? AND h.queued_event=? AND o.phase='ready' AND m.delivery='queued'`)
      .bind(now, id, queuedEvent),
    db
      .prepare(
        "UPDATE messages SET approval=NULL, delivery='draft' WHERE id=? AND changes()=1",
      )
      .bind(id),
    db
      .prepare(
        "DELETE FROM outbox WHERE message=? AND phase='ready' AND changes()=1",
      )
      .bind(id),
  ])
}

export async function holdDelay(db: D1Database, id: string, now: number) {
  const until = await db
    .prepare('SELECT until_at FROM reply_holds WHERE message=? AND until_at>?')
    .bind(id, now)
    .first<number>('until_at')
  return until === null ? undefined : Math.ceil((until - now) / 1000)
}

export function releaseHeldStatus(db: D1Database, id: string, now: number) {
  return [
    db
      .prepare(`INSERT INTO events(number,kind,actor,at,payload)
      SELECT c.number,'status_changed',json_object('kind','operator','id',json_extract(m.approval,'$.by')),?2,json_object('from',c.status,'to',h.target)
      FROM reply_holds h JOIN messages m ON m.id=h.message JOIN conversations c ON c.number=m.number
      WHERE h.message=?1 AND changes()=1 AND c.status IN ('open','pending') AND c.status!=h.target
      AND NOT EXISTS(SELECT 1 FROM events e WHERE e.number=c.number AND e.id>h.queued_event AND
        (e.kind IN ('status_changed','message_received') OR (e.kind='reply_queued' AND EXISTS
          (SELECT 1 FROM messages later WHERE later.id=json_extract(e.payload,'$.message') AND later.id NOT IN (SELECT message FROM standing_messages)))))`)
      .bind(id, now),
    db
      .prepare(`UPDATE conversations SET status=(SELECT target FROM reply_holds WHERE message=?1),
      closed_at=CASE WHEN (SELECT target FROM reply_holds WHERE message=?1)='closed' THEN ?2 END
      WHERE changes()=1 AND number=(SELECT number FROM messages WHERE id=?1)`)
      .bind(id, now),
  ]
}
