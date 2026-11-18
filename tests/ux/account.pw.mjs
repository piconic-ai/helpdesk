import { test, expect, capture } from './harness.mjs'

test('J14 表示名とアイコンを保存し、担当・メモ・記録から同じ運営者を見分ける', async ({
  page,
  scene,
}) => {
  await page.getByRole('link', { name: /アカウント/ }).click()
  await page.getByLabel('表示名', { exact: true }).fill('青木 ゆり')
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 60
    canvas.height = 40
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#41596c'
    ctx.fillRect(0, 0, 60, 40)
    return canvas.toDataURL().split(',')[1]
  })
  await page.getByLabel('アイコン画像').setInputFiles({
    name: 'profile.png',
    mimeType: 'image/png',
    buffer: Buffer.from(png, 'base64'),
  })
  await page.getByRole('button', { name: 'アカウントを保存' }).click()
  const sidebar = page.getByRole('link', { name: /アカウント/ })
  await expect(sidebar).toContainText('青木 ゆり')
  const image = sidebar.locator('img')
  await expect.poll(() => image.evaluate((el) => el.naturalWidth)).toBe(96)
  await capture(
    page,
    'J14',
    '01-account',
    '保存した表示名と正方形の画像を確認する',
  )
  await page.goto(scene.origin + '/conversation/1')
  await page.getByRole('button', { name: '担当者を選ぶ' }).click()
  await page.getByRole('button', { name: '青木 ゆり', exact: true }).click()
  await expect(page.locator('[data-ui=attributes] img')).toBeVisible()
  await page.getByRole('tab', { name: '内部メモ', exact: true }).click()
  await page.getByRole('textbox', { name: '内部メモ' }).fill('確認中です。')
  await page.getByRole('button', { name: 'メモを残す' }).click()
  const note = page.locator('.message-note').filter({ hasText: '確認中です。' })
  await expect(note).toContainText('青木 ゆり')
  await expect(note.locator('img')).toBeVisible()
  const event = page
    .locator('.timeline-entry')
    .filter({ hasText: '担当者を変更' })
    .last()
  await expect(event).toContainText('青木 ゆり')
  await expect(event.locator('img')).toBeVisible()
  await capture(
    page,
    'J14',
    '02-conversation',
    '会話の見出し・メモ・操作記録で運営者を確認する',
  )
  await page.goto(scene.origin)
  const row = page
    .locator('.conversation-row')
    .filter({ hasText: '領収書の宛名' })
  await expect(row.getByRole('img', { name: /青木 ゆり/ })).toBeVisible()
  await capture(page, 'J14', '03-inbox', '一覧でも同じ担当者の画像を確認する')
  await page.getByRole('button', { name: '絞り込み', exact: true }).click()
  await page.getByRole('button', { name: /^担当者 すべて$/ }).click()
  const candidate = page
    .locator('#filter-assignee')
    .getByRole('button', { name: /青木 ゆり/ })
  await expect(candidate.locator('img')).toBeVisible()
  await candidate.click()
  await page.goto(scene.origin + '/conversation/5')
  const draft = page
    .locator('.message-outbound .actor-identity')
    .filter({ hasText: 'エージェント' })
  await expect(draft.locator('svg')).toBeVisible()
  await expect(draft.locator('img')).toHaveCount(0)
})

test('差出人名の設定と運営者名の公開可否が別プロダクトへ漏れず、送信プレビューに反映される', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/settings/mailboxes')
  const policy = page.locator('section.settings-card').filter({
    has: page.getByRole('heading', { name: 'Slide のメール差出人' }),
  })
  await policy.getByLabel('差出人名').fill('Slide サポート')
  await expect(policy.getByRole('checkbox')).not.toBeChecked()
  await policy.getByRole('button', { name: '差出人を保存' }).click()
  await expect(page.getByRole('status')).toContainText('差出人を保存')
  async function preview(number) {
    await page.goto(scene.origin + '/conversation/' + number)
    await page
      .getByRole('textbox', { name: '返信', exact: true })
      .fill('お知らせします。')
    await page.getByRole('button', { name: 'プレビュー', exact: true }).click()
    return page.getByRole('region', { name: '返信のプレビュー' })
  }
  const initial = await preview(1)
  await expect(initial).toContainText('Slide サポート <support@example.com>')
  await expect(initial).not.toContainText('sato')
  await page.goto(scene.origin + '/settings/mailboxes')
  await policy.getByRole('checkbox').check()
  await policy.getByRole('button', { name: '差出人を保存' }).click()
  await expect(await preview(1)).toContainText(
    'Slide サポート · sato <support@example.com>',
  )
  await expect(await preview(3)).not.toContainText('Slide サポート')
})
