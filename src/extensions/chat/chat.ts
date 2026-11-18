import { z } from 'zod'
export const articleCandidate = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
})
export const score = z.object({ id: z.string(), score: z.number().finite() })
export const question = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(200).optional(),
  question: z
    .string()
    .min(1)
    .max(30000)
    .refine((v) => !!v.trim()),
})
export const config = z.object({
  threshold: z.number().min(0).max(1).default(0.6),
})
export function decideChat(
  scores: z.infer<typeof score>[],
  threshold: number,
): { kind: 'show_articles'; articles: string[] } | { kind: 'hand_off' } {
  const selected = scores
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3)
  return selected.length
    ? { kind: 'show_articles', articles: selected.map((a) => a.id) }
    : { kind: 'hand_off' }
}
