import type { coreOperations } from '../operations/catalog-usecase'
import type { ConsoleFrame, inboxMetadata } from './console-usecase'
import { shell, selectedView, statuses, inboxUrl } from './console-page'
import { inboxStatus } from './inbox-location'
import { conversationRow } from './inbox-row-page'
import { operatorAvatar } from '../operators/identity-page'
import {
  Button,
  Input,
  NativeSelect,
  Field,
  ActionLink,
} from '../../ui/controls'
import {
  FilterBar,
  CandidateList,
  Candidate,
  ListPage,
  RowList,
  EmptyState,
  LoadingState,
  Notice,
  ActionBar,
} from '../../ui/patterns'
import {
  InboxFilters,
  FilterPicker,
  FilterChip,
  BulkBar,
  PageLinks,
} from '../../ui/inbox-parts'
export type Result<K extends keyof typeof coreOperations> = Awaited<
  ReturnType<(typeof coreOperations)[K]['execute']>
>
type Metadata = Awaited<ReturnType<typeof inboxMetadata>>
type Query = Record<string, string>
function selectFilter(
  name: string,
  label: string,
  choices: Record<string, string>,
  value: string,
  implicit?: string,
) {
  return (
    <Field label={label}>
      <NativeSelect
        name={name}
        aria-label={label}
        data-implicit-value={implicit}
      >
        {Object.entries(choices).map(([key, text]) => (
          <option value={key} selected={key === value}>
            {text}
          </option>
        ))}
      </NativeSelect>
    </Field>
  )
}
function chips(q: Query, frame: ConsoleFrame) {
  const labels: Record<string, string | undefined> = {
    query: q.query && '検索「' + q.query + '」',
    product: frame.products.find((p) => p.id === q.product)?.name,
    assignee:
      frame.operators.find((op) => op.email === q.assignee)?.displayName ||
      q.assignee,
    label: q.label,
    status: q.status && statuses[q.status],
    sort: q.sort === 'newest' ? '新しい順' : undefined,
  }
  return Object.entries(labels)
    .filter(([, text]) => text)
    .map(([key, text]) => (
      <FilterChip
        href={inboxUrl({ ...q, [key]: '', page: '' })}
        label={text!}
      />
    ))
}
function filters(q: Query, frame: ConsoleFrame) {
  const feedback = q.view === 'feedback'
  const status = inboxStatus(q)
  const statusChoices = feedback ? feedbackStatuses : inquiryStatuses
  const activeChips = chips(q, frame)
  const person = frame.operators.find((o) => o.email === q.assignee)
  return (
    <FilterBar chips={activeChips.length ? activeChips : undefined}>
      <InboxFilters>
        {q.view && <Input type="hidden" name="view" value={q.view} />}
        <Input
          name="query"
          type="search"
          value={q.query ?? ''}
          aria-label="問い合わせを検索"
          placeholder="件名・差出人・本文を検索"
        />
        <FilterPicker label="絞り込み" id="inbox-filters">
          {q.view !== 'approval' &&
            selectFilter(
              'status',
              '状態',
              statusChoices,
              status,
              q.status ? undefined : status,
            )}
          {selectFilter(
            'product',
            'プロダクト',
            {
              '': 'すべて',
              ...Object.fromEntries(frame.products.map((p) => [p.id, p.name])),
            },
            q.product ?? '',
          )}
          {!feedback && (
            <>
              <Input type="hidden" name="assignee" value={q.assignee ?? ''} />
              <FilterPicker
                id="filter-assignee"
                label={'担当者 ' + (person?.displayName ?? 'すべて')}
              >
                <CandidateList>
                  <Button
                    type="button"
                    variant="ghost"
                    data-filter-assignee=""
                    aria-pressed={!q.assignee}
                  >
                    <Candidate
                      label="すべて"
                      selected={!q.assignee}
                      icon={operatorAvatar()}
                    />
                  </Button>
                  {frame.operators.map((op) => (
                    <Button
                      type="button"
                      variant="ghost"
                      data-filter-assignee={op.email}
                      aria-label={op.displayName}
                      aria-pressed={q.assignee === op.email}
                    >
                      <Candidate
                        label={op.displayName}
                        selected={q.assignee === op.email}
                        icon={operatorAvatar(op)}
                      />
                    </Button>
                  ))}
                </CandidateList>
              </FilterPicker>
            </>
          )}
          {selectFilter(
            'label',
            'ラベル',
            {
              '': 'すべて',
              ...Object.fromEntries(frame.labels.map((l) => [l, l])),
            },
            q.label ?? '',
          )}
        </FilterPicker>
        <NativeSelect
          name="sort"
          aria-label="並び順"
          data-implicit-value="waiting"
        >
          <option value="waiting" selected={q.sort !== 'newest'}>
            待たせている順
          </option>
          <option value="newest" selected={q.sort === 'newest'}>
            新しい順
          </option>
        </NativeSelect>
      </InboxFilters>
    </FilterBar>
  )
}
export function inboxPage(
  rows: Result<'list'>,
  failures: Result<'failures'>,
  q: Query,
  frame: ConsoleFrame,
  meta: Metadata,
  page: { page: number; pages: number; total: number },
) {
  const view = selectedView(q, frame.operator.email)
  const title = statuses[view] ?? '受信箱'
  const noMatch = !!(
    q.product ||
    q.label ||
    q.query ||
    (q.assignee && view !== 'mine')
  )
  return shell(
    title,
    <div data-inbox-view="">
      <ListPage
        title={title}
        description={page.total + ' 件'}
        filters={filters(q, frame)}
      >
        {failures.length > 0 && (
          <Notice kind="error">
            <h2>受信に失敗したメール</h2>
            {failures.map((f) => (
              <p>
                <code>{f.mailbox}</code> · {f.reason}
              </p>
            ))}
          </Notice>
        )}
        <div data-inbox-results="" aria-live="polite">
          <div data-inbox-content="">
            {rows.length ? (
              <>
                {bulkBar(frame, view)}
                <RowList>
                  {rows.map((row) => conversationRow(row, meta, frame))}
                </RowList>
                {page.pages > 1 && (
                  <PageLinks>
                    {page.page > 1 && (
                      <ActionLink
                        href={inboxUrl({ ...q, page: String(page.page - 1) })}
                      >
                        前のページ
                      </ActionLink>
                    )}
                    <span>
                      {page.page} / {page.pages} ページ
                    </span>
                    {page.page < page.pages && (
                      <ActionLink
                        href={inboxUrl({ ...q, page: String(page.page + 1) })}
                      >
                        次のページ
                      </ActionLink>
                    )}
                  </PageLinks>
                )}
              </>
            ) : (
              <EmptyState>
                {noMatch
                  ? '条件に一致する問い合わせはありません。'
                  : (emptyView[view] ?? '受け付けた問い合わせはありません。')}
              </EmptyState>
            )}
          </div>
          <div data-inbox-loading="" hidden>
            <LoadingState label="問い合わせを読み込み中です。" />
          </div>
        </div>
      </ListPage>
    </div>,
    frame,
  )
}
function bulkBar(frame: ConsoleFrame, view: string) {
  return (
    <BulkBar>
      <strong data-selected-count="">0件を選択</strong>
      <ActionBar>
        {view !== 'feedback' && (
          <FilterPicker id="bulk-assignee" label="担当者を選ぶ">
            <CandidateList>
              {frame.operators.map((op) => (
                <Button
                  variant="ghost"
                  type="button"
                  data-change="assign"
                  data-value={op.email}
                  aria-label={op.displayName}
                >
                  <Candidate icon={operatorAvatar(op)} label={op.displayName} />
                </Button>
              ))}
            </CandidateList>
          </FilterPicker>
        )}
        <FilterPicker id="bulk-label" label="ラベルを付ける">
          {frame.labels.length ? (
            frame.labels.map((label) => (
              <Button
                type="button"
                variant="ghost"
                data-change="add"
                data-value={label}
              >
                {label}
              </Button>
            ))
          ) : (
            <p>選べるラベルはまだありません。</p>
          )}
        </FilterPicker>
        {view !== 'feedback' && (
          <Button type="button" data-change="closed">
            完了にする
          </Button>
        )}
        <Button type="button" variant="ghost" data-change="marked_spam">
          迷惑メールにする
        </Button>
        <Button type="button" variant="ghost" data-clear-selection="">
          選択を解除
        </Button>
      </ActionBar>
    </BulkBar>
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
