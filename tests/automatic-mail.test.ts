import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { app } from '../worker'
import { extensions, publicIntakes } from '../helpdesk.config'
import { extensionContext } from '../src/core/extensions/context-usecase'
import { configure } from '../src/core/extensions/registry-usecase'
import { deliverReply } from '../src/core/outbound/reply-usecase'
import type { Bindings } from '../src/core/settings/bindings'
import { testPlatform } from './platform'

const admin = 'a@example.org'
const origin = 'http://test.local'
let local: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
beforeEach(async () => {
  local = await testPlatform()
  env = {
    ...local,
    ENVIRONMENT: 'local',
    LOCAL_OPERATOR: admin,
  } as unknown as Bindings
  await local.DB.batch([
    local.DB.prepare(
      "INSERT INTO operators VALUES(?,'admin'),('agent@example.org','agent')",
    ).bind(admin),
    local.DB.prepare(
      "INSERT INTO products VALUES('a','Product A'),('b','Product B')",
    ),
    local.DB.prepare(
      "INSERT INTO mailboxes VALUES('a@example.org','a'),('b@example.org','b')",
    ),
  ])
})
afterEach(() => local.dispose())
function request(
  path: string,
  fields?: Record<string, string>,
  operator = admin,
) {
  return app.request(
    origin + path,
    {
      method: fields ? 'POST' : 'GET',
      headers: { Origin: origin, Accept: 'text/html' },
      body: fields && new URLSearchParams(fields),
    },
    { ...env, LOCAL_OPERATOR: operator },
  )
}
it.each(['auto-ack', 'survey'])(
  'previews and delivers approved %s wording once per event, scoped to its product',
  async (policy) => {
    const path = '/extensions/' + policy
    const form = {
      product: 'a',
      body: 'ひとつ目\n<form>Plain text & help</form>',
      revision: '',
      intent: 'preview',
    }
    expect((await request(path, { enabled: 'yes' })).status).toBe(303)
    const preview = await request(path + '/message', form)
    expect(preview.status).toBe(200)
    const html = await preview.text()
    expect(html).toContain('Plain text &amp; help&lt;/form&gt;')
    expect(html).toContain(admin)
    expect(html).toMatch(/有効化日時：<time datetime=/)
    expect(await (await request(path + '?product=a')).text()).not.toContain(
      'ひとつ目',
    )
    expect(
      (await request(path + '/message', { ...form, intent: 'save' })).status,
    ).toBe(303)
    expect(
      (
        await request(path + '/message', {
          ...form,
          body: 'stale',
          intent: 'save',
        })
      ).status,
    ).toBe(409)
    expect(await (await request(path + '?product=b')).text()).not.toContain(
      'ひとつ目',
    )
    const updated = await configure(env, extensions, publicIntakes)
    const item = updated.EXTENSIONS.active.find(
      (x) => x.extension.id === policy,
    )!
    const api = extensionContext(
      {
        env: updated,
        operator: { email: admin, role: 'admin' },
        actor: { kind: 'operator', id: admin },
        now: 2,
        uuid: () => crypto.randomUUID(),
      },
      item,
    )
    const status = policy === 'auto-ack' ? 'open' : 'closed'
    await local.DB.prepare(
      "INSERT INTO conversations(number,product,mailbox,contact,subject,status,created_at,closed_at) VALUES(1,'a','a@example.org','customer@example.net','Billing',?,1,?)",
    )
      .bind(status, status === 'closed' ? 2 : null)
      .run()
    const event = {
      id: 2,
      kind: policy === 'auto-ack' ? 'message_received' : 'status_changed',
      number: 1,
      at: 1,
      actor: { kind: 'operator', id: admin },
      payload: { first: true, category: 'human', to: 'closed' },
    }
    const subscriber = item.extension.subscribers!.find(
      (s) => s.kind === event.kind,
    )!
    await Promise.all([subscriber.run(api, event), subscriber.run(api, event)])
    const rows = await local.DB.prepare(
      "SELECT sm.message FROM standing_messages sm JOIN messages m ON m.id=sm.message WHERE json_extract(m.actor,'$.id')=?",
    )
      .bind(policy)
      .all<{ message: string }>()
    expect(rows.results).toHaveLength(1)
    const send = vi.fn().mockResolvedValue({ messageId: 'sent@example.net' })
    await deliverReply(
      { DB: local.DB, EMAIL: { send } },
      rows.results[0].message,
      3,
    )
    const envelope = send.mock.calls[0][0]
    expect(envelope).toMatchObject({
      to: 'customer@example.net',
      subject: 'Re: Billing [#1]',
      headers: { 'Auto-Submitted': 'auto-generated' },
    })
    expect(envelope.text).toContain(form.body)
    expect(envelope.text).toMatch(/automated/i)
    if (policy === 'survey') {
      const url = new URL(envelope.text.split(' ').at(-1))
      expect(url.pathname).toMatch(/^\/help\/survey\/a\/[\da-f-]{36}$/)
      expect((await request(url.pathname)).status).toBe(200)
    }
  },
)
it('keeps approval time truthful for legacy settings and restricts editing to active policies and known products', async () => {
  const path = '/extensions/auto-ack'
  const form = { product: 'a', body: 'ok', revision: '', intent: 'save' }
  await local.DB.prepare(
    "INSERT INTO extension_settings VALUES('auto-ack',1,?)",
  )
    .bind(admin)
    .run()
  expect(await (await request(path)).text()).toContain('有効化日時：記録なし')
  expect(
    (await request(path + '/message', form, 'agent@example.org')).status,
  ).toBe(403)
  expect((await request(path, undefined, 'agent@example.org')).status).toBe(403)
  expect(
    (await request(path + '/message', { ...form, product: 'missing' })).status,
  ).toBe(404)
  expect(
    (await request(path + '/message', { ...form, body: ' ' })).status,
  ).toBe(400)
  expect((await request(path + '?product=missing')).status).toBe(404)
  await request(path, { enabled: 'no' })
  expect((await request(path + '/message', form)).status).toBe(404)
})

it('records initial administrator approval once when a mailbox activates a sending policy', async () => {
  const path = '/extensions/auto-ack'
  expect(await (await request(path)).text()).toContain('自動送信は停止中')
  expect(
    (
      await request('/settings/mailboxes', {
        name: 'Shop',
        address: 'shop@example.org',
      })
    ).status,
  ).toBe(303)
  const first = await (await request(path)).text()
  expect(first).toContain(admin)
  expect(first).toMatch(/有効化日時：<time datetime=/)
  expect(
    (
      await request('/settings/mailboxes', {
        name: 'Studio',
        address: 'studio@example.org',
      })
    ).status,
  ).toBe(303)
  const records = await local.DB.prepare(
    "SELECT actor FROM events WHERE kind='extension_configured' AND json_extract(payload,'$.id')='auto-ack'",
  ).all<{ actor: string }>()
  expect(records.results.map((row) => JSON.parse(row.actor))).toEqual([
    { kind: 'operator', id: admin },
  ])
})
