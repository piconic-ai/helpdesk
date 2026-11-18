import { drizzle } from 'drizzle-orm/d1'
import { inArray, asc } from 'drizzle-orm'
import { z } from 'zod'
import {
  conversationRow,
  messageRow,
  attachmentRow,
  auditRow,
  messages,
} from './conversations-schema'

export const filterSchema = z.object({
  status: z
    .enum(['open', 'pending', 'closed', 'spam', 'received', 'reviewed', 'all'])
    .default('open'),
  product: z.string().default(''),
  assignee: z.string().default(''),
  label: z.string().default(''),
  query: z.string().default(''),
})

export async function listConversations(
  db: D1Database,
  input: z.infer<typeof filterSchema>,
  canonicalNumbers: Record<number, number> = {},
) {
  const { status, product, assignee, label, query } = input
  const result = await db
    .prepare(`WITH members(source,target) AS (
      SELECT CAST(key AS INTEGER),value FROM json_each(?)
      UNION ALL SELECT number,number FROM conversations
    ) SELECT c.* FROM conversations c WHERE (?='all' OR status=?) AND (?='' OR product=?)
    AND (?='' OR assignee=?) AND (?='' OR EXISTS(SELECT 1 FROM labels l JOIN members x ON l.number=x.source WHERE x.target=c.number AND l.name=?))
    AND (?='' OR EXISTS(SELECT 1 FROM conversations h JOIN members x ON x.source=h.number WHERE x.target=c.number AND instr(lower(h.subject),lower(?))) OR instr(lower(contact),lower(?)) OR EXISTS
    (SELECT 1 FROM messages m JOIN members x ON m.number=x.source WHERE x.target=c.number AND instr(lower(m.body),lower(?)))) ORDER BY number DESC`)
    .bind(
      JSON.stringify(canonicalNumbers),
      status,
      status,
      product,
      product,
      assignee,
      assignee,
      label,
      label,
      query,
      query,
      query,
      query,
    )
    .all()
  return conversationRow.array().parse(result.results)
}
export async function getConversation(db: D1Database, number: number) {
  const row = await db
    .prepare('SELECT * FROM conversations WHERE number=?')
    .bind(number)
    .first()
  if (!row) throw new Error('Conversation not found')
  return conversationRow.parse(row)
}
export async function detail(
  db: D1Database,
  number: number,
  group: number[] = [number],
) {
  const conversation = await getConversation(db, number)
  const [rows, files, history, events, labels, uncertain] = await Promise.all([
    drizzle(db)
      .select()
      .from(messages)
      .where(inArray(messages.number, group))
      .orderBy(asc(messages.created_at)),
    db
      .prepare(
        'SELECT a.* FROM attachments a JOIN messages m ON m.id=a.message WHERE m.number IN (SELECT value FROM json_each(?))',
      )
      .bind(JSON.stringify(group))
      .all(),
    db
      .prepare(
        'SELECT * FROM conversations WHERE contact=? AND number NOT IN (SELECT value FROM json_each(?)) ORDER BY number DESC',
      )
      .bind(conversation.contact, JSON.stringify(group))
      .all(),
    db
      .prepare(
        'SELECT * FROM events WHERE number IN (SELECT value FROM json_each(?)) ORDER BY id DESC',
      )
      .bind(JSON.stringify(group))
      .all(),
    db
      .prepare(
        'SELECT DISTINCT name FROM labels WHERE number IN (SELECT value FROM json_each(?)) ORDER BY name',
      )
      .bind(JSON.stringify(group))
      .all(),
    db
      .prepare(
        "SELECT o.message FROM outbox o JOIN messages m ON o.message=m.id WHERE m.number IN (SELECT value FROM json_each(?)) AND m.delivery='failed'",
      )
      .bind(JSON.stringify(group))
      .all(),
  ])
  return {
    conversation,
    uncertain: z
      .object({ message: z.string() })
      .array()
      .parse(uncertain.results)
      .map((row) => row.message),
    messages: messageRow.array().parse(rows),
    attachments: attachmentRow.array().parse(files.results),
    history: conversationRow.array().parse(history.results),
    events: auditRow.array().parse(events.results),
    labels: z.object({ name: z.string() }).array().parse(labels.results),
  }
}

export type Audit = { actor: string; now: number }
export function eventStatement(
  db: D1Database,
  a: Audit,
  number: number | null,
  kind: string,
  payload: unknown,
) {
  return db
    .prepare(
      'INSERT INTO events(number,kind,actor,payload,at) VALUES(?,?,?,?,?)',
    )
    .bind(number, kind, a.actor, JSON.stringify(payload), a.now)
}
export async function changeStatus(
  db: D1Database,
  a: Audit,
  number: number,
  from: string,
  to: string,
) {
  const [result] = await db.batch([
    db
      .prepare(
        'UPDATE conversations SET status=?,closed_at=? WHERE number=? AND status=?',
      )
      .bind(to, to === 'closed' ? a.now : null, number, from),
    db
      .prepare(
        "INSERT INTO events(number,kind,actor,payload,at) SELECT ?,'status_changed',?,?,? WHERE changes()=1",
      )
      .bind(number, a.actor, JSON.stringify({ from, to }), a.now),
  ])
  if (result.meta.changes !== 1)
    throw new Error('Conversation changed. Reload and retry.')
}
export async function attachment(db: D1Database, key: string) {
  const row = await db
    .prepare('SELECT * FROM attachments WHERE key=?')
    .bind(key)
    .first()
  return row ? attachmentRow.parse(row) : null
}
export async function htmlBody(db: D1Database, id: string) {
  return db
    .prepare("SELECT html FROM messages WHERE id=? AND kind='inbound'")
    .bind(id)
    .first<string>('html')
}
