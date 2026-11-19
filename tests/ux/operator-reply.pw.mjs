import { expect, test } from './harness.mjs'

test('W1 送信して完了を取り消すと本文と状態を復元し、相手への配送も発生しない', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/1')
  const body = '取り消してから宛先を確認します。'
  const textarea = page.getByRole('textbox', { name: '返信', exact: true })
  await textarea.fill(body)
  await page.getByRole('button', { name: '送信して完了' }).click()
  const undo = page.getByRole('button', { name: '取り消す' })
  await expect(undo).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.reload()
  await undo.click()
  await expect(textarea).toHaveValue(body)
  await expect(page.locator('[data-ui=attributes]')).toContainText('未対応')
  await expect(page.locator('article').filter({ hasText: body })).toHaveCount(0)
  await scene.scheduled()
  expect(
    await scene.db
      .prepare(
        "SELECT count(*) n FROM events WHERE number=1 AND kind IN ('reply_sent','status_changed') AND at>=(SELECT at FROM events WHERE kind='reply_undone' AND number=1)",
      )
      .first('n'),
  ).toBe(0)
})

test('W1 長い差出人でも製品名が読め、最後の担当変更と拡張の表示名が分かる', async ({
  page,
  scene,
}) => {
  const row = page
    .locator('a.conversation-row')
    .filter({ has: page.getByText('#11', { exact: true }) })
  for (const width of [375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const product = row.locator('.row-product')
    await expect(product).toContainText('Slide')
    const fits = await product.evaluate(
      (el) => el.scrollWidth <= el.clientWidth,
    )
    expect(fits).toBe(true)
  }
  const actor = JSON.stringify({ kind: 'operator', id: 'sato@example.com' })
  const at = Date.UTC(2026, 10, 18, 5)
  const assignments = ['mori@example.com', null, 'sato@example.com']
  await scene.db.batch([
    ...assignments.map((to, i) =>
      scene.db
        .prepare(
          "INSERT INTO events(number,kind,actor,at,payload) VALUES(1,'assigned',?,?,?)",
        )
        .bind(actor, at + i * 1000, JSON.stringify({ to })),
    ),
    scene.db
      .prepare(
        "INSERT INTO messages(id,number,kind,body,actor,created_at,delivery) VALUES('w1-extension',1,'outbound','修正のお知らせ',?,?,'awaiting_approval')",
      )
      .bind(JSON.stringify({ kind: 'extension', id: 'issues' }), at + 10000),
  ])
  await page.goto(scene.origin + '/conversation/1')
  const changes = page
    .locator('.timeline-entry')
    .filter({ hasText: '担当者を変更' })
  await expect(changes).toHaveCount(1)
  await expect(changes).toContainText('sato')
  await expect(page.locator('.message-outbound .message-author')).toContainText(
    'GitHub Issue',
  )
  await page.getByText('操作履歴', { exact: true }).click()
  await expect(
    page.locator('details[open] li').filter({ hasText: '担当者を変更' }),
  ).toHaveCount(1)
})
