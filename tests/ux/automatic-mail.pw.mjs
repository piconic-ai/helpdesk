import { choose } from './choice.mjs'
import { test, expect, capture } from './harness.mjs'

test.use({ extensions: ['auto-ack', 'survey'] })
for (const policy of ['auto-ack', 'survey']) {
  const receipt = policy === 'auto-ack'
  test(
    (receipt ? '自動受付返信' : '解決アンケート') +
      'の承認者と送信例を確認して製品別の文面を保存する',
    async ({ page, scene }) => {
      const path = '/extensions/' + policy
      const wording = receipt
        ? '受付しました。サポートからの返信をお待ちください。'
        : 'お困りごとは解決しましたか？ ご意見をお聞かせください。'
      const preview = page.locator('pre.message-body')
      await page.goto(scene.origin + '/extensions')
      await page
        .locator('[data-extension="' + policy + '"]')
        .getByRole('link', { name: '設定' })
        .click()
      await expect(
        page.getByText('有効にした運営者：', { exact: false }),
      ).toContainText('sato@example.com')
      await expect(page.locator('main time')).toHaveAttribute(
        'datetime',
        '2026-11-04T05:00:00.000Z',
      )
      await choose(page, 'プロジェクト', 'slide')
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('product') === 'slide',
      )
      await expect(
        page.getByText('承認の対象は、すべてのプロジェクトです。'),
      ).toBeVisible()
      await page.getByLabel('自動送信の案内の言語').selectOption('ja')
      const body = page.getByRole('textbox', { name: /^本文/ })
      await body.fill(wording)
      await page.reload()
      await expect(page.getByLabel('自動送信の案内の言語')).toHaveValue('ja')
      await expect(body).toHaveValue(wording)
      await page
        .getByRole('button', { name: 'プレビュー', exact: true })
        .click()
      await expect(preview).toContainText(wording)
      await expect(preview).toContainText('[SLD-123]')
      await expect(preview).toContainText('自動送信')
      if (!receipt)
        await expect(preview).toContainText('/help/survey/slide/example')
      await expect(page.getByText('保存前のプレビューです。')).toBeVisible()
      await capture(
        page,
        'review-4-mail',
        policy + '-preview',
        '自動送信の承認者と日時、保存前の文面と送信例',
      )
      await page.getByRole('link', { name: '取り消し' }).click()
      await expect(body).not.toHaveValue(wording)
      await expect(page.getByLabel('自動送信の案内の言語')).toHaveValue(
        receipt ? 'en' : 'ja',
      )
      await page.getByLabel('自動送信の案内の言語').selectOption('ja')
      await body.fill(wording)
      await page.getByRole('button', { name: '文面を保存' }).click()
      await expect(page.getByText('文面を保存しました。')).toBeVisible()
      await page.reload()
      await expect(preview).toContainText(wording)
      await capture(
        page,
        'review-4-mail',
        policy + '-saved',
        '保存した文面が当該プロジェクトのプレビューに反映',
      )
      await choose(page, 'プロジェクト', 'desk')
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('product') === 'desk',
      )
      await expect(preview).not.toContainText(wording)
      const number = receipt ? 12 : 6
      if (receipt) {
        await scene.receive({
          from: 'auto-test@example.net',
          subject: '受付文面の確認',
          body: '非公開のお問い合わせです。',
          messageId: '<re4-ack@example.net>',
        })
      } else {
        await page.goto(scene.origin + '/conversation/6')
        await page
          .getByRole('button', { name: '完了にする', exact: true })
          .click()
        await scene.scheduled()
      }
      await expect
        .poll(() =>
          scene.db
            .prepare(
              "SELECT body FROM messages WHERE number=? AND delivery='sent' AND json_extract(actor,'$.id')=?",
            )
            .bind(number, policy)
            .first('body'),
        )
        .toContain(wording)
      const sent = await scene.db
        .prepare(
          "SELECT body FROM messages WHERE number=? AND delivery='sent' AND json_extract(actor,'$.id')=?",
        )
        .bind(number, policy)
        .first('body')
      expect(sent).toContain('自動送信')
      await page.goto(scene.origin + '/conversation/' + number)
      await expect(
        page.getByText(wording, { exact: false }).first(),
      ).toBeVisible()
      await capture(
        page,
        'review-4-mail',
        policy + '-sent',
        '実際に受付または完了した会話で送信済みの文面を確認',
      )
    },
  )
}

test('解決アンケートの既定の案内と本文は窓口の言語に従う', async ({
  page,
  scene,
}) => {
  const url = scene.origin + '/extensions/survey?product=slide'
  const preview = page.locator('pre.message-body')
  await page.goto(url)
  await expect(preview).toContainText('お問い合わせは解決しましたか？')
  await page.goto(scene.origin + '/settings/mailboxes?edit=slide')
  await page.getByLabel('窓口の言語').selectOption('en')
  await page.getByRole('button', { name: '差出人を保存' }).click()
  await page.goto(url)
  await expect(preview).toContainText('Was your inquiry resolved?')
  await expect(page.getByLabel('自動送信の案内の言語')).toHaveValue('en')
})
