import { capture, expect, test } from './harness.mjs'

test('W5 管理者が窓口・運営者の権限・保存期間を設定し、選んだ相手のデータだけを削除する', async ({
  page,
  scene,
}) => {
  await page.getByRole('link', { name: '設定', exact: true }).click()
  const back = page.getByRole('link', { name: '設定に戻る' })
  await page.getByRole('link', { name: /^プロダクトと窓口/ }).click()
  await page.getByLabel('プロダクト名', { exact: true }).fill('Atlas')
  await page.getByLabel('窓口アドレスの先頭').first().fill('atlas')
  await page
    .getByLabel('送信ドメイン')
    .first()
    .selectOption({ label: 'example.com' })
  await page.getByRole('button', { name: '窓口を登録' }).click()
  await expect(page.getByRole('main')).toContainText('atlas@example.com')
  await capture(page, 'W5', '01-mailbox', '新しいプロダクトと窓口を登録')
  await back.click()
  await page.getByRole('link', { name: /^運営者/ }).click()
  const operator = page.locator('details').filter({
    has: page.getByRole('region', {
      name: 'mori@example.com',
      includeHidden: true,
    }),
  })
  await operator.locator('summary').click()
  await operator.getByLabel('権限').selectOption({ label: '管理者' })
  await operator.getByRole('button', { name: '運営者を保存' }).click()
  await operator.locator('summary').click()
  await expect(operator.getByLabel('権限')).toHaveValue('admin')
  await capture(page, 'W5', '02-role', '同じ管理者で運営者の変更を確認')
  await back.click()
  await page.getByRole('link', { name: /^保存期間/ }).click()
  await page.getByRole('spinbutton').fill('30')
  await page.getByRole('button', { name: '保存期間を変更' }).click()
  await back.click()
  await expect(page.getByRole('link', { name: /^保存期間/ })).toContainText(
    '30日',
  )
  await capture(page, 'W5', '03-retention', '変更した保持期間を設定一覧で読む')
  await page.getByRole('link', { name: /^連絡先のデータ削除/ }).click()
  const contact = page.getByRole('combobox', { name: '削除する相手' })
  await contact.selectOption('customer7@example.net')
  await page.getByRole('button', { name: '削除内容を確認' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('customer7@example.net')
  await dialog.getByRole('button', { name: 'すべて削除' }).click()
  await expect(page.getByRole('status')).toContainText('削除')
  await expect(
    contact.getByRole('option', { name: /customer7@example.net/ }),
  ).toHaveCount(0)
  await expect(
    contact.getByRole('option', { name: /customer1@example.net/ }),
  ).toHaveCount(1)
  expect(
    await scene.db
      .prepare(
        "SELECT number FROM conversations WHERE contact='customer7@example.net'",
      )
      .first(),
  ).toBeNull()
  await capture(page, 'W5', '04-deleted', '対象の連絡先だけが消えたことを確認')
})
