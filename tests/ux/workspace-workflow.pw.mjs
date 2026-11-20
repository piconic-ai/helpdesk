import { capture, expect, test } from './harness.mjs'

test('W5 管理者が窓口・運営者の権限・保存期間を設定し、選んだ相手のデータだけを削除する', async ({
  page,
  scene,
}) => {
  await page.getByRole('link', { name: '設定', exact: true }).click()
  const settings = page.getByRole('link', { name: '設定', exact: true })
  const main = page.getByRole('main')
  await main.getByRole('link', { name: /^全体の設定/ }).click()
  await page.getByRole('link', { name: /^プロジェクトと窓口/ }).click()
  await page
    .getByRole('link', { name: 'プロジェクトを追加', exact: true })
    .click()
  await page.getByLabel('プロジェクト名', { exact: true }).fill('Atlas')
  await page.getByLabel('窓口アドレスの先頭').first().fill('atlas')
  await page
    .getByLabel('送信ドメイン')
    .first()
    .selectOption({ label: 'example.com' })
  await page.getByRole('button', { name: '窓口を登録' }).click()
  await expect(page.getByRole('main')).toContainText('atlas@example.com')
  await capture(page, 'W5', '01-mailbox', '新しいプロジェクトと窓口を登録')
  await settings.click()
  await main.getByRole('link', { name: /^全体の設定/ }).click()
  await main.getByRole('link', { name: /^運営者/ }).click()
  const operator = main.getByRole('link', { name: /^森 直子/ })
  await operator.click()
  await main
    .getByRole('combobox', { name: '権限', exact: true })
    .selectOption('admin')
  await main.getByRole('button', { name: '運営者を保存' }).click()
  await operator.click()
  await expect(
    main.getByRole('combobox', { name: '権限', exact: true }),
  ).toHaveValue('admin')
  await capture(page, 'W5', '02-role', '同じ管理者で運営者の変更を確認')
  await settings.click()
  await main.getByRole('link', { name: /^全体の設定/ }).click()
  await main.getByRole('link', { name: /^プロジェクトと窓口/ }).click()
  await main.getByRole('link', { name: /^Slide/ }).click()
  await main.getByRole('link', { name: /^保存期間/ }).click()
  await page.getByLabel('日数を指定').check()
  await page.getByRole('spinbutton').fill('30')
  await page.getByRole('button', { name: '保存期間を変更' }).click()
  await main.getByRole('link', { name: 'プロジェクトの設定に戻る' }).click()
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
