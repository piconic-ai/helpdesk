import { chromium } from 'playwright'
import axe from 'axe-core'
import { mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { startScene } from './seed.mjs'

const output = resolve(
  process.env.HELPDESK_GALLERY_CAPTURE ?? 'docs/reports/ux-3/gallery',
)
await mkdir(output, { recursive: true })
const scene = await startScene()
const browser = await chromium.launch({ args: ['--disable-gpu'] })
try {
  for (const width of [1440, 1024, 375]) {
    const page = await browser.newPage({
      viewport: { width, height: width === 375 ? 812 : 900 },
      locale: 'ja-JP',
      reducedMotion: 'reduce',
    })
    const response = await page.goto(scene.origin + '/dev/ui')
    assert.equal(response.status(), 200)
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('[data-ui-page]').count(), 4)
    assert.equal(
      await page
        .locator('.composer')
        .evaluate((el) => getComputedStyle(el).position),
      'static',
    )
    const messages = await page.locator('[data-ui="message"]').all()
    const composer = await page.locator('.composer').boundingBox()
    for (const message of messages) {
      const box = await message.boundingBox()
      assert(
        box.y + box.height <= composer.y + 1,
        'message under composer at ' + width,
      )
    }
    await page.evaluate(axe.source)
    const failures = await page.evaluate(async () =>
      (await window.axe.run(document)).violations.map((rule) => ({
        rule: rule.id,
        nodes: rule.nodes.map((node) => node.target),
      })),
    )
    assert.deepEqual(failures, [], 'accessibility at ' + width)
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll('body *')]
        .filter(
          (el) =>
            el.getBoundingClientRect().right > innerWidth + 1 &&
            !el.closest('[hidden],.sr-only'),
        )
        .map((el) => [
          el.tagName,
          el.className,
          el.getBoundingClientRect().right,
        ])
        .slice(0, 9),
    )
    assert.deepEqual(overflow, [], width + 'px overflow')
    await page.screenshot({
      path: resolve(output, 'gallery-' + width + '.png'),
      fullPage: true,
    })
    await page.getByRole('button', { name: '担当・佐藤 優' }).click()
    assert(
      await page
        .locator('#sample-assignee')
        .evaluate((el) => el.matches(':popover-open')),
    )
    await page
      .locator('#sample-assignee')
      .screenshot({ path: resolve(output, 'candidates-' + width + '.png') })
    await page.getByRole('button', { name: '森 直子' }).first().click()
    assert.equal(
      await page.locator('[data-gallery-assignee]').textContent(),
      '担当・森 直子',
    )
    await page.getByRole('button', { name: 'その他の操作' }).click()
    await page.getByRole('button', { name: '削除する' }).first().click()
    assert(
      await page
        .locator('#sample-confirm')
        .evaluate((el) => el.matches(':modal')),
    )
    await page
      .locator('#sample-confirm')
      .screenshot({ path: resolve(output, 'confirmation-' + width + '.png') })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'ヒント' }).focus()
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[role=tooltip]')).opacity ===
        '1',
    )
    await page
      .locator('#states')
      .screenshot({ path: resolve(output, 'states-' + width + '.png') })
    await page.locator('#sample-edit [name=title]').fill('見本の記事')
    await page.getByRole('button', { name: '保存', exact: true }).click()
    assert.equal(new URL(page.url()).hash, '#states')
    await page.locator('[data-ui="filter-line"] input[name=q]').fill('森')
    await page.waitForURL((url) => url.searchParams.get('q') === '森')
    assert.equal(await page.locator('[data-ui="conversation-row"]').count(), 1)
    await page.close()
    console.log(
      width + 'px gallery, candidates, confirmation and tooltip passed',
    )
  }
} finally {
  await browser.close()
  await scene.stop()
}
