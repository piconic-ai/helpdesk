import { z } from 'zod'
import type { articleCandidate } from './chat'
const output = z.object({
  response: z.array(
    z.object({
      id: z.number().int().nonnegative(),
      score: z.number().finite(),
    }),
  ),
})
export async function judgeArticles(
  binding: Ai,
  question: string,
  articles: z.infer<typeof articleCandidate>[],
) {
  const scores: { id: string; score: number }[] = []
  for (let start = 0; start < articles.length; start += 16) {
    const batch = articles.slice(start, start + 16)
    const input = {
      query: question,
      contexts: batch.map((a) => ({
        text: (a.title + '\n' + a.body).slice(0, 4096),
      })),
      top_k: Math.min(3, batch.length),
    }
    const result = await binding.run('@cf/baai/bge-reranker-base', input)
    for (const row of output.parse(result).response) {
      const article = batch[row.id]
      if (!article) throw new Error('Invalid article ranking result')
      scores.push({ id: article.id, score: row.score })
    }
  }
  return scores
}
