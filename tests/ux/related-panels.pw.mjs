import { test, expect, capture, confirmSubmission } from './harness.mjs'

test.use({ extensions: ['canned', 'snooze', 'merge'] })
test('C 会話で定型文を下書きにし、スヌーズを設定・解除して同じ相手の会話に統合する', async ({
  page,
  scene,
}) => {
  const inquiry = '領収書の宛名を変更できますか'
  const target = 'ワークスペースの招待メールについて'
  await page.getByRole('link', { name: new RegExp(inquiry) }).click()
  const panel = (id) => page.locator('[data-extension="' + id + '"]')
  const expand = async (id, label) => {
    await panel(id).getByRole('button', { name: label, exact: true }).click()
  }
  await expand('canned', '定型文を選ぶ')
  const templates = panel('canned').getByRole('combobox', { name: '定型文' })
  await templates.selectOption({ index: 0 })
  await panel('canned')
    .locator('form')
    .getByRole('button', { name: '定型文から下書きを作成' })
    .click()
  const draft = page.getByRole('textbox', { name: '下書きの本文' })
  await expect(draft).toHaveValue(/山田 花/)
  await expect(draft).toHaveValue(/Slide/)
  await capture(
    page,
    'C-panels',
    '01-draft',
    '相手の名前とプロダクト名が入った定型返信を下書きにする',
  )
  await page.getByRole('button', { name: 'その他の操作' }).click()
  await expand('snooze', 'スヌーズ')
  await panel('snooze')
    .getByLabel('再表示日時（日本時間）')
    .fill('2026-11-24T09:30')
  await panel('snooze')
    .locator('form')
    .getByRole('button', { name: '指定日時まで保留' })
    .click()
  await expect(panel('snooze')).toContainText('2026年11月24日')
  await expect(panel('snooze')).toContainText('9:30')
  await capture(page, 'C-panels', '02-snooze', '再表示する日時を日本時間で確認')
  const inbox = await page.context().newPage()
  try {
    await inbox.goto(scene.origin)
    const row = inbox.getByRole('link', { name: new RegExp(inquiry) })
    await expect(row).toHaveCount(0)
    await page.getByRole('button', { name: 'その他の操作' }).click()
    await expand('snooze', 'スヌーズ')
    await panel('snooze').getByRole('button', { name: '保留を解除' }).click()
    await inbox.reload()
    await expect(row).toBeVisible()
    await capture(
      inbox,
      'C-panels',
      '03-resumed',
      '保留を解除した会話が受信箱に戻る',
    )
  } finally {
    await inbox.close()
  }
  await expand('merge', '会話を統合')
  const related = panel('merge').getByRole('combobox', {
    name: '統合先の問い合わせ',
  })
  await expect(related.getByRole('option')).toHaveCount(1)
  const candidate = related.getByRole('option', { name: new RegExp(target) })
  await related.selectOption({ label: await candidate.innerText() })
  await capture(
    page,
    'C-panels',
    '04-candidate',
    '同じ窓口・連絡先の会話を件名で選ぶ',
  )
  await panel('merge')
    .locator('form')
    .getByRole('button', { name: '会話を統合' })
    .click()
  await confirmSubmission(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(target)
  const messages = page.locator('article')
  await expect(
    messages.filter({ hasText: 'メンバーを追加しました' }),
  ).toBeVisible()
  await expect(messages.filter({ hasText: '宛名を会社名に変更' })).toBeVisible()
  await capture(
    page,
    'C-panels',
    '05-merged',
    '統合先のスレッドに両方の問い合わせ本文が残る',
  )
  const labels = page.getByRole('button', { name: /^ラベル:/ })
  await labels.click()
  const inherited = page.getByRole('button', { name: '領収書を外す' })
  await inherited.click()
  await expect(labels).not.toContainText('領収書')
  await labels.click()
  await expect(inherited).toHaveCount(0)
  await expect(page.getByRole('button', { name: '経理を外す' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('link', { name: /^返信待ち/ }).click()
  const combined = page.getByRole('link', { name: new RegExp(target) })
  await expect.soft(combined).toContainText('Hello 山田 花')
  await expect
    .soft(combined.getByRole('img', { name: '承認待ち', exact: true }))
    .toBeVisible()
  await expect.soft(combined).toContainText('承認待ち')
  const approvals = page.getByRole('link', { name: /^承認待ち/ })
  await expect.soft(approvals).toHaveText(/承認待ち\s*2/)
  await approvals.click()
  await expect(combined).toBeVisible()
  await capture(
    page,
    'C-panels',
    '06-approval',
    '統合元のラベルを外した後も、未承認の定型返信を承認待ち一覧で探せる',
  )
})

test('保留の設定と解除は直前の状態へ戻せる', async ({ page, scene }) => {
  await page.goto(scene.origin + '/conversation/1')
  const panel = page.locator('[data-extension=snooze]')
  const open = async () => {
    await page.getByRole('button', { name: 'その他の操作' }).click()
    await panel.locator('[data-slot=popover-trigger]').click()
  }
  const defer = async () => {
    await open()
    await panel.getByLabel('再表示日時（日本時間）').fill('2026-11-24T09:30')
    await panel
      .locator('form')
      .getByRole('button', { name: '指定日時まで保留' })
      .click()
  }
  const undo = () =>
    page.getByRole('button', { name: '元に戻す', exact: true }).click()
  await defer()
  await undo()
  await expect(panel).toContainText('保留されていません')
  await defer()
  await open()
  await panel.getByRole('button', { name: '保留を解除' }).click()
  await undo()
  await expect(panel).toContainText('2026年11月24日')
})
