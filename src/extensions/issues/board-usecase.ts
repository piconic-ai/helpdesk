import { z } from 'zod'
import { keyedDraftId } from '../../core/intakes/intake'
import type { ExtensionContext, Voice } from '../../core/extensions/extension'
import { githubIssue } from './github-client'
import { linked, linkPrefix, type Linked } from './issues'
import {
  issueKey,
  linkKey,
  proportions,
  sentNotices,
  deliveryStates,
} from './outcomes'

export const remoteState = z.object({
  title: z.string(),
  state: z.enum(['open', 'closed']),
  closedAt: z.number().nullable(),
})
type Remote = Awaited<ReturnType<typeof githubIssue>>
export async function rememberIssue(
  ctx: ExtensionContext,
  repo: string,
  remote: Remote,
  fallback?: string,
) {
  const key = issueKey(repo, remote.number)
  const previous = remoteState
    .nullable()
    .parse((await ctx.get('issue/' + key)) ?? null)
  const closedAt =
    remote.state === 'closed'
      ? remote.closed_at
        ? Date.parse(remote.closed_at)
        : (previous?.closedAt ?? ctx.now)
      : null
  const state = {
    title:
      remote.title ??
      fallback ??
      previous?.title ??
      repo + ' #' + remote.number,
    state: remote.state,
    closedAt,
  }
  await ctx.put('issue/' + key, state)
  if (closedAt !== null)
    await ctx.emit(
      'closed',
      null,
      { repository: repo, issue: remote.number, closedAt },
      key + '/' + closedAt,
    )
  return state
}

export async function loadIssueState(
  ctx: ExtensionContext,
  repo: string,
  issue: number,
) {
  const key = issueKey(repo, issue)
  const cached = remoteState.nullish().parse(await ctx.get('issue/' + key))
  if (cached) return cached
  // Older installations stored links and closure events without caching the GitHub title.
  if (ctx.secret('GITHUB_TOKEN')) {
    const remote = await githubIssue(ctx, repo, { read: issue }).catch(
      () => null,
    )
    if (remote) return rememberIssue(ctx, repo, remote)
  }
  const closure = (await ctx.events('issues.closed')).findLast(
    (e) =>
      typeof e.payload.repository === 'string' &&
      e.payload.repository.toLowerCase() === repo.toLowerCase() &&
      e.payload.issue === issue,
  )
  if (typeof closure?.payload.closedAt === 'number')
    return {
      title: repo + ' #' + issue,
      state: 'closed' as const,
      closedAt: closure.payload.closedAt,
    }
  return null
}

const previousDraft = z
  .union([
    z.boolean(),
    z.number(),
    z.object({ closedAt: z.number(), key: z.string() }),
  ])
  .nullish()
function noticeAttempt(
  link: Linked,
  closedAt: number,
  raw: unknown,
  deliveries: Map<string, string>,
) {
  const prior = previousDraft.parse(raw)
  const base = linkKey(link)
  if (prior === true || (typeof prior === 'number' && prior === closedAt))
    return { key: base, prepared: true }
  if (prior && typeof prior === 'object' && prior.closedAt === closedAt)
    return { key: prior.key, prepared: true }
  const earlier = prior && typeof prior === 'object' ? prior.key : base
  const priorState = deliveries.get(
    keyedDraftId(link.number, 'issues:' + earlier),
  )
  // An unsent notice can cover the latest closure without asking for two approvals.
  const pending =
    priorState &&
    ['reply_drafted', 'reply_queued', 'reply_failed'].includes(priorState)
  return {
    key: prior && !pending ? base + '/closed/' + closedAt : earlier,
    prepared: false,
  }
}
async function closureDraft(
  ctx: ExtensionContext,
  link: Linked,
  closedAt: number,
  states: Map<string, string>,
  manual = false,
) {
  const marker = 'notified/' + linkKey(link)
  const previous = await ctx.get(marker)
  const attempt = noticeAttempt(link, closedAt, previous, states)
  if (previous === true) await ctx.put(marker, { key: attempt.key, closedAt })
  if (!manual && attempt.prepared) return false
  const message = keyedDraftId(link.number, 'issues:' + attempt.key)
  const status = states.get(message)
  if (status === 'reply_discarded' || !status) {
    await ctx.draft(
      link.number,
      'お知らせいただいた問題の修正が完了しました。ご報告いただき、ありがとうございます。',
      attempt.key,
    )
  } else if (attempt.prepared) {
    return status === 'reply_drafted'
  }
  await ctx.emit(
    'notice_drafted',
    link.number,
    { repository: link.repository, issue: link.issue, message },
    attempt.key,
  )
  await ctx.put(marker, { key: attempt.key, closedAt })
  return !status || status === 'reply_discarded' || status === 'reply_drafted'
}

export async function synchronizeIssue(
  ctx: ExtensionContext,
  links: Linked[],
  voices: Map<number, Voice>,
) {
  const { repository, issue } = links[0]
  const remote = await githubIssue(ctx, repository, { read: issue })
  const state = await rememberIssue(ctx, repository, remote)
  if (state.closedAt === null) return
  const states = deliveryStates(await ctx.events())
  for (const link of links)
    if (voices.get(link.number)?.kind === 'inquiry')
      await closureDraft(ctx, link, state.closedAt, states)
}

export async function draftIssueNotices(
  ctx: ExtensionContext,
  repository: string,
  issue: number,
  product: string,
) {
  const [links, voices] = await Promise.all([
    ctx.list(linkPrefix(repository, issue)),
    ctx.voices(),
  ])
  const products = new Map(voices.map((v) => [v.number, v]))
  const members = links
    .map((row) => linked.parse(row.value))
    .filter((l) => products.get(l.number)?.product === product)
  if (!members.length)
    throw new Error(
      '指定したプロダクトにこの課題と関連付けられた声はありません。',
    )
  const state = await loadIssueState(ctx, repository, issue)
  if (state?.closedAt == null) throw new Error('閉じた課題を選んでください。')
  const states = deliveryStates(await ctx.events())
  const targets = members.filter(
    (link) => products.get(link.number)?.kind === 'inquiry',
  )

  let ready = 0
  for (const link of targets)
    if (await closureDraft(ctx, link, state.closedAt, states, true)) ready++
  return ready
}

export async function issueBoard(ctx: ExtensionContext) {
  const [links, stored, voices, events, markers] = await Promise.all([
    ctx.list('link/'),
    ctx.list('issue/'),
    ctx.voices(),
    ctx.events(),
    ctx.list('notified/'),
  ])
  const byNumber = new Map(voices.map((v) => [v.number, v]))
  const states = new Map(
    stored.map((row) => [
      row.key.slice('issue/'.length),
      remoteState.parse(row.value),
    ]),
  )
  const notified = sentNotices(events)
  const deliveries = deliveryStates(events)
  const prepared = new Map(markers.map((row) => [row.key, row.value]))
  const rows = new Map<
    string,
    { repository: string; issue: number; product: string; voices: Voice[] }
  >()
  for (const row of links) {
    const link = linked.parse(row.value)
    const voice = byNumber.get(link.number)
    if (!voice) continue
    const key = JSON.stringify([
      voice.product,
      issueKey(link.repository, link.issue),
    ])
    const group = rows.get(key) ?? {
      repository: link.repository,
      issue: link.issue,
      product: voice.product,
      voices: [],
    }
    group.voices.push(voice)
    rows.set(key, group)
  }
  const absent = new Map<string, Linked>()
  for (const row of links) {
    const link = linked.parse(row.value)
    const key = issueKey(link.repository, link.issue)
    if (!states.has(key) && byNumber.has(link.number)) absent.set(key, link)
  }
  await Promise.all(
    [...absent].map(async ([key, link]) => {
      const state = await loadIssueState(ctx, link.repository, link.issue)
      if (state) states.set(key, state)
    }),
  )
  return [...rows.values()]
    .map((group) => {
      const key = issueKey(group.repository, group.issue)
      const state = states.get(key)
      const numbers = new Set(group.voices.map((v) => v.number))
      const sent = notified.get(key)
      const closedAt = state?.closedAt ?? null
      const informed = group.voices.filter(
        (v) => (sent?.get(v.number) ?? -1) >= (closedAt ?? 0),
      ).length
      const members = group.voices.map((voice) => {
        const link = {
          repository: group.repository,
          issue: group.issue,
          number: voice.number,
        }
        const attempt = noticeAttempt(
          link,
          closedAt ?? 0,
          prepared.get('notified/' + linkKey(link)),
          deliveries,
        )
        const delivery = deliveries.get(
          keyedDraftId(voice.number, 'issues:' + attempt.key),
        )
        return { ...voice, delivery }
      })
      return {
        ...group,
        voices: members,
        title: state?.title ?? group.repository + ' #' + group.issue,
        state: state?.state ?? 'unknown',
        informed,
        remaining: members.filter(
          (v) =>
            v.kind === 'inquiry' &&
            (!v.delivery ||
              ['reply_discarded', 'reply_drafted'].includes(v.delivery)),
        ).length,
        impact:
          closedAt === null
            ? null
            : proportions(voices, numbers, group.product, closedAt, ctx.now),
      }
    })
    .sort(
      (a, b) =>
        b.voices.length - a.voices.length ||
        a.title.localeCompare(b.title, 'ja'),
    )
}
