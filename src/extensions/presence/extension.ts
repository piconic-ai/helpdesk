import { z } from 'zod'
import type {
  Extension,
  ExtensionContext,
} from '../../core/extensions/extension'
const mode = z.enum(['reading', 'typing'])
const member = z.object({ email: z.email(), mode, at: z.number() })
const input = z.object({
  number: z.coerce.number().int().positive(),
  mode,
  tab: z.uuid(),
})
async function members(ctx: ExtensionContext, number: number) {
  const rows = await ctx.list('view/' + number + '/')
  const others = new Map<string, z.infer<typeof member>>()
  for (const row of rows) {
    const user = member.parse(row.value)
    if (
      user.at + 45_000 <= ctx.now ||
      (ctx.actor.kind === 'operator' && ctx.actor.id === user.email)
    )
      continue
    if (others.get(user.email)?.mode !== 'typing') others.set(user.email, user)
  }
  return [...others.values()]
}
export const presence: Extension = {
  id: 'presence',
  permissions: [],
  config: z.object({}).strict(),
  operations: [
    {
      name: 'heartbeat',
      description: 'Update operator presence',
      input,
      output: member.array(),
      permission: 'read',
      humanOnly: true,
      async run(ctx, value) {
        const { number, mode, tab } = input.parse(value)
        if (ctx.actor.kind !== 'operator') throw new Error('Operator required')
        await ctx.contact(number)
        await ctx.put('view/' + number + '/' + ctx.actor.id + '/' + tab, {
          email: ctx.actor.id,
          mode,
          at: ctx.now,
        })
        return members(ctx, number)
      },
    },
  ],
  panels: [
    {
      slot: 'conversation',
      title: 'Other operators here',
      operations: [],
      script: '/extension-assets/presence.js',
    },
  ],
}
