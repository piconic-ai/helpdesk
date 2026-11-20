import { expect, test } from './harness.mjs'

test.describe('受付種別の一覧', () => {
  test.use({ extensions: ['feedback'] })

  test('375pxの承認待ちとフィードバックで検索の説明が1行に収まる', async ({
    page,
    scene,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    for (const view of ['approval', 'feedback']) {
      await page.goto(scene.origin + '/?view=' + view)
      const search = page.getByRole('searchbox', { name: '問い合わせを検索' })
      const box = await search.boundingBox()
      const filter = await page
        .getByRole('button', { name: '絞り込み' })
        .boundingBox()
      expect(box.y + box.height, view).toBeLessThanOrEqual(filter.y)
      expect(box.width, view).toBeGreaterThan(280)
    }
  })
})

test('受信箱は状態の重複を省き、入力から混在する検索結果へ移動して条件を外せる', async ({
  page,
  scene,
}) => {
  const row = (number) =>
    page.locator('.inbox-item[data-number="' + number + '"]')
  await expect(row(1).getByText('未対応', { exact: true })).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '検索', exact: true }),
  ).toHaveCount(0)
  await page
    .getByRole('searchbox', { name: '問い合わせを検索' })
    .fill('注文履歴')
  await expect(page).toHaveURL(/query=/)
  await expect(row(8).getByText('完了', { exact: true })).toBeVisible()
  await expect(page.getByRole('searchbox')).toBeFocused()
  await page.getByRole('link', { name: '検索「注文履歴」を外す' }).click()
  await expect(page).toHaveURL(scene.origin + '/')
  const link = row(1).locator('a.conversation-row')
  await expect(link).toHaveClass(/unread/)
  await link.click()
  await page.locator('.thread-toolbar > a').click()
  await expect(link).not.toHaveClass(/unread/)
  for (const part of ['.row-sender', '.row-subject']) {
    await expect(link.locator(part)).toHaveCSS('font-weight', '400')
  }
})

test('会話の前後へ移動し、候補のアイコンと印から現在の担当者を確認する', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/1')
  const next = page.getByRole('link', { name: '次の未対応へ' })
  const destination = new URL(await next.getAttribute('href'), scene.origin)
  await next.click()
  await expect(page).toHaveURL(destination.href)
  const previous = page.getByRole('link', { name: '前の未対応へ' })
  await expect(previous).toHaveAttribute('href', '/conversation/1')
  await previous.click()
  await expect(page).toHaveURL(/\/conversation\/1$/)
  await expect(
    page.getByRole('heading', { name: '領収書の宛名を変更できますか' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '担当者を選ぶ' }).click()
  await expect(
    page.getByRole('button', { name: '担当なし', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  const candidate = page.getByRole('button', { name: '森 直子', exact: true })
  await expect(candidate.locator('[role=img],img')).toBeVisible()
  await candidate.click()
  await page.getByRole('button', { name: /担当: 森 直子/ }).click()
  await expect(
    page.getByRole('button', { name: '森 直子', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('チェックボックスは2行の中央に揃い、返信とメモは矢印キーで切り替えられる', async ({
  page,
}) => {
  for (const width of [375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const row = page.locator('.inbox-item').first()
    const centerOffset = await row.evaluate((el) => {
      const box = el
        .querySelector('input[type=checkbox]')
        .getBoundingClientRect()
      const link = el.querySelector('a').getBoundingClientRect()
      return Math.abs(box.top + box.height / 2 - link.top - link.height / 2)
    })
    expect(centerOffset).toBeLessThanOrEqual(1)
  }
  await page.locator('a.conversation-row').first().click()
  const reply = page.getByRole('tab', { name: '返信', exact: true })
  const note = page.getByRole('tab', { name: '内部メモ', exact: true })
  await reply.focus()
  await page.keyboard.press('ArrowRight')
  await expect(note).toBeFocused()
  await expect(note).toHaveAttribute('aria-selected', 'true')
  await expect(
    page.getByRole('textbox', { name: '内部メモ', exact: true }),
  ).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(reply).toBeFocused()
  await expect(reply).toHaveAttribute('aria-selected', 'true')
})

test('返信欄の読み込み中に押した最初の矢印キーでもメモに切り替わる', async ({
  page,
  scene,
}) => {
  let release
  const loading = new Promise((resolve) => {
    release = resolve
  })
  await page.route('**/components/**/ReplyComposer*.js', async (route) => {
    await loading
    await route.continue()
  })
  await page.goto(scene.origin + '/conversation/1', { waitUntil: 'commit' })
  const reply = page.getByRole('tab', { name: '返信', exact: true })
  try {
    await reply.focus()
    await page.keyboard.press('ArrowRight')
  } finally {
    release()
  }
  const note = page.getByRole('tab', { name: '内部メモ', exact: true })
  await expect(note).toBeFocused()
  await expect(note).toHaveAttribute('aria-selected', 'true')
  await expect(
    page.getByRole('textbox', { name: '内部メモ', exact: true }),
  ).toBeVisible()
})

test('375pxの受信箱で検索の説明と差出人を読み、独立した件名の行から会話を選べる', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  const search = page.getByRole('searchbox', { name: '問い合わせを検索' })
  const bounds = await search.boundingBox()
  expect(bounds.width).toBeGreaterThan(280)
  const row = page.locator('.inbox-item[data-number="7"]')
  const sender = row
    .getByText('森 海斗さん', { exact: true })
    .filter({ visible: true })
  await expect(sender).toBeVisible()
  expect(await sender.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  )
  const title = row.locator('.row-subject')
  expect((await title.boundingBox()).width).toBeGreaterThan(140)
  await title.click()
  await expect(
    page.getByRole('heading', { name: '添付した利用明細について' }),
  ).toBeVisible()
})
