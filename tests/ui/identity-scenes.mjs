import assert from 'node:assert/strict'
import { PNG } from 'pngjs'

export const identityScenes = [
  {
    id: 'label-colors',
    label: 'ラベルの色を選ぶ',
    url: '/settings/projects/slide/labels',
  },
  {
    id: 'product-icon-settings',
    label: 'プロジェクトのアイコンを設定',
    url: '/settings/mailboxes?edit=slide',
  },
  {
    id: 'product-switcher',
    label: 'アイコンからプロジェクトを選ぶ',
    url: '/?product=slide',
  },
  {
    id: 'product-emoji',
    label: '絵文字を設定した公開窓口',
    url: '/help/form/slide',
    mode: 'emoji',
  },
  {
    id: 'product-image',
    label: '画像を設定した公開窓口',
    url: '/help/form/slide',
    mode: 'image',
  },
].map((scene) => ({ ...scene, group: '識別の手がかり', extensions: ['form'] }))

function sampleLogo() {
  const png = new PNG({ width: 32, height: 32 })
  for (let y = 0; y < png.height; y++)
    for (let x = 0; x < png.width; x++) {
      const line =
        x >= 7 &&
        x < 25 &&
        ((y >= 7 && y < 12) || (y >= 16 && y < 22 && x < 17))
      png.data.set(
        line ? [255, 255, 255, 255] : [42, 62, 88, 255],
        4 * (y * png.width + x),
      )
    }
  return PNG.sync.write(png)
}

export async function setSceneIcon(origin, mode) {
  if (!mode) return
  const form = new FormData()
  form.set('mode', mode)
  if (mode === 'emoji') form.set('emoji', '🗂️')
  else {
    form.set(
      'image',
      new Blob([sampleLogo()], { type: 'image/png' }),
      'slide.png',
    )
  }
  const response = await fetch(origin + '/settings/product-icon/slide', {
    method: 'POST',
    body: form,
    redirect: 'manual',
    headers: { Origin: origin },
  })
  assert.equal(response.status, 303)
}

export async function exposeIdentityControls(page, id, baseline = false) {
  if (id === 'product-icon-settings' && !baseline) {
    await page
      .getByText('プロジェクトのアイコンを変更', { exact: true })
      .first()
      .click()
    await page
      .locator('form[action^="/settings/product-icon/"]:visible')
      .first()
      .scrollIntoViewIfNeeded()
  }
  if (id === 'product-switcher') {
    if (page.viewportSize().width < 768)
      await page.getByRole('button', { name: 'メニューを開く' }).click()
    await page.locator('[popovertarget="product-switcher"]:visible').click()
  }
}
