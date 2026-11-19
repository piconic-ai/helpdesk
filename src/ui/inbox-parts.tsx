import type { Child } from 'hono/jsx'
import { identityColor } from './identity-color'
import { glyph } from './glyph'
import { Popover } from './controls'
type Content = { children?: Child }
export const InboxFilters = ({ children }: Content) => (
  <form
    method="get"
    action="/"
    className="filters"
    data-live-filters=""
    role="search"
  >
    {children}
  </form>
)
export const BulkBar = ({ children }: Content) => (
  <section hidden className="inbox-bulk" aria-label="まとめて操作">
    {children}
  </section>
)
export const PageLinks = ({ children }: Content) => (
  <nav className="inbox-pagination" aria-label="ページ送り">
    {children}
  </nav>
)
export const FilterChip = ({
  href,
  label,
  icon,
  children,
}: {
  children?: Child
  icon?: Child
  href: string
  label: string
}) => (
  <a data-ui="chip" href={href} aria-label={label + 'を外す'}>
    {icon}
    {children ?? label}
    <span aria-hidden="true"> ×</span>
  </a>
)
export const FilterPicker = Popover
export function RowHeadline({
  sender,
  subject,
  product,
}: {
  sender: string
  subject: string
  product?: Child
}) {
  return (
    <>
      <span className="row-sender" title={sender}>
        {sender}
      </span>
      <span className="row-subject" title={subject}>
        {subject}
      </span>
      {product && <span className="row-product">{product}</span>}
    </>
  )
}
export function RowPreview({
  number,
  sender,
  text,
  icon,
  children,
}: {
  number: number
  sender?: string
  text: string
  icon?: Child
  children?: Child
}) {
  return (
    <>
      <code className="row-number">#{number}</code>
      {icon}
      {sender && (
        <span className="row-mobile-sender" title={sender}>
          {sender}
        </span>
      )}
      <span className="row-preview" title={text}>
        {text.length > 180 ? text.slice(0, 180) + '…' : text}
      </span>
      {children}
    </>
  )
}
export function LabelDot({
  label,
  colors,
  color,
}: {
  color?: number
  label: string
  colors?: Record<string, number>
}) {
  return (
    <span
      className="label-dot"
      aria-hidden="true"
      data-identity-color={color ?? colors?.[label] ?? identityColor(label)}
    />
  )
}
export function RowLabels({
  labels,
  colors,
  limit = 2,
}: {
  labels: string[]
  colors?: Record<string, number>
  limit?: number
}) {
  const count = Math.min(limit, labels.length)
  if (!count && !labels.length) return null
  return (
    <span className="row-labels" title={labels.join('、')}>
      {labels.slice(0, count).map((l) => (
        <span className="label-chip" title={l}>
          <LabelDot label={l} colors={colors} />
          {l}
        </span>
      ))}
      {labels.length > count && (
        <span className="extra-labels">+{labels.length - count}</span>
      )}
      {labels.length > Math.min(count, 1) && (
        <span className="extra-labels-narrow">
          +{labels.length - Math.min(count, 1)}
        </span>
      )}
    </span>
  )
}
export const RowCount = ({ children }: Content) => (
  <span className="row-messages">{children}</span>
)
export const QuickActions = ({ children }: Content) => (
  <div className="row-actions">{children}</div>
)
export const FeedbackRowAction = ({ children }: Content) => (
  <div className="feedback-row-action">{children}</div>
)
export const WaitingTime = ({
  severity,
  at,
  label,
  children,
}: Content & { severity: 0 | 1 | 2; at: number; label: string }) => (
  <time
    datetime={new Date(at).toISOString()}
    className={severity ? 'wait-overdue' : undefined}
    title={label}
    aria-label={label}
  >
    {severity > 0 && glyph(severity === 2 ? 'long_wait' : 'wait')}
    {children}
  </time>
)
const deliveryLabels = {
  draft: '下書き',
  awaiting_approval: '承認待ち',
  queued: '送信待ち',
  sent: '送信済み',
  failed: '送信失敗',
} as const
export type DeliveryState = keyof typeof deliveryLabels
export function Delivery({
  state,
  children,
  compact = false,
}: Content & { state: DeliveryState; compact?: boolean }) {
  return (
    <span
      className={'delivery-' + state.replaceAll('_', '-')}
      title={deliveryLabels[state]}
    >
      {glyph(
        state,
        compact
          ? state === 'sent'
            ? '返信'
            : deliveryLabels[state]
          : undefined,
      )}
      {(children || !compact) && (
        <span className="delivery-label">
          {children ?? deliveryLabels[state]}
        </span>
      )}
    </span>
  )
}
const inboxSymbols = {
  受信: 'mail',
  メモ: 'note',
  添付あり: 'attachment',
  やりとり: 'message_count',
  自分が担当する: 'assign',
  完了にする: 'closed',
} as const

export function inboxIcon(
  label: keyof typeof inboxSymbols,
  description: string = label,
) {
  return glyph(inboxSymbols[label], description)
}

export function channelIcon(origin: 'email' | 'form' | 'chat') {
  const names = { email: 'メール', form: 'フォーム', chat: 'チャット' }
  return glyph(origin === 'email' ? 'mail' : origin, names[origin])
}
export function attachmentIcon(file: { filename: string; mime: string }) {
  const type = file.mime.toLowerCase()
  const name = file.filename.toLowerCase()
  if (
    type.startsWith('image/') ||
    /\.(?:png|gif|jpe?g|webp|svg|avif)$/.test(name)
  )
    return glyph('image', '画像')
  if (type === 'application/pdf' || name.endsWith('.pdf'))
    return glyph('pdf', 'PDF')
  if (
    /spreadsheet|excel|csv/.test(type) ||
    /\.(?:csv|tsv|xlsx?|ods)$/.test(name)
  )
    return glyph('sheet', '表計算')
  if (
    /zip|compressed|tar|gzip/.test(type) ||
    /\.(?:zip|7z|gz|tar|rar)$/.test(name)
  )
    return glyph('archive', '圧縮ファイル')
  return glyph('file', 'ファイル')
}
