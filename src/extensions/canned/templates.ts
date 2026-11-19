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
        acknowledge: {
          name: 'お問い合わせの受付',
          body: '{{name}} 様、{{product}} へのお問い合わせを受け付けました。担当者が内容を確認してご連絡します。',
        },
        investigating: {
          name: '確認中のお知らせ',
          body: '{{name}} 様、お問い合わせの内容を {{product}} の担当者が確認しています。状況が分かり次第、このメールでお知らせします。',
        },
        resolved: {
          name: '解決のお知らせ',
          body: '{{name}} 様、お問い合わせいただいた件の対応が完了しました。お試しいただき、気になる点がありましたらこのメールにご返信ください。',
        },
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
