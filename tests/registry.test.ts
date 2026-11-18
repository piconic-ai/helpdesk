import { due } from '../src/core/extensions/extension-store'
import { z } from 'zod'
import { test, expect } from 'vitest'
import { app } from '../worker'
import { testPlatform } from './platform'
import { registry } from '../src/core/extensions/registry'
import { configure, toggle } from '../src/core/extensions/registry-usecase'
import {
  deliverEvent,
  enqueueEvents,
} from '../src/core/extensions/dispatch-usecase'
import { extensionContext } from '../src/core/extensions/context-usecase'
import type { Bindings } from '../src/core/settings/bindings'
import type { Context } from '../src/core/operations/catalog-usecase'
import type { Extension } from '../src/core/extensions/extension'
import { form } from '../src/extensions/form/extension'

test('F02-AC1–6 registration validates config, isolates permissions and retries failed event deliveries', async () => {
  const p = await testPlatform()
  try {
    let fail = true
    const ext: Extension = {
      id: 'example',
      permissions: [],
      config: z.object({ label: z.string() }),
      migrations: [
        'CREATE TABLE IF NOT EXISTS example_archive(id INTEGER PRIMARY KEY)',
      ],
      subscribers: [
        {
          kind: 'note_added',
          async run(ctx, e) {
            if (fail) throw new Error('Temporary receiver failure')
            await ctx.put('latest', e.id)
          },
        },
      ],
    }
    const entries = [
      { extension: ext, enabled: true, settings: { label: 'sample' } },
      { extension: form, enabled: false, settings: {} },
    ]
    expect(() =>
      registry([{ extension: ext, enabled: true, settings: {} }]),
    ).toThrow(/example configuration.*label/)
    const env = await configure(
      {
        ...p,
        ENVIRONMENT: 'local',
        LOCAL_OPERATOR: 'admin@example.net',
      } as unknown as Bindings,
      entries,
      {},
    )
    const settings = await app.request('http://desk.local/extensions', {}, env)
    expect(await settings.text()).toContain('Disable example')
    const ctx: Context = {
      env,
      now: 1,
      actor: { kind: 'operator', id: 'admin@example.net' },
      operator: { email: 'admin@example.net', role: 'admin' },
      uuid: () => crypto.randomUUID(),
    }
    const api = extensionContext(ctx, env.EXTENSIONS.active[0])
    expect(() => api.request('https://example.net')).toThrow(/external_fetch/)
    await expect(api.body(1)).rejects.toThrow(/read_body/)
    expect(await api.create('item', 1)).toBe(true)
    expect(await api.create('item', 2)).toBe(false)
    expect(await api.list('ite')).toEqual([{ key: 'item', value: 1 }])
    await api.remove('item')
    expect(await api.get('item')).toBe(null)
    await p.DB.prepare(
      "INSERT INTO events(kind,actor,at) VALUES('note_added','{}',10)",
    ).run()
    await enqueueEvents(env, 10)
    expect(await due(env.DB, 'example', 10)).toEqual([])
    const id = await p.DB.prepare(
      "SELECT event FROM extension_deliveries WHERE extension='example'",
    ).first<number>('event')
    if (!id) throw new Error('No delivery')
    await deliverEvent(env, 'example', id, 10)
    expect(
      await p.DB.prepare('SELECT kind FROM events WHERE id=?')
        .bind(id)
        .first('kind'),
    ).toBe('note_added')
    expect(
      await (await app.request('http://desk.local/extensions', {}, env)).text(),
    ).toContain('Temporary receiver failure')
    fail = false
    await enqueueEvents(env, 5000)
    await Promise.all([
      deliverEvent(env, 'example', id, 5000),
      deliverEvent(env, 'example', id, 5000),
    ])
    expect(await api.get('latest')).toBe(id)
    expect(
      await p.DB.prepare(
        'SELECT phase,attempt FROM extension_deliveries WHERE event=?',
      )
        .bind(id)
        .first(),
    ).toEqual({ phase: 'done', attempt: 2 })
    await toggle(ctx, 'example', false)
    const disabled = await configure(
      { ...env, EXTENSIONS: undefined },
      entries,
      {},
    )
    expect(disabled.EXTENSIONS.active).toHaveLength(0)
    expect(
      (
        await app.request(
          'https://desk.local/public/form/sample/submit',
          { method: 'POST' },
          disabled,
        )
      ).status,
    ).toBe(404)
  } finally {
    await p.dispose()
  }
})
