import { z } from 'zod'
export const productId = z.string().trim().min(1).max(200)
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(120)
export const article = z.object({
  id: slug,
  product: productId,
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(400).optional(),
  body: z.string().min(1).max(100000),
  status: z.enum(['draft', 'published']),
  updatedAt: z.number().int().nonnegative().optional(),
})
export const config = z.object({
  helpdeskOrigin: z
    .url()
    .refine((v) => {
      const u = new URL(v)
      return ['https:', 'http:'].includes(u.protocol) && u.origin === v
    }, 'Expected a public helpdesk origin')
    .optional(),
})
export const visit = z.object({
  at: z.number(),
  product: productId,
  id: slug,
  answered: z.boolean().optional(),
  presentation: z.uuid().optional(),
})
export const lifetime = 24 * 60 * 60 * 1000
export const articleKey = (product: string, id: string) =>
  'article/' + encodeURIComponent(product) + '/' + id
export const publicPath = (product: string, id?: string) =>
  '/help/articles/' + encodeURIComponent(product) + '/' + (id ?? '')
export type Article = z.output<typeof article>

export function searchArticles(articles: Article[], query: string) {
  const text = query.trim().toLocaleLowerCase()
  return articles.filter((a) =>
    (a.title + ' ' + a.body).toLocaleLowerCase().includes(text),
  )
}
