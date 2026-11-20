import { z } from 'zod'

export async function projectVolume(
  db: D1Database,
  from: number,
  to: number,
  visible: readonly string[] | null,
  selected = '',
) {
  const rows = await db
    .prepare(`SELECT p.id AS value,p.name AS title,count(*) AS count FROM conversations c JOIN products p ON p.id=c.product
    WHERE c.created_at>=?1 AND c.created_at<?2 AND c.status<>'spam'
      AND (?3 IS NULL OR p.id IN (SELECT value FROM json_each(?3))) AND (?4='' OR p.id=?4)
    GROUP BY p.id,p.name`)
    .bind(from, to, visible === null ? null : JSON.stringify(visible), selected)
    .all()
  return z
    .array(
      z.object({
        value: z.string(),
        title: z.string(),
        count: z.int().positive(),
      }),
    )
    .parse(rows.results)
}
