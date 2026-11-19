import { test, expect } from './harness.mjs'
import { startScene, fixedTime } from '../ui/seed.mjs'

const twoOperators = test.extend({
  scene: async ({ extensions }, use) => {
    const scene = await startScene(extensions, '.', { secondAdmin: true })
    try {
      await use(scene)
    } finally {
      await scene.stop()
    }
  },
})

twoOperators.use({ extensions: ['feedback'] })
twoOperators(
  '受信箱とフィードバックの未読は運営者ごとに独立する',
  async ({ page, scene, browser }) => {
    const peer = await browser.newContext()
    await peer.addCookies([
      {
        name: 'peer-admin',
        value: scene.peerCookie,
        url: scene.origin,
        httpOnly: true,
      },
    ])
    try {
      const other = await peer.newPage()
      for (const [list, id] of [
        ['/', 1],
        ['/?view=feedback', 10],
      ]) {
        await Promise.all([
          page.goto(scene.origin + list),
          other.goto(scene.origin + list),
        ])
        const row = '.inbox-item[data-number="' + id + '"]'
        const own = page.locator(row)
        const second = other.locator(row)
        await expect(
          own.getByRole('img', { name: '未読', exact: true }),
        ).toBeVisible()
        await own.locator('a.conversation-row').click()
        await page.goto(scene.origin + list)
        await expect(own.locator('.unread-dot')).toHaveCount(0)
        await other.reload()
        await expect(
          second.getByRole('img', { name: '未読', exact: true }),
        ).toBeVisible()
        await second.locator('a.conversation-row').click()
        await other.goto(scene.origin + list)
        await expect(second.locator('.unread-dot')).toHaveCount(0)
        // A receipt in the same clock tick as the view must be visible to both readers.
        await scene.db.batch([
          scene.db
            .prepare(
              "INSERT INTO messages(id,number,kind,body,created_at) VALUES(?,?,'inbound','追加の質問',?)",
            )
            .bind('again-' + id, id, fixedTime),
          scene.db
            .prepare(
              "INSERT INTO events(number,kind,actor,payload,at) VALUES(?,'message_received','{\"kind\":\"system\"}','{}',?)",
            )
            .bind(id, fixedTime),
        ])
        await Promise.all([page.reload(), other.reload()])
        await expect(own.locator('.unread-dot')).toBeVisible()
        await expect(second.locator('.unread-dot')).toBeVisible()
      }
    } finally {
      await peer.close()
    }
  },
)

test('ラベルの色を保存し、会話と一覧と絞り込みから同じ点を識別できる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/settings')
  await page.getByRole('link', { name: /^ラベル/ }).click()
  const section = page.getByRole('row').filter({
    has: page.getByRole('button', { name: '経理の色を変更', exact: true }),
  })
  await section.getByRole('button', { name: '経理の色を変更' }).click()
  const choices = section.locator('.swatches button')
  await expect(choices).toHaveCount(8)
  await choices.nth(4).click()
  await expect(
    section.locator('button[popovertarget^="label-color-"] .label-dot'),
  ).toHaveAttribute('data-identity-color', '4')
  await page.goto(scene.origin + '/conversation/1')
  await page.getByRole('button', { name: /ラベル: / }).click()
  await expect(
    page.getByRole('button', { name: '経理を外す' }).locator('.label-dot'),
  ).toHaveAttribute('data-identity-color', '4')
  await page.goto(scene.origin)
  const label = page.locator(
    '.inbox-item[data-number="1"] .label-chip[title="経理"]',
  )
  await expect(label.locator('.label-dot')).toHaveAttribute(
    'data-identity-color',
    '4',
  )
  await expect(label.locator('.label-dot')).toHaveCSS('width', '8px')
  await expect(label.locator('.label-dot')).toHaveCSS('height', '8px')
  await page.getByRole('button', { name: '絞り込み', exact: true }).click()
  await expect(
    page.locator('button[data-choice="経理"] .label-dot'),
  ).toHaveAttribute('data-identity-color', '4')
  await expect(
    page.locator('button[data-choice="pending"] svg'),
  ).toHaveAttribute('data-glyph', 'pending')
})

test('経路と待ち時間の印、相手の色、添付ファイルの種別を見分ける', async ({
  page,
  scene,
}) => {
  const hours = 3600000
  await scene.db.batch([
    scene.db.prepare("UPDATE conversations SET origin='chat' WHERE number=1"),
    scene.db
      .prepare("UPDATE messages SET created_at=? WHERE id='in-1'")
      .bind(fixedTime - 25 * hours),
    scene.db
      .prepare("UPDATE messages SET created_at=? WHERE id='in-7'")
      .bind(fixedTime - 73 * hours),
  ])
  await page.reload()
  const row = page.locator('.inbox-item[data-number="1"]')
  const color = await row
    .locator('.contact-avatar')
    .getAttribute('data-identity-color')
  await expect(
    row.getByRole('img', { name: 'チャット', exact: true }),
  ).toBeVisible()
  await expect(row.locator('time [data-glyph=wait]')).toBeVisible()
  await expect(
    page.locator('.inbox-item[data-number="7"] time [data-glyph=long_wait]'),
  ).toBeVisible()
  for (const width of [375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const line of await page.locator('.inbox-item .row-bottom').all()) {
      const count = await line
        .locator('svg,.avatar,.label-dot')
        .evaluateAll((els) => els.filter((el) => el.checkVisibility()).length)
      expect(count).toBeLessThanOrEqual(5)
    }
  }
  await row.locator('a.conversation-row').click()
  await expect(
    page.locator('[data-ui=attributes]').getByRole('img', { name: 'チャット' }),
  ).toBeVisible()
  await expect(page.locator('main .contact-avatar').first()).toHaveAttribute(
    'data-identity-color',
    color,
  )
  for (const [filename, mime, alt] of [
    ['receipt.png', 'image/png', '画像'],
    ['receipt.pdf', 'application/pdf', 'PDF'],
    ['receipts.xlsx', 'application/octet-stream', '表計算'],
    ['archive.zip', 'application/zip', '圧縮ファイル'],
    ['statement.txt', 'text/plain', 'ファイル'],
  ]) {
    await scene.db
      .prepare("UPDATE attachments SET filename=?,mime=? WHERE message='in-7'")
      .bind(filename, mime)
      .run()
    await page.goto(scene.origin + '/conversation/7')
    const attachment = page.locator('.attachments')
    await expect(
      attachment.getByRole('img', { name: alt, exact: true }),
    ).toBeVisible()
    await expect(attachment.getByRole('link')).toContainText(filename)
    await expect(attachment.locator('small')).toContainText(/\d+ B/)
  }
})
