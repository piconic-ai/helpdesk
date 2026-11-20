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
  ]) {
    const icon = page.locator('.sidebar-extensions a[href="' + path + '"] svg')
    await expect(icon).toHaveAttribute('data-glyph', declared.get(id))
  }
  await expect(
    page.locator('.sidebar-extensions a[href="/voices"] svg'),
  ).toHaveAttribute('data-glyph', 'voices')
  await page.setViewportSize({ width: 1024, height: 900 })
  for (const [path, name] of [
    ['/voices', '声の集計'],
    ['/metrics', '対応状況の集計'],
  ]) {
    const link = page.locator('.sidebar-extensions a[href="' + path + '"]')
    await expect(link).toHaveAccessibleName(new RegExp(name))
    await expect(link).toHaveAttribute('title', name)
    const labels = link.locator(
      ':scope > span:not(.sidebar-count), :scope > small',
    )
    expect(
      await labels.evaluateAll((nodes) =>
        nodes.every((node) => node.getBoundingClientRect().width <= 1),
      ),
    ).toBe(true)
  }

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

test('拡張名を一行で読み、幅に合った列数で設定を選べる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/extensions')
  for (const width of [768, 820, 375]) {
    await page.setViewportSize({ width, height: 900 })
    const titles = page.locator('[data-ui="extension-card"] header h3')
    const sizes = await titles.evaluateAll((headings) =>
      headings.map((h) => ({
        height: h.getBoundingClientRect().height,
        line: parseFloat(getComputedStyle(h).lineHeight),
        clipped: h.scrollWidth > h.clientWidth + 1,
        overlap:
          h.getBoundingClientRect().right >
          h.parentElement.querySelector('[role=switch]').getBoundingClientRect()
            .left,
      })),
    )
    expect(sizes.length).toBeGreaterThan(0)
    for (const size of sizes) {
      expect(size.height).toBeLessThanOrEqual(size.line + 1)
      expect(size.clipped || size.overlap).toBe(false)
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
  }
})
