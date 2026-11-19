import { mailLanguage, type MailLanguage } from '../core/settings/mail-language'
import { z } from 'zod'

export const automaticPolicy = z.enum(['auto-ack', 'survey'])
export type AutomaticPolicy = z.infer<typeof automaticPolicy>
export const messageWording = z.string().trim().min(1).max(8000)
export const messageLanguage = mailLanguage
const message = z.object({ language: messageLanguage, body: messageWording })
type Message = z.infer<typeof message>
export const messageKey = (product: string) => 'message/' + product
const defaults = {
  en: {
    'auto-ack':
      'We received your inquiry. You can reply to this email to add details.',
    survey: 'Was your inquiry resolved?',
  },
  ja: {
    'auto-ack':
      'お問い合わせを受け付けました。内容を追加する場合は、このメールにご返信ください。',
    survey: 'お問い合わせは解決しましたか？',
  },
}
export function wordingFor(
  policy: AutomaticPolicy,
  value: unknown,
  mailboxLanguage: MailLanguage = 'ja',
): Message {
  if (value == null) {
    const language = policy === 'survey' ? mailboxLanguage : 'en'
    return { language, body: defaults[language][policy] }
  }
  if (typeof value === 'string')
    return { language: 'en', body: messageWording.parse(value) }
  return message.parse(value)
}
export function editedMessage(
  policy: AutomaticPolicy,
  { language, body }: Message,
): Message {
  const other = language === 'ja' ? 'en' : 'ja'
  return {
    language,
    body: body === defaults[other][policy] ? defaults[language][policy] : body,
  }
}
export function acknowledgmentText(
  productName: string,
  number: number,
  wording: Message,
) {
  const header =
    wording.language === 'ja'
      ? `${productName} からの自動送信です [#${number}]。`
      : `This is an automated acknowledgment from ${productName} [#${number}].`
  return header + '\n\n' + wording.body
}
export function surveyText(
  origin: string,
  product: string,
  number: number,
  token: string,
  wording: Message,
) {
  const url = new URL(
    '/help/survey/' + encodeURIComponent(product) + '/' + token,
    origin,
  )
  const header =
    wording.language === 'ja'
      ? `お問い合わせ [#${number}] についての自動送信です。`
      : `Automated follow-up for [#${number}].`
  return header + '\n\n' + wording.body + ' ' + url.href
}
