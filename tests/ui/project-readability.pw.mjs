import { expect, test } from '@playwright/test'
import { startDemo } from './demo-scene.mjs'

test('30プロジェクトでも起票先の不足と最後の管理者を読み取れる', async ({
  page,
}, testInfo) => {
  const demo = await startDemo()
  try {
    for (const width of [375, 800, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(demo.origin + '/extensions')
      const issue = page.locator('[data-extension="issues"]')
      await expect(issue).not.toContainText('開発者カンファレンス')
      await expect(issue.getByRole('link', { name: '詳細' })).toBeVisible()
      await testInfo.attach('issues-' + width, {
        body: await issue.screenshot(),
        contentType: 'image/png',
      })
      await page.goto(
        demo.origin + '/settings/projects/conference-2027/members',
      )
      const card = page
        .getByRole('heading', { name: '所属するメンバー（1人）' })
        .locator('..')
      await expect(
        card.getByText('最後の管理者です。', { exact: false }),
      ).toBeVisible()
      for (const value of ['佐藤 優', 'sato@example.com']) {
        const lineCount = await card
          .getByText(value, { exact: true })
          .evaluate((el, value) => {
            const node = [...el.childNodes].find(
              (child) =>
                child.nodeType === Node.TEXT_NODE &&
                child.textContent.includes(value),
            )
            const range = document.createRange()
            range.selectNodeContents(node)
            return [...range.getClientRects()].filter((rect) => rect.width > 0)
              .length
          }, value)
        expect(lineCount, value + ' at ' + width + 'px').toBe(1)
      }
      await testInfo.attach('member-' + width, {
        body: await card.screenshot(),
        contentType: 'image/png',
      })
    }
  } finally {
    await demo.stop()
  }
})
