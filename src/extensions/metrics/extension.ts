import { improvementRate } from '../issues/outcomes'
import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { calculate } from './calculate'
const input = z
  .object({
    product: z.string().default(''),
    from: z.coerce.number().int().nonnegative().default(0),
    to: z.coerce.number().int().positive().default(Number.MAX_SAFE_INTEGER),
  })
  .refine((i) => i.from < i.to, 'End must be after start')
const result = z.object({
  resolutionMs: z.number().nullable(),
  firstContactRate: z.number().nullable(),
  operatorMs: z.number().nullable(),
  improvementRate: z.number().nullable(),
  voices: z.int(),
  informed: z.int(),
  resolved: z.int(),
  closed: z.int(),
  measured: z.int(),
})
export const metrics: Extension = {
  id: 'metrics',
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
      output: result,
      async run(ctx, value) {
        const { product, from, to } = input.parse(value)
        const [events, voices] = await Promise.all([ctx.events(), ctx.voices()])
        return {
          ...calculate(events, product, from, to),
          ...improvementRate(voices, events, product, from, to),
        }
      },
    },
  ],
  panels: [
    { slot: 'list', title: 'Resolution metrics', operations: ['report'] },
  ],
}
