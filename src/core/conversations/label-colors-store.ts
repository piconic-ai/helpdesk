import type { LabelEdit } from './labels'
import { z } from 'zod'

export async function labelColors(
  db: D1Database,
  projects: string[] | null = null,
): Promise<Record<string, number>> {
  const rows = await db
    .prepare(`SELECT name,min(color) AS color FROM project_labels
    WHERE color IS NOT NULL AND (?1 IS NULL OR product IN (SELECT value FROM json_each(?1)))
    GROUP BY name HAVING min(color)=max(color)`)
    .bind(projects && JSON.stringify(projects))
    .all()
  return Object.fromEntries(
    z
      .array(z.object({ name: z.string(), color: z.int().min(0).max(7) }))
      .parse(rows.results)
      .map((r) => [r.name, r.color]),
  )
}

const count =
  '(SELECT count(*) FROM labels l JOIN conversations c ON c.number=l.number WHERE c.product=?1 AND l.name=?2)'

export async function labelDirectory(db: D1Database, product: string) {
  const rows = await db
    .prepare(`SELECT d.name,
    (SELECT count(*) FROM labels l JOIN conversations c ON c.number=l.number WHERE c.product=d.product AND l.name=d.name) AS count
    FROM project_labels d WHERE d.product=? ORDER BY d.name`)
    .bind(product)
    .all()
  return z
    .array(z.object({ name: z.string(), count: z.int().nonnegative() }))
    .parse(rows.results)
}

export async function copyLabels(db: D1Database, from: string, to: string) {
  await db
    .prepare(
      'INSERT OR IGNORE INTO project_labels(product,name,color) SELECT ?,name,color FROM project_labels WHERE product=?',
    )
    .bind(to, from)
    .run()
}

export async function editLabelDirectory(
  db: D1Database,
  product: string,
  edit: LabelEdit,
) {
  switch (edit.action) {
    case 'add':
      return db
        .prepare('INSERT INTO project_labels(product,name) VALUES(?,?)')
        .bind(product, edit.name)
        .run()
    case 'color':
      return checkChange(
        await db
          .prepare(
            'UPDATE project_labels SET color=?3 WHERE product=?1 AND name=?2',
          )
          .bind(product, edit.label, edit.color)
          .run(),
      )
    case 'rename':
      return checkChange(
        await db
          .prepare(
            'UPDATE project_labels SET name=?3 WHERE product=?1 AND name=?2',
          )
          .bind(product, edit.label, edit.name)
          .run(),
      )
    case 'delete':
      return checkChange(
        await db
          .prepare(
            'DELETE FROM project_labels WHERE product=?1 AND name=?2 AND ' +
              count +
              '=?3',
          )
          .bind(product, edit.label, edit.count)
          .run(),
      )
    case 'merge': {
      const guard =
        'EXISTS(SELECT 1 FROM project_labels WHERE product=?1 AND name=?4) AND ' +
        count +
        '=?3'
      const bind = (sql: string) =>
        db.prepare(sql).bind(product, edit.label, edit.count, edit.target)
      const [, removed] = await db.batch([
        bind(
          'INSERT OR IGNORE INTO labels(number,name) SELECT l.number,?4 FROM labels l JOIN conversations c ON c.number=l.number WHERE c.product=?1 AND l.name=?2 AND ' +
            guard,
        ),
        bind(
          'DELETE FROM project_labels WHERE product=?1 AND name=?2 AND ' +
            guard,
        ),
      ])
      checkChange(removed)
    }
  }
}
function checkChange(result: D1Result) {
  if (!result.meta.changes)
    throw new Error('The label changed. Review the count and retry.')
}
