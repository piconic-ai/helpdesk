import type { LabelEdit } from './labels'
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
    SELECT ?1,?2 WHERE EXISTS(SELECT 1 FROM label_names WHERE name=?1)
    ON CONFLICT(name) DO UPDATE SET color=excluded.color`)
    .bind(name, color)
    .run()
  if (!result.meta.changes) throw new Error('Label is no longer in use')
}

export async function labelDirectory(db: D1Database) {
  const rows = await db
    .prepare(`
    SELECT d.name, count(l.number) AS count FROM label_names d
    LEFT JOIN labels l ON l.name=d.name GROUP BY d.name ORDER BY d.name`)
    .all()
  return z
    .array(z.object({ name: z.string(), count: z.int().nonnegative() }))
    .parse(rows.results)
}

export async function editLabelDirectory(db: D1Database, edit: LabelEdit) {
  switch (edit.action) {
    case 'color':
      return saveLabelColor(db, edit.label, edit.color)
    case 'add':
      return db
        .prepare('INSERT INTO label_names(name) VALUES(?)')
        .bind(edit.name)
        .run()
    case 'rename':
      return db
        .prepare('UPDATE label_names SET name=? WHERE name=?')
        .bind(edit.name, edit.label)
        .run()
        .then(checkChange)
    case 'delete':
      return db
        .prepare(
          'DELETE FROM label_names WHERE name=? AND (SELECT count(*) FROM labels WHERE name=?)=?',
        )
        .bind(edit.label, edit.label, edit.count)
        .run()
        .then(checkChange)
    case 'merge': {
      // Verify the source count and target in the same transaction as transferring membership.
      const guard =
        'EXISTS(SELECT 1 FROM label_names WHERE name=?2) AND (SELECT count(*) FROM labels WHERE name=?1)=?3'
      const bind = (sql: string) =>
        db.prepare(sql).bind(edit.label, edit.target, edit.count)
      const [, removed] = await db.batch([
        bind(
          'INSERT OR IGNORE INTO labels(number,name) SELECT number,?2 FROM labels WHERE name=?1 AND ' +
            guard,
        ),
        bind('DELETE FROM label_names WHERE name=?1 AND ' + guard),
      ])
      checkChange(removed)
    }
  }
}
function checkChange(result: D1Result) {
  if (!result.meta.changes)
    throw new Error('The label changed. Review the count and retry.')
}
