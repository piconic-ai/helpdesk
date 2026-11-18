import type {
  ExtensionContext,
  ExtensionEvent,
} from '../../core/extensions/extension'
import { z } from 'zod'
import { productRepo } from './issues'
const input = z.object({
  product: z.string().min(1),
  issue: z.coerce.number().int().positive(),
  days: z.coerce.number().int().min(1).max(365).default(30),
})
const counts = z.object({
  total: z.number(),
  linked: z.number(),
  share: z.number().nullable(),
})
export const impactOutput = z.object({
  closedAt: z.number().nullable(),
  before: counts,
  after: counts,
  caveat: z.string(),
})
function compare(
  events: ExtensionEvent[],
  product: string,
  numbers: Set<number>,
  start: number,
  end: number,
) {
  const voices = events.filter(
    (e) =>
      e.kind === 'conversation_opened' &&
      e.payload.product === product &&
      e.at >= start &&
      e.at < end,
  )
  const linked = voices.filter(
    (e) => e.number !== null && numbers.has(e.number),
  ).length
  return {
    total: voices.length,
    linked,
    share: voices.length ? linked / voices.length : null,
  }
}
export const impactOperation = {
  name: 'impact',
  description:
    'Compare the share of conversations linked to this issue before and after closure (estimate)',
  permission: 'read' as const,
  input,
  output: impactOutput,
  async run(ctx: ExtensionContext, args: unknown) {
    const { product, issue, days } = input.parse(args)
    const { repo } = productRepo(ctx.config, product)
    const events = await ctx.events()
    const match = events.filter(
      (e) => e.payload.repository === repo && e.payload.issue === issue,
    )
    const numbers = new Set(
      match.flatMap((e) =>
        e.kind === 'issues.linked' && e.number !== null ? [e.number] : [],
      ),
    )
    const closedAt = z
      .number()
      .nullable()
      .parse(
        match.find((e) => e.kind === 'issues.closed')?.payload.closedAt ?? null,
      )
    const pivot = closedAt ?? ctx.now,
      window = days * 86400000
    return {
      closedAt,
      before: compare(events, product, numbers, pivot - window, pivot),
      after: compare(
        events,
        product,
        numbers,
        pivot,
        Math.min(ctx.now + 1, pivot + window),
      ),
      caveat:
        '目安。会話数が少ない場合や修正後の観測期間が短い場合、割合は大きく変動します。',
    }
  },
}
