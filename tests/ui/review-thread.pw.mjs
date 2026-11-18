import { test, expect } from '@playwright/test'
import { startScene } from './seed.mjs'

test('thread commands, context and approval preserve the reading position', async ({
  page,
}) => {
  const scene = await startScene(['issues', 'articles', 'canned', 'snooze'])
  try {
    for (const width of [375, 1199, 1200, 1440]) {
      await page.setViewportSize({ width, height: 750 })
      await page.goto(scene.origin + '/conversation/5')
      const panel = page.getByRole('region', { name: '会話の関連情報' })
      const trigger = page.getByRole('button', {
        name: '関連情報',
        exact: true,
      })
      if (width < 1200) {
        await expect(panel).toBeHidden()
        await trigger.click()
        await expect(panel).toBeVisible()
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
        await panel.getByRole('button', { name: '閉じる' }).click()
        await expect(panel).toBeHidden()
        await expect(trigger).toBeFocused()
      } else {
        await expect(trigger).toBeHidden()
        const body = await page.locator('[data-ui="body"]').boundingBox()
        expect((await panel.boundingBox()).x).toBeGreaterThan(
          body.x + body.width,
        )
      }
      await expect(
        page
          .getByRole('region', { name: '返信欄' })
          .getByRole('button', { name: '定型文を選ぶ' }),
      ).toBeVisible()
      await page.getByRole('button', { name: 'その他の操作' }).click()
      await page.getByRole('button', { name: 'スヌーズ', exact: true }).click()
      await expect(page.getByLabel('再表示日時（日本時間）')).toBeVisible()
      await page.keyboard.press('Escape')
      await page.keyboard.press('Escape')
      const approve = page.getByRole('button', {
        name: '承認して送信',
        exact: true,
      })
      const discard = page.getByRole('button', { name: '下書きを破棄' })
      await approve.evaluate((el) =>
        el.scrollIntoView({ block: 'center', behavior: 'instant' }),
      )
      const location = () =>
        page.evaluate(() => [
          scrollX,
          scrollY,
          document.querySelector('h1').getBoundingClientRect().top,
        ])
      const prior = await location()
      expect(
        Math.abs(
          (await approve.boundingBox()).y - (await discard.boundingBox()).y,
        ),
      ).toBeLessThan(2)
      await expect(approve).toHaveClass(/button-primary/)
      await approve.click()
      const dialog = page.getByRole('dialog', { name: '承認して送信' })
      await expect(dialog).toBeVisible()
      expect(await location()).toEqual(prior)
      const commit = dialog.getByRole('button', { name: '承認して送信' })
      const cancel = dialog.getByRole('button', { name: 'キャンセル' })
      await expect(commit).toHaveClass(/button-primary/)
      expect((await commit.boundingBox()).x).toBeGreaterThan(
        (await cancel.boundingBox()).x,
      )
      await expect(cancel).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(approve).toBeFocused()
      expect(await location()).toEqual(prior)
    }
  } finally {
    await scene.stop()
  }
})

test('document navigation finishes a single fade within 150 ms of animation time', async ({
  page,
}) => {
  const server = await startScene()
  try {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.addInitScript(() => {
      window.pageFade = new Promise((resolve) =>
        document.addEventListener('animationend', (e) => {
          if (
            e.animationName === 'pattern-fade-in' &&
            e.target.matches('[data-ui-page]')
          )
            resolve({
              ms: e.elapsedTime * 1000,
              opacity: getComputedStyle(e.target).opacity,
            })
        }),
      )
    })
    await page.goto(server.origin)
    await page.getByRole('link', { name: '設定', exact: true }).click()
    const measurement = await page.evaluate(() => window.pageFade)
    expect(measurement.ms).toBeGreaterThan(0)
    expect(measurement.ms).toBeLessThanOrEqual(150)
    expect(measurement.opacity).toBe('1')
    expect(
      await page.evaluate(() =>
        document
          .getAnimations()
          .some((a) =>
            a.effect?.pseudoElement?.startsWith('::view-transition'),
          ),
      ),
    ).toBe(false)
  } finally {
    await server.stop()
  }
})
