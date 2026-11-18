import type { ConsoleFrame, inboxMetadata } from './console-usecase'
import { inboxSearch, threadUrl } from './inbox-location'
import type { Result } from './inbox-page'
import { badge, stamp } from './console-page'
import { operatorAvatar } from '../operators/identity-page'

type Row = Result<'list'>[number]
type Metadata = Awaited<ReturnType<typeof inboxMetadata>>
const icons = {
  受信: 'M3 4h14v11H3z M3 5l7 5 7-5',
  返信: 'M8 4L3 9l5 5 M4 9h5c5 0 7 2 8 6',
  メモ: 'M4 3h12v10l-4 4H4z M8 7h5 M8 10h4',
  承認待ち: 'M5 2h10v3l-4 5 4 5v3H5v-3l4-5-4-5z',
  添付あり: 'M6 11l6-6a3 3 0 0 1 4 4l-7 7a4 4 0 0 1-6-6l8-8 M7 12l6-6',
  やりとり: 'M2 3h12v9H7l-4 3v-3H2z M8 14h4l4 3v-3h2V7',
  自分が担当する:
    'M7 4a2.5 2.5 0 1 0 .01 0 M2 16v-1a5 5 0 0 1 10 0v1 M15 7v6 M12 10h6',
  完了にする: 'M3 10l4 4 10-10',
}
function icon(label: keyof typeof icons, description: string = label) {
  return (
    <svg
      role="img"
      aria-label={description}
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      <title>{description}</title>
      <path d={icons[label]} />
    </svg>
  )
}
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
    <time
      datetime={new Date(m.lastInbound).toISOString()}
      className={now - m.lastInbound > 86400000 ? 'wait-overdue' : ''}
      title={'最後の受信から' + text}
      aria-label={'最後の受信から' + text}
    >
      {text}待ち
    </time>
  )
}
function quickActions(row: Row) {
  if (row.kind !== 'inquiry') return null
  return (
    <div className="row-actions">
      <button
        className="button-quiet"
        type="button"
        data-quick="assign"
        aria-label="自分が担当する"
        title="自分が担当する"
      >
        {icon('自分が担当する')}
      </button>
      {(row.status.kind === 'open' || row.status.kind === 'pending') && (
        <button
          type="button"
          className="button-quiet"
          data-quick="closed"
          aria-label="完了にする"
          title="完了にする"
        >
          {icon('完了にする')}
        </button>
      )}
    </div>
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
  const sender = m.name || row.contact
  return (
    <li className="inbox-item" data-number={row.number}>
      <label className="row-select">
        <input
          type="checkbox"
          aria-label={'#' + row.number + 'を選択'}
          value={row.number}
        />
      </label>
      <a
        className={'conversation-row' + (m.unread ? ' unread' : '')}
        href={threadUrl(row.number, inboxSearch(frame.query))}
      >
        <span className="row-top">
          <span className="row-sender" title={sender}>
            {sender}
          </span>
          {!frame.query.product && (
            <span className="row-product" title={m.productName}>
              {m.productName}
            </span>
          )}
          <span className="row-subject" title={row.subject}>
            {row.subject}
          </span>
          {clock(row, m, frame.now)}
        </span>
        <span className="row-bottom">
          <code className="row-number">#{row.number}</code>
          {m.previewKind && icon(messageKind(m.previewKind, m.previewDelivery))}
          <span className="row-preview" title={m.preview}>
            {m.preview.length > 180 ? m.preview.slice(0, 180) + '…' : m.preview}
          </span>
          {m.messages >= 3 && (
            <span className="row-messages">
              {icon('やりとり', m.messages + '通のやりとり')}
              {m.messages}
            </span>
          )}
          {!!m.hasFiles && icon('添付あり')}
          {frame.approvalNumbers.has(row.number) && (
            <span className="delivery-awaiting-approval">承認待ち</span>
          )}
          {!!m.failed && <span className="delivery-failed">送信失敗</span>}
          <span className="row-labels" title={labels.join('、')}>
            {labels.slice(0, 2).map((l) => (
              <span className="label-chip" title={l}>
                {l}
              </span>
            ))}
            {labels.length > 2 && (
              <span className="extra-labels">+{labels.length - 2}</span>
            )}
            {labels.length > 1 && (
              <span className="extra-labels-narrow">+{labels.length - 1}</span>
            )}
          </span>
          {badge(row.status.kind)}
          {operatorAvatar(profile, assignee)}
        </span>
      </a>
      {quickActions(row)}
    </li>
  )
}
