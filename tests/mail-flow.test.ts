import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { chromium, type Page } from 'playwright'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { unstable_dev, type Unstable_DevWorker } from 'wrangler'

let state: string
let server: Unstable_DevWorker
let origin: string
beforeAll(async () => {
  state = await mkdtemp(join(tmpdir(), 'helpdesk-mail-flow-'))
  await promisify(execFile)(
    process.execPath,
    [
      resolve('node_modules/wrangler/bin/wrangler.js'),
      'd1',
      'migrations',
      'apply',
      'DB',
      '--local',
      '--persist-to',
      state,
    ],
    { env: { ...process.env, CI: 'true' } },
  )
  server = await unstable_dev('worker.ts', {
    config: 'wrangler.jsonc',
    local: true,
    ip: '127.0.0.1',
    port: 0,
    inspectorPort: 0,
    persistTo: state,
    vars: { ENVIRONMENT: 'local', LOCAL_OPERATOR: 'operator@example.com' },
    experimental: {
      disableDevRegistry: true,
      disableExperimentalWarning: true,
      watch: false,
    },
  })
  origin = 'http://127.0.0.1:' + server.port
}, 60_000)
afterAll(async () => {
  await server?.stop()
  if (state) await rm(state, { recursive: true, force: true })
})

async function registerMailbox(page: Page) {
  await page.goto(origin + '/settings')
  await page.getByLabel('Product ID').fill('shop')
  await page.getByLabel('Product name').fill('Shop')
  await page.getByLabel('Mailbox address').fill('support@example.com')
  await page.getByRole('button', { name: 'Register mailbox' }).click()
  await page.getByText('Shop · support@example.com').waitFor()
}
async function receive(fixtureName: string) {
  const fixture = await readFile('tests/fixtures/' + fixtureName, 'utf8')
  const received = await fetch(
    origin +
      '/cdn-cgi/local/email?from=person@example.net&to=support@example.com',
    {
      method: 'POST',
      body: fixture,
    },
  )
  expect(received.ok, await received.text()).toBe(true)
}
async function enterConversation(page: Page) {
  await receive('mail-flow.eml')
  await page.goto(origin)
  const thread = page.getByRole('link', { name: /Receipt download/ })
  await expect
    .poll(
      async () => {
        await page.reload()
        return thread.count()
      },
      { timeout: 15_000 },
    )
    .toBe(1)
  await thread.click()
}
async function inspectMail(page: Page) {
  const frame = page.frameLocator('iframe[title="HTML message"]')
  await frame.getByText('Where can I download the receipt?').waitFor()
  expect(await page.locator('iframe').getAttribute('sandbox')).toBe('')
  expect(await frame.locator('body').textContent()).not.toContain(
    'Script executed',
  )
  const attachment = page.getByRole('link', { name: 'receipt.txt' })
  const downloaded = page.waitForEvent('download')
  await attachment.click()
  const download = await downloaded
  expect(download.suggestedFilename()).toBe('receipt.txt')
  const path = await download.path()
  expect(path && (await readFile(path, 'utf8'))).toBe('Receipt #42')
  const url = await attachment.getAttribute('href')
  const response = await page.request.get(origin + url)
  expect(response.headers()['content-disposition']).toMatch(/^attachment\b/)
}
test('F01-AC1, F01-AC15, F01-AC16, F01-AC19, F01-AC23, F01-AC24: receive, read, reply and close through the operator UI', async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    page.setDefaultTimeout(6000)
    const external: string[] = []
    await page.route('**/*', (route) => {
      if (new URL(route.request().url()).origin === origin)
        return route.continue()
      external.push(route.request().url())
      return route.abort()
    })
    await registerMailbox(page)
    await enterConversation(page)
    await inspectMail(page)
    const reply = 'Open your order and choose Receipt.'
    await page.getByLabel('Reply', { exact: true }).fill(reply)
    await page.getByRole('button', { name: 'Preview reply' }).click()
    await page.locator('pre').filter({ hasText: reply }).waitFor()
    await page.getByRole('button', { name: 'Send reply' }).click()
    await expect
      .poll(
        async () => {
          await page.reload()
          return page.locator('main').innerText()
        },
        { timeout: 15_000 },
      )
      .toMatch(/support@example\.com · pending/)
    await expect
      .poll(
        async () => {
          await page.reload()
          return page.getByText('sent', { exact: true }).count()
        },
        { timeout: 15000 },
      )
      .toBe(1)
    await receive('mail-follow-up.eml')
    await expect
      .poll(
        async () => {
          await page.reload()
          return page.locator('main').innerText()
        },
        { timeout: 15_000 },
      )
      .toMatch(/support@example\.com · open[\s\S]*I found the receipt/)
    await page.getByLabel('event').selectOption('closed')
    await page.getByRole('button', { name: 'Update status' }).click()
    await page.goto(origin)
    expect(
      await page.getByRole('link', { name: /Receipt download/ }).count(),
    ).toBe(0)
    expect(external).toEqual([])
  } finally {
    await browser.close()
  }
}, 45_000)
