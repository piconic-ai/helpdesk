import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { jsxRenderer } from 'hono/jsx-renderer'
import { BfScripts } from '@barefootjs/hono/scripts'
import { Hono } from 'hono'
import { chromium } from 'playwright'
import { expect, test } from 'vitest'
import { ReplyComposer } from '@/components/ReplyComposer'

test('reply preview renders untrusted draft text and preserves the native submission', async () => {
  const app = new Hono()
    .use(
      jsxRenderer(({ children }) => (
        <>
          {children}
          <BfScripts />
        </>
      )),
    )
    .get('/', (c) =>
      c.render(
        <ReplyComposer
          number={42}
          mailbox="support@example.com"
          contact="person@example.net"
        />,
      ),
    )
  const html = await (await app.request('/')).text()
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.route('http://helpdesk.test/**', async (route) => {
      const path = new URL(route.request().url()).pathname
      if (path.startsWith('/components/')) {
        return route.fulfill({
          contentType: 'text/javascript',
          body: await readFile(resolve('public', '.' + path)),
        })
      }
      return route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: html,
      })
    })
    await page.goto('http://helpdesk.test/')
    const draft = '<strong>Thank you!</strong>'
    await page.getByLabel('返信', { exact: true }).fill(draft)
    await page.locator('form button[aria-expanded]').click()
    await page.locator('pre').waitFor({ state: 'visible' })
    expect(await page.locator('pre').textContent()).toBe(draft)
    expect(await page.locator('pre strong').count()).toBe(0)
    const submitted = page.waitForRequest(
      (request) => request.method() === 'POST',
    )
    await page.getByRole('button', { name: '送信' }).click()
    const request = await submitted
    expect(new URL(request.url()).pathname).toBe('/actions/reply')
    expect(
      Object.fromEntries(new URLSearchParams(request.postData() ?? '')),
    ).toEqual({
      body: draft,
      number: '42',
    })
  } finally {
    await browser.close()
  }
})
