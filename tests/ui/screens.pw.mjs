import { test, expect } from '@playwright/test'
import { audit } from './audit.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { startScene, fixedTime } from './seed.mjs'
import { keyboardFlow, prepare } from './drive.mjs'
import { compositionScreens } from './composition-screens.mjs'
import { dailyScreens } from './daily-screens.mjs'
import { screens } from './screens.mjs'

const before = Boolean(process.env.HELPDESK_UI_BEFORE)
const source = process.env.HELPDESK_UI_BEFORE || '.'
const baseline = resolve('docs/reports/ui/before')

async function capture(page, scene, width) {
  const name = scene.id + '-' + width + '.png'
  const nativePending =
    scene.action === 'loading' || (before && scene.id === 'composer-sending')
  const daily = process.env.HELPDESK_DAILY_CAPTURE
  if (!daily && !before && !nativePending) {
    await expect.soft(page).toHaveScreenshot(name)
    return
  }
  let pixels
  if (nativePending) {
    // Native form navigations block Playwright's screenshot preparation.
    const session = await page.context().newCDPSession(page)
    const frame = await session.send('Page.captureScreenshot', {
      format: 'png',
    })
    pixels = Buffer.from(frame.data, 'base64')
  } else {
    pixels = await page.screenshot({ animations: 'disabled', caret: 'hide' })
  }
  if (daily) {
    await mkdir(daily, { recursive: true })
    await writeFile(resolve(daily, name), pixels)
  } else if (before) {
    await mkdir(baseline, { recursive: true })
    await writeFile(resolve(baseline, name), pixels)
  } else {
    expect.soft(pixels).toMatchSnapshot(name)
  }
}

async function verifyViewport(browser, scene, origin, width) {
  const save =
    !before ||
    width === 1440 ||
    (width === 375 && scene.mobile) ||
    (width === 1024 && scene.tablet)
  if (before && !save) return
  const page = await browser.newPage({
    viewport: { width, height: width === 375 ? 812 : 900 },
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  try {
    await page.clock.setFixedTime(new Date(fixedTime))
    await page.addInitScript(() => {
      let sequence = 0
      crypto.randomUUID = () =>
        '00000000-0000-4000-8000-' + (++sequence).toString(16).padStart(12, '0')
      Math.random = () => 0.314159
    })
    const done = await prepare(page, scene, origin, before)
    try {
      if (save) await capture(page, scene, width)
      if (!before && scene.action !== 'loading')
        await audit(page, scene.id, width)
    } finally {
      await done?.()
    }
  } finally {
    await page.close()
  }
}

const inventory = before
  ? screens
  : [...screens, ...dailyScreens, ...compositionScreens]
for (const [index, scene] of inventory.entries()) {
  test(scene.group + ' / ' + scene.label, async ({ browser }) => {
    const server = await startScene(scene.extensions, source, {
      emptyInbox: scene.emptyInbox,
      // The public URL is visible in installation guides and iframe snippets.
      port:
        scene.id === 'issue-preview'
          ? 23382
          : scene.id.startsWith('guide-')
            ? 23400 + index
            : 0,
    })
    try {
      for (const width of [1440, 1024, 375])
        await verifyViewport(browser, scene, server.origin, width)
    } finally {
      await server.stop()
    }
  })
}
test('キーボードだけで受信箱から返信・完了まで操作できる', async ({ page }) => {
  test.skip(before, 'The keyboard scenario uses the redesigned controls.')
  const server = await startScene()
  try {
    await keyboardFlow(page, server.origin)
  } finally {
    await server.stop()
  }
})
