import { choose } from './choice.mjs'
import { test, expect, confirmSubmission } from './harness.mjs'

test.use({ extensions: ['articles', 'rules', 'canned', 'chat', 'form'] })

test('新しい記事を離れてプレビューに戻り、公開したら次の記事は空になる', async ({
  page,
  scene,
}) => {
  const path = scene.origin + '/articles/new'
  await page.goto(path)
  await page.getByLabel('題名').fill('確認中の記事')
  await page.getByLabel('本文').fill('回答をここに残す。')
  await page.goto(scene.origin + '/account')
  await page.goto(path)
  await expect(page.getByLabel('題名')).toHaveValue('確認中の記事')
  await page.getByRole('button', { name: 'プレビュー' }).click()
  await expect(page.locator('article')).toContainText('回答をここに残す。')
  await page.getByRole('button', { name: '公開する' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'キャンセル' })
    .click()
  await page.goto(path)
  await expect(page.getByLabel('本文')).toHaveValue('回答をここに残す。')
  await page.getByRole('button', { name: '公開する' }).click()
  await confirmSubmission(page)
  await expect(page.getByRole('status')).toContainText('公開')
  await page.goto(path)
  await expect(page.getByLabel('題名')).toBeEmpty()
  await expect(page.getByLabel('本文')).toBeEmpty()
})

test('新規と既存プロダクトの窓口フォームを区別し、成功したフォームだけを消す', async ({
  page,
  scene,
}) => {
  const path = scene.origin + '/settings/mailboxes'
  const fresh = page
    .locator('form')
    .filter({ has: page.getByLabel('プロダクト名', { exact: true }) })
  const existing = page
    .locator('details')
    .filter({ hasText: 'このプロダクトに窓口を追加' })
  await page.goto(path + '?new=yes')
  await fresh.getByLabel('プロダクト名').fill('新規登録の途中')
  await fresh.getByLabel('窓口アドレスの先頭').fill('new-window')
  await page.goto(path + '?edit=slide')
  await existing.locator('summary').click()
  await existing.getByLabel('窓口アドレスの先頭').fill('add-window')
  await page.goto(scene.origin + '/settings')
  await page.goto(path + '?edit=slide')
  await existing.locator('summary').click()
  await expect(existing.getByLabel('窓口アドレスの先頭')).toHaveValue(
    'add-window',
  )
  await page.goto(path + '?new=yes')
  await expect(fresh.getByLabel('窓口アドレスの先頭')).toHaveValue('new-window')
  await fresh.getByRole('button', { name: '窓口を登録' }).click()
  await expect(page.getByRole('status')).toContainText('登録')
  await page.goto(path + '?new=yes')
  await expect(fresh.getByLabel('窓口アドレスの先頭')).toBeEmpty()
  await page.goto(path + '?edit=slide')
  await existing.locator('summary').click()
  await expect(existing.getByLabel('窓口アドレスの先頭')).toHaveValue(
    'add-window',
  )
})

test('返信・内部メモ・承認待ちの編集を分け、送信を取り消した本文は残す', async ({
  page,
  scene,
}) => {
  const thread = scene.origin + '/conversation/1'
  await page.goto(thread)
  const reply = page.getByRole('textbox', { name: '返信', exact: true })
  const note = page.getByRole('textbox', { name: '内部メモ', exact: true })
  await reply.fill('返信用の本文')
  await page.getByRole('tab', { name: '内部メモ', exact: true }).click()
  await note.fill('社内メモのみ')
  await page.goto(scene.origin + '/conversation/2')
  await page.goto(thread)
  await expect(reply).toHaveValue('返信用の本文')
  await page.getByRole('button', { name: 'プレビュー' }).click()
  await expect(
    page.getByRole('region', { name: '返信のプレビュー' }),
  ).toContainText('返信用の本文')
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await page.getByRole('button', { name: '取り消す' }).click()
  await expect(reply).toHaveValue('返信用の本文')
  await page.getByRole('tab', { name: '内部メモ', exact: true }).click()
  await expect(note).toHaveValue('社内メモのみ')
  await page.getByRole('button', { name: 'メモを残す' }).click()
  await expect(page.getByRole('status')).toContainText('メモを保存')
  await expect(reply).toHaveValue('返信用の本文')
  await page.getByRole('tab', { name: '内部メモ', exact: true }).click()
  await expect(note).toBeEmpty()
  await page.goto(scene.origin + '/?view=approval')
  await page.locator('a.conversation-row').first().click()
  const edit = page.getByLabel('下書きの本文')
  await edit.fill('承認前に書き直した文章')
  await page.reload()
  await expect(edit).toHaveValue('承認前に書き直した文章')
  await expect(
    page.getByRole('textbox', { name: '返信', exact: true }),
  ).toBeEmpty()
})

test('アカウントの入力エラーの後も表示名を保持し、ファイルとトークンは記録しない', async ({
  page,
  scene,
}) => {
  const account = scene.origin + '/account'
  await page.goto(account)
  await page.getByLabel('表示名').fill('新しい表示名')
  await page.getByLabel('アイコン画像').setInputFiles({
    name: 'private-file.png',
    mimeType: 'image/png',
    buffer: Buffer.from('private-file-content'),
  })
  await page.getByRole('button', { name: 'アカウントを保存' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await page.goto(scene.origin + '/tokens')
  await page.getByLabel('トークン名').fill('private-token-label')
  await page.goto(account)
  await expect(page.getByLabel('表示名')).toHaveValue('新しい表示名')
  await expect(page.getByLabel('アイコン画像')).toBeEmpty()
  const stored = await page.evaluate(() => JSON.stringify(sessionStorage))
  expect(stored).not.toMatch(/private-(?:file|token)/)
  await page.getByRole('button', { name: 'アカウントを保存' }).click()
  await expect(page.getByRole('status')).toContainText('保存')
  await expect
    .poll(() => page.evaluate(() => JSON.stringify(sessionStorage)))
    .not.toContain('新しい表示名')
})

test('定型文の編集中の下書きと新規作成、振り分けルールの候補を個別に保持する', async ({
  page,
  scene,
}) => {
  const templates = scene.origin + '/extensions/canned'
  await page.goto(templates)
  const existing = page.locator('details').filter({
    has: page.getByLabel('編集：お問い合わせの受付', { exact: true }),
  })
  await existing.locator('summary').click()
  await existing.getByLabel('定型文の本文').fill('過去の定型文を編集中')
  await page.getByLabel('定型文の表示名').last().fill('新しい文面')
  await page.getByLabel('定型文の本文').last().fill('新規に書きました')
  await page.goto(scene.origin + '/extensions/rules')
  const rule = page.locator('form[action="/extensions/rules/add"]').last()
  await rule.getByLabel('件名に含む言葉').fill('請求')
  await choose(rule, '付けるラベル', { label: '領収書' })
  await page.goto(templates)
  await existing.locator('summary').click()
  await expect(existing.getByLabel('定型文の本文')).toHaveValue(
    '過去の定型文を編集中',
  )
  await page.getByRole('button', { name: '定型文を作成' }).click()
  await expect(page.getByLabel('定型文の本文').last()).toBeEmpty()
  await page.goto(scene.origin + '/extensions/rules')
  await expect(
    rule.getByRole('button', { name: '付けるラベル：領収書' }),
  ).toBeVisible()
  await expect(rule.getByLabel('件名に含む言葉')).toHaveValue('請求')
  await rule.getByRole('button', { name: 'ルールを保存' }).click()
  await expect(rule.getByLabel('件名に含む言葉')).toBeEmpty()
})

test('フォームの取り消しは、そのフォームの下書きだけを破棄する', async ({
  page,
  scene,
}) => {
  const path = scene.origin + '/settings/mailboxes'
  await page.goto(path + '?new=yes')
  const add = page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: '窓口を登録' }) })
  const sender = page.locator('form[action="/settings/senders/slide"]')
  await add.getByLabel('プロダクト名').fill('残す窓口')
  await page.goto(path + '?edit=slide')
  await sender.getByLabel('差出人名').fill('取り消す差出人')
  await sender.getByRole('link', { name: '取り消し', exact: true }).click()
  await page.goto(path + '?edit=slide')
  await expect(sender.getByLabel('差出人名')).toHaveValue('Slide')
  await page.goto(path + '?new=yes')
  await expect(add.getByLabel('プロダクト名')).toHaveValue('残す窓口')
})
