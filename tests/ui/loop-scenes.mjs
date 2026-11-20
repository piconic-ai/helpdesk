import { expect } from '@playwright/test'
import { fixedTime, operator } from './seed.mjs'

const button = (page, name) => page.getByRole('button', { name, exact: true })

async function popup(page, id) {
  await page
    .locator('[popovertarget="' + id + '"]:visible')
    .first()
    .click()
  await expect(page.locator('[id="' + id + '"]:popover-open')).toBeVisible()
}

async function navigation(page) {
  const opener = page.locator('[data-open-drawer]')
  if (await opener.isVisible()) {
    await opener.click()
    await expect(page.locator('#nav-drawer:modal')).toBeVisible()
  } else {
    await page.locator('#navigation .brand').focus()
  }
}

async function selectRows(page) {
  const rows = page.locator('.inbox-item input[type=checkbox]')
  await rows.nth(0).check()
  await rows.nth(1).check()
  await expect(page.locator('[data-selected-count]')).toContainText('2件')
}

async function confirmation(page, trigger, text) {
  await trigger.click()
  await expect(page.locator('dialog:modal')).toContainText(text)
}

async function openDisclosure(page, label) {
  const summary = page.locator('summary').filter({ hasText: label }).first()
  await summary.click()
  await expect(summary.locator('..')).toHaveAttribute('open', '')
  await summary.scrollIntoViewIfNeeded()
}

async function openContext(page) {
  const toggle = button(page, '関連情報')
  if (await toggle.isVisible()) await toggle.click()
}

async function askChat(page) {
  await page.getByLabel('質問', { exact: true }).fill('領収書を発行したい')
  await button(page, '質問する').click()
}

const inbox = '/'
const thread = '/conversation/1'
const gallery = ['articles', 'issues', 'metrics', 'feedback']
const entries = [
  ['navigation', '運営画面のナビゲーション', inbox, gallery, navigation],
  [
    'account-menu',
    'アカウントの操作を選ぶ',
    inbox,
    [],
    async (page) => {
      await navigation(page)
      await popup(page, 'account-menu')
    },
  ],
  [
    'keyboard',
    'キーボード操作を見る',
    inbox,
    [],
    async (page) => {
      await page.keyboard.press('?')
      await expect(page.locator('#keyboard-help:modal')).toBeVisible()
    },
  ],
  [
    'filters',
    '受信箱の絞り込み条件を開く',
    inbox,
    [],
    (page) => popup(page, 'inbox-filters'),
  ],
  [
    'filter-assignee',
    '絞り込みで担当者を選ぶ',
    inbox,
    [],
    async (page) => {
      await popup(page, 'inbox-filters')
      await popup(page, 'filter-assignee')
    },
  ],
  ['bulk', '複数の問い合わせを選択する', inbox, [], selectRows],
  [
    'bulk-assignee',
    '選択中の問い合わせに担当者を指定する',
    inbox,
    [],
    async (page) => {
      await selectRows(page)
      await popup(page, 'bulk-assignee')
    },
  ],
  [
    'bulk-label',
    '選択中の問い合わせにラベルを指定する',
    inbox,
    [],
    async (page) => {
      await selectRows(page)
      await popup(page, 'bulk-label')
    },
  ],
  [
    'status',
    '会話の状態を選ぶ',
    thread,
    [],
    (page) => popup(page, 'thread-status'),
  ],
  [
    'assignee',
    '会話の担当者を選ぶ',
    thread,
    [],
    (page) => popup(page, 'thread-assignee'),
  ],
  [
    'labels',
    '会話のラベルを選ぶ',
    thread,
    [],
    (page) => popup(page, 'thread-labels'),
  ],
  [
    'actions',
    '会話のその他の操作を開く',
    thread,
    ['snooze'],
    (page) => popup(page, 'thread-actions'),
  ],
  [
    'discard',
    '承認待ちの下書きを破棄する前に確認する',
    '/conversation/5',
    [],
    (page) =>
      confirmation(
        page,
        page.locator('form[action="/actions/discard"] button').first(),
        '下書き1件',
      ),
  ],
  [
    'convert',
    'フィードバックの問い合わせへの変更を確認する',
    '/conversation/10',
    ['feedback'],
    (page) =>
      confirmation(
        page,
        page.locator('form[action="/actions/feedback.convert"] button').first(),
        '問い合わせに変更',
      ),
  ],
  [
    'publish',
    '公開する記事の名前を確かめる',
    '/articles/new',
    ['articles'],
    async (page) => {
      await page.getByLabel('題名').fill('契約を更新する')
      await page.getByLabel('本文').fill('管理画面で契約期間を確認できます。')
      await confirmation(page, button(page, '公開する'), '契約を更新する')
    },
  ],
  [
    'enable',
    '拡張の権限を確認して有効にする',
    '/extensions',
    [],
    (page) =>
      confirmation(
        page,
        page.locator('[data-extension=form]').getByRole('switch'),
        '使用する権限',
      ),
  ],
  [
    'disable',
    '拡張の無効化を確認する',
    '/extensions',
    ['rules'],
    (page) =>
      confirmation(
        page,
        page.locator('[data-extension=rules]').getByRole('switch'),
        '無効にします',
      ),
  ],
  [
    'revoke',
    '発行済みトークンの失効を確認する',
    '/tokens',
    [],
    (page) =>
      confirmation(page, button(page, '運営用CLIを失効させる'), '運営用CLI'),
  ],
  [
    'dates',
    '集計の日付範囲を選ぶ',
    '/metrics?period=custom&start=2026-11-01&end=2026-11-18',
    ['metrics'],
    (page) => popup(page, 'metric-dates'),
  ],
  [
    'metric-definition',
    '集計値の定義を表示する',
    '/metrics',
    ['metrics'],
    async (page) => {
      const control = button(page, '声が改善に届いた割合の定義')
      await control.focus()
      await expect(
        page.getByRole('tooltip').filter({ hasText: '割合' }).first(),
      ).toBeVisible()
    },
  ],
  [
    'public-retry',
    '受付に失敗したフォームを再送する',
    '/help/form/slide',
    ['form'],
    async (page) => {
      await page.getByLabel('件名').fill('配送日の確認')
      await page
        .getByLabel('お問い合わせ内容')
        .fill('予定していた日に商品が届いていません。')
      await page.getByLabel('連絡先メールアドレス').fill('reader@example.net')
      await page.route(
        '**/help/form/slide',
        (route) => {
          const body = new URLSearchParams(route.request().postData())
          body.set('publicKey', 'expired-key')
          return route.continue({ postData: body.toString() })
        },
        { times: 1 },
      )
      await button(page, '送信').click()
      await expect(page.getByRole('alert')).toContainText('もう一度')
    },
  ],
  [
    'label-new',
    '会話から新しいラベルを作る',
    thread,
    [],
    async (page) => {
      await popup(page, 'thread-labels')
      await openDisclosure(page, '新しいラベルを作成')
      await page.getByLabel('新しいラベル名').fill('契約更新')
    },
  ],
  [
    'history',
    '会話の操作履歴を展開する',
    '/conversation/2',
    [],
    async (page) => {
      await openContext(page)
      await openDisclosure(page, '操作履歴')
    },
  ],
  [
    'mailbox-add',
    'このプロダクトに窓口を追加する',
    '/settings/mailboxes?edit=slide',
    [],
    async (page) => {
      await openDisclosure(page, 'このプロダクトに窓口を追加')
      await button(page, '窓口を追加').scrollIntoViewIfNeeded()
    },
  ],
  [
    'operator-edit',
    '運営者の登録内容を編集する',
    '/settings/operators',
    [],
    (page) => openDisclosure(page, '編集'),
  ],
  [
    'canned-edit',
    '定型返信を編集する',
    '/extensions/canned',
    ['canned'],
    (page) => openDisclosure(page, '編集'),
  ],
  [
    'rule-edit',
    '保存した振り分けルールを編集する',
    '/extensions/rules',
    ['rules'],
    (page) => openDisclosure(page, '編集'),
  ],
  [
    'rule-delete',
    '削除する振り分けルールを確認する',
    '/extensions/rules',
    ['rules'],
    async (page) => {
      await openDisclosure(page, '編集')
      await confirmation(
        page,
        page
          .locator('form[action="/extensions/rules/remove"] button:visible')
          .first(),
        '全プロダクト・件名に「領収書」',
      )
    },
  ],
  [
    'merge-confirm',
    '統合先の会話を確かめる',
    thread,
    ['merge'],
    async (page) => {
      await openContext(page)
      const panel = page.locator('[data-extension="merge"]')
      await panel
        .getByRole('button', { name: '会話を統合', exact: true })
        .click()
      await confirmation(
        page,
        panel.locator('form').getByRole('button', { name: '会話を統合' }),
        'ワークスペースの招待メール',
      )
    },
  ],
  [
    'link-confirm',
    'GitHub に投稿するリンクを確認する',
    '/extensions/issues/link/1',
    ['issues'],
    (page) =>
      confirmation(
        page,
        page.locator('form[action="/actions/issues.link"] button').first(),
        'コメントとして投稿',
      ),
  ],
  [
    'chat-solved',
    '記事で解決したことを記録する',
    '/help/chat/slide',
    ['articles', 'chat'],
    async (page) => {
      await askChat(page)
      await button(page, '解決した').click()
      await expect(page.getByRole('status')).toContainText(
        '記事で解決したことを記録しました。',
      )
    },
  ],
  [
    'chat-failed',
    'チャットで送信をやり直す',
    '/help/chat/slide',
    ['articles', 'chat'],
    async (page) => {
      await page.route(
        '**/help/chat/slide',
        (route) => route.fulfill({ status: 503, body: '' }),
        { times: 1 },
      )
      await askChat(page)
      await expect(page.getByRole('alert')).toContainText(
        '送信できませんでした',
      )
    },
  ],
  [
    'help-no-results',
    '製品横断の検索で該当する記事がない',
    '/help/?q=未掲載の振込口座',
    ['articles', 'form'],
    async (page) => {
      await expect(page.getByRole('main')).toContainText(
        '該当する記事はありません。',
      )
    },
  ],
  [
    'reply-preview',
    '相手に届く差出人・件名・本文を確認する',
    thread,
    [],
    async (page) => {
      await page
        .getByRole('textbox', { name: '返信', exact: true })
        .fill('領収書は購入履歴から再発行できます。')
      await button(page, 'プレビュー').click()
      const preview = page.getByRole('region', { name: '返信のプレビュー' })
      await expect(preview).toContainText('購入履歴')
      await preview.scrollIntoViewIfNeeded()
    },
  ],
  [
    'reply-undo',
    '送信直後に取り消せる返信を確認する',
    thread,
    [],
    async (page) => {
      const undo = button(
        page.getByRole('form', { name: '送信予定の通知' }),
        '取り消す',
      )
      if (!(await undo.isVisible())) {
        await page
          .getByRole('textbox', { name: '返信', exact: true })
          .fill('購入履歴から領収書を発行できます。')
        await button(page, '送信して完了').click()
      }
      await expect(undo).toBeVisible()
      await undo.scrollIntoViewIfNeeded()
    },
  ],
  [
    'quick-actions',
    '受信箱の行から直接操作する',
    inbox,
    [],
    async (page) => {
      const row = page.locator('.inbox-item').first()
      await row.locator('a.conversation-row').focus()
      await expect(row.locator('[data-quick="assign"]')).toBeVisible()
    },
  ],
  [
    'filter-empty',
    '条件に一致する問い合わせがない',
    '/?query=未回答の調査番号',
    [],
    async (page) => {
      await expect(page.getByRole('main')).toContainText(
        '条件に一致する問い合わせはありません。',
      )
    },
  ],
  [
    'feedback-undo',
    '確認済みにした意見を元に戻す',
    '/?view=feedback',
    ['feedback'],
    async (page) => {
      const row = page.locator('li[data-number="10"]')
      const undo = button(page, '元に戻す')
      const review = row.getByRole('button', { name: '確認済みにする' })
      if (!(await review.count())) {
        await page.goto(
          new URL(
            '/?view=feedback&notice=feedback.review&changed=10',
            page.url(),
          ).href,
        )
        await undo.click()
      }
      await review.click()
      await expect(undo).toBeVisible()
    },
  ],
]

export const loopScenes = entries.map(
  ([id, label, url, extensions, expose]) => ({
    id: 'loop-' + id,
    group: '操作中の画面',
    label,
    url,
    extensions,
    expose,
  }),
)
export async function exposeLoopScene(page, scene) {
  await scene.expose(page)
}
export async function seedLoopScene(db, scene) {
  if (['loop-rule-edit', 'loop-rule-delete'].includes(scene.id))
    await db
      .prepare('INSERT INTO rules_data(key,value) VALUES(?,?)')
      .bind(
        'rule/new-00000000-0000-4000-8000-000000000150',
        JSON.stringify({ subjectContains: '領収書', label: '請求' }),
      )
      .run()
  if (scene.id === 'loop-revoke')
    await db
      .prepare(
        'INSERT INTO api_tokens(id,digest,owner,label,access,created_at) VALUES(?,?,?,?,?,?)',
      )
      .bind(
        'c890cf13-6347-4879-8750-5729f9306741',
        '0'.repeat(64),
        operator,
        '運営用CLI',
        'read',
        fixedTime,
      )
      .run()
}
