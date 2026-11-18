import { z } from 'zod'
import type { Intake } from './intake'
import type { Actor } from '../conversations/state'
import { insertDraft } from '../outbound/reply-store'

type Action = { id: string; actor: Actor; now: number }
export async function open(db: D1Database, i: Intake, a: Action) {
  const actor = JSON.stringify(a.actor)
  const [conversation] = await db.batch([
    db
      .prepare(`INSERT INTO conversations(product,mailbox,contact,contact_name,subject,kind,origin,status,created_at)
      VALUES(?,(SELECT address FROM mailboxes WHERE product=? ORDER BY address LIMIT 1),?,?,?,?,?,?,?) RETURNING number`)
      .bind(
        i.product,
        i.product,
        i.email,
        i.name ?? null,
        i.subject,
        i.kind,
        i.origin,
        i.kind === 'feedback' ? 'received' : 'open',
        a.now,
      ),
    db
      .prepare(
        "INSERT INTO messages(id,number,kind,body,actor,created_at) VALUES(?,last_insert_rowid(),'inbound',?,?,?)",
      )
      .bind(a.id, i.body, actor, a.now),
    db
      .prepare(
        "INSERT INTO events(number,kind,actor,payload,at) SELECT number,'conversation_opened',?,json_object('origin',?),? FROM messages WHERE id=?",
      )
      .bind(actor, i.origin, a.now, a.id),
    receiveEvent(db, a),
  ])
  return z.object({ number: z.int().positive() }).parse(conversation.results[0])
}
function receiveEvent(db: D1Database, a: Action) {
  return db
    .prepare(
      "INSERT INTO events(number,kind,actor,payload,at) SELECT number,'message_received',?,json_object('message',id,'category','human'),? FROM messages WHERE id=?",
    )
    .bind(JSON.stringify(a.actor), a.now, a.id)
}
export async function append(
  db: D1Database,
  number: number,
  body: string,
  a: Action,
) {
  const actor = JSON.stringify(a.actor)
  await db.batch([
    db
      .prepare(
        "INSERT INTO messages(id,number,kind,body,actor,created_at) VALUES(?,?,'inbound',?,?,?)",
      )
      .bind(a.id, number, body, actor, a.now),
    receiveEvent(db, a),
    db
      .prepare(
        "INSERT INTO events(number,kind,actor,payload,at) SELECT number,'status_changed',?,json_object('from',status,'to','open'),? FROM conversations WHERE number=? AND status IN ('closed','pending')",
      )
      .bind(actor, a.now, number),
    db
      .prepare(
        "UPDATE conversations SET status='open',closed_at=NULL WHERE number=? AND status IN ('closed','pending')",
      )
      .bind(number),
  ])
  return { id: a.id }
}
export async function draft(
  db: D1Database,
  number: number,
  body: string,
  a: Action,
) {
  await insertDraft(db, { number, body, ...a })
  return { id: a.id }
}
export async function contactInfo(db: D1Database, number: number) {
  const row = await db
    .prepare(
      `SELECT coalesce(c.contact_name,c.contact) AS name,p.name AS productName,c.product,c.contact AS email,c.mailbox,c.subject,c.status FROM conversations c JOIN products p ON c.product=p.id WHERE c.number=?`,
    )
    .bind(number)
    .first()
  return z
    .object({
      name: z.string(),
      productName: z.string(),
      product: z.string(),
      email: z.email(),
      mailbox: z.email(),
      subject: z.string(),
      status: z.string(),
    })
    .parse(row)
}
export async function consumeWindow(
  db: D1Database,
  product: string,
  client: string,
  minute: number,
  limit: number,
) {
  const [, used] = await db.batch([
    db.prepare('DELETE FROM intake_windows WHERE minute < ?').bind(minute - 1),
    db
      .prepare(`INSERT INTO intake_windows VALUES(?,?,?,1) ON CONFLICT(product,client) DO UPDATE SET
      minute=excluded.minute,count=CASE WHEN minute=excluded.minute THEN count+1 ELSE 1 END
      WHERE minute<excluded.minute OR (minute=excluded.minute AND count<?)`)
      .bind(product, client, minute, limit),
  ])
  return used.meta.changes === 1
}
