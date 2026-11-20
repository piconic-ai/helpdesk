import { z } from 'zod'
import {
  ticketPrefixSchema,
  ticketReference,
  ticketSubjectTag,
} from '../conversations/ticket-reference'
import { addressSchema, numberSchema } from '../conversations/state'

export const replyEnvelopeSchema = z.object({
  mailbox: addressSchema,
  senderName: z.string().nullish(),
  operatorName: z.string().nullish(),
  contact: addressSchema,
  number: numberSchema,
  ticketPrefix: ticketPrefixSchema,
  subject: z.string(),
  body: z.string().min(1),
  in_reply_to: z.string().nullable(),
  refs: z.string().nullable(),
})

export type ReplyEnvelope = z.infer<typeof replyEnvelopeSchema>

export function replySubject(subject: string, reference: string) {
  const clean = subject
    .replace(/[\r\n]+/g, ' ')
    .replace(new RegExp(ticketSubjectTag.source, 'g'), '')
    .replace(/^re:\s*/i, '')
    .trim()
  return `Re: ${clean} [${reference}]`
}

export function senderLabel(
  productName?: string | null,
  operatorName?: string | null,
) {
  return [productName, operatorName]
    .filter(Boolean)
    .join(' · ')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
}

export function composeReply(reply: ReplyEnvelope) {
  const headers: Record<string, string> = {}
  if (
    reply.in_reply_to &&
    /^<[^<>\s@]+@[^<>\s@]+>$/.test(reply.in_reply_to) &&
    reply.in_reply_to.length <= 512
  ) {
    const ids = reply.refs?.match(/<[^<>\s@]+@[^<>\s@]+>/g) ?? []
    const chain = Array.from(
      new Set([
        ...ids.filter((id) => id !== reply.in_reply_to),
        reply.in_reply_to,
      ]),
    )
    headers['In-Reply-To'] = reply.in_reply_to
    let references = chain.pop() ?? reply.in_reply_to
    for (const id of chain.reverse()) {
      if (new TextEncoder().encode(id + ' ' + references).length > 2048) break
      references = id + ' ' + references
    }
    headers.References = references
  }
  const name = senderLabel(reply.senderName, reply.operatorName)
  return {
    from: name ? { name, email: reply.mailbox } : reply.mailbox,
    to: reply.contact,
    subject: replySubject(
      reply.subject,
      ticketReference(reply.ticketPrefix, reply.number),
    ),
    text: reply.body,
    headers,
  }
}
