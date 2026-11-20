import { test, expect } from './harness.mjs'

test.use({ demo: true })
test('ページを読み直さず受信箱・会話・課題を移動して戻れる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/')
  const sidebar = await page.locator('#navigation').elementHandle()
  const row = page.locator('a.conversation-row[href="/conversation/1"]')
  const url = await row.getAttribute('href')
  const requested = Promise.withResolvers()
  const waiting = Promise.withResolvers()
  await page.route(
    scene.origin + url,
    async (route) => {
      requested.resolve()
      await waiting.promise
      await route.continue()
    },
    { times: 1 },
  )
  try {
    await row.click({ noWaitAfter: true })
    await requested.promise
    await expect(row).toBeVisible()
  } finally {
    waiting.resolve()
  }
  await expect(page.locator('.thread-toolbar')).toBeVisible()
  expect(
    await sidebar.evaluate(
      (el) => el === document.getElementById('navigation'),
    ),
  ).toBe(true)
  await page.getByRole('tab', { name: '内部メモ' }).click()
  await expect(page.locator('textarea[data-draft-slot=note]')).toBeVisible()
  await page
    .locator('#navigation')
    .getByRole('link', { name: /^課題(?:\s*\d+)?$/ })
    .click()
  await expect(page).toHaveURL(scene.origin + '/issues?product=slide')
  await expect(
    page.locator(
      '#navigation a[aria-current=page][href="/issues?product=slide"]',
    ),
  ).toBeVisible()
  await page.goBack()
  await expect(page.locator('.thread-toolbar')).toBeVisible()
  await page.goForward()
  await expect(page.getByRole('link', { name: '課題を追加' })).toBeVisible()
  expect(await sidebar.evaluate((el) => el.isConnected)).toBe(true)
})

test('公開記事の一覧と本文を同じ文書で開き、製品の窓口へ移れる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/help/articles/slide/')
  const header = await page.locator('header.public-header').elementHandle()
  const article = page
    .locator('main a[href*="/help/articles/slide/receipt"]')
    .first()
  await article.click()
  await expect(page).toHaveURL(/\/receipt$/)
  expect(await header.evaluate((el) => el.isConnected)).toBe(true)
  await page.goBack()
  await expect(article).toBeVisible()
  await page.getByRole('link', { name: 'お問い合わせ', exact: true }).click()
  await expect(page).toHaveURL(/\/help\/form\/slide$/)
  await expect(page.locator('form[method=post]')).toBeVisible()
})

test('375pxで遅い遷移の後から選んだページを表示し、メニューを再び開ける', async ({
  page,
  scene,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(scene.origin)
  const main = await page.locator('#main').elementHandle()
  const pending = Promise.withResolvers()
  const release = Promise.withResolvers()
  await page.route(
    scene.origin + '/issues',
    async (route) => {
      pending.resolve()
      await release.promise
      await route.continue()
    },
    { times: 1 },
  )
  const menu = page.getByRole('button', { name: 'メニューを開く' })
  const drawer = page.locator('#nav-drawer')
  await menu.click()
  try {
    await drawer.locator('a[href="/issues"]').click()
    await pending.promise
    await drawer.locator('a[href="/settings"]').click()
    await expect(page).toHaveURL(/\/settings$/)
    await expect(drawer).not.toBeVisible()
  } finally {
    release.resolve()
  }
  await menu.click()
  await expect(drawer.locator('a[href="/settings"]')).toHaveAttribute(
    'aria-current',
    'page',
  )
  await drawer.getByRole('button', { name: 'メニューを閉じる' }).click()
  await expect(drawer).not.toBeVisible()
  expect(await main.evaluate((el) => el.isConnected && !el.inert)).toBe(true)
})

test('返信後は同じ会話で配送結果まで更新される', async ({ page, scene }) => {
  await page.goto(scene.origin + '/conversation/1')
  const sidebar = await page.locator('#navigation').elementHandle()
  const text = '領収書の更新を確認しました。'
  await page.getByRole('textbox', { name: '返信', exact: true }).fill(text)
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(
    page
      .getByRole('form', { name: '送信予定の通知' })
      .getByRole('button', { name: '取り消す' }),
  ).toBeVisible()
  const message = page
    .locator('article.message-outbound')
    .filter({ hasText: text })
  await expect(message).toContainText('送信済み', { timeout: 24000 })
  expect(await sidebar.evaluate((el) => el.isConnected)).toBe(true)
})

test('遷移先のモジュールを待つ間に編集した下書きと最初のキー操作を保つ', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/?view=approval')
  const loading = Promise.withResolvers()
  const release = Promise.withResolvers()
  await page.route(
    '**/ReplyComposer*.js',
    async (route) => {
      loading.resolve()
      await release.promise
      await route.continue()
    },
    { times: 1 },
  )
  await page
    .locator('a.conversation-row[href*="/conversation/5"]')
    .first()
    .click()
  const edit = page.locator('form[id="approve-reply-5"] textarea')
  const wording = '契約を更新する前日まで、人数を変更できます。'
  try {
    await loading.promise
    await edit.fill(wording)
    await expect(edit).toHaveValue(wording)
    await page.getByRole('tab', { name: '返信', exact: true }).focus()
    await page.keyboard.press('ArrowRight')
  } finally {
    release.resolve()
  }
  await expect(page).toHaveURL(/\/conversation\/5/)
  await expect(
    page.getByRole('tab', { name: '内部メモ', exact: true }),
  ).toBeFocused()
  await expect(edit).toHaveValue(wording)
  await page.reload()
  await expect(edit).toHaveValue(wording)
  await page.locator('button[form="approve-reply-5"]').click()
  const confirmation = page.getByRole('dialog')
  await expect(confirmation).toContainText(wording)
  await confirmation.getByRole('button', { name: '承認して送信' }).click()
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
    .toBe(wording)
})
