import { z } from 'zod'
import { ticketPrefixSchema } from '../conversations/ticket-reference'
import {
  eventStatement,
  type Audit,
} from '../conversations/conversations-store'

const project = z.object({
  id: z.string(),
  name: z.string(),
  prefix: ticketPrefixSchema,
  mailboxes: z.int(),
  conversations: z.int(),
  members: z.int(),
  archived: z.number().transform(Boolean),
  publicHelp: z.number().transform(Boolean),
  days: z.int(),
})
export async function projectDirectory(db: D1Database, ids: string[] | null) {
  const rows = await db
    .prepare(`SELECT p.id,p.name,t.prefix,
    (SELECT count(*) FROM mailboxes WHERE product=p.id) AS mailboxes,
    (SELECT count(*) FROM conversations WHERE product=p.id) AS conversations,
    (SELECT count(*) FROM product_members WHERE product=p.id) AS members,
    l.archived_at IS NOT NULL AS archived, coalesce(l.public_help,0) AS publicHelp,
    coalesce(r.days,cast((SELECT value FROM settings WHERE name='retention_days') AS INTEGER),0) AS days
    FROM products p JOIN product_ticket_prefixes t ON t.product=p.id LEFT JOIN product_lifecycle l ON l.product=p.id LEFT JOIN project_retention r ON r.product=p.id
    WHERE ?1 IS NULL OR p.id IN (SELECT value FROM json_each(?1)) ORDER BY p.name,p.id`)
    .bind(ids && JSON.stringify(ids))
    .all()
  return project.array().parse(rows.results)
}
export async function operatorMemberships(db: D1Database) {
  const rows = await db
    .prepare(
      `SELECT m.email,p.id,p.name,m.role FROM product_members m JOIN products p ON p.id=m.product ORDER BY p.name,p.id`,
    )
    .all()
  return z
    .array(
      z.object({
        email: z.email(),
        id: z.string(),
        name: z.string(),
        role: z.enum(['admin', 'agent']),
      }),
    )
    .parse(rows.results)
}
export async function projectMailboxes(db: D1Database, product: string) {
  const rows = await db
    .prepare(
      'SELECT m.address,m.product,p.name FROM mailboxes m JOIN products p ON p.id=m.product WHERE m.product=? ORDER BY m.address',
    )
    .bind(product)
    .all()
  return z
    .array(
      z.object({ address: z.email(), product: z.string(), name: z.string() }),
    )
    .parse(rows.results)
}
export async function usedPrefixes(db: D1Database) {
  const rows = await db
    .prepare('SELECT DISTINCT prefix FROM reserved_ticket_prefixes')
    .all()
  return new Set(
    z
      .array(z.object({ prefix: ticketPrefixSchema }))
      .parse(rows.results)
      .map((r) => String(r.prefix)),
  )
}

export async function saveProjectLifecycle(
  db: D1Database,
  a: Audit,
  product: string,
  change:
    | { kind: 'archive'; archived: boolean }
    | { kind: 'publish'; published: boolean },
) {
  const archive = change.kind === 'archive'
  const column = archive ? 'archived_at' : 'public_help'
  const value =
    change.kind === 'archive'
      ? change.archived
        ? a.now
        : null
      : Number(change.published)
  await db.batch([
    db
      .prepare(
        `INSERT INTO product_lifecycle(product,${column}) VALUES(?,?) ON CONFLICT(product) DO UPDATE SET ${column}=excluded.${column}`,
      )
      .bind(product, value),
    eventStatement(
      db,
      a,
      null,
      archive ? 'project_archive_changed' : 'project_publication_changed',
      { product, ...change },
    ),
  ])
}

export async function deleteReviewedProject(
  db: D1Database,
  a: Audit,
  review: { product: string; name: string; conversations: number },
  extensions: D1PreparedStatement[],
) {
  const numbers = 'SELECT number FROM conversations WHERE product=?'
  const messages = 'SELECT id FROM messages WHERE number IN (' + numbers + ')'
  const mailbox = 'mailbox IN (SELECT address FROM mailboxes WHERE product=?)'
  const statement = (sql: string) => db.prepare(sql).bind(review.product)
  await db.batch([
    eventStatement(db, a, null, 'project_deleted', review),
    ...extensions,
    statement(
      "INSERT OR IGNORE INTO pending_deletions SELECT 'product-icons/'||image_key FROM product_icons WHERE product=? AND image_key IS NOT NULL",
    ),
    statement(
      'INSERT OR IGNORE INTO pending_deletions SELECT key FROM attachments WHERE message IN (' +
        messages +
        ')',
    ),
    statement(
      'INSERT OR IGNORE INTO pending_deletions SELECT raw_key FROM messages WHERE raw_key IS NOT NULL AND number IN (' +
        numbers +
        ')',
    ),
    statement(
      'INSERT OR IGNORE INTO pending_deletions SELECT raw_key FROM inbound_jobs WHERE ' +
        mailbox,
    ),
    statement(
      "INSERT OR IGNORE INTO pending_deletions SELECT 'attachments/'||substr(raw_key,5)||'/' FROM inbound_jobs WHERE " +
        mailbox,
    ),
    statement(
      'INSERT OR IGNORE INTO pending_deletions SELECT raw_key FROM inbound_failures WHERE ' +
        mailbox,
    ),
    statement(
      "INSERT OR IGNORE INTO pending_deletions SELECT 'attachments/'||substr(raw_key,5)||'/' FROM inbound_failures WHERE " +
        mailbox,
    ),
    statement('DELETE FROM inbound_jobs WHERE ' + mailbox),
    statement('DELETE FROM inbound_failures WHERE ' + mailbox),
    statement('DELETE FROM intake_windows WHERE product=?'),
    statement('DELETE FROM suggestion_presentations WHERE product=?'),
    statement('DELETE FROM conversations WHERE product=?'),
    statement('DELETE FROM mailboxes WHERE product=?'),
    statement('DELETE FROM products WHERE id=?'),
  ])
}
