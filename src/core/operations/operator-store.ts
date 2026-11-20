import type { TicketPrefix } from '../conversations/ticket-reference'
import { z } from 'zod'
import {
  eventStatement,
  type Audit,
} from '../conversations/conversations-store'
import { listOperators } from '../operators/operators-store'
import { retentionDays } from '../retention/retention-store'

export async function adminSettings(db: D1Database) {
  const [operators, mailboxes, days] = await Promise.all([
    listOperators(db),
    db
      .prepare(
        'SELECT m.address,m.product,p.name FROM mailboxes m JOIN products p ON p.id=m.product ORDER BY p.name',
      )
      .all(),
    retentionDays(db),
  ])
  return {
    operators,
    mailboxes: z
      .object({ address: z.email(), product: z.string(), name: z.string() })
      .array()
      .parse(mailboxes.results),
    retentionDays: days,
  }
}
import {
  scopeBinding,
  type ProductScope,
} from '../operators/project-permission'

export async function inboxFailures(
  db: D1Database,
  scope: ProductScope = null,
) {
  const rows = await db
    .prepare(
      'SELECT f.mailbox,f.reason,f.at FROM inbound_failures f LEFT JOIN mailboxes m ON m.address=f.mailbox WHERE ?1 IS NULL OR m.product IN (SELECT value FROM json_each(?1)) ORDER BY f.at DESC',
    )
    .bind(scopeBinding(scope))
    .all()
  return z
    .object({ mailbox: z.string(), reason: z.string(), at: z.number() })
    .array()
    .parse(rows.results)
}
export async function setMailbox(
  db: D1Database,
  a: Audit,
  i: { product: string; name: string; address: string },
  policies: string[],
  by: string,
) {
  await db.batch([
    db
      .prepare(
        'INSERT INTO products VALUES(?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name',
      )
      .bind(i.product, i.name),
    db.prepare('INSERT INTO mailboxes VALUES(?,?)').bind(i.address, i.product),
    eventStatement(db, a, null, 'mailbox_registered', i),
    ...policies.flatMap((id) => [
      db
        .prepare(
          'INSERT OR IGNORE INTO extension_settings(id,enabled,enabled_by) VALUES(?,1,?)',
        )
        .bind(id, by),
      db
        .prepare(
          "INSERT INTO events(kind,actor,payload,at) SELECT 'extension_configured',?,?,? WHERE changes()=1",
        )
        .bind(a.actor, JSON.stringify({ id, enabled: true }), a.now),
    ]),
  ])
}
export async function setRole(
  db: D1Database,
  a: Audit,
  i: { email: string; role: string; displayName?: string },
) {
  const [result] = await db.batch([
    db
      .prepare(
        "UPDATE operators SET role=? WHERE email=? AND (role<>'admin' OR ?='admin' OR (SELECT count(*) FROM operators WHERE role='admin')>1)",
      )
      .bind(i.role, i.email, i.role),
    db
      .prepare(
        "INSERT INTO events(kind,actor,payload,at) SELECT 'role_changed',?,?,? WHERE changes()=1",
      )
      .bind(a.actor, JSON.stringify(i), a.now),
    ...(i.displayName === undefined
      ? []
      : [
          db
            .prepare(
              'INSERT INTO operator_profiles(email,display_name) SELECT ?,? WHERE changes()=1 ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name',
            )
            .bind(i.email, i.displayName),
        ]),
  ])
  if (!result.meta.changes)
    throw new Error('Unknown operator or last administrator')
}
export async function saveRetention(
  db: D1Database,
  a: Audit,
  days: number,
  product?: string,
) {
  await db.batch([
    product
      ? db
          .prepare(
            'INSERT INTO project_retention(product,days) VALUES(?,?) ON CONFLICT(product) DO UPDATE SET days=excluded.days',
          )
          .bind(product, days)
      : db
          .prepare(
            "INSERT INTO settings VALUES('retention_days',?) ON CONFLICT(name) DO UPDATE SET value=excluded.value",
          )
          .bind(String(days)),
    eventStatement(db, a, null, 'retention_changed', { days, product }),
  ])
}
export async function addNote(
  db: D1Database,
  a: Audit,
  i: { number: number; body: string },
  id: string,
) {
  await db.batch([
    db
      .prepare(
        "INSERT INTO messages(id,number,kind,body,actor,created_at) VALUES(?,?,'note',?,?,?)",
      )
      .bind(id, i.number, i.body, a.actor, a.now),
    eventStatement(db, a, i.number, 'note_added', {}),
  ])
}
export async function setAssignment(
  db: D1Database,
  a: Audit,
  i: { number: number; email: string | null },
) {
  await db.batch([
    db
      .prepare('UPDATE conversations SET assignee=? WHERE number=?')
      .bind(i.email, i.number),
    eventStatement(db, a, i.number, 'assigned', { to: i.email }),
  ])
}
export async function setLabel(
  db: D1Database,
  a: Audit,
  i: { number: number; label: string; action: 'add' | 'remove' },
  group: number[],
) {
  const mutation =
    i.action === 'add'
      ? db
          .prepare('INSERT OR IGNORE INTO labels(number,name) VALUES(?,?)')
          .bind(i.number, i.label)
      : db
          .prepare(
            'DELETE FROM labels WHERE number IN (SELECT value FROM json_each(?)) AND name=?',
          )
          .bind(JSON.stringify(group), i.label)
  await db.batch([
    mutation,
    eventStatement(db, a, i.number, 'label_changed', {
      name: i.label,
      action: i.action,
    }),
  ])
}

export async function listContacts(db: D1Database, product?: string) {
  const rows = await db
    .prepare(`
    SELECT email, max(name) AS name, sum(conversation) AS conversations FROM (
      SELECT contact AS email, contact_name AS name, 1 AS conversation FROM conversations WHERE ?1 IS NULL OR product=?1
      UNION ALL SELECT sender AS email, NULL AS name, 0 AS conversation FROM inbound_failures WHERE ?1 IS NULL OR mailbox IN (SELECT address FROM mailboxes WHERE product=?1)
      UNION ALL SELECT sender AS email, NULL AS name, 0 AS conversation FROM inbound_jobs WHERE ?1 IS NULL OR mailbox IN (SELECT address FROM mailboxes WHERE product=?1)
    ) WHERE length(email)>0 GROUP BY email ORDER BY coalesce(max(name),email),email`)
    .bind(product ?? null)
    .all()
  return z
    .array(
      z.object({
        email: z.string(),
        name: z.string().nullable(),
        conversations: z.number(),
      }),
    )
    .parse(rows.results)
}

export async function setTicketPrefix(
  db: D1Database,
  a: Audit,
  product: string,
  prefix: TicketPrefix,
) {
  const [updated, , project] = await db.batch([
    db
      .prepare(`UPDATE product_ticket_prefixes SET prefix=?1 WHERE product=?2 AND
      NOT EXISTS (SELECT 1 FROM product_ticket_prefixes WHERE prefix=?1 AND product!=?2)`)
      .bind(prefix, product),
    db
      .prepare(`INSERT INTO events(kind,actor,payload,at)
      SELECT 'ticket_prefix_changed',?,?,? WHERE changes()=1`)
      .bind(a.actor, JSON.stringify({ product, prefix }), a.now),
    db
      .prepare('SELECT product FROM product_ticket_prefixes WHERE product=?')
      .bind(product),
  ])
  return updated.meta.changes
    ? 'saved'
    : project.results.length
      ? 'duplicate'
      : 'missing'
}
