import type { ConsoleFrame, inboxMetadata } from './console-usecase'
import { inboxSearch, threadUrl } from './inbox-location'
import type { Result } from './inbox-page'
import { ProductMark } from '../../ui/product-mark'
import { ContactAvatar } from '../../ui/operator-identity'
import { ConversationRow } from '../../ui/patterns'
import { Button, Input } from '../../ui/controls'
import {
  inboxIcon as icon,
  RowHeadline,
  channelIcon,
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
  const hours = (now - m.lastInbound) / 3600000
  return (
    <WaitingTime
      at={m.lastInbound}
      severity={hours > 72 ? 2 : hours > 24 ? 1 : 0}
      label={'最後の受信から' + text}
    >
      {text}待ち
    </WaitingTime>
  )
}
function quickActions(row: Row, frame: ConsoleFrame) {
  if (
    row.kind === 'feedback' &&
    (row.status.kind === 'received' || row.status.kind === 'reviewed') &&
    frame.extensions.some((ext) => ext.id === 'feedback')
  ) {
    return (
      <FeedbackRowAction>
        {action(
          row.status.kind === 'received'
            ? 'feedback.review'
            : 'feedback.unreview',
          row.status.kind === 'received' ? '確認済みにする' : '未確認に戻す',
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
type RowDetails = NonNullable<ReturnType<Metadata['get']>>
function previewAuthor(m: RowDetails) {
  if (m.previewKind === 'inbound') return '相手の文'
  if (m.previewKind === 'note') return '内部メモ'
  return m.previewDelivery === 'draft' ||
    m.previewDelivery === 'awaiting_approval'
    ? '下書き'
    : '返信'
}
function rowMarks(m: RowDetails, approval: boolean, mixed: boolean) {
  const marks = []
  if (m.failed)
    marks.push(
      <Delivery state="failed">
        {m.previewDelivery === 'failed' ? '送信失敗' : '別の返信で送信失敗'}
      </Delivery>,
    )
  if (approval)
    marks.push(
      <Delivery state="awaiting_approval" compact>
        {m.previewDelivery === 'awaiting_approval' ||
        m.previewDelivery === 'draft'
          ? '承認待ち'
          : '別の返信が承認待ち'}
      </Delivery>,
    )
  if (!approval && !m.failed && m.previewDelivery)
    marks.push(<Delivery state={m.previewDelivery} compact />)
  if (approval && m.previewDelivery === 'draft')
    marks.push(<Delivery state="draft" compact />)
  if (m.previewKind === 'note') marks.push(icon('メモ'))

  if (m.messages >= 3)
    marks.push(
      <RowCount>
        {icon('やりとり', m.messages + '通のやりとり')}
        {m.messages}
      </RowCount>,
    )
  // Channel and assignee occupy the first two of the five available cues.
  return marks.slice(0, 3 - Number(mixed))
}
export function conversationRow(row: Row, meta: Metadata, frame: ConsoleFrame) {
  const m = meta.get(row.number)
  if (!m) return null
  const assignee =
    row.kind === 'inquiry' && row.assignment.kind === 'assigned'
      ? row.assignment.to
      : undefined
  const profile = frame.operators.find((op) => op.email === assignee)
  const sender = m.name || row.contact || '匿名'
  const mixed = inboxStatus(frame.query) === 'all'
  const approval = frame.approvalNumbers.has(row.number)
  const marks = rowMarks(m, approval, mixed)
  const previewSource =
    (approval || m.previewKind === 'note') && previewAuthor(m)
  const preview = (
    <RowPreview
      number={row.number}
      text={previewSource ? previewSource + ' · ' + m.preview : m.preview}
      icon={channelIcon(row.origin)}
    >
      {m.hasFiles && icon('添付あり')}
    </RowPreview>
  )
  const details = (
    <>
      {marks}
      <RowLabels
        labels={m.labels}
        colors={frame.labelColors}
        limit={Math.min(2, 3 - marks.length - Number(mixed))}
      />
      {mixed && badge(row.status.kind)}
    </>
  )
  return (
    <ConversationRow
      number={row.number}
      read={!m.unread}
      contact={<ContactAvatar name={m.name} email={row.contact} />}
      href={threadUrl(row.number, inboxSearch(frame.query))}
      selection={
        <Input
          type="checkbox"
          data-assignee={assignee ?? ''}
          data-labels={JSON.stringify(m.labels)}
          aria-label={'#' + row.number + 'を選択'}
          value={row.number}
        />
      }
      headline={
        <RowHeadline
          kind={row.kind}
          sender={sender}
          subject={row.subject}
          product={
            <ProductMark product={{ id: row.product, name: m.productName }} />
          }
        />
      }
      preview={preview}
      time={clock(row, m, frame.now)}
      assignee={details}
      owner={operatorAvatar(profile, assignee)}
      actions={quickActions(row, frame)}
    />
  )
}
