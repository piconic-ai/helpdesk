import { beforeAll, afterAll, expect, it } from 'vitest'
import { app } from '../worker'
import { testPlatform } from './platform'
import type { Bindings } from '../src/core/settings/bindings'

const origin = 'http://desk.local'
let platform: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
beforeAll(async () => {
  platform = await testPlatform()
  env = {
    ...platform,
    ENVIRONMENT: 'local',
    LOCAL_OPERATOR: 'admin@example.org',
    SENDING_DOMAINS: 'example.org',
    PUBLIC_INTAKES: { studio: { publicKey: 'published', origins: [origin] } },
  } as unknown as Bindings
  await platform.DB.batch([
    platform.DB.prepare(
      "INSERT INTO operators VALUES('admin@example.org','admin')",
    ),
    platform.DB.prepare(
      "INSERT INTO operators VALUES('support@example.org','agent')",
    ),
    platform.DB.prepare("INSERT INTO products VALUES('studio','Studio')"),
    platform.DB.prepare(
      "INSERT INTO product_members VALUES('studio','support@example.org','agent')",
    ),
    platform.DB.prepare(
      "INSERT INTO mailboxes VALUES('help@example.org','studio')",
    ),
    platform.DB.prepare(
      "INSERT INTO extension_settings VALUES('articles',1,'admin@example.org')",
    ),
    platform.DB.prepare(
      "INSERT INTO extension_settings VALUES('form',1,'admin@example.org')",
    ),
  ])
})
afterAll(() => platform?.dispose())
function visit(path: string, form?: Record<string, string>, bindings = env) {
  return app.request(
    origin + path,
    {
      method: form ? 'POST' : 'GET',
      headers: { Accept: 'text/html', Origin: origin },
      body: form && new URLSearchParams(form),
    },
    bindings,
  )
}

it('keeps an article preview private, publishes the selected draft, and rejects stale edit links', async () => {
  const input = {
    product: 'studio',
    title: '請求について',
    body: '請求書を保存できます。',
  }
  expect(await (await visit('/articles/new')).text()).toContain('記事を書く')
  expect(
    await (
      await visit('/articles/edit', { ...input, intent: 'preview' })
    ).text(),
  ).toContain(input.body)
  expect(await (await visit('/articles')).text()).not.toContain(input.title)
  const saved = await visit('/articles/edit', { ...input, intent: 'draft' })
  expect(saved.status).toBe(303)
  const location = saved.headers.get('location')!
  const id = new URL(location, origin).searchParams.get('id')!
  expect(await (await visit(location)).text()).toContain('下書きを保存しました')
  const publicUrl = '/help/articles/studio/' + encodeURIComponent(id)
  expect((await visit(publicUrl)).status).toBe(404)
  expect(
    (await visit('/articles/edit', { ...input, id, intent: 'publish' })).status,
  ).toBe(303)
  expect(await (await visit(publicUrl)).text()).toContain(input.body)
  expect(await (await visit('/articles')).text()).toContain(input.title)
  expect(
    (
      await visit('/articles/edit', {
        ...input,
        id: 'missing',
        intent: 'draft',
      })
    ).status,
  ).toBe(404)
  expect(
    (
      await visit('/articles/edit', {
        ...input,
        product: 'unknown',
        intent: 'publish',
      })
    ).status,
  ).toBe(404)
})

it('requires administrator permissions for extension setup and only lists enabled public endpoints', async () => {
  const agent = { ...env, LOCAL_OPERATOR: 'support@example.org' }
  expect((await visit('/extensions/form', undefined, agent)).status).toBe(403)
  expect(
    (await visit('/extensions/feedback', { enabled: 'yes' }, agent)).status,
  ).toBe(403)
  expect((await visit('/settings/deletion', undefined, agent)).status).toBe(403)
  expect((await visit('/extensions/feedback')).status).toBe(404)
  const guide = await visit('/extensions/form')
  expect(await guide.text()).toContain('/help/form/studio')
  expect(await (await visit('/extensions')).text()).toContain('有効な拡張')
  expect(await (await visit('/help/')).text()).toContain('/help/form/studio')
  const disabled = await visit('/extensions/form', { enabled: 'no' })
  expect(
    await (await visit(disabled.headers.get('location')!)).text(),
  ).toContain('無効にしました')
  expect((await visit('/help/form/studio')).status).toBe(404)
  expect(await (await visit('/help/')).text()).not.toContain(
    '/help/form/studio',
  )
})
