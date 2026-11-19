import { z } from 'zod'
import type { ExtensionContext } from '../../core/extensions/extension'
import { backgroundArticles } from '../article-suggestions-usecase'
import { published } from './articles-usecase'
import { config } from './article'

export async function acknowledgmentLinks(
  ctx: ExtensionContext,
  input: unknown,
) {
  const origin = config.parse(ctx.config).helpdeskOrigin
  if (!origin) return ''
  const data = z
    .object({
      number: z.int().positive(),
      product: z.string(),
      contact: z.email(),
      name: z.string(),
      question: z.string().min(1),
    })
    .parse(input)
  const offer = await backgroundArticles(
    ctx,
    { ...data, surface: 'ack', key: 'receipt' },
    await published(ctx, data.product),
  )
  if (!offer?.articles.length) return ''
  return (
    '\n\n関連しそうな記事（お問い合わせ内容から自動で選びました）\n' +
    offer.articles
      .map((a) => a.title + '\n' + new URL(a.path, origin).href)
      .join('\n\n')
  )
}
