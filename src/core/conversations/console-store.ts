import { z } from 'zod'

export async function products(db: D1Database) {
  const rows = await db
    .prepare(
      'SELECT p.id,p.name,s.name AS senderName,coalesce(s.show_operator,0) AS showOperator FROM products p LEFT JOIN product_senders s ON s.product=p.id ORDER BY p.name,p.id',
    )
    .all()
  return z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        senderName: z.string().nullable(),
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
) {
  if (!numbers.length) return []
  const sql = `WITH members(source,target) AS (
    SELECT CAST(key AS INTEGER),value FROM json_each(?2)
    UNION ALL SELECT value,value FROM json_each(?1)
  ), entries AS (
    SELECT m.*,x.target,
      COUNT(*) OVER(PARTITION BY x.target) AS messages,
      FIRST_VALUE(m.kind) OVER(PARTITION BY x.target ORDER BY m.created_at DESC,m.rowid DESC) AS latestKind,
      FIRST_VALUE(m.delivery) OVER(PARTITION BY x.target ORDER BY m.created_at DESC,m.rowid DESC) AS latestDelivery,
      MAX(m.created_at) OVER(PARTITION BY x.target) AS latest,
      ROW_NUMBER() OVER(PARTITION BY x.target ORDER BY
        CASE WHEN c.status='open' AND m.kind='inbound' THEN 0 ELSE 1 END, m.created_at DESC,m.rowid DESC) AS position
    FROM messages m JOIN members x ON x.source=m.number JOIN conversations c ON c.number=x.target WHERE x.target IN (SELECT value FROM json_each(?1))
  ), reads AS (
    SELECT x.target,MAX(e.at) AS at FROM events e JOIN members x ON x.source=e.number
    WHERE e.kind='conversation_viewed' AND json_extract(e.actor,'$.id')=?3 GROUP BY x.target
  ), last_inbound AS (
    SELECT target,MAX(created_at) AS at FROM entries WHERE kind='inbound' GROUP BY target
  )
  SELECT c.number,c.contact_name AS name,p.name AS productName, coalesce(m.latest,c.created_at) AS at,
    m.latestKind AS previewKind,m.latestDelivery AS previewDelivery,i.at AS lastInbound,
    coalesce(m.messages,0) AS messages, EXISTS(SELECT 1 FROM attachments a JOIN messages f ON a.message=f.id JOIN members x ON x.source=f.number WHERE x.target=c.number) AS hasFiles,coalesce(m.body,'') AS preview, coalesce(i.at > coalesce(r.at,-1),0) AS unread,
    EXISTS(SELECT 1 FROM entries f WHERE f.target=c.number AND f.delivery='failed') AS failed,
    (SELECT json_group_array(name) FROM (SELECT DISTINCT l.name FROM labels l JOIN members x ON x.source=l.number WHERE x.target=c.number ORDER BY l.name)) AS labels
  FROM conversations c JOIN products p ON p.id=c.product LEFT JOIN entries m ON m.target=c.number AND m.position=1
  LEFT JOIN reads r ON r.target=c.number LEFT JOIN last_inbound i ON i.target=c.number
  WHERE c.number IN (SELECT value FROM json_each(?1))`
  const rows = await db
    .prepare(sql)
    .bind(JSON.stringify(numbers), JSON.stringify(aliases), email)
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
        hasFiles: z.number(),
        preview: z.string(),
        previewKind: z.enum(['inbound', 'note', 'outbound']).nullable(),
        previewDelivery: z.string().nullable(),
        unread: z.number(),
        failed: z.number(),
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

export async function labelChoices(db: D1Database) {
  const rows = await db
    .prepare('SELECT DISTINCT name FROM labels ORDER BY name')
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
  newest: boolean,
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
  ORDER BY CASE WHEN ?3=0 AND c.status='open' AND a.received IS NOT NULL THEN 0 ELSE 1 END,
    CASE WHEN ?3=0 AND c.status='open' THEN a.received END ASC,
    coalesce(a.latest,c.created_at) DESC,c.number DESC LIMIT ?4 OFFSET ?5`)
    .bind(
      JSON.stringify(numbers),
      JSON.stringify(aliases),
      newest ? 1 : 0,
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
