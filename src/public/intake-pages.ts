import { html } from 'hono/html'
import type { IntakePolicy } from '../core/intakes/intake'
export type FormKind = 'form' | 'chat' | 'feedback'
export type Fields = Record<string, string>
const titles = {
  form: 'お問い合わせ',
  chat: 'ヘルプチャット',
  feedback: 'フィードバック',
}
function emailInput(value: string | undefined) {
  return html`<label
    >連絡先メールアドレス<input
      name="email"
      type="email"
      autocomplete="email"
      required
      value="${value ?? ''}"
  /></label>`
}
const bodyFields = {
  form: { name: 'body', label: 'お問い合わせ内容', limit: 100000 },
  feedback: { name: 'body', label: 'ご意見・ご要望', limit: 100000 },
  chat: { name: 'question', label: '質問', limit: 30000 },
}

function messageInput(kind: FormKind, fields: Fields) {
  const field = bodyFields[kind]
  return html`<label
    >${field.label}
    <textarea name="${field.name}" rows="4" required maxlength="${field.limit}">
${fields[field.name] ?? ''}</textarea>
  </label>`
}

function challenge(policy: IntakePolicy) {
  return policy.turnstileSecretBinding && policy.turnstileSiteKey
    ? html`<div
        class="cf-turnstile"
        data-sitekey="${policy.turnstileSiteKey}"
      ></div>`
    : ''
}

export function intakePage(
  kind: FormKind,
  policy: IntakePolicy,
  fields: Fields = {},
  requestContact = false,
  error = '',
) {
  const chat = kind === 'chat'
  const search = chat && !requestContact
  const heading = titles[kind]
  return {
    title: heading,
    html: String(
      html`<h1>${heading}</h1>
        ${error ? html`<div class="banner-error" role="alert">${error}</div>` : ''}
        <form method="post" class="public-form">
          <input type="hidden" name="publicKey" value="${policy.publicKey}" />
          ${kind === 'form' ? html`<label>件名<input name="subject" required maxlength="500" value="${fields.subject ?? ''}" /></label>` : ''}
          ${messageInput(kind, fields)}
          ${
            chat && requestContact
              ? html`<input type="hidden" name="handoff" value="yes" />
                  <p>担当者から返信するための連絡先を入力してください。</p>`
              : ''
          }
          ${search ? '' : emailInput(fields.email)} ${challenge(policy)}
          <button class="button-primary">
            ${search ? '質問する' : '送信'}
          </button>
        </form>`,
    ),
  }
}
export function receiptPage(
  kind: FormKind,
  number: number,
  fields: Fields,
  responseTime: string | null,
) {
  const title =
    (kind === 'feedback'
      ? 'フィードバックを受け付けました'
      : '問い合わせを受け付けました') +
    '（#' +
    number +
    '）'
  return {
    title,
    html: String(
      html`<h1>${titles[kind]}</h1>
        <p class="banner-success" role="status">${title}</p>
        <dl class="receipt-details">
          ${
            kind === 'chat'
              ? html`<dt>質問</dt>
                  <dd>${fields.question}</dd>`
              : ''
          }
          <dt>${kind === 'feedback' ? '登録した連絡先' : '返信先'}</dt>
          <dd>${fields.email}</dd>
          ${
            kind !== 'feedback' && responseTime
              ? html`<dt>返信の目安</dt>
                  <dd>${responseTime}</dd>`
              : ''
          }
        </dl>
        ${kind === 'feedback' ? html`<p>フィードバックへの返信はありません。</p>` : ''}`,
    ),
  }
}
export function matchingArticles(
  items: { id: string; title: string; url: string }[],
  policy: IntakePolicy,
  question: string,
) {
  return {
    title: '関連する記事',
    html: String(
      html`<h1>関連する記事</h1>
        <p class="chat-question">${question}</p>
        <ul class="article-list">
          ${items.map((a) => html`<li><a href="${a.url}" target="_blank" rel="noopener noreferrer">${a.title}（新しいタブ）</a></li>`)}
        </ul>
        <details class="chat-handoff">
          <summary role="button">解決しなかったので問い合わせる</summary>
          <form class="public-form" method="post">
            <input type="hidden" name="publicKey" value="${policy.publicKey}" />
            <input type="hidden" name="handoff" value="yes" />
            <input type="hidden" name="question" value="${question}" />
            ${emailInput(undefined)}${challenge(policy)}
            <button class="button-primary">送信</button>
          </form>
        </details>
        <a class="button-quiet" href="">別の質問をする</a>`,
    ),
  }
}
