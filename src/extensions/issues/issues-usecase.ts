import { issueKey, sentNotices } from './outcomes'
import {
  loadIssueState,
  refreshIssueState,
  rememberIssue,
  synchronizeIssue,
} from './board-usecase'
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
  configSchema,
  repository as repositorySchema,
  storedPreview,
  type Linked,
} from './issues'
import { githubIssue, selectableIssues } from './github-client'
import { matchingIssue } from './match-issue'

const repositoryOverride = z.union([
  repositorySchema,
  z.object({ repo: repositorySchema }),
])
export async function configuredRepository(
  ctx: ExtensionContext,
  product: string,
) {
  const value = await ctx.get('repository/' + product)
  if (value == null) return configSchema.parse(ctx.config).repositories[product]
  const saved = repositoryOverride.parse(value)
  return typeof saved === 'string' ? saved : saved.repo
}
export async function issueDestination(ctx: ExtensionContext, product: string) {
  const repo = await configuredRepository(ctx, product)
  if (!repo) throw new Error('Configure a GitHub repository for this product')
  return { repo }
}
function operator(ctx: ExtensionContext) {
  if (ctx.actor.kind !== 'operator')
    throw new Error('An operator must review and confirm the GitHub post')
  return ctx.actor.id
}

export async function previewIssue(ctx: ExtensionContext, input: unknown) {
  const by = operator(ctx)
  const { number, title, summary } = previewInput.parse(input)
  const { product, reference } = await ctx.contact(number)
  const { repo } = await issueDestination(ctx, product)
  const confirmation = crypto.randomUUID()
  const proposal = {
    number,
    confirmation,
    repository: repo,
    summary,
    reference,
    ...postFor(reference, title, summary),
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
  await ctx.create(key, link)
  await ctx.emit(
    'linked',
    link.number,
    { repository: link.repository, issue: link.issue },
    key,
  )
  return {
    ...link,
    url: ctx.demoGithub
      ? '/issues/' + issueKey(link.repository, link.issue)
      : issueUrl(link.repository, link.issue),
  }
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
  const { product, reference } = await ctx.contact(number)
  const { repo } = await issueDestination(ctx, product)
  if (proposal.repository !== repo)
    throw new Error('Repository changed. Preview the issue again.')
  const content = previewInput.safeParse(proposal)
  if (!content.success || proposal.reference !== reference)
    throw new Error('Preview this issue again before creating it')
  const post = postFor(reference, content.data.title, content.data.summary)
  if (proposal.body !== post.body || proposal.title !== post.title)
    throw new Error('Preview this issue again before creating it')
  if (!ctx.secret('GITHUB_TOKEN'))
    throw new Error('Configure GITHUB_TOKEN for the issues extension')
  if (!(await ctx.create('claimed/' + confirmation, proposal.expiresAt)))
    throw new Error(
      'This preview has already been submitted. Check the repository before retrying.',
    )
  const remote = await githubIssue(ctx, repo, {
    create: post,
  })
  await rememberIssue(ctx, repo, remote, proposal.title)
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
  const { repo } = await issueDestination(
    ctx,
    (await ctx.contact(number)).product,
  )
  const key = linkPrefix(repo, issue) + number
  if (!(await ctx.get(key))) {
    if (!ctx.secret('GITHUB_TOKEN'))
      throw new Error('Configure GITHUB_TOKEN for the issues extension')
    await refreshIssueState(ctx, repo, issue)
  }
  return saveLink(ctx, { repository: repo, number, issue })
}
async function loadLinks(ctx: ExtensionContext, prefix: string) {
  const rows = await ctx.list(prefix)
  return rows.map((row) => linked.parse(row.value))
}
async function visibleLinks(ctx: ExtensionContext, links: Linked[]) {
  if (!ctx.visibleNumbers) return links
  const allowed = await ctx.visibleNumbers(links.map((link) => link.number))
  return links.filter((link) => allowed.has(link.number))
}
export async function issueLinks(ctx: ExtensionContext, input: unknown) {
  const { product, issue } = lookupInput.parse(input)
  const { repo } = await issueDestination(ctx, product)
  return visibleLinks(ctx, await loadLinks(ctx, linkPrefix(repo, issue)))
}
export async function panelLinks(ctx: ExtensionContext, number?: number) {
  if (!number) return []
  const links = await visibleLinks(ctx, await loadLinks(ctx, 'link/'))
  const mine = links.filter((link) => link.number === number)
  if (!mine.length) return []
  const states = await Promise.all(
    mine.map((link) => loadIssueState(ctx, link.repository, link.issue)),
  )
  const closed = states.some((state) => state?.state === 'closed')
  const [notices, contact] = closed
    ? await Promise.all([
        ctx.events().then((events) => sentNotices(events)),
        ctx.contact(number),
      ])
    : ([new Map<string, Map<number, number>>(), null] as const)
  const addresses = new Map<
    string,
    {
      label: string
      icon?: {
        name: 'issue_open' | 'issue_fixed' | 'issue_notify'
        label: string
      }
    }
  >()
  mine.forEach((issue, i) => {
    const key = issueKey(issue.repository, issue.issue)
    const state = states[i]
    const latest = notices.get(key)?.get(number) ?? -1
    const pending =
      state?.closedAt != null &&
      latest < state.closedAt &&
      contact?.status !== 'received' &&
      contact?.status !== 'reviewed'
    const icon =
      state?.state === 'open'
        ? ({ name: 'issue_open', label: '開いている' } as const)
        : pending
          ? ({ name: 'issue_notify', label: '知らせる待ち' } as const)
          : state?.state === 'closed'
            ? ({ name: 'issue_fixed', label: '直した' } as const)
            : undefined
    addresses.set(
      ctx.demoGithub
        ? '/issues/' + key
        : issueUrl(issue.repository, issue.issue),
      {
        label: state?.title
          ? state.title + '（' + issue.repository + '#' + issue.issue + '）'
          : issue.repository + '#' + issue.issue,
        icon,
      },
    )
    for (const sibling of links) {
      if (
        issueKey(sibling.repository, sibling.issue) === key &&
        sibling.number !== number
      )
        addresses.set('/conversation/' + sibling.number, {
          label: '会話',
        })
    }
  })
  return Promise.all(
    Array.from(addresses, async ([href, link]) => {
      if (!href.startsWith('/conversation/')) return { href, ...link }
      const other = await ctx.contact(Number(href.split('/').at(-1)))
      return {
        ...link,
        href,
        label: link.label + ' ' + other.reference + ' ' + other.subject,
      }
    }),
  )
}
async function expirePreviews(ctx: ExtensionContext) {
  for (const { key, value } of await ctx.list('preview/')) {
    const proposal = storedPreview.parse(value)
    if (proposal.expiresAt < ctx.now) {
      await ctx.remove(key)
    }
  }
  for (const { key, value } of await ctx.list('claimed/')) {
    if (typeof value === 'number' && value < ctx.now) await ctx.remove(key)
  }
}
export async function pollIssues(ctx: ExtensionContext) {
  await expirePreviews(ctx)
  if (!ctx.secret('GITHUB_TOKEN')) return
  const links = await loadLinks(ctx, 'link/')
  if (!links.length) return
  const voices = new Map((await ctx.voices()).map((v) => [v.number, v]))
  const groups = new Map<string, Linked[]>()
  for (const link of links) {
    const key = linkPrefix(link.repository, link.issue)
    if (!voices.has(link.number)) continue
    const group = groups.get(key) ?? []
    group.push(link)
    groups.set(key, group)
  }
  const failures = []
  for (const group of groups.values()) {
    try {
      await synchronizeIssue(ctx, group, voices)
    } catch (error) {
      failures.push(error)
    }
  }
  if (failures.length)
    throw new AggregateError(failures, 'GitHub issue synchronization failed')
}

export async function issueChoices(
  ctx: ExtensionContext,
  repo: string,
  number: number,
  subject: string,
) {
  const [remote, body, links] = await Promise.all([
    selectableIssues(ctx, repo),
    ctx.inboundBody(number),
    loadLinks(ctx, 'link/' + repo.toLowerCase() + '/'),
  ])
  const allowed = new Set(
    (await visibleLinks(ctx, links)).map((link) => link.issue),
  )
  const known = new Set(links.map((link) => link.issue))
  const choices = remote.filter(
    (item) => !known.has(item.number) || allowed.has(item.number),
  )
  const linked = new Set(
    links.filter((link) => link.number === number).map((link) => link.issue),
  )
  return {
    choices,
    suggested: matchingIssue(choices, subject, body, linked)?.number,
  }
}
