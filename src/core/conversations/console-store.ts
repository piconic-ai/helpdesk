import {
  scopeBinding,
  type ProductScope,
} from '../operators/project-permission'
import { replyDelay } from '../settings/reply-delay'
import { mailLanguage } from '../settings/mail-language'
import { z } from 'zod'
import { ticketPrefixSchema } from './ticket-reference'

export async function products(
  db: D1Database,
  scope: ProductScope = null,
  includeArchived = true,
  current?: string,
) {
  const rows = await db
    .prepare(
      "SELECT p.id,p.name,pl.archived_at IS NOT NULL AS archived,t.prefix AS ticketPrefix,coalesce(s.language,'ja') AS language,coalesce(s.minimum_reply_delay,10) AS minimumReplyDelay,i.emoji,i.image_key IS NOT NULL AS hasIconImage,s.name AS senderName,coalesce(s.show_operator,0) AS showOperator FROM products p LEFT JOIN product_lifecycle pl ON pl.product=p.id JOIN product_ticket_prefixes t ON t.product=p.id LEFT JOIN product_icons i ON i.product=p.id LEFT JOIN product_senders s ON s.product=p.id WHERE (?1 IS NULL OR p.id IN (SELECT value FROM json_each(?1))) AND (?2 OR pl.archived_at IS NULL OR p.id=?3) ORDER BY p.name,p.id",
    )
    .bind(scopeBinding(scope), Number(includeArchived), current ?? null)
    .all()
  return z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        archived: z.number().transform(Boolean).optional(),
        ticketPrefix: ticketPrefixSchema,
        emoji: z.string().nullable(),
        hasIconImage: z.number().transform(Boolean),
        senderName: z.string().nullable(),
        language: mailLanguage,
        minimumReplyDelay: replyDelay,
        showOperator: z.number().transform(Boolean),
      }),
    )
    .parse(rows.results)
}

export async function rowDetails(
  db: D1Database,
  numbers: number[],
  aliases: Record<number, number>,
  email: string,
  approval: boolean,
) {
  if (!numbers.length) return []
  const sql = `WITH members(source,target) AS (
    SELECT CAST(key AS INTEGER),value FROM json_each(?2)
    UNION ALL SELECT value,value FROM json_each(?1)
  ), entries AS (
    SELECT m.*,x.target,
      COUNT(*) OVER(PARTITION BY x.target) AS messages,
      MAX(m.created_at) OVER(PARTITION BY x.target) AS latest,
      ROW_NUMBER() OVER(PARTITION BY x.target ORDER BY
        CASE WHEN ?4 AND m.kind='outbound' AND m.approval IS NULL AND m.delivery IN ('draft','awaiting_approval') THEN 0
             WHEN c.status='open' AND m.kind='outbound' AND m.approval IS NULL AND m.delivery IN ('draft','awaiting_approval') THEN 2 ELSE 1 END, m.created_at DESC,m.rowid DESC) AS position
    FROM messages m JOIN members x ON x.source=m.number JOIN conversations c ON c.number=x.target WHERE x.target IN (SELECT value FROM json_each(?1))
  ), reads AS (
    SELECT x.target,MAX(e.at) AS at,MAX(e.id) AS id FROM events e JOIN members x ON x.source=e.number
    WHERE e.kind='conversation_viewed' AND json_extract(e.actor,'$.kind')='operator' AND json_extract(e.actor,'$.id')=?3 GROUP BY x.target
  ), last_inbound AS (
    SELECT target,MAX(created_at) AS at FROM entries WHERE kind='inbound' GROUP BY target
  )
  SELECT c.number,c.contact_name AS name,p.name AS productName, coalesce(m.latest,c.created_at) AS at,
    m.kind AS previewKind,m.delivery AS previewDelivery,i.at AS lastInbound,
    coalesce(m.messages,0) AS messages, EXISTS(SELECT 1 FROM attachments a JOIN messages f ON a.message=f.id JOIN members x ON x.source=f.number WHERE x.target=c.number) AS hasFiles,coalesce(m.body,'') AS preview, (coalesce(i.at > coalesce(r.at,-1),0) OR EXISTS (
      SELECT 1 FROM events e JOIN members x ON x.source=e.number WHERE x.target=c.number
      AND e.kind='message_received' AND e.id>coalesce(r.id,0)
    )) AS unread,
    EXISTS(SELECT 1 FROM entries f WHERE f.target=c.number AND f.delivery='failed') AS failed,
    EXISTS(SELECT 1 FROM entries f JOIN reply_holds h ON h.message=f.id JOIN outbox o ON o.message=f.id WHERE f.target=c.number AND f.delivery='queued' AND o.phase='ready') AS scheduled,
    (SELECT json_group_array(name) FROM (SELECT DISTINCT l.name FROM labels l JOIN members x ON x.source=l.number WHERE x.target=c.number ORDER BY l.name)) AS labels
  FROM conversations c JOIN products p ON p.id=c.product LEFT JOIN entries m ON m.target=c.number AND m.position=1
  LEFT JOIN reads r ON r.target=c.number LEFT JOIN last_inbound i ON i.target=c.number
  WHERE c.number IN (SELECT value FROM json_each(?1))`
  const rows = await db
    .prepare(sql)
    .bind(
      JSON.stringify(numbers),
      JSON.stringify(aliases),
      email,
      Number(approval),
    )
    .all()
  return z
    .array(
      z.object({
        number: z.number(),
        name: z.string().nullable(),
        productName: z.string(),
        at: z.number(),
        lastInbound: z.number().nullable(),
        messages: z.number(),
        hasFiles: z.number().transform(Boolean),
        preview: z.string(),
        previewKind: z.enum(['inbound', 'note', 'outbound']).nullable(),
        previewDelivery: z
          .enum(['draft', 'awaiting_approval', 'queued', 'sent', 'failed'])
          .nullable(),
        unread: z.number(),
        failed: z.number(),
        scheduled: z.number(),
        labels: z
          .string()
          .transform((s) => z.array(z.string()).parse(JSON.parse(s))),
      }),
    )
    .parse(rows.results)
}

export async function fileMessages(db: D1Database, keys: string[]) {
  const rows = await db
    .prepare(
      'SELECT key,message FROM attachments WHERE key IN (SELECT value FROM json_each(?))',
    )
    .bind(JSON.stringify(keys))
    .all()
  return z
    .array(z.object({ key: z.string(), message: z.string() }))
    .parse(rows.results)
}

export async function labelChoices(
  db: D1Database,
  projects: string[] | null = null,
) {
  const rows = await db
    .prepare(
      'SELECT DISTINCT name FROM project_labels WHERE ?1 IS NULL OR product IN (SELECT value FROM json_each(?1)) ORDER BY name',
    )
    .bind(projects && JSON.stringify(projects))
    .all()
  return z
    .array(z.object({ name: z.string() }))
    .parse(rows.results)
    .map((row) => row.name)
}
export async function awaitingApproval(db: D1Database) {
  const rows = await db
    .prepare(
      "SELECT DISTINCT number FROM messages WHERE kind='outbound' AND approval IS NULL AND delivery IN ('draft','awaiting_approval')",
    )
    .all()
  return z
    .array(z.object({ number: z.number() }))
    .parse(rows.results)
    .map((row) => row.number)
}

export async function pageNumbers(
  db: D1Database,
  numbers: number[],
  aliases: Record<number, number>,
  order: 'newest' | 'waiting' | 'unreviewed',
  offset: number,
  limit: number,
) {
  const rows = await db
    .prepare(`WITH members(source,target) AS (
    SELECT CAST(key AS INTEGER),value FROM json_each(?2) UNION ALL SELECT value,value FROM json_each(?1)
  ), activity AS (
    SELECT x.target,max(m.created_at) AS latest,max(CASE WHEN m.kind='inbound' THEN m.created_at END) AS received
    FROM members x JOIN messages m ON m.number=x.source WHERE x.target IN (SELECT value FROM json_each(?1)) GROUP BY x.target
  )
  SELECT c.number FROM json_each(?1) n JOIN conversations c ON c.number=n.value LEFT JOIN activity a ON a.target=c.number
  ORDER BY CASE WHEN ?3='unreviewed' AND c.status='received' THEN 0 ELSE 1 END,
    CASE WHEN ?3='waiting' AND c.status='open' AND a.received IS NOT NULL THEN 0 ELSE 1 END,
    CASE WHEN ?3='waiting' AND c.status='open' THEN a.received END ASC,
    CASE WHEN c.kind='feedback' THEN c.created_at ELSE coalesce(a.latest,c.created_at) END DESC,c.number DESC LIMIT ?4 OFFSET ?5`)
    .bind(
      JSON.stringify(numbers),
      JSON.stringify(aliases),
      order,
      limit,
      offset,
    )
    .all()
  return z
    .object({ number: z.number() })
    .array()
    .parse(rows.results)
    .map((row) => row.number)
}
