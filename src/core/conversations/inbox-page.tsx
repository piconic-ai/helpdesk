import type { Child } from 'hono/jsx'
import type { coreOperations } from '../operations/catalog-usecase'
import type { ConsoleFrame, inboxMetadata } from './console-usecase'
import {
  shell,
  selectedView,
  statuses,
  field,
  select,
  badge,
  stamp,
} from './console-page'

export type Result<K extends keyof typeof coreOperations> = Awaited<
  ReturnType<(typeof coreOperations)[K]['execute']>
>
type Metadata = Awaited<ReturnType<typeof inboxMetadata>>
function avatar(email?: string) {
  const words = email
    ?.split('@')[0]
    ?.split(/[._\s-]+/)
    .filter(Boolean)
  const initials = words
    ?.slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join('')
    .toUpperCase()
  return (
    <span
      className={'avatar' + (email ? '' : ' avatar-unassigned')}
      aria-label={email ? '担当者 ' + email : '担当なし'}
      title={email ?? '担当なし'}
    >
      {initials}
    </span>
  )
}
function conversationRow(
  row: Result<'list'>[number],
  meta: Metadata,
  now: number,
) {
  const m = meta.get(row.number)
  const assignee =
    row.kind === 'inquiry' && row.assignment.kind === 'assigned'
      ? row.assignment.to
      : undefined
  const labels = m?.labels ?? []
  return (
    <li>
      <a
        className={'conversation-row' + (m?.unread ? ' unread' : '')}
        href={'/conversation/' + row.number}
      >
        <span className="row-top">
          <span className="row-sender">{m?.name || row.contact}</span>
          <span className="row-subject">{row.subject}</span>
          {stamp(m?.at ?? row.createdAt, now)}
        </span>
        <span className="row-bottom">
          <code className="row-number">#{row.number}</code>
          <span className="row-preview">{m?.preview}</span>
          {!!m?.failed && <span className="delivery-failed">送信失敗</span>}
          <span className="row-labels">
            {labels.slice(0, 2).map((label) => (
              <span className="label-chip">{label}</span>
            ))}
            {labels.length > 2 && <span>+{labels.length - 2}</span>}
          </span>
          {badge(row.status.kind)}
          {avatar(assignee)}
        </span>
      </a>
    </li>
  )
}
export function inboxPage(
  rows: Result<'list'>,
  failures: Result<'failures'>,
  q: Record<string, string>,
  panels: Child,
  frame: ConsoleFrame,
  meta: Metadata,
) {
  const view = selectedView(q, frame.operator.email)
  const title = statuses[view] ?? '受信箱'
  const isFiltered = !!(q.product || q.assignee || q.label || q.query)
  return shell(
    title,
    <div className="inbox-view">
      <header className="page-header">
        <h1 className="page-title">{title}</h1>
        <span className="view-count">{rows.length} 件</span>
      </header>
      {failures.length > 0 && (
        <section className="banner-error" aria-label="受信エラー">
          <h2>受信に失敗したメール</h2>
          {failures.map((f) => (
            <p>
              <code>{f.mailbox}</code> · {f.reason}
            </p>
          ))}
        </section>
      )}
      <form method="get" className="filters" role="search">
        <label className="search-field">
          <span className="sr-only">問い合わせを検索</span>
          <input
            name="query"
            className="text-input"
            type="search"
            value={q.query ?? ''}
            placeholder="件名・差出人・本文を検索"
          />
        </label>
        <details className="filter-tab" open={isFiltered || undefined}>
          <summary>絞り込み{isFiltered ? '中' : ''}</summary>
          <div className="filter-fields">
            {select('status', '状態', statusesForSelect, q.status ?? 'open')}
            {select(
              'product',
              'プロダクト',
              {
                '': 'すべて',
                ...Object.fromEntries(
                  frame.products.map((p) => [p.id, p.name]),
                ),
              },
              q.product ?? '',
            )}
            {field('assignee', '担当者', q.assignee)}
            {field('label', 'ラベル', q.label)}
          </div>
        </details>
        <button className="button-secondary">検索</button>
      </form>
      <div data-inbox-results="" aria-live="polite">
        <div data-inbox-content="">
          {rows.length > 0 ? (
            <ul className="conversation-list">
              {rows.map((row) => conversationRow(row, meta, frame.now))}
            </ul>
          ) : (
            <p className="empty-state">
              {isFiltered
                ? '条件に一致する問い合わせはありません。'
                : view === 'open'
                  ? '未対応の問い合わせはありません。'
                  : 'この状態の問い合わせはありません。'}
            </p>
          )}
        </div>
        <div data-inbox-loading="" hidden role="status">
          <span className="sr-only">問い合わせを読み込み中です。</span>
          <ul className="conversation-list" aria-hidden="true">
            {Array.from(
              { length: Math.max(1, Math.min(6, rows.length)) },
              () => (
                <li className="conversation-row">
                  <span className="loading-placeholder"></span>
                  <span className="loading-placeholder"></span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
      {panels}
    </div>,
    frame,
  )
}
const { mine: _mine, ...statusesForSelect } = statuses
