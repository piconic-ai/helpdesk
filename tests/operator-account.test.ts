import { PNG } from 'pngjs'
import jpeg from 'jpeg-js'
import { queueReply, deliverReply } from '../src/core/outbound/reply-usecase'
import type { EmailPayload } from '../src/core/outbound/send-client'
import { beforeAll, afterAll, it, expect } from 'vitest'
import { app } from '../worker'
import { testPlatform } from './platform'
import type { Bindings } from '../src/core/settings/bindings'

const origin = 'http://account.local'
let platform: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
beforeAll(async () => {
  platform = await testPlatform()
  env = {
    ...platform,
    ENVIRONMENT: 'local',
    LOCAL_OPERATOR: 'agent@example.org',
  } as unknown as Bindings
  await platform.DB.batch([
    platform.DB.prepare(
      "INSERT INTO operators VALUES('admin@example.org','admin'),('agent@example.org','agent')",
    ),
    platform.DB.prepare("INSERT INTO products VALUES('studio','Studio')"),
    platform.DB.prepare(
      "INSERT INTO mailboxes VALUES('help@example.org','studio')",
    ),
  ])
})
afterAll(() => platform?.dispose())
function save(file: File) {
  const form = new FormData()
  form.set('displayName', '山本 花')
  form.set('avatar', file)
  return app.request(
    origin + '/account',
    { method: 'POST', headers: { Origin: origin }, body: form },
    env,
  )
}
const samplePng = new Uint8Array(
  PNG.sync.write(new PNG({ width: 1, height: 1 })),
)
it.each([
  new File(['not an image'], 'image.png', { type: 'image/png' }),
  new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.png', {
    type: 'image/png',
  }),
  new File([samplePng], 'forged.jpg', {
    type: 'image/jpeg',
  }),
  new File([samplePng], 'forged.png', { type: 'image/jpeg' }),
  new File([samplePng], 'forged.txt', { type: 'image/png' }),
])(
  'rejects invalid uploaded image $name before changing the operator profile',
  async (file) => {
    const result = await save(file)
    expect([400, 413]).toContain(result.status)
    expect(
      await platform.DB.prepare('SELECT display_name FROM operator_profiles')
        .all()
        .then((r) => r.results),
    ).toEqual([])
  },
)

it('serves only a square re-encoded avatar, preserves it on rename, and rejects cross-origin changes', async () => {
  const image = new PNG({ width: 240, height: 96 })
  for (let y = 0; y < 96; y++)
    for (let x = 0; x < 240; x++) {
      const inside = x >= 72 && x < 168
      image.data.set([inside ? 12 : 255, 34, 56, 255], (y * 240 + x) * 4)
    }
  const file = new File([new Uint8Array(PNG.sync.write(image))], 'photo.png', {
    type: 'image/png',
  })
  expect((await save(file)).status).toBe(303)
  const current = await platform.DB.prepare(
    'SELECT avatar_key FROM operator_profiles WHERE email=?',
  )
    .bind('agent@example.org')
    .first<string>('avatar_key')
  expect(current).toBeTruthy()
  const response = await app.request(
    origin + '/account/avatar/' + current,
    {},
    env,
  )
  expect(response.headers.get('content-type')).toBe('image/png')
  expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  const restored = PNG.sync.read(Buffer.from(await response.arrayBuffer()))
  expect([restored.width, restored.height]).toEqual([96, 96])
  expect([...new Set(restored.data)]).toEqual([12, 34, 56, 255])
  const rename = new URLSearchParams({
    displayName: '森 小春',
    email: 'admin@example.org',
  })
  const request = (from: string) =>
    app.request(
      origin + '/account',
      { method: 'POST', headers: { Origin: from }, body: rename },
      env,
    )
  expect((await request('https://external.example')).status).toBe(403)
  expect((await request(origin)).status).toBe(303)
  expect(
    await platform.DB.prepare(
      "SELECT display_name,avatar_key FROM operator_profiles WHERE email='agent@example.org'",
    ).first(),
  ).toEqual({ display_name: '森 小春', avatar_key: current })
  expect(
    await platform.DB.prepare(
      "SELECT * FROM operator_profiles WHERE email='admin@example.org'",
    ).first(),
  ).toBe(null)
  expect(
    (await app.request(origin + '/account/avatar/not-a-key', {}, env)).status,
  ).toBe(404)
  expect(
    (
      await app.request(
        origin + '/account/avatar/' + current,
        {},
        { ...env, ENVIRONMENT: 'production', LOCAL_OPERATOR: undefined },
      )
    ).status,
  ).toBe(401)
  const jpg = jpeg.encode(
    {
      width: 2,
      height: 1,
      data: Buffer.from([0, 0, 255, 255, 0, 0, 255, 255]),
    },
    90,
  )
  expect(
    (
      await save(
        new File([new Uint8Array(jpg.data)], 'photo.jpg', {
          type: 'image/jpeg',
        }),
      )
    ).status,
  ).toBe(303)
  expect(
    (await app.request(origin + '/account/avatar/' + current, {}, env)).status,
  ).toBe(404)
})

it('sends the configured product From name; human identity is opt-in and fixed when the operator approves', async () => {
  const admin = { ...env, LOCAL_OPERATOR: 'admin@example.org' }
  const sender = (show: boolean, bindings: Bindings = admin) =>
    app.request(
      origin + '/settings/senders/studio',
      {
        method: 'POST',
        headers: { Origin: origin },
        body: new URLSearchParams({
          senderName: 'Studio サポート',
          ...(show ? { showOperator: 'on' } : {}),
        }),
      },
      bindings,
    )
  expect((await sender(true, env)).status).toBe(403)
  expect((await sender(false)).status).toBe(303)
  const number = await platform.DB.prepare(
    "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES('studio','help@example.org','client@example.org','Help','open',1) RETURNING number",
  ).first<number>('number')
  const actor = { kind: 'operator' as const, id: 'agent@example.org' }
  const queue = () =>
    queueReply(env, { number: number!, actor, now: 10, body: 'Thank you' })
  expect(
    (
      await app.request(
        origin + '/account',
        {
          method: 'POST',
          headers: { Origin: origin },
          body: new URLSearchParams({ displayName: '山本 花' }),
        },
        env,
      )
    ).status,
  ).toBe(303)
  const first = await queue()
  expect((await sender(true)).status).toBe(303)
  const second = await queue()
  const posted: EmailPayload[] = []
  const deliver = (id: string) =>
    deliverReply(
      {
        DB: env.DB,
        EMAIL: {
          async send(payload) {
            posted.push(payload)
            return { messageId: 'sample@example.org' }
          },
        },
      },
      id,
      20,
    )
  await deliver(first.id)
  await deliver(second.id)
  expect(posted.map((p) => p.from)).toEqual([
    { email: 'help@example.org', name: 'Studio サポート' },
    { email: 'help@example.org', name: 'Studio サポート · 山本 花' },
  ])
  const page = await app.request(origin + '/conversation/' + number, {}, env)
  expect(await page.text()).toContain('Studio サポート · 山本 花')
})
