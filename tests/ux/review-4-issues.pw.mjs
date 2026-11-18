import { test, expect, capture, confirmSubmission } from './harness.mjs'
import { startScene } from '../ui/seed.mjs'

test.use({ extensions: ['issues', 'metrics'] })

test('修正を知らせた会話だけを課題と集計に数える', async ({ page, scene }) => {
  for (const n of [1, 6]) {
    await page.goto(scene.origin + '/conversation/' + n)
    await page.getByRole('link', { name: '既存の Issue を選ぶ' }).click()
    await page.getByRole('button', { name: '既存の Issue と紐づける' }).click()
    await confirmSubmission(page)
    await expect(
      page.locator('[data-extension=issues] a[href*="github.com"]'),
    ).toBeVisible()
  }
  await page.getByRole('link', { name: '課題', exact: true }).click()
  const row = page
    .locator('[data-ui=form-section]')
    .filter({ has: page.getByRole('heading', { name: 'Inquiry #1' }) })
  await expect(row).toContainText('開いている')
  await expect(row).toContainText('紐づく声 2件')
  await expect(row.getByRole('link', { name: '会話 #6' })).toBeVisible()
  await capture(
    page,
    'review-4-issues',
    '01-open',
    '別々の2件の声が同じ課題に集まる',
  )
  await row.getByRole('link', { name: '会話 #1' }).click()
  await page.getByRole('button', { name: '完了にする', exact: true }).click()
  await page.getByRole('link', { name: '課題', exact: true }).click()
  await scene.closeIssue()
  await expect(async () => {
    await page.reload()
    await expect(row).toContainText('閉じた', { timeout: 1000 })
  }).toPass()
  await expect(row).toContainText('修正前30日 12.5%（1 / 8件）')
  await expect(row).toContainText('修正後30日 100%（1 / 1件）')
  await expect(row).toContainText('知らせた声 0件')
  await expect(row).toContainText('目安')
  await row.getByRole('link', { name: /会話 #1.*再開して承認/ }).click()
  const closedDraft = page
    .locator('article')
    .filter({ hasText: '問題の修正が完了しました' })
  await closedDraft.getByRole('button', { name: '下書きを破棄' }).click()
  await confirmSubmission(page)
  await expect(closedDraft).toHaveCount(0)
  await page.getByRole('link', { name: '課題', exact: true }).click()
  await expect(
    row.getByRole('link', { name: /会話 #1.*下書きを破棄/ }),
  ).toBeVisible()
  await row.getByRole('button', { name: '知らせる下書きを作る' }).click()
  await expect(page.getByRole('status')).toContainText(
    '知らせの下書きを用意しました',
  )
  await capture(
    page,
    'review-4-issues',
    '02-closure',
    '修正前後の比率と通知待ちの会話を確認',
  )
  await row.getByRole('link', { name: '会話 #1' }).click()
  await expect(page.getByRole('button', { name: '承認して送信' })).toHaveCount(
    0,
  )
  await page.getByRole('button', { name: '再開する', exact: true }).click()
  const draft = page
    .locator('article')
    .filter({ hasText: '問題の修正が完了しました' })
  await expect(draft.getByRole('button', { name: '承認して送信' })).toHaveCount(
    1,
  )
  await draft.getByRole('button', { name: '承認して送信' }).click()
  await confirmSubmission(page)
  await expect(async () => {
    await page.reload()
    await expect(draft).toContainText('送信済み', { timeout: 1000 })
  }).toPass()
  await page.getByRole('link', { name: '課題', exact: true }).click()
  await expect(row).toContainText('知らせた声 1件')
  await page.getByRole('link', { name: '対応状況の集計' }).click()
  const metric = page.locator('[data-ui=metric-card]').filter({
    has: page.getByRole('heading', { name: '声が改善に届いた割合' }),
  })
  await expect(metric.locator('strong')).toHaveText('10%')
  await page
    .getByRole('combobox', { name: 'プロダクト', exact: true })
    .selectOption('slide')
  await expect(metric.locator('strong')).toHaveText('11.1%')
  await expect(metric).toContainText('1件 / 9件')
  await metric
    .getByRole('button', { name: '声が改善に届いた割合の定義' })
    .focus()
  await expect(metric.getByRole('tooltip')).toContainText(
    '迷惑メールは除きます',
  )
  await capture(
    page,
    'review-4-issues',
    '03-delivered',
    '承認後に配送された会話を選択期間・プロダクトの分母で確認',
  )
  await page
    .getByRole('combobox', { name: 'プロダクト', exact: true })
    .selectOption('desk')
  await expect(metric.locator('strong')).toHaveText('0%')
})

test('設定が必要な会話から起票先とシークレットの設定方法を確認する', async ({
  browser,
}) => {
  const remote = await startScene(['issues'], '.', { githubToken: false })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  try {
    await page.goto(remote.origin + '/conversation/3')
    const panel = page.locator('[data-extension=issues]')
    await expect(panel).toContainText('リポジトリ、GITHUB_TOKEN')
    await expect(
      panel.getByRole('button', { name: 'Issue を起票する' }),
    ).toHaveCount(0)
    await capture(
      page,
      'review-4-issues',
      '04-missing',
      '会話に不足している設定と設定画面への導線が出る',
    )
    await panel.getByRole('link', { name: 'GitHub Issue の設定を開く' }).click()
    await expect(page.getByText(/GITHUB_TOKEN は未設定/)).toBeVisible()
    const desk = page
      .locator('[data-ui=form-section]')
      .filter({ has: page.getByRole('heading', { name: 'Desk', exact: true }) })
    await desk.getByLabel('GitHub リポジトリ').fill('example/desk')
    await desk.getByRole('button', { name: '登録する' }).click()
    await expect(page.getByRole('status')).toContainText('リポジトリを登録')
    await page.getByRole('link', { name: '拡張の管理に戻る' }).click()
    const entry = page.locator('[data-extension=issues]')
    await expect(entry).toContainText('設定が必要：GITHUB_TOKEN')
    await expect(entry).not.toContainText('Desk のリポジトリ')
    await capture(
      page,
      'review-4-issues',
      '05-settings',
      '登録後はまだ不足しているトークンだけを表示',
    )
  } finally {
    await page.close()
    await remote.stop()
  }
})

test('課題の拡張を無効にすると、一覧と下書き作成を利用できない', async ({
  scene,
  page,
}) => {
  await page.goto(scene.origin + '/extensions')
  await page.getByRole('switch', { name: 'GitHub Issueを無効にする' }).click()
  await confirmSubmission(page)
  await expect(
    page.getByRole('link', { name: '課題', exact: true }),
  ).toHaveCount(0)
  expect((await page.request.get(scene.origin + '/issues')).status()).toBe(404)
  expect(
    (
      await page.request.post(scene.origin + '/issues/drafts', {
        headers: { Origin: scene.origin },
        form: { repository: 'example/helpdesk', issue: '42', product: 'slide' },
      })
    ).status(),
  ).toBe(404)
})

test('同じ課題に複数のプロダクトから届いた声をまとめ、割合は製品単位で示す', async ({
  page,
  scene,
}) => {
  await scene.db
    .prepare("INSERT INTO issues_data VALUES('repository/desk',?)")
    .bind(JSON.stringify({ repo: 'example/helpdesk', origin: scene.origin }))
    .run()
  for (const number of [1, 3]) {
    await page.goto(scene.origin + '/extensions/issues/link/' + number)
    await page.getByRole('button', { name: '既存の Issue と紐づける' }).click()
    await confirmSubmission(page)
    await expect(
      page.locator('[data-extension=issues] a[href*="github.com"]'),
    ).toBeVisible()
  }
  await scene.closeIssue()
  await page.goto(scene.origin + '/issues')
  const title = page.getByRole('heading', { name: 'Inquiry #1' })
  await expect(title).toHaveCount(1)
  const row = page.locator('[data-ui=form-section]').filter({ has: title })
  await expect(async () => {
    await page.reload()
    await expect(row).toContainText('閉じた · 紐づく声 2件', { timeout: 1000 })
  }).toPass()
  await expect(row).toContainText('Slide · 閉じた · 紐づく声 1件')
  await expect(row).toContainText('Desk · 閉じた · 紐づく声 1件')
  await expect(
    row.getByText('プロダクトの声に占める割合（目安）', { exact: true }),
  ).toHaveCount(2)
})
