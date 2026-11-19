import { z } from 'zod'

const surface = z.enum(['chat', 'form', 'ack', 'composer'])
const probability = z.number().min(0).max(1)
export const presentation = z.object({
  product: z.string().min(1),
  surface,
  question: z.string().min(1).max(100000),
  articles: z
    .array(z.object({ id: z.string().min(1).max(200), score: probability }))
    .max(3),
  highestScore: probability.nullable(),
  contact: z.email().optional(),
  number: z.int().positive().optional(),
  key: z.string().min(1).max(1024).optional(),
})
export const reaction = z.object({
  product: z.string().min(1),
  presentation: z.uuid(),
  surface: surface.optional(),
  action: z.enum(['opened', 'resolved', 'unresolved', 'attached']),
  article: z.string().min(1).max(200).optional(),
  contact: z.email().optional(),
  number: z.int().positive().optional(),
})
export type SuggestionPresentation = z.input<typeof presentation>
export type SuggestionReaction = z.input<typeof reaction>
export type SuggestionCount = { shown: number; opened: number; solved: number }
export type MissingArticle = {
  id: string
  product: string
  question: string
  at: number
}

export const previousInput = presentation.pick({ product: true }).extend({
  surface: z.enum(['ack', 'composer']),
  number: z.int().positive(),
  key: z.string().min(1).max(1024),
})
export type PreviousInput = z.input<typeof previousInput>
export type PreviousSuggestion = {
  presentation: string
  articles: SuggestionPresentation['articles']
  highestScore: number | null
}
