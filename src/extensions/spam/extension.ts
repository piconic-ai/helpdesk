import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { shouldQuarantine } from './classify'
export const spam: Extension = {
  id: 'spam',
  icon: 'spam',
  permissions: [],
  config: z.object({}).strict(),
  subscribers: [
    {
      kind: 'message_received',
      async run(ctx, e) {
        if (!e.number) return
        const contact = await ctx.contact(e.number)
        if (
          contact.status !== 'spam' &&
          shouldQuarantine(
            e.payload.authentication,
            contact.email,
            contact.mailbox,
          )
        )
          await ctx.change(e.number, 'marked_spam')
      },
    },
  ],
}
