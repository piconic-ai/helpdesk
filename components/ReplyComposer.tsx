'use client'

import { createSignal } from '@barefootjs/client'
import { TabsList, TabsTrigger } from './PatternTabs'

interface ReplyComposerProps {
  number: number
  mailbox: string
  contact: string
  subject?: string
  articles?: { title: string; url: string }[]
  offerToWrite?: boolean
  closed?: boolean
  noteOnly?: boolean
}
function submitLabel(note: boolean, sending: boolean) {
  if (note) return sending ? '保存中…' : 'メモを残す'
  return sending ? '送信中…' : '送信'
}
function hasReplyReceipt(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    value.id.length > 0
  )
}
function replyRejection(status: number | null) {
  switch (status) {
    case 400:
    case 422:
      return '返信を受け付けられませんでした。本文を保持しました。送信内容を確認してください。'
    case 401:
    case 403:
      return '返信に必要な権限を確認できませんでした。本文を保持しました。ログイン状態と送信権限を確認してください。'
    case 404:
      return '会話が見つからないため、返信を受け付けられませんでした。本文を保持しました。'
  }
}

export function ReplyComposer(props: ReplyComposerProps) {
  const [replyBody, setReplyBody] = createSignal('')
  const [preview, setPreview] = createSignal(false)
  const [note, setNote] = createSignal(props.noteOnly ?? false)
  const [sending, setSending] = createSignal(false)
  const [failureStatus, setFailureStatus] = createSignal<number | null>(null)

  const [closed, setClosed] = createSignal(props.closed ?? false)
  const [reopenFailed, setReopenFailed] = createSignal(false)
  const [query, setQuery] = createSignal('')
  let reopening: Promise<boolean> | undefined

  async function reopen() {
    try {
      await fetch('/actions/status', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams({
          number: String(props.number),
          event: 'reopened',
        }),
      })
      const refreshed = await fetch(
        '/conversation/' + props.number + '?notice=reopened',
      )
      if (!refreshed.ok) throw new Error('Unavailable conversation')
      const documentCopy = new DOMParser().parseFromString(
        await refreshed.text(),
        'text/html',
      )
      const header = documentCopy.querySelector('.thread-header')
      if (!header || !header.querySelector('.status-open, .status-pending'))
        throw new Error('Reopen failed')
      document.querySelector('.thread-header')?.replaceWith(header)
      setClosed(false)
      setReopenFailed(false)
      return true
    } catch {
      setReopenFailed(true)
      return false
    } finally {
      reopening = undefined
    }
  }
  function writeReply(value: string, restoring: boolean) {
    setReplyBody(value)
    if (!restoring && value.trim() && closed() && !reopening)
      reopening = reopen()
  }
  function togglePreview(event: MouseEvent) {
    const form =
      event.target instanceof Element ? event.target.closest('form') : null
    const field = form?.querySelector('textarea[data-draft-slot="reply"]')
    if (field instanceof HTMLTextAreaElement) setReplyBody(field.value)
    setPreview(!preview())
  }
  function attachArticle(event: MouseEvent) {
    const button =
      event.target instanceof Element
        ? event.target.closest('button[data-url]')
        : null
    if (!(button instanceof HTMLButtonElement) || !button.dataset.url) return
    const area = button.form?.querySelector('textarea:not(:disabled)')
    if (!(area instanceof HTMLTextAreaElement)) return
    const url = new URL(button.dataset.url, location.origin)
    const presentation = url.searchParams.get('suggestion')
    if (presentation)
      void fetch('/conversation/' + props.number + '/article-selection', {
        method: 'POST',
        body: new URLSearchParams({
          presentation,
          article: decodeURIComponent(url.pathname.split('/').at(-1) ?? ''),
        }),
        keepalive: true,
      }).catch(() => undefined)
    area.value = [
      area.value.trimEnd(),
      button.textContent?.trim() + '\n' + url.href,
    ]
      .filter(Boolean)
      .join('\n\n')
    area.dispatchEvent(new Event('input', { bubbles: true }))
    button.closest<HTMLElement>('[popover]')?.hidePopover()
    setQuery('')
    area.focus()
  }
  async function submit(event: SubmitEvent) {
    const form = event.currentTarget
    if (!(form instanceof HTMLFormElement)) return
    event.preventDefault()
    if (sending() || !form.reportValidity()) return
    const isNote = note()
    const submittedFields = new FormData(form, event.submitter)
    const operation = isNote
      ? 'note'
      : submittedFields.has('close')
        ? 'replyAndClose'
        : 'reply'
    const fields = new URLSearchParams({
      number: String(props.number),
      body: String(submittedFields.get('body') ?? ''),
    })
    setSending(true)
    setFailureStatus(null)
    try {
      if (!isNote && closed() && !(await (reopening ?? reopen()))) {
        setSending(false)
        return
      }
      const response = await fetch('/actions/' + operation, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fields,
      })
      if (!response.ok) {
        setFailureStatus(response.status)
        setSending(false)
        return
      }
      const receipt = await response.json()
      if (!isNote && !hasReplyReceipt(receipt))
        throw new Error('Missing submission receipt')
      const submitted = form.querySelector('textarea:not(:disabled)')
      if (submitted instanceof HTMLTextAreaElement) {
        submitted.value = ''
        submitted.dispatchEvent(new Event('input', { bubbles: true }))
      }
      location.assign('/conversation/' + props.number + '?notice=' + operation)
    } catch {
      setFailureStatus(0)
      setSending(false)
    }
  }
  return (
    <form
      className={note() ? 'composer composer-note' : 'composer'}
      action={note() ? '/actions/note' : '/actions/reply'}
      method="post"
      onSubmit={submit}
      aria-busy={sending()}
      data-contact={props.contact}
      aria-label="メッセージの作成"
    >
      <input type="hidden" name="number" value={props.number} />
      <div hidden={props.noteOnly}>
        <TabsList className="composer-tabs" aria-label="メッセージの種類">
          <TabsTrigger
            value="reply"
            className="filter-tab"
            selected={!note()}
            disabled={sending()}
            onClick={() => {
              setNote(false)
              setFailureStatus(null)
            }}
          >
            返信
          </TabsTrigger>
          <TabsTrigger
            value="note"
            className="filter-tab"
            selected={note()}
            disabled={sending()}
            onClick={() => {
              setNote(true)
              setFailureStatus(null)
            }}
          >
            内部メモ
          </TabsTrigger>
        </TabsList>
      </div>
      <p className="note-caption" hidden={!note()}>
        内部メモ（相手には送られません）
      </p>
      <p hidden={!closed() || note()}>
        返信するには再開します。入力すると、この会話を再開します。
      </p>
      <p className="banner-error" role="alert" hidden={!reopenFailed()}>
        会話を再開できませんでした。状態を確認して、もう一度お試しください。
      </p>
      <label className="composer-field" hidden={note()}>
        <span className="sr-only">返信</span>
        <textarea
          name="body"
          rows={4}
          required
          maxlength={100000}
          disabled={note()}
          readonly={sending()}
          data-draft-slot="reply"
          placeholder="返信を入力"
          onInput={(event) =>
            writeReply(
              event.target.value,
              event.target.hasAttribute('data-restoring-draft'),
            )
          }
        />
      </label>
      <label className="composer-field" hidden={!note()}>
        <span className="sr-only">内部メモ</span>
        <textarea
          name="body"
          rows={4}
          required
          maxlength={100000}
          disabled={!note()}
          readonly={sending()}
          data-draft-slot="note"
          placeholder="チームに残すメモを入力"
        />
      </label>
      {props.offerToWrite && (
        <button
          type="submit"
          form="reply-article-candidate"
          className="button-secondary"
          hidden={note()}
        >
          記事の候補に追加
        </button>
      )}
      <div hidden={note() || !props.articles?.length}>
        <button
          type="button"
          className="button-quiet"
          {...{ popovertarget: 'reply-articles' }}
          disabled={sending()}
          aria-controls="reply-articles"
        >
          記事を添える
        </button>
        <section
          id="reply-articles"
          className="settings-card article-popover"
          {...{ popover: 'auto' }}
        >
          <label>
            記事の題名で検索
            <input
              type="search"
              autofocus
              value={query()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault()
              }}
              onInput={(event) => setQuery(event.target.value)}
            />
          </label>
          <ul className="article-choices">
            {(props.articles ?? []).map((article) => (
              <li
                key={article.url}
                hidden={
                  !article.title
                    .toLocaleLowerCase()
                    .includes(query().trim().toLocaleLowerCase())
                }
              >
                <button
                  type="button"
                  className="button-quiet"
                  data-url={article.url}
                  disabled={sending()}
                  onClick={attachArticle}
                >
                  {article.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section
        className="settings-card reply-preview"
        role="region"
        aria-label="返信のプレビュー"
        hidden={!preview() || note()}
      >
        <h2>返信のプレビュー</h2>
        <dl>
          <dt>差出人</dt>
          <dd>
            <code>{props.mailbox}</code>
          </dd>
          <dt>宛先</dt>
          <dd>
            <code>{props.contact}</code>
          </dd>
          <dt>件名</dt>
          <dd>{props.subject}</dd>
        </dl>
        <pre className="message-body">{replyBody()}</pre>
      </section>
      <p
        className="banner-error"
        role="alert"
        hidden={failureStatus() === null}
      >
        {note()
          ? 'メモを保存できませんでした。本文を確認して、もう一度お試しください。'
          : (replyRejection(failureStatus()) ??
            '送信結果を確認できませんでした。本文を保持しました。もう一度送る前に、最新の会話を確認してください。')}
        <a
          hidden={note() || Boolean(replyRejection(failureStatus()))}
          href={'/conversation/' + props.number + '#thread-messages'}
          target="_blank"
          rel="noopener"
        >
          別のタブで送信結果を確認
        </a>
      </p>
      <div className="composer-footer">
        <p className="composer-addresses" hidden={note()}>
          差出人: <code>{props.mailbox}</code> → 宛先:{' '}
          <code>{props.contact}</code>
        </p>
        <div className="composer-actions">
          <button
            type="button"
            className="button-quiet"
            hidden={note()}
            aria-expanded={preview()}
            onClick={togglePreview}
          >
            プレビュー
          </button>
          <button
            type="submit"
            name="close"
            formaction="/actions/replyAndClose"
            className="button-secondary"
            hidden={note()}
            disabled={sending()}
          >
            送信して完了
          </button>
          <button
            type="submit"
            className={props.noteOnly ? 'button-secondary' : 'button-primary'}
            disabled={sending()}
          >
            {submitLabel(note(), sending())}
          </button>
        </div>
      </div>
    </form>
  )
}
