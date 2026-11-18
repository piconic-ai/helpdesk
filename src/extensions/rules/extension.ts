import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
const ruleSchema = z
  .object({
    product: z.string().min(1).optional(),
    subjectContains: z.string().min(1).optional(),
    label: z.string().trim().min(1).max(200).optional(),
    assignee: z.email().optional(),
  })
  .strict()
  .refine(
    (r) => Boolean(r.label || r.assignee),
    'A label or assignee is required',
  )
const config = z.object({ rules: z.array(ruleSchema).default([]) }).strict()
export function matches(
  rule: z.infer<typeof ruleSchema>,
  mail: { product: string; subject: string },
) {
  return (
    (!rule.product || rule.product === mail.product) &&
    (!rule.subjectContains ||
      mail.subject.toLowerCase().includes(rule.subjectContains.toLowerCase()))
  )
}
export const rules: Extension = {
  id: 'rules',
  permissions: [],
  config,
  subscribers: [
    {
      kind: 'conversation_opened',
      async run(ctx, event) {
        const n = event.number
        if (!n) return
        const list = config.parse(ctx.config).rules
        if (!list.length) return
        const mail = await ctx.contact(n)
        for (const rule of list.filter((rule) => matches(rule, mail))) {
          if (rule.label) await ctx.label(n, rule.label)
          if (rule.assignee) await ctx.assign(n, rule.assignee)
        }
      },
    },
  ],
}
