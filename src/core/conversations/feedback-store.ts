import type { Actor } from './state'
export async function applyFeedback(
  db: D1Database,
  number: number,
  from: string,
  kind: string,
  status: string,
  by: string | null,
  actor: Actor,
  now: number,
) {
  const [result] = await db.batch([
    db
      .prepare(
        "UPDATE conversations SET kind=?,status=?,reviewed_by=? WHERE number=? AND kind='feedback' AND status=?",
      )
      .bind(kind, status, by, number, from),
    db
      .prepare(
        "INSERT INTO events(number,kind,actor,payload,at) SELECT ?,'status_changed',?,?,? WHERE changes()=1",
      )
      .bind(
        number,
        JSON.stringify(actor),
        JSON.stringify({ from, to: status, kind }),
        now,
      ),
  ])
  if (!result.meta.changes)
    throw new Error('Feedback changed. Reload and retry.')
  return { number }
}
