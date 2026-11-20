import { z } from 'zod'
import { authorize } from '../core/operations/catalog'
import type { Context } from '../core/operations/catalog-usecase'
import type { ExtensionContext } from '../core/extensions/extension'
import { editExtensionSetting } from '../core/extensions/admin-settings-usecase'
import { settingRevision } from '../core/extensions/admin-settings-store'
import { readPublicProduct } from '../public/product-store'
import { recommendationPolicy } from '../extensions/chat/chat'
import { recommendationSettings } from '../extensions/chat/extension'

function key(product: string) {
  return 'recommendation/' + encodeURIComponent(product)
}

export async function recommendationForm(
  ctx: Context,
  api: ExtensionContext,
  product: string,
) {
  const revision = await settingRevision(ctx.env.DB, 'chat', key(product))
  return { policy: await recommendationSettings(api, product), revision }
}

export async function saveRecommendationForm(
  ctx: Context,
  form: Record<string, unknown>,
) {
  const fields = z
    .object({
      product: z.string().min(1),
      revision: z.union([z.literal(''), z.uuid()]),
      threshold: z
        .string()
        .trim()
        .min(1)
        .transform(Number)
        .pipe(z.number().min(0).max(100)),
      interactiveModel: z.string(),
      backgroundModel: z.string(),
      autoAck: z.literal('on').optional(),
    })
    .parse(form)
  authorize(ctx, 'admin', new Set(['admin']), fields.product)
  if (!(await readPublicProduct(ctx.env.DB, fields.product))) return null
  const policy = recommendationPolicy.parse({
    interactiveModel: fields.interactiveModel,
    backgroundModel: fields.backgroundModel,
    threshold: fields.threshold / 100,
    autoAck: fields.autoAck === 'on',
  })
  return editExtensionSetting(
    ctx,
    'chat',
    key(fields.product),
    policy,
    fields.revision,
    undefined,
    fields.product,
  )
}
