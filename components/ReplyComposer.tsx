'use client'

import { navigate } from '@barefootjs/router'
import { createSignal, onMount } from '@barefootjs/client'
import { jsonMutation } from '../src/browser/local-requests.js'
import type { CannedChoice } from '../src/extensions/canned/suggestions'
import { TabsList, TabsTrigger } from './PatternTabs'

type SelectedTemplate = CannedChoice & {
  use: string
}

function isCannedChoice(value: unknown): value is CannedChoice {
  return (
    value !== null &&
    typeof value === 'object' &&
    'kind' in value &&
    value.kind === 'canned' &&
    'id' in value &&
    typeof value.id === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'body' in value &&
    typeof value.body === 'string' &&
    'presentation' in value &&
    typeof value.presentation === 'string'
  )
}

function readTemplateSelections(area: HTMLTextAreaElement): SelectedTemplate[] {
  try {
    const stored: unknown = JSON.parse(area.dataset.cannedSelections ?? '[]')
    return Array.isArray(stored)
      ? stored.filter(
          (item): item is SelectedTemplate =>
            isCannedChoice(item) &&
            'use' in item &&
            typeof item.use === 'string',
        )
      : []
  } catch {
    return []
  }
}

interface ThreadUpdates {
  number: number
  saved(target: string): Promise<void>
}
function currentThread(number: number) {
  const thread = (window as Window & { helpdeskThread?: ThreadUpdates })
    .helpdeskThread
  return thread?.number === number ? thread : undefined
}

interface ReplyComposerProps {
  number: number
  mailbox: string
  contact: string
  subject?: string
  hasCanned?: boolean
  articles?: { title: string; url: string; excerpt?: string }[]
  offerToWrite?: boolean
  closed?: boolean
  noteOnly?: boolean
}
function suggestedArticles(articles: ReplyComposerProps['articles'] = []) {
  return articles.filter((article) => article.url.includes('?suggestion='))
}
function revealFirstLine(event: KeyboardEvent) {
  const toStart =
    (event.ctrlKey && event.key === 'Home') ||
    (event.metaKey && event.key === 'ArrowUp')
  const field = event.target
  if (
    toStart &&
    field instanceof HTMLTextAreaElement &&
    field.selectionEnd === 0
  )
    field.scrollTop = 0
}
function showSuggestions(note: boolean, articles: number, templates: number) {
  return !note && (articles > 0 || templates > 0)
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

function submissionErrorText(status: number | null, isNote: boolean) {
  return isNote
    ? 'メモを保存できませんでした。本文を確認して、もう一度お試しください。'
    : (replyRejection(status) ??
        '送信結果を確認できませんでした。本文を保持しました。もう一度送る前に、最新の会話を確認してください。')
}

export function ReplyComposer(props: ReplyComposerProps) {
  const [interactive, setInteractive] = createSignal(false)
  const [suggestedTemplates, setSuggestedTemplates] = createSignal<
    CannedChoice[]
  >([])
  const articleSuggestions = suggestedArticles(props.articles)
  const cannedPath = '/conversation/' + props.number + '/canned-'
  onMount(() => {
    setInteractive(true)
    const form = document
      .querySelector(
        '.composer input[name="number"][value="' + props.number + '"]',
      )
      ?.closest('form')
    form?.addEventListener('helpdesk:thread-state', (event) => {
      setClosed((event as CustomEvent<{ closed: boolean }>).detail.closed)
    })
    if (props.hasCanned && !props.noteOnly) void loadTemplates()
  })

  async function loadTemplates() {
    try {
      for (let attempt = 0; attempt < 10; attempt++) {
        const response = await fetch(cannedPath + 'suggestions')
        if (response.status === 202) {
          await new Promise((resolve) => setTimeout(resolve, 250))
          continue
        }
        if (response.ok) {
          const choices: unknown = await response.json()
          if (Array.isArray(choices) && choices.every(isCannedChoice))
            setSuggestedTemplates(choices)
        }
        return
      }
    } catch {
      return
    }
  }

  function recordTemplate(
    item: SelectedTemplate,
    action: 'selected' | 'unchanged' | 'edited',
  ) {
    void fetch(cannedPath + 'selection', {
      method: 'POST',
      body: new URLSearchParams({
        id: item.use,
        presentation: item.presentation,
        template: item.id,
        action,
      }),
      keepalive: true,
    }).catch(() => undefined)
  }

  function insertTemplate(event: MouseEvent) {
    const button =
      event.target instanceof Element
        ? event.target.closest('button[data-template]')
        : null
    if (!(button instanceof HTMLButtonElement)) return
    const item = suggestedTemplates().find(
      ({ id }) => id === button.dataset.template,
    )
    const area = button.form?.querySelector('textarea[data-draft-slot="reply"]')
    if (!item || !(area instanceof HTMLTextAreaElement) || area.readOnly) return
    const body = item.body.replace(/\r\n?/g, '\n')
    if (area.value.length + body.length > area.maxLength) return
    area.focus()
    const position = area.selectionStart
    area.setRangeText(body, position, position, 'end')
    const selected = { ...item, body, use: crypto.randomUUID() }
    area.dataset.cannedSelections = JSON.stringify([
      ...readTemplateSelections(area),
      selected,
    ])
    area.dispatchEvent(new Event('input', { bubbles: true }))
    recordTemplate(selected, 'selected')
  }
  const [replyBody, setReplyBody] = createSignal('')
  const [preview, setPreview] = createSignal(false)
  const [note, setNote] = createSignal(props.noteOnly ?? false)
  const [sending, setSending] = createSignal(false)
  const [unknownReply, setUnknownReply] = createSignal(false)
  const awaitingResult = () => unknownReply() && !note()
  const [failureStatus, setFailureStatus] = createSignal<number | null>(null)

  const [closed, setClosed] = createSignal(props.closed ?? false)
  const [reopenFailed, setReopenFailed] = createSignal(false)
  const [query, setQuery] = createSignal('')
  let reopening: Promise<boolean> | undefined

  async function reopen() {
    try {
      const thread = currentThread(props.number)
      const data = new URLSearchParams({
        number: String(props.number),
        event: 'reopened',
      })
      await jsonMutation('/actions/status', data, {
        accept: 'application/json',
      })
      if (thread) {
        const url = new URL(location.href)
        url.searchParams.set('notice', 'reopened')
        await thread.saved(url.href)
      }
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
  function submissionFailed(status: number, isNote: boolean) {
    if (!isNote && !replyRejection(status)) setUnknownReply(true)
    setFailureStatus(status)
    setSending(false)
  }
  function selectMode(isNote: boolean) {
    setNote(isNote)
    setFailureStatus(!isNote && unknownReply() ? 0 : null)
  }
  function recordSubmittedTemplates(area: HTMLTextAreaElement) {
    const submitted = area.value.replace(/\r\n?/g, '\n')
    const lastMatched = new Map<string, number>()
    const selections = readTemplateSelections(area)
    delete area.dataset.cannedSelections
    for (const item of selections) {
      const position = submitted.indexOf(
        item.body,
        lastMatched.get(item.body) ?? 0,
      )
      if (position >= 0) lastMatched.set(item.body, position + item.body.length)
      recordTemplate(item, position >= 0 ? 'unchanged' : 'edited')
    }
  }
  function finishSubmission(
    form: HTMLFormElement,
    operation: string,
    body: string,
  ) {
    const submitted = form.querySelector(
      operation === 'note'
        ? 'textarea[data-draft-slot=note]'
        : 'textarea[data-draft-slot=reply]',
    )
    if (submitted instanceof HTMLTextAreaElement && submitted.value === body) {
      if (operation !== 'note') recordSubmittedTemplates(submitted)
      submitted.value = ''
      submitted.dispatchEvent(new Event('input', { bubbles: true }))
      if (operation === 'note' && !props.noteOnly) setNote(false)
    }
    setSending(false)
    setPreview(false)
    if (form.isConnected) {
      const url = new URL(location.href)
      url.searchParams.set('notice', operation)
      const thread = currentThread(props.number)
      if (thread) void thread.saved(url.href)
      else void navigate(url.href)
    }
  }
  async function submit(event: SubmitEvent) {
    const form = event.currentTarget
    if (!(form instanceof HTMLFormElement)) return
    event.preventDefault()
    if (sending() || awaitingResult() || !form.reportValidity()) return
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
      const receipt = await jsonMutation('/actions/' + operation, fields, {
        accept: 'application/json',
      })
      if (!isNote && !hasReplyReceipt(receipt))
        throw new Error('Missing submission receipt')
      finishSubmission(form, operation, fields.get('body') ?? '')
    } catch (error) {
      submissionFailed(
        Number((error as { status?: number })?.status) || 0,
        isNote,
      )
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
            onClick={() => selectMode(false)}
          >
            返信
          </TabsTrigger>
          <TabsTrigger
            value="note"
            className="filter-tab"
            selected={note()}
            disabled={sending()}
            onClick={() => selectMode(true)}
          >
            内部メモ
          </TabsTrigger>
        </TabsList>
        <button
          type="button"
          className="button-quiet"
          data-expand-reply=""
          aria-controls="reply-controls"
        >
          返信の操作を開く
        </button>
      </div>
      <p className="note-caption" hidden={!note()}>
        内部メモ（相手には送られません）
      </p>
      <p hidden={!closed() || note()}>
        返信するには再開します。入力すると、この会話を再開します。
      </p>
      <p
        data-toast=""
        className="banner-error"
        role="alert"
        hidden={!reopenFailed()}
      >
        会話を再開できませんでした。状態を確認して、もう一度お試しください。
      </p>
      <section
        className="reply-suggestions"
        aria-label="返信の候補"
        hidden={
          !showSuggestions(
            note(),
            articleSuggestions.length,
            suggestedTemplates().length,
          )
        }
      >
        <div hidden={!articleSuggestions.length}>
          <span>記事</span>
          {articleSuggestions.map((article) => (
            <button
              key={article.url}
              type="button"
              className="button-quiet"
              data-url={article.url}
              disabled={!interactive() || sending()}
              onClick={attachArticle}
            >
              {article.title}
            </button>
          ))}
        </div>
        <div hidden={!suggestedTemplates().length}>
          <span>定型文</span>
          {suggestedTemplates().map((item) => (
            <button
              key={item.id}
              type="button"
              className="button-quiet"
              data-template={item.id}
              disabled={sending()}
              onClick={insertTemplate}
            >
              {item.title}
            </button>
          ))}
        </div>
      </section>
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
          onKeyUp={revealFirstLine}
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
        <div hidden={note()} className="candidate-offer">
          <p>この問い合わせに合う記事の候補はまだありません。</p>
          <button
            type="submit"
            form="reply-article-candidate"
            className="button-secondary"
            hidden={note()}
          >
            この件名を記事候補にする
          </button>
        </div>
      )}
      <section
        className="settings-card reply-preview"
        role="region"
        aria-label="返信のプレビュー"
        hidden={!preview() || note()}
      >
        <div data-ui="actions">
          <h2>返信のプレビュー</h2>
          <button
            type="button"
            className="button-quiet"
            onClick={(event) => {
              if (!(event.currentTarget instanceof HTMLButtonElement)) return
              const field =
                event.currentTarget.form?.querySelector<HTMLTextAreaElement>(
                  'textarea[data-draft-slot="reply"]',
                )
              setPreview(false)
              requestAnimationFrame(() => field?.focus())
            }}
          >
            編集に戻る
          </button>
        </div>
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
        data-toast=""
        className="banner-error"
        role="alert"
        hidden={failureStatus() === null}
      >
        {submissionErrorText(failureStatus(), note())}
        <a
          hidden={note() || Boolean(replyRejection(failureStatus()))}
          href={'/conversation/' + props.number + '#thread-messages'}
          target="_blank"
          rel="noopener"
        >
          別のタブで送信結果を確認
        </a>
      </p>
      <div className="composer-footer" id="reply-controls">
        <p className="composer-addresses" hidden={note()}>
          差出人: <code>{props.mailbox}</code> → 宛先:{' '}
          <code>{props.contact}</code>
        </p>
        <div className="composer-tools">
          <div className="composer-inserts">
            <div hidden={note() || !props.articles?.length}>
              <button
                type="button"
                className="button-quiet"
                {...{ popovertarget: 'reply-articles' }}
                disabled={!interactive() || sending()}
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
                      {article.excerpt && <p>{article.excerpt}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            {props.hasCanned && (
              <button
                type="button"
                hidden={note()}
                className="button-quiet"
                {...{ popovertarget: 'reply-templates' }}
                aria-controls="reply-templates"
                aria-expanded="false"
              >
                定型文を選ぶ
              </button>
            )}
          </div>
          <div className="composer-actions">
            <button
              type="button"
              className="button-quiet"
              hidden={note()}
              aria-expanded={preview()}
              disabled={!interactive()}
              onClick={togglePreview}
            >
              プレビュー
            </button>
            <button
              type="submit"
              name="close"
              formaction="/actions/replyAndClose"
              className="button-secondary"
              hidden={note() || awaitingResult()}
              disabled={sending()}
            >
              送信して完了
            </button>
            <button
              type="submit"
              className={props.noteOnly ? 'button-secondary' : 'button-primary'}
              hidden={awaitingResult()}
              disabled={sending()}
            >
              {submitLabel(note(), sending())}
            </button>
            <button
              type="button"
              className="button-primary"
              hidden={!awaitingResult()}
              onClick={() => location.reload()}
            >
              最新の会話を読み直す
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
