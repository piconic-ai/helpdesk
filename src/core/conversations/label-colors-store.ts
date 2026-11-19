import { z } from 'zod'

export async function labelColors(
  db: D1Database,
): Promise<Record<string, number>> {
  const result = await db.prepare('SELECT name,color FROM label_colors').all()
  const rows = z
    .object({ name: z.string(), color: z.int().min(0).max(7) })
    .array()
    .parse(result.results)
  const colors: Record<string, number> = Object.create(null)
  for (const row of rows) colors[row.name] = row.color
  return colors
}

export async function saveLabelColor(
  db: D1Database,
  name: string,
  color: number,
) {
  const result = await db
    .prepare(`INSERT INTO label_colors(name,color)
    SELECT ?1,?2 WHERE EXISTS(SELECT 1 FROM labels WHERE name=?1)
    ON CONFLICT(name) DO UPDATE SET color=excluded.color`)
    .bind(name, color)
    .run()
  if (!result.meta.changes) throw new Error('Label is no longer in use')
}
