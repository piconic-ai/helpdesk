import { test, expect, capture, confirmSubmission } from './harness.mjs'

const compose = (page) =>
  page.getByRole('textbox', { name: '返信', exact: true })
const status = (page) => page.locator('[data-ui=attributes]')
const notice = (page) => page.locator('main [role="status"]').first()

async function seeDelivery(page, body) {
  await expect(async () => {
    await page.reload()
    await expect(
      page
        .locator('article')
        .filter({ hasText: body })
        .getByText('送信済み', { exact: true }),
    ).toBeVisible({ timeout: 700 })
  }).toPass({ timeout: 12000 })
}

test('J1 新着メールを担当し、ラベルとプレビューを確認して返信する', async ({
  page,
  scene,
}) => {
  const subject = '希望日に納品できますか'
  const answer = 'ご希望の日にお届けします。'
  await scene.receive({
    subject,
    body: '来週の納品を希望します。',
    from: 'person@example.net',
    messageId: '<delivery-question@example.net>',
  })
  await page.goto(scene.origin)
  const incoming = page.getByRole('link', { name: new RegExp(subject) })
  await expect(incoming).toBeVisible()
  await capture(page, 'J1', '01-inbox', '受信した問い合わせを一覧で見つける')
  await incoming.click()
  await page.getByRole('button', { name: /担当: 担当なし/ }).click()
  await page.getByRole('button', { name: 'sato', exact: true }).click()
  await expect(notice(page)).toContainText('担当')
  await page.getByText('ラベルを選ぶ', { exact: true }).click()
  await page.getByRole('button', { name: '請求を付ける' }).click()
  await expect(page.locator('[data-ui=attributes]')).toContainText('請求')
  await capture(page, 'J1', '02-assignment', '見出しで担当者とラベルを設定する')
  await compose(page).fill(answer)
  await page.getByRole('button', { name: 'プレビュー', exact: true }).click()
  const preview = page.getByRole('region', { name: '返信のプレビュー' })
  await expect(preview).toContainText('support@example.com')
  await expect(preview).toContainText('person@example.net')
  await expect(preview).toContainText(
    new RegExp('Re: ' + subject + ' \\[#[0-9]+\\]'),
  )
  await expect(preview).toContainText(answer)
  await capture(
    page,
    'J1',
    '03-preview',
    '相手に届く差出人・宛先・件名と本文を確認する',
  )
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await confirmSubmission(page)
  await expect(notice(page)).toContainText('送信')
  await seeDelivery(page, answer)
  const current = new URL(page.url()).pathname
  await page.getByRole('link', { name: '次の未対応へ' }).click()
  await expect(status(page)).toContainText('未対応')
  expect(new URL(page.url()).pathname).not.toBe(current)
  await capture(page, 'J1', '04-next', '次の未対応の問い合わせへ進む')
})

test('J2 受信で再開し、返信して完了した後も相手の返信が届く', async ({
  page,
  scene,
}) => {
  const subject = 'ワークスペースの招待メールについて'
  const reply = {
    subject,
    from: 'customer2@example.net',
    inReplyTo: '<in-2@example.net>',
  }
  await scene.receive({
    ...reply,
    body: '招待メールはどこにありますか。',
    messageId: '<question-two@example.net>',
  })
  await page.goto(scene.origin)
  await page.getByRole('link', { name: new RegExp(subject) }).click()
  await expect(status(page)).toContainText('未対応')
  await expect(
    page.getByText('招待メールはどこにありますか。', { exact: true }),
  ).toBeVisible()
  await capture(
    page,
    'J2',
    '01-return',
    '返信待ちの会話が相手のメールで未対応に戻る',
  )
  const answer = '招待メールをもう一度お送りしました。'
  await compose(page).fill(answer)
  await page.getByRole('button', { name: '送信して完了' }).click()
  await confirmSubmission(page)
  await expect(notice(page)).toContainText('完了')
  await expect(status(page)).toContainText('完了')
  await seeDelivery(page, answer)
  await expect(page.getByText(/返信するには再開します/)).toBeVisible()
  await capture(
    page,
    'J2',
    '02-closed',
    '返信を送って会話を完了し、再開の案内を確認する',
  )
  await scene.receive({
    ...reply,
    body: '受け取りました。別の質問があります。',
    messageId: '<question-three@example.net>',
  })
  await page.reload()
  await expect(status(page)).toContainText('未対応')
  await expect(
    page.getByText('受け取りました。別の質問があります。', { exact: true }),
  ).toBeVisible()
  await capture(page, 'J2', '03-reopened', '完了後の返信が同じ会話を再開する')
  await page.getByRole('button', { name: '完了にする', exact: true }).click()
  await compose(page).fill('追加でご案内します。')
  await expect(status(page)).toContainText('未対応')
  await expect(compose(page)).toHaveValue('追加でご案内します。')
})

test('J3 失敗の理由を読んで再送する', async ({ page, scene }) => {
  await page.goto(scene.origin)
  const failed = page.getByRole('link', { name: /月額プランの明細/ })
  await expect(failed).toContainText('送信失敗')
  await capture(page, 'J3', '01-inbox', '一覧で送信失敗を見つける')
  const consoleAsset = Promise.withResolvers()
  await page.route('**/ui/console.js', async (route) => {
    await consoleAsset.promise
    await route.continue()
  })
  try {
    await failed.click({ noWaitAfter: true })
    await expect(
      page.getByText('宛先のメールサーバーが受信を拒否しました。'),
    ).toBeVisible()
    await capture(page, 'J3', '02-reason', '失敗した理由を確認する')
    await page
      .getByRole('button', { name: '再送', exact: true })
      .click({ noWaitAfter: true })
    await expect(page.locator('#action-confirmation')).toBeVisible()
  } finally {
    consoleAsset.resolve()
  }
  await confirmSubmission(page)
  await expect(notice(page)).toContainText('再送')
  await seeDelivery(page, '明細を確認してご案内いたします。')
  await capture(page, 'J3', '03-delivered', '再送した返信が送信済みになる')
})

test('J4 エージェントの下書きを直して承認し、別の下書きを破棄する', async ({
  page,
  scene,
}) => {
  await scene.db
    .prepare(
      "INSERT INTO messages(id,number,kind,body,actor,created_at,delivery) SELECT 'another-agent-draft',number,kind,'破棄する予定の下書き',actor,created_at+1,delivery FROM messages WHERE id='reply-5'",
    )
    .run()
  await page.goto(scene.origin)
  await page
    .getByRole('link', { name: /承認待ち/ })
    .first()
    .click()
  const pending = page.getByRole('link', { name: /チームプランの契約更新/ })
  await expect(pending).toContainText('承認待ち')
  await capture(page, 'J4', '01-approval', '承認待ちの一覧から対象を選ぶ')
  await pending.click()
  const review = page
    .locator('article')
    .filter({ hasText: '更新時にメンバー数を変更できます。' })
  const edited = '更新日の前日まで人数を変更できます。'
  await review.getByRole('textbox', { name: '下書きの本文' }).fill(edited)
  await capture(page, 'J4', '02-edit', '送信前に下書きの文面を修正する')
  await review.getByRole('button', { name: '承認して送信' }).click()
  await confirmSubmission(page)
  await seeDelivery(page, edited)
  const unwanted = page
    .locator('article')
    .filter({ hasText: '破棄する予定の下書き' })
  await unwanted.getByRole('button', { name: '下書きを破棄' }).click()
  await confirmSubmission(page)
  await expect(notice(page)).toContainText('破棄')
  await expect(unwanted).toHaveCount(0)
  expect(
    await scene.db
      .prepare(
        "SELECT count(*) AS n FROM messages WHERE id='another-agent-draft'",
      )
      .first('n'),
  ).toBe(0)
  await capture(
    page,
    'J4',
    '03-discard',
    '承認した返信だけを送り、不要な下書きを破棄する',
  )
})
