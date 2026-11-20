const pages = [
  [
    'issue-preview',
    'GitHub に送る内容の確認',
    '/conversation/1',
    ['issues'],
    'issue-preview',
  ],
  [
    'operation-result',
    '拡張操作の結果と戻り先',
    '/metrics',
    ['metrics'],
    'operation-result',
  ],
  ['feedback-list', 'フィードバックの一覧', '/?view=feedback', ['feedback']],
  ['approval-list', '承認待ちの一覧', '/?view=approval'],
  ['my-inbox', '自分の担当', '/?status=all&assignee=sato%40example.com'],
  ['all-inbox', 'すべての会話', '/?status=all'],
  ['deletion', 'データ管理', '/settings/projects/slide/deletion'],
  [
    'article-preview',
    '記事のプレビュー',
    '/articles/edit?product=slide&id=receipt',
    ['articles'],
    'article-preview',
  ],
  [
    'help-results',
    'プロジェクト横断の検索結果',
    '/help/?q=領収書',
    ['articles', 'form'],
  ],
  [
    'public-query',
    '記事の検索結果',
    '/help/articles/slide/?q=領収書',
    ['articles'],
  ],
]
export const compositionScreens = pages.map(
  ([id, label, url, extensions, action]) => ({
    id,
    label,
    url,
    extensions,
    action,
    group: '画面の型',
  }),
)
