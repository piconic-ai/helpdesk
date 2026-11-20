import {
  scopeBinding,
  type ProductScope,
} from '../operators/project-permission'
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

import type { filterSchema } from './filters'

function searchNumbers(query: string) {
  if (/^[A-Z]{2,5}-[1-9]\d*$/i.test(query)) {
    return {
      sql: `SELECT conversation AS number FROM ticket_references
        WHERE prefix=substr(?2,1,instr(?2,'-')-1)
        AND serial=cast(substr(?2,instr(?2,'-')+1) AS INTEGER)`,
      term: query.toUpperCase(),
    }
  }
  if (Array.from(query).length < 3 || query.includes('\0'))
    return {
      sql: `SELECT number FROM conversations WHERE instr(lower(subject), lower(?2)) OR instr(lower(contact), lower(?2))
        UNION ALL SELECT number FROM messages WHERE instr(lower(body), lower(?2))`,
      term: query,
    }
  return {
    sql: `SELECT rowid AS number FROM conversation_search WHERE conversation_search MATCH lower(?2)
      UNION ALL SELECT m.number FROM message_search JOIN messages m ON m.search_rowid=message_search.rowid
      WHERE message_search MATCH lower(?2)`,
    term: '"' + query.replaceAll('"', '""') + '"',
  }
}

export async function listConversations(
  db: D1Database,
  input: z.infer<typeof filterSchema>,
  canonicalNumbers: Record<number, number> = {},
  scope: ProductScope = null,
) {
  const { status, product, assignee, label, query } = input
  const search = searchNumbers(query)
  const result = await db
    .prepare(`WITH members(source,target) AS (
      SELECT CAST(key AS INTEGER),value FROM json_each(?1)
      UNION ALL SELECT number,number FROM conversations
    ) SELECT c.* FROM referenced_conversations c WHERE (?3='all' OR status=?3) AND (?4='' OR product=?4)
    AND (?4<>'' OR NOT EXISTS (SELECT 1 FROM product_lifecycle p WHERE p.product=c.product AND p.archived_at IS NOT NULL))
    AND (?7 IS NULL OR c.product IN (SELECT value FROM json_each(?7)))
    AND (?5='' OR assignee=?5) AND (?6='' OR EXISTS(SELECT 1 FROM labels l JOIN members x ON l.number=x.source WHERE x.target=c.number AND l.name=?6))
    AND (?2='' OR c.number IN (SELECT x.target FROM members x JOIN (${search.sql}) hits ON hits.number=x.source))
    ORDER BY number DESC`)
    .bind(
      JSON.stringify(canonicalNumbers),
      search.term,
      status,
      product,
      assignee,
      label,
      scopeBinding(scope),
    )
    .all()
  return conversationRow.array().parse(result.results)
}
export async function getConversation(db: D1Database, number: number) {
  const row = await db
    .prepare('SELECT * FROM referenced_conversations WHERE number=?')
    .bind(number)
    .first()
  if (!row) throw new Error('Conversation not found')
  return conversationRow.parse(row)
}
export async function detail(
  db: D1Database,
  number: number,
  group: number[] = [number],
  scope: ProductScope = null,
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
        'SELECT * FROM referenced_conversations WHERE contact=?1 AND length(contact)>0 AND (?3 IS NULL OR product IN (SELECT value FROM json_each(?3))) AND number NOT IN (SELECT value FROM json_each(?2)) ORDER BY number DESC',
      )
      .bind(conversation.contact, JSON.stringify(group), scopeBinding(scope))
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
