import { surveyId } from './seed.mjs'

const inbox = '未対応の問い合わせを件名・相手・状態で見分けられます。'
const thread = 'メッセージの種類と送信状態を本文のすぐそばに示します。'
const composer =
  '差出人と宛先を確認しながら、返信と内部メモを切り替えられます。'
const settings =
  '関連する設定をひとまとまりにし、各入力欄に名前を付けています。'
const support = 'お客様の画面は本文と次の操作に絞っています。'
const ids = [
  'spam',
  'notify',
  'auto-ack',
  'metrics',
  'feedback',
  'articles',
  'chat',
  'survey',
  'export',
  'snooze',
  'merge',
  'rules',
  'presence',
  'form',
  'canned',
  'issues',
]
const panel = (name, slot, title) => ({
  name,
  url:
    slot === 'settings'
      ? '/settings'
      : slot === 'list'
        ? '/'
        : '/conversation/1',
  before: 'section',
  beforeHeading: title,
  after: '[data-extension="' + name + '"]',
})
const admin = (name) => ({
  name,
  url: '/extensions',
  before: 'section',
  beforeHeading: name,
  after: '[data-extension="' + name + '"]',
})
const extensionScreens = [
  {
    ...admin('spam'),
    label: '迷惑メールの隔離',
    url: '/?status=spam',
    before: null,
    after: null,
  },
  { ...admin('notify'), label: '通知' },
  { ...admin('auto-ack'), label: '自動受付返信' },
  {
    ...panel('metrics', 'list', 'Resolution metrics'),
    beforeUrl: '/',
    url: '/metrics',
    after: null,
    label: '解決までの指標',
  },
  {
    ...panel('feedback', 'conversation', 'Feedback'),
    url: '/conversation/10',
    after: '.thread-toolbar form[action="/actions/feedback.review"]',
    label: 'フィードバックの確認',
  },
  {
    ...panel('articles', 'settings', 'Help articles'),
    beforeUrl: '/settings',
    url: '/articles',
    after: null,
    label: '記事の管理',
  },
  {
    name: 'chat',
    url: '/help/chat/slide',
    label: 'ヘルプチャット',
    beforeMissing: true,
  },
  {
    name: 'survey',
    url: '/help/survey/slide/' + surveyId,
    label: '解決アンケート',
  },
  {
    ...panel('export', 'settings', 'Export'),
    beforeUrl: '/settings',
    url: '/extensions/export',
    label: 'データの書き出し',
  },
  { ...panel('snooze', 'conversation', 'Snooze'), label: 'スヌーズ' },
  {
    ...panel('merge', 'conversation', 'Merge conversations'),
    label: '会話の統合',
  },
  { ...admin('rules'), label: '振り分けルール' },
  {
    ...panel('presence', 'conversation', 'Other operators here'),
    label: 'ほかの運営者の閲覧',
  },
  {
    name: 'form',
    url: '/help/form/slide',
    label: '問い合わせフォーム',
    beforeMissing: true,
  },
  { ...panel('canned', 'conversation', 'Saved replies'), label: '定型返信' },
  {
    ...panel('issues', 'conversation', 'GitHub issues'),
    label: 'GitHub issue',
  },
].map((item) => ({
  ...item,
  id: 'extension-' + item.name,
  group: '拡張',
  extensions: item.name === 'chat' ? ['chat', 'articles'] : [item.name],
  change: item.beforeMissing
    ? '公開入力画面を追加しました。旧版にはこのページがなく、同じ URL の応答を載せています。'
    : item.url === '/extensions'
      ? '単独の操作画面を持たない拡張は、管理画面で有効状態と権限を確認します。'
      : '有効な拡張の操作や表示を、その拡張を利用する画面で確認できます。',
}))
function screen(group, id, label, url, change, options = {}) {
  return { group, id, label, url, change, ...options }
}
export const screens = [
  screen('一覧', 'inbox', '未対応が複数ある受信箱', '/', inbox, {
    mobile: true,
    tablet: true,
  }),
  screen(
    '一覧',
    'inbox-empty',
    '空の受信箱',
    '/',
    '未対応の問い合わせがないことを一文で示します。',
    { emptyInbox: true },
  ),
  screen(
    '一覧',
    'inbox-filter',
    '絞り込み中',
    '/?product=desk&assignee=sato%40example.com',
    inbox,
  ),
  screen(
    '一覧',
    'inbox-failed',
    '送信失敗を含む受信箱',
    '/?label=請求',
    '失敗した会話の行に「送信失敗」を表示します。',
  ),
  screen(
    '一覧',
    'inbox-loading',
    '検索結果の読み込み中',
    '/',
    '検索結果の応答を待つ間、一覧に読み込み表示を出します。',
    { action: 'loading' },
  ),
  ...[
    [1, 'inbound', '受信のみ'],
    [2, 'replied', '返信済み'],
    [3, 'note', '内部メモあり'],
    [4, 'failed', '送信失敗'],
    [5, 'approval', '承認待ち'],
    [6, 'html', 'HTML メール'],
    [7, 'attachment', '添付あり'],
  ].map(([n, id, label]) =>
    screen('会話', 'thread-' + id, label, '/conversation/' + n, thread, {
      action: n === 5 ? 'approval-ready' : undefined,
      mobile: n === 1,
      tablet: n === 1,
    }),
  ),
  ...[
    ['empty', '空'],
    ['typing', '入力中'],
    ['note', '内部メモへの切り替え'],
    ['sending', '送信中'],
    ['failed', '送信失敗'],
  ].map(([mode, label]) =>
    screen('返信欄', 'composer-' + mode, label, '/conversation/1', composer, {
      action: 'compose-' + mode,
      mobile: mode === 'note',
    }),
  ),
  screen(
    '設定',
    'mailboxes',
    'プロジェクトと窓口',
    '/settings/mailboxes',
    settings,
    {
      beforeUrl: '/settings',
      before: 'section',
      beforeHeading: 'Mailboxes',
      after: 'main nav[aria-label="プロジェクトと窓口"]',
    },
  ),
  screen('設定', 'operators', '運営者', '/settings/operators', settings, {
    beforeUrl: '/settings',
    before: 'section',
    beforeHeading: 'Operators',
    after: null,
  }),
  screen(
    '設定',
    'extensions',
    '拡張の一覧',
    '/extensions',
    '拡張ごとに有効状態・権限・切替操作をまとめています。',
    { extensions: ids },
  ),
  screen(
    '設定',
    'invalid',
    '入力エラー',
    '/settings/mailboxes?new=yes',
    '入力した内容を保持し、修正方法を欄の近くに表示します。',
    { action: 'invalid', beforeUrl: '/settings' },
  ),
  screen(
    '設定',
    'forget',
    '削除の確認',
    '/settings/projects/slide/deletion',
    '確認ダイアログに削除対象を表示します。旧版は確認前の削除フォームを載せています。',
    { action: 'forget', beforeUrl: '/settings' },
  ),
  ...extensionScreens,
  screen(
    '公開',
    'article',
    'ヘルプ記事',
    '/help/articles/slide/receipt',
    support,
    { mobile: true, extensions: ['articles', 'form'] },
  ),
  ...[
    ['feedback', 'input', 'フィードバックの入力'],
    ['feedback', 'receipt', 'フィードバックの完了'],
    ['chat', 'input', 'ヘルプチャットの入力'],
    ['chat', 'articles', '関連記事の提示'],
    ['chat', 'receipt', '問い合わせの受付'],
  ].map(([type, mode, label]) =>
    screen(
      '公開',
      type + '-' + mode,
      label,
      '/help/' + type + '/slide',
      mode === 'input'
        ? '受付 API に対応する公開フォームを追加しました。旧版の同じ URL は 404 です。'
        : '同じ受付結果を日本語の画面に表示します。旧版は受付 API の JSON 応答です。',
      {
        action: type + '-' + mode,
        extensions: type === 'chat' ? ['articles', 'chat'] : [type],
        mobile: true,
        beforeMissing: mode === 'input',
      },
    ),
  ),
  screen(
    '関連画面',
    'tokens',
    'API トークン',
    '/tokens',
    '発行と失効に使うフォームを設定と同じ部品で表示します。',
  ),
  screen(
    '関連画面',
    'article-index',
    '記事の一覧・検索',
    '/help/articles/slide/',
    '記事検索と一覧をプロジェクト別に表示します。',
    { extensions: ['articles', 'form'] },
  ),
  screen(
    '関連画面',
    'article-vote',
    '記事への回答',
    '/help/articles/slide/receipt',
    '回答後に確認文を表示します。',
    { action: 'vote', extensions: ['articles'] },
  ),
  screen(
    '関連画面',
    'survey-thanks',
    'アンケートへの回答',
    '/help/survey/slide/' + surveyId,
    '回答が記録されたことを確認できます。',
    { action: 'survey', extensions: ['survey'] },
  ),
  screen(
    '関連画面',
    'result',
    '拡張の操作結果',
    '/metrics',
    '結果と会話・受信箱への戻り先を示します。',
    { action: 'result', beforeUrl: '/', extensions: ['metrics'] },
  ),
]
