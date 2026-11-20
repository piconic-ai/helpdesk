import { z } from 'zod'

export const cannedCandidate = z.object({
  kind: z.literal('canned'),
  id: z.string(),
  title: z.string(),
  summary: z.string(),
})
export type CannedCandidate = z.infer<typeof cannedCandidate>
export const cannedChoice = cannedCandidate
  .pick({ kind: true, id: true, title: true })
  .extend({ body: z.string(), presentation: z.uuid() })
export type CannedChoice = z.infer<typeof cannedChoice>

export function rankTemplates(scores: { id: string; score: number }[]) {
  return scores
    .filter(({ score }) => score >= 0.6 && score <= 1)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3)
    .map(({ id }) => id)
}

const normalize = (text: string) => text.normalize('NFKC').toLowerCase().trim()

export function matchTemplates(
  candidates: CannedCandidate[],
  subject: string,
  labels: string[],
) {
  const title = normalize(subject)
  const tags = labels.map(normalize)
  return rankTemplates(
    candidates.map(({ id, title: name }) => {
      const terms = [id, name].map(normalize)
      const subjectMatch = terms.some((term) => term && title.includes(term))
      const labelMatch = terms.some((term) => tags.includes(term))
      return {
        id,
        score:
          subjectMatch && labelMatch
            ? 1
            : labelMatch
              ? 0.7
              : subjectMatch
                ? 0.6
                : 0,
      }
    }),
  )
}
