import { beforeAll, afterAll, test, expect, vi } from 'vitest'
import { testPlatform } from '../../../tests/platform'
import type { Bindings } from '../../core/settings/bindings'
import { registry } from '../../core/extensions/registry'
import { extensionContext } from '../../core/extensions/context-usecase'
import { deliverEvent, tick } from '../../core/extensions/dispatch-usecase'
import { invoke, describe } from '../../core/operations/runtime-usecase'
import type { Context, Scope } from '../../core/operations/catalog-usecase'
import { issues } from './extension-usecase'
import { preview } from './issues'
import { panelLinks } from './issues-usecase'
import { issueBoard, synchronizeIssue } from './board-usecase'

const repo = 'acme/desktop',
  origin = 'https://helpdesk.example'
const enabled = registry([
  {
    extension: issues,
    settings: { repositories: { app: repo }, helpdeskOrigin: origin },
    enabled: true,
  },
])
const scopes = new Set<Scope>(['read', 'write'])
let runtime: Awaited<ReturnType<typeof testPlatform>>
let ctx: Context
const posted: { url: string; data: unknown }[] = []
let closed = false
let closedTime = 2000
const mockGithub = vi.fn(async (url: string, init?: RequestInit) => {
  expect(url).toMatch(/^https:\/\/api.github.com\/repos\/acme\/desktop\/issues/)
  expect(init?.redirect).toBe('manual')
  expect(new Headers(init?.headers).get('Authorization')).toBe(
    'Bearer test-token',
  )
  if (init?.method === 'POST')
    posted.push({ url, data: JSON.parse(String(init.body)) })
  return Response.json({
    number: 42,
    state: closed ? 'closed' : 'open',
    closed_at: closed ? new Date(closedTime).toISOString() : null,
  })
})
beforeAll(async () => {
  runtime = await testPlatform()
  const env = {
    ...runtime,
    GITHUB_TOKEN: 'test-token',
    EXTENSIONS: enabled,
  } as unknown as Bindings
  ctx = {
    env,
    operator: { email: 'op@example.com', role: 'admin' },
    actor: { kind: 'operator', id: 'op@example.com' },
    uuid: () => crypto.randomUUID(),
    now: 1000,
  }
  await env.DB.batch([
    env.DB.prepare("INSERT INTO products VALUES('app','App')"),
    env.DB.prepare("INSERT INTO mailboxes VALUES('help@example.com','app')"),
    ...[1, 2].map((n) =>
      env.DB.prepare(
        "INSERT INTO conversations(number,product,mailbox,contact,contact_name,subject,status,created_at) VALUES(?,'app','help@example.com',?,'Private Customer','Confidential subject','open',1)",
      ).bind(n, 'private' + n + '@example.com'),
    ),
    env.DB.prepare(
      "INSERT INTO messages(id,number,kind,body,created_at) VALUES('private',1,'inbound','Private email body',1)",
    ),
  ])
  vi.stubGlobal('fetch', mockGithub)
})
afterAll(async () => {
  vi.unstubAllGlobals()
  await runtime?.dispose()
})

test('F06-AC1 only the reviewing human can publish exactly the approved preview', async () => {
  const summary = 'Export receipt lines with local dates.'
  for (const title of ['', 'Inquiry #1']) {
    await expect(
      invoke(ctx, scopes, 'issues.preview', { number: 1, title, summary }),
    ).rejects.toThrow()
  }
  const p = preview.parse(
    await invoke(ctx, scopes, 'issues.preview', {
      number: 1,
      title: 'Improve search',
      summary,
    }),
  )
  expect(posted).toEqual([])
  const confirm = {
    number: 1,
    confirmation: p.confirmation,
    summary: 'Unreviewed change',
  }
  const agent: Context = {
    ...ctx,
    actor: { kind: 'agent', id: 'a', onBehalfOf: ctx.operator.email },
  }
  expect(describe(agent, scopes).map((op) => op.name)).not.toContain(
    'issues.create',
  )
  await expect(
    invoke(agent, scopes, 'issues.create', confirm),
  ).rejects.toThrow()
  await expect(
    invoke(
      { ...ctx, actor: { kind: 'operator', id: 'different@example.com' } },
      scopes,
      'issues.create',
      confirm,
    ),
  ).rejects.toThrow()
  await expect(
    invoke({ ...ctx, now: 1000000 }, scopes, 'issues.create', confirm),
  ).rejects.toThrow()
  const attempts = await Promise.allSettled([
    invoke(ctx, scopes, 'issues.create', confirm),
    invoke(ctx, scopes, 'issues.create', confirm),
  ])
  expect(attempts.filter((a) => a.status === 'fulfilled')).toHaveLength(1)
  expect(posted).toEqual([
    {
      url: 'https://api.github.com/repos/acme/desktop/issues',
      data: {
        title: 'Improve search',
        body: summary + '\n\n[#1](https://helpdesk.example/conversation/1)',
      },
    },
  ])
})
test('F06-AC2 an existing issue links back to each conversation and can be found from either conversation', async () => {
  await invoke(ctx, scopes, 'issues.link', { number: 2, issue: 42 })
  await invoke(ctx, scopes, 'issues.link', { number: 2, issue: 42 })
  expect(posted.slice(1)).toEqual([
    {
      url: 'https://api.github.com/repos/acme/desktop/issues/42/comments',
      data: { body: '[#2](https://helpdesk.example/conversation/2)' },
    },
  ])
  expect(
    await invoke(ctx, scopes, 'issues.links', { product: 'app', issue: 42 }),
  ).toEqual([1, 2].map((number) => ({ number, repository: repo, issue: 42 })))
  expect(await panelLinks(extensionContext(ctx, enabled.active[0]), 2)).toEqual(
    [
      {
        label: 'acme/desktop#42',
        icon: { name: 'issue_open', label: '開いている' },
        href: 'https://github.com/acme/desktop/issues/42',
      },
      { label: '会話 #1', href: '/conversation/1' },
    ],
  )
})
async function synchronize(now: number) {
  await tick(ctx.env, now)
  const id = await ctx.env.DB.prepare(
    "SELECT max(id) id FROM events WHERE kind='scheduled'",
  ).first<number>('id')
  if (!id) throw new Error('Missing scheduled event')
  await deliverEvent(ctx.env, 'issues', id, now)
  expect(
    await ctx.env.DB.prepare(
      "SELECT phase FROM extension_deliveries WHERE extension='issues' AND event=?",
    )
      .bind(id)
      .first('phase'),
  ).toBe('done')
}
test('F06-AC3 closing the remote issue creates one unsent draft per linked conversation across scheduled events', async () => {
  await synchronize(2000)
  expect(
    await ctx.env.DB.prepare(
      "SELECT count(*) n FROM messages WHERE kind='outbound'",
    ).first('n'),
  ).toBe(0)
  await ctx.env.DB.prepare(
    "UPDATE conversations SET status='closed',closed_at=2500 WHERE number=2",
  ).run()
  closed = true
  await synchronize(3000)
  await synchronize(4000)
  const rows = await ctx.env.DB.prepare(
    "SELECT number,delivery,approval FROM messages WHERE kind='outbound' ORDER BY number",
  ).all()
  expect(rows.results).toEqual(
    [1, 2].map((number) => ({ number, delivery: 'draft', approval: null })),
  )
  expect(
    await ctx.env.DB.prepare('SELECT count(*) n FROM outbox').first('n'),
  ).toBe(0)
})
test('F06-AC4 compares issue-linked inquiries with all voices in equal windows around closure', async () => {
  await ctx.env.DB.batch(
    [1, 2].map((n, i) =>
      ctx.env.DB.prepare(
        'UPDATE conversations SET created_at=? WHERE number=?',
      ).bind(1000 + i * 2000, n),
    ),
  )
  const impact = await invoke({ ...ctx, now: 10000 }, scopes, 'issues.impact', {
    product: 'app',
    issue: 42,
    days: 1,
  })
  expect(impact).toMatchObject({
    before: { total: 1, linked: 1, share: 1 },
    after: { total: 1, linked: 1, share: 1 },
    caveat: expect.stringContaining('目安'),
  })
})

test('backfills a legacy title, recreates discarded drafts only on request, and prepares one new draft for a later closure', async () => {
  const api = extensionContext({ ...ctx, now: 9000 }, enabled.active[0])
  await api.remove('issue/acme/desktop/42')
  const old = await issueBoard(api)
  expect(old[0]).toMatchObject({ state: 'closed', informed: 0, remaining: 2 })
  const fullScopes = new Set<Scope>(['read', 'draft', 'write', 'send'])
  const input = { repository: repo, issue: 42, product: 'app' }
  const original = await ctx.env.DB.prepare(
    "SELECT id FROM messages WHERE number=1 AND delivery='draft'",
  ).first<string>('id')
  await invoke(ctx, fullScopes, 'discard', { id: original })
  const prepare = () =>
    invoke({ ...ctx, now: 4000 }, fullScopes, 'issues.draftNotices', input)
  await Promise.all([prepare(), prepare()])
  expect(
    await ctx.env.DB.prepare(
      "SELECT count(*) FROM messages WHERE delivery='draft'",
    ).first('count(*)'),
  ).toBe(2)
  await expect(
    invoke(ctx, fullScopes, 'issues.draftNotices', {
      ...input,
      repository: 'acme/unlinked',
    }),
  ).rejects.toThrow('関連付けられた声')
  const links = [1, 2].map((number) => ({
    repository: repo,
    issue: 42,
    number,
  }))
  const voices = new Map((await api.voices()).map((v) => [v.number, v]))
  await invoke({ ...ctx, now: 6000 }, new Set<Scope>(['send']), 'approve', {
    id: original,
  })
  await ctx.env.DB.batch([
    ctx.env.DB.prepare(
      "UPDATE messages SET delivery='sent',sent_at=6100,provider_id='delivered@example.org' WHERE id=?",
    ).bind(original),
    ctx.env.DB.prepare(
      "INSERT INTO events(number,kind,actor,payload,at) VALUES(1,'reply_sent','{}',?,6100)",
    ).bind(
      JSON.stringify({
        message: original,
        approval: { kind: 'operator', by: 'op@example.com' },
      }),
    ),
  ])
  closed = false
  await synchronizeIssue(api, links, voices)
  await expect(prepare()).rejects.toThrow('閉じた課題')
  closed = true
  closedTime = 8000
  await synchronizeIssue(api, links, voices)
  await synchronizeIssue(api, links, voices)
  const ids = await ctx.env.DB.prepare(
    "SELECT id FROM messages WHERE delivery='draft'",
  ).all<{ id: string }>()
  expect(
    ids.results.filter((row) => row.id.includes('/closed/8000')),
  ).toHaveLength(1)
  expect(ids.results).toHaveLength(2)
})
test('external article and issue requests reject redirects without forwarding credentials', async () => {
  const { externalRequest } =
    await import('../../core/extensions/external-client')
  const request = vi
    .spyOn(globalThis, 'fetch')
    .mockClear()
    .mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { Location: 'https://elsewhere.invalid/' },
      }),
    )
  try {
    await expect(
      externalRequest('https://api.github.com/example', {
        headers: { Authorization: 'test-token' },
      }),
    ).rejects.toThrow('redirect')
    expect(request).toHaveBeenCalledTimes(1)
    expect(request.mock.calls[0][1]?.redirect).toBe('manual')
  } finally {
    request.mockRestore()
  }
})
