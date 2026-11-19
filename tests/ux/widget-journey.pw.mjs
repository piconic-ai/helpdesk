import { expect, test } from './harness.mjs'
import { chapter } from './handbook.mjs'
import { registerProduct, serveProduct } from '../../examples/widget/server.mjs'

test.use({ extensions: ['chat', 'articles', 'form', 'feedback'] })

async function focusByTab(page, target) {
  await expect(target).toBeVisible()
  for (let i = 0; i < 32; i++) {
    if (await target.evaluate((el) => el.matches(':focus'))) return
    await page.keyboard.press('Tab')
  }
  await expect(target).toBeFocused()
}

async function activate(page, target) {
  await focusByTab(page, target)
  await page.keyboard.press('Enter')
}

test(
  chapter(
    'H11',
    'ヘルプ',
    '質問',
    '質問する',
    '解決しなかった',
    '送信',
    'チャットを開いたページ',
  ),
  async ({ page, scene }) => {
    const product = await serveProduct(scene.origin)
    const requests = []
    page.on('request', (request) => {
      if (new URL(request.url()).origin === scene.origin) requests.push(request)
    })
    try {
      await page.setViewportSize({ width: 375, height: 812 })
      await registerProduct(scene.origin, product.origin)
      await page.goto(
        product.origin +
          '/billing/receipts?account=private-query-marker#private-fragment-marker',
      )
      const launcher = page.getByRole('button', { name: 'ヘルプ', exact: true })
      await activate(page, launcher)
      const child = page.frameLocator('iframe')
      const field = child.getByRole('textbox', { name: '質問', exact: true })
      await expect(field).toBeFocused()
      const question = '領収書を発行したい'
      expect(
        await page
          .locator('iframe')
          .evaluate((el) => el.contentDocument === null),
      ).toBe(true)
      await page.keyboard.insertText(question)
      await activate(page, child.getByRole('button', { name: '質問する' }))
      await activate(
        page,
        child.getByRole('link', { name: '領収書を発行する', exact: true }),
      )
      await expect(
        child.getByRole('link', { name: '新しいタブで開く' }),
      ).toBeVisible()
      await activate(
        page,
        child.getByRole('button', { name: 'やりとりに戻る' }),
      )
      await activate(
        page,
        child.getByRole('button', { name: '解決しなかった' }),
      )
      await expect(
        child.getByRole('button', { name: '解決した', exact: true }),
      ).toHaveCount(0)
      await expect(
        child.getByRole('button', { name: '解決しなかった' }),
      ).toHaveCount(0)
      await focusByTab(page, child.getByLabel('連絡先メールアドレス'))
      await page.keyboard.insertText('example-billing@example.net')
      await activate(
        page,
        child.getByRole('button', { name: '送信', exact: true }),
      )
      const confirmation = child.getByText(/問い合わせを受け付けました（#\d+）/)
      await expect(confirmation).toBeVisible()
      const number = (await confirmation.innerText()).match(/#(\d+)/)[1]
      await expect(
        child.getByText('example-billing@example.net', { exact: true }),
      ).toBeVisible()
      for (const request of requests) {
        const wire = JSON.stringify([
          request.url(),
          await request.allHeaders(),
          request.postData(),
        ])
        expect(wire).not.toMatch(/private-(query|fragment)-marker/)
      }
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(scene.origin)
      const row = page
        .locator('a.conversation-row')
        .filter({ hasText: question })
      await expect(row).toContainText('#' + number)
      await row.click()
      await expect(page.locator('.message-inbound')).toContainText(question)
      await expect(
        page.getByText(product.origin + '/billing/receipts', { exact: true }),
      ).toBeVisible()
    } finally {
      await product.stop()
    }
  },
)

test('登録のない製品サイトではブラウザーがチャットの枠を拒否する', async ({
  page,
  scene,
}) => {
  const product = await serveProduct(scene.origin)
  try {
    await page.goto(product.origin + '/billing')
    const blocked = page.waitForEvent('console', (msg) =>
      /frame-ancestors/i.test(msg.text()),
    )
    await page.getByRole('button', { name: 'ヘルプ', exact: true }).click()
    await blocked
    await expect(
      page.frameLocator('iframe').getByRole('textbox', { name: '質問' }),
    ).toHaveCount(0)
    await page.getByRole('button', { name: 'ヘルプを閉じる' }).click()
    await expect(
      page.getByRole('button', { name: 'ヘルプ', exact: true }),
    ).toBeFocused()
  } finally {
    await product.stop()
  }
})
