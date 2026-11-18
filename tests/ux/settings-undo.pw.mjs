import { startScene } from '../ui/seed.mjs'
import { test, expect } from './harness.mjs'
test.use({ extensions: ['canned', 'rules'] })
test('定型文・ルール・並べ替え・拡張有効化を結果から元に戻す', async ({
  page,
  scene,
}) => {
  const undo = () =>
    page.getByRole('button', { name: '元に戻す', exact: true }).click()
  await page.goto(scene.origin + '/extensions/canned')
  const newTemplate = page
    .locator('form[action="/extensions/canned/save"]')
    .last()
  await newTemplate.getByLabel('定型文の表示名').fill('契約の更新')
  await newTemplate.getByLabel('定型文の本文').fill('更新方法です。')
  await newTemplate.getByRole('button').click()
  await expect(
    page.locator('summary').filter({ hasText: '契約の更新' }),
  ).toBeVisible()
  await undo()
  await expect(
    page.locator('summary').filter({ hasText: '契約の更新' }),
  ).toHaveCount(0)
  await page.goto(scene.origin + '/extensions/rules')
  const create = async (name) => {
    const f = page.locator('form[action="/extensions/rules/add"]').last()
    await f.getByLabel('件名に含む言葉').fill(name)
    await f.getByLabel('付けるラベル').selectOption('請求')
    await f.getByRole('button').click()
  }
  await create('先に追加')
  await create('後から追加')
  const rows = page.locator('.rule-list > li')
  await expect(rows.first()).toContainText('先に追加')
  await rows.last().getByRole('button', { name: '上へ' }).click()
  await expect(rows.first()).toContainText('後から追加')
  await undo()
  await expect(rows.first()).toContainText('先に追加')
  await rows.first().locator('summary').click()
  await rows.first().getByLabel('件名に含む言葉').fill('編集した件名')
  await rows.first().getByRole('button', { name: '変更を保存' }).click()
  await undo()
  await expect(rows.first()).toContainText('先に追加')
  await page.goto(scene.origin + '/extensions')
  const card = page.locator('[data-extension="snooze"]')
  await card.getByRole('button', { name: /有効にする/ }).click()
  await undo()
  await expect(card.getByRole('button', { name: /有効にする/ })).toBeVisible()
})

const multiAdmin = test.extend({
  scene: async ({ extensions }, use) => {
    const scene = await startScene(extensions, '.', { secondAdmin: true })
    try {
      await use(scene)
    } finally {
      await scene.stop()
    }
  },
})

multiAdmin(
  '二人で定型文を編集し、他人の取り消しと古い編集が直近の本文を書き換えない',
  async ({ page, scene, browser }) => {
    const peer = await browser.newContext()
    await peer.addCookies([
      {
        name: 'peer-admin',
        value: scene.peerCookie,
        url: scene.origin,
        httpOnly: true,
        sameSite: 'Strict',
      },
    ])
    const second = await peer.newPage()
    try {
      const path = scene.origin + '/extensions/canned'
      const open = async (p, label) => {
        await p.goto(path)
        await p.locator('summary').filter({ hasText: label }).click()
      }
      const change = async (p, value) => {
        const editor = p.locator('details[open] form')
        await editor.getByLabel('定型文の本文').fill(value)
        await editor.getByRole('button', { name: '変更を保存' }).click()
      }
      const title = 'お問い合わせの受付'
      await open(page, title)
      await open(second, title)
      await expect(
        second.getByRole('link', { name: /アカウント/ }),
      ).toContainText('mori')
      await change(page, 'この本文は一人目が保存しました。')
      const receipt = page.url()
      await change(second, '古い画面の本文です。')
      await expect(second.getByRole('alert')).toContainText('更新されたため')
      await second.goto(receipt)
      await second.getByRole('button', { name: '元に戻す' }).click()
      await expect(second.getByRole('alert')).toContainText('元に戻せません')
      await open(second, title)
      await change(second, '二人目が保存した本文です。')
      await page.getByRole('button', { name: '元に戻す' }).click()
      await expect(page.getByRole('alert')).toContainText('元に戻せません')
      await open(page, title)
      await expect(page.locator('details[open] textarea')).toHaveValue(
        '二人目が保存した本文です。',
      )
      await second.getByRole('button', { name: '元に戻す' }).click()
      await open(second, title)
      await expect(second.locator('details[open] textarea')).toHaveValue(
        'この本文は一人目が保存しました。',
      )
    } finally {
      await peer.close()
    }
  },
)
