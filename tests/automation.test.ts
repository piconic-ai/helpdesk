import { publicRoutes } from '../src/core/extensions/public-routes'
import { beforeAll, afterAll, it, expect, vi } from 'vitest'
import { testPlatform } from './platform'
import { configure } from '../src/core/extensions/registry-usecase'
import { registry } from '../src/core/extensions/registry'
import { extensionContext } from '../src/core/extensions/context-usecase'
import { deliverReply, queueStanding } from '../src/core/outbound/reply-usecase'
import { autoAck } from '../src/extensions/auto-ack/extension'
import { spam } from '../src/extensions/spam/extension'
import { notify } from '../src/extensions/notify/extension'
import { metrics } from '../src/extensions/metrics/extension'
import { survey } from '../src/extensions/survey/extension-routes'
import { metricExamples as events } from '../src/extensions/metrics/metrics.examples'
import { calculate } from '../src/extensions/metrics/calculate'
import type { Context } from '../src/core/operations/catalog-usecase'
import type {
  Extension,
  ExtensionEvent,
} from '../src/core/extensions/extension'
import type { Bindings } from '../src/core/settings/bindings'

let p: Awaited<ReturnType<typeof testPlatform>>
let ctx: Context
const admin = 'op@example.com'
const sent: { headers: Record<string, string>; to: string; text: string }[] = []
const receive = {
  id: 4,
  at: 10,
  kind: 'message_received',
  number: 1,
  payload: { category: 'human', first: true, message: 'mail' },
  actor: { kind: 'system' },
}
beforeAll(async () => {
  p = await testPlatform()
  await p.DB.batch([
    p.DB.prepare("INSERT INTO operators VALUES(?,'admin')").bind(admin),
    p.DB.prepare("INSERT INTO products VALUES('shop','Shop')"),
    p.DB.prepare("INSERT INTO mailboxes VALUES('mail@example.com','shop')"),
    p.DB.prepare(
      "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES('shop','mail@example.com','reader@example.com','Printer','open',1)",
    ),
    p.DB.prepare(
      "INSERT INTO messages(id,number,kind,body,created_at) VALUES('mail',1,'inbound','private customer content',1)",
    ),
  ])
  const entries = [spam, notify, autoAck, metrics, survey].map((extension) => ({
    extension,
    settings:
      extension === survey ? { helpdeskOrigin: 'https://desk.example' } : {},
    enabled: true,
  }))
  const env = await configure(
    {
      ...p,
      EXTENSIONS: registry(
        entries,
        new Map(
          entries.map((e) => [e.extension.id, { by: admin, enabled: true }]),
        ),
      ),
      NOTIFY_WEBHOOK_URL: 'https://hooks.example.net/notify',
    } as unknown as Bindings,
    entries,
    {},
  )
  ctx = {
    env,
    actor: { kind: 'operator', id: admin },
    operator: { role: 'admin', email: admin },
    now: 10,
    uuid: () => crypto.randomUUID(),
  }
})
afterAll(() => p?.dispose())
function context(ext: Extension, settings?: unknown) {
  const item = ctx.env.EXTENSIONS!.active.find((i) => i.extension === ext)!
  return extensionContext(ctx, { ...item, settings: settings ?? item.settings })
}
async function run(ext: Extension, e: ExtensionEvent, settings?: unknown) {
  await ext
    .subscribers!.find((s) => s.kind === e.kind)!
    .run(context(ext, settings), e)
}
const count = () =>
  p.DB.prepare('SELECT count(*) n FROM standing_messages').first<number>('n')
async function send(id: string) {
  await deliverReply(
    {
      DB: p.DB,
      EMAIL: {
        async send(message) {
          sent.push(message)
          return { messageId: 'external@example.com' }
        },
      },
    },
    id,
    20,
  )
}
it('F07-AC1/2 F09-AC2 rejects automatic, bounced, non-first and quarantined mail before any acknowledgment can race quarantine', async () => {
  for (const payload of [
    { category: 'automatic', first: true },
    { category: 'bounce', first: true },
    { category: 'human', first: false },
    {
      category: 'human',
      first: true,
      authentication: 'mx.cloudflare.net; dmarc=fail',
    },
  ])
    await run(autoAck, { ...receive, payload })
  expect(await count()).toBe(0)
  await run(spam, {
    ...receive,
    payload: { authentication: 'mx.cloudflare.net; spf=fail' },
  })
  expect(
    await p.DB.prepare('SELECT status FROM conversations WHERE number=1').first(
      'status',
    ),
  ).toBe('spam')
  await run(autoAck, receive)
  expect(await count()).toBe(0)
  await context(spam).change(1, 'unmarked_spam')
  expect(
    await p.DB.prepare('SELECT status FROM conversations WHERE number=1').first(
      'status',
    ),
  ).toBe('open')
})
it('F09-AC1/3 sends one numbered auto acknowledgment with a standing approval and keeps the inbox open', async () => {
  await Promise.all([run(autoAck, receive), run(autoAck, receive)])
  expect(await count()).toBe(1)
  const row = await p.DB.prepare(
    "SELECT id,approval FROM messages WHERE delivery='queued'",
  ).first<{ id: string; approval: string }>()
  expect(JSON.parse(row!.approval)).toEqual({
    kind: 'standing',
    policy: 'auto-ack',
    enabledBy: admin,
  })
  await send(row!.id)
  expect(sent.at(-1)).toMatchObject({
    to: 'reader@example.com',
    text: expect.stringMatching(/automated.*\[AAAAA-1\]/),
    headers: { 'Auto-Submitted': 'auto-generated' },
  })
  expect(
    await p.DB.prepare('SELECT status FROM conversations WHERE number=1').first(
      'status',
    ),
  ).toBe('open')
})
it('F08-AC1/2/3 uses safe webhook defaults and sends mail only to registered operators', async () => {
  const calls: unknown[] = []
  const spy = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (_url, init) => {
      calls.push(JSON.parse(String(init?.body)))
      return new Response(null, { status: 204 })
    })
  try {
    await run(notify, receive, {})
    expect(calls[0]).toMatchObject({ text: 'AAAAA-1 Printer' })
    await run(
      notify,
      { ...receive, kind: 'assigned', payload: { to: admin } },
      { format: 'discord', includeBody: true, email: admin },
    )
    expect(calls[1]).toMatchObject({
      content: 'AAAAA-1 Printer\nprivate customer content',
      allowed_mentions: { parse: [] },
    })
    const id = await p.DB.prepare(
      'SELECT message FROM standing_messages WHERE operator_recipient=?',
    )
      .bind(admin)
      .first<string>('message')
    await send(id!)
    expect(sent.at(-1)?.to).toBe(admin)
    await expect(
      queueStanding(ctx.env, {
        number: 1,
        body: 'Private',
        policy: 'notify',
        enabledBy: admin,
        key: 'bad',
        now: 11,
        operatorRecipient: 'stranger@example.org',
      }),
    ).rejects.toThrow(/Invalid recipient/)
  } finally {
    spy.mockRestore()
  }
})
it('delivers a project notification only to the webhook chosen for that project', async () => {
  const url = 'https://hooks.example.net/project-a'
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(null, { status: 204 }))
  try {
    ctx.env.NOTIFY_PROJECT_WEBHOOKS = JSON.stringify({
      shop: url,
      other: 'https://hooks.example.net/other',
    })
    await run(notify, receive, { projects: { other: { format: 'discord' } } })
    expect(fetch).not.toHaveBeenCalled()
    await run(notify, receive, { projects: { shop: { format: 'discord' } } })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe(url)
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toHaveProperty(
      'content',
    )
  } finally {
    delete ctx.env.NOTIFY_PROJECT_WEBHOOKS
    fetch.mockRestore()
  }
})

it('F14-AC1/2 asks once and records one answer for a private ticket', async () => {
  await p.DB.prepare(
    "UPDATE conversations SET status='closed',closed_at=30 WHERE number=1",
  ).run()
  const closed = {
    ...receive,
    id: 30,
    kind: 'status_changed',
    payload: { to: 'closed' },
  }
  await run(survey, closed)
  await run(survey, closed)
  const row = await p.DB.prepare(
    "SELECT id,body FROM messages WHERE json_extract(actor,'$.id')='survey'",
  ).first<{ id: string; body: string }>()
  const url = new URL(row!.body.split(' ').at(-1)!)
  expect(url.origin).toBe('https://desk.example')
  const token = url.pathname.split('/').at(-1)!
  const api = context(survey)
  expect(
    await survey.publicPage!(api, 'shop', token, new URLSearchParams()),
  ).toMatchObject({ html: expect.stringContaining('method="post"') })
  expect(
    await survey.publicPage!(api, 'other', token, new URLSearchParams()),
  ).toBeNull()
  const page = await publicRoutes.request(url.href, {}, ctx.env)
  expect(page.status).toBe(200)
  expect(await page.text()).toContain('問い合わせは解決しましたか？')
  expect(
    (
      await publicRoutes.request(
        url.href,
        {
          method: 'POST',
          headers: { origin: 'https://other.example' },
          body: new URLSearchParams({ resolved: 'yes' }),
        },
        ctx.env,
      )
    ).status,
  ).toBe(403)
  for (const answer of ['no', 'yes']) {
    const request = new Request(url, {
      method: 'POST',
      body: new URLSearchParams({ resolved: answer }),
    })
    request.headers.set('Origin', url.origin)
    const response = await publicRoutes.fetch(request, ctx.env)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('ご回答ありがとうございます')
  }
  const events = (await api.events()).filter(
    (e) => e.kind === 'survey.answered',
  )
  expect(events).toHaveLength(1)
  expect(events[0].payload).toMatchObject({ resolved: false, product: 'shop' })
  await send(row!.id)
  expect(sent.at(-1)?.text).toContain('お問い合わせは解決しましたか？')
})
it('F10-AC1/2/3 calculates product and period cohorts with article resolutions, survey feedback and human-only time', () => {
  expect(calculate(events, 'shop', 10, 18)).toEqual({
    resolutionMs: 20 / 3,
    firstContactRate: 0,
    operatorMs: 3,
    resolved: 3,
    closed: 2,
    measured: 1,
  })
  expect(calculate(events, 'shop', 11, 13)).toMatchObject({
    resolutionMs: 6,
    firstContactRate: null,
    operatorMs: null,
  })
})

it('F10-AC1 counts an article resolution at voting time after the subscriber retries', async () => {
  const event = {
    ...receive,
    kind: 'articles.helpful',
    number: null,
    payload: { product: 'shop', helpful: true, durationMs: 7 },
    at: 20,
    id: 99,
  }
  await run(metrics, event)
  await run(metrics, event)
  const result = await metrics.operations![0].run(context(metrics), {
    product: 'shop',
    from: 20,
    to: 21,
  })
  expect(result).toMatchObject({ resolutionMs: 7, resolved: 1, closed: 0 })
})
