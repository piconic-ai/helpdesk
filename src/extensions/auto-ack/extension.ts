import { z } from 'zod'
import type {
  Extension,
  ExtensionContext,
} from '../../core/extensions/extension'
import {
  acknowledgmentText,
  messageKey,
  wordingFor,
} from '../automatic-message'
import { shouldQuarantine } from '../spam/classify'

async function relatedAcknowledgment(
  ctx: ExtensionContext,
  number: number,
  contact: Awaited<ReturnType<ExtensionContext['contact']>>,
  inbound: unknown,
) {
  const settings = await ctx.resource(
    'chat',
    'recommendationSettings',
    contact.product,
  )
  if (!z.object({ autoAck: z.literal(true) }).safeParse(settings).success)
    return ''
  const body = await ctx.inboundBody(
    number,
    typeof inbound === 'string' ? inbound : undefined,
  )
  const result = await ctx.resource('articles', 'acknowledgmentLinks', {
    number,
    product: contact.product,
    contact: contact.email,
    name: contact.name,
    question: body || contact.subject,
  })
  return typeof result === 'string' ? result : ''
}
export const autoAck: Extension = {
  id: 'auto-ack',
  icon: 'auto_ack',
  permissions: ['send', 'read_body'],
  config: z.object({}).strict(),
  subscribers: [
    {
      kind: 'message_received',
      async run(ctx, e) {
        if (
          !ctx.enabledBy ||
          !e.number ||
          e.payload.first !== true ||
          e.payload.category !== 'human'
        )
          return
        const contact = await ctx.contact(e.number)
        if (
          contact.status !== 'open' ||
          shouldQuarantine(
            e.payload.authentication,
            contact.email,
            contact.mailbox,
          )
        )
          return
        // A suggestion service failure must not interrupt the acknowledgment.
        const related = await relatedAcknowledgment(
          ctx,
          e.number,
          contact,
          e.payload.message,
        ).catch(() => '')
        await ctx.standing(
          e.number,
          acknowledgmentText(
            contact.productName,
            e.number,
            wordingFor('auto-ack', await ctx.get(messageKey(contact.product))),
          ) + related,
          'receipt',
        )
      },
    },
  ],
}
