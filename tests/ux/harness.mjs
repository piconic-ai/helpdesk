import { test as base, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { startScene } from '../ui/seed.mjs'

async function trackActions(page) {
  const counts = { clicks: 0, edits: 0, keys: 0 }
  await page
    .context()
    .exposeBinding('recordHelpdeskAction', (_source, kind) => {
      counts[kind]++
    })
  await page.context().addInitScript(() => {
    if (window !== window.top) return
    document.addEventListener(
      'click',
      (event) => {
        if (event.isTrusted) void window.recordHelpdeskAction('clicks')
      },
      true,
    )
    const changedFields = new WeakSet()
    document.addEventListener(
      'input',
      (event) => {
        if (!changedFields.has(event.target))
          void window.recordHelpdeskAction('edits')
        changedFields.add(event.target)
      },
      true,
    )
    document.addEventListener(
      'change',
      (event) => {
        if (!changedFields.delete(event.target))
          void window.recordHelpdeskAction('edits')
      },
      true,
    )
    document.addEventListener(
      'keydown',
      (event) => {
        if (
          [
            'Enter',
            'Escape',
            'Tab',
            '?',
            'j',
            'k',
            'r',
            'n',
            'e',
            'a',
            'u',
          ].includes(event.key) &&
          (!event.target.matches('input, textarea') || event.key.length > 1)
        )
          void window.recordHelpdeskAction('keys')
      },
      true,
    )
  })
  return counts
}
export { expect }
export const test = base.extend({
  extensions: [[], { option: true }],
  scene: async ({ extensions }, use) => {
    const scene = await startScene(extensions, '.', { tickingClock: true })
    try {
      await use(scene)
    } finally {
      await scene.stop()
    }
  },
  page: async ({ page, scene }, use, testInfo) => {
    const count = process.env.HELPDESK_UX_REPORT
      ? await trackActions(page)
      : null
    await page.goto(scene.origin)
    await use(page)
    const id = testInfo.title.match(/^J\d+/)?.[0]
    if (count && id && testInfo.status === 'passed') {
      const path = resolve(
        process.env.HELPDESK_UX_STEPS ?? 'docs/reports/ux/steps',
        id,
      )
      await mkdir(path, { recursive: true })
      await writeFile(
        resolve(path, 'walk.json'),
        JSON.stringify({ title: testInfo.title, ...count }) + '\n',
      )
    }
  },
})

export async function capture(page, journey, step, caption) {
  if (!process.env.HELPDESK_UX_REPORT) return
  const dir = resolve(
    process.env.HELPDESK_UX_STEPS ?? 'docs/reports/ux/steps',
    journey,
  )
  await mkdir(dir, { recursive: true })
  const name = step + '.png'
  await page.screenshot({ path: resolve(dir, name), animations: 'disabled' })
  await writeFile(
    resolve(dir, step + '.json'),
    JSON.stringify({ name, caption, path: new URL(page.url()).pathname }) +
      '\n',
  )
}

export async function confirmSubmission(page) {
  const dialog = page.locator('#action-confirmation')
  await expect(dialog).toBeVisible()
  await dialog.locator('[data-commit]').click()
}
