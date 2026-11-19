import { test, expect } from './harness.mjs'

test.use({
  extensions: [
    'feedback',
    'metrics',
    'articles',
    'chat',
    'issues',
    'form',
    'canned',
    'snooze',
    'merge',
    'rules',
    'notify',
    'spam',
    'export',
    'survey',
    'presence',
    'auto-ack',
  ],
})

test('受信箱で承認待ち、相手の文、内部メモ、返信を見分けられる', async ({
  page,
  scene,
}) => {
  const approval = page.getByRole('link', { name: /承認待ち.*1/ })
  await expect(approval).toBeVisible()
  const row = page.locator('[href="/conversation/5"].conversation-row')
  await expect(row).toContainText('承認待ち')
  await expect(row).toContainText('チームが増える予定')
  await expect(row).not.toContainText('ご希望の人数')
  await approval.click()
  await expect(page).toHaveURL(/view=approval/)
  await expect(page.locator('a.conversation-row .row-preview')).toContainText(
    'ご希望の人数',
  )
  await expect(
    page.locator('a.conversation-row .row-preview'),
  ).not.toContainText('チームが増える予定')
  await expect(page.locator('a.conversation-row')).toHaveCount(1)
  await scene.db
    .prepare(
      `INSERT INTO messages(id,number,kind,body,delivery,approval,actor,provider_id,sent_at,created_at)
       SELECT 'followup-5',5,kind,'お手続きの受領を確認しました。',delivery,approval,actor,'followup@example.com',sent_at,created_at
       FROM messages WHERE id='reply-2'`,
    )
    .run()
  await page.goto(scene.origin)
  await expect(row.locator('.row-preview')).toContainText('返信 · お手続き')
  await approval.click()
  await expect(page).toHaveURL(/view=approval/)
  await expect(page.locator('.row-preview')).toContainText('下書き · 更新時に')
  await page.goto(scene.origin + '/?status=pending')
  await expect(
    page
      .locator('a.conversation-row')
      .getByRole('img', { name: '返信', exact: true }),
  ).toBeVisible()
  await scene.db
    .prepare("UPDATE conversations SET status='pending' WHERE number=3")
    .run()
  await page.reload()
  await expect(
    page
      .locator('.inbox-item[data-number="3"] a.conversation-row')
      .getByRole('img', { name: 'メモ', exact: true }),
  ).toBeVisible()
  await page.getByRole('link', { name: /フィードバック.*1/ }).click()
  await expect(page.locator('a.conversation-row')).toHaveCount(1)
  await page.getByText('絞り込み', { exact: true }).click()
  await expect(page.getByLabel('状態', { exact: true })).not.toContainText(
    '未対応',
  )
  await page.goto(scene.origin)
  await page.getByText('絞り込み', { exact: true }).click()
  await expect(page.getByLabel('状態', { exact: true })).not.toContainText(
    '受付済み',
  )
  await expect(
    page.getByRole('button', { name: '担当者 すべて', exact: true }),
  ).toHaveAttribute('popovertarget', 'filter-assignee')
  await page.getByRole('button', { name: 'ラベル：すべて' }).click()
  await expect(
    page.getByRole('button', { name: '請求', exact: true }),
  ).toBeVisible()
})

test('運営画面で識別子、アドレス、機械の単位を入力させない', async ({
  page,
  scene,
}) => {
  const queue = [
    '/',
    '/conversation/1',
    '/conversation/5',
    '/conversation/10',
    '/extensions',
    '/settings',
    '/metrics',
    '/articles',
    '/tokens',
  ]
  const seen = new Set()
  while (queue.length) {
    const path = queue.shift()
    if (seen.has(path)) continue
    seen.add(path)
    await page.goto(scene.origin + path)
    const invalid = await page
      .locator('input:not([type=hidden]), textarea')
      .evaluateAll((fields) =>
        fields.flatMap((field) => {
          const form = field.closest('form')
          if (
            !form ||
            form.getAttribute('action') === '/actions/mailbox' ||
            field.readOnly ||
            field.disabled
          )
            return []
          const label = Array.from(
            field.labels ?? [],
            (l) => l.textContent,
          ).join(' ')
          const key = field.name.toLowerCase()
          const manual = [
            'text',
            'email',
            'url',
            'number',
            'search',
            'textarea',
          ].includes(field.type)
          const machine =
            /^(?:id|product|productid|assignee|labelid|article|articleid|email|contact|from|to|until|issue|number|target|confirmation|operator)$/.test(
              key,
            ) ||
            field.type === 'email' ||
            /Unix|ミリ秒/.test(label)
          if (manual && machine) return [key + ' ' + label]
          return []
        }),
      )
    expect.soft(invalid, path).toEqual([])
    const links = await page
      .locator('main a[href],aside a[href]')
      .evaluateAll((anchors) =>
        anchors.flatMap((a) => {
          const u = new URL(a.href)
          return u.origin === location.origin &&
            !u.hash &&
            /^\/(?:settings|extensions|articles|metrics)(?:\/|$)/.test(
              u.pathname,
            )
            ? [u.pathname + u.search]
            : []
        }),
      )
    queue.push(...links.filter((x) => !seen.has(x)))
  }
})

test('運営と公開の404から、それぞれの画面に戻れる', async ({ page, scene }) => {
  for (const [url, link] of [
    ['/missing-screen', '受信箱に戻る'],
    ['/help/articles/slide/unknown', 'ヘルプに戻る'],
    ['/help/unknown/unknown/path', 'ヘルプに戻る'],
  ]) {
    const res = await page.goto(scene.origin + url)
    expect(res.status()).toBe(404)
    await page.getByRole('link', { name: link }).click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }
})

test('公開ヘルプの戻り先には受付を公開したプロダクトのリンクがある', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/help/')
  await expect(page.getByRole('heading', { name: 'Slide' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Desk' })).toHaveCount(0)
  await page.getByRole('link', { name: 'ヘルプチャット' }).click()
  await expect(page.getByRole('button', { name: '質問する' })).toBeVisible()
})
