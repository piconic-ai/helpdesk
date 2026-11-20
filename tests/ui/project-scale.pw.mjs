import { test, expect } from '@playwright/test'
import { startDemo } from './demo-scene.mjs'

for (const width of [800, 1280]) {
  test(
    '30件のプロジェクトを切り替えて設定を開く · ' + width + 'px',
    async ({ page }, testInfo) => {
      const demo = await startDemo()
      try {
        await page.setViewportSize({ width, height: 900 })
        const go = (path) => page.goto(demo.origin + path)
        const capture = async (name) => {
          const main = page.getByRole('main')
          await expect(main.getByRole('heading', { level: 1 })).toBeVisible()
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(width)
          const overflowing = await main
            .locator('a, button, label, strong, h1, h2, td')
            .evaluateAll((elements) =>
              elements
                .filter(
                  (el) =>
                    el.checkVisibility() &&
                    el.clientWidth > 0 &&
                    el.scrollWidth > el.clientWidth + 2 &&
                    getComputedStyle(el).overflowX !== 'visible',
                )
                .map((el) => el.textContent.trim())
                .filter(Boolean),
            )
          expect(overflowing).toEqual([])
          await testInfo.attach(name, {
            body: await page.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          })
        }
        const products = await demo.db
          .prepare(
            'SELECT count(*) AS total, count(*) FILTER(WHERE archived_at IS NULL) AS active FROM product_lifecycle',
          )
          .first()
        expect(products).toEqual({ total: 30, active: 8 })
        await go('/extensions/canned')
        const chooser = page.locator('form[data-project-picker]')
        const open = chooser.getByRole('button', { name: '設定を開く' })
        await expect(open).toBeDisabled()
        await chooser.getByRole('button', { name: /プロジェクト：/ }).click()
        await chooser
          .getByRole('button', { name: 'Slide', exact: true })
          .click()
        await expect(open).toBeEnabled()
        const initialDocument = await page.evaluateHandle(() => document)
        await open.click()
        await expect(page).toHaveURL(
          (url) => url.searchParams.get('product') === 'slide',
        )
        expect(
          await initialDocument.evaluate((initial) => initial === document),
        ).toBe(true)
        await initialDocument.dispose()
        await go('/settings/mailboxes')
        await capture('project-directory')
        await go('/settings/projects/slide')
        await capture('project-settings')
        await go('/settings/projects/slide/members')
        await capture('project-members')
        await go('/settings/operators')
        await capture('operators')
        await go('/')
        const picker = page.locator('#product-switcher')
        async function openPicker() {
          const trigger = page.locator('[popovertarget="product-switcher"]')
          if (!(await trigger.isVisible()))
            await page.getByRole('button', { name: 'メニューを開く' }).click()
          await trigger.click()
          await expect(picker).toBeVisible()
        }
        await openPicker()
        await expect(picker.locator('[data-project-option]')).toHaveCount(8)
        await expect(picker.getByRole('searchbox')).toHaveCount(0)
        await picker.getByRole('link', { name: 'Slide', exact: true }).click()
        await expect(page).toHaveURL(
          (url) => url.searchParams.get('product') === 'slide',
        )
        await openPicker()
        await expect(
          picker.locator('[data-project-option]').first(),
        ).toHaveText('Slide')
        await picker.getByRole('link', { name: 'Desk', exact: true }).click()
        await expect(page).toHaveURL(
          (url) => url.searchParams.get('product') === 'desk',
        )
        await demo.db
          .prepare(
            "UPDATE product_lifecycle SET archived_at=NULL WHERE product='conference-2026'",
          )
          .run()
        await page.reload()
        await openPicker()
        await expect(
          picker.locator('[data-project-option]').first(),
        ).toHaveText('Desk')
        await picker.getByRole('searchbox').fill('2026')
        await expect(
          picker.locator('[data-project-option]:visible'),
        ).toHaveText('開発者カンファレンス 2026')
        await testInfo.attach('project-switcher', {
          body: await page.screenshot(),
          contentType: 'image/png',
        })
        for (const path of ['/voices', '/metrics', '/articles', '/issues']) {
          await go(path)
          await capture(path.slice(1))
          await page
            .getByRole('main')
            .getByRole('button', { name: /プロジェクト：/ })
            .first()
            .click()
          await expect(
            page.locator('[popover]:popover-open').getByRole('searchbox'),
          ).toBeVisible()
        }
      } finally {
        await demo.stop()
      }
    },
  )
}
