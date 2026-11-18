import type { Child } from 'hono/jsx'
import { ActionLink } from './controls'
import { Message } from './patterns'
type Content = { children?: Child }
export const MessageAuthor = ({ children }: Content) => (
  <div className="message-author">{children}</div>
)
export const MessageText = ({ children }: Content) => (
  <p className="message-body">{children}</p>
)
export const AttachmentList = ({ children }: Content) => (
  <ul className="attachments">{children}</ul>
)
export const ThreadPanel = ({ children }: Content) => (
  <section
    id="related-info"
    aria-label="会話の関連情報"
    className="context-cards"
  >
    {children}
  </section>
)
export const ThreadTimeline = ({ children }: Content) => (
  <section className="message-list" aria-label="メッセージ">
    {children}
  </section>
)
export const TimelineEntry = ({ children }: Content) => (
  <Message kind="record">
    <p className="timeline-entry">{children}</p>
  </Message>
)
export const DraftReview = ({ children }: Content) => (
  <div className="draft-review">{children}</div>
)
export function StepLink({
  href,
  previous = false,
}: {
  href?: string
  previous?: boolean
}) {
  const label = previous ? '前の未対応へ' : '次の未対応へ'
  const arrow = previous ? '←' : '→'
  return href ? (
    <ActionLink href={href} variant="ghost" aria-label={label} title={label}>
      {arrow}
    </ActionLink>
  ) : (
    <span aria-disabled="true" aria-label={label} className="unavailable-step">
      {arrow}
    </span>
  )
}
