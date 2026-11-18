import PostalMime from 'postal-mime'
import { z } from 'zod'
import { addressSchema } from '../conversations/state'
import { classify, header } from './classify'
import { messageIds } from './threading'

const cleanHeader = (s: string) => s.replace(/[\r\n\u0000]/g, ' ').trim()

export async function parseMail(raw: ArrayBuffer, envelopeFrom: string) {
  const parsed = await PostalMime.parse(raw, {
    maxHeadersSize: 256 * 1024,
    maxNestingDepth: 24,
    forceRfc822Attachments: true,
  })
  const sender = addressSchema.parse(parsed.from?.address)
  const category = classify(parsed, envelopeFrom)
  return {
    sender,
    category,
    subject: cleanHeader(parsed.subject ?? ''),
    text: parsed.text ?? '',
    html: parsed.html ?? null,
    messageId: messageIds(parsed.messageId ?? '')[0] ?? null,
    inReplyTo: cleanHeader(parsed.inReplyTo ?? ''),
    refs: cleanHeader(parsed.references ?? ''),
    authentication: header(parsed, 'authentication-results'),
    attachments: parsed.attachments.map((a) => ({
      filename: cleanHeader(a.filename ?? 'attachment') || 'attachment',
      mime: a.mimeType,
      content: z.instanceof(ArrayBuffer).parse(a.content),
    })),
  }
}

export type ParsedMail = Awaited<ReturnType<typeof parseMail>>
