import { z } from 'zod'

import { extensionTable } from './extension-store'
export const activationNamespace = '$enabled'
function sourceFor(namespace: string) {
  return namespace === activationNamespace
    ? {
        table: 'extension_settings',
        key: 'id',
        value: 'json_array(enabled,enabled_by)',
      }
    : { table: extensionTable(namespace), key: 'key', value: 'value' }
}

type Change = {
  namespace: string
  key: string
  next: string | null
  operator: string
  now: number
  token: string
  revision?: string
  expected?: string | null
  undo?: boolean
}
const accepted =
  'EXISTS(SELECT 1 FROM extension_setting_changes WHERE token=?1)'
function settingWrite(db: D1Database, c: Change) {
  const { table, key } = sourceFor(c.namespace)
  if (c.next === null)
    return db
      .prepare(`DELETE FROM ${table} WHERE ${key}=?2 AND ${accepted}`)
      .bind(c.token, c.key)
  if (c.namespace === activationNamespace)
    return db
      .prepare(`INSERT INTO extension_settings(id,enabled,enabled_by)
      SELECT ?2,json_extract(?3,'$[0]'),json_extract(?3,'$[1]') WHERE ${accepted}
      ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled,enabled_by=excluded.enabled_by`)
      .bind(c.token, c.key, c.next)
  return db
    .prepare(`INSERT INTO ${table}(key,value) SELECT ?2,?3 WHERE ${accepted}
    ON CONFLICT(key) DO UPDATE SET value=excluded.value`)
    .bind(c.token, c.key, c.next)
}

function toggleWrites(db: D1Database, c: Change) {
  const audit = JSON.stringify({ kind: 'operator', id: c.operator })
  const payload = JSON.stringify({
    id: c.key,
    enabled: c.next === null ? false : Boolean(JSON.parse(c.next)[0]),
  })
  return [
    db
      .prepare(`INSERT INTO extension_cursor SELECT ?2,(SELECT coalesce(max(id),0) FROM events) WHERE ${accepted}
      ON CONFLICT(id) DO UPDATE SET last_event=excluded.last_event`)
      .bind(c.token, c.key),
    db
      .prepare(
        `DELETE FROM extension_deliveries WHERE extension=?2 AND phase<>'done' AND ${accepted}`,
      )
      .bind(c.token, c.key),
    db
      .prepare(
        `INSERT INTO events(kind,actor,payload,at) SELECT 'extension_configured',?2,?3,?4 WHERE ${accepted}`,
      )
      .bind(c.token, audit, payload, c.now),
  ]
}

export async function changeExtensionSetting(db: D1Database, c: Change) {
  const source = sourceFor(c.namespace)
  const current = `(SELECT ${source.value} FROM ${source.table} WHERE ${source.key}=?2)`
  const record = db
    .prepare(`INSERT INTO extension_setting_changes(namespace,setting,token,operator,previous,current)
    SELECT ?1,?2,?3,?4,${current},?5 WHERE ${current} IS NOT ?5
    AND (?6 IS NULL OR coalesce((SELECT token FROM extension_setting_changes WHERE namespace=?1 AND setting=?2),'')=?6)
    AND (?7=0 OR ${current} IS ?8)
    AND (?9=0 OR EXISTS(SELECT 1 FROM extension_setting_changes WHERE token=?6 AND operator=?4))
    ON CONFLICT(namespace,setting) DO UPDATE SET token=excluded.token,operator=excluded.operator,previous=excluded.previous,current=excluded.current
    RETURNING token`)
    .bind(
      c.namespace,
      c.key,
      c.token,
      c.operator,
      c.next,
      c.revision ?? null,
      Number(c.expected !== undefined),
      c.expected ?? null,
      Number(!!c.undo),
    )
  const [changed, actual] = await db.batch([
    record,
    db
      .prepare(
        `SELECT ${current} AS value,(SELECT token FROM extension_setting_changes WHERE namespace=?1 AND setting=?2) AS revision`,
      )
      .bind(c.namespace, c.key),
    settingWrite(db, c),
    ...(c.namespace === activationNamespace
      ? toggleWrites(db, c)
      : [
          db
            .prepare(`INSERT INTO events(kind,actor,payload,at)
      SELECT ?2,?3,?4,?5 WHERE ${accepted}`)
            .bind(
              c.token,
              c.undo ? 'extension_setting_restored' : 'extension_setting_saved',
              JSON.stringify({ kind: 'operator', id: c.operator }),
              JSON.stringify({ extension: c.namespace, setting: c.key }),
              c.now,
            ),
        ]),
    ...(c.undo
      ? [
          db
            .prepare('DELETE FROM extension_setting_changes WHERE token=?')
            .bind(c.token),
        ]
      : []),
  ])
  if (changed.results.length) return 'changed'
  const row = z
    .object({ value: z.string().nullable(), revision: z.string().nullable() })
    .parse(actual.results[0])
  return !c.undo &&
    row.value === c.next &&
    (c.revision === undefined || c.revision === (row.revision ?? ''))
    ? 'unchanged'
    : 'conflict'
}

export async function settingRevision(
  db: D1Database,
  namespace: string,
  key: string,
) {
  return (
    (await db
      .prepare(
        'SELECT token FROM extension_setting_changes WHERE namespace=? AND setting=?',
      )
      .bind(namespace, key)
      .first<string>('token')) ?? ''
  )
}

export async function settingSnapshot(db: D1Database, namespace: string) {
  const rows = await db
    .prepare(`SELECT s.key,s.value,r.token FROM ${extensionTable(namespace)} s
    LEFT JOIN extension_setting_changes r ON r.namespace=? AND r.setting=s.key ORDER BY s.rowid`)
    .bind(namespace)
    .all<{ key: string; value: string; token: string | null }>()
  return {
    rows: rows.results.map((s) => ({
      key: s.key,
      value: JSON.parse(s.value) as unknown,
    })),
    versions: new Map(rows.results.map((s) => [s.key, s.token ?? ''])),
  }
}

export async function restoreExtensionSetting(
  db: D1Database,
  namespace: string,
  token: string,
  operator: string,
  now: number,
  nextToken: string,
) {
  const receipt = await db
    .prepare(
      'SELECT setting,previous,current FROM extension_setting_changes WHERE namespace=? AND token=? AND operator=?',
    )
    .bind(namespace, token, operator)
    .first()
  if (!receipt) return false
  const { setting, previous, current } = z
    .object({
      setting: z.string(),
      previous: z.string().nullable(),
      current: z.string().nullable(),
    })
    .parse(receipt)
  return (
    (await changeExtensionSetting(db, {
      namespace,
      key: setting,
      next: previous,
      operator,
      now,
      token: nextToken,
      revision: token,
      expected: current,
      undo: true,
    })) === 'changed'
  )
}

export async function readPolicyMessage(
  db: D1Database,
  namespace: string,
  key: string,
  enabledBy: string | null,
) {
  const row = await db
    .prepare(`SELECT
    (SELECT value FROM ${extensionTable(namespace)} WHERE key=?1) AS value,
    (SELECT token FROM extension_setting_changes WHERE namespace=?2 AND setting=?1) AS revision,
    (SELECT at FROM events WHERE kind='extension_configured' AND json_extract(payload,'$.id')=?2
     AND json_extract(payload,'$.enabled')=1 AND json_extract(actor,'$.id')=?3 ORDER BY id DESC LIMIT 1) AS enabledAt`)
    .bind(key, namespace, enabledBy)
    .first<{
      value: string | null
      revision: string | null
      enabledAt: number | null
    }>()
  return {
    wording: row?.value == null ? null : (JSON.parse(row.value) as unknown),
    revision: row?.revision ?? '',
    enabledAt: row?.enabledAt ?? null,
  }
}
