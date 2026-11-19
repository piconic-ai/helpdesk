import type { ExtensionContext } from '../../core/extensions/extension'
import { backgroundArticles } from '../article-suggestions-usecase'
import { published } from './articles-usecase'
import { publicPath } from './article'

export async function replyArticleChoices(
  ctx: ExtensionContext,
  product: string,
  inbound?: { number: number; id: string },
) {
  const catalog = await published(ctx, product)
  const all = catalog.map((a) => ({
    title: a.title,
    path: publicPath(product, a.id),
  }))
  if (
    !inbound ||
    !(await ctx.resource('chat', 'recommendationSettings', product))
  )
    return all
  const contact = await ctx.contact(inbound.number)
  const question = await ctx.inboundBody(inbound.number, inbound.id)
  if (!question) return all
  const offer = await backgroundArticles(
    ctx,
    {
      surface: 'composer',
      product,
      question,
      name: contact.name,
      contact: contact.email,
      number: inbound.number,
      key: inbound.id,
    },
    catalog,
  )
  if (!offer) return all
  const chosen = new Set(offer.articles.map((a) => a.id))
  return {
    links: [
      ...offer.articles,
      ...all.filter((_, index) => !chosen.has(catalog[index].id)),
    ],
    offerToWrite: chosen.size === 0,
  }
}
