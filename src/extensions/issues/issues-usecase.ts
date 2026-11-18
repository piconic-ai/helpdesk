import { z } from 'zod'
import type { ExtensionContext } from '../../core/extensions/extension'
import {
  confirmInput,
  issueUrl,
  linked,
  linkInput,
  linkPrefix,
  lookupInput,
  postFor,
  previewInput,
  productRepo,
  configSchema,
  repository as repositorySchema,
  storedPreview,
  type Linked,
} from './issues'
import { githubIssue, linkComment, backlinkExists } from './github-client'

const repositoryOverride = z.union([
  repositorySchema,
  z.object({
    repo: repositorySchema,
    origin: configSchema.shape.helpdeskOrigin,
  }),
])
async function repositoryConfig(ctx: ExtensionContext, product: string) {
  const config = configSchema.parse(ctx.config)
  const value = await ctx.get('repository/' + product)
  if (value == null) return config
  const saved = repositoryOverride.parse(value)
  const repo = typeof saved === 'string' ? saved : saved.repo
  return {
    repositories: { ...config.repositories, [product]: repo },
    helpdeskOrigin:
      typeof saved === 'string' ? config.helpdeskOrigin : saved.origin,
  }
}
export async function configuredRepository(
  ctx: ExtensionContext,
  product: string,
) {
  return (await repositoryConfig(ctx, product)).repositories[product]
}
export async function issueDestination(ctx: ExtensionContext, product: string) {
  return productRepo(await repositoryConfig(ctx, product), product)
}
function operator(ctx: ExtensionContext) {
  if (ctx.actor.kind !== 'operator')
    throw new Error('An operator must review and confirm the GitHub post')
  return ctx.actor.id
}

export async function previewIssue(ctx: ExtensionContext, input: unknown) {
  const by = operator(ctx)
  const { number, summary } = previewInput.parse(input)
  const { product } = await ctx.contact(number)
  const { repo, origin } = await issueDestination(ctx, product)
  const confirmation = crypto.randomUUID()
  const proposal = {
    number,
    confirmation,
    repository: repo,
    ...postFor(number, summary, origin),
  }
  await ctx.put('preview/' + confirmation, {
    ...proposal,
    by,
    expiresAt: ctx.now + 15 * 60000,
  })
  return proposal
}
async function saveLink(ctx: ExtensionContext, link: Linked) {
  const key = linkPrefix(link.repository, link.issue) + link.number
  if (await ctx.create(key, link))
    await ctx.emit('linked', link.number, {
      repository: link.repository,
      issue: link.issue,
    })
  return { ...link, url: issueUrl(link.repository, link.issue) }
}
export async function createIssue(ctx: ExtensionContext, input: unknown) {
  const by = operator(ctx)
  const { number, confirmation } = confirmInput.parse(input)
  const proposal = storedPreview.parse(await ctx.get('preview/' + confirmation))
  if (
    proposal.by !== by ||
    proposal.number !== number ||
    proposal.expiresAt < ctx.now
  )
    throw new Error('Preview this issue again before creating it')
  const { repo } = await issueDestination(
    ctx,
    (await ctx.contact(number)).product,
  )
  if (proposal.repository !== repo)
    throw new Error('Repository changed. Preview the issue again.')
  if (!ctx.secret('GITHUB_TOKEN'))
    throw new Error('Configure GITHUB_TOKEN for the issues extension')
  if (!(await ctx.create('claimed/' + confirmation, proposal.expiresAt)))
    throw new Error(
      'This preview has already been submitted. Check the repository before retrying.',
    )
  const remote = await githubIssue(ctx, repo, {
    create: { title: proposal.title, body: proposal.body },
  })
  const saved = await saveLink(ctx, {
    number,
    repository: repo,
    issue: remote.number,
  })
  await ctx.remove('preview/' + confirmation)
  return saved
}
export async function linkIssue(ctx: ExtensionContext, input: unknown) {
  const { number, issue } = linkInput.parse(input)
  operator(ctx)
  const { repo, origin } = await issueDestination(
    ctx,
    (await ctx.contact(number)).product,
  )
  const key = linkPrefix(repo, issue) + number
  if (!(await ctx.get(key))) {
    if (!ctx.secret('GITHUB_TOKEN'))
      throw new Error('Configure GITHUB_TOKEN for the issues extension')
    await githubIssue(ctx, repo, { read: issue })
    const body = '[#' + number + '](' + origin + '/conversation/' + number + ')'
    if (await ctx.create('backlink/' + key, true)) {
      await linkComment(ctx, repo, issue, body)
    } else if (!(await backlinkExists(ctx, repo, issue, body))) {
      throw new Error(
        'Check the issue and add the following backlink before retrying: ' +
          body,
      )
    }
  }
  return saveLink(ctx, { repository: repo, number, issue })
}
async function loadLinks(ctx: ExtensionContext, prefix: string) {
  const rows = await ctx.list(prefix)
  return rows.map((row) => linked.parse(row.value))
}
export async function issueLinks(ctx: ExtensionContext, input: unknown) {
  const { product, issue } = lookupInput.parse(input)
  const { repo } = await issueDestination(ctx, product)
  return loadLinks(ctx, linkPrefix(repo, issue))
}
export async function panelLinks(ctx: ExtensionContext, number?: number) {
  if (!number) return []
  const links = await loadLinks(ctx, 'link/')
  const mine = links.filter((link) => link.number === number)
  const addresses = new Map<string, string>()
  for (const issue of mine) {
    addresses.set(
      issueUrl(issue.repository, issue.issue),
      issue.repository + '#' + issue.issue,
    )
    for (const sibling of links) {
      if (
        sibling.repository === issue.repository &&
        sibling.issue === issue.issue &&
        sibling.number !== number
      )
        addresses.set(
          '/conversation/' + sibling.number,
          'Inquiry #' + sibling.number,
        )
    }
  }
  return Array.from(addresses, ([href, label]) => ({ href, label }))
}
async function checkIssue(ctx: ExtensionContext, links: Linked[]) {
  const { repository, issue } = links[0]
  const remote = await githubIssue(ctx, repository, { read: issue })
  if (remote.state !== 'closed') return
  if (remote.closed_at)
    await ctx.emit(
      'closed',
      links[0].number,
      { repository, issue, closedAt: Date.parse(remote.closed_at) },
      repository + '/' + issue + '/' + remote.closed_at,
    )

  for (const link of links) {
    const key = linkPrefix(repository, issue) + link.number
    await ctx.draft(
      link.number,
      'The issue associated with your report has been closed. Thank you for letting us know.',
      key,
    )
    await ctx.put('notified/' + key, true)
  }
}
export async function pollIssues(ctx: ExtensionContext) {
  for (const { key, value } of await ctx.list('preview/')) {
    const proposal = storedPreview.parse(value)
    if (proposal.expiresAt < ctx.now) {
      await ctx.remove(key)
    }
  }
  const links = await loadLinks(ctx, 'link/')
  for (const { key, value } of await ctx.list('claimed/')) {
    if (typeof value === 'number' && value < ctx.now) await ctx.remove(key)
  }
  const notified = new Set((await ctx.list('notified/')).map((row) => row.key))
  const groups = new Map<string, Linked[]>()
  for (const link of links) {
    const key = linkPrefix(link.repository, link.issue)
    if (notified.has('notified/' + key + link.number)) continue
    const group = groups.get(key) ?? []
    group.push(link)
    groups.set(key, group)
  }
  const failures = []
  for (const group of groups.values()) {
    try {
      await checkIssue(ctx, group)
    } catch (error) {
      failures.push(error)
    }
  }
  if (failures.length)
    throw new AggregateError(failures, 'GitHub issue synchronization failed')
}

export { selectableIssues as issueChoices } from './github-client'
