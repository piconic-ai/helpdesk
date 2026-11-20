import { screenshotName } from './screenshot-name.mjs'
import { registeredScreens, routeScenes } from './route-inventory.mjs'
import { behaviorScenes, saveExampleNote } from './behavior-scenes.mjs'
import { startDemo } from './demo-scene.mjs'
import { loopScenes, exposeLoopScene, seedLoopScene } from './loop-scenes.mjs'
import {
  suggestionScenes,
  exposeSuggestionScene,
  seedSuggestionScene,
} from './suggestion-scenes.mjs'
import { widgetSettingsScenes, exposeWidgetSettings } from './widget-scenes.mjs'
import { trendScenes, seedTrendExamples } from './trend-scenes.mjs'
import {
  identityScenes,
  setSceneIcon,
  exposeIdentityControls,
} from './identity-scenes.mjs'
import { test, expect } from '@playwright/test'
import { audit } from './audit.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { startScene, fixedTime } from './seed.mjs'
import { keyboardFlow, prepare } from './drive.mjs'
import { compositionScreens } from './composition-screens.mjs'
import { reviewScreens, seedReviewExamples } from './review-screens.mjs'
import { nextIssuesScenes } from './next-issues-scenes.mjs'
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
  if (!before && !nativePending) {
    await expect.soft(page).toHaveScreenshot(screenshotName(name))
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
    expect.soft(pixels).toMatchSnapshot(screenshotName(name))
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
      if (suggestionScenes.includes(scene))
        await exposeSuggestionScene(page, scene.id)
      if (identityScenes.includes(scene))
        await exposeIdentityControls(page, scene.id)
      if (widgetSettingsScenes.includes(scene))
        await exposeWidgetSettings(page, scene)
      if (loopScenes.includes(scene)) await exposeLoopScene(page, scene)
      if (behaviorScenes.includes(scene)) await scene.expose?.(page)
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

const curated = before
  ? screens
  : [
      ...screens,
      ...dailyScreens,
      ...compositionScreens,
      ...reviewScreens,
      ...nextIssuesScenes,
      ...identityScenes,
      ...trendScenes,
      ...widgetSettingsScenes,
      ...suggestionScenes,
      ...loopScenes,
      ...behaviorScenes,
    ]
const inventory = before ? curated : [...curated, ...routeScenes(curated)]
// Use a stable visible hostname and port wherever the installation snippet is captured.
function scenePort(scene, index) {
  if (loopScenes.includes(scene)) return 24000 + loopScenes.indexOf(scene)
  if (scene.id === 'suggest-settings') return 23945
  if (scene.id === 'issue-preview') return 23382
  if (scene.id.startsWith('guide-')) return 23400 + index
  if (widgetSettingsScenes.includes(scene))
    return 23930 + widgetSettingsScenes.indexOf(scene)
  return 0
}
for (const [index, scene] of inventory.entries()) {
  test(scene.group + ' / ' + scene.label, async ({ browser }) => {
    const server =
      scene.demo || scene.registered
        ? await startDemo(25600 + index)
        : await startScene(scene.extensions, source, {
            emptyInbox: scene.emptyInbox,
            port: scenePort(scene, index),
          })
    try {
      if (reviewScreens.includes(scene) || nextIssuesScenes.includes(scene))
        await seedReviewExamples(server.db, scene.extensions ?? [])
      if (suggestionScenes.includes(scene))
        await seedSuggestionScene(server.db, scene.id)
      if (loopScenes.includes(scene)) await seedLoopScene(server.db, scene)
      if (trendScenes.includes(scene)) await seedTrendExamples(server.db)
      if (identityScenes.includes(scene))
        await setSceneIcon(server.origin, scene.mode)
      if (scene.url.includes('notice=note')) {
        const page = await browser.newPage()
        try {
          await saveExampleNote(page, server.origin)
        } finally {
          await page.close()
        }
      }
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

test('every registered screen and installed extension has a browser capture', async () => {
  const demo = await startDemo()
  try {
    const response = await fetch(demo.origin + '/extensions')
    const html = await response.text()
    const extensions = [...html.matchAll(/data-extension="([a-z-]+)"/g)].map(
      (m) => '/extensions/' + m[1],
    )
    expect(extensions.length).toBeGreaterThan(0)
    const paths = new Set(inventory.map((s) => s.url))
    expect(
      [...registeredScreens(), ...extensions].filter(
        (path) => !paths.has(path),
      ),
    ).toEqual([])
  } finally {
    await demo.stop()
  }
})
