import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest'
import { testPlatform } from './platform'
import { intakePolicySchema } from '../src/core/intakes/intake'
import {
  openIntake,
  addInboundMessage,
  saveDraft,
  templateContact,
  verifyIntake,
} from '../src/core/intakes/intake-usecase'
import { approveReply } from '../src/core/outbound/reply-usecase'
let local: Awaited<ReturnType<typeof testPlatform>>
const actor = { kind: 'extension', id: 'form' } as const
const human = { kind: 'operator', id: 'agent@example.com' } as const
const origin = 'https://app.example.com'
const policy = intakePolicySchema.parse({
  publicKey: 'shop-key',
  origins: [origin],
  limitPerMinute: 1,
})
const submission = {
  product: 'shop',
  origin: 'form',
  email: 'user@example.com',
  name: 'Aki',
  subject: 'Question',
  body: 'Can you help?',
}
function req(key = 'shop-key', from = origin, token = 'token') {
  return new Request('https://desk.example/public/form/shop/submit', {
    headers: {
      'X-Helpdesk-Key': key,
      Origin: from,
      'CF-Turnstile-Response': token,
    },
  })
}
beforeAll(async () => {
  local = await testPlatform()
  await local.DB.batch([
    local.DB.prepare("INSERT INTO products VALUES('shop','My Shop')"),
    local.DB.prepare("INSERT INTO mailboxes VALUES('shop@example.com','shop')"),
  ])
})
afterEach(() => vi.unstubAllGlobals())
afterAll(() => local?.dispose())
it('F04-AC2: two simultaneous intakes compete for one window slot; later windows reopen', async () => {
  expect(await verifyIntake(local, 'shop', req('other'), policy, 0)).toBe(false)
  expect(
    await verifyIntake(
      local,
      'shop',
      req('shop-key', 'https://other.example'),
      policy,
      0,
    ),
  ).toBe(false)
  const admission = await Promise.all(
    [1, 2].map(() => verifyIntake(local, 'shop', req(), policy, 0)),
  )
  expect(admission.sort()).toEqual([false, true])
  expect(await verifyIntake(local, 'shop', req(), policy, 60_000)).toBe(true)
})
it('F04-AC2: configured Turnstile requires a successful verification for this hostname', async () => {
  const protectedPolicy = {
    ...policy,
    limitPerMinute: 10,
    turnstileSecretBinding: 'TEST_SECRET',
  }
  const env = { ...local, TEST_SECRET: 'demo-secret' }
  const mock = vi.fn(async () =>
    Response.json({ success: true, hostname: 'app.example.com' }),
  )
  vi.stubGlobal('fetch', mock)
  expect(
    await verifyIntake(local, 'shop', req(), protectedPolicy, 120000),
  ).toBe(false)
  expect(
    await verifyIntake(
      env,
      'shop',
      req('shop-key', origin, ''),
      protectedPolicy,
      120000,
    ),
  ).toBe(false)
  expect(mock).not.toHaveBeenCalled()
  expect(await verifyIntake(env, 'shop', req(), protectedPolicy, 120000)).toBe(
    true,
  )
  const opts = mock.mock.calls.at(0) as unknown as [string, RequestInit]
  expect(opts[0]).toBe(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  )
  expect(String(opts[1].body)).toBe('secret=demo-secret&response=token')
  for (const result of [
    { success: false },
    { success: true, hostname: 'other.example' },
  ]) {
    mock.mockResolvedValueOnce(Response.json(result))
    expect(
      await verifyIntake(env, 'shop', req(), protectedPolicy, 120000),
    ).toBe(false)
  }
  mock.mockRejectedValueOnce(new Error('Unavailable'))
  expect(await verifyIntake(env, 'shop', req(), protectedPolicy, 120000)).toBe(
    false,
  )
})
it('F04-AC1: the core writes a conversation, inbound text and events in one D1 batch', async () => {
  const { number } = await openIntake(local, submission, actor, 100)
  expect(await templateContact(local, number)).toEqual({
    name: 'Aki',
    productName: 'My Shop',
    reference: 'AAAAA-' + number,
    language: 'ja',
    subject: 'Question',
    email: 'user@example.com',
    mailbox: 'shop@example.com',
    status: 'open',
    product: 'shop',
  })
  await local.DB.prepare(
    "UPDATE conversations SET status='closed',closed_at=100 WHERE number=?",
  )
    .bind(number)
    .run()
  await addInboundMessage(local, number, 'Another detail', actor, 101)
  expect(
    await local.DB.prepare('SELECT status FROM conversations WHERE number=?')
      .bind(number)
      .first('status'),
  ).toBe('open')
  const events = await local.DB.prepare(
    'SELECT kind FROM events WHERE number=? ORDER BY id',
  )
    .bind(number)
    .all()
  expect(events.results.map((x) => x.kind)).toEqual([
    'conversation_opened',
    'message_received',
    'message_received',
    'status_changed',
  ])
  await expect(
    openIntake(local, { ...submission, product: 'missing' }, actor, 102),
  ).rejects.toThrow()
  expect(
    await local.DB.prepare('SELECT count(*) n FROM conversations').first('n'),
  ).toBe(1)
})
it('drafting for a resolved issue is idempotent and explicit approval is required for dispatch', async () => {
  const { number } = await openIntake(local, submission, actor, 123)
  await local.DB.prepare(
    "UPDATE conversations SET status='closed',closed_at=123 WHERE number=?",
  )
    .bind(number)
    .run()
  const drafts = await Promise.all(
    [1, 2].map(() =>
      saveDraft(local, number, 'Signed off', human, 124, 'issues/closed/4'),
    ),
  )
  expect(drafts[0].id).toBe(drafts[1].id)
  expect(
    await local.DB.prepare('SELECT count(*) n FROM outbox').first('n'),
  ).toBe(0)
  expect(
    await local.DB.prepare(
      "SELECT count(*) n FROM events WHERE number=? AND kind='reply_drafted'",
    )
      .bind(number)
      .first('n'),
  ).toBe(1)
  await local.DB.prepare(
    "UPDATE conversations SET status='open',closed_at=NULL WHERE number=?",
  )
    .bind(number)
    .run()
  await approveReply(local, { id: drafts[0].id, actor: human, now: 125 })
  expect(
    await local.DB.prepare('SELECT message FROM outbox').first('message'),
  ).toBe(drafts[0].id)
})
