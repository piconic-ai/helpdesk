import { PNG } from 'pngjs'
import { expect, test } from './harness.mjs'
import { seedReviewIssues } from '../ui/review-issue-seed.mjs'

test.use({
  extensions: ['articles', 'chat', 'feedback', 'form', 'issues', 'metrics'],
})
const iconUrl = '/help/product-icon/slide'
const image = 'img[src="' + iconUrl + '"]'
const surfaces = [
  ['/', 'main .conversation-row', 16],
  ['/conversation/1', 'main [data-ui=attributes]', 20],
  ['/issues', 'main table', 16],
  ['/issues/example/helpdesk/43', 'main', 20],
  ['/voices', 'main', 16],
  ['/metrics?product=slide', 'main', 16],
  ['/articles', 'main [data-ui=article-list-row]', 16],
  ['/settings/mailboxes?edit=slide', 'main h1', 20],
  ['/extensions/issues', 'main h2', 20],
  ['/extensions/chat', 'main h2', 20],
  ['/help/', 'main h2', 20],
  ['/help/articles/slide/', '.public-header', 28],
  ['/help/articles/slide/receipt', '.public-header', 28],
  ['/help/chat/slide', '.public-header', 28],
  ['/help/form/slide', '.public-header', 28],
  ['/help/feedback/slide', '.public-header', 28],
]
async function revealForm(page, scene) {
  await page.goto(scene.origin + '/settings/mailboxes?edit=slide')
  const group = page.locator('section.settings-card').filter({
    has: page.getByRole('heading', {
      name: 'アイコンとメール差出人',
      exact: true,
    }),
  })
  await group.getByText('プロダクトのアイコンを変更', { exact: true }).click()
  return group.locator('form[data-product-icon-form]')
}

for (const mode of ['initial', 'emoji', 'image']) {
  test(
    '設定したプロダクトのアイコンが各画面とタブに反映される · ' + mode,
    async ({ page, scene }) => {
      await seedReviewIssues(scene.db)
      if (mode !== 'initial') {
        const form = await revealForm(page, scene)
        await form.getByLabel('アイコンの種類').selectOption(mode)
        if (mode === 'emoji')
          await form.getByRole('textbox', { name: /絵文字/ }).fill('👩🏽‍🚀')
        else {
          const png = new PNG({ width: 4, height: 2 })
          png.data.fill(193)
          await form
            .getByLabel('アイコン画像', { exact: false })
            .setInputFiles({
              name: 'slide.png',
              mimeType: 'image/png',
              buffer: PNG.sync.write(png),
            })
        }
        await form.getByRole('button', { name: 'アイコンを保存' }).click()
        await expect(page.getByRole('status')).toContainText('アイコンを保存')
      }
      const asset = await page.request.get(scene.origin + iconUrl)
      expect(asset.ok()).toBe(true)
      if (mode === 'image') {
        expect(asset.headers()['content-type']).toBe('image/png')
        const png = PNG.sync.read(await asset.body())
        expect([png.width, png.height]).toEqual([96, 96])
        expect(png.data[0]).toBe(193)
      } else {
        expect(asset.headers()['content-type']).toContain('image/svg+xml')
        expect(await asset.text()).toContain(
          mode === 'initial' ? '>S</text>' : '>👩🏽‍🚀</text>',
        )
      }
      for (const [path, selector, pixels] of surfaces) {
        await page.goto(scene.origin + path)
        const icon = page
          .locator(selector)
          .locator(image)
          .filter({ visible: true })
          .first()
        await expect(icon, path).toBeVisible()
        await expect
          .poll(() => icon.evaluate((el) => el.naturalWidth), { message: path })
          .toBe(96)
        expect(
          await icon.evaluate((el) => el.getBoundingClientRect().width),
          path,
        ).toBe(pixels)
        if (path.startsWith('/help/') && path !== '/help/')
          await expect(page.locator('link[rel=icon]')).toHaveAttribute(
            'href',
            iconUrl,
          )
      }
      await page.goto(scene.origin + '/?product=slide')
      const selected = page.locator('[popovertarget=product-switcher]')
      await expect(selected.locator(image)).toBeVisible()
      await selected.click()
      await expect(
        page.locator('#product-switcher').locator(image),
      ).toBeVisible()
    },
  )
}
test('アイコンを変更しても他のプロダクトに影響せず、無効な画像や絵文字を退け、頭文字にも戻せる', async ({
  page,
  scene,
}) => {
  const form = await revealForm(page, scene)
  await form.getByLabel('アイコンの種類').selectOption('emoji')
  await form.getByRole('textbox', { name: /絵文字/ }).fill('🌙🌊')
  await form.getByRole('button', { name: 'アイコンを保存' }).click()
  await expect(page.getByRole('alert')).toContainText('絵文字を1つ')
  await page.getByRole('textbox', { name: /絵文字/ }).fill('🌙')
  await page.getByRole('button', { name: 'アイコンを保存' }).click()
  await expect(page.getByRole('status')).toContainText('アイコンを保存')
  expect(
    await (
      await page.request.get(scene.origin + '/help/product-icon/desk')
    ).text(),
  ).toContain('>D</text>')
  await revealForm(page, scene)
  await form.getByLabel('アイコンの種類').selectOption('image')
  await form.getByLabel('アイコン画像', { exact: false }).setInputFiles({
    name: 'wrong.png',
    mimeType: 'image/png',
    buffer: Buffer.from('invalid'),
  })
  await form.getByRole('button', { name: 'アイコンを保存' }).click()
  await expect(page.getByRole('alert')).toContainText('JPEG')
  expect(
    await (await page.request.get(scene.origin + iconUrl)).text(),
  ).toContain('>🌙</text>')
  await page.getByLabel('アイコンの種類').selectOption('initial')
  await page.getByRole('button', { name: 'アイコンを保存' }).click()
  await expect(page.getByRole('status')).toContainText('アイコンを保存')
  expect(
    await (await page.request.get(scene.origin + iconUrl)).text(),
  ).toContain('>S</text>')
})
