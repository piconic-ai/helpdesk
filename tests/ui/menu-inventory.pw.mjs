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
  test('メニューの列挙とキーボード操作 ' + url, async ({ browser }) => {
    const server = await startDemo(26200 + index)
    try {
      if (url === '/tokens')
        await seedLoopScene(server.db, { id: 'loop-revoke' })
      for (const width of [375, 1024, 1440]) {
        const page = await browser.newPage({
          viewport: { width, height: width === 375 ? 812 : 900 },
          locale: 'ja-JP',
          timezoneId: 'Asia/Tokyo',
          reducedMotion: 'reduce',
        })
        try {
          await page.clock.setFixedTime(new Date(fixedTime))
          if (width === 375 && url.includes('notice=note'))
            await saveExampleNote(page, server.origin)
          await page.goto(server.origin + url)
          const slug =
            url.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'
          await inspectMenus(page, url === '/', async (id, panel) => {
            const bounds = await panel.boundingBox()
            expect.soft(bounds.y, id + ' top').toBeGreaterThanOrEqual(0)
            expect
              .soft(bounds.y + bounds.height, id + ' bottom')
              .toBeLessThanOrEqual(page.viewportSize().height + 1)
            const variant = url.includes('?')
              ? '-' + createHash('sha256').update(url).digest('hex').slice(0, 8)
              : ''
            const name =
              'menu-' + slug + variant + '-' + id + '-' + width + '.png'
            await expect.soft(page).toHaveScreenshot([name])
            await audit(page, id, width)
          })
        } finally {
          await page.close()
        }
      }
    } finally {
      await server.stop()
    }
  })
}
