import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import { app } from '../worker'
import { articles } from '../src/extensions/articles/extension-routes'
import { feedback } from '../src/extensions/feedback/extension'
import { chat } from '../src/extensions/chat/extension'
import { registry } from '../src/core/extensions/registry'
import { testPlatform } from './platform'
import type { Bindings } from '../src/core/settings/bindings'

const host = 'https://desk.example.com'
const site = 'https://shop.example.org'
let p: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
const judge = vi.fn(async () => ({ response: [{ id: 0, score: 0.91 }] }))
beforeAll(async () => {
  p = await testPlatform()
  env = {
    ...p,
    EXTENSIONS: registry([
      {
        extension: articles,
        settings: { helpdeskOrigin: host },
        enabled: true,
      },
      { extension: feedback, settings: {}, enabled: true },
      { extension: chat, settings: { threshold: 0.7 }, enabled: true },
    ]),
    PUBLIC_INTAKES: {
      shop: { publicKey: 'abc', origins: [site], limitPerMinute: 150 },
    },
    AI: { run: judge },
    LOCAL_OPERATOR: 'ops@example.com',
    ENVIRONMENT: 'local',
  } as unknown as Bindings
  await p.DB.batch([
    p.DB.prepare("INSERT INTO products VALUES('shop','Web shop')"),
    p.DB.prepare("INSERT INTO mailboxes VALUES('shop@example.com','shop')"),
  ])
})
afterAll(() => p?.dispose())
function post(name: string, data: Record<string, string>) {
  return app.request(
    host + '/actions/' + name,
    {
      method: 'POST',
      body: new URLSearchParams(data),
      headers: { Origin: host },
    },
    env,
  )
}
function intake(id: string, action: string, payload: object) {
  return app.request(
    host + '/public/' + id + '/shop/' + action,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Origin: site,
        'X-Helpdesk-Key': 'abc',
      },
    },
    env,
  )
}
function read(path: string) {
  return app.request(host + path, {}, env)
}
async function receipt() {
  const response = await intake('feedback', 'submit', {
    email: 'customer@example.org',
    body: 'Please add a printable receipt.',
  })
  expect(response.status).toBe(201)
  return (await response.json<{ number: number }>()).number
}
it('F11-AC1 F11-AC2 F11-AC3: feedback keeps its identity and history when reviewed and converted', async () => {
  const number = String(await receipt())
  expect(
    await p.DB.prepare('SELECT status FROM conversations WHERE number=?')
      .bind(number)
      .first('status'),
  ).toBe('received')
  expect((await post('reply', { number, body: 'Hello' })).status).toBe(409)
  expect((await post('feedback.review', { number })).status).toBe(200)
  expect(
    await p.DB.prepare(
      'SELECT status,reviewed_by FROM conversations WHERE number=?',
    )
      .bind(number)
      .first(),
  ).toEqual({ status: 'reviewed', reviewed_by: 'ops@example.com' })
  expect((await read('/conversation/' + number)).status).toBe(200)
  expect((await post('feedback.convert', { number })).status).toBe(200)
  expect(
    await p.DB.prepare(
      'SELECT kind,status,reviewed_by FROM conversations WHERE number=?',
    )
      .bind(number)
      .first(),
  ).toEqual({ kind: 'inquiry', status: 'open', reviewed_by: null })
  expect((await post('reply', { number, body: 'Thanks' })).status).toBe(303)
})
it('F12-AC1 through F12-AC5: published Markdown, search, drafts, candidate visibility and helpfulness', async () => {
  const article = {
    id: 'receipt',
    product: 'shop',
    title: 'Printable receipt',
    body: '**Print** your receipt. <script>fetch("https://tracker.example")</script>',
    status: 'published',
  }
  for (const row of [
    article,
    { ...article, id: 'secret', title: 'Secret', status: 'draft' },
    { ...article, product: 'other', id: 'foreign', title: 'Foreign' },
  ]) {
    expect((await post('articles.save', row)).status).toBe(200)
  }
  expect(await (await read('/help/articles/shop/?q=print')).text()).toContain(
    'Printable receipt',
  )
  expect(
    await (await read('/help/articles/shop/?q=other')).text(),
  ).not.toContain('Printable receipt')
  for (const id of ['secret', 'foreign'])
    expect((await read('/help/articles/shop/' + id)).status).toBe(404)
  const page = await (await read('/help/articles/shop/receipt')).text()
  expect(page).toContain('<strong>Print</strong>')
  expect(page).not.toContain('tracker.example')
  const token = page.match(/name="visit" value="([^"]+)"/)?.[1]
  expect(token).toBeTruthy()
  const result = await app.request(
    host + '/help/articles/shop/receipt',
    {
      method: 'POST',
      headers: { Origin: host },
      body: new URLSearchParams({ helpful: 'yes', visit: token! }),
    },
    env,
  )
  expect(result.status).toBe(200)
  expect(
    JSON.parse(
      String(
        await p.DB.prepare(
          "SELECT payload FROM events WHERE kind='articles.helpful'",
        ).first('payload'),
      ),
    ),
  ).toMatchObject({
    product: 'shop',
    article: 'receipt',
    helpful: true,
    durationMs: expect.any(Number),
  })
  const library = await (await read('/articles')).text()
  expect(library).toContain('100%')
  expect(library).toContain('評価なし')
  expect(library).toMatch(/<time[^>]+datetime=/)
  const number = String(await receipt())
  await post('feedback.convert', { number })
  expect((await post('articles.attach', { number, id: 'secret' })).ok).toBe(
    false,
  )
  expect(
    (
      await post('articles.attach', {
        number,
        id: 'receipt',
        body: 'Please see this article.',
      })
    ).status,
  ).toBe(200)
  expect(
    await p.DB.prepare(
      "SELECT body FROM messages WHERE number=? AND delivery='draft'",
    )
      .bind(number)
      .first('body'),
  ).toContain(host + '/help/articles/shop/receipt')
  expect(
    (await post('articles.suggest', { number, topic: 'Receipt on Android' }))
      .status,
  ).toBe(200)
  expect(await (await read('/articles/candidates')).text()).toContain(
    'Receipt on Android',
  )
})
it('F13-AC1 F13-AC2: ranks published passages without generating an answer and hands the original question off', async () => {
  await post('articles.save', {
    id: 'receipt',
    title: 'Printable receipt',
    product: 'shop',
    body: 'Instructions',
    status: 'published',
  })
  const payload = {
    email: 'reader@example.net',
    question: '  注文履歴を印刷できますか？\n  ',
  }
  const response = await intake('chat', 'ask', payload)
  expect(response.status).toBe(201)
  expect(await response.json()).toEqual({
    kind: 'show_articles',
    articles: [
      {
        id: 'receipt',
        title: 'Printable receipt',
        url: '/help/articles/shop/receipt',
      },
    ],
  })
  expect(judge).toHaveBeenCalledWith(
    '@cf/baai/bge-reranker-base',
    expect.objectContaining({
      query: payload.question,
      contexts: [{ text: expect.stringContaining('Printable receipt') }],
    }),
  )
  expect(
    await p.DB.prepare(
      "SELECT count(*) n FROM conversations WHERE origin='chat'",
    ).first('n'),
  ).toBe(0)
  judge.mockResolvedValueOnce({ response: [{ id: 0, score: 0.1 }] })
  const receipt = await (
    await intake('chat', 'ask', payload)
  ).json<{ kind: string; number: number }>()
  expect(receipt.kind).toBe('hand_off')
  expect(
    await p.DB.prepare('SELECT body FROM messages WHERE number=?')
      .bind(receipt.number)
      .first('body'),
  ).toBe(payload.question)
  expect(
    await p.DB.prepare(
      'SELECT origin,contact FROM conversations WHERE number=?',
    )
      .bind(receipt.number)
      .first(),
  ).toEqual({ origin: 'chat', contact: payload.email })
})
