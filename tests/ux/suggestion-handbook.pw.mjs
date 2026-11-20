import { choose } from './choice.mjs'
import { test, expect, confirmSubmission, capture } from './harness.mjs'
import { chapter } from './handbook.mjs'

test.use({ extensions: ['articles', 'chat', 'metrics'] })

test(
  chapter('H12', '記事を書く', '公開する', '質問する', '解決した'),
  async ({ scene, page }) => {
    const title = '共有リンクを作成する'
    await page.goto(scene.origin + '/articles')
    await page.getByRole('link', { name: '記事を書く' }).click()
    const editor = page.locator('form[action="/articles/edit"]')
    await choose(editor, 'プロジェクト', 'slide')
    await editor.getByLabel('題名').fill(title)
    await page
      .getByLabel(/要約/)
      .fill('編集画面から閲覧用の共有リンクを発行できます。')
    await page
      .getByLabel('本文')
      .fill('編集画面で「共有」を選び、「閲覧用リンクをコピー」を押します。')
    await page.getByRole('button', { name: '公開する' }).click()
    await confirmSubmission(page)
    await expect(page.getByText('記事を公開しました。')).toBeVisible()
    const reader = await page.context().newPage()
    await reader.goto(scene.origin + '/help/chat/slide')
    await reader
      .getByLabel('質問', { exact: true })
      .fill('共有リンクを発行したい')
    await reader.getByRole('button', { name: '質問する' }).click()
    await reader.getByRole('link', { name: title, exact: true }).click()
    await expect(reader.locator('#chat-reading article')).toContainText(
      '閲覧用リンクをコピー',
    )
    await reader.getByRole('button', { name: 'やりとりに戻る' }).click()
    await reader.getByRole('button', { name: '解決した', exact: true }).click()
    await expect(reader.getByRole('status')).toContainText('解決')
    await reader.close()
    await page.goto(scene.origin + '/metrics')
    const rate = page.locator('[data-ui=metric-card]').filter({
      has: page.getByRole('heading', { name: '待たずに解決できた割合' }),
    })
    await expect(rate).toContainText('100%')
    await capture(
      page,
      'H12',
      '01-resolved',
      '新しく公開した記事で利用者が解決した結果',
    )
  },
)
