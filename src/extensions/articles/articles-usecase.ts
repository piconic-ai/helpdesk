import { z } from 'zod'
import type { ExtensionContext } from '../../core/extensions/extension'
import {
  article,
  articleKey,
  productId,
  slug,
  config,
  publicPath,
  visit,
  lifetime,
} from './article'
export const edit = article
export const attach = z.object({
  number: z.coerce.number().int().positive(),
  id: slug,
  body: z.string().max(100000).optional(),
})
export const candidate = z.object({
  number: z.coerce.number().int().positive(),
  topic: z.string().trim().min(1).max(1000),
})
export async function published(ctx: ExtensionContext, input: unknown) {
  const product = productId.parse(input)
  return (await ctx.list(articleKey(product, '')))
    .map((r) => article.parse(r.value))
    .filter((a) => a.status === 'published' && a.product === product)
}
export async function saveArticle(ctx: ExtensionContext, input: unknown) {
  const data = edit.parse(input)
  await ctx.put(articleKey(data.product, data.id), data)
  return { id: data.id, status: data.status }
}
export async function attachArticle(ctx: ExtensionContext, input: unknown) {
  const cmd = attach.parse(input)
  const contact = await ctx.contact(cmd.number)
  const a = article.parse(await ctx.get(articleKey(contact.product, cmd.id)))
  if (a.status !== 'published')
    throw new Error('Publish the article before attaching it')
  const origin = config.parse(ctx.config).helpdeskOrigin
  if (!origin)
    throw new Error('Set articles.helpdeskOrigin to the public helpdesk origin')
  return ctx.draft(
    cmd.number,
    [cmd.body, a.title, origin + publicPath(a.product, a.id)]
      .filter(Boolean)
      .join('\n\n'),
  )
}
export async function suggestArticle(ctx: ExtensionContext, input: unknown) {
  const data = candidate.parse(input)
  const { product } = await ctx.contact(data.number)
  await ctx.put('candidate/' + data.number, { ...data, product })
  await ctx.emit('candidate', data.number, { topic: data.topic, product })
  return data
}
export async function settingsContent(ctx: ExtensionContext) {
  const docs = (await ctx.list('article/'))
    .map((r) => article.parse(r.value))
    .map(
      (a) => a.product + ' / ' + a.id + ' · ' + a.title + ' (' + a.status + ')',
    )
  const topics = (await ctx.list('candidate/'))
    .map((r) => candidate.parse(r.value))
    .map((c) => '#' + c.number + ' · ' + c.topic)
  return [...docs, ...topics].join('\n')
}
export async function startVisit(
  ctx: ExtensionContext,
  product: string,
  id: string,
) {
  const nonce = crypto.randomUUID()
  await ctx.put('visit/' + nonce, { product, id, at: ctx.now })
  return nonce
}
const voteInput = z.object({ visit: z.uuid(), helpful: z.enum(['yes', 'no']) })
export async function recordVote(
  ctx: ExtensionContext,
  product: string,
  id: string,
  form: FormData,
) {
  const vote = voteInput.parse(Object.fromEntries(form))
  const data = visit.safeParse(await ctx.get('visit/' + vote.visit))
  if (
    !data.success ||
    data.data.product !== product ||
    data.data.id !== id ||
    ctx.now - data.data.at > lifetime
  )
    return false
  await ctx.emit(
    'helpful',
    null,
    {
      product,
      article: id,
      helpful: vote.helpful === 'yes',
      durationMs: Math.max(0, ctx.now - data.data.at),
    },
    vote.visit,
  )
  await ctx.remove('visit/' + vote.visit)
  return true
}
export async function expireVisits(ctx: ExtensionContext) {
  for (const row of await ctx.list('visit/'))
    if (visit.parse(row.value).at < ctx.now - lifetime)
      await ctx.remove(row.key)
}
