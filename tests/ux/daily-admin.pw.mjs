import { test, expect, capture, confirmSubmission } from './harness.mjs'

test.use({ extensions: ['rules', 'canned', 'issues', 'metrics'] })
test('保存したルールを編集・並べ替え、適用した会話の履歴を追える', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/extensions/rules')
  const add = page.locator('form[action="/extensions/rules/add"]').last()
  for (const [word, label] of [
    ['入金', '経理'],
    ['領収', '請求'],
  ]) {
    await add.getByLabel('件名に含む言葉').fill(word)
    await add.getByLabel('付けるラベル').selectOption({ label })
    await add.getByRole('button').click()
  }
  const rows = page.locator('[data-list=rules] li')
  const receipt = rows.filter({
    has: page.locator('strong').filter({ hasText: '領収' }),
  })
  await receipt.locator('summary').click()
  await receipt.getByRole('button', { name: '上へ' }).click()
  await expect(rows.first()).toContainText('領収')
  await rows.first().locator('summary').click()
  await rows.first().getByLabel('件名に含む言葉').fill('請求変更')
  await rows.first().getByRole('button', { name: '変更を保存' }).click()
  await expect(rows.first()).toContainText('請求変更')
  await capture(page, 'C-rules', '01-order', 'ルールの適用順序と編集結果')
  await scene.receive({
    subject: '請求変更の連絡',
    body: '請求先を変更します。',
    messageId: '<change-rules@example.net>',
  })
  await page.goto(scene.origin)
  await page.getByRole('link', { name: /請求変更の連絡/ }).click()
  await expect(async () => {
    await page.reload()
    await expect(
      page
        .locator('.timeline-entry')
        .filter({ hasText: '振り分けルールを適用' }),
    ).toContainText('請求変更', { timeout: 600 })
  }).toPass({ timeout: 12000 })
  await capture(
    page,
    'C-rules',
    '02-history',
    'メッセージの間に、適用したルールとラベルを表示',
  )
  await page.goto(scene.origin + '/extensions/rules')
  await rows.first().locator('summary').click()
  await rows.first().getByRole('button', { name: 'このルールを解除' }).click()
  await confirmSubmission(page)
  await expect(rows).toHaveCount(1)
})

test('定型返信を表示名で作成・編集して会話に適用し、既存の Issue を選んで紐づける', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/extensions/canned')
  const newTemplate = page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: '定型文を作成' }) })
  await newTemplate.getByLabel('定型文の表示名').fill('入金のご案内')
  await newTemplate
    .getByLabel('定型文の本文')
    .fill('{{name}} 様、ご連絡ありがとうございます。')
  await newTemplate.getByRole('button').click()
  await page.locator('summary').filter({ hasText: '入金のご案内' }).click()
  const edit = page.locator('details[open] form')
  await edit
    .getByLabel('定型文の本文')
    .fill('{{name}} 様、入金を確認しました。')
  await edit.getByRole('button').click()
  await page.goto(scene.origin + '/conversation/1')
  const canned = page.locator('[data-extension=canned]')
  await canned.locator('[data-slot=popover-trigger]').click()
  await canned
    .getByRole('combobox', { name: '定型文', exact: true })
    .selectOption({ label: '入金のご案内' })
  await canned.locator('form').getByRole('button').click()
  await expect(page.getByRole('textbox', { name: '下書きの本文' })).toHaveValue(
    '山田 花 様、入金を確認しました。',
  )
  await page.getByText('既存の Issue を選ぶ', { exact: true }).click()
  await page
    .getByRole('combobox', { name: '課題', exact: true })
    .selectOption({ label: '領収書の一括ダウンロード (#42)' })
  await page.getByRole('button', { name: '既存の Issue と紐づける' }).click()
  await expect(page.getByRole('dialog')).toContainText('example/helpdesk')
  await confirmSubmission(page)
  await expect
    .poll(() => scene.github.comments)
    .toEqual([{ body: '[#1](' + scene.origin + '/conversation/1)' }])
  await expect(
    page.locator('[data-extension=issues] a[href*="github.com"]'),
  ).toContainText('42')
  await capture(
    page,
    'C-issue-link',
    '01-linked',
    '作成済みの Issue を選び、会話の関連情報で確認',
  )
})

test('集計に定義・前期差・少数件の案内があり未設定の拡張を判別できる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/metrics')
  await expect(page.locator('[data-ui=metric-card] p')).toHaveCount(8)
  await expect(page.locator('[data-ui=metric-card] small')).toHaveCount(8)
  await expect(page.getByText(/5件未満.*目安/)).toBeVisible()
  await expect(
    page.getByText('完了件数', { exact: true }).locator('..').locator('small'),
  ).toHaveText('前期比 +1')
  await page.goto(scene.origin + '/extensions')
  for (const name of ['受け付ける', '答える', '直す', '整える'])
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  await expect(page.locator('[data-extension=notify]')).toContainText(
    '設定が必要',
  )
})

test.describe('返信欄の記事候補', () => {
  test.use({ extensions: ['articles'] })
  test('記事の候補を Esc または外側で閉じ、元の操作へ戻れる', async ({
    page,
    scene,
  }) => {
    await page.goto(scene.origin + '/conversation/1')
    const button = page.getByRole('button', { name: '記事を添える' })
    const search = page.getByLabel('記事の題名で検索')
    await button.click()
    await search.focus()
    await page.keyboard.press('Escape')
    await expect(search).toBeHidden()
    await expect(button).toBeFocused()
    await button.click()
    await page.getByRole('heading', { level: 1 }).click()
    await expect(search).toBeHidden()
  })
})
