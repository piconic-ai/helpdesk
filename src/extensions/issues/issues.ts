import { z } from 'zod'

const publicText = (value: string) => !/\/conversation\/\d+/i.test(value)
const publicTextError = '運営画面へのリンクを削除してください。'

const slug =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\/[A-Za-z0-9_][A-Za-z0-9._-]*$/
export const repository = z
  .string()
  .max(150)
  .regex(slug, 'Expected owner/repository')
export const configSchema = z.object({
  repositories: z.record(z.string().min(1), repository),
})
export const positive = z.coerce.number().int().positive().safe()
export const previewInput = z.object({
  number: positive,
  title: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .refine(publicText, publicTextError)
    .refine(
      (title) => !/^Inquiry #\d+$/i.test(title),
      '課題の内容が分かる題を入力してください。',
    ),
  summary: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .refine(publicText, publicTextError),
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
export const issuePreviewResult = preview.extend({
  summary: z.string(),
  reference: z.string(),
})
export const storedPreview = issuePreviewResult
  .partial({ summary: true, reference: true })
  .extend({
    by: z.string(),
    expiresAt: z.number(),
  })
export function postFor(
  reference: string,
  title: string,
  summary: string,
): IssuePost {
  return { title, body: summary + '\n\n' + reference }
}
export const issueUrl = (repo: string, issue: number) =>
  'https://github.com/' + repo + '/issues/' + issue
export const linkPrefix = (repo: string, issue: number) =>
  'link/' + repo.toLowerCase() + '/' + issue + '/'
