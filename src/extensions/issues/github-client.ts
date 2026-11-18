import { z } from 'zod'
import { repository, type IssuePost } from './issues'
import type { ExtensionContext } from '../../core/extensions/extension'

const result = z.object({
  number: z.number().int().positive(),
  title: z.string().optional(),
  closed_at: z.iso.datetime().nullish(),
  state: z.enum(['open', 'closed']),
  pull_request: z.undefined().optional(),
})
function githubRequest(
  ctx: ExtensionContext,
  repo: string,
  suffix: string,
  json?: object,
) {
  const url =
    'https://api.github.com/repos/' +
    repository.parse(repo) +
    '/issues' +
    suffix
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'piconic-helpdesk',
    'X-GitHub-Api-Version': '2026-03-10',
  }
  const token = ctx.secret('GITHUB_TOKEN')
  if (token) headers.Authorization = 'Bearer ' + token
  const request = { headers, redirect: 'manual' } as const
  return json
    ? ctx.request(url, {
        ...request,
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
    : ctx.request(url, request)
}
export async function githubIssue(
  ctx: ExtensionContext,
  repo: string,
  action: { read: number } | { create: IssuePost },
) {
  const response =
    'read' in action
      ? await githubRequest(ctx, repo, '/' + action.read)
      : await githubRequest(ctx, repo, '', action.create)
  if (!response.ok)
    throw new Error('GitHub issue request returned HTTP ' + response.status)
  return result.parse(await response.json())
}
export async function linkComment(
  ctx: ExtensionContext,
  repo: string,
  issue: number,
  body: string,
) {
  const response = await githubRequest(ctx, repo, '/' + issue + '/comments', {
    body,
  })
  if (!response.ok)
    throw new Error('GitHub backlink returned HTTP ' + response.status)
}

export async function backlinkExists(
  ctx: ExtensionContext,
  repo: string,
  issue: number,
  body: string,
) {
  let page = 1
  for (;;) {
    const response = await githubRequest(
      ctx,
      repo,
      '/' + issue + '/comments?per_page=100&page=' + page,
    )
    if (!response.ok) throw new Error('Cannot check existing GitHub backlinks')
    const comments = z
      .array(z.object({ body: z.string() }))
      .parse(await response.json())
    if (comments.some((comment) => comment.body === body)) return true
    if (!response.headers.get('Link')?.includes('rel="next"')) return false
    page++
  }
}

export async function selectableIssues(ctx: ExtensionContext, repo: string) {
  const items = []
  let page = 1
  for (;;) {
    const response = await githubRequest(
      ctx,
      repo,
      '?state=all&per_page=100&page=' + page,
    )
    if (!response.ok) throw new Error('Could not read GitHub issues')
    const rows = z
      .array(
        z.object({
          number: z.int().positive(),
          title: z.string(),
          pull_request: z.unknown().optional(),
        }),
      )
      .parse(await response.json())
    items.push(...rows.filter((row) => !row.pull_request))
    if (!response.headers.get('Link')?.includes('rel="next"')) return items
    page++
  }
}
