import { z } from 'zod'

export const automaticPolicy = z.enum(['auto-ack', 'survey'])
export type AutomaticPolicy = z.infer<typeof automaticPolicy>
export const messageWording = z.string().trim().min(1).max(8000)
export const messageKey = (product: string) => 'message/' + product
const defaults = {
  'auto-ack':
    'We received your inquiry. You can reply to this email to add details.',
  survey: 'Was your inquiry resolved?',
}
export function wordingFor(policy: AutomaticPolicy, value: unknown) {
  return value == null ? defaults[policy] : messageWording.parse(value)
}
export function acknowledgmentText(
  productName: string,
  number: number,
  wording: string,
) {
  return `This is an automated acknowledgment from ${productName} [#${number}].\n\n${wording}`
}
export function surveyText(
  origin: string,
  product: string,
  number: number,
  token: string,
  wording: string,
) {
  const url = new URL(
    '/help/survey/' + encodeURIComponent(product) + '/' + token,
    origin,
  )
  return `Automated follow-up for [#${number}].\n\n${wording} ${url.href}`
}
