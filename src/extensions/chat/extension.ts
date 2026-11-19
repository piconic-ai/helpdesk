import type {
  Extension,
  ExtensionContext,
} from '../../core/extensions/extension'
import { articleCandidate, question, config, decideChat } from './chat'
export async function recommendArticles(
  ctx: ExtensionContext,
  product: string,
  text: string,
) {
  const published = articleCandidate
    .array()
    .parse((await ctx.resource('articles', 'published', product)) ?? [])
  const scores = published.length ? await ctx.judge(text, published) : []
  const decision = decideChat(scores, config.parse(ctx.config).threshold)
  if (decision.kind === 'hand_off') return []
  return decision.articles.map((id) => {
    const found = published.find((a) => a.id === id)
    if (!found) throw new Error('Unknown article from judge')
    return {
      id,
      title: found.title,
      url:
        '/help/articles/' +
        encodeURIComponent(product) +
        '/' +
        encodeURIComponent(id),
    }
  })
}
export async function handOffQuestion(
  ctx: ExtensionContext,
  product: string,
  input: unknown,
) {
  const data = question.parse(input)
  const receipt = await ctx.open({
    email: data.email,
    name: data.name,
    origin: 'chat',
    ...(data.sourcePage && { sourcePage: data.sourcePage }),
    product,
    body: data.question,
    subject: data.question.trim().slice(0, 96),
  })
  return { kind: 'hand_off', ...receipt }
}
export const chat: Extension = {
  id: 'chat',
  icon: 'chat',
  requiresAI: true,
  permissions: ['external_fetch'],
  config,
  intakes: [
    {
      path: 'ask',
      async run(ctx, product, input) {
        const data = question.parse(input)
        const articles = await recommendArticles(ctx, product, data.question)
        if (articles.length) return { kind: 'show_articles', articles }
        return handOffQuestion(ctx, product, data)
      },
    },
  ],
}
