import { z } from 'zod'

const slug =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\/[A-Za-z0-9_][A-Za-z0-9._-]*$/
export const repository = z
  .string()
  .max(150)
  .regex(slug, 'Expected owner/repository')
export const configSchema = z.object({
  repositories: z.record(z.string().min(1), repository),
  helpdeskOrigin: z.url().refine((value) => {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && url.origin === value
  }, 'Expected a public helpdesk origin without a path'),
})
export const positive = z.coerce.number().int().positive().safe()
export const previewInput = z.object({
  number: positive,
  summary: z.string().trim().min(1).max(2000),
})
export const confirmInput = z.object({
  number: positive,
  confirmation: z.uuid(),
})
export const linkInput = z.object({ number: positive, issue: positive })
export const lookupInput = z.object({
  product: z.string().min(1),
  issue: positive,
})
export const issueRef = z.object({ repository, issue: positive })
export const linked = issueRef.extend({ number: positive })
export type Linked = z.infer<typeof linked>
export const post = z.object({ title: z.string(), body: z.string() })
export type IssuePost = z.infer<typeof post>
export const preview = z.object({
  confirmation: z.uuid(),
  number: positive,
  repository,
  title: z.string(),
  body: z.string(),
})
export const storedPreview = preview.extend({
  by: z.string(),
  expiresAt: z.number(),
})
export function postFor(
  number: number,
  summary: string,
  origin: string,
): IssuePost {
  return {
    title: 'Inquiry #' + number,
    body:
      summary +
      '\n\n[#' +
      number +
      '](' +
      origin +
      '/conversation/' +
      number +
      ')',
  }
}
export const issueUrl = (repo: string, issue: number) =>
  'https://github.com/' + repo + '/issues/' + issue
export const linkPrefix = (repo: string, issue: number) =>
  'link/' + repo.toLowerCase() + '/' + issue + '/'
export function productRepo(config: unknown, product: string) {
  const settings = configSchema.parse(config)
  const repo = settings.repositories[product]
  if (typeof repo !== 'string')
    throw new Error('Configure a GitHub repository for this product')
  return { repo, origin: settings.helpdeskOrigin }
}
