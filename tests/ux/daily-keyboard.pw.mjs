import { test, expect, capture } from './harness.mjs'

test('J15 キーボードだけで一覧から返信して次の未対応へ進む', async ({
  page,
}) => {
  await page.keyboard.press('?')
  const dialog = page.getByRole('dialog', { name: 'キーボード操作' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button')).toBeFocused()
  await page.keyboard.press('Escape')
  await page.keyboard.press('j')
  await expect(page.locator('a.conversation-row:focus')).toHaveCount(1)
  await page.keyboard.press('Enter')
  await page.waitForURL(/conversation\//)
  const first = new URL(page.url()).pathname
  await page.keyboard.press('n')
  await expect(
    page.getByRole('textbox', { name: '内部メモ', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await page.keyboard.press('r')
  const area = page.getByRole('textbox', { name: '返信', exact: true })
  await expect(area).toBeFocused()
  await area.pressSequentially('Keyboard reply. j k e a u ?')
  await capture(page, 'J15', '01-reply', 'キーボードで会話を開き、返信欄に入力')
  await page.keyboard.press('Control+Enter')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.waitForURL((url) => url.searchParams.get('notice') === 'reply', {
    waitUntil: 'load',
  })
  await expect(
    page
      .locator('.message-body')
      .filter({ hasText: 'Keyboard reply. j k e a u ?' }),
  ).toHaveCount(1)
  const next = page.getByRole('link', { name: '次の未対応へ' })
  for (
    let i = 0;
    i < 160 && !(await next.evaluate((el) => el === document.activeElement));
    i++
  )
    await page.keyboard.press('Tab')
  await expect(next).toBeFocused()
  await page.keyboard.press('Enter')
  await page.waitForURL((url) => url.pathname !== first, { waitUntil: 'load' })
  await capture(page, 'J15', '02-next', '次の未対応の会話に移動')
  await page.keyboard.press('u')
  await expect(page).toHaveURL(/\/$/)
})

test('返信とメモの入力途中で離れても会話別に保持する', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/1')
  await page
    .getByRole('textbox', { name: '返信', exact: true })
    .fill('まだ送信していません')
  await page.goto(scene.origin + '/conversation/2')
  await expect(
    page.getByRole('textbox', { name: '返信', exact: true }),
  ).toBeEmpty()
  await page.goto(scene.origin + '/conversation/1')
  await expect(
    page.getByRole('textbox', { name: '返信', exact: true }),
  ).toHaveValue('まだ送信していません')
})
