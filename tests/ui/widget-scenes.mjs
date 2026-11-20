import { expect } from '@playwright/test'
export const widgetScenes = [
  ['widget-closed', '製品画面と開くボタン'],
  ['widget-open', 'チャットを開く'],
  ['widget-suggestions', '関連する記事が見つかる'],
  ['widget-article', '記事を枠内で読む'],
  ['widget-handoff', '担当者へ送る連絡先'],
  ['widget-receipt', '受付番号と返信先'],
  ['widget-no-match', '合う記事がない質問'],
].map(([id, label]) => ({ id, label, group: '埋め込みヘルプ' }))

export const widgetSettingsScenes = [
  ['widget-options', 'ボタンと最初の説明文を編集'],
  ['widget-preview', '埋め込みの見本を開く'],
  ['widget-csp', 'CSP の設定を確認'],
  ['widget-edit-sites', '埋め込み先を編集'],
  ['widget-edit-response', '返信の目安を編集'],
].map(([id, label]) => ({
  id,
  label,
  group: '埋め込み設定',
  url: '/extensions/chat?product=slide',
  extensions: ['chat', 'articles', 'form', 'feedback'],
}))

export async function exposeWidgetSettings(page, scene) {
  const card = page
    .locator('section.settings-card')
    .filter({ has: page.getByRole('heading', { name: 'Slide', exact: true }) })
  const disclosure = card.getByText(scene.label, { exact: true })
  await disclosure.click()
  await disclosure.scrollIntoViewIfNeeded()
  if (scene.id === 'widget-preview') {
    await card.locator('iframe').scrollIntoViewIfNeeded()
    const preview = card.frameLocator('iframe')
    await preview.getByRole('button', { name: 'ヘルプ', exact: true }).click()
    await expect(
      preview
        .frameLocator('iframe')
        .getByRole('textbox', { name: '質問', exact: true }),
    ).toBeFocused()
    const footer = preview.frameLocator('iframe').locator('footer')
    await expect
      .poll(() =>
        footer.evaluate(
          (el) => el.getBoundingClientRect().bottom <= innerHeight + 1,
        ),
      )
      .toBe(true)
  }
}
