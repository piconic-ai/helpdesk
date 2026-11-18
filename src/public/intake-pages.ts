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
          ${chat && requestContact ? html`<p>該当する記事が見つかりませんでした。担当者から返信するための連絡先を入力してください。</p>` : ''}
          ${search ? '' : emailInput(fields.email)}
          ${policy.turnstileSecretBinding && policy.turnstileSiteKey ? html`<div class="cf-turnstile" data-sitekey="${policy.turnstileSiteKey}"></div>` : ''}
          <button class="button-primary">
            ${search ? '質問する' : '送信'}
          </button>
        </form>`,
    ),
  }
}
export function receiptPage(kind: FormKind, number: number) {
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
        ${kind === 'feedback' ? html`<p>返信のご希望がない場合は、個別にご連絡することはありません。</p>` : ''}`,
    ),
  }
}
export function matchingArticles(
  items: { id: string; title: string; url: string }[],
) {
  return {
    title: '関連する記事',
    html: String(
      html`<h1>関連する記事</h1>
        <ul class="article-list">
          ${items.map((a) => html`<li><a href="${a.url}" target="_blank" rel="noopener noreferrer">${a.title}（新しいタブ）</a></li>`)}
        </ul>
        <a class="button-quiet" href="">別の質問をする</a>`,
    ),
  }
}
