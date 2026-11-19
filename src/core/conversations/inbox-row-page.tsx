import type { ConsoleFrame, inboxMetadata } from './console-usecase'
import { inboxSearch, threadUrl } from './inbox-location'
import type { Result } from './inbox-page'
import { ConversationRow } from '../../ui/patterns'
import { Button, Input } from '../../ui/controls'
import {
  inboxIcon as icon,
  RowHeadline,
  RowPreview,
  RowLabels,
  QuickActions,
  FeedbackRowAction,
  RowCount,
  Delivery,
  WaitingTime,
} from '../../ui/inbox-parts'
import { inboxStatus } from './inbox-location'
import { action, badge, stamp } from './console-page'
import { operatorAvatar } from '../operators/identity-page'

type Row = Result<'list'>[number]
type Metadata = Awaited<ReturnType<typeof inboxMetadata>>
function messageKind(kind: string | null, delivery: string | null) {
  if (kind === 'note') return 'メモ'
  if (kind !== 'outbound') return '受信'
  return delivery === 'awaiting_approval' || delivery === 'draft'
    ? '承認待ち'
    : '返信'
}
function elapsed(at: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - at) / 60_000))
  if (minutes < 1) return '1分未満'
  if (minutes < 60) return minutes + '分'
  if (minutes < 1440) return Math.floor(minutes / 60) + '時間'
  return Math.floor(minutes / 1440) + '日'
}
function clock(
  row: Row,
  m: { at: number; lastInbound: number | null },
  now: number,
) {
  if (row.status.kind !== 'open' || m.lastInbound === null)
    return stamp(m.at, now)
  const text = elapsed(m.lastInbound, now)
  return (
    <WaitingTime
      at={m.lastInbound}
      overdue={now - m.lastInbound > 86400000}
      label={'最後の受信から' + text}
    >
      {text}待ち
    </WaitingTime>
  )
}
function quickActions(row: Row, frame: ConsoleFrame) {
  if (
    row.kind === 'feedback' &&
    row.status.kind === 'received' &&
    frame.extensions.some((ext) => ext.id === 'feedback')
  ) {
    return (
      <FeedbackRowAction>
        {action(
          'feedback.review',
          '確認済みにする',
          <Input type="hidden" name="inbox" value={inboxSearch(frame.query)} />,
          row.number,
        )}
      </FeedbackRowAction>
    )
  }
  if (row.kind !== 'inquiry') return null
  return (
    <QuickActions>
      <Button
        variant="ghost"
        type="button"
        data-quick="assign"
        aria-label="自分が担当する"
        title="自分が担当する"
      >
        {icon('自分が担当する')}
      </Button>
      {(row.status.kind === 'open' || row.status.kind === 'pending') && (
        <Button
          type="button"
          variant="ghost"
          data-quick="closed"
          aria-label="完了にする"
          title="完了にする"
        >
          {icon('完了にする')}
        </Button>
      )}
    </QuickActions>
  )
}
export function conversationRow(row: Row, meta: Metadata, frame: ConsoleFrame) {
  const m = meta.get(row.number)
  if (!m) return null
  const assignee =
    row.kind === 'inquiry' && row.assignment.kind === 'assigned'
      ? row.assignment.to
      : undefined
  const profile = frame.operators.find((op) => op.email === assignee)
  const labels = m.labels
  const sender = m.name || row.contact || '匿名'
  const mixed = inboxStatus(frame.query) === 'all'
  const preview = (
    <RowPreview
      number={row.number}
      text={m.preview}
      icon={
        m.previewKind && icon(messageKind(m.previewKind, m.previewDelivery))
      }
    >
      {m.messages >= 3 && (
        <RowCount>
          {icon('やりとり', m.messages + '通のやりとり')}
          {m.messages}
        </RowCount>
      )}
      {!!m.hasFiles && icon('添付あり')}
      {frame.approvalNumbers.has(row.number) && (
        <Delivery state="awaiting_approval">承認待ち</Delivery>
      )}
      {!!m.failed && <Delivery state="failed">送信失敗</Delivery>}
      <RowLabels labels={labels} />
      {mixed && badge(row.status.kind)}
    </RowPreview>
  )
  return (
    <ConversationRow
      number={row.number}
      read={!m.unread}
      href={threadUrl(row.number, inboxSearch(frame.query))}
      selection={
        <Input
          type="checkbox"
          aria-label={'#' + row.number + 'を選択'}
          value={row.number}
        />
      }
      headline={
        <RowHeadline
          sender={sender}
          subject={row.subject}
          product={!frame.query.product ? m.productName : undefined}
        />
      }
      preview={preview}
      time={clock(row, m, frame.now)}
      assignee={operatorAvatar(profile, assignee)}
      actions={quickActions(row, frame)}
    />
  )
}
