import { z } from 'zod'
export async function deleteContent(
  db: D1Database,
  target: ({ contact: string } | { before: number }) & { product?: string },
) {
  const remove = 'contact' in target
  const scope = ' AND (?2 IS NULL OR product=?2)'
  const mailboxScope =
    ' AND (?2 IS NULL OR mailbox IN (SELECT address FROM mailboxes WHERE product=?2))'
  const clause =
    (remove ? 'contact=?1' : "status='closed' AND closed_at<?1") + scope
  const value = 'contact' in target ? target.contact : target.before
  const numbers = `SELECT number FROM conversations WHERE ${clause}`
  const ids = `SELECT id FROM messages WHERE number IN (${numbers})`
  const run = (sql: string) =>
    db.prepare(sql).bind(value, target.product ?? null)
  const statements = [
    run(
      remove
        ? 'DELETE FROM suggestion_presentations WHERE contact=?1 COLLATE NOCASE' +
            scope
        : 'DELETE FROM suggestion_presentations WHERE at<?1' + scope,
    ),
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
        'INSERT OR IGNORE INTO pending_deletions SELECT raw_key FROM inbound_jobs WHERE sender=?1' +
          mailboxScope,
      ),
      run(
        "INSERT OR IGNORE INTO pending_deletions SELECT 'attachments/' || substr(raw_key,5) || '/' FROM inbound_jobs WHERE sender=?1" +
          mailboxScope,
      ),
      run('DELETE FROM inbound_jobs WHERE sender=?1' + mailboxScope),
      run(
        'INSERT OR IGNORE INTO pending_deletions SELECT raw_key FROM inbound_failures WHERE sender=?1 COLLATE NOCASE' +
          mailboxScope,
      ),
      run(
        'DELETE FROM inbound_failures WHERE sender=?1 COLLATE NOCASE' +
          mailboxScope,
      ),
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

async function deleteAttachmentPrefix(bucket: R2Bucket, prefix: string) {
  for (;;) {
    const page = await bucket.list({ prefix })
    if (page.objects.length)
      await bucket.delete(page.objects.map((object) => object.key))
    if (!page.truncated) return
  }
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
    for (const key of keys)
      if (key.endsWith('/')) await deleteAttachmentPrefix(bucket, key)
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

export async function retentionPolicies(db: D1Database) {
  const rows = await db
    .prepare(`SELECT p.id AS product,
    coalesce(r.days,cast((SELECT value FROM settings WHERE name='retention_days') AS INTEGER),0) AS days
    FROM products p LEFT JOIN project_retention r ON r.product=p.id`)
    .all()
  return z
    .array(z.object({ product: z.string(), days: z.int().nonnegative() }))
    .parse(rows.results)
}
