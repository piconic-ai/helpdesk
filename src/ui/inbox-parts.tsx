import type { Child } from 'hono/jsx'
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
}: {
  href: string
  label: string
}) => (
  <a data-ui="chip" href={href} aria-label={label + 'を外す'}>
    {label}
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
  product?: string
}) {
  return (
    <>
      <span className="row-sender" title={sender}>
        {sender}
      </span>
      <span className="row-subject" title={subject}>
        {subject}
      </span>
      {product && (
        <span className="row-product" title={product}>
          {product}
        </span>
      )}
    </>
  )
}
export function RowPreview({
  number,
  text,
  icon,
  children,
}: {
  number: number
  text: string
  icon?: Child
  children?: Child
}) {
  return (
    <>
      <code className="row-number">#{number}</code>
      {icon}
      <span className="row-preview" title={text}>
        {text.length > 180 ? text.slice(0, 180) + '…' : text}
      </span>
      {children}
    </>
  )
}
export function RowLabels({ labels }: { labels: string[] }) {
  return (
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
  )
}
export const RowCount = ({ children }: Content) => (
  <span className="row-messages">{children}</span>
)
export const QuickActions = ({ children }: Content) => (
  <div className="row-actions">{children}</div>
)
export const WaitingTime = ({
  overdue,
  at,
  label,
  children,
}: Content & { overdue: boolean; at: number; label: string }) => (
  <time
    datetime={new Date(at).toISOString()}
    className={overdue ? 'wait-overdue' : undefined}
    title={label}
    aria-label={label}
  >
    {children}
  </time>
)
export function Delivery({ state, children }: Content & { state: string }) {
  return (
    <span className={'delivery-' + state.replaceAll('_', '-')}>{children}</span>
  )
}
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
export function inboxIcon(
  label: keyof typeof icons,
  description: string = label,
) {
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
