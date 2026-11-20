import { receiveEmail } from '../src/core/inbound/inbound-email'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { app } from '../worker'
import { testPlatform } from './platform'
import { registry } from '../src/core/extensions/registry'
import { form } from '../src/extensions/form/extension'
import { mailboxProduct } from '../src/core/inbound/inbound-store'
import { projectVolume } from '../src/operator/project-volume-store'
import { projectBreakdown } from '../src/operator/project-volume'
import type { Bindings } from '../src/core/settings/bindings'

const origin = 'https://events.example.com'
let platform: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
beforeAll(async () => {
  platform = await testPlatform()
  const policies: Record<string, { publicKey: string; origins: string[] }> = {}
  const statements = []
  for (let i = 0; i < 12; i++) {
    const id = 'edition-' + i
    policies[id] = { publicKey: 'form', origins: [origin] }
    statements.push(
      platform.DB.prepare('INSERT INTO products(id,name) VALUES(?,?)').bind(
        id,
        'Edition ' + i,
      ),
      platform.DB.prepare(
        'INSERT INTO mailboxes(address,product) VALUES(?,?)',
      ).bind(id + '@example.org', id),
      platform.DB.prepare(
        'UPDATE product_lifecycle SET public_help=? WHERE product=?',
      ).bind(Number(i !== 11), id),
      platform.DB.prepare(
        "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES(?,?,?,'Question','open',100)",
      ).bind(id, id + '@example.org', 'guest@example.org'),
    )
  }
  await platform.DB.batch(statements)
  await platform.DB.prepare(
    "UPDATE product_lifecycle SET archived_at=101 WHERE product='edition-10'",
  ).run()
  env = {
    ...platform,
    ENVIRONMENT: 'local',
    EXTENSIONS: registry([{ extension: form, settings: {}, enabled: true }]),
    PUBLIC_INTAKES: policies,
  } as unknown as Bindings
})
afterAll(() => platform?.dispose())

it('lists and searches only published active help destinations', async () => {
  const html = await (await app.request(origin + '/help/', {}, env)).text()
  expect(html).toContain('プロジェクト名で検索')
  expect(html).toContain('Edition 9')
  expect(html).not.toContain('Edition 10')
  expect(html).not.toContain('Edition 11')
  const filtered = await (
    await app.request(origin + '/help/?filter=Edition%203', {}, env)
  ).text()
  expect(filtered).toContain('Edition 3')
  expect(filtered).not.toContain('Edition 9')
})

it('closes hosted, embedded and email intake on archive and reopens them on restore', async () => {
  const product = 'edition-10'
  const formUrl = origin + '/help/form/' + product
  const submit = () =>
    app.request(
      origin + '/public/form/' + product + '/submit',
      {
        method: 'POST',
        headers: {
          Origin: origin,
          'X-Helpdesk-Key': 'form',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'guest@example.net',
          subject: 'Hello',
          body: 'Question',
        }),
      },
      env,
    )
  expect((await app.request(formUrl, {}, env)).status).toBe(404)
  expect((await submit()).status).toBe(403)
  expect(await mailboxProduct(platform.DB, product + '@example.org')).toBeNull()
  let rejection
  await receiveEmail(
    {
      from: 'customer@example.org',
      to: product + '@example.org',
      raw: new Blob(['hello']).stream(),
      setReject(reason) {
        rejection = reason
      },
    },
    env,
  )
  expect(rejection).toContain('archived')
  await platform.DB.prepare(
    'UPDATE product_lifecycle SET archived_at=NULL WHERE product=?',
  )
    .bind(product)
    .run()
  expect((await app.request(formUrl, {}, env)).status).toBe(200)
  expect((await submit()).status).toBe(201)
  expect(await mailboxProduct(platform.DB, product + '@example.org')).toBe(
    product,
  )
})

it('counts the top eight and the remainder within the actor and reporting period', async () => {
  const counts = (visible: string[] | null, selected = '') =>
    projectVolume(platform.DB, 99, 101, visible, selected)
  const { leading, remaining } = projectBreakdown(await counts(null))
  expect(leading).toHaveLength(8)
  expect(remaining.reduce((n, r) => n + r.count, 0)).toBe(4)
  expect(await counts(['edition-9'])).toEqual([
    { value: 'edition-9', title: 'Edition 9', count: 1 },
  ])
  expect(await counts(['edition-9'], 'edition-1')).toEqual([])
  expect(await counts([])).toEqual([])
})
