import { extensionModeSQL } from './extension-mode'
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
  const config = extensionModeSQL(
    process.env.HELPDESK_TEST_EXTENSIONS,
    'operator@example.com',
  )
  if (config.length)
    await promisify(execFile)(
      process.execPath,
      [
        resolve('node_modules/wrangler/bin/wrangler.js'),
        'd1',
        'execute',
        'DB',
        '--local',
        '--persist-to',
        state,
        '--command',
        config.join(';'),
      ],
      { env: { ...process.env, CI: 'true' } },
    )
  server = await unstable_dev(
    process.env.HELPDESK_TEST_EXTENSIONS === 'on'
      ? 'tests/mail-flow-worker.ts'
      : 'worker.ts',
    {
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
    },
  )
  origin = 'http://127.0.0.1:' + server.port
}, 60_000)
afterAll(async () => {
  await server?.stop()
  if (state) await rm(state, { recursive: true, force: true })
})

async function registerMailbox(page: Page) {
  await page.goto(origin + '/settings')
  await page.getByRole('link', { name: /^全体の設定/ }).click()
  await page.getByRole('link', { name: /^プロジェクトと窓口/ }).click()
  await page
    .getByRole('link', { name: 'プロジェクトを追加', exact: true })
    .click()
  await page
    .getByLabel('プロジェクト名')
    .fill('Shop')
    .catch(async (error) => {
      throw new Error(
        page.url() + '\n' + (await page.locator('main').innerText()),
        { cause: error },
      )
    })
  await page.getByLabel('窓口のメールアドレス').fill('support@example.com')
  await page.getByRole('button', { name: '窓口を登録' }).click()
  await page.getByRole('heading', { name: 'Shop', exact: true }).waitFor()
  await page.getByText('support@example.com', { exact: true }).waitFor()
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
  const frame = page.frameLocator('iframe[title="HTML メール"]')
  await frame.getByText('Where can I download the receipt?').waitFor()
  const iframe = page.locator('iframe')
  expect(await iframe.getAttribute('sandbox')).toBe('allow-scripts')
  expect(
    await iframe.evaluate((el) => (el as HTMLIFrameElement).contentDocument),
  ).toBeNull()
  const frameResponse = await page.request.get(
    origin + (await iframe.getAttribute('src')),
  )
  const policy = frameResponse.headers()['content-security-policy']
  expect(policy).toContain("default-src 'none'")
  const remote = frame.locator('img[data-remote-image]')
  expect(await remote.getAttribute('src')).toBeNull()
  const imageUrl = await remote.getAttribute('data-remote-image')
  expect(imageUrl).toBe('https://tracker.example/pixel')
  let requested = false
  await page.route(imageUrl!, async (route) => {
    requested = true
    expect(route.request().headers().referer).toBeUndefined()
    await route.fulfill({ status: 204 })
  })
  await frame.getByRole('button', { name: '外部の画像を表示' }).click()
  await expect.poll(() => requested).toBe(true)
  expect(policy).toMatch(/script-src 'nonce-[^']+';/)
  await expect
    .poll(async () => {
      const content = await frame.locator('main').boundingBox()
      const bounds = await iframe.boundingBox()
      return Math.abs(bounds!.height - Math.ceil(content!.height))
    })
    .toBeLessThan(2)
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
    await page.getByLabel('返信', { exact: true }).fill(reply)
    await page.getByRole('button', { name: 'プレビュー' }).click()
    const preview = page.locator('.reply-preview')
    await preview.getByText(reply, { exact: true }).waitFor()
    expect(await preview.innerText()).toContain('support@example.com')
    await page.getByRole('button', { name: '送信', exact: true }).click()
    await page
      .getByRole('form', { name: 'この返信の送信予定' })
      .getByRole('button', { name: '取り消す' })
      .waitFor()
    expect(await page.getByRole('dialog').count()).toBe(0)
    const sent = page
      .locator('article')
      .filter({ hasText: reply })
      .getByText('送信済み', { exact: true })
    await sent.waitFor({ timeout: 30_000 })
    expect(await page.locator('main').innerText()).toContain('返信待ち')
    await receive('mail-follow-up.eml')
    await expect
      .poll(
        async () => {
          await page.reload()
          return page.locator('main').innerText()
        },
        { timeout: 15_000 },
      )
      .toMatch(/未対応[\s\S]*I found the receipt/)
    await page.getByRole('button', { name: '完了にする' }).click()
    await page.getByRole('button', { name: '完了', exact: true }).waitFor()
    await page.goto(origin)
    expect(
      await page.getByRole('link', { name: /Receipt download/ }).count(),
    ).toBe(0)
    expect(external).toEqual([])
  } finally {
    await browser.close()
  }
}, 45_000)
