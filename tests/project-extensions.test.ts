import { afterEach, beforeEach, expect, it } from 'vitest'
import { app } from '../worker'
import { history } from '../src/core/extensions/history-store'
import type { Bindings } from '../src/core/settings/bindings'
import { issueToken } from '../src/core/operators/tokens-usecase'
import { configure } from '../src/core/extensions/registry-usecase'
import {
  deliverEvent,
  enqueueEvents,
} from '../src/core/extensions/dispatch-usecase'
import { extensions, publicIntakes } from '../helpdesk.config'
import { testPlatform } from './platform'

const globalAdmin = 'global@example.org'
const manager = 'manager@example.org'
const origin = 'https://desk.example.org'
let platform: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
beforeEach(async () => {
  platform = await testPlatform()
  env = {
    ...platform,
    ENVIRONMENT: 'local',
    LOCAL_OPERATOR: globalAdmin,
  } as unknown as Bindings
  await platform.DB.batch([
    platform.DB.prepare(
      "INSERT INTO operators VALUES(?,'admin'),(?,'agent')",
    ).bind(globalAdmin, manager),
    platform.DB.prepare(
      "INSERT INTO products VALUES('slide','Slide'),('desk','Desk')",
    ),
    platform.DB.prepare(
      "INSERT INTO product_members VALUES('slide',?,'admin')",
    ).bind(manager),
    platform.DB.prepare(
      "INSERT INTO mailboxes VALUES('slide@example.org','slide'),('desk@example.org','desk')",
    ),
    platform.DB.prepare(
      "INSERT INTO extension_settings VALUES('articles',1,?),('auto-ack',1,?)",
    ).bind(globalAdmin, globalAdmin),
    platform.DB.prepare(
      "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) SELECT product,address,'person@example.org','Question','open',0 FROM mailboxes ORDER BY product DESC",
    ),
  ])
})
afterEach(() => platform.dispose())

function request(
  path: string,
  fields?: Record<string, string>,
  by = globalAdmin,
) {
  return app.request(
    origin + path,
    {
      method: fields ? 'POST' : 'GET',
      headers: { origin },
      body: fields && new URLSearchParams(fields),
    },
    { ...env, LOCAL_OPERATOR: by },
  )
}
const setting = (product: string, id: string) =>
  '/settings/projects/' + product + '/extensions/' + id

it('adopts existing settings and lets only the project manager operate an offered extension within that project', async () => {
  expect((await request('/help/articles/slide/')).status).toBe(200)
  expect((await request('/help/articles/desk/')).status).toBe(200)
  expect(
    (await request(setting('slide', 'articles'), { enabled: 'no' }, manager))
      .status,
  ).toBe(303)
  expect(
    (await request(setting('desk', 'articles'), { enabled: 'no' }, manager))
      .status,
  ).toBe(403)
  expect((await request('/help/articles/slide/')).status).toBe(404)
  expect((await request('/help/articles/desk/')).status).toBe(200)
  expect((await request('/articles?product=slide')).status).toBe(404)
  const token = await issueToken(
    env,
    manager,
    { label: 'Slide reports', access: 'read', products: ['slide'] },
    1,
  )
  const tools = await app.request(
    origin + '/api/operations',
    { headers: { authorization: 'Bearer ' + token } },
    env,
  )
  expect(await tools.text()).not.toContain('articles.read')
  expect(
    (await request(setting('slide', 'snooze'), { enabled: 'yes' }, manager))
      .status,
  ).toBe(404)
  expect((await request('/extensions/snooze', { enabled: 'yes' })).status).toBe(
    303,
  )
  expect((await request('/extensions/snooze?product=slide')).status).toBe(404)
  expect(
    (await request(setting('slide', 'snooze'), { enabled: 'yes' }, manager))
      .status,
  ).toBe(303)
  expect(
    (await request('/extensions/snooze?product=slide', undefined, manager))
      .status,
  ).toBe(200)
  expect((await request('/extensions/snooze?product=desk')).status).toBe(404)
  await request('/extensions/snooze', { enabled: 'no' })
  expect(
    (await request('/extensions/snooze?product=slide', undefined, manager))
      .status,
  ).toBe(404)
})

it('skips events before project approval and records the approving manager on its new automatic replies', async () => {
  await request(setting('slide', 'auto-ack'), { enabled: 'no' }, manager)
  async function receive(number: number) {
    const r = await platform.DB.prepare(
      `INSERT INTO events(number,kind,actor,at,payload) VALUES(?,'message_received','{"kind":"system"}',1,'{"first":true,"category":"human"}') RETURNING id`,
    )
      .bind(number)
      .first<number>('id')
    return r!
  }
  const old = await receive(1)
  await request(setting('slide', 'auto-ack'), { enabled: 'yes' }, manager)
  await request(setting('desk', 'auto-ack'), { enabled: 'no' })
  const live = await receive(1)
  const other = await receive(2)
  const configured = await configure(env, extensions, publicIntakes)
  await enqueueEvents(configured, 100)
  for (const id of [old, live, other])
    await deliverEvent(configured, 'auto-ack', id, 100)
  const messages = await platform.DB.prepare(
    "SELECT number,json_extract(approval,'$.enabledBy') AS approver FROM messages WHERE kind='outbound'",
  ).all()
  expect(messages.results).toEqual([{ number: 1, approver: manager }])
})

it('includes a shared issue closure in the history of each linked project only', async () => {
  const repo = 'example/shared'
  const event = (number: number | null, kind: string, issue: number) =>
    env.DB.prepare(
      'INSERT INTO events(number,kind,actor,at,payload) VALUES(?,?,?,1,?)',
    ).bind(
      number,
      kind,
      JSON.stringify({ kind: 'system' }),
      JSON.stringify({ repository: repo, issue }),
    )
  await env.DB.batch([
    event(1, 'issues.linked', 42),
    event(2, 'issues.linked', 43),
    event(null, 'issues.closed', 42),
    event(null, 'issues.closed', 43),
    event(null, 'issues.closed', 44),
  ])
  async function closed(project: string) {
    return (await history(env.DB, 'issues.closed', [project])).map(
      (e) => e.payload.issue,
    )
  }
  expect(await closed('slide')).toEqual([42])
  expect(await closed('desk')).toEqual([43])
  await event(1, 'issues.linked', 43).run()
  expect(await closed('slide')).toEqual([42, 43])
})
