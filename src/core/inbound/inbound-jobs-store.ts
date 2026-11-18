import { inboundJob, type InboundJob } from './job'

const retryDelay = 5 * 60 * 1000

export function reserveInbound(db: D1Database, job: InboundJob) {
  return db
    .prepare(
      'INSERT INTO inbound_jobs(raw_key,mailbox,sender,received_at,retry_at) VALUES(?,?,?,?,?)',
    )
    .bind(
      job.rawKey,
      job.to,
      job.from,
      job.receivedAt,
      job.receivedAt + retryDelay,
    )
    .run()
}

export async function dueInbound(db: D1Database, now: number) {
  const rows = await db
    .prepare(`UPDATE inbound_jobs SET retry_at=?
    WHERE raw_key IN (SELECT raw_key FROM inbound_jobs WHERE retry_at<=? ORDER BY retry_at LIMIT 50)
    RETURNING raw_key AS rawKey,mailbox AS "to",sender AS "from",received_at AS receivedAt`)
    .bind(now + retryDelay, now)
    .all()
  return rows.results.map((row) =>
    inboundJob.parse({ ...row, kind: 'inbound', tracked: true }),
  )
}

export function finishInbound(db: D1Database, job: InboundJob) {
  return db.prepare('DELETE FROM inbound_jobs WHERE raw_key=?').bind(job.rawKey)
}

export function archiveState(db: D1Database, job: InboundJob) {
  return db
    .prepare(`SELECT CASE
    WHEN EXISTS(SELECT 1 FROM inbound_jobs WHERE raw_key=?1) THEN 'pending'
    WHEN EXISTS(SELECT 1 FROM inbound_receipts WHERE raw_key=?1)
      OR EXISTS(SELECT 1 FROM inbound_failures WHERE raw_key=?1) THEN 'stored'
    ELSE 'removed' END AS state`)
    .bind(job.rawKey)
    .first<'pending' | 'stored' | 'removed'>('state')
}
