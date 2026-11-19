import type {
  Extension,
  ExtensionContext,
} from '../../core/extensions/extension'
import { z } from 'zod'
import {
  question,
  config,
  decideChat,
  recommendationPolicy,
  recommendationInput,
  recommendation,
} from './chat'
const summary = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
})

export async function recommendationSettings(
  ctx: ExtensionContext,
  product: string,
) {
  const stored = await ctx.get('recommendation/' + encodeURIComponent(product))
  return recommendationPolicy.parse({
    ...config.parse(ctx.config),
    ...z.record(z.string(), z.unknown()).parse(stored ?? {}),
  })
}

export async function recommend(
  ctx: ExtensionContext,
  input: unknown,
): Promise<z.output<typeof recommendation>> {
  const data = recommendationInput.parse(input)
  const fallback = { articles: [], highestScore: null, needsHuman: false }
  try {
    const [settings, candidates] = await Promise.all([
      recommendationSettings(ctx, data.product),
      ctx.resource('articles', 'candidates', {
        product: data.product,
        question: data.question,
      }),
    ])
    const articles = summary.array().parse(candidates ?? [])
    if (!articles.length) return fallback
    const model =
      data.mode === 'interactive'
        ? settings.interactiveModel
        : settings.backgroundModel
    const judged = await ctx.judge(model, data.question, articles, data.name)
    const decision = decideChat(
      judged.scores,
      settings.threshold,
      judged.needsHuman,
    )
    const ranked = decision.kind === 'show_articles' ? decision.articles : []
    return {
      highestScore: Math.max(...judged.scores.map((s) => s.score)),
      needsHuman: decision.needsHuman,
      articles: ranked.map((id) => {
        const article = articles.find((a) => a.id === id)!
        return {
          id,
          title: article.title,
          url:
            '/help/articles/' +
            encodeURIComponent(data.product) +
            '/' +
            encodeURIComponent(id),
          score: judged.scores.find((s) => s.id === id)!.score,
        }
      }),
    }
  } catch {
    return fallback
  }
}
export async function recommendArticles(
  ctx: ExtensionContext,
  product: string,
  text: string,
  name?: string,
) {
  const result = await recommend(ctx, { product, question: text, name })
  return result.articles.map(({ id, title, url }) => ({ id, title, url }))
}
export async function handOffQuestion(
  ctx: ExtensionContext,
  product: string,
  input: unknown,
) {
  const data = question.parse(input)
  const receipt = await ctx.open({
    email: data.email,
    submissionId: data.submissionId,
    suggestionIds: data.suggestionIds,
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
  resources: [
    { name: 'recommend', run: recommend },
    {
      name: 'recommendationSettings',
      run: (ctx, input) =>
        recommendationSettings(ctx, z.string().min(1).parse(input)),
    },
  ],
  intakes: [
    {
      path: 'ask',
      async run(ctx, product, input) {
        const data = question.parse(input)
        const articles = await recommendArticles(
          ctx,
          product,
          data.question,
          data.name,
        )
        if (articles.length) return { kind: 'show_articles', articles }
        return handOffQuestion(ctx, product, data)
      },
    },
  ],
}
