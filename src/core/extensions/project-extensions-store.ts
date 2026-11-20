import { z } from 'zod'
import type { Registry } from './registry'

const initialized = 'project_extension_settings_initialized'
const row = z.object({
  product: z.string(),
  extension: z.string(),
  enabled_by: z.string().nullable(),
  after_event: z.number(),
})

// Installation defaults are read from the deployed configuration, so existing
// projects are adopted once, after both application and SQL migrations exist.
export async function projectExtensions(
  db: D1Database,
  registry: Registry,
): Promise<Registry> {
  const [marker, active] = await db.batch([
    db.prepare('SELECT value FROM settings WHERE name=?').bind(initialized),
    rowsStatement(db),
  ])
  let records = active.results
  if (!marker.results.length) {
    const defaults = registry.active.map((item) => [
      item.extension.id,
      item.enabledBy,
    ])
    await db.batch([
      db
        .prepare(`INSERT OR IGNORE INTO project_extension_settings(product,extension,enabled,enabled_by)
      SELECT p.id,json_extract(e.value,'$[0]'),1,json_extract(e.value,'$[1]') FROM products p,json_each(?) e
      WHERE NOT EXISTS (SELECT 1 FROM settings WHERE name=?)`)
        .bind(JSON.stringify(defaults), initialized),
      db
        .prepare("INSERT OR IGNORE INTO settings(name,value) VALUES(?,'1')")
        .bind(initialized),
    ])
    records = (await rowsStatement(db).all()).results
  }
  const byExtension = new Map<
    string,
    Map<string, { by: string | null; afterEvent: number }>
  >()
  for (const entry of row.array().parse(records)) {
    let projects = byExtension.get(entry.extension)
    if (!projects) byExtension.set(entry.extension, (projects = new Map()))
    projects.set(entry.product, {
      by: entry.enabled_by,
      afterEvent: entry.after_event,
    })
  }
  const all = registry.all.map((item) => ({
    ...item,
    projects: byExtension.get(item.extension.id) ?? new Map(),
  }))
  return { all, active: all.filter((item) => item.enabled) }
}
function rowsStatement(db: D1Database) {
  return db.prepare(
    'SELECT product,extension,enabled_by,after_event FROM project_extension_settings WHERE enabled=1',
  )
}
export async function saveProjectExtension(
  db: D1Database,
  product: string,
  extension: string,
  enabled: boolean,
  by: string,
  now: number,
  configured: boolean,
) {
  const [changed] = await db.batch([
    db
      .prepare(`INSERT INTO project_extension_settings(product,extension,enabled,enabled_by,after_event)
      SELECT ?1,?2,?3,?4,coalesce(max(id),0) FROM events
      HAVING coalesce((SELECT enabled FROM extension_settings WHERE id=?2),?5)=1
      ON CONFLICT(product,extension) DO UPDATE SET enabled=excluded.enabled,enabled_by=excluded.enabled_by,after_event=excluded.after_event
      WHERE enabled!=excluded.enabled OR (excluded.enabled=1 AND enabled_by IS NULL)
      RETURNING product`)
      .bind(product, extension, Number(enabled), by, Number(configured)),
    db
      .prepare(
        `INSERT INTO events(kind,actor,at,payload) SELECT 'project_extension_configured',?,?,? WHERE changes()=1`,
      )
      .bind(
        JSON.stringify({ kind: 'operator', id: by }),
        now,
        JSON.stringify({ product, extension, enabled }),
      ),
  ])
  return changed.results.length > 0
}
