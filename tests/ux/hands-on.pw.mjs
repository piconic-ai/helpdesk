import { customerContact } from './customer.mjs'
import { allExtensionIds } from '../ui/daily-screens.mjs'
import { capture, confirmSubmission, expect, test } from './harness.mjs'

test.use({ channel: 'chromium', extensions: allExtensionIds })

const button = (page, name) => page.getByRole('button', { name, exact: true })
const row = (page, n) =>
  page
    .locator('a.conversation-row')
    .filter({ has: page.getByText('#' + n, { exact: true }) })
const record = (page, step, description) =>
  capture(page, 'hands-on', step, description)

async function readInbox(page, scene) {
  await expect(
    page.getByRole('link', { name: /佐藤 優 のアカウント/ }),
  ).toBeVisible()
  const rows = page.locator('a.conversation-row')
  const total = await rows.count()
  expect(total).toBeGreaterThan(1)
  await button(page, 'すべてのプロダクト').click()
  await page.getByRole('link', { name: 'Desk', exact: true }).click()
  await expect(rows).toHaveCount(1)
  await expect(row(page, 3)).toBeVisible()
  await button(page, 'Desk').click()
  await page
    .getByRole('link', { name: 'すべてのプロダクト', exact: true })
    .click()
  await expect(rows).toHaveCount(total)
  await expect(page.getByRole('combobox', { name: '並び順' })).toHaveValue(
    'waiting',
  )
  const waits = await rows
    .locator('time')
    .evaluateAll((times) => times.map((time) => Date.parse(time.dateTime)))
  expect(waits).toHaveLength(total)
  expect(waits).toEqual([...waits].sort((a, b) => a - b))
  await expect(row(page, 4)).toContainText('送信失敗')
  await expect(row(page, 5)).toContainText('承認待ち')
  await expect(
    row(page, 7).getByRole('img', { name: '添付あり' }),
  ).toBeVisible()
  await record(
    page,
    '01-inbox',
    '全製品の受信箱で待ち時間の順序と、添付・送信失敗・承認待ちを確認',
  )
  const search = page.getByRole('searchbox', { name: '問い合わせを検索' })
  await search.fill('領収書')
  await expect(page).toHaveURL(/query=/)
  await expect(row(page, 1)).toBeVisible()
  await expect(row(page, 4)).toHaveCount(0)
  await search.fill('')
  await expect(page).toHaveURL(scene.origin + '/')
  await button(page, '絞り込み').click()
  await button(page, '担当者 すべて').click()
  await button(page, '佐藤 優').click()
  await expect(page).toHaveURL(/assignee=/)
  await expect(row(page, 4)).toBeVisible()
  await page.getByRole('link', { name: '佐藤 優を外す' }).click()
  await button(page, '絞り込み').click()
  await page.getByRole('combobox', { name: 'ラベル' }).selectOption('請求')
  await expect(page).toHaveURL(/label=/)
  await expect(row(page, 4)).toBeVisible()
  await expect(row(page, 6)).toHaveCount(0)
  await page.getByRole('link', { name: '請求を外す' }).click()
}

async function answer(page) {
  await row(page, 6).click()
  await button(page, '担当者を選ぶ').click()
  await button(page, '佐藤 優').click()
  await expect(page.locator('main [role=status]').first()).toContainText('担当')
  await button(page, 'ラベルを選ぶ').click()
  await button(page, '請求を付ける').click()
  await expect(page.locator('[data-ui=attributes]')).toContainText('請求')
  const reply = page.getByRole('textbox', { name: '返信', exact: true })
  await reply.fill('こちらの記事で、領収書を発行する手順をご確認ください。')
  await button(page, '記事を添える').click()
  await page.getByLabel('記事の題名で検索').fill('領収書')
  await button(page, '領収書を発行する').click()
  await expect(reply).toHaveValue(/\/help\/articles\/slide\/receipt/)
  await button(page, 'プレビュー').click()
  const preview = page.getByRole('region', { name: '返信のプレビュー' })
  await expect(preview).toContainText('support@example.com')
  await expect(preview).toContainText('customer6@example.net')
  await expect(preview).toContainText(
    'Re: 購入手続き後に届いたメールのご確認 [#6]',
  )
  await record(
    page,
    '02-preview',
    '問い合わせ #6 に記事を添え、窓口・宛先・番号付き件名を確認',
  )
  await button(page, '送信して完了').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('customer6@example.net')
  await confirmSubmission(page)
  await expect(page.locator('[data-ui=attributes]')).toContainText('完了')
  await record(
    page,
    '02-complete',
    '返信を送信し完了した会話の状態と結果を確認',
  )
  await page.getByRole('link', { name: '次の未対応へ' }).click()
  await expect(page.locator('[data-ui=attributes]')).toContainText('未対応')
  await expect(page).not.toHaveURL(/\/conversation\/6(?:\?|$)/)
}

async function noteAndRetry(page) {
  await page.getByRole('tab', { name: '内部メモ' }).click()
  await expect(
    page
      .getByRole('region', { name: '返信欄' })
      .getByText('内部メモ（相手には送られません）', { exact: true }),
  ).toBeVisible()
  const note = '次回の案内は経理チームに確認済みです。'
  await page.getByRole('textbox', { name: '内部メモ' }).fill(note)
  await button(page, 'メモを残す').click()
  const entry = page.locator('.message-note').filter({ hasText: note })
  await expect(entry).toContainText('佐藤 優')
  await record(
    page,
    '03-internal-note',
    '次の未対応の会話で相手に送らないメモを保存',
  )
  await page
    .getByRole('navigation', { name: '受信箱', exact: true })
    .getByRole('link', { name: /未対応/ })
    .click()
  await expect(row(page, 4)).toContainText('送信失敗')
  await row(page, 4).click()
  await expect(
    page.getByText('宛先のメールサーバーが受信を拒否しました。'),
  ).toBeVisible()
  await button(page, '再送').click()
  await expect(page.getByRole('dialog')).toContainText('customer4@example.net')
  await confirmSubmission(page)
  await expect(async () => {
    await page.reload()
    await expect(
      page
        .locator('article')
        .filter({ hasText: '明細を確認してご案内いたします' }),
    ).toContainText('送信済み', { timeout: 600 })
  }).toPass({ timeout: 12000 })
  await record(
    page,
    '04-redelivered',
    '送信失敗の理由を確認し、再送したメッセージの送信済み表示を確認',
  )
}

async function approve(page, scene) {
  await page
    .getByRole('navigation', { name: '受信箱', exact: true })
    .getByRole('link', { name: /承認待ち/ })
    .click()
  await row(page, 5).click()
  const draft = page
    .locator('article')
    .filter({ has: page.getByRole('textbox', { name: '下書きの本文' }) })
  await expect(draft).toContainText('佐藤 優 の代理')
  await expect(draft).toContainText('承認待ち')
  const edited = '更新日の前日まで、メンバー数を変更できます。'
  await draft.getByRole('textbox', { name: '下書きの本文' }).fill(edited)
  await button(draft, '承認して送信').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('customer5@example.net')
  await expect(dialog).toContainText(edited)
  await record(
    page,
    '05-approval',
    'エージェントの下書きの代理人と承認先を確認し、送信前に編集',
  )
  await button(dialog, 'キャンセル').click()
  await expect(
    draft.getByRole('textbox', { name: '下書きの本文' }),
  ).toHaveValue(edited)
  expect(
    await scene.db
      .prepare("SELECT delivery FROM messages WHERE id='reply-5'")
      .first('delivery'),
  ).toBe('awaiting_approval')
  await button(draft, '下書きを破棄').click()
  await expect(page.getByRole('dialog')).toContainText('下書き1件')
  await button(page.getByRole('dialog'), 'キャンセル').click()
  await button(draft, '承認して送信').click()
  await confirmSubmission(page)
  await expect
    .poll(() =>
      scene.db
        .prepare(
          "SELECT body FROM messages WHERE id='reply-5' AND delivery='sent'",
        )
        .first('body'),
    )
    .toBe(edited)
  await page.reload()
  await expect(
    page.locator('article').filter({ hasText: edited }),
  ).toContainText('送信済み')
  await record(
    page,
    '05-sent',
    'キャンセル中は承認待ちを保ち、人が承認した編集内容だけを送信',
  )
}

async function publicVoices(page, scene) {
  const question = '領収書を発行したい'
  const customer = await page.context().newPage()
  await customer.goto(scene.origin + '/help/chat/slide')
  await customer.getByLabel('質問').fill(question)
  await button(customer, '質問する').click()
  const opened = customer.waitForEvent('popup')
  await customer.getByRole('link', { name: /領収書を発行する/ }).click()
  const article = await opened
  await expect(article.getByRole('heading', { level: 1 })).toHaveText(
    '領収書を発行する',
  )
  await button(article, 'いいえ').click()
  await expect(article.getByRole('status')).toContainText('評価')
  await article.close()
  await button(customer, '解決しなかったので問い合わせる').click()
  await customerContact(customer)
  await button(customer, '送信').click()
  const receipt = customer.getByRole('status')
  await expect(receipt).toContainText(/問い合わせを受け付けました（#\d+）/)
  const number = Number((await receipt.textContent()).match(/#(\d+)/)[1])
  await record(
    customer,
    '06-chat-receipt',
    '記事の評価後、同じ質問を引き継いだ問い合わせ番号を確認',
  )
  await page.goto(scene.origin)
  await expect(row(page, number)).toContainText(question)
  await customer.goto(scene.origin + '/help/feedback/slide')
  const feedback = '領収書を探しやすくしてほしいです'
  await customer.getByLabel('ご意見・ご要望').fill(feedback)
  await customerContact(customer)
  await button(customer, '送信').click()
  await expect(
    customer.getByText('フィードバックへの返信はありません。'),
  ).toBeVisible()
  await customer.close()
  await page
    .getByRole('link', { name: /^フィードバック/ })
    .first()
    .click()
  await page.getByRole('link', { name: new RegExp(feedback) }).click()
  await button(page, '確認済みにする').click()
  await expect(page.getByRole('main')).toContainText('確認済み')
  await record(
    page,
    '07-feedback',
    '公開フォームから届いた返信不要の声を確認済みにする',
  )
  return number
}

async function issueAndMetrics(page, scene, number) {
  await page.getByRole('link', { name: '拡張の管理', exact: true }).click()
  await page
    .locator('[data-extension=issues]')
    .getByRole('link', { name: '設定' })
    .click()
  const slide = page
    .locator('[data-ui=form-section]')
    .filter({ has: page.getByRole('heading', { name: 'Slide', exact: true }) })
  await slide.getByLabel('GitHub リポジトリ').fill('example/helpdesk')
  await button(slide, '登録する').click()
  await expect(page.getByRole('status')).toContainText('リポジトリを登録')
  await page
    .getByRole('navigation', { name: '受信箱', exact: true })
    .getByRole('link', { name: /未対応/ })
    .click()
  await row(page, number).click()
  const panel = page.locator('[data-extension=issues]')
  await button(panel, 'Issue を起票する').click()
  const summary = '領収書の発行手順を見つけやすくします。'
  await panel.getByLabel('公開する要約').fill(summary)
  await button(panel, '起票内容を確認').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText(summary)
  await expect(dialog).not.toContainText('reader@example.net')
  await expect(dialog).not.toContainText('領収書を発行したい')
  expect(scene.github.created).toHaveLength(0)
  await record(page, '08-issue-preview', '公開前に、要約と投稿先を確認')
  await button(dialog, '確認した内容で起票').click()
  await expect.poll(() => scene.github.created.length).toBe(1)
  await page
    .getByRole('navigation', { name: '受信箱', exact: true })
    .getByRole('link', { name: /未対応/ })
    .click()
  await row(page, 1).click()
  await page.getByRole('link', { name: '既存の Issue を選ぶ' }).click()
  await button(page, '既存の Issue と紐づける').click()
  await confirmSubmission(page)
  const articles = page.locator('[data-extension=articles]')
  await button(articles, '記事の候補に追加').click()
  await articles.getByLabel('記事にする内容').fill('領収書発行の案内')
  await button(articles.locator('form'), '記事の候補に追加').click()
  await page.getByRole('link', { name: '課題', exact: true }).click()
  await expect(page.getByRole('main')).toContainText('紐づく声 2件')
  await record(page, '08-issues', '同じ課題に紐づく2件の声を確認')
  await page.getByRole('link', { name: '対応状況の集計' }).click()
  for (const name of [
    '解決までの平均時間',
    '一度で解決した割合',
    '平均作業時間',
    '声が改善に届いた割合',
  ]) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  }
  await page
    .getByRole('combobox', { name: 'プロダクト', exact: true })
    .selectOption('slide')
  await page
    .getByRole('combobox', { name: '期間', exact: true })
    .selectOption('7')
  await expect(page).toHaveURL(/period=7/)
  await record(
    page,
    '09-metrics',
    '回答・完了・課題へつないだ後で製品別の指標と期間比較を見る',
  )
}

async function settings(page) {
  await page.getByRole('link', { name: /佐藤 優 のアカウント/ }).click()
  await expect(page.getByLabel('表示名')).toHaveValue('佐藤 優')
  await page.getByRole('link', { name: '設定', exact: true }).click()
  await page.getByRole('link', { name: /^プロダクトと窓口/ }).click()
  await expect(page.getByRole('main')).toContainText('support@example.com')
  await page.getByRole('link', { name: '設定に戻る' }).click()
  await page.getByRole('link', { name: /^保存期間/ }).click()
  await expect(page.getByRole('spinbutton')).toBeVisible()
  await record(page, '10-retention', '本文の保存期間を確認')
  await page.getByRole('link', { name: '設定に戻る' }).click()
  await page.getByRole('link', { name: /^連絡先のデータ削除/ }).click()
  await expect(page.getByRole('combobox')).toBeVisible()
  await page.getByRole('link', { name: '設定に戻る' }).click()
  await page.getByRole('link', { name: /^API トークンの管理/ }).click()
  const options = page
    .getByRole('combobox', { name: '発行する権限' })
    .locator('option')
  await expect(options).toHaveText([
    '閲覧',
    '閲覧・下書き',
    '閲覧・下書き・会話の管理',
  ])
  await record(
    page,
    '10-tokens',
    '運営者自身のAPIトークンに与えられる3種類の権限を確認',
  )
}

test('ハンズオンの例示データで #6 の回答から内部メモ・再送・承認・設定へ進める', async ({
  page,
  scene,
}) => {
  test.slow()
  await scene.db
    .prepare(
      'INSERT INTO operator_profiles(email, display_name) VALUES(?,?),(?,?)',
    )
    .bind('sato@example.com', '佐藤 優', 'mori@example.com', '森 直子')
    .run()
  await page.reload()
  await test.step('1 受信箱の順番と絞り込み', () => readInbox(page, scene))
  await test.step('2 記事を添付して送信、完了、次へ', () => answer(page))
  await test.step('3–4 内部メモと失敗した返信の再送', () => noteAndRetry(page))
  await test.step('5 AI の代理表示と下書きの確認', () => approve(page, scene))
  const number =
    await test.step('6–7 記事評価から同じ質問を問い合わせ、返信不要の声も受け付ける', () =>
      publicVoices(page, scene))
  await test.step('8–9 受け付けた問い合わせを課題につないで集計を見る', () =>
    issueAndMetrics(page, scene, number))
  await test.step('10 窓口・保持期間・削除・権限の読み取り', () =>
    settings(page))
})
