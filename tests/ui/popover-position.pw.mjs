import { test, expect } from '@playwright/test'
import { startScene } from './seed.mjs'

function geometry(trigger, open = false) {
  if (open) trigger.click()
  const panel = document.getElementById(trigger.getAttribute('popovertarget'))
  const anchor = trigger.getBoundingClientRect(),
    box = panel.getBoundingClientRect()
  return {
    visible: panel.matches(':popover-open'),
    within:
      box.left >= -1 &&
      box.top >= -1 &&
      box.right <= innerWidth + 1 &&
      box.bottom <= innerHeight + 1,
    gap: Math.min(
      Math.abs(box.top - anchor.bottom),
      Math.abs(box.bottom - anchor.top),
    ),
    extendsRight: anchor.left + box.width > innerWidth,
    rightAligned: Math.abs(anchor.right - box.right) < 2,
    above: box.bottom <= anchor.top + 1,
    overlapX:
      Math.min(box.right, anchor.right) - Math.max(box.left, anchor.left),
  }
}
function expectAnchored(result) {
  expect(result.visible).toBe(true)
  expect(result.within).toBe(true)
  expect(result.gap).toBeLessThanOrEqual(6)
  expect(result.overlapX).toBeGreaterThan(1)
}
async function openAnchored(trigger) {
  await trigger.scrollIntoViewIfNeeded()
  // Read the same frame as opening, before the non-bubbling toggle event is queued.
  const first = await trigger.evaluate(geometry, true)
  expectAnchored(first)
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expectAnchored(await trigger.evaluate(geometry))
}
test('panels are anchored in the opening frame and follow scroll and viewport changes', async ({
  page,
}) => {
  const server = await startScene(['snooze'])
  try {
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 812 })
      await page.goto(server.origin + '/conversation/1')
      const operation = page.getByRole('button', { name: 'その他の操作' })
      await openAnchored(operation)
      await page.getByRole('button', { name: 'スヌーズ', exact: true }).click()
      await expect(page.locator(':popover-open')).toHaveCount(1)
      await page.evaluate(() => window.scrollBy(0, 36))
      await expect(async () => {
        expectAnchored(await operation.evaluate(geometry))
      }).toPass({ timeout: 5000 })
      await page.keyboard.press('Escape')
      await page.goto(server.origin + '/dev/ui')
      if (width === 375) {
        const edge = page.locator('[popovertarget="gallery-list-menu"]')
        await openAnchored(edge)
        expect(await edge.evaluate(geometry)).toMatchObject({
          extendsRight: true,
          rightAligned: true,
        })
        await page.keyboard.press('Escape')
      }
      const candidate = page.locator('[popovertarget="sample-assignee"]')
      await openAnchored(candidate)
      await page.setViewportSize({ width: width - 12, height: 780 })
      await expect(async () => {
        expectAnchored(await candidate.evaluate(geometry))
      }).toPass({ timeout: 5000 })
      await page.keyboard.press('Escape')
      await page.goto(server.origin + '/account')
      if (width < 768)
        await page.getByRole('button', { name: 'メニューを開く' }).click()
      const menu = page.locator('[popovertarget="account-menu"]')
      await openAnchored(menu)
      if (width === 1440)
        expect((await menu.evaluate(geometry)).above).toBe(true)
    }
  } finally {
    await server.stop()
  }
})
