import { test, expect, confirmSubmission } from './harness.mjs'

test.use({ extensions: ['articles', 'issues', 'feedback'] })

test('提供の確認・切り替え・取り消し中も検索条件と周囲のカードを保つ', async ({
  page,
  scene,
}) => {
  const url = scene.origin + '/extensions?filter=disabled'
  await page.goto(url)
  const card = page.locator('#extension-snooze')
  const control = card.getByRole('switch')
  const surrounding = await page.locator('#extension-presence').elementHandle()
  await control.click()
  await page.getByRole('button', { name: 'キャンセル' }).click()
  await expect(control).toBeFocused()
  await expect(control).toHaveAttribute('aria-checked', 'false')
  await control.click()
  await confirmSubmission(page)
  await expect(card).toHaveCount(0)
  await expect(page).toHaveURL(url)
  await expect(page.getByRole('button', { name: '元に戻す' })).toBeFocused()
  expect(await surrounding.evaluate((node) => node.isConnected)).toBe(true)
  await page.getByRole('button', { name: '元に戻す' }).click()
  await expect(control).toHaveAttribute('aria-checked', 'false')
  await expect(control).toBeFocused()
  expect(await surrounding.evaluate((node) => node.isConnected)).toBe(true)
})

test('プロジェクトの無効化と再開でフォーカス、ほかのカード、ナビゲーションを保持する', async ({
  page,
  scene,
}) => {
  await page.setViewportSize({ width: 1280, height: 420 })
  await page.goto(scene.origin + '/settings/projects/slide/extensions')
  const card = page.locator('#extension-issues')
  const articles = await page.locator('#extension-articles').elementHandle()
  const helpLink = await page
    .getByRole('navigation', { name: '有効な拡張' })
    .getByRole('link', { name: 'ヘルプ記事' })
    .elementHandle()
  const issueLink = page
    .getByRole('navigation', { name: '有効な拡張' })
    .getByRole('link', { name: /課題/ })
  const feedback = page
    .getByRole('navigation', { name: '受信箱' })
    .getByRole('link', { name: /フィードバック/ })
  const disable = card.getByRole('button', { name: '無効にする' })
  const offset = await disable.evaluate((node) => {
    node.scrollIntoView({ block: 'center' })
    return scrollY
  })
  expect(offset).toBeGreaterThan(0)
  await disable.click()
  await expect(card.getByRole('button', { name: '有効にする' })).toBeFocused()
  await expect(
    card.getByRole('link', { name: '設定', exact: true }),
  ).toHaveCount(0)
  await expect(issueLink).toHaveCount(0)
  const position = await page.evaluate(() => ({
    top: scrollY,
    bottom: document.documentElement.scrollHeight - innerHeight,
  }))
  expect(position.top).toBe(Math.min(offset, position.bottom))
  await card.getByRole('button', { name: '有効にする' }).click()
  await expect(card.getByRole('button', { name: '無効にする' })).toBeFocused()
  await expect(
    card.getByRole('link', { name: '設定', exact: true }),
  ).toBeVisible()
  await expect(issueLink).toBeVisible()
  const setting = page.locator('#extension-feedback')
  await setting.getByRole('button', { name: '無効にする' }).click()
  await expect(feedback).toHaveCount(0)
  await setting.getByRole('button', { name: '有効にする' }).click()
  await expect(feedback).toBeVisible()
  expect(await articles.evaluate((node) => node.isConnected)).toBe(true)
  expect(await helpLink.evaluate((node) => node.isConnected)).toBe(true)
})

test.describe('スヌーズの利用設定', () => {
  test.use({ extensions: ['snooze', 'articles', 'issues', 'feedback'] })
  test('スヌーズを停止すると未対応に戻る会話の件数もその場で増える', async ({
    page,
    scene,
  }) => {
    await scene.db
      .prepare('INSERT OR REPLACE INTO snooze_data VALUES(?,?)')
      .bind(
        'until/1',
        JSON.stringify({ number: 1, until: Date.now() + 86_400_000 }),
      )
      .run()
    await page.goto(scene.origin + '/settings/projects/slide')
    await page.getByRole('link', { name: /^利用する拡張/ }).click()
    const card = page.locator('#extension-snooze')
    const count = page.locator(
      '.sidebar-views a[href*="status=open"] .sidebar-count',
    )
    const before = Number(await count.textContent())
    await card.getByRole('button', { name: '無効にする' }).click()
    await expect(count).toHaveText(String(before + 1))
    await card.getByRole('button', { name: '有効にする' }).click()
    await expect(count).toHaveText(String(before))
  })
})

test('続けて確定した変更は画面を離れても両方保存される', async ({
  page,
  scene,
}) => {
  const path = '/settings/projects/slide/extensions'
  await page.goto(scene.origin + path)
  const first = page.locator('#extension-articles form[data-extension-change]')
  const action = await first.getAttribute('action')
  const held = Promise.withResolvers()
  const release = Promise.withResolvers()
  await page.route(
    scene.origin + action,
    async (route) => {
      if (route.request().method() === 'POST') {
        held.resolve()
        await release.promise
      }
      await route.continue()
    },
    { times: 1 },
  )
  await first.getByRole('button', { name: '無効にする' }).click()
  await held.promise
  const second = page.locator('#extension-issues form[data-extension-change]')
  const secondAction = await second.getAttribute('action')
  const finished = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url() === new URL(secondAction, scene.origin).href,
  )
  try {
    await second.getByRole('button', { name: '無効にする' }).click()
    await expect(second).toHaveAttribute('aria-busy', 'true')
    await page.getByRole('link', { name: 'プロジェクトの設定に戻る' }).click()
    await expect(
      page.getByRole('link', { name: /^利用する拡張/ }),
    ).toBeVisible()
  } finally {
    release.resolve()
  }
  await finished
  await page.getByRole('link', { name: /^利用する拡張/ }).click()
  for (const id of ['articles', 'issues'])
    await expect(
      page
        .locator('#extension-' + id)
        .getByRole('button', { name: '有効にする' }),
    ).toBeVisible()
})
