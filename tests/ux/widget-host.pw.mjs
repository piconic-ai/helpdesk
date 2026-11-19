import { createServer } from 'node:http'
import { expect, test } from './harness.mjs'

// This fixture records the four supported messages. The chat scenarios exercise
// the real question, article and contact controls in the public Worker.
async function withHost(page, helpdesk, attributes, run) {
  const site = createServer((request, response) => {
    if (request.url === '/host.css') {
      response.writeHead(200, { 'Content-Type': 'text/css' })
      return response.end(
        '* { box-sizing:content-box!important; color:purple!important } button,iframe,[data-helpdesk-widget] { position:static!important; width:8px!important; height:8px!important; opacity:.1!important }',
      )
    }
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        "default-src 'none'; script-src " +
        helpdesk +
        '; frame-src ' +
        helpdesk +
        "; style-src 'self'",
    })
    response.end(
      '<!doctype html><html lang="ja"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/host.css"><title>設定</title></head><body><main><h1>設定</h1><button data-helpdesk-open>相談する</button></main><script src="' +
        helpdesk +
        '/widget.js" data-product="slide" ' +
        attributes +
        ' async></script></body></html>',
    )
  })
  await new Promise((resolve, reject) =>
    site.once('error', reject).listen(0, '127.0.0.1', resolve),
  )
  const origin = 'http://127.0.0.1:' + site.address().port
  const requests = []
  await page.route(helpdesk + '/help/chat/slide?**', (route) => {
    requests.push(route.request())
    return route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: '<!doctype html><html><title>Help</title><textarea aria-label="質問"></textarea><script>window.messages=[];addEventListener("message", e=>{window.messages.push(e.data);if(e.data.type==="helpdesk:open")document.querySelector("textarea").focus()})</script></html>',
    })
  })
  try {
    await page.goto(origin + '/settings/billing?private=example#secret')
    await page.waitForFunction(() => !!window.Helpdesk)
    await run(origin, requests)
  } finally {
    await new Promise((resolve) => site.close(resolve))
  }
}

test('埋め込みスクリプトは8 KiB以内で、短いキャッシュを使う', async ({
  scene,
}) => {
  const response = await fetch(scene.origin + '/widget.js')
  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toMatch(/javascript/)
  expect(response.headers.get('Cache-Control')).toBe('public, max-age=300')
  expect((await response.arrayBuffer()).byteLength).toBeLessThanOrEqual(
    8 * 1024,
  )
})

test('ランチャーは開くまで通信せず、閉じても質問とフォーカスを保つ', async ({
  page,
  scene,
}) => {
  await withHost(
    page,
    scene.origin,
    'data-position="bottom-left" data-label="サポート"',
    async (origin, requests) => {
      const launcher = page.getByRole('button', {
        name: 'サポート',
        exact: true,
      })
      await expect(launcher).toBeVisible()
      await expect(page.locator('iframe')).toHaveCount(0)
      const position = await launcher.boundingBox()
      expect(position.x).toBe(16)
      expect(position.height).toBeGreaterThanOrEqual(44)
      await launcher.focus()
      await page.keyboard.press('Enter')
      const frame = page.frameLocator('iframe')
      await expect(frame.getByRole('textbox')).toBeFocused()
      expect(requests).toHaveLength(1)
      expect(requests[0].headers().referer).toBeUndefined()
      const url = new URL(requests[0].url())
      expect(Object.fromEntries(url.searchParams)).toEqual({
        embed: '1',
        parent: origin,
        lang: 'ja',
      })
      await expect
        .poll(() => frame.locator('body').evaluate(() => window.messages[0]))
        .toEqual({
          type: 'helpdesk:open',
          page: origin + '/settings/billing',
          lang: 'ja',
        })
      const panel = page.getByRole('dialog', { name: 'ヘルプチャット' })
      expect((await panel.boundingBox()).width).toBe(360)
      await frame
        .locator('body')
        .evaluate(
          (_body, parent) =>
            window.parent.postMessage(
              { type: 'helpdesk:height', height: 5000 },
              parent,
            ),
          origin,
        )
      await expect
        .poll(async () => (await panel.boundingBox()).height)
        .toBe(720)
      await panel.evaluate((el, helpdesk) => {
        const child = el.querySelector('iframe').contentWindow
        const data = { type: 'helpdesk:close' }
        for (const [source, origin] of [
          [window, helpdesk],
          [child, location.origin],
        ]) {
          window.dispatchEvent(
            new MessageEvent('message', { data, source, origin }),
          )
        }
      }, scene.origin)
      await expect(panel).toBeVisible()
      await frame.getByRole('textbox').fill('領収書の発行')
      await frame
        .locator('body')
        .evaluate(
          (_body, parent) =>
            window.parent.postMessage({ type: 'helpdesk:close' }, parent),
          origin,
        )
      await expect(launcher).toBeFocused()
      await launcher.click()
      await expect(frame.getByRole('textbox')).toHaveValue('領収書の発行')
      expect(requests).toHaveLength(1)
      await page.getByRole('button', { name: 'ヘルプを閉じる' }).focus()
      await page.keyboard.press('Escape')
      await expect(launcher).toBeFocused()
    },
  )
})

test('独自ボタンとAPIでモバイルの全面パネルを開き、初期値を渡す', async ({
  page,
  scene,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await withHost(
    page,
    scene.origin,
    'data-launcher="none" data-lang="en"',
    async (origin, requests) => {
      await expect(
        page.getByRole('button', { name: 'Help', exact: true }),
      ).toHaveCount(0)
      await page.evaluate(() =>
        window.Helpdesk.prefill({
          email: 'person@example.test',
          name: 'Alex',
          other: 'excluded',
        }),
      )
      const trigger = page.getByRole('button', { name: '相談する' })
      await trigger.focus()
      await page.keyboard.press('Enter')
      const frame = page.frameLocator('iframe')
      await expect(frame.getByRole('textbox')).toBeFocused()
      await expect
        .poll(() => frame.locator('body').evaluate(() => window.messages))
        .toEqual([
          {
            type: 'helpdesk:open',
            page: origin + '/settings/billing',
            lang: 'en',
          },
          {
            type: 'helpdesk:prefill',
            email: 'person@example.test',
            name: 'Alex',
          },
        ])
      expect(
        await page.getByRole('dialog', { name: 'Help chat' }).boundingBox(),
      ).toEqual({ x: 0, y: 0, width: 375, height: 812 })
      await page.evaluate(() => window.Helpdesk.close())
      await expect(trigger).toBeFocused()
      await page.evaluate(() => window.Helpdesk.open())
      await expect(frame.getByRole('textbox')).toBeFocused()
      expect(requests).toHaveLength(1)
      expect(requests[0].url()).not.toContain('person')
      await page.getByRole('button', { name: 'Close help' }).click()
      await expect(trigger).toBeFocused()
    },
  )
})
