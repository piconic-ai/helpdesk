import { createServer } from 'node:http'
import { startScene } from '../ui/seed.mjs'
import { test, expect, capture, confirmSubmission } from './harness.mjs'

test.use({ extensions: ['articles', 'issues', 'metrics'] })

test('J5 記事をプレビューし公開してから返信に添える', async ({
  page,
  scene,
}) => {
  const title = '請求書の受け取り方'
  const body = '設定の「請求」から請求書をダウンロードできます。'
  await page.goto(scene.origin)
  await page.getByRole('link', { name: 'ヘルプ記事', exact: true }).click()
  await page.getByRole('link', { name: '記事を書く' }).click()
  await page
    .getByRole('combobox', { name: 'プロダクト', exact: true })
    .selectOption({ label: 'Slide' })
  await page.getByLabel('題名').fill(title)
  await page.getByLabel('本文').fill(body)
  await page.getByRole('button', { name: 'プレビュー' }).click()
  await expect(page.locator('article')).toContainText(body)
  await capture(page, 'J5', '01-preview', '公開される本文を確認')
  await page.getByRole('button', { name: '公開する' }).click()
  await confirmSubmission(page)
  await page.getByRole('link', { name: '公開記事を読む' }).click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await expect(page.getByText(body, { exact: true })).toBeVisible()
  const publicUrl = page.url()
  await capture(page, 'J5', '02-public', '公開ページで記事を読む')
  await page.goto(scene.origin)
  await page.getByRole('link', { name: /領収書の宛名を変更できますか/ }).click()
  await page
    .getByLabel('返信', { exact: true })
    .fill('こちらをご参照ください。')
  await page.getByRole('button', { name: '記事を添える' }).click()
  await page.getByLabel('記事の題名で検索').fill('請求書')
  await page.getByRole('button', { name: title, exact: true }).click()
  await page.getByRole('button', { name: 'プレビュー' }).click()
  await expect(page.getByText(publicUrl, { exact: false }).last()).toBeVisible()
  await capture(page, 'J5', '03-composer', '返信プレビューで記事のリンクを確認')
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('button', { name: '取り消す' })).toBeVisible()
  await expect(page.locator('article.message-outbound')).toContainText(
    publicUrl,
  )
  await capture(page, 'J5', '04-sent', '返信の本文に公開した記事リンクが残る')
})

test('J8 起票内容を確認し、Issue が閉じた通知案を承認する', async ({
  page,
  scene,
}) => {
  const summary = '請求書を表示するボタンが画面外に出ます。'
  await page.goto(scene.origin)
  await page.getByRole('link', { name: /領収書の宛名を変更できますか/ }).click()
  const panel = page.locator('[data-extension="issues"]')
  await panel.getByText('Issue を起票する', { exact: true }).click()
  await panel.getByLabel('タイトル').fill('領収書を見つけやすくする')
  await panel.getByLabel('公開する要約').fill(summary)
  await panel.getByRole('button', { name: '起票内容を確認' }).click()
  await expect(page.getByText(summary, { exact: false }).last()).toBeVisible()
  expect(scene.github.created).toHaveLength(0)
  await capture(page, 'J8', '01-preview', '送信先と公開する内容を確認')
  await page.getByRole('button', { name: '確認した内容で起票' }).click()
  await expect.poll(() => scene.github.created.length).toBe(1)
  expect(scene.github.created[0].body).toContain(summary)
  expect(scene.github.created[0].body).toContain(
    scene.origin + '/conversation/1',
  )
  await expect(
    page.locator('[data-extension="issues"] a[href*="github.com"]'),
  ).toBeVisible()
  await capture(page, 'J8', '02-linked', '起票した Issue を会話で確認')
  await scene.closeIssue()
  await expect(async () => {
    await page.reload()
    await expect(
      page.getByRole('button', { name: '承認して送信' }),
    ).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 15000 })
  await capture(page, 'J8', '03-draft', 'Issue のクローズ通知を下書きで確認')
  await page.getByRole('button', { name: '承認して送信' }).click()
  await confirmSubmission(page)
  await expect(async () => {
    await page.reload()
    await expect(
      page
        .locator('article.message-outbound')
        .filter({ hasText: '問題の修正が完了しました' }),
    ).toContainText('送信済み', { timeout: 1000 })
  }).toPass({ timeout: 15000 })
  await capture(
    page,
    'J8',
    '04-sent',
    '承認した終了通知が送信済みになったことを確認',
  )
})

test('J10 直近30日の指標を確認しプロダクトと期間を切り替える', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin)
  await page.getByRole('link', { name: '対応状況の集計' }).click()
  await expect(
    page.getByRole('combobox', { name: '期間', exact: true }),
  ).toHaveValue('30')
  const closed = page
    .getByText('完了件数', { exact: true })
    .locator('..')
    .locator('strong')
  await expect(closed).toHaveText('1')
  await capture(page, 'J10', '01-month', '過去30日の集計')
  await page
    .getByRole('combobox', { name: 'プロダクト', exact: true })
    .selectOption({ label: 'Desk' })
  await page
    .getByRole('combobox', { name: '期間', exact: true })
    .selectOption({ label: '過去7日' })
  await expect(page.getByRole('button', { name: '集計する' })).toHaveCount(0)
  await expect(
    page.getByRole('combobox', { name: '期間', exact: true }),
  ).toHaveValue('7')
  await expect(closed).toHaveText('0')
  await capture(page, 'J10', '02-product', '選択したプロダクトの過去7日間')
  await page
    .getByRole('combobox', { name: '期間', exact: true })
    .selectOption({ label: '日付を指定' })
  await page
    .getByRole('combobox', { name: 'プロダクト', exact: true })
    .selectOption({ label: 'Slide' })
  await page.getByRole('button', { name: '日付の範囲' }).click()
  await page.getByLabel('開始日').fill('2026-11-01')
  await page.getByLabel('終了日').fill('2026-11-15')
  await expect(page).toHaveURL(/end=2026-11-15/)
  await expect(page.getByLabel('開始日')).toHaveValue('2026-11-01')
  await expect(page.getByLabel('終了日')).toHaveValue('2026-11-15')
  await expect(closed).toHaveText('1')
  await capture(page, 'J10', '03-range', '日付で選んだ範囲の指標')
})

test.describe('会話の種別に対応する操作', () => {
  test.use({ extensions: ['feedback'] })
  test('問い合わせでフィードバック操作を隠し、直接送っても状態を変えない', async ({
    page,
    scene,
  }) => {
    await page.goto(scene.origin + '/conversation/1')
    await expect(
      page.getByRole('button', { name: '確認済みにする' }),
    ).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: '問い合わせに変更' }),
    ).toHaveCount(0)
    for (const op of ['review', 'convert']) {
      const res = await page.request.post(
        scene.origin + '/actions/feedback.' + op,
        {
          headers: { Origin: scene.origin, Accept: 'application/json' },
          form: { number: '1' },
        },
      )
      expect(res.status()).toBe(409)
    }
    const state = await scene.db
      .prepare('SELECT kind,status FROM conversations WHERE number=1')
      .first()
    expect(state).toEqual({ kind: 'inquiry', status: 'open' })
  })
})

test.describe('公開画面の埋め込み', () => {
  test.use({
    extensions: ['form', 'feedback', 'chat', 'articles'],
    scene: async ({ extensions }, use) => {
      let formUrl
      const server = createServer((_request, response) => {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        response.end('<!doctype html><iframe src="' + formUrl + '"></iframe>')
      })
      await new Promise((resolve, reject) =>
        server.once('error', reject).listen(0, '127.0.0.1', resolve),
      )
      const port = server.address().port
      const trusted = 'http://127.0.0.1:' + port
      const untrusted = 'http://localhost:' + port
      try {
        const scene = await startScene(extensions, '.', {
          embedOrigin: trusted,
        })
        try {
          formUrl = scene.origin + '/help/form/slide'
          await use({ ...scene, trusted, untrusted })
        } finally {
          await scene.stop()
        }
      } finally {
        await new Promise((resolve) => server.close(resolve))
      }
    },
  })
  test('ガイドに表示したコードで公開画面を埋め込み、未登録のサイトからは拒否する', async ({
    page,
    scene,
  }) => {
    const fronts = [
      ['form', 'お問い合わせ'],
      ['feedback', 'フィードバック'],
      ['chat', 'Slide'],
      ['articles', 'ヘルプ記事'],
    ]
    for (const [id, heading] of fronts) {
      await page.goto(scene.origin + '/extensions/' + id)
      const product = page.locator('section.settings-card').filter({
        has: page.getByRole('heading', { name: 'Slide', exact: true }),
      })
      const html = await product.getByLabel('埋め込みコード').inputValue()
      expect(html).toContain(id === 'chat' ? '<script' : '<iframe')
      await page.route(scene.origin + '/example-embed', (route) =>
        route.fulfill({ contentType: 'text/html; charset=utf-8', body: html }),
      )
      await page.goto(scene.origin + '/example-embed')
      if (id === 'chat')
        await page.getByRole('button', { name: 'ヘルプ', exact: true }).click()
      await expect(
        page.frameLocator('iframe').getByRole('heading', { level: 1 }),
      ).toContainText(heading)
      await page.unroute(scene.origin + '/example-embed')
    }
    await page.goto(scene.trusted)
    await expect(
      page.frameLocator('iframe').getByRole('heading', { level: 1 }),
    ).toHaveText('お問い合わせ')
    const refusal = page.waitForEvent('console', (m) =>
      m.text().includes('frame-ancestors'),
    )
    const blocked = page.waitForEvent(
      'requestfailed',
      (request) => request.url() === scene.origin + '/help/form/slide',
    )
    await page.goto(scene.untrusted)
    await Promise.all([blocked, refusal])
    await expect(page.frameLocator('iframe').getByRole('heading')).toHaveCount(
      0,
    )
  })
})
