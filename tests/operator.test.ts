import { extensionModeSQL } from './extension-mode'
import { beforeAll, afterAll, expect, test } from 'vitest'
import { app } from '../worker'
import { testPlatform } from './platform'
import type { Bindings } from '../src/core/settings/bindings'
import { purgeExpired } from '../src/core/retention/retention-usecase'

let platform: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
const origin = 'https://desk.example'
const admin = 'owner@example.com',
  agent = 'staff@example.com'
function request(
  path: string,
  who: string | null = admin,
  data?: Record<string, string>,
) {
  const init = data
    ? { method: 'POST', headers: { origin }, body: new URLSearchParams(data) }
    : {}
  return app.request(origin + path, init, {
    ...env,
    LOCAL_OPERATOR: who ?? undefined,
  })
}
beforeAll(async () => {
  platform = await testPlatform()
  for (const sql of extensionModeSQL(
    process.env.HELPDESK_TEST_EXTENSIONS,
    admin,
  ))
    await platform.DB.prepare(sql).run()
  env = { ...platform, ENVIRONMENT: 'local' } as unknown as Bindings
  expect((await request('/settings')).status).toBe(200)
  expect(
    (
      await request('/actions/mailbox', admin, {
        product: 'alpha',
        name: 'Alpha',
        address: 'alpha@example.com',
      })
    ).status,
  ).toBe(303)
  await request('/', agent)
})
afterAll(() => platform?.dispose())
async function seed(subject: string, contact: string) {
  const row = await env.DB.prepare(
    "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES('alpha','alpha@example.com',?,?,'open',1) RETURNING number",
  )
    .bind(contact, subject)
    .first<number>('number')
  if (!row) throw new Error('No conversation')
  return String(row)
}
test('F01-AC11/28 unauthenticated visitors and non-admin operators cannot manage mailboxes', async () => {
  for (const path of [
    '/',
    '/conversation/1',
    '/mail/m',
    '/attachment?key=a',
    '/settings',
  ]) {
    expect((await request(path, null)).status).toBe(401)
  }
  expect((await request('/settings', agent)).status).toBe(403)
  expect(
    (
      await request('/actions/mailbox', agent, {
        product: 'x',
        name: 'X',
        address: 'x@example.com',
      })
    ).status,
  ).toBe(403)
  expect(
    (
      await app.request(
        origin + '/settings',
        {},
        { ...env, ENVIRONMENT: 'production', LOCAL_OPERATOR: admin },
      )
    ).status,
  ).toBe(500)
})
test('F01-AC12/13/14/22/24/25/31 filter, search, history, internal notes, closure and activity', async () => {
  const contact = 'reader@example.com'
  await seed('Earlier inquiry', contact)
  const number = await seed('Printing question', contact)
  for (const [name, fields] of [
    ['assign', { email: agent }],
    ['label', { action: 'add', label: 'printer' }],
    ['note', { body: 'Yellow ink' }],
  ] as const) {
    expect(
      (await request('/actions/' + name, agent, { number, ...fields })).status,
    ).toBe(303)
  }
  for (const query of [
    'query=yellow',
    'query=reader',
    'query=Printing',
    'product=alpha',
    'label=printer',
    'assignee=' + agent,
  ]) {
    expect(await (await request('/?' + query)).text()).toContain(
      'Printing question',
    )
  }
  for (const query of [
    'query=pencil',
    'product=beta',
    'label=missing',
    'assignee=' + admin,
    'status=pending',
  ]) {
    expect(await (await request('/?' + query)).text()).not.toContain(
      'Printing question',
    )
  }
  const page = await (await request('/conversation/' + number)).text()
  expect(page).toContain('Earlier inquiry')
  expect(page).toContain('Yellow ink')
  expect(page).toContain('担当者を変更')
  expect(
    (await request('/actions/status', agent, { number, event: 'closed' }))
      .status,
  ).toBe(303)
  expect(await (await request('/')).text()).not.toContain('Printing question')
  expect(await (await request('/?status=closed')).text()).toContain(
    'Printing question',
  )
  expect(await env.DB.prepare('SELECT count(*) n FROM outbox').first('n')).toBe(
    0,
  )
  const event = await env.DB.prepare(
    "SELECT actor,at FROM events WHERE number=? AND kind='assigned'",
  )
    .bind(number)
    .first()
  expect(event?.actor).toBe(JSON.stringify({ kind: 'operator', id: agent }))
  expect(event?.at).toEqual(expect.any(Number))
})
test('F01-AC29/30 deletion and expiry remove private objects from R2; expiry preserves conversation metadata', async () => {
  const contact = 'forget@example.com'
  const number = await seed('Private', contact)
  const add = async (id: string) => {
    await env.DB.prepare(
      "INSERT INTO messages(id,number,kind,body,html,raw_key,created_at) VALUES(?,?,'inbound','private','private',?,1)",
    )
      .bind(id, number, 'raw/' + id)
      .run()
    await env.DB.prepare(
      "INSERT INTO attachments(key,message,filename,mime) VALUES(?,?,'pic.png','image/png')",
    )
      .bind('attachments/' + id, id)
      .run()
    await env.RAW.put('raw/' + id, 'secret')
    await env.RAW.put('attachments/' + id, 'photo')
  }
  await add('first')
  await request('/actions/status', agent, { number, event: 'closed' })
  const later = Date.now() + 2 * 86400000
  await purgeExpired(env, later)
  expect(await env.RAW.head('raw/first')).not.toBeNull()
  await request('/actions/retention', admin, { days: '1' })
  await purgeExpired(env, later)
  expect(await env.RAW.head('raw/first')).toBeNull()
  expect(await env.RAW.head('attachments/first')).toBeNull()
  expect(
    await env.DB.prepare("SELECT body FROM messages WHERE id='first'").first(
      'body',
    ),
  ).toBe('')
  await add('last')
  expect((await request('/actions/forget', admin, { contact })).status).toBe(
    303,
  )
  expect(await env.RAW.head('raw/last')).toBeNull()
  expect(await env.RAW.head('attachments/last')).toBeNull()
  expect((await request('/conversation/' + number)).status).toBe(404)
  expect(
    await env.DB.prepare('SELECT count(*) n FROM messages WHERE number=?')
      .bind(number)
      .first('n'),
  ).toBe(0)
})
