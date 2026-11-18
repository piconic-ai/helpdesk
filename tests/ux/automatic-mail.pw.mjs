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
      await page.getByLabel('プロダクト', { exact: true }).selectOption('slide')
      await page.getByRole('button', { name: 'プロダクトを表示' }).click()
      const body = page.getByRole('textbox', { name: /^本文/ })
      await body.fill(wording)
      await page
        .getByRole('button', { name: 'プレビュー', exact: true })
        .click()
      await expect(preview).toContainText(wording)
      await expect(preview).toContainText('[#123]')
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
      await body.fill(wording)
      await page.getByRole('button', { name: '文面を保存' }).click()
      await expect(page.getByText('文面を保存しました。')).toBeVisible()
      await page.reload()
      await expect(preview).toContainText(wording)
      await capture(
        page,
        'review-4-mail',
        policy + '-saved',
        '保存した文面が当該プロダクトのプレビューに反映',
      )
      await page.getByLabel('プロダクト', { exact: true }).selectOption('desk')
      await page.getByRole('button', { name: 'プロダクトを表示' }).click()
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
