import { z } from 'zod'
import {
  auditChange,
  stateSchema,
  type InboxState,
  type Selected,
} from './inbox-changes'
import type { Audit } from './conversations-store'

export type Change = {
  number: number
  revision: number
  previous: InboxState
  next: InboxState
}
const selection = z.object({
  number: z.number(),
  kind: z.string(),
  status: z.string(),
  assignee: z.string().nullable(),
  closed_at: z.number().nullable(),
  reviewed_by: z.string().nullable(),
  revision: z.number(),
  members: z
    .string()
    .transform((v) => z.array(z.number()).parse(JSON.parse(v))),
})
const revision = `(SELECT coalesce(max(e.id),0) FROM events e WHERE e.number=c.number AND
   (e.kind=?2 OR (?2='status_changed' AND e.kind IN ('message_received','reply_sent','reply_queued','feedback_converted','feedback_reviewed')))
   AND (?2!='label_changed' OR json_extract(e.payload,'$.name')=?3))`
export async function selectedRows(
  db: D1Database,
  groups: Record<number, number[]>,
  kind: string,
  label: string,
): Promise<Selected[]> {
  const rows = await db
    .prepare(`SELECT c.*, ${revision} AS revision,
   (SELECT json_group_array(number) FROM (SELECT l.number FROM labels l
     JOIN json_each(g.value) m ON m.value=l.number WHERE l.name=?3 ORDER BY l.number)) AS members
   FROM json_each(?1) g JOIN conversations c ON c.number=CAST(g.key AS INTEGER)`)
    .bind(JSON.stringify(groups), kind, label)
    .all()
  return selection.array().parse(rows.results)
}
function writes(
  db: D1Database,
  n: number,
  next: InboxState,
  previous: InboxState,
) {
  if (next.kind === 'assign')
    return [
      db
        .prepare('UPDATE conversations SET assignee=? WHERE number=?')
        .bind(next.email, n),
    ]
  if (next.kind === 'status')
    return [
      db
        .prepare(
          'UPDATE conversations SET status=?,closed_at=?,reviewed_by=? WHERE number=?',
        )
        .bind(next.value, next.closedAt, next.reviewedBy, n),
    ]
  const old = previous.kind === 'label' ? previous.members : []
  return [
    db
      .prepare(
        'DELETE FROM labels WHERE name=? AND number IN (SELECT value FROM json_each(?))',
      )
      .bind(next.label, JSON.stringify(old)),
    db
      .prepare(
        'INSERT INTO labels(number,name) SELECT value,? FROM json_each(?)',
      )
      .bind(next.label, JSON.stringify(next.members)),
  ]
}
function writeChange(
  db: D1Database,
  audit: Audit,
  token: string,
  item: Change,
) {
  const marker = auditChange(item.previous, item.next)
  return [
    ...writes(db, item.number, item.next, item.previous),
    db
      .prepare(
        'INSERT INTO events(number,kind,actor,payload,at,dedup_key) VALUES(?,?,?,?,?,?)',
      )
      .bind(
        item.number,
        marker.kind,
        audit.actor,
        JSON.stringify({
          ...marker.data,
          previous: item.previous,
          next: item.next,
        }),
        audit.now,
        'inbox/' + token + '/' + item.number,
      ),
  ]
}
export async function saveChanges(
  db: D1Database,
  audit: Audit,
  token: string,
  changes: Change[],
  kind: string,
  label: string,
  groups: Record<number, number[]>,
) {
  if (!changes.length) return
  // SQLite aborts the whole batch on a stale snapshot, including earlier writes.
  const guard = db
    .prepare(`SELECT json(CASE WHEN EXISTS(
    SELECT 1 FROM json_each(?1) x LEFT JOIN conversations c ON c.number=json_extract(x.value,'$.number')
    WHERE c.number IS NULL OR ${revision}!=json_extract(x.value,'$.revision')
       OR (?2='assigned' AND c.assignee IS NOT json_extract(x.value,'$.previous.email'))
       OR (?2='status_changed' AND (c.status IS NOT json_extract(x.value,'$.previous.value')
         OR c.closed_at IS NOT json_extract(x.value,'$.previous.closedAt')
         OR c.reviewed_by IS NOT json_extract(x.value,'$.previous.reviewedBy')))
       OR (?2='label_changed' AND json_extract(x.value,'$.previous.members') !=
          (SELECT json_group_array(number) FROM (SELECT l.number FROM labels l
           JOIN json_each(?4, '$."' || c.number || '"') m ON m.value=l.number WHERE l.name=?3 ORDER BY l.number)))
  ) THEN 'stale' ELSE 'null' END)`)
    .bind(JSON.stringify(changes), kind, label, JSON.stringify(groups))
  await db.batch([
    guard,
    ...changes.flatMap((change) => writeChange(db, audit, token, change)),
  ])
}
const savedChange = z.object({
  id: z.number(),
  number: z.number(),
  payload: z
    .string()
    .transform((value) =>
      z
        .object({ previous: stateSchema, next: stateSchema })
        .parse(JSON.parse(value)),
    ),
})
export async function originalChanges(
  db: D1Database,
  actor: string,
  token: string,
) {
  const prefix = 'inbox/' + token + '/'
  const rows = await db
    .prepare(
      'SELECT id,number,payload FROM events WHERE actor=? AND dedup_key>=? AND dedup_key<? ORDER BY number',
    )
    .bind(actor, prefix, 'inbox/' + token + '0')
    .all()
  return savedChange.array().parse(rows.results)
}
