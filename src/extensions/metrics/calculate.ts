import type { ExtensionEvent } from '../../core/extensions/extension'

type Sample = {
  start: number
  end: number | null
  replies: number
  reopened: boolean
  answer: boolean | null
  work: number
  measured: boolean
  views: Map<string, number>
}
function operatorId(actor: unknown) {
  return actor &&
    typeof actor === 'object' &&
    'kind' in actor &&
    actor.kind === 'operator' &&
    'id' in actor &&
    typeof actor.id === 'string'
    ? actor.id
    : null
}
function apply(s: Sample, e: ExtensionEvent) {
  const actor = operatorId(e.actor)
  if (e.kind === 'conversation_viewed' && actor) s.views.set(actor, e.at)
  if (e.kind === 'reply_queued' && actor) {
    const since = s.views.get(actor)
    if (since !== undefined) {
      s.work += Math.max(0, e.at - since)
      s.measured = true
      s.views.delete(actor)
    }
  }
  if (
    e.kind === 'reply_sent' &&
    e.payload.approval &&
    typeof e.payload.approval === 'object' &&
    'kind' in e.payload.approval &&
    e.payload.approval.kind === 'operator'
  )
    s.replies++
  if (e.kind === 'status_changed' && e.payload.to === 'closed') s.end = e.at
  if (e.kind === 'status_changed' && e.payload.from === 'closed') {
    s.reopened = true
    s.end = null
  }
  if (e.kind === 'survey.answered' && typeof e.payload.resolved === 'boolean')
    s.answer = e.payload.resolved
}
function mean(values: number[]) {
  return values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : null
}
function accumulateConversation(
  samples: Map<number, Sample>,
  event: ExtensionEvent,
) {
  if (!event.number) return
  if (event.kind === 'conversation_opened')
    samples.set(event.number, {
      start: event.at,
      end: null,
      replies: 0,
      reopened: false,
      answer: null,
      work: 0,
      measured: false,
      views: new Map(),
    })
  const sample = samples.get(event.number)
  if (sample) apply(sample, event)
}
export function calculate(
  events: ExtensionEvent[],
  product: string,
  from: number,
  to: number,
) {
  const samples = new Map<number, Sample>()
  const times: number[] = []
  for (const event of [...events].sort((a, b) => a.at - b.at || a.id - b.id)) {
    if (product && event.payload.product !== product) continue
    if (event.kind === 'metrics.article_resolved') {
      const at = event.payload.resolvedAt,
        duration = event.payload.durationMs
      if (
        typeof at === 'number' &&
        at >= from &&
        at < to &&
        typeof duration === 'number'
      )
        times.push(duration)
      continue
    }
    if (event.at >= to) continue
    accumulateConversation(samples, event)
  }
  const closed = [...samples.values()].filter(
    (s) => s.end !== null && s.end >= from,
  )
  for (const s of closed) times.push(s.end! - s.start)
  const first = closed.filter(
    (s) => !s.reopened && s.replies <= 1 && s.answer !== false,
  )
  const work = closed.filter((s) => s.measured)
  return {
    resolutionMs: mean(times),
    firstContactRate: closed.length ? first.length / closed.length : null,
    operatorMs: mean(work.map((s) => s.work)),
    resolved: times.length,
    closed: closed.length,
    measured: work.length,
  }
}
