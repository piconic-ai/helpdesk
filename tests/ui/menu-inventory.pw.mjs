import { screenshotName } from './screenshot-name.mjs'
import { createHash } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { registeredScreens } from './route-inventory.mjs'
import { startDemo } from './demo-scene.mjs'
import { fixedTime } from './seed.mjs'
import { inspectMenus } from './discover-menus.mjs'
import { audit } from './audit.mjs'
import { screens } from './screens.mjs'
import { behaviorScenes, saveExampleNote } from './behavior-scenes.mjs'
import { loopScenes, seedLoopScene } from './loop-scenes.mjs'

const routes = new Set([
  ...registeredScreens(),
  ...[...screens, ...behaviorScenes, ...loopScenes].map((s) => s.url),
])
for (const [index, url] of [...routes].sort().entries()) {
  // Verify long menu inventories and timed receipts independently at each width.
  const batches =
    url === '/settings/labels' || url.includes('notice=note')
      ? [[375], [1024], [1440]]
      : [[375, 1024, 1440]]
  for (const [batch, widths] of batches.entries()) {
    const caption = widths.length === 1 ? ' · ' + widths[0] + 'px' : ''
    test(
      'メニューの列挙とキーボード操作 ' + url + caption,
      async ({ browser }) => {
        const server = await startDemo(26200 + index + batch * 1000, {
          tickingClock: false,
        })
        try {
          if (url === '/tokens')
            await seedLoopScene(server.db, { id: 'loop-revoke' })
          for (const width of widths) {
            const page = await browser.newPage({
              viewport: { width, height: width === 375 ? 812 : 900 },
              locale: 'ja-JP',
              timezoneId: 'Asia/Tokyo',
              reducedMotion: 'reduce',
            })
            try {
              await page.clock.setFixedTime(new Date(fixedTime))
              if (url.includes('notice=note'))
                await saveExampleNote(page, server.origin)
              await page.goto(server.origin + url)
              if (url.includes('notice=note')) {
                const receipt = page.getByText('内部メモを保存しました。', {
                  exact: true,
                })
                await expect(receipt).toBeVisible()
                await expect(receipt).toBeHidden({ timeout: 12_000 })
              }
              const slug =
                url.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'
              await inspectMenus(page, url === '/', async (id, panel) => {
                if (
                  width === 375 &&
                  ['thread-assignee', 'thread-labels'].includes(id)
                ) {
                  const opener = await page
                    .locator('[popovertarget="' + id + '"]')
                    .first()
                    .boundingBox()
                  const toolbar = await page
                    .locator('.thread-toolbar')
                    .boundingBox()
                  expect
                    .soft(opener.y, id + ' below toolbar')
                    .toBeGreaterThanOrEqual(toolbar.y + toolbar.height - 1)
                }
                const bounds = await panel.boundingBox()
                expect.soft(bounds.y, id + ' top').toBeGreaterThanOrEqual(0)
                expect
                  .soft(bounds.y + bounds.height, id + ' bottom')
                  .toBeLessThanOrEqual(page.viewportSize().height + 1)
                const variant = url.includes('?')
                  ? '-' +
                    createHash('sha256').update(url).digest('hex').slice(0, 8)
                  : ''
                const name =
                  'menu-' + slug + variant + '-' + id + '-' + width + '.png'
                await expect.soft(page).toHaveScreenshot(screenshotName(name))
                await audit(page, id, width)
              })
            } finally {
              await page.close()
            }
          }
        } finally {
          await server.stop()
        }
      },
    )
  }
}
