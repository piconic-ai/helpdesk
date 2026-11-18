import type { coreOperations } from '../operations/catalog-usecase'
import type { ConsoleFrame, inboxMetadata } from './console-usecase'
import { shell, selectedView, statuses, select, inboxUrl } from './console-page'

import { conversationRow } from './inbox-row-page'
import { operatorAvatar } from '../operators/identity-page'
export type Result<K extends keyof typeof coreOperations> = Awaited<
  ReturnType<(typeof coreOperations)[K]['execute']>
>
type Metadata = Awaited<ReturnType<typeof inboxMetadata>>
function filters(
  q: Record<string, string>,
  frame: ConsoleFrame,
  isFiltered: boolean,
) {
  return (
    <form method="get" className="filters" role="search">
      {q.sort && <input type="hidden" name="sort" value={q.sort} />}
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
          {q.view !== 'feedback' && (
            <div className="field">
              <span id="filter-assignee-label">担当者</span>
              <input type="hidden" name="assignee" value={q.assignee ?? ''} />
              <button
                type="button"
                popovertarget="filter-assignee"
                className="button-secondary"
                id="filter-assignee-value"
                aria-labelledby="filter-assignee-label filter-assignee-value"
                data-filter-name=""
              >
                {frame.operators.find((o) => o.email === q.assignee)
                  ?.displayName ?? 'すべて'}
              </button>
              <div
                popover="auto"
                id="filter-assignee"
                className="inbox-popover"
              >
                <button
                  type="button"
                  data-filter-assignee=""
                  className="button-quiet"
                >
                  すべて
                </button>
                {frame.operators.map((o) => (
                  <button
                    type="button"
                    data-filter-assignee={o.email}
                    data-label={o.displayName}
                    className="button-quiet"
                  >
                    {operatorAvatar(o)}
                    <span>{o.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
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
  page: { page: number; pages: number; total: number },
) {
  const view = selectedView(q, frame.operator.email)
  const title = statuses[view] ?? '受信箱'
  const isFiltered = !!(q.product || q.assignee || q.label || q.query)
  return shell(
    title,
    <div className="inbox-view">
      <header className="page-header">
        <h1 className="page-title">{title}</h1>
        <span className="view-count">{page.total} 件</span>
        <label className="inbox-sort">
          <span className="sr-only">並び順</span>
          <select className="text-input" name="sort" data-sort="">
            <option value="waiting" selected={q.sort !== 'newest'}>
              待たせている順
            </option>
            <option value="newest" selected={q.sort === 'newest'}>
              新しい順
            </option>
          </select>
        </label>
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
            <>
              {bulkBar(frame, view)}
              <ul className="conversation-list">
                {rows.map((row) => conversationRow(row, meta, frame))}
              </ul>
              {page.pages > 1 && (
                <nav className="inbox-pagination" aria-label="ページ送り">
                  {page.page > 1 && (
                    <a
                      className="button-secondary"
                      href={inboxUrl({ ...q, page: String(page.page - 1) })}
                    >
                      前のページ
                    </a>
                  )}
                  <span>
                    {page.page} / {page.pages} ページ
                  </span>
                  {page.page < page.pages && (
                    <a
                      className="button-secondary"
                      href={inboxUrl({ ...q, page: String(page.page + 1) })}
                    >
                      次のページ
                    </a>
                  )}
                </nav>
              )}
            </>
          ) : (
            <p className="empty-state">
              {isFiltered &&
              !(view === 'mine' && !q.product && !q.query && !q.label)
                ? '条件に一致する問い合わせはありません。'
                : (emptyView[view] ?? '受け付けた問い合わせはありません。')}
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
function bulkBar(frame: ConsoleFrame, view: string) {
  return (
    <section aria-label="まとめて操作" className="inbox-bulk" hidden>
      <strong data-selected-count=""></strong>
      {view !== 'feedback' && (
        <>
          <button
            type="button"
            className="button-secondary"
            popovertarget="bulk-assignee"
          >
            担当者を選ぶ
          </button>
          <div popover="auto" id="bulk-assignee" className="inbox-popover">
            {frame.operators.map((o) => (
              <button
                className="button-quiet"
                type="button"
                data-change="assign"
                data-value={o.email}
                aria-label={o.displayName}
              >
                {operatorAvatar(o)}
                {o.displayName}
              </button>
            ))}
          </div>
        </>
      )}
      <button
        type="button"
        className="button-secondary"
        popovertarget="bulk-label"
      >
        ラベルを付ける
      </button>
      <div popover="auto" id="bulk-label" className="inbox-popover">
        {frame.labels.length ? (
          frame.labels.map((l) => (
            <button
              className="button-quiet"
              type="button"
              data-change="add"
              data-value={l}
            >
              {l}
            </button>
          ))
        ) : (
          <p>選べるラベルはまだありません。</p>
        )}
      </div>
      {view !== 'feedback' && (
        <button type="button" className="button-secondary" data-change="closed">
          完了にする
        </button>
      )}
      <button
        type="button"
        className="button-secondary"
        data-change="marked_spam"
      >
        迷惑メールにする
      </button>
      <button type="button" className="button-quiet" data-clear-selection="">
        選択を解除
      </button>
    </section>
  )
}
const emptyView: Record<string, string> = {
  open: '未対応の問い合わせはありません。',
  pending: '相手からの返信を待っている問い合わせはありません。',
  closed: '完了した問い合わせはありません。',
  spam: '迷惑メールに分類された問い合わせはありません。',
  approval: '承認を待っている下書きはありません。',
  feedback: 'この状態のフィードバックはありません。',
  mine: '自分が担当している問い合わせはありません。',
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
