import { threadUrl } from './inbox-location'
import { timelineChange } from './timeline'
import { ReplyComposer } from '@/components/ReplyComposer'
import type { Child } from 'hono/jsx'
import { html, raw } from 'hono/html'
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
    <article className={'message-' + m.kind}>
      <header className="message-header">
        <h2>{label}</h2>
        {stamp(m.created_at, now)}
      </header>
      <div className="message-author">
        {m.kind === 'inbound' ? (
          <code>{c.contact}</code>
        ) : (
          <span>{actorIdentity(m.actor, names)}</span>
        )}
        {m.delivery && (
          <span className={'delivery-' + m.delivery.replaceAll('_', '-')}>
            {deliveries[m.delivery]}
          </span>
        )}
      </div>
      {m.body && (!draft || !canSend) && (
        <p className="message-body">{m.body}</p>
      )}
      {m.html && (
        <>
          <p className="mail-privacy">外部の画像は非表示です。</p>
          <iframe
            sandbox=""
            title="HTML メール"
            src={'/mail/' + encodeURIComponent(m.id)}
          />
        </>
      )}
      {attachmentList(files)}
      {m.reason && <p className="banner-error">{m.reason}</p>}
      {canSend &&
        m.delivery === 'failed' &&
        !data.uncertain.includes(m.id) &&
        action(
          'retry',
          '再送',
          <input type="hidden" name="id" value={m.id} />,
          c.number,
        )}
      {draft && draftReview(m.id, c.number, m.body || '', canSend)}
    </article>
  )
}
function attachmentList(files: Files) {
  if (!files.length) return null
  return (
    <ul className="attachments">
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
    </ul>
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
    <input type="hidden" name="event" value={event} />,
    number,
  )
}
function threadActions(c: Details['conversation']) {
  if (c.kind !== 'inquiry') return null
  const state = c.status.kind
  return (
    <div className="page-actions">
      {(state === 'open' || state === 'pending') &&
        changeStatus(c.number, 'closed', '完了にする')}
      {state === 'closed' && changeStatus(c.number, 'reopened', '再開する')}
      {state === 'spam' &&
        changeStatus(c.number, 'unmarked_spam', '迷惑メールを解除')}
      <details className="action-menu">
        <summary className="button-secondary">その他の操作</summary>
        <div>
          <div data-extension-commands=""></div>
          <a href="#related-info">会話の関連情報</a>
          {state === 'pending' &&
            changeStatus(c.number, 'reopened', '未対応に戻す')}
          {state !== 'spam' &&
            changeStatus(c.number, 'marked_spam', '迷惑メールにする')}
        </div>
      </details>
    </div>
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
    <aside
      className="context-panel"
      id="related-info"
      aria-label="会話の関連情報"
    >
      <div className="context-cards">
        {panels}
        <section className="settings-card">
          <h2>この相手の問い合わせ</h2>
          {data.history.length ? (
            data.history.map((r) => (
              <p>
                <a href={'/conversation/' + r.number}>
                  <code>#{r.number}</code> {r.subject}
                </a>
              </p>
            ))
          ) : (
            <p>ほかの問い合わせはありません。</p>
          )}
        </section>
        <details className="settings-card">
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
      </div>
    </aside>
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
  const position = frame.openNumbers.indexOf(c.number)
  const candidate = frame.openNumbers[position + 1] ?? frame.openNumbers[0]
  const next = candidate === c.number ? undefined : candidate
  const main = (
    <div className="thread-layout">
      <div className="thread-main">
        <header className="thread-header" data-contact={c.contact}>
          <a
            className="back-link"
            href={frame.query.inbox ? '/?' + frame.query.inbox : '/'}
          >
            &larr; 受信箱
          </a>
          {threadNotice(frame.query.notice, c.number, frame.query.undoId)}
          <div className="page-header">
            <h1 className="page-title">{c.subject}</h1>
          </div>
          <div className="thread-meta">
            <code>#{c.number}</code>
            <span>{info?.productName ?? c.product}</span>
            {badge(c.status.kind)}
            {c.kind === 'inquiry' && assignment(c, frame)}
            {labelPicker(c.number, data.labels, frame.labels)}
          </div>
          <nav className="thread-navigation" aria-label="会話の操作">
            {threadActions(c)}
            {next && (
              <a href={threadUrl(next, frame.query.inbox ?? '')}>
                次の未対応へ
              </a>
            )}
          </nav>
        </header>
        <section className="message-list" aria-label="メッセージ">
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
                        <p className="timeline-entry">
                          {eventActor(e.actor, names)} <span>{label}</span>{' '}
                          {stamp(e.at, frame.now)}
                        </p>
                      ),
                    },
                  ]
                : []
            }),
          ]
            .sort((a, b) => a.at - b.at)
            .map((entry) => entry.view)}
        </section>
        <ReplyComposer
          number={c.number}
          mailbox={sender ? sender + ' <' + c.mailbox + '>' : c.mailbox}
          contact={c.contact}
          noteOnly={!reply}
          closed={c.status.kind === 'closed'}
          subject={replySubject(c.subject, c.number)}
          articles={articles}
        />
      </div>
      {threadContext(data, panels, frame.now, names)}
    </div>
  )
  return shell(c.subject, main, frame)
}
// Only sanitized mail from readHtml may enter this isolated document.
export function htmlMailPage(body: string) {
  return html`<!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <title>HTML メール</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className="mail-document">
        <main>${raw(body)}</main>
      </body>
    </html>`
}
