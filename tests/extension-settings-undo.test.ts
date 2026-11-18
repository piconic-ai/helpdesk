import { afterAll, beforeAll, expect, it } from 'vitest'
import { app } from '../worker'
import { testPlatform } from './platform'
import type { Bindings } from '../src/core/settings/bindings'
const origin = 'http://extension-settings.local'
const a = 'first@example.org'
const b = 'second@example.org'
let platform: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
beforeAll(async () => {
  platform = await testPlatform()
  env = {
    ...platform,
    ENVIRONMENT: 'local',
    LOCAL_OPERATOR: a,
  } as unknown as Bindings
  await platform.DB.batch([
    platform.DB.prepare(
      "INSERT INTO operators VALUES(?,'admin'),(?,'admin')",
    ).bind(a, b),
    platform.DB.prepare(
      "INSERT INTO extension_settings VALUES('rules',1,?),('canned',1,?)",
    ).bind(a, a),
  ])
})
afterAll(() => platform?.dispose())
function post(path: string, fields: Record<string, string>, operator = a) {
  return app.request(
    origin + path,
    {
      method: 'POST',
      headers: { Origin: origin, Accept: 'text/html' },
      body: new URLSearchParams(fields),
    },
    { ...env, LOCAL_OPERATOR: operator },
  )
}
function location(response: Response) {
  expect(response.status).toBe(303)
  return new URL(response.headers.get('location')!, origin)
}
function token(response: Response) {
  const id = location(response).searchParams.get('undo')
  expect(id).toBeTruthy()
  return id!
}
it('preserves creation order across edits and restores a sorted list without overwriting newer changes', async () => {
  const db = platform.DB
  await app.request(origin + '/extensions/rules', {}, env)
  const oldKey = 'rule/ffffffff-ffff-4fff-afff-ffffffffffff'
  await db
    .prepare('INSERT INTO rules_data VALUES(?,?)')
    .bind(
      oldKey,
      JSON.stringify({ subjectContains: 'First rule', assignee: a }),
    )
    .run()
  const previousKey = 'rule/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'
  await db
    .prepare('INSERT INTO rules_data VALUES(?,?)')
    .bind(
      previousKey,
      JSON.stringify({ subjectContains: 'Earlier priority', assignee: a }),
    )
    .run()
  const update = '/extensions/rules/add'
  const created = token(
    await post(update, {
      subjectContains: 'Second rule',
      assignee: a,
      revision: '',
    }),
  )
  const fresh = await db
    .prepare('SELECT setting FROM extension_setting_changes WHERE token=?')
    .bind(created)
    .first<string>('setting')
  const list = async () =>
    (await app.request(origin + '/extensions/rules', {}, env)).text()
  const positions = async () => {
    const markup = await list()
    return markup.indexOf('First rule') < markup.indexOf('Second rule')
  }
  expect(await positions()).toBe(true)
  const original = await list()
  expect(original.indexOf('Earlier priority')).toBeLessThan(
    original.indexOf('First rule'),
  )
  const move = (direction: 'up' | 'down', revision: string, operator = a) =>
    post(
      '/extensions/rules/move',
      { key: fresh!, direction, revision },
      operator,
    )
  const swap = token(await move('up', ''))
  expect(await positions()).toBe(false)
  const undo = (id: string, operator = a) =>
    post('/extensions/rules/undo-setting', { changeId: id }, operator)
  expect(location(await undo(swap, b)).searchParams.get('publicSettings')).toBe(
    'outdated',
  )
  const reverse = token(await move('down', swap, b))
  expect(await positions()).toBe(true)
  expect(location(await undo(swap)).searchParams.get('publicSettings')).toBe(
    'outdated',
  )
  expect(
    location(await undo(reverse, b)).searchParams.get('publicSettings'),
  ).toBe('restored')
  expect(await positions()).toBe(false)
  expect(
    location(await undo(reverse, b)).searchParams.get('publicSettings'),
  ).toBe('outdated')
  const [one, two] = await Promise.all([
    post(update, {
      key: fresh!,
      assignee: a,
      subjectContains: 'Operator A edit',
      revision: created,
    }),
    post(
      update,
      {
        key: fresh!,
        assignee: b,
        subjectContains: 'Operator B edit',
        revision: created,
      },
      b,
    ),
  ])
  expect(
    [one, two].map((r) => location(r).searchParams.has('undo')).sort(),
  ).toEqual([false, true])
  const good = [one, two].find((r) => location(r).searchParams.has('undo'))!
  const owner = good === one ? a : b
  const undoEdit = token(good)
  expect(location(await undo(created)).searchParams.get('publicSettings')).toBe(
    'outdated',
  )
  expect(
    location(await undo(undoEdit, owner)).searchParams.get('publicSettings'),
  ).toBe('restored')
  expect(
    await db
      .prepare('SELECT value FROM rules_data WHERE key=?')
      .bind(fresh)
      .first('value'),
  ).toContain('Second rule')
})
it('undoes activation atomically with the dispatch cursor, only for its author and current activation', async () => {
  const enable = (enabled: boolean, who: string) =>
    post('/extensions/snooze', { enabled: enabled ? 'yes' : 'no' }, who)
  const undo = (id: string, who: string) =>
    post('/extensions/undo-activation', { changeId: id }, who)
  const first = token(await enable(true, a))
  expect(location(await undo(first, b)).searchParams.get('restored')).toBe(
    'outdated',
  )
  await enable(false, b)
  const second = token(await enable(true, b))
  expect(location(await undo(first, a)).searchParams.get('restored')).toBe(
    'outdated',
  )
  expect(location(await undo(second, b)).searchParams.get('restored')).toBe(
    'yes',
  )
  expect(
    await platform.DB.prepare(
      "SELECT enabled,enabled_by FROM extension_settings WHERE id='snooze'",
    ).first(),
  ).toEqual({ enabled: 0, enabled_by: b })
  expect(
    (await app.request(origin + '/extensions/snooze', {}, env)).status,
  ).toBe(404)
  expect(location(await undo(second, b)).searchParams.get('restored')).toBe(
    'outdated',
  )
})
