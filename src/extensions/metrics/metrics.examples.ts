import type { ExtensionEvent } from '../../core/extensions/extension'
function e(
  id: number,
  number: number | null,
  kind: string,
  details: Record<string, unknown> = {},
  actor: unknown = { kind: 'operator', id: 'operator@example.net' },
): ExtensionEvent {
  return {
    id,
    at: id,
    number,
    kind,
    payload: { product: 'shop', ...details },
    actor,
  }
}
export const metricExamples = [
  e(0, 1, 'conversation_opened'),
  e(2, 1, 'conversation_viewed'),
  e(5, 1, 'reply_queued'),
  e(7, 1, 'reply_sent', { approval: { kind: 'operator' } }),
  e(10, 1, 'status_changed', { to: 'closed' }),
  e(11, 1, 'survey.answered', { resolved: false }),
  e(12, null, 'metrics.article_resolved', { resolvedAt: 12, durationMs: 6 }),
  e(13, 2, 'conversation_opened'),
  e(14, 2, 'reply_queued', {}, { kind: 'agent' }),
  e(15, 2, 'status_changed', { to: 'closed' }),
  e(16, 2, 'status_changed', { from: 'closed', to: 'open' }),
  e(17, 2, 'status_changed', { to: 'closed' }),
  e(18, null, 'metrics.article_resolved', {
    product: 'elsewhere',
    resolvedAt: 18,
    durationMs: 1000,
  }),
]
