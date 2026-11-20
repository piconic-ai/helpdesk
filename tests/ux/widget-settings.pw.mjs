import { expect, test } from './harness.mjs'

test.use({ extensions: ['chat', 'articles'] })

test('ボタンの設定で埋め込みコードと見本が変わり、保存した説明を元に戻せる', async ({
  page,
  scene,
}) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: scene.origin,
  })
  await page.goto(scene.origin + '/extensions/chat?product=slide')
  const product = page
    .locator('section.settings-card')
    .filter({ has: page.getByRole('heading', { name: 'Slide', exact: true }) })
  await expect(
    product.getByRole('heading', { name: 'この端末で試す埋め込みコード' }),
  ).toBeVisible()
  const snippet = product.getByLabel('埋め込みコード')
  const initial = await snippet.inputValue()
  expect(initial.split('\n')).toHaveLength(1)
  expect(initial).toContain(scene.origin + '/widget.js')
  await product.getByText('ボタンと最初の説明文を編集', { exact: true }).click()
  await product.getByLabel('ボタンの位置').selectOption('bottom-left')
  const label = 'ご相談 "窓口"'
  await product.getByLabel('ボタンの文言').fill(label)
  await product
    .getByLabel('最初の説明文')
    .fill('請求書の発行方法などをご案内します。')
  const live = await snippet.inputValue()
  expect(live).toContain('data-position="bottom-left"')
  await product.getByRole('button', { name: 'コードをコピー' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'コピーしました。' }),
  ).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(live)
  await product
    .getByRole('button', { name: '変更したボタンを見本で確認' })
    .click()
  const preview = product.frameLocator('iframe')
  const launcher = preview.getByRole('button', { name: label, exact: true })
  await expect(launcher).toBeVisible()
  expect((await launcher.boundingBox()).width).toBeGreaterThan(40)
  await launcher.click()
  await expect(
    preview.frameLocator('iframe').getByLabel('質問', { exact: true }),
  ).toBeVisible()
  await product.getByRole('button', { name: 'チャットの表示を保存' }).click()
  await expect(page.getByRole('button', { name: '元に戻す' })).toBeVisible()
  await expect(snippet).toHaveValue(/data-position="bottom-left"/)
  await product.getByText('ボタンと最初の説明文を編集', { exact: true }).click()
  await expect(product.getByLabel('最初の説明文')).toHaveValue(
    '請求書の発行方法などをご案内します。',
  )
  await expect(product.getByLabel('ボタンの文言')).toHaveValue(label)
  const chat = await page.context().newPage()
  await chat.goto(scene.origin + '/help/chat/slide')
  await expect(
    chat.getByText('請求書の発行方法などをご案内します。'),
  ).toBeVisible()
  await page.getByRole('button', { name: '元に戻す' }).click()
  await expect(snippet).toHaveValue(initial)
  await chat.reload()
  await expect(
    chat.getByText('請求書の発行方法などをご案内します。'),
  ).toHaveCount(0)
  await chat.close()
  await product.getByText('CSP の設定を確認', { exact: true }).click()
  await expect(product.getByText('script-src', { exact: true })).toBeVisible()
  await expect(product.getByText('frame-src', { exact: true })).toBeVisible()
})

test('公開ページや一般の運営者からの設定変更と、不正なボタンの位置を拒む', async ({
  page,
  scene,
}) => {
  const endpoint = scene.origin + '/extensions/chat/widget-settings'
  const form = {
    product: 'slide',
    position: 'center',
    label: 'ヘルプ',
    introduction: '',
  }
  expect(
    (
      await page.request.post(endpoint, {
        headers: { origin: scene.origin },
        form,
      })
    ).status(),
  ).toBe(400)
  expect(
    (
      await page.request.post(endpoint, {
        headers: { origin: scene.origin },
        form: { product: 'slide' },
      })
    ).status(),
  ).toBe(400)
  expect(
    (
      await page.request.post(endpoint, {
        headers: { origin: 'https://outside.example' },
        form: { ...form, position: 'bottom-left' },
      })
    ).status(),
  ).toBe(403)
  await scene.db.batch([
    scene.db.prepare(
      "UPDATE operators SET role='admin' WHERE email='mori@example.com'",
    ),
    scene.db.prepare(
      "UPDATE operators SET role='agent' WHERE email='sato@example.com'",
    ),
    scene.db.prepare(
      "UPDATE product_members SET role='agent' WHERE product='slide' AND email='sato@example.com'",
    ),
  ])
  expect(
    (
      await page.request.post(endpoint, {
        headers: { origin: scene.origin },
        form: { ...form, position: 'bottom-left' },
      })
    ).status(),
  ).toBe(403)
  expect(
    (
      await page.request.get(scene.origin + '/extensions/chat/preview/slide')
    ).status(),
  ).toBe(403)
})
