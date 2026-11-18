import sanitize from 'sanitize-html'
import type { Bindings } from '../settings/bindings'
import { attachment, htmlBody } from './conversations-store'

export async function readHtml(env: Bindings, id: string) {
  const body = await htmlBody(env.DB, id)
  if (body === null) return null
  return sanitize(body, {
    allowedTags: [
      'p',
      'br',
      'blockquote',
      'b',
      'strong',
      'em',
      'i',
      'u',
      'ul',
      'ol',
      'li',
      'pre',
      'code',
      'table',
      'tbody',
      'thead',
      'tr',
      'td',
      'th',
      'div',
      'span',
      'h1',
      'h2',
      'h3',
      'hr',
    ],
    allowedAttributes: {},
  })
}
export async function download(env: Bindings, key: string) {
  const file = await attachment(env.DB, key)
  if (!file) return null
  const object = await env.RAW.get(file.key)
  return object ? { body: object.body, filename: file.filename } : null
}
