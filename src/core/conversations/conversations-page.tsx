import { embeddingPage } from '../intakes/intake'
import { threadUrl } from './inbox-location'
import { displayEvents, timelineChange, timelineLabel } from './timeline'
import { ReplyComposer } from '@/components/ReplyComposer'
import type { Child } from 'hono/jsx'
import { ActionMenu, Popover, ActionLink, Input } from '../../ui/controls'
import {
  DetailPage,
  FormSection,
  AttributeRow,
  ActionBar,
  Message,
  Notice,
  RowList,
} from '../../ui/patterns'
import {
  AttachmentList,
  MessageAuthor,
  MessageText,
  StepLink,
  ThreadPanel,
  ThreadPanelTrigger,
  ThreadSubject,
  ThreadToolbar,
  ReplyArea,
  ThreadTimeline,
  ThreadActivity,
  TimelineEntry,
} from '../../ui/thread-parts'
import {
  Delivery,
  channelIcon,
  attachmentIcon,
  LabelDot,
} from '../../ui/inbox-parts'
import { ContactAvatar } from '../../ui/operator-identity'
import { ProductMark } from '../../ui/product-mark'
import { adjacentOpen } from './inbox-location'
import { actorIdentity } from '../operators/identity-page'
import { actorSchema } from './state'
import type {
  ConsoleFrame,
  inboxMetadata,
  threadFiles,
} from './console-usecase'
import {
  shell,
  action,
  badge,
  noteLabel,
  stamp,
  selectedView,
  statuses,
} from './console-page'
import type { Result } from './inbox-page'
import type { pendingReplyUndos } from '../outbound/reply-usecase'
import { replySubject, senderLabel } from '../outbound/compose'
import {
  assignment,
  labelPicker,
  draftReview,
  threadNotice,
  replyUndoForm,
} from './thread-controls-page'
export { inboxPage } from './inbox-page'
export { settingsPage } from './settings-page'
export { shell } from './console-page'
type Names = ConsoleFrame['operators']
type Details = Result<'get'>
type Files = Awaited<ReturnType<typeof threadFiles>>
function deliveryNotice(held: boolean, failure: string | null) {
  if (held)
    return (
      <Notice kind="info">
        相手から新しいメッセージが届いたため、送信を止めました。下書きを確認してください。
      </Notice>
    )
  return failure ? <Notice kind="error">{failure}</Notice> : null
}
function message(
  m: Details['messages'][number],
  data: Details,
  files: Files,
  name: string,
  names: Names,
  now: number,
  held: boolean,
) {
  const c = data.conversation
  const draft = m.delivery === 'draft' || m.delivery === 'awaiting_approval'
  const canSend =
    c.kind === 'inquiry' &&
    (c.status.kind === 'open' || c.status.kind === 'pending')
  const label =
    m.kind === 'inbound' ? name : m.kind === 'note' ? noteLabel : '返信'
  return (
    <Message
      kind={m.kind}
      header={
        <>
          <h2>{messageHeading(m.kind, label, c.contact)}</h2>
          {stamp(m.created_at, now)}
        </>
      }
    >
      <MessageAuthor id={'message-author-' + m.id}>
        {m.kind === 'inbound' ? (
          <code>{c.contact}</code>
        ) : (
          <span>{actorIdentity(m.actor, names, m.approval)}</span>
        )}
        {m.delivery && <Delivery state={m.delivery} />}
      </MessageAuthor>
      {m.body && (!draft || !canSend) && <MessageText>{m.body}</MessageText>}
      {m.html && (
        <>
          <iframe
            sandbox="allow-scripts"
            data-mail-frame=""
            title="HTML メール"
            src={'/mail/' + encodeURIComponent(m.id)}
          />
        </>
      )}
      {attachmentList(files)}
      {deliveryNotice(held, m.reason)}
      {canSend &&
        m.delivery === 'failed' &&
        !data.uncertain.includes(m.id) &&
        action(
          'retry',
          '再送',
          <Input type="hidden" name="id" value={m.id} />,
          c.number,
        )}
      {draft && draftReview(m.id, c.number, m.body || '', canSend)}
    </Message>
  )
}
function messageHeading(
  kind: Details['messages'][number]['kind'],
  label: string,
  contact: string,
) {
  return kind === 'inbound' ? (
    <>
      <ContactAvatar name={label} email={contact} />
      {label}
    </>
  ) : (
    label
  )
}

function changeSummary(
  event: Details['events'][number],
  names: Names,
  colors: ConsoleFrame['labelColors'],
) {
  const text = timelineChange(event, names)
  const name = timelineLabel(event)
  return name ? (
    <>
      <LabelDot label={name} colors={colors} />
      {text}
    </>
  ) : (
    text
  )
}
function attachmentList(files: Files) {
  if (!files.length) return null
  return (
    <AttachmentList>
      {files.map((f) => (
        <li>
          <a
            href={'/attachment?key=' + encodeURIComponent(f.key)}
            download={f.filename}
          >
            {attachmentIcon(f)} {f.filename}
          </a>
          {f.size !== undefined && <small>{fileSize(f.size)}</small>}
        </li>
      ))}
    </AttachmentList>
  )
}
function fileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
function changeStatus(number: number, event: string, label: string) {
  return action(
    'status',
    label,
    <Input type="hidden" name="event" value={event} />,
    number,
  )
}
function threadActions(c: Details['conversation'], snooze: Child) {
  if (c.kind !== 'inquiry') return null
  const state = c.status.kind
  return (
    <>
      {(state === 'open' || state === 'pending') &&
        changeStatus(c.number, 'closed', '完了にする')}
      {state === 'closed' && changeStatus(c.number, 'reopened', '再開する')}
      {state === 'spam' &&
        changeStatus(c.number, 'unmarked_spam', '迷惑メールを解除')}
      <ActionMenu id="thread-actions" label="その他の操作">
        {snooze}
        {state === 'pending' &&
          changeStatus(c.number, 'reopened', '未対応に戻す')}
        {state !== 'spam' &&
          changeStatus(c.number, 'marked_spam', '迷惑メールにする')}
      </ActionMenu>
    </>
  )
}
function statusPicker(c: Details['conversation']) {
  const current = c.status.kind
  if (c.kind !== 'inquiry') return badge(current)
  return (
    <Popover id="thread-status" label={badge(current)}>
      <p>現在の状態 · {badge(current)}</p>
      {(current === 'open' || current === 'pending') &&
        changeStatus(c.number, 'closed', '完了にする')}
      {(current === 'closed' || current === 'pending') &&
        changeStatus(c.number, 'reopened', '未対応に戻す')}
      {current === 'spam'
        ? changeStatus(c.number, 'unmarked_spam', '迷惑メールを解除')
        : changeStatus(c.number, 'marked_spam', '迷惑メールにする')}
    </Popover>
  )
}
const eventLabels: Record<string, string> = {
  conversation_opened: '会話を開始',
  message_received: 'メールを受信',
  reply_undone: '返信の送信を取り消し',
  reply_held: '相手から新しいメッセージが届いたため、送信を止めました。',
  reply_discarded: '下書きを破棄',
  reply_drafted: '下書きを作成',
  reply_queued: '返信を送信待ちに変更',
  reply_sent: '返信を送信',
  reply_failed: '返信の送信に失敗',
  reply_approved: '返信を承認',
  reply_retried: '返信を再送',
  status_changed: '状態を変更',
  assigned: '担当者を変更',
  label_changed: 'ラベルを変更',
  note_added: '内部メモを追加',
  conversation_viewed: '会話を表示',
  operation_invoked: '操作を実行',
}
function eventActor(actor: string, names: Names) {
  try {
    const result = actorSchema.safeParse(JSON.parse(actor))
    return result.success ? actorIdentity(result.data, names) : '記録なし'
  } catch {
    return '記録なし'
  }
}
function pageAtIntake(events: Details['events']) {
  const intake = events.find((event) => event.kind === 'conversation_opened')
  if (!intake) return
  try {
    return embeddingPage(JSON.parse(intake.payload)?.sourcePage)
  } catch {
    return
  }
}
function threadContext(
  data: Details,
  panels: Child,
  now: number,
  names: Names,
  colors: ConsoleFrame['labelColors'],
  productName: string,
) {
  const sourcePage = pageAtIntake(data.events)
  return (
    <ThreadPanel context={'#' + data.conversation.number + ' · ' + productName}>
      {sourcePage && (
        <FormSection title="チャットを開いたページ">
          <p>{sourcePage}</p>
        </FormSection>
      )}
      {panels}
      <FormSection title="この相手の問い合わせ">
        {data.history.length ? (
          data.history.map((r) => (
            <p>
              <a data-context-link="" href={'/conversation/' + r.number}>
                <code>#{r.number}</code> {r.subject}
              </a>
            </p>
          ))
        ) : (
          <p>ほかの問い合わせはありません。</p>
        )}
      </FormSection>
      <details>
        <summary>操作履歴</summary>
        <RowList>
          {displayEvents(data.events).map((e) => (
            <li>
              {stamp(e.at, now)}
              <span>
                {' '}
                {changeSummary(e, names, colors) ??
                  eventLabels[e.kind] ??
                  e.kind}{' '}
                · {eventActor(e.actor, names)}
              </span>
            </li>
          ))}
        </RowList>
      </details>
    </ThreadPanel>
  )
}
function inboxBackLink(search: string, email: string) {
  if (!search)
    return (
      <ActionLink href="/" variant="ghost">
        ← 受信箱
      </ActionLink>
    )
  const view = selectedView(
    Object.fromEntries(new URLSearchParams(search)),
    email,
  )
  return (
    <ActionLink href={'/?' + search} variant="ghost">
      ← {statuses[view] ?? '受信箱'}
    </ActionLink>
  )
}

export function conversationPage(
  data: Details,
  panels: { related: Child; snooze: Child; canned: Child; feedback: Child },
  frame: ConsoleFrame,
  metadata: Awaited<ReturnType<typeof inboxMetadata>>,
  files: Files,
  articles: { title: string; url: string }[] = [],
  holds: Awaited<ReturnType<typeof pendingReplyUndos>> = [],
  offerToWrite = false,
) {
  const held = new Set(
    data.events
      .filter((e) => e.kind === 'reply_held')
      .map((e) => JSON.parse(e.payload).message),
  )
  const c = data.conversation
  const product = frame.products.find((p) => p.id === c.product)
  const sender = senderLabel(
    product?.senderName,
    product?.showOperator
      ? frame.operators.find((p) => p.email === frame.operator.email)
          ?.displayName
      : null,
  )
  const names = frame.operators
  const info = metadata.get(c.number)
  const activity =
    data.messages.findLast((m) => m.delivery === 'failed') ??
    data.messages.findLast((m) => m.delivery === 'awaiting_approval') ??
    data.messages.at(-1)
  const reply = c.kind === 'inquiry' && c.status.kind !== 'spam'
  const { next, previous } = adjacentOpen(frame.openNumbers, c.number)
  const search = frame.query.inbox ?? ''
  const main = (
    <DetailPage
      title={<ThreadSubject>{c.subject}</ThreadSubject>}
      contact={c.contact}
      toolbar={
        <ThreadToolbar>
          {inboxBackLink(search, frame.operator.email)}
          <ActionBar>
            {panels.feedback}
            <a data-mobile-reply-link="" href="#reply-area">
              {reply ? '返信欄へ' : 'メモ欄へ'}
            </a>
            <ThreadPanelTrigger />
            {threadActions(c, panels.snooze)}
            <StepLink
              previous
              href={previous ? threadUrl(previous, search) : undefined}
            />
            <StepLink href={next ? threadUrl(next, search) : undefined} />
          </ActionBar>
        </ThreadToolbar>
      }
      attributes={
        <AttributeRow>
          <code>#{c.number}</code>
          <ProductMark
            product={{ id: c.product, name: info?.productName ?? c.product }}
            size="heading"
          />
          {channelIcon(c.origin)}
          {statusPicker(c)}
          {c.kind === 'inquiry' && assignment(c, frame)}
          {labelPicker(c.number, data.labels, frame.labels, frame.labelColors)}
          {activity && <ThreadActivity message={activity} />}
        </AttributeRow>
      }
      aside={threadContext(
        data,
        panels.related,
        frame.now,
        names,
        frame.labelColors,
        product?.name ?? c.product,
      )}
    >
      <ThreadTimeline>
        {[
          ...data.messages.map((m) => ({
            at: m.created_at,
            view: message(
              m,
              data,
              files.filter((f) => f.message === m.id),
              info?.name || c.contact || '匿名',
              names,
              frame.now,
              m.delivery === 'draft' && held.has(m.id),
            ),
          })),
          ...displayEvents(data.events).flatMap((e) => {
            const label = changeSummary(e, names, frame.labelColors)
            return label
              ? [
                  {
                    at: e.at,
                    view: (
                      <TimelineEntry>
                        {eventActor(e.actor, names)} <span>{label}</span>{' '}
                        {stamp(e.at, frame.now)}
                      </TimelineEntry>
                    ),
                  },
                ]
              : []
          }),
        ]
          .sort((a, b) => a.at - b.at)
          .map((entry) => entry.view)}
      </ThreadTimeline>
      <ReplyArea templates={panels.canned}>
        {!holds.length &&
          threadNotice(frame.query.notice, c.number, frame.query.undoId)}
        {holds.map((hold) => replyUndoForm(c.number, hold))}
        {offerToWrite && (
          <form
            id="reply-article-candidate"
            method="post"
            action="/actions/articles.suggest"
            hidden
          >
            <input type="hidden" name="number" value={c.number} />
            <input type="hidden" name="topic" value={c.subject} />
          </form>
        )}
        <ReplyComposer
          number={c.number}
          mailbox={sender ? sender + ' <' + c.mailbox + '>' : c.mailbox}
          contact={c.contact}
          noteOnly={!reply}
          closed={c.status.kind === 'closed'}
          subject={replySubject(c.subject, c.number)}
          hasCanned={Boolean(panels.canned)}
          articles={articles}
          offerToWrite={offerToWrite}
        />
      </ReplyArea>
    </DetailPage>
  )
  return shell(c.subject, main, frame)
}
export { mailDocument as htmlMailPage } from '../../ui/mail-page'
