import { z } from 'zod'
import { canonical } from '../../core/extensions/aliases'
import type { Extension } from '../../core/extensions/extension'
const number = z.coerce.number().int().positive()
const edges = z.record(z.string().regex(/^[1-9]\d*$/), number)
const input = z.object({ number, target: number })
export const merge: Extension = {
  id: 'merge',
  permissions: [],
  config: z.object({}).strict(),
  operations: [
    {
      name: 'combine',
      description: 'Merge into conversation',
      input,
      permission: 'write',
      output: z.object({ number }),
      async run(ctx, value) {
        const { number: source, target } = input.parse(value)
        const prior = await ctx.get('aliases')
        const aliases = edges.parse(prior ?? {})
        const dest = canonical(aliases, target)
        if (dest === source || aliases[source])
          throw new Error('Already merged or cyclic merge')
        const [from, to] = await Promise.all([
          ctx.contact(source),
          ctx.contact(dest),
        ])
        if (from.email !== to.email || from.mailbox !== to.mailbox)
          throw new Error('Conversations must share a sender and mailbox')
        if (
          ['received', 'reviewed'].includes(from.status) ||
          ['received', 'reviewed'].includes(to.status)
        )
          throw new Error('Convert feedback before merging')
        if (
          !(await ctx.compareSwap('aliases', prior, {
            ...aliases,
            [source]: dest,
          }))
        )
          throw new Error('Merge changed. Reload and retry.')
        return { number: dest }
      },
    },
  ],
  panels: [
    {
      slot: 'conversation',
      title: 'Merge conversations',
      operations: ['combine'],
    },
  ],
  async aliases(storage) {
    return edges.parse((await storage.get('aliases')) ?? {})
  },
}
