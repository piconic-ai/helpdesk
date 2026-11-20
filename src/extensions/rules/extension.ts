import type { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { ruleSchema, config, storedRules } from './rule-list'
export { ruleSchema, storedRules } from './rule-list'
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
  icon: 'rules',
  permissions: [],
  config,
  async settingsSummary(ctx) {
    return '登録済みのルール ' + (await storedRules(ctx)).length + '件'
  },
  subscribers: [
    {
      kind: 'conversation_opened',
      async run(ctx, event) {
        const n = event.number
        if (!n) return
        const list = await storedRules(ctx)
        if (!list.length) return
        const mail = await ctx.contact(n)
        for (const { key, rule } of list.filter((entry) =>
          matches(entry.rule, mail),
        )) {
          if (rule.label) await ctx.label(n, rule.label)
          const assignee =
            rule.assignee &&
            (!ctx.canAssign || (await ctx.canAssign(n, rule.assignee)))
              ? rule.assignee
              : undefined
          if (assignee) await ctx.assign(n, assignee)
          await ctx.emit(
            'applied',
            n,
            {
              condition: rule.subjectContains ?? 'すべての件名',
              label: rule.label,
              assignee,
            },
            String(event.id) + '/' + key,
          )
        }
      },
    },
  ],
}
