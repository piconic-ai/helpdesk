import { choose } from './choice.mjs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { test, expect, capture, confirmSubmission } from './harness.mjs'
import { keyboardFlow } from '../ui/drive.mjs'

test('C 実際に発行したトークンで CLI と MCP を操作する', async ({
  page,
  scene,
}) => {
  await page.getByRole('link', { name: '設定', exact: true }).click()
  await page.getByRole('link', { name: /^全体の設定/ }).click()
  await page.getByRole('link', { name: /^API トークンの管理/ }).click()
  await page.getByLabel('トークン名').fill('受付担当')
  await page
    .getByRole('combobox', { name: '発行する権限', exact: true })
    .selectOption('draft')
  await page.getByRole('button', { name: '発行する' }).click()
  const token = await page.locator('[role=status] code').innerText()
  const result = await promisify(execFile)(
    process.execPath,
    ['cli/helpdesk.mjs', '--json', 'list', '{}'],
    {
      env: {
        ...process.env,
        HELPDESK_URL: scene.origin,
        HELPDESK_TOKEN: token,
      },
    },
  )
  expect(JSON.parse(result.stdout).result.length).toBeGreaterThan(0)
  const client = new Client({ name: 'local-desk', version: '1' })
  try {
    await client.connect(
      new StreamableHTTPClientTransport(new URL('/mcp', scene.origin), {
        requestInit: { headers: { Authorization: 'Bearer ' + token } },
      }),
    )
    const tools = await client.listTools()
    expect(tools.tools.map((t) => t.name)).not.toContain('approve')
    const draft = await client.callTool({
      name: 'reply',
      arguments: { number: 1, body: 'この内容でご案内します。' },
    })
    expect(draft.isError).toBeFalsy()
  } finally {
    await client.close()
  }
  await page.goto(scene.origin + '/conversation/1')
  await expect(
    page.locator('article').filter({ hasText: 'この内容でご案内します。' }),
  ).toContainText('承認待ち')
  await capture(
    page,
    'C-machine',
    '01-draft',
    'CLI の一覧取得と MCP の下書き作成後、運営画面で承認待ちを確認',
  )
})

test('C 375pxでキーボードだけで返信と完了', async ({ page, scene }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await keyboardFlow(page, scene.origin)
  await page.keyboard.press('Tab')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await capture(
    page,
    'C-mobile',
    '01-complete',
    '375px で会話を開き、キーボードだけで返信して完了',
  )
})

test.describe('C 受信メールの拡張処理', () => {
  test.use({ extensions: ['notify', 'rules', 'spam'] })
  test('振り分け、通知、迷惑メール隔離を実際の受信で確認', async ({
    page,
    scene,
  }) => {
    await page.goto(scene.origin + '/extensions/rules')
    await choose(page, 'プロジェクト', { label: 'Slide' })
    await page.getByLabel('件名に含む言葉').fill('請求変更')
    await choose(page, '付けるラベル', { label: '経理' })
    await page
      .getByLabel('担当者', { exact: true })
      .selectOption({ label: '森 直子' })
    await page.getByRole('button', { name: 'ルールを保存' }).click()
    await expect(page.getByRole('status')).toContainText('保存')
    await scene.receive({
      subject: '請求変更をお願いします',
      body: '請求宛先を変更したいです。',
      messageId: '<route@example.net>',
    })
    await expect
      .poll(() => scene.notifications.some((n) => n.text?.includes('請求変更')))
      .toBe(true)
    await page.goto(scene.origin)
    await expect(async () => {
      await page.reload()
      await expect(
        page
          .locator('a.conversation-row')
          .filter({ hasText: '請求変更をお願いします' }),
      ).toContainText('経理', { timeout: 500 })
    }).toPass({ timeout: 10000 })
    await capture(
      page,
      'C-routing',
      '01-assigned',
      '受信ルールで経理ラベルと担当者を割り当て、通知を受信',
    )
    await scene.receive({
      subject: '隔離の確認',
      body: '配信のテストです。',
      messageId: '<isolate@example.net>',
      authentication: 'mx.example.net; dmarc=fail',
    })
    await page.getByRole('link', { name: /迷惑メール/ }).click()
    await expect(page).toHaveURL(/status=spam/)
    await expect(async () => {
      await page.reload()
      await expect(page.getByRole('link', { name: /隔離の確認/ })).toBeVisible({
        timeout: 500,
      })
    }).toPass({ timeout: 12000 })
    await capture(
      page,
      'C-routing',
      '02-spam',
      '認証に失敗したメールが迷惑メール一覧に移動',
    )
  })
})

test('C 設定で有効にした拡張から使い始め方へ進む', async ({ page, scene }) => {
  const installed = [
    'issues',
    'canned',
    'snooze',
    'merge',
    'rules',
    'notify',
    'spam',
  ]
  await page.goto(scene.origin + '/extensions')
  for (const id of installed) {
    const card = page.locator('[data-extension="' + id + '"]')
    await expect(card.getByRole('heading')).toBeVisible()
    const disable = card.getByRole('switch', { name: /を無効にする/ })
    if (await disable.count()) {
      await disable.click()
      await confirmSubmission(page)
    }
    await expect(card.getByRole('link', { name: '設定' })).toHaveCount(0)
    await card.getByRole('switch', { name: /を有効にする/ }).click()
    await expect(page.getByRole('dialog')).toContainText('使用する権限')
    await confirmSubmission(page)
    await card.getByRole('link', { name: '設定' }).click()
    await expect(page.getByRole('main')).toContainText(
      /設定|テストメール|会話|受信箱|保存後に条件に合うメールを受信/,
    )
    await expect(page.locator('aside a[href*="#"]')).toHaveCount(0)
    await page.getByRole('link', { name: '拡張の管理に戻る' }).click()
  }
  await capture(
    page,
    'C-extensions',
    '01-enabled',
    '7つの拡張を有効にし、それぞれの使い始め方と戻り先を確認',
  )
})

test.describe('拡張の設定をプロジェクトごとに開く', () => {
  const extensions = [
    'articles',
    'chat',
    'feedback',
    'form',
    'issues',
    'canned',
  ]
  test.use({ extensions })
  test('設定の入口で選んだプロジェクトだけを編集できる', async ({
    page,
    scene,
  }) => {
    const main = page.getByRole('main')
    for (const id of extensions) {
      await test.step(id, async () => {
        await page.goto(scene.origin + '/extensions/' + id)
        await expect(
          main.getByRole('heading', { name: 'Slide', exact: true }),
        ).toHaveCount(0)
        await expect(
          main.getByRole('heading', { name: 'Desk', exact: true }),
        ).toHaveCount(0)
        await expect(
          main.getByRole('button', { name: '定型文を作成' }),
        ).toHaveCount(0)
        await choose(main, 'プロジェクト', 'slide')
        await main.getByRole('button', { name: '設定を開く' }).click()
        await expect(page).toHaveURL(
          (url) => url.searchParams.get('product') === 'slide',
        )
        if (id === 'canned')
          await expect(
            main.getByRole('button', { name: '定型文を作成' }),
          ).toBeVisible()
        else
          await expect(
            main.getByRole('heading', { name: 'Slide', exact: true }),
          ).toBeVisible()
        await expect(
          main.getByRole('heading', { name: 'Desk', exact: true }),
        ).toHaveCount(0)
        await main
          .getByRole('link', { name: 'プロジェクトの設定に戻る' })
          .click()
        await expect(page).toHaveURL(
          (url) => url.pathname === '/settings/projects/slide',
        )
      })
    }
  })
})
