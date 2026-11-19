import { expect, test } from './harness.mjs'

test.use({ extensions: ['merge', 'articles', 'issues', 'rules', 'feedback'] })

async function inspectModal(
  page,
  trigger,
  {
    content,
    first = 'キャンセル',
    open = () => trigger.click(),
    restore = trigger,
  } = {},
) {
  await open()
  const modal = page.locator('dialog:modal')
  await expect(modal).toHaveCount(1)
  await expect(modal).toContainText(content)
  const initial = modal.getByRole('button', { name: first, exact: true })
  await expect(initial).toBeFocused()
  const background = page.locator('main').first()
  await background.evaluate((el) => el.focus())
  await expect(initial).toBeFocused()
  const backdrop = await modal.evaluate((dialog) => {
    const box = dialog.getBoundingClientRect()
    const corners = [
      [16, 24],
      [innerWidth - 24, 24],
      [16, innerHeight - 24],
      [innerWidth - 24, innerHeight / 2],
    ]
    document.addEventListener(
      'pointerdown',
      (event) => {
        dialog.dataset.backdropHit = String(event.target === dialog)
      },
      { capture: true, once: true },
    )
    return corners.find(
      ([x, y]) =>
        (x < box.left || x > box.right || y < box.top || y > box.bottom) &&
        document.elementFromPoint(x, y) === dialog,
    )
  })
  expect(backdrop).toBeDefined()
  await page.mouse.click(...backdrop)
  await expect(modal).toHaveAttribute('data-backdrop-hit', 'true')
  await page.keyboard.press('?')
  await expect(page.locator('dialog[open]')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.locator('dialog[open]')).toHaveCount(0)
  await expect(restore).toBeFocused()
}

const button = (page, name) => page.getByRole('button', { name, exact: true })
const formButton = (page, action) =>
  page
    .locator(
      'form[action="' +
        action +
        '"] button[type=submit],form[action="' +
        action +
        '"] button:not([type])',
    )
    .first()

test('承認・破棄の各確認は背後を操作できず Esc で元の操作に戻る', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/5')
  await inspectModal(page, button(page, '承認して送信'), {
    content: 'customer5@example.net',
  })
  await inspectModal(page, formButton(page, '/actions/discard'), {
    content: '下書き1件',
  })
})

test('統合・変換・起票の各確認で相手と内容を読み、Esc で元の会話に戻る', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/1')
  const merge = page.locator('[data-extension="merge"]')
  await merge.getByRole('button', { name: '会話を統合', exact: true }).click()
  await expect(merge.locator('option:checked')).toHaveText(
    /^#\d+\s+ワークスペース/,
  )
  await expect(merge).toContainText('統合元：#1')
  await merge
    .locator('form')
    .getByRole('button', { name: '会話を統合' })
    .click()
  const confirmMerge = page.locator('dialog:modal')
  await expect(confirmMerge).toContainText('「#1 ')
  await expect(
    confirmMerge.getByRole('button', {
      name: 'この会話を統合する',
      exact: true,
    }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await inspectModal(
    page,
    merge.locator('form').getByRole('button', { name: '会話を統合' }),
    {
      content: 'ワークスペースの招待メール',
    },
  )
  await page.keyboard.press('Escape')
  const issues = page.locator('[data-extension="issues"]')
  await issues.getByText('Issue を起票する', { exact: true }).click()
  await issues.getByLabel('タイトル').fill('領収書を見つけやすくする')
  await issues.getByLabel('公開する要約').fill('検索条件が保存されません。')
  await inspectModal(
    page,
    issues.getByRole('button', { name: '起票内容を確認' }),
    { content: '検索条件が保存されません。' },
  )
  expect(scene.github.created).toHaveLength(0)
  await page.goto(scene.origin + '/extensions/issues/link/1')
  await inspectModal(page, formButton(page, '/actions/issues.link'), {
    content: 'コメントとして投稿',
  })
  expect(scene.github.comments).toHaveLength(0)
  await page.goto(scene.origin + '/conversation/10')
  await inspectModal(page, formButton(page, '/actions/feedback.convert'), {
    content: '問い合わせに変更',
  })
})

test('拡張の無効化・ルールの削除・記事の公開は確認を閉じると編集に戻る', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/extensions')
  const disable = page
    .locator('[data-extension="rules"]')
    .getByRole('switch', { name: /無効にする/ })
  await disable.click()
  await expect(
    page
      .getByRole('dialog')
      .getByRole('button', { name: '振り分けルールを無効にする', exact: true }),
  ).toBeVisible({ timeout: 1000 })
  await page.keyboard.press('Escape')
  await inspectModal(page, disable, { content: '無効にします' })
  await page.goto(scene.origin + '/extensions/rules')
  const editor = page.locator('form[action="/extensions/rules/add"]').last()
  await editor.getByLabel('件名に含む言葉').fill('請求内容の確認')
  await editor.getByLabel('付けるラベル').selectOption('請求')
  await editor.getByRole('button', { name: 'ルールを保存' }).click()
  await page.locator('[data-list=rules] summary').first().click()
  await inspectModal(page, formButton(page, '/extensions/rules/remove'), {
    content: '全プロダクト・件名に「請求内容の確認」・ラベル「請求」',
  })
  await page.goto(scene.origin + '/articles/new')
  await page.getByLabel('題名').fill('更新の手順')
  await page.getByLabel('本文').fill('設定から更新できます。')
  await inspectModal(page, button(page, '公開する'), { content: '更新の手順' })
})

test('連絡先の削除とトークン失効は対象を示し、Esc で対象を維持する', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/settings/deletion')
  await page.getByLabel('削除する相手').selectOption('customer1@example.net')
  await inspectModal(page, button(page, '削除内容を確認'), {
    content: 'customer1@example.net',
  })
  await page.goto(scene.origin + '/tokens')
  await page.getByLabel('トークン名').fill('検証専用')
  await button(page, '発行する').click()
  await inspectModal(page, button(page, '検証専用を失効させる'), {
    content: '検証専用',
  })
})

test('ショートカット一覧とモバイルメニューに一度に一つだけフォーカスできる', async ({
  page,
}) => {
  const help = page.locator('[data-keyboard-help]')
  const accountMenu = page.getByRole('button', { name: 'アカウントの操作' })
  await inspectModal(page, accountMenu, {
    open: async () => {
      await accountMenu.click()
      await help.click()
    },
    content: 'キーボード操作',
    first: '閉じる',
  })
  const link = page.locator('#navigation .brand')
  await link.focus()
  await inspectModal(page, link, {
    open: () => page.keyboard.press('?'),
    content: 'キーボード操作',
    first: '閉じる',
  })
  await page.setViewportSize({ width: 375, height: 800 })
  const menu = page.locator('[data-open-drawer]')
  await inspectModal(page, menu, {
    content: 'Helpdesk',
    first: 'メニューを閉じる',
  })
  await menu.click()
  await accountMenu.click()
  await help.click()
  await expect(page.locator('#keyboard-help:modal')).toBeVisible()
  await expect(page.locator('dialog[open]')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.locator('#nav-drawer:modal')).toBeVisible()
  await expect(accountMenu).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
})

test('閉じた直後に別のリンクへ移動すると、そのリンクにフォーカスが残る', async ({
  page,
}) => {
  await page.locator('#navigation .brand').focus()
  await page.keyboard.press('?')
  const dialog = page.locator('#keyboard-help')
  await expect(dialog).toBeVisible()
  const destination = page.getByRole('link', { name: '設定', exact: true })
  await destination.evaluate(
    (link) =>
      new Promise((resolve) => {
        const modal = document.querySelector('dialog:modal')
        modal.addEventListener('close', () => resolve(), { once: true })
        modal.close()
        link.focus()
      }),
  )
  await expect(destination).toBeFocused()
})
