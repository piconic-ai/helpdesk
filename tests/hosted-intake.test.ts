import { afterAll, beforeAll, expect, it } from 'vitest'
import { app } from '../worker'
import { registry } from '../src/core/extensions/registry'
import type { Bindings } from '../src/core/settings/bindings'
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
