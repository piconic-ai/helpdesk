import { improvementRate } from '../issues/outcomes'
import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { calculate } from './calculate'
const input = z
  .object({
    product: z.string().default(''),
    includeHistory: z.boolean().optional(),
    from: z.coerce.number().int().nonnegative().default(0),
    to: z.coerce.number().int().positive().default(Number.MAX_SAFE_INTEGER),
  })
  .refine((i) => i.from < i.to, 'End must be after start')
const result = z.object({
  resolutionMs: z.number().nullable(),
  shownSuggestions: z.int(),
  solvedSuggestions: z.int(),
  selfResolutionRate: z.number().nullable(),
  firstContactRate: z.number().nullable(),
  operatorMs: z.number().nullable(),
  improvementRate: z.number().nullable(),
  voices: z.int(),
  informed: z.int(),
  resolved: z.int(),
  closed: z.int(),
  measured: z.int(),
})
export const reportResult = result.extend({
  history: z
    .array(z.object({ from: z.number(), to: z.number(), values: result }))
    .optional(),
})
export const metrics: Extension = {
  id: 'metrics',
  icon: 'metrics',
  permissions: [],
  config: z.object({}).strict(),
  subscribers: [
    {
      kind: 'articles.helpful',
      async run(ctx, event) {
        const vote = z
          .object({
            product: z.string(),
            helpful: z.literal(true),
            durationMs: z.number().nonnegative(),
          })
          .safeParse(event.payload)
        if (vote.success)
          await ctx.emit(
            'article_resolved',
            null,
            {
              product: vote.data.product,
              durationMs: vote.data.durationMs,
              resolvedAt: event.at,
            },
            String(event.id),
          )
      },
    },
  ],
  operations: [
    {
      name: 'report',
      description:
        'Measure resolution time, first-contact resolution operator time and improvement notifications delivered. Use epoch milliseconds for from and to.',
      permission: 'read',
      input,
      output: reportResult,
      async run(ctx, value) {
        const { product, from, to, includeHistory } = input.parse(value)
        const [events, voices] = await Promise.all([ctx.events(), ctx.voices()])
        const period = async (start: number, end: number) => ({
          ...(await ctx.suggestionResolution(product, start, end)),
          ...calculate(events, product, start, end),
          ...improvementRate(voices, events, product, start, end),
        })
        const current = period(from, to)
        if (!includeHistory) return current
        const periods = []
        const duration = to - from
        for (let back = 6; back >= 0; back--) {
          const end = to - back * duration
          if (end <= 0) continue
          const start = Math.max(0, end - duration)
          const values = back ? period(start, end) : current
          periods.push(
            values.then((values) => ({ from: start, to: end, values })),
          )
        }
        const history = await Promise.all(periods)
        return { ...(await current), history }
      },
    },
  ],
  panels: [
    { slot: 'list', title: 'Resolution metrics', operations: ['report'] },
  ],
}
