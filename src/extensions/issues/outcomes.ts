import type { ExtensionEvent, Voice } from '../../core/extensions/extension'
import { keyedDraftId } from '../../core/intakes/intake'
import { linkPrefix, type Linked } from './issues'

export const issueKey = (repository: string, issue: number) =>
  repository.toLowerCase() + '/' + issue

function ref(event: ExtensionEvent) {
  const { repository, issue } = event.payload
  return typeof repository === 'string' && typeof issue === 'number'
    ? issueKey(repository, issue)
    : undefined
}

function noticeReferences(events: ExtensionEvent[]) {
  const messages = new Map<string, { key: string; number: number }>()
  const closed = new Map<string, number>()
  for (const e of events) {
    const key = ref(e)
    if (!key) continue
    if (e.kind === 'issues.closed' && typeof e.payload.closedAt === 'number')
      closed.set(key, Math.min(closed.get(key) ?? Infinity, e.payload.closedAt))
    if (!e.number) continue
    // Historical closure drafts used the link as their idempotency key.
    if (e.kind === 'issues.linked')
      messages.set(
        keyedDraftId(e.number, 'issues:link/' + key + '/' + e.number),
        { key, number: e.number },
      )
    if (
      e.kind === 'issues.notice_drafted' &&
      typeof e.payload.message === 'string'
    )
      messages.set(e.payload.message, { key, number: e.number })
  }
  return { messages, closed }
}
function isHumanApproval(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    value.kind === 'operator'
  )
}
export function sentNotices(events: ExtensionEvent[], to = Infinity) {
  const observed = events.filter((e) => e.at < to)
  const { messages, closed } = noticeReferences(observed)
  const deliveries = deliveryStates(observed)
  const notices = new Map<string, Map<number, number>>()
  for (const e of observed) {
    if (
      e.kind !== 'reply_sent' ||
      typeof e.payload.message !== 'string' ||
      !isHumanApproval(e.payload.approval)
    )
      continue
    const link = messages.get(e.payload.message)
    if (
      !link ||
      link.number !== e.number ||
      deliveries.get(e.payload.message) !== 'reply_sent' ||
      e.at < (closed.get(link.key) ?? Infinity)
    )
      continue
    const sent = notices.get(link.key) ?? new Map<number, number>()
    notices.set(
      link.key,
      sent.set(link.number, Math.max(sent.get(link.number) ?? 0, e.at)),
    )
  }
  return notices
}
export function deliveryStates(events: ExtensionEvent[]) {
  const states = new Map<string, string>()
  for (const e of events)
    if (typeof e.payload.message === 'string') {
      if (e.kind.startsWith('reply_'))
        states.set(
          e.payload.message,
          e.kind === 'reply_held' ? 'reply_drafted' : e.kind,
        )
      else if (
        e.kind === 'issues.notice_drafted' &&
        !states.has(e.payload.message)
      )
        states.set(e.payload.message, 'reply_drafted')
    }
  return states
}

export function improvementRate(
  voices: Voice[],
  events: ExtensionEvent[],
  product: string,
  from: number,
  to: number,
) {
  const cohort = voices.filter(
    (v) =>
      (!product || v.product === product) &&
      v.createdAt >= from &&
      v.createdAt < to,
  )
  const reached = new Set<number>()
  for (const issue of sentNotices(events, to).values())
    for (const number of issue.keys()) reached.add(number)
  const informed = cohort.filter((v) => reached.has(v.number)).length
  return {
    improvementRate: cohort.length ? informed / cohort.length : null,
    voices: cohort.length,
    informed,
  }
}

export function proportions(
  voices: Voice[],
  numbers: Set<number>,
  product: string,
  closedAt: number,
  now: number,
  days = 30,
) {
  const window = days * 86400000
  function count(start: number, end: number) {
    const all = voices.filter(
      (v) => v.product === product && v.createdAt >= start && v.createdAt < end,
    )
    const linked = all.filter((v) => numbers.has(v.number)).length
    return {
      total: all.length,
      linked,
      share: all.length ? linked / all.length : null,
    }
  }
  return {
    before: count(closedAt - window, closedAt),
    after: count(closedAt, Math.min(now + 1, closedAt + window)),
  }
}

export const linkKey = (link: Linked) =>
  linkPrefix(link.repository, link.issue) + link.number
