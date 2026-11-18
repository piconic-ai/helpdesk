import type { Extension } from '../../core/extensions/extension'
import { articleCandidate, question, config, decideChat } from './chat'
export const chat: Extension = {
  id: 'chat',
  requiresAI: true,
  permissions: ['external_fetch'],
  config,
  intakes: [
    {
      path: 'ask',
      async run(ctx, product, input) {
        const data = question.parse(input)
        const published = articleCandidate
          .array()
          .parse((await ctx.resource('articles', 'published', product)) ?? [])
        const scores = published.length
          ? await ctx.judge(data.question, published)
          : []
        const decision = decideChat(scores, config.parse(ctx.config).threshold)
        if (decision.kind === 'show_articles')
          return {
            kind: 'show_articles',
            articles: decision.articles.map((id) => {
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
            }),
          }
        const receipt = await ctx.open({
          email: data.email,
          name: data.name,
          origin: 'chat',
          product,
          body: data.question,
          subject: data.question.trim().slice(0, 96),
        })
        return { kind: 'hand_off', ...receipt }
      },
    },
  ],
}
