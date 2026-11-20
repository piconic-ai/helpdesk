import { afterAll, beforeAll, expect, it } from 'vitest'
import { app } from '../worker'
import { issues } from '../src/extensions/issues/extension-usecase'
import { metrics } from '../src/extensions/metrics/extension'
import { exportExtension } from '../src/extensions/export/extension'
import { articles } from '../src/extensions/articles/extension-routes'
import { registry } from '../src/core/extensions/registry'
import { issueToken } from '../src/core/operators/tokens-usecase'
import { queueStanding, deliverReply } from '../src/core/outbound/reply-usecase'
import type { Bindings } from '../src/core/settings/bindings'
import { testPlatform } from './platform'

const admin = 'admin@example.org'
const member = 'member@example.org'
const origin = 'https://desk.test'
let p: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
let token: string
let adminToken: string
async function api(name: string, input: unknown = {}, secret = token) {
  return app.request(
    origin + '/api/operations/' + name,
    {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + secret,
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    },
    env,
  )
}
function get(path: string) {
  return app.request(origin + path, {}, env)
}
async function post(path: string, input: Record<string, string>) {
  return app.request(
    origin + path,
    { method: 'POST', headers: { origin }, body: new URLSearchParams(input) },
    env,
  )
}
beforeAll(async () => {
  p = await testPlatform()
  env = {
    ...p,
    ENVIRONMENT: 'local',
    LOCAL_OPERATOR: member,
    GITHUB_TOKEN: 'simulated',
    DEMO_GITHUB: { fetch: async () => Response.json([]) },
    EXTENSIONS: registry(
      [metrics, exportExtension, articles, issues].map((extension) => ({
        extension,
        enabled: true,
        settings:
          extension.id === 'issues'
            ? {
                repositories: {
                  visible: 'local/shared',
                  hidden: 'local/shared',
                },
              }
            : {},
      })),
    ),
  } as unknown as Bindings
  const sql = (s: string) => p.DB.prepare(s)
  await p.DB.batch([
    sql("INSERT INTO operators VALUES(?,'admin'),(?,'agent')").bind(
      admin,
      member,
    ),
    sql(
      "INSERT INTO products VALUES('visible','Accessible project'),('hidden','Unreachable project')",
    ),
    sql("INSERT INTO product_members VALUES('visible',?,'agent')").bind(member),
    sql(
      "INSERT INTO mailboxes VALUES('v@example.org','visible'),('h@example.org','hidden')",
    ),
    sql(
      "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES('visible','v@example.org','same@example.org','Visible inquiry','open',1),('hidden','h@example.org','same@example.org','Private inquiry','open',1)",
    ),
    sql(
      "INSERT INTO messages(id,number,kind,body,raw_key,html,created_at) VALUES('own',1,'inbound','visible words','raw/own','<p>visible</p>',1),('foreign',2,'inbound','private words','raw/hidden','<p>secret</p>',1)",
    ),
    sql(
      "INSERT INTO attachments VALUES('private/file','foreign','confidential.txt','text/plain')",
    ),
    sql(
      "INSERT INTO events(number,kind,actor,payload,at) VALUES(1,'conversation_opened','{\"kind\":\"system\"}','{}',1),(2,'conversation_opened','{\"kind\":\"system\"}','{}',1)",
    ),
  ])
  await p.RAW.put('private/file', 'confidential')
  token = await issueToken(env, member, { label: 'member', access: 'write' }, 1)
  adminToken = await issueToken(
    env,
    admin,
    { label: 'limited administrator', access: 'write', products: ['visible'] },
    1,
  )
})
afterAll(async () => p?.dispose())

it('limits the inbox, search, navigation and contact history to current memberships', async () => {
  const inbox = await get('/')
  expect(inbox.status).toBe(200)
  const html = await inbox.text()
  expect(html).toContain('Visible inquiry')
  expect(html).not.toMatch(/Private inquiry|Unreachable project/)
  const detail = await get('/conversation/1')
  expect(detail.status).toBe(200)
  expect(await detail.text()).not.toContain('Private inquiry')
  expect((await get('/conversation/2')).status).toBe(403)
  expect((await get('/mail/foreign')).status).toBe(403)
  expect((await get('/attachment?key=private%2Ffile')).status).toBe(403)
  expect((await get('/mail/own')).status).toBe(200)
  for (const path of ['/voices', '/voices/conversations', '/metrics']) {
    const redirect = await get(path)
    expect(redirect.status).toBe(302)
    expect(redirect.headers.get('location')).toBe(path + '?product=visible')
  }
  for (const path of [
    '/voices?product=visible',
    '/voices/conversations?product=visible',
    '/articles',
  ]) {
    const res = await get(path)
    expect(res.status).toBe(200)
    expect(await res.text()).not.toMatch(/Private inquiry|Unreachable project/)
  }
})

it('omits an archived project from the combined inbox and includes its conversations in explicit project history', async () => {
  await p.DB.batch([
    p.DB.prepare("INSERT INTO products VALUES('past','Earlier edition')"),
    p.DB.prepare("INSERT INTO product_members VALUES('past',?,'agent')").bind(
      member,
    ),
    p.DB.prepare("INSERT INTO mailboxes VALUES('past@example.org','past')"),
    p.DB.prepare(
      "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES('past','past@example.org','reader@example.org','Past edition inquiry','open',1)",
    ),
    p.DB.prepare(
      "UPDATE product_lifecycle SET archived_at=2 WHERE product='past'",
    ),
    p.DB.prepare(
      "UPDATE conversations SET assignee=? WHERE product IN ('visible','past')",
    ).bind(member),
  ])
  try {
    const inbox = await (
      await get('/?status=all&assignee=' + encodeURIComponent(member))
    ).text()
    expect(inbox).toContain('プロジェクト別の件数')
    expect(inbox).toContain('Visible inquiry')
    expect(inbox).not.toContain('Past edition inquiry')
    const history = await (await get('/?product=past&status=all')).text()
    expect(history).toContain('Past edition inquiry')
    const thread = await (await get('/conversation/1')).text()
    for (const destination of ['/voices', '/metrics', '/articles', '/issues']) {
      expect(thread).toContain('href="' + destination + '?product=visible"')
    }
  } finally {
    await p.DB.batch([
      p.DB.prepare("DELETE FROM conversations WHERE product='past'"),
      p.DB.prepare("DELETE FROM mailboxes WHERE product='past'"),
      p.DB.prepare("DELETE FROM products WHERE id='past'"),
      p.DB.prepare(
        "UPDATE conversations SET assignee=NULL WHERE product='visible'",
      ),
    ])
  }
})

it('hides article source, issue links, and their titles even when two projects share a repository', async () => {
  await get('/issues')
  for (const [number, product, title] of [
    [1, 'visible', 'Visible inquiry'],
    [2, 'hidden', 'Private inquiry'],
  ] as const) {
    const doc = {
      product,
      id: 'troubleshooting',
      title,
      body: title,
      status: 'draft',
    }
    await p.DB.prepare('INSERT INTO articles_data(key,value) VALUES(?,?)')
      .bind('article/' + product + '/troubleshooting', JSON.stringify(doc))
      .run()
    await p.DB.prepare('INSERT INTO issues_data(key,value) VALUES(?,?), (?,?)')
      .bind(
        'issue/local/shared/' + number,
        JSON.stringify({ title, state: 'open', closedAt: null }),
        'link/local/shared/' + number + '/' + number,
        JSON.stringify({ repository: 'local/shared', issue: number, number }),
      )
      .run()
  }
  for (const path of ['/articles', '/issues']) {
    const res = await get(path)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Visible inquiry')
    expect(html).not.toContain('Private inquiry')
  }
  expect((await get('/issues/local/shared/2')).status).toBe(404)
  expect(
    (await get('/articles/edit?product=hidden&id=troubleshooting')).status,
  ).toBe(403)
  expect(
    (await api('articles.read', { id: 'troubleshooting', product: 'hidden' }))
      .status,
  ).toBe(403)
  expect(
    await (await api('issues.links', { issue: 2, product: 'visible' })).json(),
  ).toMatchObject({ result: [] })
})

it('scopes the HTTP API, metrics, export and MCP, including a narrowed global administrator token', async () => {
  for (const secret of [token, adminToken]) {
    const list = await api('list', {}, secret)
    expect(await list.json()).toMatchObject({
      result: [{ number: 1, subject: 'Visible inquiry' }],
    })
    expect(
      await (await api('list', { query: 'private words' }, secret)).json(),
    ).toMatchObject({ result: [] })
    expect((await api('get', { number: 2 }, secret)).status).toBe(403)
    expect(
      (await api('bulk', { numbers: [1, 2], action: 'closed' }, secret)).status,
    ).toBe(403)
    expect(
      await p.DB.prepare(
        'SELECT status FROM conversations WHERE number=1',
      ).first('status'),
    ).toBe('open')
    const report = await api('metrics.report', {}, secret)
    expect(await report.json()).toMatchObject({ result: { voices: 1 } })
    const snapshot = await api('export.jsonl', { unmask: true }, secret)
    expect(snapshot.status).toBe(200)
    const exported = await snapshot.text()
    expect(exported).toContain('Visible inquiry')
    expect(exported).not.toMatch(
      /Private inquiry|private words|Unreachable project/,
    )
  }
  const tool = async (name: string, args: unknown) =>
    app.request(
      origin + '/mcp',
      {
        method: 'POST',
        headers: {
          authorization: 'Bearer ' + token,
          'content-type': 'application/json',
          accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name, arguments: args },
        }),
      },
      env,
    )
  const listed = await tool('list', {})
  expect(listed.status).toBe(200)
  expect(await listed.json()).toMatchObject({
    result: { structuredContent: { result: [{ number: 1 }] } },
  })
  const denied = await tool('get', { number: 2 })
  expect(await denied.json()).toMatchObject({ result: { isError: true } })
})

it('rechecks the member on each page submission, token call and operator notification delivery', async () => {
  const msg = await queueStanding(env, {
    number: 1,
    body: 'operator notice',
    key: 'removal',
    policy: 'notify',
    enabledBy: admin,
    now: 2,
    operatorRecipient: member,
  })
  expect((await get('/conversation/1')).status).toBe(200)
  await p.DB.prepare(
    "DELETE FROM product_members WHERE product='visible' AND email=?",
  )
    .bind(member)
    .run()
  expect(
    (await post('/actions/note', { number: '1', body: 'Stale page' })).status,
  ).toBe(403)
  expect((await api('get', { number: 1 })).status).toBe(403)
  const deliveries: unknown[] = []
  await deliverReply(
    {
      DB: p.DB,
      EMAIL: {
        send: async (input) => {
          deliveries.push(input)
          return { messageId: 'unexpected' }
        },
      },
    },
    msg.id,
    100000,
  )
  expect(deliveries).toEqual([])
  const status = await p.DB.prepare('SELECT delivery FROM messages WHERE id=?')
    .bind(msg.id)
    .first('delivery')
  expect(status).toBe('failed')
  await expect(
    queueStanding(env, {
      number: 1,
      body: 'no longer a member',
      key: 'gone',
      policy: 'notify',
      enabledBy: admin,
      now: 3,
      operatorRecipient: member,
    }),
  ).rejects.toThrow('Invalid recipient')
})
