import { test, expect } from './harness.mjs'

test.use({
  extensions: ['issues', 'articles', 'canned', 'metrics', 'feedback'],
})

test('拡張の一覧、サイドバー、会話に同じ記号が表示される', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/extensions')
  const cards = page.locator('[data-ui="extension-card"]')
  await expect(cards).toHaveCount(16)
  const declared = new Map(
    await cards.evaluateAll((cards) =>
      cards.map((card) => [
        card.dataset.extension,
        card.querySelector('header svg')?.dataset.glyph,
      ]),
    ),
  )
  expect(new Set(declared.values()).size).toBe(declared.size)
  for (const [path, id] of [
    ['/issues', 'issues'],
    ['/articles', 'articles'],
    ['/metrics', 'metrics'],
    ['/voices', 'metrics'],
  ]) {
    const icon = page.locator('.sidebar-extensions a[href="' + path + '"] svg')
    await expect(icon).toHaveAttribute('data-glyph', declared.get(id))
  }
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto(scene.origin + '/conversation/1')
  await page.getByRole('button', { name: '関連情報', exact: true }).click()
  const panels = page.locator('.extension-panel')
  expect(await panels.count()).toBeGreaterThan(0)
  for (const panel of await panels.all()) {
    const icon = declared.get(await panel.getAttribute('data-extension'))
    await expect(panel.locator('h2 svg').first()).toHaveAttribute(
      'data-glyph',
      icon,
    )
  }
})
