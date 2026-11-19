import { z } from 'zod'
import { authorize } from '../operations/catalog'
import type { Context } from '../operations/catalog-usecase'
import {
  chatEmbedSites,
  readChatWidgetValue,
  restorePublicSetting,
  savePublicSetting,
} from './public-settings-store'
import { chatWidgetSchema, defaultChatWidget } from './chat-widget'
import { exactOrigin } from './intake'
import { readPublicProduct } from '../../public/product-store'

export const embedSites = chatEmbedSites

export async function chatWidgetSettings(db: D1Database, product: string) {
  const stored = await readChatWidgetValue(db, product)
  return stored ? chatWidgetSchema.parse(JSON.parse(stored)) : defaultChatWidget
}

export async function editChatWidget(
  ctx: Context,
  product: string,
  fields: unknown,
) {
  authorize(ctx, 'admin', new Set(['admin']))
  if (!(await readPublicProduct(ctx.env.DB, product))) return null
  const parsed = chatWidgetSchema.safeParse(fields)
  if (!parsed.success) return null
  return savePublicSetting(
    ctx.env.DB,
    product,
    'chat_widget',
    JSON.stringify(parsed.data),
    ctx.uuid(),
    {
      actor: JSON.stringify(ctx.actor),
      now: ctx.now,
    },
  )
}

export async function editPublicSetting(
  ctx: Context,
  product: string,
  setting: { responseTime: string } | { site: string; remove: boolean },
) {
  authorize(ctx, 'admin', new Set(['admin']))
  if (!(await readPublicProduct(ctx.env.DB, product))) return null
  if ('site' in setting && !exactOrigin.safeParse(setting.site).success)
    return null
  if (
    'responseTime' in setting &&
    !z.string().max(160).safeParse(setting.responseTime).success
  )
    return null
  const key = 'site' in setting ? setting.site : 'response_time'
  const value =
    'site' in setting ? (setting.remove ? '' : 'enabled') : setting.responseTime
  return savePublicSetting(ctx.env.DB, product, key, value, ctx.uuid(), {
    actor: JSON.stringify(ctx.actor),
    now: ctx.now,
  })
}

export async function undoPublicSetting(ctx: Context, changeId: string) {
  authorize(ctx, 'admin', new Set(['admin']))
  return restorePublicSetting(ctx.env.DB, z.uuid().parse(changeId), {
    actor: JSON.stringify(ctx.actor),
    now: ctx.now,
  })
}
