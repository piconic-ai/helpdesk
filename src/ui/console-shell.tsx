import { operatorAvatar } from './operator-identity'
import type { Child } from 'hono/jsx'
import { BfScripts } from '@barefootjs/hono/scripts'
import type { ConsoleFrame } from '../core/conversations/console-usecase'

import { Button, ActionMenu, Dialog, Popover } from './controls'
export const statuses: Record<string, string> = {
  search: '検索結果',
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
  articles: 'M3 3h6l1 1 1-1h6v12h-6l-1 1-1-1H3z M10 4v12',
  metrics: 'M3 3v14h14 M6 13v-3 M10 13V7 M14 13V4',
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
  if (q.query) return 'search'
  return q.assignee === email ? 'mine' : q.status || 'open'
}
function extensionMenu(frame: ConsoleFrame) {
  const routes = [
    { id: 'articles' as const, path: '/articles', label: 'ヘルプ記事' },
    { id: 'metrics' as const, path: '/metrics', label: '対応状況の集計' },
  ].filter((route) => frame.extensions.some((ext) => ext.id === route.id))
  if (!routes.length) return null
  return (
    <nav className="sidebar-extensions" aria-label="有効な拡張">
      <h2>拡張</h2>
      {routes.map((route) =>
        navItem(route.path, route.label, route.id, frame.path === route.path),
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
        <Button
          type="button"
          variant="ghost"
          className="drawer-close"
          data-close-drawer=""
          aria-label="メニューを閉じる"
          title="メニューを閉じる"
        >
          {glyph('close')}
        </Button>
      </div>
      <div className="product-menu">
        <Popover
          id="product-switcher"
          label={
            frame.products.find((p) => p.id === product)?.name ??
            'すべてのプロダクト'
          }
        >
          <a href={inboxUrl({ ...frame.query, page: '', product: '' })}>
            すべてのプロダクト
          </a>
          {frame.products.map((p) => (
            <a href={inboxUrl({ ...frame.query, page: '', product: p.id })}>
              {p.name}
            </a>
          ))}
        </Popover>
      </div>
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
        <div className="account-navigation">
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
          <ActionMenu
            id="account-menu"
            label={
              <>
                <span aria-hidden="true">⋯</span>
                <span className="sr-only">アカウントの操作</span>
              </>
            }
          >
            <Button type="button" variant="ghost" data-keyboard-help="">
              キーボード操作 <kbd>?</kbd>
            </Button>
          </ActionMenu>
        </div>
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
        <script type="module" src="/ui/barefoot-overlays.js"></script>
        <script defer src="/ui/console.js"></script>
        <script defer src="/ui/inbox.js"></script>
        <script defer src="/ui/live-filters.js"></script>
        <link rel="stylesheet" href="/ui/inbox.css" />
        <link rel="stylesheet" href="/ui/patterns.css" />
        <script defer src="/ui/workflows.js"></script>
      </head>
      <body className="app-shell" data-operator={frame?.operator.email}>
        <script src="/ui/form-drafts.js"></script>
        <a href="#main" className="skip-link">
          本文へ移動
        </a>
        <header className="mobile-header">
          <Button
            type="button"
            variant="ghost"
            data-open-drawer=""
            aria-expanded="false"
            aria-controls="navigation"
            aria-label="メニューを開く"
            title="メニューを開く"
          >
            {glyph('menu')}
          </Button>
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
        <Dialog
          id="action-confirmation"
          title="操作を確認"
          description={<span />}
        >
          <Button data-close-modal="" autofocus>
            キャンセル
          </Button>
          <Button data-commit="">実行する</Button>
        </Dialog>
        <Dialog id="keyboard-help" title="キーボード操作">
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
          <Button data-close-modal="" autofocus>
            閉じる
          </Button>
        </Dialog>
        <BfScripts />
      </body>
    </html>
  )
}
