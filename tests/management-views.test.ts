import { afterEach, beforeEach, expect, it } from 'vitest'
import { app } from '../worker'
import type { Bindings } from '../src/core/settings/bindings'
import { testPlatform } from './platform'

const origin = 'http://management.local'
const admin = 'admin@example.org'
let platform: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings

beforeEach(async () => {
  platform = await testPlatform()
  env = {
    ...platform,
    ENVIRONMENT: 'local',
    LOCAL_OPERATOR: admin,
  } as unknown as Bindings
  await platform.DB.prepare(
    "INSERT INTO operators VALUES(?,'admin'),('agent@example.org','agent')",
  )
    .bind(admin)
    .run()
})
afterEach(() => platform?.dispose())

function request(
  path: string,
  fields?: Record<string, string>,
  bindings = env,
) {
  return app.request(
    origin + path,
    {
      method: fields ? 'POST' : 'GET',
      headers: { Accept: 'text/html', Origin: origin },
      body: fields && new URLSearchParams(fields),
    },
    bindings,
  )
}
async function page(path: string, bindings = env) {
  const result = await request(path, undefined, bindings)
  expect(result.status).toBe(200)
  return result.text()
}
async function submit(path: string, fields: Record<string, string>) {
  const response = await request(path, fields)
  expect(response.status).toBe(303)
  return response.headers.get('location')!
}
async function studio() {
  await platform.DB.batch([
    platform.DB.prepare("INSERT INTO products VALUES('studio','Studio')"),
    platform.DB.prepare(
      "INSERT INTO mailboxes VALUES('help@example.org','studio')",
    ),
  ])
}
async function enable(...ids: string[]) {
  await platform.DB.batch(
    ids.map((id) =>
      platform.DB.prepare('INSERT INTO extension_settings VALUES(?,1,?)').bind(
        id,
        admin,
      ),
    ),
  )
}

it('keeps onboarding visible during searches and reflects saved mailbox, sender and retention settings', async () => {
  const empty = await page('/settings?q=unmatched')
  expect(empty).toContain('最初の窓口を登録してください。')
  expect(empty).toContain('条件に合う設定項目はありません。')
  expect(empty).not.toContain('href="/settings/deletion"')
  expect(await page('/settings/mailboxes')).toContain('窓口のメールアドレス')

  const created = await submit('/settings/mailboxes', {
    name: 'Studio',
    address: 'help@example.org',
  })
  expect(await page(created)).toContain('窓口を登録しました。')
  const product = await platform.DB.prepare(
    "SELECT product FROM mailboxes WHERE address='help@example.org'",
  ).first<string>('product')
  const badDomain = await page('/settings', {
    ...env,
    SENDING_DOMAINS: 'https://invalid',
  })
  expect(badDomain).toContain('example.org のメール送信を有効にし')
  expect(badDomain).toContain('送信ドメインをカンマ区切りで指定してください。')
  env.SENDING_DOMAINS = 'example.org'
  expect(await page('/settings')).not.toContain('初期設定が必要です')
  const mailboxSettings = await page('/settings/mailboxes')
  expect(mailboxSettings).toContain('窓口アドレスの先頭')
  expect(mailboxSettings).toContain('登録済みのプロダクトに窓口を追加')
  await submit('/settings/mailboxes', {
    product: product!,
    local: 'returns',
    domain: 'example.org',
  })
  expect(await page('/settings?q=' + encodeURIComponent('窓口 2件'))).toContain(
    'href="/settings/mailboxes"',
  )
  const sender = await submit('/settings/senders/' + product, {
    senderName: 'Studio Support',
    showOperator: 'on',
  })
  const configured = await page(sender)
  expect(configured).toContain('メールの差出人を保存しました。')
  expect(configured).toContain('value="Studio Support"')
  expect(
    await page(await submit('/actions/retention', { days: '14' })),
  ).toContain('保存期間を変更しました。')
  expect(await page('/settings?q=14')).toContain('14日')
  await enable('export')
  const sensitive = await page(
    '/settings?q=' + encodeURIComponent('データ管理'),
  )
  expect(sensitive).toContain('href="/extensions/export"')
  expect(sensitive).toContain('href="/settings/deletion"')
  expect(sensitive).not.toContain('href="/settings/retention"')
})

it('protects the last administrator and shows contact names and conversation counts before deletion', async () => {
  await studio()
  const admins = await page('/settings/operators?filter=admin')
  expect(admins).toContain('最後の管理者です。')
  const agents = await page('/settings/operators?filter=agent')
  expect(agents).toContain('編集：agent')
  expect(agents).not.toContain('最後の管理者です。')
  expect(await page('/settings/operators?q=unmatched')).toContain(
    '条件に合う運営者はいません。',
  )
  const updated = await submit('/actions/role', {
    email: 'agent@example.org',
    role: 'admin',
    displayName: 'Second administrator',
  })
  const roster = await page(updated)
  expect(roster).toContain('運営者の情報を保存しました。')
  expect(roster).toContain('編集：Second administrator')
  expect(roster).not.toContain('最後の管理者です。')
  expect(await page('/settings/deletion')).toContain(
    '削除できる連絡先はありません。',
  )
  await platform.DB.prepare(
    "INSERT INTO conversations(product,mailbox,contact,contact_name,subject,status,created_at) VALUES('studio','help@example.org','named@example.org','Named Person','One','open',1),('studio','help@example.org','named@example.org','Named Person','Two','open',2),('studio','help@example.org','other@example.org',NULL,'Three','open',3)",
  ).run()
  const deletion = await page('/settings/deletion')
  expect(deletion).toContain('Named Person · named@example.org')
  expect(deletion).toContain('data-conversations="2"')
  expect(deletion).toContain('other@example.org')
  const complete = await page(
    await submit('/actions/forget', { contact: 'named@example.org' }),
  )
  expect(complete).toContain('選択した相手のデータを削除しました。')
  expect(complete).not.toContain('named@example.org')
  expect(complete).toContain('other@example.org')
})

it('combines activation filters with search, exposes consent permissions, and reports a stale undo', async () => {
  await studio()
  const disabled = await page('/extensions?q=survey&filter=disabled')
  expect(disabled).toContain('解決アンケートを有効にする')
  expect(disabled).toContain('data-permissions="メール送信"')
  expect(disabled).not.toContain('data-extension="metrics"')
  const active = await submit('/extensions/survey', { enabled: 'yes' })
  const first = await page(active)
  expect(first).toContain('解決アンケートを有効にしました。')
  expect(first).toContain('解決アンケートを無効にする')
  expect(await page('/extensions?q=survey&filter=disabled')).toContain(
    '条件に合う拡張機能はありません。',
  )
  expect(await page('/extensions?q=survey&filter=enabled')).toContain(
    'href="/extensions/survey"',
  )
  expect(await page('/extensions/survey')).toContain('使用する権限')
  const undo = new URL(active, origin).searchParams.get('undo')!
  expect(
    await page(await submit('/extensions/undo-activation', { changeId: undo })),
  ).toContain('設定を元に戻しました。')
  expect(
    await page(await submit('/extensions/undo-activation', { changeId: undo })),
  ).toContain('設定が更新されたため、元に戻せません。')
  expect((await request('/extensions/survey')).status).toBe(404)
})

it('finds a saved reply by its body and restores the previous text after an edit', async () => {
  await enable('canned')
  const after = await submit('/extensions/canned/save', {
    id: '',
    name: 'Shipping help',
    body: 'Follow the tracking number',
    revision: '',
  })
  const created = await page(after)
  expect(created).toContain('定型文を保存しました。')
  expect(created).toContain('編集：Shipping help')
  const query = '/extensions/canned?q=TRACKING'
  expect(await page(query)).toContain('Shipping help')
  expect(await page('/extensions/canned?q=unmatched')).toContain(
    '条件に合う定型文はありません。',
  )
  const revision = new URL(after, origin).searchParams.get('undo')!
  const id = await platform.DB.prepare(
    'SELECT substr(setting,10) AS id FROM extension_setting_changes WHERE token=?',
  )
    .bind(revision)
    .first<string>('id')
  const changes = {
    id: id!,
    name: 'Shipping help',
    body: 'Read the delivery notice',
    revision,
  }
  const edited = await submit('/extensions/canned/save', changes)
  expect(await page(query)).toContain('条件に合う定型文はありません。')
  expect(
    await page(
      await submit('/extensions/canned/save', {
        ...changes,
        body: 'Stale change',
      }),
    ),
  ).toContain('設定が更新されたため、保存できませんでした。')
  const changeId = new URL(edited, origin).searchParams.get('undo')!
  const restored = await page(
    await submit('/extensions/canned/undo-setting', { changeId }),
  )
  expect(restored).toContain('設定を元に戻しました。')
  expect(await page(query)).toContain('Follow the tracking number')
  expect(
    (await request('/extensions/canned/save', { ...changes, id: 'missing' }))
      .status,
  ).toBe(404)
})

it('keeps rule priority visible while filtering and rejects stale assignment choices', async () => {
  await enable('rules')
  await studio()
  expect(await page('/extensions/rules')).toContain(
    '保存済みのルールはありません。',
  )
  await submit('/extensions/rules/add', {
    subjectContains: 'invoice',
    assignee: admin,
    revision: '',
  })
  const scoped = {
    product: 'studio',
    assignee: 'agent@example.org',
    subjectContains: '',
    revision: '',
  }
  await submit('/extensions/rules/add', scoped)
  const view = await page('/extensions/rules?q=agent')
  expect(view).toContain('Studio · すべての件名')
  expect(view).toContain('2番目')
  expect(view).not.toContain('全プロダクト · invoice')
  expect(await page('/extensions/rules?q=unmatched')).toContain(
    '条件に合うルールはありません。',
  )
  const invalidChoices: Record<string, string>[] = [
    { product: 'missing' },
    { assignee: 'unknown@example.org' },
    { label: 'missing' },
  ]
  for (const invalid of invalidChoices) {
    const response = await request('/extensions/rules/add', {
      ...scoped,
      ...invalid,
    })
    expect(response.status).toBe(400)
    expect(await response.text()).toContain('選択した項目が見つかりません。')
  }
})
it('preserves legacy article dates and calculates ratings from votes on that product and article alone', async () => {
  await enable('articles')
  await studio()
  expect(await page('/articles')).toContain('記事はまだありません。')
  const article = {
    id: 'postage',
    product: 'studio',
    title: 'Postage rates',
    status: 'published',
    body: 'Shipping details',
  }
  const record = platform.DB.prepare('INSERT INTO articles_data VALUES(?,?)')
  const event = platform.DB.prepare(
    "INSERT INTO events(kind,actor,payload,at) VALUES('articles.helpful','{}',?,1)",
  )
  await platform.DB.batch([
    platform.DB.prepare(
      "INSERT INTO conversations(number,product,mailbox,contact,subject,status,created_at) VALUES(1,'studio','help@example.org','user@example.com','Postage question','open',1)",
    ),
    record.bind('article/studio/postage', JSON.stringify(article)),
    record.bind(
      'candidate/1',
      JSON.stringify({ number: 1, topic: 'Shipping to islands' }),
    ),
    ...[
      { product: 'studio', article: 'postage', helpful: true },
      { product: 'studio', article: 'postage', helpful: false },
      { product: 'studio', article: 'postage', helpful: 'yes' },
      { product: 'other', article: 'postage', helpful: true },
    ].map((value) => event.bind(JSON.stringify(value))),
  ])
  const contents = await page('/articles?filter=published')
  expect(contents).toContain('更新日未記録')
  expect(contents).toContain('役に立った 50%（2件）')
  expect(contents).toContain('/articles/candidates')
  expect(await page('/articles/candidates')).toContain('Shipping to islands')
  const drafts = await page('/articles?filter=draft')
  expect(drafts).toContain('条件に合う記事はありません。')
  expect(drafts).not.toContain('Postage rates')
})

it('compares matching Japanese calendar days, formats duration and percentage changes and handles an empty period', async () => {
  await enable('metrics')
  await studio()
  const days = [
    Date.parse('2025-05-04T16:00:00Z'),
    Date.parse('2025-05-05T16:00:00Z'),
  ]
  const record = platform.DB.prepare(
    'INSERT INTO events(number,kind,actor,payload,at) VALUES(?,?,\'{"kind":"operator","id":"admin@example.org"}\',?,?)',
  )
  const conversation = platform.DB.prepare(
    "INSERT INTO conversations(number,product,mailbox,contact,subject,status,created_at,closed_at) VALUES(?,'studio','help@example.org','reader@example.org','Help','closed',?,?)",
  )
  for (const [i, start] of days.entries()) {
    const number = i + 1
    const end = start + (i ? 120 : 15) * 60000
    await platform.DB.batch([
      conversation.bind(number, start, end),
      record.bind(number, 'conversation_opened', '{}', start),
      record.bind(number, 'conversation_viewed', '{}', start),
      record.bind(number, 'reply_queued', '{}', start + (i ? 8 : 10) * 60000),
      record.bind(number, 'status_changed', '{"to":"closed"}', end),
    ])
  }
  await record
    .bind(1, 'survey.answered', '{"resolved":false}', days[0] + 16 * 60000)
    .run()
  const report = (day: string) =>
    '/metrics?product=studio&period=custom&start=' + day + '&end=' + day
  const first = await page(report('2025-05-05'))
  expect(first).toContain('直前の同じ期間にこの指標の対象データがありません。')
  const next = await page(report('2025-05-06'))
  expect(next).toContain('2時間')
  expect(next).toContain('前期比 +1.8時間')
  expect(next).toContain('前期比 +100ポイント')
  expect(next).toContain('前期比 −2分')
  expect(next).toContain('前期比 変化なし')
  const empty = await page(report('2025-05-07'))
  expect(empty).toContain('選択した期間にこの指標の対象データがありません。')
  expect(await page('/metrics?period=7')).toContain(
    '両期間にこの指標の対象データがありません。',
  )
  expect((await request('/metrics?product=unknown')).status).toBe(404)
  expect(
    (await request('/metrics?period=custom&start=2025-05-08&end=2025-05-05'))
      .status,
  ).toBe(400)
})

it('keeps a legacy article suggestion scoped to the original conversation across simultaneous starts and deletion', async () => {
  await enable('articles')
  await studio()
  expect(
    await platform.DB.prepare(
      "SELECT name FROM sqlite_master WHERE name='articles_data'",
    ).first('name'),
  ).toBeNull()
  const [empty, missing] = await Promise.all([
    page('/articles/candidates'),
    request('/articles/new?candidate=999'),
  ])
  expect(empty).toContain('該当する記事の候補はありません。')
  expect(missing.status).toBe(404)
  await platform.DB.batch([
    platform.DB.prepare(
      "INSERT INTO conversations(number,product,mailbox,contact,subject,status,created_at) VALUES(1,'studio','help@example.org','reader@example.org','Original question','open',1)",
    ),
    platform.DB.prepare("INSERT INTO products VALUES('second','Second')"),
    platform.DB.prepare(
      "INSERT INTO articles_data VALUES('candidate/1',?)",
    ).bind(JSON.stringify({ number: 1, topic: 'Original suggestion' })),
  ])
  expect(await page('/articles/new?candidate=1')).toContain('Original question')
  const fields = {
    product: 'studio',
    number: '1',
    title: 'Guide',
    body: 'First answer',
    intent: 'draft',
  }
  expect(
    (await request('/articles/edit', { ...fields, product: 'second' })).status,
  ).toBe(404)
  const starts = await Promise.all([
    submit('/articles/edit', fields),
    submit('/articles/edit', { ...fields, body: 'Second answer' }),
  ])
  const addresses = starts.map((path) => new URL(path, origin))
  const id = addresses[0].searchParams.get('id')
  expect(id).toBeTruthy()
  expect(addresses[1].searchParams.get('id')).toBe(id)
  const saved = await page(starts[0])
  expect(saved).toContain('Original question')
  expect(saved).toMatch(/First answer|Second answer/)
  await submit('/articles/edit', { ...fields, body: 'Stale submission' })
  expect(await page(starts[0])).not.toContain('Stale submission')
  expect(await page('/articles/candidates?filter=started')).toContain(
    'Original suggestion',
  )
  expect(await page('/articles/candidates?filter=open')).not.toContain(
    'Original suggestion',
  )
  expect((await request('/articles/new?candidate=1')).status).toBe(302)
  await platform.DB.prepare('DELETE FROM conversations WHERE number=1').run()
  expect((await request('/articles/new?candidate=1')).status).toBe(404)
  expect(await page('/articles/candidates')).not.toContain(
    'Original suggestion',
  )
  expect(await page(starts[0])).not.toContain('Original question')
})

it('keeps an unlabelled voice cohort and its Japanese calendar month across pages, filters and extension availability', async () => {
  await enable('metrics')
  await studio()
  const insert = platform.DB.prepare(
    "INSERT INTO conversations(number,product,mailbox,contact,subject,status,created_at) VALUES(?,'studio','help@example.org','reader@example.org',?,'open',?)",
  )
  const midnight = Date.parse('2026-01-01T00:00:00+09:00')
  await platform.DB.batch([
    ...Array.from({ length: 24 }, (_, i) =>
      insert.bind(i + 1, 'Voice ' + (i + 1), midnight + (i - 1)),
    ),
    platform.DB.prepare(
      "INSERT INTO labels(number,name) VALUES(2,'ラベルなし')",
    ),
  ])
  const summary = await page('/voices?start=2026-01-01&end=2026-01-31')
  expect(summary).toContain('23件')
  expect(summary).toContain('unlabeled=1')
  expect(summary).toContain('label=' + encodeURIComponent('ラベルなし'))
  const path = '/voices/conversations?unlabeled=1&month=2026-01&product=studio'
  const first = await page(path)
  expect(first).toContain('22件')
  expect(first).toContain('unlabeled=1&amp;month=2026-01&amp;page=2')
  const last = await page(path + '&page=999')
  expect(last).toContain('Voice 3')
  expect(last).toContain('Voice 4')
  expect(last).not.toContain('Voice 2</strong>')
  expect(last).not.toContain('Voice 1</strong>')
  expect(await page('/voices/conversations?month=2025-12')).toContain(
    'Voice 1</strong>',
  )
  expect(await page('/voices?end=2020-01-01')).toContain(
    'この条件で届いた声はありません。',
  )
  expect((await request('/voices?start=2026-02-30')).status).toBe(400)
  expect(
    (await request('/voices?start=2026-11-04&end=2026-11-02')).status,
  ).toBe(400)
  expect(
    (await request('/voices/conversations?unlabeled=1&label=other')).status,
  ).toBe(400)
  await platform.DB.prepare(
    "UPDATE extension_settings SET enabled=0 WHERE id='metrics'",
  ).run()
  expect((await request('/voices')).status).toBe(404)
  expect((await request(path)).status).toBe(404)
})
