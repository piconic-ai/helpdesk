import { afterAll, beforeAll, expect, it } from 'vitest'
import fc from 'fast-check'
import { testPlatform } from './platform'
import { configure } from '../src/core/extensions/registry-usecase'
import { invoke } from '../src/core/operations/runtime-usecase'
import type { Context, Scope } from '../src/core/operations/catalog-usecase'
import { snooze } from '../src/extensions/snooze/extension'
import { merge } from '../src/extensions/merge/extension'
import { presence } from '../src/extensions/presence/extension'
import { rules, matches } from '../src/extensions/rules/extension'
import { deliverReply, queueReply } from '../src/core/outbound/reply-usecase'
import { inboundJob } from '../src/core/inbound/job'
import { ingest } from '../src/core/inbound/inbound-usecase'
import {
  enqueueEvents,
  deliverEvent,
} from '../src/core/extensions/dispatch-usecase'
import type { Bindings } from '../src/core/settings/bindings'
import { app } from '../worker'
import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'

let local: Awaited<ReturnType<typeof testPlatform>>
let ctx: Context
const owner = 'staff@example.com',
  other = 'teammate@example.com'
const scopes = new Set<Scope>(['read', 'write', 'draft', 'send', 'admin'])
const entries = [snooze, merge, presence, rules].map((extension) => ({
  extension,
  enabled: true,
  settings:
    extension.id === 'rules'
      ? {
          rules: [
            {
              subjectContains: 'receipt',
              product: 'shop',
              label: 'billing',
              assignee: other,
            },
          ],
        }
      : {},
}))
const run = (name: string, input: unknown, c = ctx) =>
  invoke(c, scopes, name, input)
beforeAll(async () => {
  local = await testPlatform()
  await local.DB.batch([
    local.DB.prepare("INSERT INTO products VALUES('shop','Shop')"),
    local.DB.prepare("INSERT INTO mailboxes VALUES('shop@example.com','shop')"),
    local.DB.prepare("INSERT INTO operators VALUES(?,'admin')").bind(owner),
    local.DB.prepare("INSERT INTO operators VALUES(?,'agent')").bind(other),
    local.DB.prepare(
      "INSERT INTO product_members VALUES('shop',?,'agent')",
    ).bind(other),
  ])
  const env = await configure(
    {
      ...local,
      ENVIRONMENT: 'local',
      LOCAL_OPERATOR: owner,
    } as unknown as Bindings,
    entries,
    {},
  )
  ctx = {
    env,
    actor: { kind: 'operator', id: owner },
    operator: { email: owner, role: 'admin' },
    now: Date.now(),
    uuid: () => crypto.randomUUID(),
  }
})
afterAll(() => local?.dispose())
async function receive(
  subject: string,
  text: string,
  email = 'someone@example.com',
  headers = '',
) {
  const id = crypto.randomUUID(),
    to = 'shop@example.com',
    key = 'raw/' + id
  const body =
    'From: ' +
    email +
    '\r\nTo: ' +
    to +
    '\r\nMessage-ID: <' +
    id +
    '@example.com>\r\nSubject: ' +
    subject +
    '\r\n' +
    headers +
    '\r\n' +
    text
  await local.RAW.put(key, body)
  await ingest(
    ctx.env,
    inboundJob.parse({
      kind: 'inbound',
      to,
      from: email,
      rawKey: key,
      receivedAt: ctx.now,
    }),
  )
  const n = await local.DB.prepare('SELECT number FROM messages WHERE id=?')
    .bind(id)
    .first<number>('number')
  if (!n) throw new Error('Missing received mail')
  return { number: n, id }
}
it('F17-AC1..3 folds conversation history, routes old subject and header, isolates contacts and rejects loops', async () => {
  const first = await receive('Paper question', 'First text'),
    second = await receive('Paper details', 'Second text'),
    alien = await receive('Other person', 'Other', 'alien@example.org')
  await expect(
    run('merge.combine', { number: first.number, target: alien.number }),
  ).rejects.toThrow(/sender/)
  await run('merge.combine', { number: first.number, target: second.number })
  await expect(
    run('merge.combine', { number: second.number, target: first.number }),
  ).rejects.toThrow(/cyclic/i)
  expect(
    (await receive('Re: [#' + first.number + ']', 'Extra detail')).number,
  ).toBe(second.number)
  expect(
    (
      await receive(
        'Re: Paper',
        'New body',
        'someone@example.com',
        'In-Reply-To: <' + first.id + '@example.com>\r\n',
      )
    ).number,
  ).toBe(second.number)
  const visible = await run('list', {})
  expect(visible).not.toContainEqual(
    expect.objectContaining({ number: first.number }),
  )
  expect(await run('list', { query: 'First text' })).toContainEqual(
    expect.objectContaining({ number: second.number }),
  )
  const read = await run('get', { number: second.number })
  expect(read).toMatchObject({
    messages: expect.arrayContaining(
      ['First text', 'Second text', 'New body'].map((body) =>
        expect.objectContaining({ body: body + '\n' }),
      ),
    ),
  })
})
it('F18-AC1..2 applies only matching rules once through event delivery', async () => {
  const yes = await receive('Receipt request', 'Need a receipt'),
    no = await receive('Help', 'Need help')
  await enqueueEvents(ctx.env, ctx.now)
  for (const n of [yes.number, no.number]) {
    const event = await local.DB.prepare(
      "SELECT id FROM events WHERE number=? AND kind='conversation_opened'",
    )
      .bind(n)
      .first<number>('id')
    await deliverEvent(ctx.env, 'rules', event!, ctx.now)
    await deliverEvent(ctx.env, 'rules', event!, ctx.now)
  }
  const r = await run('get', { number: yes.number })
  expect(r).toMatchObject({
    conversation: { assignment: { kind: 'assigned', to: other } },
    labels: [{ name: 'billing' }],
  })
  expect(await run('get', { number: no.number })).toMatchObject({
    conversation: { assignment: { kind: 'unassigned' } },
    labels: [],
  })
  expect(
    await local.DB.prepare(
      "SELECT count(*) n FROM messages WHERE kind='outbound' AND number IN (?,?)",
    )
      .bind(yes.number, no.number)
      .first('n'),
  ).toBe(0)
  expect(
    matches(
      { product: 'other', label: 'x' },
      { product: 'shop', subject: 'receipt' },
    ),
  ).toBe(false)
})
it('F19-AC1..3 other operators can read and reply while a colleague is typing; leases expire', async () => {
  const { number } = await receive('Shared inquiry', 'Follow up')
  const colleague: Context = {
    ...ctx,
    actor: { kind: 'operator', id: other },
    operator: { email: other, role: 'agent', memberships: { shop: 'agent' } },
  }
  const data = { number, tab: crypto.randomUUID(), mode: 'reading' }
  expect(await run('presence.heartbeat', data)).toEqual([])
  expect(await run('presence.heartbeat', data, colleague)).toMatchObject([
    { email: owner, mode: 'reading' },
  ])
  await run('presence.heartbeat', { ...data, mode: 'typing' })
  expect(await run('presence.heartbeat', data, colleague)).toMatchObject([
    { email: owner, mode: 'typing' },
  ])
  await expect(
    run('reply', { number, body: 'Reply from teammate' }, colleague),
  ).resolves.toMatchObject({ id: expect.any(String) })
  expect(
    await run('presence.heartbeat', data, {
      ...colleague,
      now: ctx.now + 46_000,
    }),
  ).toEqual([])
})
it('F16-AC1..3 matches the receive, reply, close, reopen, merge and snooze model', async () => {
  type Model = {
    status: 'open' | 'pending' | 'closed'
    snoozed: boolean
    merged: boolean
  }
  type System = { number: number; duplicate: number }
  const ops = [
    'reply',
    'close',
    'receive',
    'merge',
    'snooze',
    'resume',
    'wake',
  ] as const
  const command = (
    op: (typeof ops)[number],
  ): fc.AsyncCommand<Model, System> => ({
    check(m) {
      if (op === 'reply') return m.status !== 'closed'
      if (op === 'close') return m.status !== 'closed'
      if (op === 'merge') return !m.merged
      return true
    },
    async run(m, r) {
      switch (op) {
        case 'reply': {
          const { id } = (await run('reply', {
            number: r.number,
            body: 'Reply',
          })) as { id: string }
          expect(await deliverReply(local, id, ctx.now)).toBe(10)
          ctx.now += 10000
          await deliverReply(local, id, ctx.now)
          m.status = 'pending'
          break
        }
        case 'close':
          await run('status', { number: r.number, event: 'closed' })
          m.status = 'closed'
          break
        case 'merge':
          await run('merge.combine', { number: r.duplicate, target: r.number })
          m.merged = true
          break
        case 'receive':
          expect(
            (
              await receive(
                'Re: [#' + (m.merged ? r.duplicate : r.number) + ']',
                'Follow up',
              )
            ).number,
          ).toBe(r.number)
          m.status = 'open'
          break
        case 'snooze':
          await run('snooze.defer', {
            number: r.number,
            until: new Date(ctx.now + 60000).toISOString(),
          })
          m.snoozed = true
          break
        case 'resume':
          await run('snooze.resume', { number: r.number })
          m.snoozed = false
          break
        case 'wake':
          ctx.now += 60000
          m.snoozed = false
          break
      }
      const list = (await run('list', {})) as { number: number }[]
      expect(list.some((c) => c.number === r.number)).toBe(
        m.status === 'open' && !m.snoozed,
      )
      expect(list.some((c) => c.number === r.duplicate)).toBe(!m.merged)
      expect(await run('get', { number: r.number })).toMatchObject({
        conversation: { status: { kind: m.status } },
      })
    },
    toString: () => op,
  })
  await fc.assert(
    fc.asyncProperty(
      fc.commands([fc.constantFrom(...ops).map(command)], { maxCommands: 12 }),
      async (commands) => {
        const { number } = await receive('Model test', 'First question')
        const duplicate = (await receive('Model duplicate', 'Second question'))
          .number
        await fc.asyncModelRun(
          () => ({
            model: { status: 'open', snoozed: false, merged: false } as Model,
            real: { number, duplicate },
          }),
          commands,
        )
      },
    ),
    { numRuns: 8 },
  )
  const { number } = await receive('Deferred', 'A timed question')
  await run('snooze.defer', {
    number,
    until: new Date(ctx.now + 1000).toISOString(),
  })
  expect(await run('list', {})).not.toContainEqual(
    expect.objectContaining({ number }),
  )
  expect(await run('list', {}, { ...ctx, now: ctx.now + 1000 })).toContainEqual(
    expect.objectContaining({ number }),
  )
  await run('snooze.resume', { number })
  expect(await run('list', {})).toContainEqual(
    expect.objectContaining({ number }),
  )
}, 30000)
it('F19-AC1..3 Chromium reports reading and typing through the actual presence panel', async () => {
  const { number } = await receive('Presence check', 'Question')
  const host = 'http://localhost'
  const browser = await chromium.launch()
  try {
    const pages = await Promise.all(
      [owner, other].map(async (email) => {
        const page = await browser.newPage()
        const localEnv = { ...ctx.env, LOCAL_OPERATOR: email }
        await page.route(host + '/**', async (route) => {
          const req = route.request(),
            url = new URL(req.url())
          if (
            url.pathname.startsWith('/extension-assets/') ||
            url.pathname.startsWith('/components/')
          )
            return route.fulfill({
              contentType: 'application/javascript',
              body: await readFile('public' + url.pathname),
            })
          if (url.pathname.endsWith('.css'))
            return route.fulfill({ contentType: 'text/css', body: '' })
          const response = await app.request(
            req.url(),
            {
              method: req.method(),
              body: req.postData() ?? undefined,
              headers: await req.allHeaders(),
            },
            localEnv,
          )
          return route.fulfill({
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: await response.text(),
          })
        })
        await page.goto(host + '/conversation/' + number)
        return page
      }),
    )
    const first = pages[0],
      second = pages[1]
    await first.getByText(other + '（閲覧中）').waitFor({ timeout: 10000 })
    await second
      .getByLabel('返信', { exact: true })
      .fill('A draft that stays in this browser')
    await first.getByText(other + '（入力中）').waitFor({ timeout: 10000 })
    expect(
      await first
        .getByRole('button', { name: '送信', exact: true })
        .isEnabled(),
    ).toBe(true)
  } finally {
    await browser.close()
  }
}, 30000)

it('keeps each operator’s send controls on their own scheduled reply across navigation', async () => {
  const { number } = await receive(
    'Scheduled replies',
    'Can you confirm the update?',
  )
  const now = Date.now()
  const reps = await Promise.all(
    [owner, other].map((id, index) =>
      queueReply(ctx.env, {
        number,
        body: 'Update from ' + id,
        actor: { kind: 'operator', id },
        undoable: true,
        now: now + index,
      }),
    ),
  )
  const view = async (email: string, query = '') => {
    const response = await app.request(
      'http://desk.test/conversation/' + number + query,
      {},
      { ...ctx.env, LOCAL_OPERATOR: email },
    )
    expect(response.status).toBe(200)
    return response.text()
  }
  const toast = (html: string) =>
    html.match(
      /<form\b[^>]*data-toast[^>]*data-undo-reply[^>]*>[\s\S]*?<\/form>/,
    )?.[0]
  for (const [index, email] of [owner, other].entries()) {
    const html = await view(email)
    expect(toast(html)).toContain(reps[index].id)
    expect(html.match(/aria-label="この返信の送信予定"/g)).toHaveLength(2)
  }
  const withReceipt = await view(owner, '?notice=note')
  expect(withReceipt).toContain('内部メモを保存しました。')
  expect(toast(withReceipt)).toBeUndefined()
})
