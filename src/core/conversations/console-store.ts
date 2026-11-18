import { z } from 'zod'

export async function products(db: D1Database) {
  const rows = await db
    .prepare('SELECT id,name FROM products ORDER BY name,id')
    .all()
  return z
    .array(z.object({ id: z.string(), name: z.string() }))
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
    SELECT m.*,x.target,ROW_NUMBER() OVER(PARTITION BY x.target ORDER BY created_at DESC,id DESC) AS position
    FROM messages m JOIN members x ON x.source=m.number WHERE x.target IN (SELECT value FROM json_each(?1))
  ), reads AS (
    SELECT x.target,MAX(e.at) AS at FROM events e JOIN members x ON x.source=e.number
    WHERE e.kind='conversation_viewed' AND json_extract(e.actor,'$.id')=?3 GROUP BY x.target
  ), last_inbound AS (
    SELECT target,MAX(created_at) AS at FROM entries WHERE kind='inbound' GROUP BY target
  )
  SELECT c.number,c.contact_name AS name,p.name AS productName, coalesce(m.created_at,c.created_at) AS at,
    coalesce(substr(m.body,1,180),'') AS preview, coalesce(i.at > coalesce(r.at,-1),0) AS unread,
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
        preview: z.string(),
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
