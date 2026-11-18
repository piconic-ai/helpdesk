import { operatorAvatar } from '../operators/identity-page'
import type { Child } from 'hono/jsx'
import { BfScripts } from '@barefootjs/hono/scripts'
import type { ConsoleFrame } from './console-usecase'

export const statuses: Record<string, string> = {
  open: '未対応',
  pending: '返信待ち',
  closed: '完了',
  spam: '迷惑メール',
  received: '受付済み',
  reviewed: '確認済み',
  all: 'すべて',
  mine: '自分の担当',
  feedback: 'フィードバック',
  approval: '承認待ち',
}
export const noteLabel = '内部メモ（相手には送られません）'
export function stamp(at: number, now: number) {
  const date = new Date(at)
  const absolute = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
  const minutes = Math.floor((now - at) / 60_000)
  let display = absolute
  if (minutes >= 0 && minutes < 7 * 24 * 60) {
    if (minutes < 1) display = 'たった今'
    else if (minutes < 60) display = minutes + '分前'
    else if (minutes < 1440) display = Math.floor(minutes / 60) + '時間前'
    else display = Math.floor(minutes / 1440) + '日前'
  }
  return (
    <time datetime={date.toISOString()} title={absolute}>
      {display}
    </time>
  )
}
export function badge(value: string) {
  return (
    <span className={'status-badge status-' + value}>
      {statuses[value] ?? value}
    </span>
  )
}
const symbols = {
  open: 'M3 10 5 4h10l2 6v5H3z M3 10h4l1 2h4l1-2h4',
  pending: 'M10 2.5a7.5 7.5 0 1 0 .01 0z M10 6v4l3 2',
  mine: 'M10 3a3 3 0 1 0 .01 0z M4 16v-1a6 5 0 0 1 12 0v1',
  closed: 'M3 10l4 4 10-10',
  spam: 'M10 2l7 3v4c0 4-3 6-7 9-4-3-7-5-7-9V5z M10 6v4 M10 13v.2',
  extensions: 'M3 3h5v5H3z M12 3h5v5h-5z M3 12h5v5H3z M12 12h5v5h-5z',
  settings: 'M3 5h14 M3 10h14 M3 15h14 M7 3v4 M13 8v4 M8 13v4',
  feedback: 'M3 3h14v10H9l-5 4v-4H3z',
  approval: 'M5 2h10v3l-4 5 4 5v3H5v-3l4-5-4-5z',
  tokens: 'M11 8a4 4 0 1 1 3 3L7 18H3v-4z',
  menu: 'M3 5h14 M3 10h14 M3 15h14',
  close: 'M4 4l12 12 M16 4 4 16',
  brand: 'M3 5h14v10H3z M3 6l7 5 7-5',
}
export function glyph(name: keyof typeof symbols) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      <path d={symbols[name]} />
    </svg>
  )
}
export function inboxUrl(query: Record<string, string>) {
  const params = new URLSearchParams(Object.entries(query).filter(([, v]) => v))
  return params.size ? '/?' + params : '/'
}
function navItem(
  href: string,
  name: string,
  icon: keyof typeof symbols,
  active: boolean,
  count?: number,
) {
  return (
    <a
      className={'sidebar-item' + (active ? ' sidebar-item-active' : '')}
      aria-current={active ? 'page' : undefined}
      href={href}
    >
      {glyph(icon)}
      <span>{name}</span>
      {count !== undefined && <span className="sidebar-count">{count}</span>}
    </a>
  )
}
export function selectedView(q: Record<string, string>, email: string) {
  if (q.view === 'feedback' || q.view === 'approval') return q.view
  return q.assignee === email ? 'mine' : q.status || 'open'
}
function extensionMenu(frame: ConsoleFrame) {
  const routes = [
    { id: 'articles', path: '/articles', label: 'ヘルプ記事' },
    { id: 'metrics', path: '/metrics', label: '対応状況の集計' },
  ].filter((route) => frame.extensions.some((ext) => ext.id === route.id))
  if (!routes.length) return null
  return (
    <nav className="sidebar-extensions" aria-label="有効な拡張">
      <h2>拡張</h2>
      {routes.map((route) =>
        navItem(
          route.path,
          route.label,
          'extensions',
          frame.path === route.path,
        ),
      )}
    </nav>
  )
}
function navigation(frame: ConsoleFrame) {
  const active =
    frame.path === '/' ? selectedView(frame.query, frame.operator.email) : ''
  const product = frame.query.product ?? ''
  const person = frame.operators.find((o) => o.email === frame.operator.email)
  return (
    <>
      <div className="sidebar-heading">
        <a href="/" className="brand">
          {glyph('brand')}
          <span>Helpdesk</span>
        </a>
        <button
          type="button"
          className="button-quiet drawer-close"
          data-close-drawer=""
          aria-label="メニューを閉じる"
          title="メニューを閉じる"
        >
          {glyph('close')}
        </button>
      </div>
      <details className="product-switcher">
        <summary>
          {frame.products.find((p) => p.id === product)?.name ??
            'すべてのプロダクト'}
        </summary>
        <div>
          <a href={inboxUrl({ ...frame.query, page: '', product: '' })}>
            すべてのプロダクト
          </a>
          {frame.products.map((p) => (
            <a href={inboxUrl({ ...frame.query, page: '', product: p.id })}>
              {p.name}
            </a>
          ))}
        </div>
      </details>
      <nav className="sidebar-views" aria-label="受信箱">
        <h2>受信箱</h2>
        {(['open', 'pending', 'mine', 'closed', 'spam'] as const).map((key) => {
          const params =
            key === 'mine'
              ? { status: 'all', assignee: frame.operator.email, product }
              : { status: key, assignee: '', product }
          return navItem(
            inboxUrl(params),
            statuses[key],
            key,
            active === key,
            frame.counts[key],
          )
        })}
        {navItem(
          inboxUrl({ view: 'approval', product }),
          '承認待ち',
          'approval',
          active === 'approval',
          frame.counts.approval,
        )}
        {frame.extensions.some((ext) => ext.id === 'feedback') &&
          navItem(
            inboxUrl({ view: 'feedback', product }),
            'フィードバック',
            'feedback',
            active === 'feedback',
            frame.counts.received,
          )}
      </nav>
      {extensionMenu(frame)}
      <nav className="sidebar-footer" aria-label="管理">
        {frame.operator.role === 'admin' &&
          navItem(
            '/extensions',
            '拡張の管理',
            'extensions',
            frame.path === '/extensions',
          )}
        {frame.operator.role === 'admin' &&
          navItem('/settings', '設定', 'settings', frame.path === '/settings')}
        <button type="button" className="button-quiet" data-keyboard-help="">
          キーボード操作 <kbd>?</kbd>
        </button>
        {navItem('/tokens', 'API トークン', 'tokens', frame.path === '/tokens')}
        <a
          className="sidebar-item sidebar-account"
          href="/account"
          aria-current={frame.path === '/account' ? 'page' : undefined}
          title="アカウント"
        >
          <span aria-hidden="true">
            {operatorAvatar(person, frame.operator.email)}
          </span>
          <span>
            {person?.displayName}
            <span className="sr-only"> のアカウント</span>
          </span>
        </a>
      </nav>
    </>
  )
}
export function shell(title: string, content: Child, frame?: ConsoleFrame) {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <title>{title} · Helpdesk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/styles.css" />
        <script defer src="/ui/console.js"></script>
        <script defer src="/ui/inbox.js"></script>
        {frame?.path === '/' && <link rel="stylesheet" href="/ui/inbox.css" />}
        <script defer src="/ui/workflows.js"></script>
      </head>
      <body className="app-shell" data-operator={frame?.operator.email}>
        <script src="/ui/form-drafts.js"></script>
        <a href="#main" className="skip-link">
          本文へ移動
        </a>
        <header className="mobile-header">
          <button
            type="button"
            className="button-quiet"
            data-open-drawer=""
            aria-expanded="false"
            aria-controls="navigation"
            aria-label="メニューを開く"
            title="メニューを開く"
          >
            {glyph('menu')}
          </button>
          <a className="brand" href="/">
            Helpdesk
          </a>
        </header>
        <dialog id="nav-drawer" aria-label="ナビゲーション" />
        <aside className="app-sidebar" id="navigation">
          {frame ? (
            navigation(frame)
          ) : (
            <a className="brand" href="/">
              Helpdesk
            </a>
          )}
        </aside>
        <main id="main" className="main-column" tabindex={-1}>
          {content}
        </main>
        <dialog
          className="confirm-dialog"
          id="action-confirmation"
          aria-labelledby="action-title"
        >
          <h2 id="action-title">操作を確認</h2>
          <p className="confirmation-detail"></p>
          <div className="page-actions">
            <button data-close-modal="" autofocus>
              キャンセル
            </button>
            <button data-commit="" className="button-secondary">
              実行する
            </button>
          </div>
        </dialog>
        <dialog
          className="confirm-dialog"
          id="keyboard-help"
          aria-labelledby="shortcut-title"
        >
          <h2 id="shortcut-title">キーボード操作</h2>
          <dl>
            <dt>受信箱</dt>
            <dd>
              j / k で次・前の行へ、Enter で開く、e で完了、a で自分が担当
            </dd>
            <dt>会話</dt>
            <dd>
              r で返信、n で内部メモ、Cmd / Ctrl + Enter で送信、u で一覧へ
            </dd>
            <dt>共通</dt>
            <dd>? でこの一覧、Esc で閉じる</dd>
          </dl>
          <button data-close-modal="" autofocus>
            閉じる
          </button>
        </dialog>
        <BfScripts />
      </body>
    </html>
  )
}
export function field(
  name: string,
  title: string,
  value = '',
  type = 'text',
  required = false,
) {
  return (
    <label className="field">
      <span>{title}</span>
      <input
        className="text-input"
        type={type}
        name={name}
        value={value}
        required={required}
      />
    </label>
  )
}
export function select(
  name: string,
  title: string,
  choices: Record<string, string>,
  value: string,
) {
  return (
    <label className="field">
      <span>{title}</span>
      <select className="text-input" name={name} aria-label={title}>
        {Object.entries(choices).map(([key, label]) => (
          <option value={key} selected={key === value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
export function action(
  name: string,
  label: string,
  children: Child,
  number?: number,
  variant = 'secondary',
) {
  return (
    <form action={'/actions/' + name} method="post">
      {number !== undefined && (
        <input type="hidden" name="number" value={number} />
      )}
      {children}
      <button className={'button-' + variant}>{label}</button>
    </form>
  )
}
export function operatorErrorPage(
  status: 400 | 403 | 404 | 409,
  frame?: ConsoleFrame,
) {
  const copy = {
    400: [
      '入力内容を確認してください',
      '入力し直して、もう一度お試しください。',
    ],
    403: [
      'この画面を操作する権限がありません',
      '管理者に権限を確認してください。',
    ],
    404: ['対象が見つかりません', '受信箱から問い合わせを選び直してください。'],
    409: [
      '操作を完了できませんでした',
      '現在の状態を確認してから、もう一度お試しください。',
    ],
  }
  const [title, detail] = copy[status]
  return shell(
    title,
    <div className="settings-view">
      <header className="page-header">
        <h1 className="page-title">{title}</h1>
      </header>
      <p className="banner-error" role="alert">
        {detail}
      </p>
      <a className="button-secondary" href="/">
        受信箱に戻る
      </a>
    </div>,
    frame,
  )
}
