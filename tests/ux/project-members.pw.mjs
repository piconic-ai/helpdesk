import { test, expect } from './harness.mjs'

test('プロジェクトに運営者を招き、担当中の件数を確認して外す', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/settings/projects/slide')
  await page.getByRole('link', { name: /^メンバー/ }).click()
  await page.getByLabel('運営者を名前で検索').fill('伊藤')
  await page.getByRole('button', { name: '検索', exact: true }).click()
  await page.getByLabel('追加する運営者').selectOption('ito@example.com')
  await page.getByRole('button', { name: 'メンバーに追加' }).click()
  await expect(page.getByLabel('編集：伊藤 蓮')).toBeVisible()
  await scene.db
    .prepare(
      "UPDATE conversations SET assignee='ito@example.com' WHERE number=1",
    )
    .run()
  await page.reload()
  await page.getByLabel('編集：伊藤 蓮').click()
  await page.getByRole('button', { name: 'メンバーから外す' }).click()
  const dialog = page.getByRole('dialog', { name: /伊藤 蓮/ })
  await expect(dialog).toContainText('担当している会話 1件')
  await expect(dialog.getByRole('button', { name: 'キャンセル' })).toBeFocused()
  await dialog.getByRole('button', { name: 'メンバーから外す' }).click()
  await expect(page.getByLabel('編集：伊藤 蓮')).toHaveCount(0)
  expect(
    await scene.db
      .prepare('SELECT assignee FROM conversations WHERE number=1')
      .first('assignee'),
  ).toBeNull()
  await page.getByLabel('招く人のメールアドレス').fill('new-member@example.org')
  await page.getByRole('button', { name: '招待する', exact: true }).click()
  await expect(
    page.getByRole('listitem').filter({ hasText: 'new-member@example.org' }),
  ).toContainText('招待中')
})
