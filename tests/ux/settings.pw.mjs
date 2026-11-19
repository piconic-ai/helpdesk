import { customerContact } from './customer.mjs'
import { test, expect, capture, confirmSubmission } from './harness.mjs'

// Chromium's full browser includes the address autofill service.
test.use({ channel: 'chromium' })

async function inbox(page, scene) {
  await page.goto(scene.origin)
}
async function openFeedback(page) {
  await page
    .getByRole('link', { name: /^フィードバック/ })
    .first()
    .click()
}
async function publishFeedback(page, origin, body) {
  await page.goto(origin + '/help/feedback/slide')
  await page.getByLabel('ご意見・ご要望').fill(body)
  await customerContact(page)
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(/受け付けました（#\d+）/)
}

test.describe('公開受付', () => {
  test.use({ extensions: ['articles', 'chat', 'feedback'] })
  test('J6 記事を読んで、別の質問を問い合わせとして受け付ける', async ({
    page,
    scene,
  }) => {
    await page.goto(scene.origin + '/help/chat/slide')
    const ask = async (question) => {
      await page.getByLabel('質問').fill(question)
      await page.getByRole('button', { name: '質問する' }).click()
    }
    await ask('領収書を発行できますか？')
    await expect(
      page.getByRole('link', { name: '領収書を発行する' }),
    ).toBeVisible()
    await capture(page, 'J6', '01-articles', 'ユーザーに関連記事が表示される')
    await page.getByRole('link', { name: '領収書を発行する' }).click()
    const [article] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('link', { name: '新しいタブで開く' }).click(),
    ])
    await expect(article.getByRole('heading', { level: 1 })).toHaveText(
      '領収書を発行する',
    )
    await article.close()
    await page.getByRole('button', { name: 'やりとりに戻る' }).click()
    const question = 'カタログの印刷について相談したいです'
    await ask(question)
    await customerContact(page)
    await capture(
      page,
      'J6',
      '02-contact',
      '記事がないときは質問を引き継いで連絡先を確認',
    )
    await page.getByRole('button', { name: '送信', exact: true }).click()
    const receipt = page.getByRole('status')
    await expect(receipt).toHaveText(/問い合わせを受け付けました（#\d+）/)
    const number = (await receipt.innerText()).match(/#\d+/)[0]
    await capture(page, 'J6', '03-receipt', '問い合わせ番号を受け取る')
    await inbox(page, scene)
    const row = page.getByRole('link', { name: new RegExp(question) })
    await expect(row).toContainText(number)
    await row.click()
    await expect(page.locator('article.message-inbound')).toHaveText(
      /領収書を発行できますか？[\s\S]*カタログの印刷について相談したいです/,
    )
    await capture(
      page,
      'J6',
      '04-inquiry',
      '運営者は同じ番号の問い合わせを読める',
    )
  })

  test('J7 フィードバックを確認し、別の意見は問い合わせに変えて返信する', async ({
    page,
    scene,
  }) => {
    const first = '表示倍率の切り替えが便利です'
    const other = '印刷用の画面について相談したいです'
    await publishFeedback(page, scene.origin, first)
    await publishFeedback(page, scene.origin, other)
    await capture(
      page,
      'J7',
      '01-received',
      '利用者がフィードバックの受付番号を受け取る',
    )
    await inbox(page, scene)
    await openFeedback(page)
    await capture(page, 'J7', '02-inbox', '未確認のフィードバックが並ぶ')
    await page.getByRole('link', { name: new RegExp(first) }).click()
    await expect(page).toHaveURL((url) =>
      /^\/conversation\/\d+$/.test(url.pathname),
    )
    await page.getByRole('button', { name: '確認済みにする' }).click()
    await expect(page.getByRole('main')).toContainText('確認済み')
    await capture(page, 'J7', '03-reviewed', '1件目を確認済みにする')
    await openFeedback(page)
    await page.getByRole('link', { name: new RegExp(other) }).click()
    await page.getByRole('button', { name: '問い合わせに変更' }).click()
    await confirmSubmission(page)
    await page
      .getByRole('textbox', { name: '返信', exact: true })
      .fill('詳しい状況を教えていただけますか。')
    await page.getByRole('button', { name: '送信', exact: true }).click()
    await expect(
      page.getByRole('button', { name: '取り消す', exact: true }),
    ).toBeVisible()
    await expect(async () => {
      await page.reload()
      await expect(page.locator('[data-ui=attributes]')).toContainText(
        '返信待ち',
        { timeout: 500 },
      )
    }).toPass({ timeout: 20000 })
    await expect(
      page.locator('article').filter({ hasText: '詳しい状況' }),
    ).toBeVisible()
    await capture(
      page,
      'J7',
      '04-converted',
      '別の1件を問い合わせに変更して返信する',
    )
  })
})

test('J9 窓口を作成し、拡張の案内から新プロダクトの公開受付を開始する', async ({
  page,
  scene,
}) => {
  await inbox(page, scene)
  await page.getByRole('link', { name: '設定', exact: true }).click()
  await page.getByRole('link', { name: /^プロダクトと窓口/ }).click()
  await page.getByRole('link', { name: 'プロダクトを追加' }).click()
  await page.getByLabel('プロダクト名', { exact: true }).fill('Catalog')
  await page.getByLabel('窓口アドレスの先頭').first().fill('catalog')
  await page
    .getByLabel('送信ドメイン')
    .first()
    .selectOption({ label: 'example.com' })
  await page.getByRole('button', { name: '窓口を登録' }).click()
  await expect(page.getByRole('status')).toContainText('登録')
  await capture(page, 'J9', '01-mailbox', 'プロダクトと送信窓口を登録')
  await page.getByRole('link', { name: '拡張の管理', exact: true }).click()
  const card = page.locator('[data-extension=form]')
  await card.getByRole('switch', { name: /有効にする/ }).click()
  await expect(page.getByRole('dialog')).toContainText('使用する権限')
  await confirmSubmission(page)
  await card.getByRole('link', { name: '設定' }).click()
  const product = page
    .locator('section')
    .filter({
      has: page.getByRole('heading', { name: 'Catalog', exact: true }),
    })
    .last()
  await expect(product).toContainText('この端末で受付を試せます')
  await product.getByRole('button', { name: 'このサイトで受付を開始' }).click()
  await expect(product).toContainText('受付中')
  await capture(
    page,
    'J9',
    '02-guide',
    '拡張の案内にある公開URLと使い始め方を確認',
  )
  await product.getByRole('link', { name: '公開フォームを開く' }).click()
  await page.getByLabel('件名').fill('新しい窓口への相談')
  await page
    .getByLabel('お問い合わせ内容')
    .fill('届いているか確認してください。')
  await customerContact(page)
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(/受け付けました（#\d+）/)
  await capture(page, 'J9', '03-public', '公開フォームから受付番号を取得')
  await inbox(page, scene)
  await page.getByRole('link', { name: /新しい窓口への相談/ }).click()
  await expect(page.getByRole('main')).toContainText('catalog@example.com')
  await capture(page, 'J9', '04-inbox', '作成した窓口が新しい問い合わせを受信')
})

test('J11 候補から相手を選び、確認して会話を削除する', async ({
  page,
  scene,
}) => {
  await inbox(page, scene)
  await page.getByRole('link', { name: '設定', exact: true }).click()
  await page.getByRole('link', { name: /^連絡先のデータ削除/ }).click()
  const contacts = page.getByRole('combobox', { name: '削除する相手' })
  const label = await contacts
    .getByRole('option', { name: /customer7@example.net/ })
    .innerText()
  await contacts.selectOption({ label })
  await capture(page, 'J11', '01-contact', '削除する相手を名簿から選ぶ')
  await page.getByRole('button', { name: '削除内容を確認' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('customer7@example.net')
  await expect(dialog).toContainText('添付ファイル')
  await dialog.getByRole('button', { name: 'キャンセル' }).click()
  await expect(
    contacts.getByRole('option', { name: /customer7@example.net/ }),
  ).toHaveCount(1)
  await page.getByRole('button', { name: '削除内容を確認' }).click()
  await capture(page, 'J11', '02-confirm', '対象と削除範囲を確認する')
  await dialog.getByRole('button', { name: 'すべて削除' }).click()
  await expect(page.getByRole('status')).toContainText('削除')
  await expect(
    contacts.getByRole('option', { name: /customer7@example.net/ }),
  ).toHaveCount(0)
  await expect(
    contacts.getByRole('option', { name: /customer1@example.net/ }),
  ).toHaveCount(1)
  await capture(page, 'J11', '03-result', '選択した相手だけが削除される')
})

test('C 権限と表示名を保存し、不正な窓口は修正方法を表示する', async ({
  page,
  scene,
}) => {
  await inbox(page, scene)
  await page.getByRole('link', { name: '設定', exact: true }).click()
  await page.getByRole('link', { name: /^運営者/ }).click()
  await page
    .locator('details')
    .filter({ has: page.locator('section[aria-label="sato@example.com"]') })
    .locator('summary')
    .click()
  const owner = page.getByRole('region', { name: 'sato@example.com' })
  await expect(owner).toContainText('最後の管理者です。')
  await expect(owner.getByRole('combobox', { name: '権限' })).toHaveCount(0)
  const editor = page
    .locator('details')
    .filter({ has: page.locator('section[aria-label="mori@example.com"]') })
  await editor.locator('summary').click()
  const operator = page.getByRole('region', { name: 'mori@example.com' })
  await operator.getByLabel('表示名').fill('森 直子')
  await operator.getByLabel('権限').selectOption({ label: '管理者' })
  await operator.getByRole('button', { name: '運営者を保存' }).click()
  await editor.locator('summary').click()
  await expect(editor.locator('summary')).toHaveAccessibleName('編集：森 直子')
  await expect(operator.getByLabel('表示名')).toHaveValue('森 直子')
  await expect(operator.getByLabel('権限')).toHaveValue('admin')
  await page.reload()
  await editor.locator('summary').click()
  await expect(editor.locator('summary')).toHaveAccessibleName('編集：森 直子')
  await expect(operator.getByLabel('表示名')).toHaveValue('森 直子')
  await capture(
    page,
    'C-settings',
    '01-role',
    '運営者の表示名と権限を変更して再読み込みで確認',
  )
  await page.getByRole('link', { name: '設定に戻る' }).click()
  await page.getByRole('link', { name: /^プロダクトと窓口/ }).click()
  await page.getByRole('link', { name: 'プロダクトを追加' }).click()
  const form = page.locator('form[action="/settings/mailboxes"]')
  await form.getByRole('button', { name: '窓口を登録' }).click()
  await expect(form.getByLabel('プロダクト名')).toBeFocused()
  await expect(form.getByLabel('プロダクト名')).toHaveAccessibleDescription(
    'この項目を入力してください。',
  )
  await expect(form.getByLabel('プロダクト名')).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  await expect(
    form.getByText('この項目を入力してください。').first(),
  ).toBeVisible()
  await capture(
    page,
    'C-settings',
    '02-invalid',
    '未入力の欄に修正方法が表示される',
  )
})
