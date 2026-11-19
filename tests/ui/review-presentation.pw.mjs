import { test, expect } from '@playwright/test'
import { startScene } from './seed.mjs'

test('north-star metrics and extension groups retain their hierarchy at all three widths', async ({
  page,
}) => {
  const scene = await startScene(['metrics', 'issues', 'canned'])
  try {
    for (const width of [375, 1024, 1440]) {
      await page.setViewportSize({ width, height: 812 })
      await page.goto(scene.origin + '/metrics')
      const top = page.locator('[aria-label="集計結果"] [data-ui=metric-card]')
      const counts = page.locator(
        '[aria-label="集計の内訳"] [data-ui=metric-card]',
      )
      await expect(top).toHaveCount(3)
      await expect(top.first()).toContainText('解決までの平均時間')
      await expect(top.first()).toHaveCSS('border-inline-start-width', '4px')
      if (width === 1440)
        expect((await top.first().boundingBox()).width).toBeGreaterThan(
          (await top.nth(1).boundingBox()).width,
        )
      const size = (card) =>
        card
          .locator('strong')
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
      expect(await size(top.nth(1))).toBeGreaterThan(await size(counts.last()))
      const tip = top.first().getByRole('tooltip', { includeHidden: true })
      await top
        .first()
        .getByRole('button', { name: /の定義/ })
        .focus()
      await expect(tip).toBeVisible()
      await expect(tip).toHaveCSS('opacity', '1')
      const rect = await tip.boundingBox()
      expect(rect.x).toBeGreaterThanOrEqual(0)
      expect(rect.x + rect.width).toBeLessThanOrEqual(width)
      await page.goto(scene.origin + '/extensions')
      for (const card of await page.locator('[data-ui=extension-card]').all()) {
        await expect(card.getByRole('switch')).toHaveCSS(
          'white-space',
          'nowrap',
        )
        const readable = await card.locator('h3').evaluate((heading) => {
          const range = new Range()
          range.selectNodeContents(heading)
          const text = range.getBoundingClientRect()
          const box = heading.getBoundingClientRect()
          return (
            heading.scrollWidth <= heading.clientWidth &&
            text.right <= box.right + 1 &&
            text.bottom <= box.bottom + 1
          )
        })
        expect(readable, await card.locator('h3').innerText()).toBe(true)
      }
      const group = page.getByRole('heading', {
        name: '受け付ける',
        exact: true,
      })
      const firstCard = group
        .locator('..')
        .locator('[data-ui=extension-card]')
        .first()
      const label = await group.boundingBox()
      expect(
        Math.round((await firstCard.boundingBox()).y - label.y - label.height),
      ).toBe(24)
    }
  } finally {
    await scene.stop()
  }
})
