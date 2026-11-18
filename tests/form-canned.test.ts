import { afterAll, beforeAll, expect, it } from 'vitest'
import { testPlatform } from './platform'
import { app } from '../worker'
import { registry } from '../src/core/extensions/registry'
import { canned } from '../src/extensions/canned/extension'
import { form } from '../src/extensions/form/extension'
import { approveReply } from '../src/core/outbound/reply-usecase'
import type { Bindings } from '../src/core/settings/bindings'

let local: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
const host = 'https://desk.example.com'
const site = 'https://shop.example.com'
const uri = host + '/public/form/shop/submit'
const payload = {
  name: 'Jane Smith',
  email: 'jane@example.org',
  subject: 'Receipt',
  body: 'Can I download it?',
}
const installed = registry([
  { extension: form, enabled: true, settings: {} },
  {
    extension: canned,
    enabled: true,
    settings: {
      templates: {
        receipt: 'Hi {{name}}, your {{product}} receipt is available.',
      },
    },
  },
])
beforeAll(async () => {
  local = await testPlatform()
  env = {
    ...local,
    EXTENSIONS: installed,
    LOCAL_OPERATOR: 'owner@example.com',
    ENVIRONMENT: 'local',
    PUBLIC_INTAKES: {
      shop: { publicKey: 'shop-key', origins: [site], limitPerMinute: 3 },
    },
  } as unknown as Bindings
  await local.DB.batch([
    local.DB.prepare("INSERT INTO products VALUES('shop','My Shop')"),
    local.DB.prepare("INSERT INTO mailboxes VALUES('shop@example.com','shop')"),
  ])
})
afterAll(() => local?.dispose())
function submit(input: unknown = payload, origin = site, key = 'shop-key') {
  return app.request(
    uri,
    {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        'X-Helpdesk-Key': key,
      },
    },
    env,
  )
}
async function count() {
  return local.DB.prepare('SELECT count(*) n FROM conversations').first<number>(
    'n',
  )
}
it('F04-AC1 F04-AC2 F04-AC3 F05-AC1: public form accepts only the configured product and the chosen reply stays a draft', async () => {
  const preflight = await app.request(
    uri,
    {
      method: 'OPTIONS',
      headers: {
        Origin: site,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-helpdesk-key',
      },
    },
    env,
  )
  expect(preflight.ok).toBe(true)
  expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe(site)
  expect((await submit(payload, 'https://foreign.example')).ok).toBe(false)
  expect((await submit(payload, site, 'invalid')).ok).toBe(false)
  expect(await count()).toBe(0)
  const made = await submit()
  expect(made.ok).toBe(true)
  const { number } = (await made.clone().json()) as { number: number }
  expect(await made.json()).toEqual({ number: expect.any(Number) })
  expect(
    await local.DB.prepare(
      'SELECT product,contact,subject FROM conversations WHERE number=?',
    )
      .bind(number)
      .first(),
  ).toEqual({
    product: 'shop',
    contact: 'jane@example.org',
    subject: 'Receipt',
  })
  const page = await app.request(host + '/conversation/' + number, {}, env)
  expect(await page.text()).toContain('receipt')
  const applied = await app.request(
    host + '/actions/canned.apply',
    {
      method: 'POST',
      headers: { Origin: host },
      body: new URLSearchParams({
        number: String(number),
        template: 'receipt',
      }),
    },
    env,
  )
  expect(applied.status, await applied.text()).toBe(200)
  const draft = await local.DB.prepare(
    "SELECT id,body,delivery FROM messages WHERE number=? AND kind='outbound'",
  )
    .bind(number)
    .first<{ id: string; body: string; delivery: string }>()
  expect(draft).toMatchObject({
    body: 'Hi Jane Smith, your My Shop receipt is available.',
    delivery: 'draft',
  })
  expect(
    await local.DB.prepare('SELECT count(*) n FROM outbox').first('n'),
  ).toBe(0)
  await approveReply(local, {
    id: draft!.id,
    actor: { kind: 'operator', id: 'owner@example.com' },
    now: Date.now(),
  })
  expect(
    await local.DB.prepare('SELECT message FROM outbox').first('message'),
  ).toBe(draft!.id)
  await submit()
  await submit()
  expect((await submit()).ok).toBe(false)
  expect(await count()).toBe(3)
  const rejected = await submit({ ...payload, number: 987 }, site, 'invalid')
  const repeat = await submit({ ...payload, number }, site, 'invalid')
  expect(rejected.status).toBe(repeat.status)
  expect(await rejected.text()).toBe(await repeat.text())
})
