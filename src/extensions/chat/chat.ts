import { z } from 'zod'
export const articleCandidate = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  summary: z.string().optional(),
})
export const score = z.object({ id: z.string(), score: z.number().finite() })
export const question = z.object({
  submissionId: z.uuid().optional(),
  suggestionIds: z.array(z.uuid()).optional(),
  email: z.email(),
  sourcePage: z.string().max(4096).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  question: z
    .string()
    .min(1)
    .max(30000)
    .refine((v) => !!v.trim()),
})
export const config = z.object({
  threshold: z.number().min(0).max(1).default(0.6),
  interactiveModel: z.enum(['clef', 'clef-flash']).default('clef-flash'),
  backgroundModel: z.enum(['clef', 'clef-flash']).default('clef'),
})
export const recommendationPolicy = config.extend({
  autoAck: z.boolean().default(false),
})
export const recommendationInput = z.object({
  product: z.string().min(1).max(200),
  question: question.shape.question,
  mode: z.enum(['interactive', 'background']).default('interactive'),
  name: z.string().optional(),
})
export const suggestedArticle = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  score: z.number().min(0).max(1),
})
export const recommendation = z.object({
  articles: z.array(suggestedArticle),
  highestScore: z.number().min(0).max(1).nullable(),
  needsHuman: z.boolean(),
})
export function decideChat(
  scores: z.infer<typeof score>[],
  threshold: number,
  humanProbability = 0,
):
  | { kind: 'show_articles'; articles: string[]; needsHuman: boolean }
  | { kind: 'hand_off'; needsHuman: boolean } {
  const selected = scores
    .filter((item) => item.score > threshold)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3)
  const needsHuman = humanProbability > threshold
  return selected.length
    ? { kind: 'show_articles', articles: selected.map((a) => a.id), needsHuman }
    : { kind: 'hand_off', needsHuman }
}
