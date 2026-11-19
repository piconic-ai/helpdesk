import { test, expect } from './harness.mjs'
import { seedReviewIssues } from '../ui/review-issue-seed.mjs'

test.use({ extensions: ['issues', 'metrics', 'feedback'] })
const day = 86400000
const monday = Date.parse('2025-06-02T00:00:00+09:00')

test('集計の推移は日本時間の受付・完了件数を示し、対象のない時間には点を描かない', async ({
  page,
  scene,
}) => {
  const moved = scene.db.prepare(
    'UPDATE conversations SET created_at=? WHERE number=?',
  )
  const event = scene.db.prepare(
    "INSERT INTO events(number,kind,actor,payload,at) VALUES(?,?,'{}',?,?)",
  )
  const presentation = scene.db.prepare(
    `INSERT INTO suggestion_presentations(id,product,surface,question,articles,at) VALUES(?,'slide','chat','領収書の発行方法',?,?)`,
  )
  const article = JSON.stringify([{ id: 'receipt', score: 0.9 }])
  const solved = crypto.randomUUID()
  await scene.db.batch([
    presentation.bind(solved, article, monday),
    presentation.bind(crypto.randomUUID(), article, monday + 2 * day),
    scene.db
      .prepare(
        "INSERT INTO suggestion_reactions(presentation,action,article,at) VALUES(?,'resolved','receipt',?)",
      )
      .bind(solved, monday + 1),
    moved.bind(monday, 1),
    moved.bind(monday, 2),
    moved.bind(monday + 2 * day, 8),
    moved.bind(monday, 3),
    moved.bind(monday, 9),
    event.bind(1, 'conversation_opened', '{}', monday),
    event.bind(1, 'status_changed', '{"to":"closed"}', monday + 3600000),
    event.bind(8, 'conversation_opened', '{}', monday + 2 * day),
    event.bind(
      8,
      'status_changed',
      '{"to":"closed"}',
      monday + 2 * day + 7200000,
    ),
  ])
  await page.goto(
    scene.origin +
      '/metrics?period=custom&start=2025-06-04&end=2025-06-04&product=slide',
  )
  const main = page.getByRole('main')
  await expect(main.locator('article svg.trend')).toHaveCount(8)
  const selfResolution = main.getByRole('img', {
    name: /^待たずに解決できた割合の推移/,
  })
  await expect(selfResolution).toHaveAccessibleName(
    /2025\/6\/2 100%、2025\/6\/3 記録なし、2025\/6\/4 0%/,
  )
  const time = main.getByRole('img', { name: /^解決までの平均時間の推移/ })
  await expect(time).toHaveAccessibleName(
    /2025\/6\/2 1時間、2025\/6\/3 記録なし、2025\/6\/4 2時間/,
  )
  const closed = main.getByRole('img', { name: /^完了件数の推移/ })
  await expect(closed).toHaveAccessibleName(
    /2025\/6\/2 1、2025\/6\/3 0、2025\/6\/4 1/,
  )
  await page.goto(
    scene.origin +
      '/metrics?period=custom&start=2025-06-04&end=2025-06-04&product=desk',
  )
  await expect(time).toHaveAccessibleName(/記録がありません/)
  await expect(time.locator('circle')).toHaveCount(0)
  await expect(selfResolution).toHaveAccessibleName(/記録がありません/)
  await expect(selfResolution.locator('circle')).toHaveCount(0)
  await page.goto(scene.origin + '/voices?start=2025-06-02&end=2025-06-04')
  const products = main
    .getByRole('heading', { name: 'プロダクト別' })
    .locator('..')
  const row = (name) =>
    products.getByRole('link', { name, exact: true }).locator('..')
  await expect(
    row('Slide').getByRole('img', { name: /件数の推移/ }),
  ).toHaveAccessibleName(/2025\/6\/2 2件、2025\/6\/3 0件、2025\/6\/4 1件/)
  await expect(row('Slide').locator('.count-bar rect')).toHaveAttribute(
    'width',
    '100%',
  )
  const share = await row('Desk')
    .locator('.count-bar rect')
    .getAttribute('width')
  expect(Number.parseFloat(share)).toBeCloseTo(100 / 3)
  const months = main.getByRole('heading', { name: '受付月別' }).locator('..')
  await expect(
    months.getByRole('img', { name: /件数の推移/ }),
  ).toHaveAccessibleName(/2025\/6\/2 3件、2025\/6\/3 0件、2025\/6\/4 1件/)
  await expect(months.locator('.count-bar')).toHaveCount(0)
})

test('課題一覧と関連情報は同じ印で、声の主には同じアイコンを出す', async ({
  page,
  scene,
}) => {
  await seedReviewIssues(scene.db)
  await page.goto(scene.origin + '/issues')
  for (const id of ['issue_open', 'issue_fixed', 'issue_notify'])
    await expect(
      page.locator('main h2 [data-glyph="' + id + '"]'),
    ).toBeVisible()
  await page.goto(scene.origin + '/issues/example/helpdesk/43')
  const avatar = page
    .getByRole('img', { name: '差出人 山田 花', exact: true })
    .first()
  await expect(avatar).toBeVisible()
  const color = await avatar.getAttribute('data-identity-color')
  for (const [number, state] of [
    [1, 'issue_notify'],
    [6, 'issue_fixed'],
    [11, 'issue_open'],
  ]) {
    await page.goto(scene.origin + '/conversation/' + number)
    const panel = page.locator('[data-extension="issues"]').first()
    await expect(panel.locator('[data-glyph="' + state + '"]')).toBeVisible()
    if (number === 1)
      await expect(
        page.locator('.message-inbound .contact-avatar').first(),
      ).toHaveAttribute('data-identity-color', color)
  }
})

test('6製品の声が集まった課題は一覧で5個まで示し、詳細で全製品を確認できる', async ({
  page,
  scene,
}) => {
  await seedReviewIssues(scene.db)
  const db = scene.db
  const product = db.prepare('INSERT INTO products(id,name) VALUES(?,?)')
  const mailbox = db.prepare(
    'INSERT INTO mailboxes(address,product) VALUES(?,?)',
  )
  const conversation = db.prepare(
    "INSERT INTO conversations(number,product,mailbox,contact,subject,status,created_at) VALUES(?,?,?,?,?,'open',?)",
  )
  const link = db.prepare('INSERT INTO issues_data(key,value) VALUES(?,?)')
  const statements = []
  for (let i = 0; i < 5; i++) {
    const id = 'other' + i,
      address = id + '@example.net',
      number = 500 + i
    statements.push(
      product.bind(id, '製品' + i),
      mailbox.bind(address, id),
      conversation.bind(
        number,
        id,
        address,
        'reader@example.net',
        '領収書について',
        monday,
      ),
      link.bind(
        'link/example/helpdesk/43/' + number,
        JSON.stringify({ repository: 'example/helpdesk', issue: 43, number }),
      ),
    )
  }
  await db.batch(statements)
  await page.goto(scene.origin + '/issues')
  const names = page
    .getByRole('table', { name: '直した', exact: true })
    .locator('.issue-products')
  await expect(names.locator('.product-mark')).toHaveCount(5)
  await expect(names).toContainText('ほか1件')
  await page.goto(scene.origin + '/issues/example/helpdesk/43')
  const detail = page.locator('main .heading-description .issue-products-line')
  await expect(detail).toHaveCount(2)
  await expect(detail.nth(0).locator('.product-mark')).toHaveCount(5)
  await expect(detail.nth(1).locator('.product-mark')).toHaveCount(1)
})
