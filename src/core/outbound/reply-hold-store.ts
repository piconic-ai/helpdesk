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
  number: number,
) {
  const row = await db
    .prepare(`SELECT
    (SELECT reply_delay FROM operator_profiles WHERE email=?) AS preference,
    (SELECT minimum_reply_delay FROM product_senders s JOIN conversations c ON c.product=s.product WHERE c.number=?) AS minimum`)
    .bind(operator, number)
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
) {
  return db
    .prepare(`INSERT INTO reply_holds(message,until_at,target,queued_event)
    SELECT ?,?,?,id FROM events WHERE id=last_insert_rowid() AND kind='reply_queued'
    AND json_extract(payload,'$.message')=?`)
    .bind(id, until, target, id)
}

export async function undoHeldReply(
  db: D1Database,
  id: string,
  actor: Actor,
  now: number,
) {
  const match = `id=?1 AND actor=?2 AND delivery='queued' AND id IN (
    SELECT h.message FROM reply_holds h JOIN outbox o USING(message)
    WHERE o.phase='ready' AND h.until_at>?3)`
  const args = [id, JSON.stringify(actor), now]
  const [, removed] = await db.batch([
    db
      .prepare(`INSERT INTO events(number,kind,actor,at,payload)
      SELECT number,'reply_undone',actor,?3,json_object('message',id) FROM messages WHERE ${match}`)
      .bind(...args),
    db
      .prepare(`DELETE FROM messages WHERE ${match} RETURNING number,body`)
      .bind(...args),
  ])
  if (!removed.results.length) throw new Error('Reply can no longer be undone')
  return z
    .object({ number: z.int().positive(), body: z.string() })
    .parse(removed.results[0])
}

export async function replyHolds(
  db: D1Database,
  number: number,
  operator: string,
  now: number,
) {
  const rows = await db
    .prepare(`SELECT h.message AS id,h.until_at-? AS remaining,h.target
    FROM reply_holds h JOIN messages m ON m.id=h.message
    WHERE m.number=? AND json_extract(m.actor,'$.id')=? AND h.until_at>?
    ORDER BY m.rowid DESC`)
    .bind(now, number, operator, now)
    .all()
  return z
    .object({
      id: z.string(),
      remaining: z.number(),
      target: z.enum(['pending', 'closed']),
    })
    .array()
    .parse(rows.results)
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
      SELECT c.number,'status_changed',m.actor,?2,json_object('from',c.status,'to',h.target)
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
