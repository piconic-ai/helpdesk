import { messageKey, surveyText, wordingFor } from '../automatic-message'
import { surveyForm, surveyReceipt } from './survey-pages'
import { z } from 'zod'
import type {
  Extension,
  ExtensionContext,
  ExtensionEvent,
} from '../../core/extensions/extension'
export const surveyConfig = z.object({
  helpdeskOrigin: z
    .url()
    .refine((v) => new URL(v).origin === v && /^https?:/.test(v)),
})
const ticket = z.object({
  product: z.string(),
  number: z.int().positive(),
  event: z.int().positive(),
})
async function invite(ctx: ExtensionContext, e: ExtensionEvent) {
  if (!ctx.enabledBy || !e.number || e.payload.to !== 'closed') return
  const c = await ctx.contact(e.number)
  if (c.status !== 'closed') return
  const key = 'invite/' + e.id
  const candidate = crypto.randomUUID()
  const fresh = await ctx.create(key, candidate)
  const token = fresh ? candidate : z.uuid().parse(await ctx.get(key))
  await ctx.put('token/' + token, {
    product: c.product,
    number: e.number,
    event: e.id,
  })
  await ctx.standing(
    e.number,
    surveyText(
      surveyConfig.parse(ctx.config).helpdeskOrigin,
      c.product,
      c.reference,
      token,
      wordingFor('survey', await ctx.get(messageKey(c.product)), c.language),
    ),
    key,
  )
}
async function lookup(ctx: ExtensionContext, product: string, path: string) {
  const token = z.uuid().safeParse(path.replace(/^\//, ''))
  if (!token.success) return null
  const row = ticket.safeParse(await ctx.get('token/' + token.data))
  if (!row.success || row.data.product !== product) return null
  const contact = await ctx.contact(row.data.number).catch(() => null)
  return (
    contact && { token: token.data, ...row.data, reference: contact.reference }
  )
}
export const survey: Extension = {
  id: 'survey',
  icon: 'survey',
  permissions: ['send'],
  config: surveyConfig,
  subscribers: [{ kind: 'status_changed', run: invite }],
  async publicPage(ctx, product, path) {
    const row = await lookup(ctx, product, path)
    if (!row) return null
    return surveyForm(row.reference)
  },
  async publicAction(ctx, product, path, request) {
    const row = await lookup(ctx, product, path)
    if (!row) return null
    const input = z
      .enum(['yes', 'no'])
      .safeParse((await request.formData()).get('resolved'))
    if (!input.success) return null
    const key = 'answer/' + row.token
    await ctx.create(key, input.data === 'yes')
    const resolved = z.boolean().parse(await ctx.get(key))
    await ctx.emit('answered', row.number, { product, resolved }, row.token)
    return surveyReceipt(row.reference)
  },
}
