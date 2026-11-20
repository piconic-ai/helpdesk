import type { Child } from 'hono/jsx'
import { glyph } from '../../ui/glyph'
import { ProductSelect, ProductMark } from '../../ui/product-mark'
import type { coreOperations } from '../operations/catalog-usecase'
import type { ConsoleFrame, inboxMetadata } from './console-usecase'
import { action, shell, selectedView, statuses, inboxUrl } from './console-page'
import { inboxSearch, inboxSort, inboxStatus } from './inbox-location'
import { conversationRow } from './inbox-row-page'
import { operatorAvatar } from '../operators/identity-page'
import { Stack } from '../../ui/layout'
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
} from '../../ui/patterns'
import {
  InboxFilters,
  FilterPicker,
  FilterChip,
  LabelDot,
  BulkBar,
  InboxTools,
  SelectAll,
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
  optionIcon?: (value: string) => Child,
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
            {optionIcon?.(key)}
            {text}
          </option>
        ))}
      </NativeSelect>
    </Field>
  )
}
function chips(q: Query, frame: ConsoleFrame) {
  const product = frame.products.find((p) => p.id === q.product)
  const labels: Record<string, string | undefined> = {
    query: q.query && '検索「' + q.query + '」',
    product: product?.name,
    assignee:
      frame.operators.find((op) => op.email === q.assignee)?.displayName ||
      q.assignee,
    label: q.label,
    status:
      q.status === 'all' ? 'すべての状態' : q.status && statuses[q.status],
    sort:
      q.sort === 'unreviewed'
        ? '未確認を先に'
        : q.sort === 'newest' && q.view !== 'feedback'
          ? '新しい順'
          : undefined,
  }
  return Object.entries(labels)
    .filter(([, text]) => text)
    .map(([key, text]) => (
      <FilterChip
        href={inboxUrl({ ...q, [key]: '', page: '' })}
        label={text!}
        icon={
          key === 'label' && (
            <LabelDot label={text!} colors={frame.labelColors} />
          )
        }
      >
        {key === 'product' && product ? (
          <ProductMark product={product} />
        ) : (
          text
        )}
      </FilterChip>
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
              statusIcon,
            )}
          <Field label="プロダクト">
            <ProductSelect
              products={frame.products}
              selected={q.product}
              empty="すべて"
            />
          </Field>
          {!feedback && (
            <Stack className="assignee-filter" gap="xs">
              <span>担当者</span>
              <Input type="hidden" name="assignee" value={q.assignee ?? ''} />
              <FilterPicker
                id="filter-assignee"
                variant="outline"
                accessibleName={'担当者 ' + (person?.displayName ?? 'すべて')}
                label={person?.displayName ?? 'すべて'}
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
            </Stack>
          )}
          {selectFilter(
            'label',
            'ラベル',
            {
              '': 'すべてのラベル',
              ...Object.fromEntries(frame.labels.map((l) => [l, l])),
            },
            q.label ?? '',
            undefined,
            (name) =>
              name && <LabelDot label={name} colors={frame.labelColors} />,
          )}
        </FilterPicker>
        <NativeSelect
          name="sort"
          aria-label="並び順"
          data-implicit-value={feedback ? 'newest' : 'waiting'}
        >
          {!feedback && (
            <option value="waiting" selected={inboxSort(q) === 'waiting'}>
              待たせている順
            </option>
          )}
          <option value="newest" selected={inboxSort(q) === 'newest'}>
            新しい順
          </option>
          {feedback && (
            <option value="unreviewed" selected={inboxSort(q) === 'unreviewed'}>
              未確認を先に
            </option>
          )}
        </NativeSelect>
      </InboxFilters>
    </FilterBar>
  )
}
function emptyInbox(q: Query, view: string) {
  const filtered = hasInboxFilter(q, view)
  return (
    <EmptyState
      icon={filtered ? 'search' : view === 'feedback' ? 'feedback' : 'open'}
    >
      <span>
        {filtered
          ? '条件に一致する問い合わせはありません。'
          : (emptyView[view] ?? '受け付けた問い合わせはありません。')}
      </span>
      {filtered && (
        <ActionLink
          href={inboxUrl({
            ...q,
            product: '',
            label: '',
            query: '',
            assignee: '',
          })}
          variant="ghost"
        >
          絞り込みを解除
        </ActionLink>
      )}
      {!filtered && view !== 'all' && (
        <ActionLink
          variant="ghost"
          href={inboxUrl({ ...q, view: '', status: 'all' })}
        >
          すべての会話を見る
        </ActionLink>
      )}
    </EmptyState>
  )
}
function hasInboxFilter(q: Query, view: string) {
  return !!(q.product || q.label || q.query || (q.assignee && view !== 'mine'))
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
  return shell(
    title,
    <div data-inbox-view="">
      <ListPage
        title={title}
        description={
          <>
            <span data-inbox-count="">{page.total} 件</span>
            <span data-inbox-count-pending="" hidden>
              件数を確認中
            </span>
          </>
        }
        filters={
          <InboxTools>
            {filters(q, frame)}
            {rows.length > 0 && bulkBar(frame, view)}
          </InboxTools>
        }
      >
        {view === 'feedback' && feedbackNotice(q)}
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
                <SelectAll />
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
              emptyInbox(q, view)
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
function feedbackNotice(q: Query) {
  const number = Number(q.changed)
  if (!Number.isSafeInteger(number) || number <= 0) return null
  if (q.notice === 'feedback.unreview')
    return (
      <Notice toast kind="success">
        #{number} を未確認に戻しました。
      </Notice>
    )
  if (q.notice !== 'feedback.review') return null
  return (
    <Notice toast kind="success">
      #{number} を確認済みにしました。
      {action(
        'feedback.unreview',
        '元に戻す',
        <Input type="hidden" name="inbox" value={inboxSearch(q)} />,
        number,
        'quiet',
      )}
    </Notice>
  )
}
function bulkBar(frame: ConsoleFrame, view: string) {
  return (
    <BulkBar>
      <strong data-selected-count="">0件を選択中</strong>
      <Button
        type="button"
        variant="ghost"
        aria-label="選択を解除"
        data-clear-selection=""
      >
        <span className="bulk-clear-prefix">選択を</span>解除
      </Button>
      {frame.query.label && (
        <small title={frame.query.label}>ラベル：{frame.query.label}</small>
      )}
      <div className="inbox-bulk-actions">
        {view !== 'feedback' && (
          <FilterPicker id="bulk-assignee" label="担当者を選ぶ">
            <small data-mixed-label-hint="">
              「−」は選択中の一部の会話を担当しています。
            </small>
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
                data-bulk-label={label}
                aria-label={label}
                aria-pressed="false"
              >
                <LabelDot label={label} colors={frame.labelColors} />
                {label}
              </Button>
            ))
          ) : (
            <p>選べるラベルはまだありません。</p>
          )}
          <small data-mixed-label-hint="">
            −
            は一部の会話に付いています。選ぶと、選択中のすべての会話に付きます。
          </small>
          <a href="/settings/labels">ラベルを管理</a>
        </FilterPicker>
        {view !== 'feedback' && frame.query.status !== 'spam' && (
          <Button type="button" data-change="closed">
            完了にする
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          data-change={
            frame.query.status === 'spam' ? 'unmarked_spam' : 'marked_spam'
          }
        >
          {frame.query.status === 'spam'
            ? '迷惑メールを解除'
            : '迷惑メールにする'}
        </Button>
        <FilterPicker id="bulk-more" label="その他" />
      </div>
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

function statusIcon(name: string) {
  switch (name) {
    case 'open':
    case 'pending':
    case 'closed':
    case 'spam':
    case 'received':
    case 'reviewed':
      return glyph(name)
    default:
      return null
  }
}
