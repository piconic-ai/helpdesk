import { z } from 'zod'
import type { Installed } from './registry'
export async function migrateExtensions(db: D1Database, active: Installed[]) {
  if (!active.length) return
  const rows = await db
    .prepare(
      'SELECT extension,max(version) version FROM extension_migrations GROUP BY extension',
    )
    .all()
  const versions = new Map(
    z
      .object({ extension: z.string(), version: z.number() })
      .array()
      .parse(rows.results)
      .map((r) => [r.extension, r.version]),
  )
  for (const { extension } of active) {
    const prefix =
      z
        .string()
        .regex(/^[a-z][a-z0-9-]*$/)
        .parse(extension.id)
        .replaceAll('-', '_') + '_'
    const ddl = [
      'CREATE TABLE IF NOT EXISTS ' +
        prefix +
        'data(key TEXT PRIMARY KEY NOT NULL,value TEXT NOT NULL CHECK(json_valid(value)))',
      ...(extension.migrations ?? []),
    ]
    const applied = versions.get(extension.id) ?? 0
    for (let n = applied; n < ddl.length; n++) {
      if (
        !ddl[n].startsWith('CREATE TABLE IF NOT EXISTS ' + prefix) ||
        ddl[n].includes(';')
      )
        throw new Error(
          'Expected idempotent CREATE TABLE in namespace ' + prefix,
        )
      await db.batch([
        db.prepare(ddl[n]),
        db
          .prepare('INSERT OR IGNORE INTO extension_migrations VALUES(?,?)')
          .bind(extension.id, n + 1),
      ])
    }
  }
}
