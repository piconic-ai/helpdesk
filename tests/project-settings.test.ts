import { rowDetails } from '../src/core/conversations/console-store'
import { beforeEach, afterEach, expect, it } from 'vitest'
import { testPlatform } from './platform'
import { app } from '../worker'
import type { Bindings } from '../src/core/settings/bindings'
import { purgeExpired } from '../src/core/retention/retention-usecase'
import {
  availablePrefix,
  ticketPrefixSchema,
} from '../src/core/conversations/ticket-reference'

const admin = 'admin@example.org',
  lead = 'lead@example.org',
  customer = 'customer@example.org'
let platform: Awaited<ReturnType<typeof testPlatform>>
const origin = 'http://settings.local'
function visit(path: string, form?: Record<string, string>, email = admin) {
  const bindings: Pick<Bindings, 'ENVIRONMENT' | 'LOCAL_OPERATOR'> = {
    ENVIRONMENT: 'local',
    LOCAL_OPERATOR: email,
  }
  return app.request(
    origin + path,
    {
      method: form ? 'POST' : 'GET',
      headers: { Origin: origin, Accept: 'text/html' },
      body: form && new URLSearchParams(form),
    },
    { ...platform, ...bindings },
  )
}
async function html(path: string, email = admin) {
  const response = await visit(path, undefined, email)
  expect(response.status).toBe(200)
  return response.text()
}
async function submit(
  path: string,
  fields: Record<string, string>,
  email = admin,
) {
  const response = await visit(path, fields, email)
  expect(response.status).toBe(303)
  return response.headers.get('location')!
}
beforeEach(async () => {
  platform = await testPlatform()
  const { DB } = platform
  await DB.batch([
    DB.prepare("INSERT INTO operators VALUES(?,'admin'),(?,'agent')").bind(
      admin,
      lead,
    ),
    DB.prepare("INSERT INTO products VALUES('a','Alpha'),('b','Bravo')"),
    DB.prepare("INSERT INTO product_members VALUES('a',?,'admin')").bind(lead),
    DB.prepare(
      "INSERT INTO mailboxes VALUES('a@example.org','a'),('b@example.org','b')",
    ),
    DB.prepare(
      "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at,closed_at) SELECT product,address,?,'Subject','closed',1,2 FROM mailboxes ORDER BY product",
    ).bind(customer),
    DB.prepare(
      "INSERT INTO messages(id,number,kind,body,created_at) VALUES('one',1,'inbound','Body A',1),('two',2,'inbound','Body B',1)",
    ),
    DB.prepare("INSERT INTO labels VALUES(1,'Shared'),(2,'Shared')"),
    DB.prepare(
      "INSERT INTO extension_settings(id,enabled,enabled_by) VALUES('canned',1,?)",
    ).bind(admin),
  ])
})
afterEach(() => platform?.dispose())
it('separates the two settings directories and supports editing one project or operator at a time', async () => {
  const home = await html('/settings?product=a')
  expect(home).toContain('href="/settings/global"')
  expect(home).toContain('href="/settings/projects/a"')
  expect(await html('/settings/global')).toContain('/settings/operators')
  const members = await html('/settings/projects/a/members', lead)
  expect(members).toContain(admin)
  expect(members).not.toContain('Bravo')
  expect(
    await html('/settings/operators?edit=' + encodeURIComponent(lead)),
  ).toContain('Alpha')
  expect((await visit('/settings/global', undefined, lead)).status).toBe(403)
  expect(
    (await visit('/settings/projects/b/members', undefined, lead)).status,
  ).toBe(403)
  await submit('/settings/projects/a/publication', { published: 'on' }, lead)
  await submit('/settings/projects/a/archive', { state: 'archived' })
  expect(await html('/settings/mailboxes?filter=archived')).toContain('Alpha')
  expect(
    await platform.DB.prepare(
      "SELECT public_help FROM product_lifecycle WHERE product='a'",
    ).first('public_help'),
  ).toBe(1)
  await submit('/settings/projects/a/archive', { state: 'active' })
  expect(
    (await visit('/settings/projects/a/archive', { state: 'archived' }, lead))
      .status,
  ).toBe(403)
})
it('renames, colors, copies and removes labels only within the selected project', async () => {
  const url = '/settings/projects/a/labels'
  await submit(
    url,
    { action: 'rename', label: 'Shared', name: 'Support' },
    lead,
  )
  await submit(url, { label: 'Support', color: '5' }, lead)
  expect(await html(url, lead)).toContain('Supportの色を変更')
  expect(await html('/settings/projects/b/labels')).not.toContain(
    'Supportの色を変更',
  )
  expect((await visit(url + '/copy', { product: 'b' }, lead)).status).toBe(403)
  await submit('/settings/projects/b/labels/copy', { product: 'a' })
  await submit('/settings/projects/b/labels/copy', { product: 'a' })
  expect(
    await platform.DB.prepare(
      "SELECT color FROM project_labels WHERE product='b' AND name='Support'",
    ).first('color'),
  ).toBe(5)
  await submit(url, { action: 'delete', count: '1', label: 'Support' }, lead)
  expect(
    await platform.DB.prepare('SELECT name FROM labels WHERE number=2').first(
      'name',
    ),
  ).toBe('Shared')
})
it('shows the project color on each inbox row when the same label is used with different colors', async () => {
  await submit('/settings/projects/a/labels', { label: 'Shared', color: '2' })
  await submit('/settings/projects/b/labels', { label: 'Shared', color: '5' })
  const rows = await rowDetails(platform.DB, [1, 2], {}, admin, false)
  expect(rows.map((r) => [r.number, r.labelColors.Shared])).toEqual([
    [1, 2],
    [2, 5],
  ])
})
it('retains the other project when a contact is forgotten or an expiry policy runs', async () => {
  await submit('/actions/retention', { product: 'a', days: '1' })
  await purgeExpired(platform, 3 * 86400000)
  const read = (id: string) =>
    platform.DB.prepare('SELECT body FROM messages WHERE id=?')
      .bind(id)
      .first('body')
  expect(await read('one')).toBe('')
  expect(await read('two')).toBe('Body B')
  await submit('/actions/forget', { product: 'a', contact: customer })
  expect(await read('one')).toBeNull()
  expect(await read('two')).toBe('Body B')
  expect(await html('/settings/projects/b/deletion')).toContain(customer)
})
it('edits a shared legacy template in a single project and copies new templates without overwriting target edits', async () => {
  const save = (project: string, id: string, name: string, body: string) =>
    submit('/extensions/canned/save', {
      product: project,
      id,
      name,
      body,
      revision: '',
    })
  await save('a', 'acknowledge', 'Alpha acknowledgement', 'Hello Alpha')
  expect(await html('/extensions/canned?product=a')).toContain('Hello Alpha')
  expect(await html('/extensions/canned?product=b')).not.toContain(
    'Hello Alpha',
  )
  await save('b', 'acknowledge', 'Bravo acknowledgement', 'Hello Bravo')
  await save('a', '', 'Alpha follow-up', 'A new text')
  await submit('/extensions/canned/copy', { target: 'b', product: 'a' })
  const b = await html('/extensions/canned?product=b')
  expect(b).toContain('A new text')
  expect(b).toContain('Hello Bravo')
  expect(b).not.toContain('Hello Alpha')
})
it('offers an unused valid prefix when the requested prefix and nearby suggestions are occupied', () => {
  const occupied = new Set(['SLIDE', 'SLIDA', 'SLIDB'])
  expect(availablePrefix(ticketPrefixSchema.parse('SLIDE'), occupied)).toBe(
    'SLIDC',
  )
})
it('requires the reviewed name and count, then removes only the selected project, files and issue links', async () => {
  const { DB, RAW } = platform
  await DB.batch([
    DB.prepare("UPDATE messages SET raw_key='raw/'||id"),
    DB.prepare(
      "INSERT INTO attachments VALUES('file/a','one','a.txt','text/plain'),('file/b','two','b.txt','text/plain')",
    ),
    DB.prepare(
      "INSERT INTO inbound_jobs VALUES('raw/incomplete','a@example.org','sender@example.net',1,1)",
    ),
    DB.prepare(
      'INSERT INTO issues_data VALUES(\'link/owner/repo/1/1\',\'{"number":1,"repository":"owner/repo","issue":1}\'),(\'link/owner/repo/1/2\',\'{"number":2,"repository":"owner/repo","issue":1}\'),(\'issue/owner/repo/1\',\'{"state":"open","title":"Shared issue"}\')',
    ),
  ])
  for (const key of [
    'raw/one',
    'raw/two',
    'file/a',
    'file/b',
    'raw/incomplete',
    'attachments/incomplete/note',
  ])
    await RAW.put(key, 'contents')
  const path = '/settings/projects/a/delete'
  expect(
    (await visit(path, { name: 'Bravo', conversations: '1' })).status,
  ).toBe(409)
  expect(
    (await visit(path, { name: 'Alpha', conversations: '2' })).status,
  ).toBe(409)
  expect(
    (await visit(path, { name: 'Alpha', conversations: '1' }, lead)).status,
  ).toBe(403)
  expect(
    await DB.prepare('SELECT count(*) AS n FROM conversations').first('n'),
  ).toBe(2)
  await submit(path, { name: 'Alpha', conversations: '1' })
  expect(
    await DB.prepare("SELECT id FROM products WHERE id='a'").first(),
  ).toBeNull()
  expect(
    await DB.prepare('SELECT product FROM mailboxes').first('product'),
  ).toBe('b')
  expect(
    await DB.prepare('SELECT number FROM conversations').first('number'),
  ).toBe(2)
  expect(
    (
      await DB.prepare('SELECT key FROM issues_data ORDER BY key').all<{
        key: string
      }>()
    ).results.map((r) => r.key),
  ).toEqual(['issue/owner/repo/1', 'link/owner/repo/1/2'])
  expect((await RAW.list()).objects.map((o) => o.key)).toEqual([
    'file/b',
    'raw/two',
  ])
  expect(
    await DB.prepare(
      "SELECT count(*) AS n FROM events WHERE kind='project_deleted'",
    ).first('n'),
  ).toBe(1)
})

it('returns project managers to the project after viewing and saving extension settings', async () => {
  for (const id of ['form', 'auto-ack']) {
    await platform.DB.prepare(
      'INSERT INTO extension_settings(id,enabled,enabled_by) VALUES(?,1,?)',
    )
      .bind(id, admin)
      .run()
    const guide = await html('/extensions/' + id + '?product=a', lead)
    expect(guide).toMatch(
      /href="\/settings\/projects\/a"[^>]*>[^<]*プロジェクトの設定に戻る|href="\/settings\/projects\/a"[\s\S]{0,1200}プロジェクトの設定に戻る/,
    )
  }
  const directory = await html('/extensions/form')
  expect(directory).toContain('設定を開く')
  expect(directory).not.toContain('action="/settings/public-intakes/a"')
  const dest = await submit(
    '/settings/public-intakes/a',
    { returnTo: '/extensions/form' },
    lead,
  )
  expect(new URL(dest, origin).searchParams.get('product')).toBe('a')
  expect(await html(dest, lead)).toContain('プロジェクトの設定に戻る')
  await platform.DB.prepare(
    "UPDATE product_lifecycle SET archived_at=1 WHERE product='a'",
  ).run()
  expect(await html('/settings/projects/a', lead)).toContain(
    '新しい問い合わせの受付は終了しています。',
  )
})
