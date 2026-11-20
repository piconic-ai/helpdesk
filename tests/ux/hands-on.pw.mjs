import { choose } from './choice.mjs'
import { chapter } from './handbook.mjs'
import { customerContact } from './customer.mjs'
import { capture, confirmSubmission, expect, test } from './harness.mjs'

test.use({ channel: 'chromium', demo: true })

const button = (page, name) => page.getByRole('button', { name, exact: true })
const row = (page, n) =>
  page
    .locator('a.conversation-row')
    .filter({ has: page.getByText(new RegExp('^[A-Z]{2,5}-' + n + '$')) })
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
  await expect(page.locator('select[name=sort]')).toHaveValue('waiting')
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
  await page.waitForURL((url) => url.searchParams.get('query') === '領収書', {
    waitUntil: 'load',
  })
  await expect(row(page, 1)).toBeVisible()
  await expect(row(page, 4)).toHaveCount(0)
  await search.fill('')
  await expect(page).toHaveURL(scene.origin + '/')
  await expect(row(page, 4)).toBeVisible()
  await button(page, '絞り込み').click()
  await button(page, '担当者 すべて').click()
  await button(page, '佐藤 優').click()
  await expect(page).toHaveURL(/assignee=/)
  await expect(row(page, 4)).toBeVisible()
  const assignee = page.getByRole('link', { name: '佐藤 優を外す' })
  await assignee.click()
  await expect(assignee).toHaveCount(0)
  await button(page, '絞り込み').click()
  await choose(page, 'ラベル', '請求')
  await expect(page).toHaveURL(/label=/)
  await expect(row(page, 4)).toBeVisible()
  await expect(row(page, 6)).toHaveCount(0)
  await page.getByRole('link', { name: '請求を外す' }).click()
  await expect(row(page, 6)).toBeVisible()
}

async function answer(page) {
  await row(page, 6).click()
  await button(page, '担当者を選ぶ').click()
  await button(page, '佐藤 優').click()
  await expect(
    page.getByRole('status').filter({ hasText: '担当' }),
  ).toBeVisible()
  await button(page, 'ラベルを選ぶ').click()
  await button(page, '請求を付ける').click()
  await expect(page.locator('[data-ui=attributes]')).toContainText('請求')
  const reply = page.getByRole('textbox', { name: '返信', exact: true })
  const suggestions = page.getByRole('region', { name: '返信の候補' })
  await suggestions.getByRole('button', { name: '確認中のお知らせ' }).click()
  await expect(reply).toHaveValue(/Slide の担当者が確認しています/)
  await reply.press('ControlOrMeta+End')
  await reply.press('Enter')
  await reply.pressSequentially(
    'こちらの記事で、領収書を発行する手順をご確認ください。',
  )
  await button(page, '記事を添える').click()
  await page.getByLabel('記事の題名で検索').fill('領収書')
  await button(page.locator('#reply-articles'), '領収書を発行する').click()
  await expect(reply).toHaveValue(/\/help\/articles\/slide\/receipt/)
  await button(page, 'プレビュー').click()
  const preview = page.getByRole('region', { name: '返信のプレビュー' })
  await expect(preview).toContainText('support@example.com')
  await expect(preview).toContainText('customer6@example.net')
  await expect(preview).toContainText(
    'Re: 購入手続き後に届いたメールのご確認 [SLD-6]',
  )
  await record(
    page,
    '02-preview',
    '問い合わせ SLD-6 に記事を添え、窓口・宛先・番号付き件名を確認',
  )
  await button(page, '送信して完了').click()
  await expect(
    button(page.getByRole('form', { name: '送信予定の通知' }), '取り消す'),
  ).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(async () => {
    await page.reload()
    await expect(page.locator('[data-ui=attributes]')).toContainText('完了', {
      timeout: 500,
    })
  }).toPass({ timeout: 15000 })
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
  await expect(page.getByRole('dialog')).toHaveCount(0)
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
    .poll(
      () =>
        scene.db
          .prepare(
            "SELECT body FROM messages WHERE id='reply-5' AND delivery='sent'",
          )
          .first('body'),
      { timeout: 24000 },
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
  await customer.getByRole('link', { name: /領収書を発行する/ }).click()
  const opened = customer.waitForEvent('popup')
  await customer.getByRole('link', { name: '新しいタブで開く' }).click()
  const article = await opened
  await expect(article.getByRole('heading', { level: 1 })).toHaveText(
    '領収書を発行する',
  )
  await button(article, 'いいえ').click()
  await expect(article.getByRole('status')).toContainText('評価')
  await article.close()
  await button(customer, 'やりとりに戻る').click()
  await button(customer, '解決しなかった').click()
  await customerContact(customer)
  await button(customer, '送信').click()
  const receipt = customer.getByRole('status')
  await expect(receipt).toContainText(
    /問い合わせを受け付けました（[A-Z]{2,5}-\d+）/,
  )
  const number = Number((await receipt.textContent()).match(/SLD-(\d+)/)[1])
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
  await expect(page).toHaveURL((url) =>
    /^\/conversation\/\d+$/.test(url.pathname),
  )
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
  await button(slide, 'リポジトリを更新').click()
  await expect(page.getByRole('status')).toContainText('リポジトリを登録')
  await page
    .getByRole('navigation', { name: '受信箱', exact: true })
    .getByRole('link', { name: /未対応/ })
    .click()
  await row(page, number).click()
  const panel = page.locator('[data-extension=issues]')
  await button(panel, '課題を起票する').click()
  const summary = '領収書の発行手順を見つけやすくします。'
  await panel.getByLabel('タイトル').fill('領収書を見つけやすくする')
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
  await page.getByText('既存の課題を選ぶ', { exact: true }).click()
  await page.getByLabel('題で探す').fill('領収書を見つけやすくする')
  await expect(
    page.getByRole('combobox', { name: '課題', exact: true }).locator('option'),
  ).toHaveText([/領収書を見つけやすくする/])
  await button(page, '既存の課題と紐づける').click()
  await confirmSubmission(page)
  const articles = page.locator('[data-extension=articles]')
  await button(articles, '記事候補を書く').click()
  await articles.getByLabel('記事にする内容').fill('領収書発行の案内')
  await button(articles.locator('form'), '記事の候補に追加').click()
  await page.getByRole('link', { name: /^課題(?:\s*\d+)?$/ }).click()
  await page
    .getByRole('link', { name: '領収書を見つけやすくする', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: '紐づく声 2件' }),
  ).toBeVisible()
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
  await choose(page, 'プロダクト', 'slide')
  await page.waitForURL(
    (url) =>
      url.pathname === '/metrics' &&
      url.searchParams.get('product') === 'slide',
    { waitUntil: 'load' },
  )
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
  await page.getByRole('radio', { name: '日数を指定' }).check()
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

test('ハンズオンの例示データで SLD-6 の回答から内部メモ・再送・承認・設定へ進める', async ({
  page,
  scene,
}) => {
  test.slow()
  await test.step(chapter('H01', '絞り込み'), () => readInbox(page, scene))
  await test.step(chapter('H02', '記事を添える', '送信して完了'), () =>
    answer(page),
  )
  await test.step(
    chapter('H03', '内部メモ') + ' / ' + chapter('H04', '再送'),
    () => noteAndRetry(page),
  )
  await test.step(chapter('H05', '承認して送信'), () => approve(page, scene))
  const number = await test.step(
    chapter('H06', '質問する') + ' / ' + chapter('H07', '確認済みにする'),
    () => publicVoices(page, scene),
  )
  await test.step(
    chapter('H08', '起票内容を確認') + ' / ' + chapter('H09', '対応状況の集計'),
    () => issueAndMetrics(page, scene, number),
  )
  await test.step(chapter('H10', '保存期間'), () => settings(page))
})
