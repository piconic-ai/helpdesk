import { readFile } from 'node:fs/promises'
import { expect, beforeAll, afterAll, it } from 'vitest'
import { build } from 'vite'
import { Miniflare, convertV4MiniflareOptions } from 'miniflare'
import type { InboundEnv } from './bindings-store'

let runtime: Miniflare
let env: InboundEnv
const fixtures = new URL('./fixtures/', import.meta.url)
beforeAll(async () => {
  const bundle = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      target: 'esnext',
      minify: false,
      write: false,
      lib: {
        entry: 'src/core/inbound/test-worker.ts',
        formats: ['es'],
        fileName: 'worker',
      },
    },
  })
  const output = Array.isArray(bundle) ? bundle[0] : bundle
  if (!('output' in output) || output.output[0].type !== 'chunk')
    throw new Error('Worker bundle unavailable')
  runtime = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script: output.output[0].code,
      compatibilityDate: '2026-11-03',
      compatibilityFlags: ['nodejs_compat'],
      d1Databases: ['DB'],
      r2Buckets: ['RAW'],
      queueProducers: { JOBS: 'inbound' },
      queueConsumers: { inbound: { maxBatchSize: 1, maxBatchTimeout: 0 } },
    }),
  )
  env = await runtime.getBindings<InboundEnv>()
  for (const name of ['0001_core', '0002_inbound']) {
    const sql = await readFile('migrations/' + name + '.sql', 'utf8')
    await env.DB.batch(
      sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => env.DB.prepare(s)),
    )
  }
  for (const name of ['first', 'second']) {
    await env.DB.prepare('INSERT INTO products VALUES (?,?)')
      .bind(name, name)
      .run()
    await env.DB.prepare('INSERT INTO mailboxes VALUES (?,?)')
      .bind(name + '@example.org', name)
      .run()
  }
})
afterAll(async () => runtime?.dispose())

async function deliver(
  raw: string,
  mailbox = 'first',
  from = 'reader@example.org',
) {
  const response = await runtime.dispatchFetch('http://test.local/mail', {
    method: 'POST',
    body: raw,
    headers: {
      'X-Envelope-From': from,
      'X-Envelope-To': mailbox + '@example.org',
    },
  })
  expect(response.status, await response.text()).toBe(202)
}
const fixture = (name: string) =>
  readFile(new URL(name + '.eml', fixtures), 'utf8')
const count = async (table: string) =>
  env.DB.prepare('SELECT count(*) AS n FROM ' + table).first<number>('n')
const waitCount = (table: string, n: number) =>
  expect.poll(() => count(table), { timeout: 8000 }).toBe(n)
const status = (number: number) =>
  env.DB.prepare('SELECT status FROM conversations WHERE number=?')
    .bind(number)
    .first('status')

it('F01-AC1 F01-AC2 F01-AC3 F01-AC8 F01-AC10 assigns distinct numbers and decodes the MIME inside workerd', async () => {
  const raw = await fixture('iso-2022-jp')
  await Promise.all([
    deliver(raw),
    deliver(raw),
    deliver(raw, 'second'),
    deliver(await fixture('shift_jis')),
  ])
  await waitCount('messages', 3)
  const rows = await env.DB.prepare(
    'SELECT product,subject,body FROM conversations JOIN messages USING(number) ORDER BY product',
  ).all()
  expect(
    rows.results.map((r) => [r.product, r.subject, String(r.body).trim()]),
  ).toEqual(
    ['first', 'first', 'second'].map((p) => [
      p,
      '手続きの質問',
      '確認をお願いします。',
    ]),
  )
  await expect.poll(async () => (await env.RAW.list()).objects.length).toBe(3)
})

it('F01-AC4 F01-AC5 F01-AC6 F01-AC23 F01-AC26 F01-AC27 threads only the same contact and mailbox', async () => {
  const raw = await fixture('question')
  await deliver(raw)
  const originalNumber = () =>
    env.DB.prepare(
      "SELECT number FROM messages WHERE message_id='<question@example.org>'",
    ).first<number>('number')
  await expect.poll(originalNumber).toEqual(expect.any(Number))
  const number = await originalNumber()
  if (!number) throw new Error('Missing thread')
  const send = async (
    id: string,
    headers: string,
    from = 'reader@example.org',
  ) => {
    await deliver(
      raw
        .replace('reader@example.org', from)
        .replace('<question@example.org>', '<' + id + '@example.org>')
        .replace('Subject: Question 📨', headers),
      'first',
      from,
    )
    const query = () =>
      env.DB.prepare('SELECT number FROM messages WHERE message_id=?')
        .bind('<' + id + '@example.org>')
        .first('number')
    await expect.poll(query).toEqual(expect.any(Number))
    return query()
  }
  for (const [id, hint] of [
    ['irt', 'In-Reply-To: <question@example.org>'],
    ['refs', 'References: <question@example.org>'],
    ['subject', 'Subject: Re: [#' + number + ']'],
  ]) {
    await env.DB.prepare(
      "UPDATE conversations SET status='closed',closed_at=1 WHERE number=?",
    )
      .bind(number)
      .run()
    expect(await send(id, hint)).toBe(number)
    expect(await status(number)).toBe('open')
  }
  expect(
    await send(
      'different',
      'In-Reply-To: <irt@example.org>',
      'other@example.org',
    ),
  ).not.toBe(number)
  expect(
    await send(
      'foreign-subject',
      'Subject: Re: [#' + number + ']',
      'other@example.org',
    ),
  ).not.toBe(number)
  await env.DB.prepare("UPDATE conversations SET status='spam' WHERE number=?")
    .bind(number)
    .run()
  expect(await send('to-spam', 'In-Reply-To: <irt@example.org>')).toBe(number)
  expect(await status(number)).toBe('spam')
  await env.DB.prepare(
    "UPDATE conversations SET status='pending' WHERE number=?",
  )
    .bind(number)
    .run()
  expect(
    await send(
      'automatic',
      'In-Reply-To: <irt@example.org>\r\nAuto-Submitted: auto-replied',
    ),
  ).toBe(number)
  expect(await status(number)).toBe('pending')
  await env.DB.prepare(`INSERT INTO messages(id,number,kind,delivery,approval,provider_id,created_at,actor,sent_at)
    VALUES ('outgoing',?,'outbound','sent','{"kind":"operator","by":"staff"}','<outbound@example.org>',0,'{"kind":"operator","id":"staff"}',1)`)
    .bind(number)
    .run()
  await deliver(await fixture('bounce'), 'first', '')
  await expect
    .poll(() =>
      env.DB.prepare("SELECT delivery FROM messages WHERE id='outgoing'").first(
        'delivery',
      ),
    )
    .toBe('failed')
  expect(await status(number)).toBe('pending')
  expect(
    await send('human-again', 'In-Reply-To: <irt@example.org>').then(() =>
      status(number),
    ),
  ).toBe('open')
}, 30000)

it('F01-AC7 F01-AC9 keeps unparseable sources for operators and drops unregistered recipients', async () => {
  const before = await count('messages')
  const raw = await fixture('unparseable')
  await deliver(raw)
  await waitCount('inbound_failures', 1)
  const key = await env.DB.prepare(
    'SELECT raw_key FROM inbound_failures',
  ).first<string>('raw_key')
  expect(await (await env.RAW.get(key!))?.text()).toBe(raw)
  await deliver(await fixture('question'), 'missing')
  await deliver((await fixture('unparseable')).replace('malformed', 'invalid'))
  await waitCount('inbound_failures', 2)
  expect(await count('messages')).toBe(before)
})
