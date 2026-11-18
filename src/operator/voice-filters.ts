import { z } from 'zod'

const optionalDate = z.union([z.literal(''), z.iso.date()]).default('')
export const voiceFilters = z
  .object({
    product: z.string().max(200).default(''),
    label: z.string().max(200).default(''),
    unlabeled: z.enum(['', '1']).default(''),
    start: optionalDate,
    end: optionalDate,
    month: z
      .union([z.literal(''), z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/)])
      .default(''),
  })
  .refine(
    (q) =>
      (!q.start || !q.end || q.start <= q.end) && !(q.label && q.unlabeled),
  )
export type VoiceFilters = z.output<typeof voiceFilters>

export function voicePath(
  path: string,
  filters: Partial<VoiceFilters>,
  page = 1,
) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters))
    if (value) query.set(key, value)
  if (page > 1) query.set('page', String(page))
  return query.size ? path + '?' + query : path
}
