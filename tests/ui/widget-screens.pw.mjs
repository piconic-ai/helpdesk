import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import axe from 'axe-core'
import { startScene, fixedTime } from './seed.mjs'
import { widgetScenes } from './widget-scenes.mjs'
import { registerProduct, serveProduct } from '../../examples/widget/server.mjs'

async function show(page, id, site) {
  await page.goto(site + '/billing/receipts')
  const launch = page.getByRole('button', { name: 'ヘルプ', exact: true })
  await expect(launch).toBeVisible()
  if (id === 'widget-closed') return
  await launch.click()
  const frame = page.frameLocator('iframe')
  const question = frame.getByRole('textbox', { name: '質問', exact: true })
  await expect(question).toBeFocused()
  if (id === 'widget-open') return
  const noMatch = id === 'widget-no-match'
  await question.fill(
    noMatch ? 'チームの名前を変更したい' : '領収書を発行したい',
  )
  await frame.getByRole('button', { name: '質問する' }).click()
  if (noMatch) {
    await expect(
      frame.getByText(/質問に合う記事は見つかりません/),
    ).toBeVisible()
    return
  }
  const article = frame.getByRole('link', {
    name: '領収書を発行する',
    exact: true,
  })
  await expect(article).toBeVisible()
  if (id === 'widget-suggestions') return
  if (id === 'widget-article') {
    await article.click()
    await expect(
      frame.getByRole('link', { name: '新しいタブで開く' }),
    ).toBeVisible()
    return
  }
  await frame.getByRole('button', { name: '解決しなかった' }).click()
  const email = frame.getByLabel('連絡先メールアドレス')
  await expect(email).toBeVisible()
  if (id === 'widget-handoff') return
  await email.fill('reader@example.com')
  await frame.getByRole('button', { name: '送信', exact: true }).click()
  await expect(
    frame.getByText(/問い合わせを受け付けました（#\d+）/),
  ).toBeVisible()
}

async function checkFrame(frame) {
  await frame.evaluate(axe.source)
  const issues = await frame.evaluate(async () =>
    (await window.axe.run(document)).violations.map((rule) => [
      rule.id,
      rule.nodes.map((n) => n.target),
    ]),
  )
  expect(issues).toEqual([])
  expect(
    await frame.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false)
}

for (const scene of widgetScenes)
  test(scene.group + ' / ' + scene.label, async ({ browser }) => {
    const desk = await startScene(['chat', 'articles', 'form', 'feedback'])
    const product = await serveProduct(desk.origin)
    try {
      await registerProduct(desk.origin, product.origin)
      for (const width of [1440, 1024, 375]) {
        const page = await browser.newPage({
          viewport: { width, height: width === 375 ? 812 : 900 },
          locale: 'ja-JP',
          reducedMotion: 'reduce',
        })
        try {
          await page.clock.setFixedTime(new Date(fixedTime))
          await show(page, scene.id, product.origin)
          for (const frame of page.frames()) await checkFrame(frame)
          const name = scene.id + '-' + width + '.png'
          const dir = process.env.HELPDESK_DAILY_CAPTURE
          if (dir) {
            await mkdir(dir, { recursive: true })
            await page.screenshot({
              path: resolve(dir, name),
              animations: 'disabled',
              caret: 'hide',
            })
          } else await expect(page).toHaveScreenshot(name)
        } finally {
          await page.close()
        }
      }
    } finally {
      await product.stop()
      await desk.stop()
    }
  })
