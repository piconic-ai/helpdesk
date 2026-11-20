import { test, expect } from './harness.mjs'

test('トークンの対象を検索して複数選び、メンバーから外れた対象の名前を伏せる', async ({
  page,
  scene,
}) => {
  const db = scene.db
  await db.batch(
    Array.from({ length: 9 }, (_, i) =>
      db
        .prepare('INSERT INTO products(id,name) VALUES(?,?)')
        .bind('token-' + i, 'Team ' + i),
    ),
  )
  await page.goto(scene.origin + '/tokens')
  const form = page.locator('#new-token form')
  const scope = form.getByRole('group', { name: '対象のプロジェクト' })
  await expect(
    scope.getByRole('radio', { name: 'アクセスできるすべてのプロジェクト' }),
  ).toBeChecked()
  await expect(scope.getByRole('checkbox')).toHaveCount(0)
  await scope.getByRole('radio', { name: 'プロジェクトを選ぶ' }).check()
  await form.getByLabel('トークン名').fill('受信箱連携')
  await form.getByRole('button', { name: '発行する' }).click()
  await expect(form.locator('input:invalid')).toHaveCount(1)
  const search = scope.getByRole('searchbox', { name: '候補を絞り込む' })
  await search.fill('unknown')
  await expect(scope.getByText('一致する候補はありません。')).toBeVisible()
  await search.fill('Slide')
  await scope.getByRole('checkbox', { name: 'Slide' }).check()
  await search.fill('Desk')
  await scope.getByRole('checkbox', { name: 'Desk' }).check()
  await form.getByRole('button', { name: '発行する' }).click()
  const row = page.getByRole('listitem').filter({ hasText: '受信箱連携' })
  await expect(row).toContainText('Desk、Slide')
  await db.batch([
    db.prepare(
      "UPDATE operators SET role='admin' WHERE email='mori@example.com'",
    ),
    db.prepare(
      "INSERT INTO product_members VALUES('desk','mori@example.com','admin') ON CONFLICT(product,email) DO UPDATE SET role='admin'",
    ),
    db.prepare(
      "UPDATE operators SET role='agent' WHERE email='sato@example.com'",
    ),
    db.prepare(
      "DELETE FROM product_members WHERE product='desk' AND email='sato@example.com'",
    ),
  ])
  await page.goto(scene.origin + '/tokens')
  await expect(row).toContainText('Slide')
  await expect(row).not.toContainText('Desk')
  await scope.getByRole('radio', { name: 'プロジェクトを選ぶ' }).check()
  await expect(scope.getByRole('checkbox', { name: 'Desk' })).toHaveCount(0)
  async function submit(fields) {
    return page.request.post(scene.origin + '/tokens', {
      form: {
        label: '失敗する発行',
        access: 'read',
        projectScope: 'selected',
        ...fields,
      },
      headers: { origin: scene.origin },
    })
  }
  expect((await submit({})).status()).toBe(400)
  expect((await submit({ products: 'desk' })).status()).toBe(403)
  expect((await submit({ projectScope: 'invalid' })).status()).toBe(400)
})
