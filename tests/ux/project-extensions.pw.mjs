import { expect, test } from './harness.mjs'

test.use({ extensions: ['articles'] })

test('プロジェクトでヘルプ記事を停止して再開すると、その公開入口だけが切り替わる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/settings/projects/slide')
  await page.getByRole('link', { name: /^利用する拡張/ }).click()
  const section = page
    .locator('section')
    .filter({
      has: page.getByRole('heading', { name: 'ヘルプ記事', exact: true }),
    })
    .last()
  const publicStatus = async (project) =>
    (
      await page.request.get(scene.origin + '/help/articles/' + project + '/')
    ).status()

  await section.getByRole('button', { name: '無効にする' }).click()
  await expect(
    section.getByRole('button', { name: '有効にする' }),
  ).toBeVisible()
  expect(await publicStatus('slide')).toBe(404)
  expect(await publicStatus('desk')).toBe(200)
  await section.getByRole('button', { name: '有効にする' }).click()
  await expect(
    section.getByRole('button', { name: '無効にする' }),
  ).toBeVisible()
  expect(await publicStatus('slide')).toBe(200)
})
