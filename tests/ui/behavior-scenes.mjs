import { expect } from '@playwright/test'
import { openReplyControls } from './drive.mjs'

const cases = [
  ['product-add', '窓口を登録', '/settings/mailboxes?new=yes'],
  [
    'label-add',
    'ラベルを追加',
    '/settings/labels',
    (p) => p.getByRole('button', { name: 'ラベルを追加' }).click(),
  ],
  [
    'label-swatches',
    'ラベルの色を選ぶ',
    '/settings/labels',
    (p) => p.getByRole('button', { name: '経理の色を変更' }).click(),
  ],
  [
    'label-rename',
    'ラベル名を編集',
    '/settings/labels',
    (p) =>
      p.getByRole('button', { name: '経理の名前を変更', exact: true }).click(),
  ],
  [
    'label-merge',
    'ラベルをまとめる確認',
    '/settings/labels',
    async (p) => {
      await p.getByRole('button', { name: '操作：経理', exact: true }).click()
      await p
        .getByRole('combobox', { name: 'まとめる先' })
        .selectOption({ label: '請求' })
      await p.getByRole('button', { name: '別のラベルにまとめる' }).click()
      await expect(p.getByRole('dialog')).toBeVisible()
    },
  ],
  [
    'label-delete',
    'ラベルを削除する確認',
    '/settings/labels',
    async (p) => {
      await p.getByRole('button', { name: '操作：経理', exact: true }).click()
      await p.getByRole('button', { name: '削除', exact: true }).click()
      await expect(p.getByRole('dialog')).toBeVisible()
    },
  ],
  ['issue-demo', '改善につなげるデモの課題一覧', '/issues'],
  ['issue-demo-open', '模擬の課題を閉じる操作', '/issues/example/helpdesk/42'],
  [
    'issue-demo-all-sent',
    '全員に知らせた課題の修正前後',
    '/issues/example/helpdesk/44',
  ],
  [
    'sort-menu',
    '受信箱の並び順を選ぶ',
    '/',
    (p) => p.getByRole('button', { name: /^並び順：/ }).click(),
  ],
  ['confirmed-notice', '会話の保存結果', '/conversation/1?notice=note'],
  [
    'reply-controls-open',
    '返信欄の操作を開く',
    '/conversation/7',
    async (page) => {
      await openReplyControls(page)
      await expect(
        page.getByRole('button', { name: /^関連しそうな課題：/ }),
      ).toBeVisible()
    },
  ],
]
// Create the success state through its real command so the timeline and notice agree.
export async function saveExampleNote(page, origin) {
  const response = await page.request.post(origin + '/actions/note', {
    form: { number: '1', body: '経理担当が領収書の発行手順を確認中です。' },
    headers: { Origin: origin },
  })
  expect(response.ok()).toBeTruthy()
}
export const behaviorScenes = cases.map(([name, label, url, expose]) => ({
  id: 'behavior-' + name,
  label,
  url,
  expose,
  group: '操作の振る舞い',
  demo: true,
}))
