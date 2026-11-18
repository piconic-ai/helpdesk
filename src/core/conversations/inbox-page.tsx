import type { coreOperations } from '../operations/catalog-usecase'
import type { ConsoleFrame, inboxMetadata } from './console-usecase'
import {
  shell,
  selectedView,
  statuses,
  select,
  badge,
  stamp,
} from './console-page'

export type Result<K extends keyof typeof coreOperations> = Awaited<
  ReturnType<(typeof coreOperations)[K]['execute']>
>
type Metadata = Awaited<ReturnType<typeof inboxMetadata>>
function avatar(name?: string) {
  const words = name
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
      role="img"
      className={'avatar' + (name ? '' : ' avatar-unassigned')}
      aria-label={name ? '担当者 ' + name : '担当なし'}
      title={name ?? '担当なし'}
    >
      {initials}
    </span>
  )
}
function previewPrefix(kind: string | null, delivery: string | null) {
  if (kind === 'note') return 'メモ: '
  if (kind === 'outbound')
    return delivery === 'awaiting_approval' || delivery === 'draft'
      ? '下書き: '
      : '返信: '
  return '受信: '
}
function conversationRow(
  row: Result<'list'>[number],
  meta: Metadata,
  frame: ConsoleFrame,
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
          {stamp(m?.at ?? row.createdAt, frame.now)}
        </span>
        <span className="row-bottom">
          <code className="row-number">#{row.number}</code>
          <span className="row-preview">
            {' '}
            {m && m.preview && previewPrefix(m.previewKind, m.previewDelivery)}
            {m?.preview}
          </span>
          {frame.approvalNumbers.has(row.number) && (
            <span className="delivery-awaiting-approval">承認待ち</span>
          )}
          {!!m?.failed && <span className="delivery-failed">送信失敗</span>}
          <span className="row-labels">
            {labels.slice(0, 2).map((label) => (
              <span className="label-chip">{label}</span>
            ))}
            {labels.length > 2 && <span>+{labels.length - 2}</span>}
          </span>
          {badge(row.status.kind)}
          {avatar(
            frame.operators.find((op) => op.email === assignee)?.displayName ??
              assignee,
          )}
        </span>
      </a>
    </li>
  )
}
function filters(
  q: Record<string, string>,
  frame: ConsoleFrame,
  isFiltered: boolean,
) {
  return (
    <form method="get" className="filters" role="search">
      {q.view && <input type="hidden" name="view" value={q.view} />}
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
          {q.view !== 'approval' &&
            select(
              'status',
              '状態',
              q.view === 'feedback' ? feedbackStatuses : inquiryStatuses,
              q.status ?? (q.view === 'feedback' ? 'received' : 'open'),
            )}
          {select(
            'product',
            'プロダクト',
            {
              '': 'すべて',
              ...Object.fromEntries(frame.products.map((p) => [p.id, p.name])),
            },
            q.product ?? '',
          )}
          {q.view !== 'feedback' &&
            select(
              'assignee',
              '担当者',
              {
                '': 'すべて',
                ...Object.fromEntries(
                  frame.operators.map((o) => [o.email, o.displayName]),
                ),
              },
              q.assignee ?? '',
            )}
          {select(
            'label',
            'ラベル',
            {
              '': 'すべて',
              ...Object.fromEntries(
                frame.labels.map((label) => [label, label]),
              ),
            },
            q.label ?? '',
          )}
        </div>
      </details>
      <button className="button-secondary">検索</button>
    </form>
  )
}
export function inboxPage(
  rows: Result<'list'>,
  failures: Result<'failures'>,
  q: Record<string, string>,

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
      {filters(q, frame, isFiltered)}
      <div data-inbox-results="" aria-live="polite">
        <div data-inbox-content="">
          {rows.length > 0 ? (
            <ul className="conversation-list">
              {rows.map((row) => conversationRow(row, meta, frame))}
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
    </div>,
    frame,
  )
}
const inquiryStatuses = {
  open: statuses.open,
  pending: statuses.pending,
  closed: statuses.closed,
  spam: statuses.spam,
  all: statuses.all,
}
const feedbackStatuses = {
  received: statuses.received,
  reviewed: statuses.reviewed,
  spam: statuses.spam,
  all: statuses.all,
}
