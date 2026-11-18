'use client'

import { createSignal } from '@barefootjs/client'

interface ReplyComposerProps {
  number: number
  mailbox: string
  contact: string
  noteOnly?: boolean
}
export function ReplyComposer(props: ReplyComposerProps) {
  const [replyBody, setReplyBody] = createSignal('')
  const [preview, setPreview] = createSignal(false)
  const [note, setNote] = createSignal(props.noteOnly ?? false)
  const [sending, setSending] = createSignal(false)
  const [failed, setFailed] = createSignal(false)

  async function submit(event: SubmitEvent) {
    const form = event.currentTarget
    if (!(form instanceof HTMLFormElement)) return
    event.preventDefault()
    if (sending() || !form.reportValidity()) return
    const fields = new URLSearchParams({
      number: String(props.number),
      body: String(new FormData(form).get('body') ?? ''),
    })
    setSending(true)
    setFailed(false)
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fields,
      })
      if (!response.ok) throw new Error('Submission failed')
      location.assign('/conversation/' + props.number)
    } catch {
      setFailed(true)
      setSending(false)
    }
  }
  return (
    <form
      className={note() ? 'composer composer-note' : 'composer'}
      action={note() ? '/actions/note' : '/actions/reply'}
      method="post"
      onSubmit={submit}
      aria-label="メッセージの作成"
    >
      <input type="hidden" name="number" value={props.number} />
      <div
        className="composer-tabs"
        role="group"
        aria-label="メッセージの種類"
        hidden={props.noteOnly}
      >
        <button
          type="button"
          className="filter-tab"
          aria-pressed={!note()}
          disabled={sending()}
          onClick={() => {
            setNote(false)
            setFailed(false)
          }}
        >
          返信
        </button>
        <button
          type="button"
          className="filter-tab"
          aria-pressed={note()}
          disabled={sending()}
          onClick={() => {
            setNote(true)
            setFailed(false)
          }}
        >
          内部メモ
        </button>
      </div>
      <p className="note-caption" hidden={!note()}>
        内部メモ（相手には送られません）
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
          placeholder="返信を入力"
          onInput={(event) => setReplyBody(event.target.value)}
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
          placeholder="チームに残すメモを入力"
        />
      </label>
      <pre className="message-body" hidden={!preview() || note()}>
        {replyBody()}
      </pre>
      <p className="banner-error" role="alert" hidden={!failed()}>
        {note()
          ? 'メモを保存できませんでした。本文を確認して、もう一度お試しください。'
          : '送信できませんでした。本文は保持されています。送信履歴を確認してから、もう一度お試しください。'}
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
            onClick={() => setPreview(!preview())}
          >
            プレビュー
          </button>
          <button type="submit" className="button-primary" disabled={sending()}>
            {sending()
              ? note()
                ? '保存中…'
                : '送信中…'
              : note()
                ? 'メモを残す'
                : '送信'}
          </button>
        </div>
      </div>
    </form>
  )
}
