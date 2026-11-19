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
  const destination = productRepo(await repositoryConfig(ctx, product), product)
  const url = new URL(destination.origin)
  if (
    !ctx.local &&
    (url.protocol !== 'https:' ||
      /^(?:127\.|0\.0\.0\.0$|\[::1\]$|(?:.*\.)?localhost$)/i.test(url.hostname))
  ) {
    throw new Error(
      'Configure a public HTTPS helpdesk origin for GitHub conversation links.',
    )
  }
  return destination
}
function operator(ctx: ExtensionContext) {
  if (ctx.actor.kind !== 'operator')
    throw new Error('An operator must review and confirm the GitHub post')
  return ctx.actor.id
}

export async function previewIssue(ctx: ExtensionContext, input: unknown) {
  const by = operator(ctx)
  const { number, title, summary } = previewInput.parse(input)
  const { product } = await ctx.contact(number)
  const { repo, origin } = await issueDestination(ctx, product)
  const confirmation = crypto.randomUUID()
  const proposal = {
    number,
    confirmation,
    repository: repo,
    ...postFor(number, title, summary, origin),
  }
  await ctx.put('preview/' + confirmation, {
    ...proposal,
    by,
    expiresAt: ctx.now + 15 * 60000,
  })
  return {
    ...proposal,
    summary,
    conversationUrl: origin + '/conversation/' + number,
  }
}
async function saveLink(ctx: ExtensionContext, link: Linked, origin: string) {
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
      ? new URL('/issues/' + issueKey(link.repository, link.issue), origin).href
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
  const { repo, origin } = await issueDestination(
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
  await rememberIssue(ctx, repo, remote, proposal.title)
  const saved = await saveLink(
    ctx,
    {
      number,
      repository: repo,
      issue: remote.number,
    },
    origin,
  )
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
    await refreshIssueState(ctx, repo, issue)
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
  return saveLink(ctx, { repository: repo, number, issue }, origin)
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
          label: '会話 #' + sibling.number,
        })
    }
  })
  return Promise.all(
    Array.from(addresses, async ([href, link]) => {
      if (!href.startsWith('/conversation/')) return { href, ...link }
      const other = await ctx.contact(Number(href.split('/').at(-1)))
      return { ...link, href, label: link.label + ' ' + other.subject }
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

export { selectableIssues as issueChoices } from './github-client'
