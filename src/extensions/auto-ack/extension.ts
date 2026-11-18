import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { shouldQuarantine } from '../spam/classify'

export const autoAck: Extension = {
  id: 'auto-ack',
  permissions: ['send'],
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
        await ctx.standing(
          e.number,
          `This is an automated acknowledgment from ${contact.productName}. We received your inquiry [#${e.number}]. You can reply to this email to add details.`,
          'receipt',
        )
      },
    },
  ],
}
