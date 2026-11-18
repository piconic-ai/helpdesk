import { z } from 'zod'
import type { ExtensionContext } from '../../core/extensions/extension'
const body = z.string().trim().min(1).max(4000)
export const template = z.object({
  name: z.string().trim().min(1).max(100),
  body,
})
export const templateConfig = z
  .object({
    templates: z
      .record(z.string().trim().min(1).max(100), z.union([body, template]))
      .default({
        acknowledge: 'Hello {{name}}, thank you for contacting {{product}}.',
      }),
  })
  .strict()
export async function savedTemplates(ctx: ExtensionContext) {
  return templatesFromSettings(ctx.config, await ctx.list('template/'))
}
export function templatesFromSettings(
  config: unknown,
  rows: { key: string; value: unknown }[],
) {
  const result = new Map(
    Object.entries(templateConfig.parse(config).templates).map(([id, item]) => [
      id,
      typeof item === 'string'
        ? {
            name:
              id === 'acknowledge' ? 'お問い合わせの受付' : item.slice(0, 40),
            body: item,
          }
        : item,
    ]),
  )
  for (const row of rows.filter((item) => item.key.startsWith('template/')))
    result.set(row.key.slice(9), template.parse(row.value))
  return result
}
