import { z } from 'zod'
import type { ExtensionEvent } from './extension'

export function extensionStorage(db: D1Database, id: string) {
  const table =
    '"' +
    z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/)
      .parse(id)
      .replaceAll('-', '_') +
    '_data"'
  const put = async (key: string, value: unknown, replace: boolean) => {
    const verb = replace ? 'INSERT OR REPLACE' : 'INSERT OR IGNORE'
    const result = await db
      .prepare(verb + ' INTO ' + table + '(key,value) VALUES(?,?)')
      .bind(key, JSON.stringify(value))
      .run()
    return result.meta.changes === 1
  }
  return {
    compareSwap: async (key: string, expected: unknown, value: unknown) => {
      if (expected === null) return put(key, value, false)
      const result = await db
        .prepare('UPDATE ' + table + ' SET value=? WHERE key=? AND value=?')
        .bind(JSON.stringify(value), key, JSON.stringify(expected))
        .run()
      return result.meta.changes === 1
    },
    create: (key: string, value: unknown) => put(key, value, false),
    put: async (key: string, value: unknown) => {
      await put(key, value, true)
    },
    get: async (key: string): Promise<unknown> => {
      const row = await db
        .prepare('SELECT value FROM ' + table + ' WHERE key=?')
        .bind(key)
        .first<string>('value')
      return row === null ? null : JSON.parse(row)
    },
    list: async (prefix: string) => {
      const rows = await db
        .prepare(
          'SELECT key,value FROM ' +
            table +
            ' WHERE substr(key,1,length(?))=? ORDER BY key',
        )
        .bind(prefix, prefix)
        .all()
      return z
        .object({ key: z.string(), value: z.string() })
        .array()
        .parse(rows.results)
        .map((r) => ({ key: r.key, value: JSON.parse(r.value) as unknown }))
    },
    remove: async (key: string) => {
      await db
        .prepare('DELETE FROM ' + table + ' WHERE key=?')
        .bind(key)
        .run()
    },
  }
}
export async function readOverrides(db: D1Database) {
  const rows = await db
    .prepare('SELECT id,enabled,enabled_by FROM extension_settings')
    .all()
  return new Map(
    z
      .object({
        id: z.string(),
        enabled: z.union([z.literal(0), z.literal(1)]),
        enabled_by: z.string(),
      })
      .array()
      .parse(rows.results)
      .map((row) => [row.id, { enabled: !!row.enabled, by: row.enabled_by }]),
  )
}
export async function setEnabled(
  db: D1Database,
  id: string,
  enabled: boolean,
  by: string,
  now: number,
) {
  await db.batch([
    db
      .prepare(
        'INSERT INTO extension_settings VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled,enabled_by=excluded.enabled_by',
      )
      .bind(id, Number(enabled), by),
    db
      .prepare(
        'INSERT INTO extension_cursor VALUES(?,(SELECT coalesce(max(id),0) FROM events)) ON CONFLICT(id) DO UPDATE SET last_event=excluded.last_event',
      )
      .bind(id),
    db
      .prepare(
        "DELETE FROM extension_deliveries WHERE extension=? AND phase<>'done'",
      )
      .bind(id),
    db
      .prepare(
        "INSERT INTO events(kind,actor,payload,at) VALUES('extension_configured',?,?,?)",
      )
      .bind(
        JSON.stringify({ kind: 'operator', id: by }),
        JSON.stringify({ id, enabled }),
        now,
      ),
  ])
}
export async function scan(db: D1Database, id: string, kinds: string[]) {
  await db.batch([
    db
      .prepare(
        'INSERT OR IGNORE INTO extension_deliveries(extension,event) SELECT ?,id FROM events WHERE id>coalesce((SELECT last_event FROM extension_cursor WHERE id=?),0) AND kind IN (SELECT value FROM json_each(?))',
      )
      .bind(id, id, JSON.stringify(kinds)),
    db
      .prepare(
        'INSERT OR REPLACE INTO extension_cursor VALUES(?,(SELECT coalesce(max(id),0) FROM events))',
      )
      .bind(id),
  ])
}
export async function due(db: D1Database, id: string, now: number) {
  const rows = await db
    .prepare(
      `UPDATE extension_deliveries SET enqueued_until=? WHERE extension=? AND event IN
       (SELECT event FROM extension_deliveries WHERE extension=? AND phase<>'done' AND next_at<=? AND enqueued_until<=? ORDER BY event LIMIT 100)
       RETURNING event`,
    )
    .bind(now + 300000, id, id, now, now)
    .all()
  return z
    .object({ event: z.number() })
    .array()
    .parse(rows.results)
    .map((row) => row.event)
}
const eventRow = z.object({
  id: z.number(),
  kind: z.string(),
  number: z.number().nullable(),
  actor: z.string(),
  payload: z.string(),
  at: z.number(),
})
export async function claimEvent(
  db: D1Database,
  id: string,
  event: number,
  now: number,
) {
  const [updated, row] = await db.batch([
    db
      .prepare(
        "UPDATE extension_deliveries SET phase='processing',attempt=attempt+1,next_at=? WHERE extension=? AND event=? AND phase<>'done' AND next_at<=? RETURNING attempt",
      )
      .bind(now + 300000, id, event, now),
    db.prepare('SELECT * FROM events WHERE id=?').bind(event),
  ])
  if (!updated.results.length) return null
  const next = eventRow.parse(row.results[0])
  return {
    attempt: z.object({ attempt: z.number() }).parse(updated.results[0])
      .attempt,
    event: {
      ...next,
      actor: JSON.parse(next.actor),
      payload: z
        .record(z.string(), z.unknown())
        .parse(JSON.parse(next.payload)),
    } satisfies ExtensionEvent,
  }
}
export async function finishEvent(
  db: D1Database,
  id: string,
  event: number,
  attempt: number,
  error: string | null,
  now: number,
) {
  await db
    .prepare(
      "UPDATE extension_deliveries SET phase=?,error=?,next_at=?,enqueued_until=0 WHERE extension=? AND event=? AND attempt=? AND phase='processing'",
    )
    .bind(
      error ? 'failed' : 'done',
      error,
      now + Math.min(3600000, 1000 * 2 ** Math.min(12, attempt)),
      id,
      event,
      attempt,
    )
    .run()
}
export async function deliveryFailures(db: D1Database) {
  return (
    await db
      .prepare(
        "SELECT extension,event,error,attempt FROM extension_deliveries WHERE phase='failed' ORDER BY event DESC",
      )
      .all()
  ).results
}
