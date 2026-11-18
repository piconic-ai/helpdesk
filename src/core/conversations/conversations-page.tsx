import { threadUrl } from './inbox-location'
import { timelineChange } from './timeline'
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
} from '../../ui/patterns'
import {
  AttachmentList,
  MessageAuthor,
  MessageText,
  StepLink,
  ThreadPanel,
  ThreadTimeline,
  TimelineEntry,
} from '../../ui/thread-parts'
import { Delivery } from '../../ui/inbox-parts'
import { adjacentOpen } from './inbox-location'
import { actorIdentity } from '../operators/identity-page'
import { actorSchema } from './state'
import type {
  ConsoleFrame,
  inboxMetadata,
  threadFiles,
} from './console-usecase'
import { shell, action, badge, noteLabel, stamp } from './console-page'
import type { Result } from './inbox-page'
import { replySubject, senderLabel } from '../outbound/compose'
import {
  assignment,
  labelPicker,
  draftReview,
  threadNotice,
} from './thread-controls-page'
export { inboxPage } from './inbox-page'
export { settingsPage } from './settings-page'
export { shell } from './console-page'
const deliveries: Record<string, string> = {
  draft: '下書き',
  awaiting_approval: '承認待ち',
  queued: '送信待ち',
  sent: '送信済み',
  failed: '送信失敗',
}
type Names = ConsoleFrame['operators']
type Details = Result<'get'>
type Files = Awaited<ReturnType<typeof threadFiles>>
function message(
  m: Details['messages'][number],
  data: Details,
  files: Files,
  name: string,
  names: Names,
  now: number,
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
          <h2>{label}</h2>
          {stamp(m.created_at, now)}
        </>
      }
    >
      <MessageAuthor>
        {m.kind === 'inbound' ? (
          <code>{c.contact}</code>
        ) : (
          <span>{actorIdentity(m.actor, names)}</span>
        )}
        {m.delivery && (
          <Delivery state={m.delivery}>{deliveries[m.delivery]}</Delivery>
        )}
      </MessageAuthor>
      {m.body && (!draft || !canSend) && <MessageText>{m.body}</MessageText>}
      {m.html && (
        <>
          <p>外部の画像は非表示です。</p>
          <iframe
            sandbox=""
            title="HTML メール"
            src={'/mail/' + encodeURIComponent(m.id)}
          />
        </>
      )}
      {attachmentList(files)}
      {m.reason && <Notice kind="error">{m.reason}</Notice>}
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
            {f.filename}
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
function threadActions(c: Details['conversation']) {
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
        <div data-extension-commands=""></div>
        <ActionLink variant="ghost" href="#related-info">
          会話の関連情報
        </ActionLink>
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
function threadContext(
  data: Details,
  panels: Child,
  now: number,
  names: Names,
) {
  return (
    <ThreadPanel>
      {panels}
      <FormSection title="この相手の問い合わせ">
        {data.history.length ? (
          data.history.map((r) => (
            <p>
              <ActionLink variant="ghost" href={'/conversation/' + r.number}>
                <code>#{r.number}</code> {r.subject}
              </ActionLink>
            </p>
          ))
        ) : (
          <p>ほかの問い合わせはありません。</p>
        )}
      </FormSection>
      <details>
        <summary>操作履歴</summary>
        <ul>
          {data.events.map((e) => (
            <li>
              {stamp(e.at, now)}
              <span>
                {' '}
                {eventLabels[e.kind] ?? e.kind} · {eventActor(e.actor, names)}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </ThreadPanel>
  )
}
export function conversationPage(
  data: Details,
  panels: Child,
  frame: ConsoleFrame,
  metadata: Awaited<ReturnType<typeof inboxMetadata>>,
  files: Files,
  articles: { title: string; url: string }[] = [],
) {
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
  const reply = c.kind === 'inquiry' && c.status.kind !== 'spam'
  const { next, previous } = adjacentOpen(frame.openNumbers, c.number)
  const search = frame.query.inbox ?? ''
  const main = (
    <DetailPage
      title={c.subject}
      contact={c.contact}
      back={{ label: '受信箱', href: search ? '/?' + search : '/' }}
      action={
        <ActionBar>
          {threadActions(c)}
          <StepLink
            previous
            href={previous ? threadUrl(previous, search) : undefined}
          />
          <StepLink href={next ? threadUrl(next, search) : undefined} />
        </ActionBar>
      }
      attributes={
        <AttributeRow>
          <code>#{c.number}</code>
          <span>{info?.productName ?? c.product}</span>
          {statusPicker(c)}
          {c.kind === 'inquiry' && assignment(c, frame)}
          {labelPicker(c.number, data.labels, frame.labels)}
        </AttributeRow>
      }
      aside={threadContext(data, panels, frame.now, names)}
    >
      {threadNotice(frame.query.notice, c.number, frame.query.undoId)}
      <ThreadTimeline>
        {[
          ...data.messages.map((m) => ({
            at: m.created_at,
            view: message(
              m,
              data,
              files.filter((f) => f.message === m.id),
              info?.name || c.contact,
              names,
              frame.now,
            ),
          })),
          ...data.events.flatMap((e) => {
            const label = timelineChange(e, names)
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
      <ReplyComposer
        number={c.number}
        mailbox={sender ? sender + ' <' + c.mailbox + '>' : c.mailbox}
        contact={c.contact}
        noteOnly={!reply}
        closed={c.status.kind === 'closed'}
        subject={replySubject(c.subject, c.number)}
        articles={articles}
      />
    </DetailPage>
  )
  return shell(c.subject, main, frame)
}
export { mailDocument as htmlMailPage } from '../../ui/mail-page'
