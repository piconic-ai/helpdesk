import { afterAll, beforeAll, expect, it } from 'vitest'
import { app } from '../worker'
import { registry } from '../src/core/extensions/registry'
import type { Bindings } from '../src/core/settings/bindings'
import { articles } from '../src/extensions/articles/extension-routes'
import { chat } from '../src/extensions/chat/extension'
import { feedback } from '../src/extensions/feedback/extension'
import { form } from '../src/extensions/form/extension'
import { testPlatform } from './platform'

const origin = 'https://desk.example.org'
const policy = {
  publicKey: 'published-key',
  origins: [origin],
  limitPerMinute: 100,
}
let platform: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
beforeAll(async () => {
  platform = await testPlatform()
  env = {
    ...platform,
    ENVIRONMENT: 'local',
    LOCAL_OPERATOR: 'operator@example.org',
    EXTENSIONS: registry(
      [form, chat, feedback].map((extension) => ({
        extension,
        settings: {},
        enabled: true,
      })),
    ),
    PUBLIC_INTAKES: { shop: policy },
  } as unknown as Bindings
  await platform.DB.batch([
    platform.DB.prepare("INSERT INTO products VALUES('shop','Shop')"),
    platform.DB.prepare(
      "INSERT INTO mailboxes VALUES('help@example.org','shop')",
    ),
  ])
})
afterAll(() => platform?.dispose())

function post(
  kind: string,
  fields: Record<string, string>,
  from = origin,
  bindings = env,
) {
  return app.request(
    origin + '/help/' + kind + '/shop',
    {
      method: 'POST',
      body: new URLSearchParams({ publicKey: policy.publicKey, ...fields }),
      headers: { origin: from },
    },
    bindings,
  )
}

it('accepts a hosted form on its registered origin and keeps invalid input for correction', async () => {
  const input = {
    subject: 'Receipt',
    body: 'Please reissue my receipt.',
    email: 'reader@example.org',
  }
  const response = await post('form', input)
  expect(response.status).toBe(200)
  expect(await response.text()).toMatch(/受け付けました（#\d+）/)
  const invalid = await post('form', { ...input, email: 'invalid' })
  expect(invalid.status).toBe(400)
  const page = await invalid.text()
  expect(page).toContain(input.subject)
  expect(page).toContain(input.body)
  expect(page).toContain('role="alert"')
  expect(page).not.toContain('該当する記事')
  expect((await post('form', input, 'https://other.example.org')).status).toBe(
    403,
  )
  expect(
    (await post('form', { ...input, publicKey: 'incorrect' })).status,
  ).toBe(403)
  expect(
    await platform.DB.prepare(
      'SELECT COUNT(*) AS n FROM conversations WHERE subject=?',
    )
      .bind(input.subject)
      .first('n'),
  ).toBe(1)
})

it('asks for a contact only when the visitor chooses to hand over an unanswered chat', async () => {
  const question = '製品の登録方法を教えてください。'
  const entry = await app.request(origin + '/help/chat/shop', {}, env)
  expect(await entry.text()).not.toContain('name="email"')
  const step = await post('chat', { question })
  expect(step.status).toBe(200)
  expect(await step.text()).toContain('name="email"')
  expect(
    await platform.DB.prepare(
      "SELECT COUNT(*) AS n FROM conversations WHERE origin='chat'",
    ).first('n'),
  ).toBe(0)
  const accepted = await post('chat', { question, email: 'reader@example.org' })
  expect(await accepted.text()).toMatch(/問い合わせを受け付けました（#\d+）/)
  expect(
    await platform.DB.prepare(
      "SELECT contact FROM conversations WHERE origin='chat'",
    ).first('contact'),
  ).toBe('reader@example.org')
})

it('requires an enabled intake, its hosted origin and a verifiable Turnstile submission', async () => {
  const entry = (bindings: Bindings) =>
    app.request(origin + '/help/feedback/shop', {}, bindings)
  expect((await entry({ ...env, EXTENSIONS: registry([]) })).status).toBe(404)
  expect(
    (
      await entry({
        ...env,
        PUBLIC_INTAKES: {
          shop: { ...policy, origins: ['https://other.example.org'] },
        },
      })
    ).status,
  ).toBe(404)
  const locked = { ...policy, turnstileSecretBinding: 'TURNSTILE_SECRET' }
  expect(
    (await entry({ ...env, PUBLIC_INTAKES: { shop: locked } })).status,
  ).toBe(503)
  const protectedEnv = {
    ...env,
    PUBLIC_INTAKES: {
      shop: { ...locked, turnstileSiteKey: 'public-widget-key' },
    },
  }
  const page = await entry(protectedEnv)
  expect(page.status).toBe(200)
  expect(await page.text()).toContain('data-sitekey="public-widget-key"')
  expect(
    (
      await post(
        'feedback',
        { body: 'Idea', email: 'reader@example.org' },
        origin,
        protectedEnv,
      )
    ).status,
  ).toBe(403)
})

it('opens only an explicitly enabled hosted origin and gives deployment policy precedence', async () => {
  const hosted = { ...env, PUBLIC_INTAKES: {} }
  const endpoint = origin + '/settings/public-intakes/shop'
  const entry = origin + '/help/feedback/shop'
  const enable = (bindings: Bindings, requestOrigin = origin) =>
    app.request(
      endpoint,
      {
        method: 'POST',
        headers: { origin: requestOrigin },
        body: new URLSearchParams({ returnTo: '/extensions/feedback' }),
      },
      bindings,
    )
  expect((await app.request(entry, {}, hosted)).status).toBe(404)
  expect((await enable(hosted, 'https://unknown.example')).status).toBe(403)
  await app.request(origin, {}, hosted)
  expect(
    (await enable({ ...hosted, LOCAL_OPERATOR: 'staff@example.org' })).status,
  ).toBe(403)
  expect((await enable(hosted)).status).toBe(303)
  expect((await enable(hosted)).status).toBe(303)
  expect((await app.request(entry, {}, hosted)).status).toBe(200)
  expect(
    (
      await app.request(
        'https://unknown.example/help/feedback/shop',
        {},
        hosted,
      )
    ).status,
  ).toBe(404)
  const locked = {
    ...hosted,
    PUBLIC_INTAKES: { shop: { ...policy, origins: ['https://other.example'] } },
  }
  expect((await app.request(entry, {}, locked)).status).toBe(404)
  expect((await enable(locked)).status).toBe(409)
  expect(
    await platform.DB.prepare(
      "SELECT count(*) n FROM events WHERE kind='hosted_intake_started'",
    ).first('n'),
  ).toBe(1)
  expect(
    (
      await app.request(
        origin + '/public/feedback/shop/submit',
        {
          method: 'POST',
          headers: { origin, 'content-type': 'application/json' },
          body: JSON.stringify({ email: 'visitor@example.org', body: 'Hello' }),
        },
        hosted,
      )
    ).status,
  ).not.toBe(201)
})

it('uses per-product reply guidance on receipts and lets the visitor correct a refused delivery', async () => {
  const endpoint = origin + '/extensions/form/public-settings'
  const body = new URLSearchParams({
    product: 'shop',
    responseTime: '2営業日以内',
  })
  expect(
    (
      await app.request(
        endpoint,
        { method: 'POST', headers: { origin }, body },
        env,
      )
    ).status,
  ).toBe(303)
  const fields = {
    subject: '見積もり',
    body: '見積書を発行できますか？',
    email: 'buyer@example.org',
  }
  const failed = await post('form', { ...fields, publicKey: 'old-key' })
  expect(failed.status).toBe(403)
  const retry = await failed.text()
  for (const value of Object.values(fields)) expect(retry).toContain(value)
  expect(retry).toContain('name="publicKey" value="published-key"')
  const receipt = await (await post('form', fields)).text()
  for (const value of ['#', fields.email, '2営業日以内'])
    expect(receipt).toContain(value)
  const response = await post('feedback', {
    body: '希望します',
    email: fields.email,
  })
  expect(await response.text()).toContain('フィードバックへの返信はありません')
})

it('accepts anonymous feedback without linking unrelated people or exposing a reply address', async () => {
  const first = await post('feedback', { body: 'Anonymous first' })
  const second = await post('feedback', { body: 'Anonymous second', email: '' })
  expect(first.status).toBe(200)
  expect(second.status).toBe(200)
  const receipt = await second.text()
  expect(receipt).toContain('登録なし')
  const number = receipt.match(/（#(\d+)）/)![1]
  const thread = await app.request(origin + '/conversation/' + number, {}, env)
  const html = await thread.text()
  expect(thread.status).toBe(200)
  expect(html).toContain('匿名')
  expect(html).not.toContain('Anonymous first')
  const invalid = await post('feedback', {
    body: 'Keep my words',
    email: 'bad',
  })
  expect(invalid.status).toBe(400)
  const correction = await invalid.text()
  expect(correction).toContain('Keep my words')
  expect(correction).toContain('連絡先を空にして送信してください')
  const inquiry = await post('form', {
    subject: 'Reply please',
    body: 'I need help',
  })
  expect(inquiry.status).toBe(400)
})

it('registers chat embedding sites without expanding the intake API or changing other public surfaces', async () => {
  const trusted = 'https://portal.example.com'
  const endpoint = origin + '/extensions/chat/embed-sites'
  const register = (site: string, bindings = env) =>
    app.request(
      endpoint,
      {
        method: 'POST',
        headers: { origin },
        body: new URLSearchParams({ product: 'shop', site }),
      },
      bindings,
    )
  expect(
    (await register(trusted, { ...env, LOCAL_OPERATOR: 'staff@example.org' }))
      .status,
  ).toBe(403)
  expect((await register(trusted + '/path')).status).toBe(400)
  expect((await register(trusted)).status).toBe(303)
  const chatPage = await app.request(origin + '/help/chat/shop', {}, env)
  expect(chatPage.headers.get('Content-Security-Policy')).toContain(trusted)
  const framed = await app.request(
    origin + '/help/chat/shop?embed=1&parent=' + encodeURIComponent(trusted),
    {},
    env,
  )
  expect(framed.headers.get('Referrer-Policy')).toBe('no-referrer')
  const formPage = await app.request(origin + '/help/form/shop', {}, env)
  expect(formPage.headers.get('Content-Security-Policy')).not.toContain(trusted)
  const api = await app.request(
    origin + '/public/chat/shop/ask',
    {
      method: 'OPTIONS',
      headers: { origin: trusted },
    },
    env,
  )
  expect(api.status).toBe(403)
  expect((await app.request(trusted + '/help/chat/shop', {}, env)).status).toBe(
    404,
  )
})

it('restores only the latest change made by the requesting administrator, once', async () => {
  const change = async (value: string) => {
    const response = await app.request(
      origin + '/extensions/form/public-settings',
      {
        method: 'POST',
        headers: { origin },
        body: new URLSearchParams({ product: 'shop', responseTime: value }),
      },
      env,
    )
    return new URL(response.headers.get('location')!, origin).searchParams.get(
      'undo',
    )!
  }
  const undo = async (id: string) => {
    const response = await app.request(
      origin + '/extensions/form/undo-setting',
      {
        method: 'POST',
        headers: { origin },
        body: new URLSearchParams({ changeId: id }),
      },
      env,
    )
    return response.headers.get('location')
  }
  const earlier = await change('明日まで')
  const later = await change('翌営業日まで')
  expect(await undo(earlier)).toContain('outdated')
  expect(await undo(later)).toContain('restored')
  expect(await undo(later)).toContain('outdated')
  expect(
    await platform.DB.prepare(
      "SELECT value FROM public_help_settings WHERE product='shop' AND setting='response_time'",
    ).first('value'),
  ).toBe('明日まで')
})

it('preserves the chosen chat handoff and contact when a fresh Turnstile verification is required', async () => {
  const locked = {
    ...env,
    PUBLIC_INTAKES: {
      shop: {
        ...policy,
        turnstileSecretBinding: 'TURNSTILE_SECRET',
        turnstileSiteKey: 'public-widget-key',
      },
    },
  }
  const address = 'verify@example.org'
  const question = '返信方法を教えてください'
  const denied = await post(
    'chat',
    { question, email: address, handoff: 'yes' },
    origin,
    locked,
  )
  expect(denied.status).toBe(403)
  const page = await denied.text()
  for (const value of [
    address,
    question,
    'name="handoff" value="yes"',
    'data-sitekey="public-widget-key"',
    'role="alert"',
  ])
    expect(page).toContain(value)
  expect(
    await platform.DB.prepare(
      'SELECT count(*) n FROM conversations WHERE contact=?',
    )
      .bind(address)
      .first('n'),
  ).toBe(0)
})

it('keeps a direct mailbox available when the contact form is disabled or paused', async () => {
  const withExtensions = (
    includeForm: boolean,
    configuredPolicy: Record<string, unknown>,
  ) => ({
    ...env,
    EXTENSIONS: registry(
      (includeForm ? [articles, form] : [articles]).map((extension) => ({
        extension,
        enabled: true,
        settings: {},
      })),
    ),
    PUBLIC_INTAKES: { shop: configuredPolicy },
  })
  const stoppedPolicy = {
    ...policy,
    turnstileSecretBinding: 'TURNSTILE_SECRET',
  }
  for (const binding of [
    withExtensions(false, policy),
    withExtensions(true, stoppedPolicy),
  ]) {
    for (const path of ['/help/?q=missing', '/help/articles/shop/?q=missing']) {
      const response = await app.request(origin + path, {}, binding)
      expect(response.status).toBe(200)
      const page = await response.text()
      expect(page).toContain('href="mailto:help@example.org"')
      expect(page).not.toContain('href="/help/form/shop"')
    }
  }
  const publicOnly = withExtensions(false, policy)
  const orphan = await app.request(
    origin + '/help/articles/unregistered/',
    { headers: { accept: 'text/html' } },
    publicOnly,
  )
  expect(orphan.status).toBe(404)
  expect(await orphan.text()).toContain('href="/help/"')
  const forbidden = await post(
    'form',
    { body: 'wrong-origin-text', email: 'attacker@example.org' },
    'https://other.example.org',
  )
  const recovery = await forbidden.text()
  expect(forbidden.status).toBe(403)
  expect(recovery).toContain('href="mailto:help@example.org"')
  expect(recovery).toContain('送信元を確認できませんでした')
  expect(recovery).not.toContain('wrong-origin-text')
  const paused = await app.request(
    origin + '/help/form/shop',
    {},
    withExtensions(true, stoppedPolicy),
  )
  expect(paused.status).toBe(503)
  expect(await paused.text()).toContain('href="mailto:help@example.org"')
})
