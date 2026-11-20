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
  await expect(main.locator('article svg.trend')).toHaveCount(7)
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
  await expect(time).toHaveCount(0)
  await expect(time.locator('circle')).toHaveCount(0)
  await expect(selfResolution).toHaveCount(0)
  await expect(selfResolution.locator('circle')).toHaveCount(0)
  await page.goto(scene.origin + '/voices?start=2025-06-02&end=2025-06-04')
  const products = main
    .getByRole('heading', { name: 'プロジェクト別' })
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

test('同じ GitHub Issue を共有する6プロジェクトの課題と紐づく声を区別する', async ({
  page,
  scene,
}) => {
  await seedReviewIssues(scene.db)
  const db = scene.db
  const product = db.prepare('INSERT INTO products(id,name) VALUES(?,?)')
  const mailbox = db.prepare(
    'INSERT INTO mailboxes(address,product) VALUES(?,?)',
  )
  const enableIssues = db.prepare(
    "INSERT INTO project_extension_settings(product,extension,enabled,enabled_by) VALUES(?,'issues',1,'sato@example.com')",
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
      enableIssues.bind(id),
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
  const rows = page
    .getByRole('table', { name: '直した', exact: true })
    .locator('tbody tr')
  await expect(rows).toHaveCount(6)
  const other = rows.filter({ hasText: '製品2' })
  await expect(other.locator('.product-mark')).toHaveCount(1)
  await other.getByRole('link').click()
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('product') === 'other2',
  )
  await expect(page.locator('main .heading-description')).toContainText('製品2')
  await expect(page.locator('main a[href="/conversation/502"]')).toBeVisible()
  await expect(page.locator('main a[href="/conversation/501"]')).toHaveCount(0)
  await page.getByRole('link', { name: '課題の一覧に戻る' }).click()
  await expect(rows).toHaveCount(1)
})

test('375pxの集計条件で長いプロジェクト名と期間の選択値を全文読める', async ({
  page,
  scene,
}) => {
  const name = '法人のお客様向けワークスペース管理・利用状況集計サービス'
  await scene.db
    .prepare('UPDATE products SET name=? WHERE id=?')
    .bind(name, 'slide')
    .run()
  await page.setViewportSize({ width: 375, height: 812 })
  const product = page.getByRole('button', { name: /^プロジェクト：/ })
  for (const path of [
    '/metrics?product=slide&period=custom&start=2026-11-01&end=2026-11-18',
    '/voices?product=slide',
  ]) {
    await page.goto(scene.origin + path)
    await expect(product).toContainText(name)
    const selected = product.locator('.product-mark-name')
    await expect(selected).toHaveText(name)
    expect(
      await selected.evaluate((label) => {
        const select = label.closest('button').getBoundingClientRect()
        const text = document.createRange()
        text.selectNodeContents(label)
        return [...text.getClientRects()].every(
          (line) =>
            line.left >= select.left &&
            line.right <= select.right &&
            line.top >= select.top &&
            line.bottom <= select.bottom,
        )
      }),
    ).toBe(true)
    if (path.startsWith('/metrics')) {
      const period = page.getByRole('combobox', { name: '期間', exact: true })
      await expect(period).toHaveValue('custom')
      expect(
        await period.evaluate((select) => {
          const ctx = document.createElement('canvas').getContext('2d')
          const style = getComputedStyle(select)
          ctx.font = style.font
          const labelWidth = ctx.measureText(
            select.selectedOptions[0].textContent,
          ).width
          return (
            select.clientWidth -
              parseFloat(style.paddingLeft) -
              parseFloat(style.paddingRight) >=
            labelWidth
          )
        }),
      ).toBe(true)
      await page.getByRole('button', { name: '日付の範囲' }).click()
      await expect(page.getByLabel('開始日')).toHaveValue('2026-11-01')
      await expect(page.getByLabel('終了日')).toHaveValue('2026-11-18')
    }
  }
})

test('運営者の現地日付で期間を区切り、当日ここまでに完了した会話だけを数える', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/account')
  await page
    .getByLabel('集計の時間帯')
    .fill('America/Los_Angeles', { timeout: 3000 })
  await page.getByRole('button', { name: 'アカウントを保存' }).click()
  await expect(page).toHaveURL(/saved=yes/)
  await page.goto(scene.origin + '/metrics?period=7')
  await expect(page.locator('input[name=start]')).toHaveValue('2026-11-11')
  await expect(page.locator('input[name=end]')).toHaveValue('2026-11-17')
  const closed = page
    .locator('[data-ui=metric-card]')
    .filter({
      has: page.getByRole('heading', { name: '完了件数', exact: true }),
    })
    .locator('strong')
  const before = Number.parseInt(await closed.innerText(), 10)
  for (const [number, end] of [
    [1, '2026-11-18T04:59:00Z'],
    [2, '2026-11-18T05:59:00Z'],
  ]) {
    const event = scene.db.prepare(
      "INSERT INTO events(number,kind,actor,payload,at) VALUES(?,?,'{}',?,?)",
    )
    await scene.db.batch([
      event.bind(number, 'conversation_opened', '{}', Date.parse(end) - day),
      event.bind(
        number,
        'status_changed',
        JSON.stringify({ to: 'closed' }),
        Date.parse(end),
      ),
    ])
  }
  await page.reload()
  await expect(closed).toHaveText(String(before + 1))
})
