import type { Child } from 'hono/jsx'
import { ActionLink, Button } from './controls'
import { Stack } from './layout'
import { Message } from './patterns'
import { Delivery, deliveryLabels, type DeliveryState } from './inbox-parts'
type Content = { children?: Child }
export const MessageAuthor = ({ children, id }: Content & { id?: string }) => (
  <div id={id} className="message-author">
    {children}
  </div>
)
export function ThreadActivity({
  message: entry,
}: {
  message: { id: string; kind: string; delivery?: DeliveryState | null }
}) {
  if (entry.kind !== 'note' && !entry.delivery) return null
  return (
    <ActionLink
      variant="ghost"
      className="thread-activity"
      href={'#message-author-' + encodeURIComponent(entry.id)}
    >
      {entry.delivery ? (
        <Delivery state={entry.delivery}>
          {deliveryLabels[entry.delivery] + 'の返信へ'}
        </Delivery>
      ) : (
        '内部メモへ'
      )}
    </ActionLink>
  )
}

export const MessageText = ({ children }: Content) => (
  <p className="message-body">{children}</p>
)
export const AttachmentList = ({ children }: Content) => (
  <ul className="attachments">{children}</ul>
)
export const ThreadPanel = ({
  children,
  context,
}: Content & { context: string }) => (
  <section
    id="related-info"
    tabindex={-1}
    aria-label="会話の関連情報"
    className="context-cards"
  >
    <header className="context-drawer-header">
      <div>
        <h2>会話の関連情報</h2>
        <small>{context}</small>
      </div>
      <Button
        type="button"
        variant="ghost"
        popovertarget="related-info"
        popovertargetaction="hide"
      >
        閉じる
      </Button>
    </header>
    {children}
  </section>
)
export const ThreadPanelTrigger = () => (
  <Button
    className="context-drawer-trigger"
    type="button"
    variant="ghost"
    popovertarget="related-info"
    aria-controls="related-info"
    aria-expanded="false"
  >
    関連情報
  </Button>
)
export const ReplyArea = ({
  templates,
  noteOnly,
  children,
}: Content & { templates: Child; noteOnly: boolean }) => (
  <Stack
    as="section"
    id="reply-area"
    data-thread-note-only={String(noteOnly)}
    className="reply-area"
    aria-label="返信欄"
  >
    {templates}
    {children}
  </Stack>
)
export const ThreadTimeline = ({ children }: Content) => (
  <section
    id="thread-messages"
    className="message-list"
    aria-label="メッセージ"
  >
    <label className="timeline-toggle">
      <input type="checkbox" />
      出来事を隠す
    </label>
    {children}
  </section>
)
export const DraftReference = ({ id, children }: Content & { id: string }) => (
  <div className="timeline-draft" data-thread-entry={'draft/' + id}>
    <ActionLink variant="ghost" href={'#approve-' + id}>
      下書きを確認する
    </ActionLink>{' '}
    {children}
  </div>
)
export const TimelineFold = ({
  count,
  children,
}: Content & { count: number }) => (
  <details className="timeline-fold" data-thread-entry="fold">
    <summary>{count}件のやりとり</summary>
    {children}
  </details>
)
export const NextThreadStep = ({ children }: Content) => (
  <p className="thread-next">{children}</p>
)

export const TimelineEntry = ({ children, id }: Content & { id: number }) => (
  <Message kind="record" entry={'event/' + id}>
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

export const ThreadSubject = ({ children }: Content) => (
  <span className="thread-subject">{children}</span>
)
export const ThreadToolbar = ({ children }: Content) => (
  <nav className="thread-toolbar" aria-label="会話の操作">
    {children}
  </nav>
)
