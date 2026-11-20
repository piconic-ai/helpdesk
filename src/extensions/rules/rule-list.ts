import { z } from 'zod'
import type { ExtensionContext } from '../../core/extensions/extension'
export const ruleSchema = z
  .object({
    product: z.string().min(1).optional(),
    subjectContains: z.string().trim().min(1).max(200).optional(),
    label: z.string().trim().min(1).max(200).optional(),
    assignee: z.email().optional(),
  })
  .strict()
  .refine(
    (r) => Boolean(r.label || r.assignee),
    'A label or assignee is required',
  )
export const config = z
  .object({ rules: z.array(ruleSchema).default([]) })
  .strict()
export const ruleKey = z
  .string()
  .regex(/^rule\/(?:(?:new-)?[a-f0-9-]{36}|configured-\d+)$/)
export async function storedRules(ctx: ExtensionContext) {
  const [entries, order] = await Promise.all([
    ctx.list('rule/', 'created'),
    ctx.get('order'),
  ])
  return rulesFromSettings(ctx.config, entries, order)
}
export function rulesFromSettings(
  settings: unknown,
  saved: { key: string; value: unknown }[],
  rawOrder: unknown,
) {
  const entries = new Map(
    config
      .parse(settings)
      .rules.map((rule, i) => ['rule/configured-' + i, rule] as const),
  )
  const rows: Map<string, z.infer<typeof ruleSchema>> = new Map(entries)
  const rules = saved.filter((row) => row.key.startsWith('rule/'))
  // Earlier versions prioritized configured rules first, then stored rules by key.
  const previous = rules
    .filter((row) => !row.key.startsWith('rule/new-'))
    .sort((a, b) => a.key.localeCompare(b.key, 'en'))
  const added = rules.filter((row) => row.key.startsWith('rule/new-'))
  for (const { key, value } of [...previous, ...added]) {
    if (value === null) rows.delete(key)
    else rows.set(key, ruleSchema.parse(value))
  }
  const order = z.array(z.string()).parse(rawOrder ?? [])
  const keys = [...new Set([...order, ...rows.keys()])]
  return keys.flatMap((key) => {
    const rule = rows.get(key)
    return rule ? [{ key, rule }] : []
  })
}
export async function moveRule(
  ctx: ExtensionContext,
  key: string,
  direction: number,
  product?: string,
) {
  const expected = await ctx.get('order')
  const rules = await storedRules(ctx)
  const keys = rules.map((r) => r.key)
  const candidates = rules.filter((r) => !product || r.rule.product === product)
  const position = candidates.findIndex((r) => r.key === key)
  const adjacent = candidates[position + direction]
  if (position < 0 || !adjacent) return false
  const i = keys.indexOf(key),
    next = keys.indexOf(adjacent.key)
  ;[keys[i], keys[next]] = [keys[next], keys[i]]
  return { expected, keys }
}
