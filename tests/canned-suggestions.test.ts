import { afterAll, beforeAll, expect, test, vi } from 'vitest'
import { testPlatform } from './platform'
import {
  cachedTemplates,
  cannedCounts,
  recordCannedUse,
} from '../src/extensions/canned/suggestion-store'
import { replyTemplateChoices } from '../src/extensions/canned/suggestions-usecase'
import { extensionContext } from '../src/core/extensions/context-usecase'
import { canned } from '../src/extensions/canned/extension'
import { chat } from '../src/extensions/chat/extension'
import { registry } from '../src/core/extensions/registry'
import { migrateExtensions } from '../src/core/extensions/migrations-store'
import type { Bindings } from '../src/core/settings/bindings'

let env: Awaited<ReturnType<typeof testPlatform>>
const owner = 'operator@example.com'
const other = 'peer@example.com'

beforeAll(async () => {
  env = await testPlatform()
  const db = env.DB
  await migrateExtensions(
    db,
    registry([{ extension: chat, settings: {}, enabled: true }]).active,
  )
  await db.batch([
    db.prepare(
      "INSERT INTO products(id,name) VALUES('slide','Slide'),('desk','Desk')",
    ),
    db.prepare(
      "INSERT INTO mailboxes(address,product) VALUES('help@example.com','slide')",
    ),
    ...Array.from({ length: 7 }, (_, i) =>
      db
        .prepare(`INSERT INTO conversations(number, product, mailbox, contact, subject, status, created_at)
        VALUES (?,'slide','help@example.com','customer@example.net','領収書について','open',0)`)
        .bind(i + 1),
    ),
    ...Array.from({ length: 7 }, (_, i) =>
      db
        .prepare(
          "INSERT INTO messages(id,number,kind,body,created_at) VALUES (?,?,'inbound','購入履歴を見ても出ません',0)",
        )
        .bind('in-' + (i + 1), i + 1),
    ),
    db.prepare(
      "INSERT INTO messages(id,number,kind,body,created_at) VALUES ('in-5b',5,'inbound','購入先を確認しました',1)",
    ),
  ])
})
afterAll(() => env?.dispose())

test('claims one judgment concurrently and retries after the interrupted lease expires', async () => {
  const started = Promise.withResolvers<void>()
  const old = Promise.withResolvers<string[]>()
  const target = { number: 1, inbound: 'in-1', now: 100 }
  const interrupted = cachedTemplates(env.DB, target, () => {
    started.resolve()
    return old.promise
  })
  await started.promise
  const pendingTarget = {
    number: 1,
    inbound: { number: 1, id: 'in-1' },
    labels: [],
  }
  const pendingJudge = vi.fn<NonNullable<Bindings['judgeArticles']>>()
  const pendingContext = context({ templates: {} }, pendingJudge, false, 101)
  expect(
    await replyTemplateChoices(env.DB, pendingContext, pendingTarget),
  ).toBeNull()
  expect(pendingJudge).not.toHaveBeenCalled()
  const repeated = vi.fn(async () => ['replacement'])
  expect(
    await cachedTemplates(env.DB, { ...target, now: 101 }, repeated),
  ).toEqual([])
  expect(repeated).not.toHaveBeenCalled()

  const ready = await cachedTemplates(
    env.DB,
    { ...target, now: 15_101 },
    repeated,
  )
  expect(ready.map((row) => row.template)).toEqual(['replacement'])
  old.resolve(['expired'])
  expect(await interrupted).toEqual(ready)
  expect(
    await cachedTemplates(env.DB, { ...target, now: 16_000 }, repeated),
  ).toEqual(ready)
  expect(repeated).toHaveBeenCalledTimes(1)
  expect((await cannedCounts(env.DB)).has('expired')).toBe(false)
})

test('releases a failed cache claim immediately for retry', async () => {
  const target = { number: 2, inbound: 'in-2', now: 100 }
  await expect(
    cachedTemplates(env.DB, target, async () => {
      throw new Error('temporary failure')
    }),
  ).rejects.toThrow('temporary failure')
  const retried = await cachedTemplates(env.DB, target, async () => ['retried'])
  expect(retried.map((row) => row.template)).toEqual(['retried'])
})

test('counts one impression and idempotent use per receipt, scoped to the original operator and conversation', async () => {
  const rows = await cachedTemplates(
    env.DB,
    { number: 3, inbound: 'in-3', now: 100 },
    async () => ['used', 'unused'],
  )
  const use = {
    id: crypto.randomUUID(),
    presentation: rows[0].id,
    template: 'used',
    action: 'selected' as const,
  }
  const record = (
    input: Parameters<typeof recordCannedUse>[3],
    operator = owner,
    number = 3,
  ) => recordCannedUse(env.DB, number, operator, input)
  expect(await record(use, owner, 4)).toBe(false)
  expect(await record({ ...use, template: 'missing' })).toBe(false)
  expect(await record(use)).toBe(true)
  expect(await record({ ...use, action: 'edited' }, other)).toBe(false)
  expect(await record({ ...use, template: 'unused' })).toBe(false)
  expect(await record(use)).toBe(true)
  expect(await record({ ...use, action: 'edited' })).toBe(true)
  expect(await record({ ...use, action: 'unchanged' })).toBe(true)

  const peerUse = { ...use, id: crypto.randomUUID() }
  expect(await record({ ...peerUse, action: 'unchanged' }, other)).toBe(true)
  expect(await record(peerUse, other)).toBe(true)
  const counts = await cannedCounts(env.DB)
  expect(counts.get('used')).toMatchObject({
    shown: 1,
    used: 2,
    edited: 1,
    submitted: 2,
  })
  expect(counts.get('unused')).toMatchObject({
    shown: 1,
    used: 0,
    edited: null,
    submitted: 0,
  })
})

function context(
  settings: unknown,
  judgeArticles: NonNullable<Bindings['judgeArticles']>,
  withChat: boolean,
  now = 100,
) {
  const extensions = registry([
    { extension: canned, settings, enabled: true },
    {
      extension: chat,
      settings: { backgroundModel: 'clef' },
      enabled: withChat,
    },
  ])
  return extensionContext(
    {
      env: {
        ...env,
        AI: env.AI as unknown as Ai,
        EXTENSIONS: extensions,
        judgeArticles,
      },
      operator: { email: owner, role: 'admin' },
      actor: { kind: 'operator', id: owner },
      now,
      uuid: () => crypto.randomUUID(),
    },
    extensions.active[0],
  )
}

test('judges only in-scope templates, caches empty results and ignores a missing template until a new inbound', async () => {
  const judge = vi.fn<NonNullable<Bindings['judgeArticles']>>(
    async (_ai, _model, _question, candidates) => ({
      scores: candidates.map(({ id }) => ({ id, score: 0.9 })),
      needsHuman: 0,
    }),
  )
  const initial = {
    templates: {
      receipt: {
        name: '領収書',
        body: '{{name}}、{{product}}です。',
        product: 'slide',
      },
      foreign: { name: '領収書', body: '別窓口', product: 'desk' },
    },
  }
  const newSettings = {
    templates: { next: { name: '購入先', body: '確認します。' } },
  }
  const target = { number: 5, inbound: { number: 5, id: 'in-5' }, labels: [] }
  const emptyTarget = {
    number: 6,
    inbound: { number: 6, id: 'in-6' },
    labels: [],
  }
  expect(
    await replyTemplateChoices(env.DB, context(initial, judge, true), target),
  ).toEqual([
    expect.objectContaining({
      kind: 'canned',
      id: 'receipt',
      body: 'customer@example.net、Slideです。',
    }),
  ])
  expect(judge).toHaveBeenCalledWith(
    expect.anything(),
    'clef',
    '領収書について\n\n購入履歴を見ても出ません',
    [expect.objectContaining({ id: 'receipt' })],
    'customer@example.net',
    'canned',
  )
  expect(
    await replyTemplateChoices(
      env.DB,
      context(newSettings, judge, true),
      target,
    ),
  ).toEqual([])
  expect(
    await replyTemplateChoices(
      env.DB,
      context({ templates: {} }, judge, true),
      emptyTarget,
    ),
  ).toEqual([])
  expect(
    await replyTemplateChoices(
      env.DB,
      context(newSettings, judge, true),
      emptyTarget,
    ),
  ).toEqual([])
  expect(judge).toHaveBeenCalledTimes(1)
  expect(
    await replyTemplateChoices(env.DB, context(newSettings, judge, false), {
      ...target,
      inbound: { number: 5, id: 'in-5b' },
    }),
  ).toEqual([expect.objectContaining({ id: 'next' })])
  expect(judge).toHaveBeenNthCalledWith(
    2,
    expect.anything(),
    'clef-flash',
    '領収書について\n\n購入先を確認しました',
    expect.anything(),
    'customer@example.net',
    'canned',
  )
})

test('keeps fallback results, ordering templates matched on both subject and labels before label-only matches', async () => {
  const unavailable = vi.fn<NonNullable<Bindings['judgeArticles']>>(
    async () => {
      throw new Error('Workers AI timed out')
    },
  )
  const target = {
    number: 7,
    inbound: { number: 7, id: 'in-7' },
    labels: ['領収書', '請求先'],
  }
  const ctx = context(
    {
      templates: {
        bill: { name: '請求先', body: '請求先を確認します。' },
        receipt: { name: '領収書', body: '領収書を確認します。' },
        invite: { name: '招待', body: '招待を確認します。' },
      },
    },
    unavailable,
    false,
  )
  const choices = await replyTemplateChoices(env.DB, ctx, target)
  expect(choices?.map((item) => item.id)).toEqual(['receipt', 'bill'])
  expect(await replyTemplateChoices(env.DB, ctx, target)).toEqual(choices)
  expect(unavailable).toHaveBeenCalledTimes(1)
})
