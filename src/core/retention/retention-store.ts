import { z } from 'zod'
export async function deleteContent(
  db: D1Database,
  target: { contact: string } | { before: number },
) {
  const remove = 'contact' in target
  const clause = remove ? 'contact=?' : "status='closed' AND closed_at<?"
  const value = 'contact' in target ? target.contact : target.before
  const numbers = `SELECT number FROM conversations WHERE ${clause}`
  const ids = `SELECT id FROM messages WHERE number IN (${numbers})`
  const run = (sql: string) => db.prepare(sql).bind(value)
  const statements = [
    run(
      `INSERT OR IGNORE INTO pending_deletions SELECT key FROM attachments WHERE message IN (${ids})`,
    ),
    run(
      `INSERT OR IGNORE INTO pending_deletions SELECT raw_key FROM messages WHERE raw_key IS NOT NULL AND number IN (${numbers})`,
    ),
    run(`DELETE FROM attachments WHERE message IN (${ids})`),
  ]
  if (remove)
    statements.push(
      run(
        'INSERT OR IGNORE INTO pending_deletions SELECT raw_key FROM inbound_failures WHERE sender=?',
      ),
      run('DELETE FROM inbound_failures WHERE sender=?'),
      run(`DELETE FROM conversations WHERE ${clause}`),
    )
  else
    statements.push(
      run(
        `UPDATE messages SET body='', html=NULL,raw_key=NULL WHERE number IN (${numbers})`,
      ),
    )
  await db.batch(statements)
}
export async function drainDeleted(db: D1Database, bucket: R2Bucket) {
  for (;;) {
    const rows = await db
      .prepare('SELECT key FROM pending_deletions LIMIT 100')
      .all()
    const keys = z
      .array(z.object({ key: z.string() }))
      .parse(rows.results)
      .map((row) => row.key)
    if (!keys.length) return
    await bucket.delete(keys)
    await db.batch(
      keys.map((key) =>
        db.prepare('DELETE FROM pending_deletions WHERE key=?').bind(key),
      ),
    )
  }
}
export async function retentionDays(db: D1Database) {
  const row = await db
    .prepare("SELECT value FROM settings WHERE name='retention_days'")
    .first('value')
  return row === null ? 0 : z.coerce.number().int().nonnegative().parse(row)
}
