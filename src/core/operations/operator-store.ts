import { z } from 'zod'
import {
  eventStatement,
  type Audit,
} from '../conversations/conversations-store'
import { operatorSchema } from '../operators/operators-store'
import { retentionDays } from '../retention/retention-store'

export async function adminSettings(db: D1Database) {
  const [operators, mailboxes, days] = await Promise.all([
    db.prepare('SELECT * FROM operators ORDER BY email').all(),
    db
      .prepare(
        'SELECT m.address,m.product,p.name FROM mailboxes m JOIN products p ON p.id=m.product ORDER BY p.name',
      )
      .all(),
    retentionDays(db),
  ])
  return {
    operators: operatorSchema.array().parse(operators.results),
    mailboxes: z
      .object({ address: z.email(), product: z.string(), name: z.string() })
      .array()
      .parse(mailboxes.results),
    retentionDays: days,
  }
}
export async function inboxFailures(db: D1Database) {
  const rows = await db
    .prepare('SELECT mailbox,reason,at FROM inbound_failures ORDER BY at DESC')
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
) {
  await db.batch([
    db
      .prepare(
        'INSERT INTO products VALUES(?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name',
      )
      .bind(i.product, i.name),
    db.prepare('INSERT INTO mailboxes VALUES(?,?)').bind(i.address, i.product),
    eventStatement(db, a, null, 'mailbox_registered', i),
  ])
}
export async function setRole(
  db: D1Database,
  a: Audit,
  i: { email: string; role: string },
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
  ])
  if (!result.meta.changes)
    throw new Error('Unknown operator or last administrator')
}
export async function saveRetention(db: D1Database, a: Audit, days: number) {
  await db.batch([
    db
      .prepare(
        "INSERT INTO settings VALUES('retention_days',?) ON CONFLICT(name) DO UPDATE SET value=excluded.value",
      )
      .bind(String(days)),
    eventStatement(db, a, null, 'retention_changed', { days }),
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
) {
  const sql =
    i.action === 'add'
      ? 'INSERT OR IGNORE INTO labels(number,name) VALUES(?,?)'
      : 'DELETE FROM labels WHERE number=? AND name=?'
  await db.batch([
    db.prepare(sql).bind(i.number, i.label),
    eventStatement(db, a, i.number, 'label_changed', {
      name: i.label,
      action: i.action,
    }),
  ])
}
