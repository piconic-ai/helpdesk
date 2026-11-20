import { choose } from './choice.mjs'
import { test, expect, capture, confirmSubmission } from './harness.mjs'
import { startScene } from '../ui/seed.mjs'

test.use({ extensions: ['issues', 'metrics'] })

test('W4 起票・題で紐づけ・修正の下書き・承認したお知らせを数える', async ({
  page,
  scene,
}) => {
  const title = '領収書の検索を改善する'
  await page.goto(scene.origin + '/issues')
  await page.getByRole('link', { name: '課題を追加' }).click()
  await choose(page, 'もとになる会話', '1')
  await page.getByLabel('タイトル').fill(title)
  await page.getByLabel('公開する要約').fill('検索条件の保存に対応する')
  await page.getByRole('button', { name: '起票内容を確認' }).click()
  await expect(page.getByRole('dialog')).toContainText(title)
  expect(scene.github.created).toEqual([])
  await confirmSubmission(page)
  await expect.poll(() => scene.github.created.length).toBe(1)
  await page.goto(scene.origin + '/conversation/6')
  await page.getByText('既存の課題を選ぶ', { exact: true }).click()
  await page.getByLabel('題で探す').fill('存在しない題')
  await expect(page.getByText('該当する課題はありません。')).toBeVisible()
  await page.getByLabel('題で探す').fill('検索を改善')
  await expect(
    page.getByRole('combobox', { name: /^課題(?:\s*\d+)?$/ }).locator('option'),
  ).toHaveCount(1)
  await expect(page).toHaveURL(/conversation\/6$/)
  await page.getByRole('button', { name: '既存の課題と紐づける' }).click()
  await confirmSubmission(page)
  await expect(
    page.locator('[data-extension=issues] a[href*="github.com"]'),
  ).toBeVisible()
  await page.locator('nav a[href="/issues"]').click()
  const main = page.getByRole('main')
  await expect(main.getByRole('row').filter({ hasText: title })).toContainText(
    '2件',
  )
  await main.getByRole('link', { name: title }).click()
  await expect(main.getByRole('link', { name: /SLD-6 / })).toBeVisible()
  await capture(
    page,
    'review-4-issues',
    '01-open',
    '別々の2件の声が同じ課題に集まる',
  )
  await main.getByRole('link', { name: /SLD-1 / }).click()
  await page.getByRole('button', { name: '完了にする', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '再開する', exact: true }),
  ).toBeVisible()
  await page.locator('nav a[href="/issues"]').click()
  await expect(page).toHaveURL(scene.origin + '/issues')
  await scene.closeIssue()
  const pending = main.getByRole('region', { name: /知らせる待ち/ })
  await expect(async () => {
    await page.reload()
    await expect(pending).toContainText(title, { timeout: 1000 })
  }).toPass()
  await pending.getByRole('link', { name: title }).click()
  await expect(main).toContainText('12.5%（1 / 8件）')
  await expect(main).toContainText('100%（1 / 1件）')
  await expect(main).toContainText('目安')
  await main.getByRole('link', { name: /SLD-1 .*再開して承認/ }).click()
  const closedDraft = page.locator('article').filter({ hasText: title })
  await closedDraft.getByRole('button', { name: '下書きを破棄' }).click()
  await confirmSubmission(page)
  await expect(closedDraft).toHaveCount(0)
  await page.locator('nav a[href="/issues"]').click()
  await pending.getByRole('link', { name: title }).click()
  await expect(
    main.getByRole('link', { name: /SLD-1 .*下書きを破棄/ }),
  ).toBeVisible()
  await main.getByRole('link', { name: '課題の一覧に戻る' }).click()
  await pending.getByRole('link', { name: '承認待ち 1件を確認する' }).click()
  await main.getByRole('button', { name: '下書きを作る' }).click()
  await expect(page.getByRole('status')).toContainText(
    '知らせの下書きを用意しました',
  )
  await capture(
    page,
    'review-4-issues',
    '02-closure',
    '修正前後の比率と通知待ちの会話を確認',
  )
  await main.getByRole('link', { name: /SLD-1 / }).click()
  await expect(page.getByRole('button', { name: '承認して送信' })).toHaveCount(
    0,
  )
  await page.getByRole('button', { name: '再開する', exact: true }).click()
  const draft = page.locator('article').filter({ hasText: title })
  await draft.getByRole('button', { name: '承認して送信' }).click()
  await confirmSubmission(page)
  await draft.getByRole('button', { name: '今すぐ送る' }).click()
  await expect(draft).toContainText('送信済み', { timeout: 15000 })

  await page.locator('nav a[href="/issues"]').click()
  await expect(pending).toContainText('2件の声のうち1件')
  await page.getByRole('link', { name: '対応状況の集計' }).click()
  const metric = page.locator('[data-ui=metric-card]').filter({
    has: page.getByRole('heading', { name: '声が改善に届いた割合' }),
  })
  await expect(metric.locator('strong')).toHaveText('10%')
  await choose(page, 'プロジェクト', 'slide')
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
    '承認後に配送された会話を選択期間・プロジェクトの分母で確認',
  )
  await choose(page, 'プロジェクト', 'desk')
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
      panel.getByRole('button', { name: '課題を起票する' }),
    ).toHaveCount(0)
    await capture(
      page,
      'review-4-issues',
      '04-missing',
      '会話に不足している設定と設定画面への導線が出る',
    )
    await panel.getByRole('link', { name: 'GitHub Issue の設定を開く' }).click()
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/extensions/issues' &&
        url.searchParams.get('product') === 'desk',
    )
    await expect(
      page.getByText(/GitHub の接続用トークンは未設定/),
    ).toBeVisible()
    const desk = page
      .locator('[data-ui=form-section]')
      .filter({ has: page.getByRole('heading', { name: 'Desk', exact: true }) })
    await desk.getByLabel('GitHub リポジトリ').fill('example/desk')
    await desk.getByRole('button', { name: '登録する' }).click()
    await expect(page.getByRole('status')).toContainText('リポジトリを登録')
    await page.getByRole('link', { name: 'プロジェクトの設定に戻る' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Desk')
    await page.getByRole('link', { name: '拡張の管理', exact: true }).click()
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
  await page
    .getByRole('switch', { name: 'GitHub Issueの提供を停止する' })
    .click()
  await confirmSubmission(page)
  await expect(
    page.getByRole('link', { name: /^課題(?:\s*\d+)?$/ }),
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

test('同じ課題に複数のプロジェクトから届いた声をまとめ、割合は製品単位で示す', async ({
  page,
  scene,
}) => {
  await scene.db
    .prepare("INSERT INTO issues_data VALUES('repository/desk',?)")
    .bind(
      JSON.stringify({
        repo: 'example/helpdesk',
        origin: 'https://helpdesk.example.test',
      }),
    )
    .run()
  for (const number of [1, 3]) {
    await page.goto(scene.origin + '/extensions/issues/link/' + number)
    await page.getByRole('button', { name: '既存の課題と紐づける' }).click()
    await confirmSubmission(page)
    await expect(
      page.locator('[data-extension=issues] a[href*="github.com"]'),
    ).toBeVisible()
  }
  await scene.closeIssue()
  await page.goto(scene.origin + '/issues')
  const table = page.getByRole('table', { name: '直した' })
  await expect(async () => {
    await page.reload()
    await expect(table).toContainText('領収書の一括ダウンロード', {
      timeout: 1000,
    })
  }).toPass()
  await expect(table.getByRole('row')).toHaveCount(2)
  await expect(table).toContainText('2件')
  await table.getByRole('link', { name: '領収書の一括ダウンロード' }).click()
  await expect(
    page.getByRole('heading', {
      name: 'Slide の修正前後（目安）',
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Desk の修正前後（目安）', exact: true }),
  ).toBeVisible()
})
