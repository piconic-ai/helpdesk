import { expect, it } from 'vitest'
import type { ExtensionEvent, Voice } from '../../core/extensions/extension'
import { improvementRate, proportions } from './outcomes'
import { keyedDraftId } from '../../core/intakes/intake'

const voices: Voice[] = [
  { number: 1, createdAt: 4, product: 'desk', kind: 'inquiry', status: 'open' },
  {
    number: 2,
    createdAt: 9,
    product: 'desk',
    kind: 'feedback',
    status: 'received',
  },
  {
    number: 3,
    createdAt: 9,
    product: 'slide',
    kind: 'inquiry',
    status: 'closed',
  },
]
const ref = { repository: 'Org/App', issue: 2 }
const message = keyedDraftId(1, 'issues:link/org/app/2/1')
function event(
  id: number,
  kind: string,
  payload: Record<string, unknown>,
  number: number | null = 1,
): ExtensionEvent {
  return { id, at: id, kind, number, actor: { kind: 'system' }, payload }
}
const approval = { kind: 'operator', by: 'admin@example.org' }
const events = [
  event(4, 'issues.linked', ref),
  event(5, 'reply_sent', { message: 'unrelated', approval }),
  event(6, 'reply_sent', { message, approval }),
  event(7, 'issues.closed', { ...ref, closedAt: 7 }, null),
  event(8, 'reply_queued', { message, approval }),
  event(9, 'reply_failed', { message }),
  event(10, 'reply_sent', { message, approval }),
  event(11, 'reply_failed', { message }),
  event(12, 'reply_queued', { message, approval }),
  event(13, 'reply_sent', { message, approval }),
]
it('counts unique reporting conversations with delivered closure notices as of the period end, including bounces and retries', () => {
  const rate = (from: number, to: number, product = 'desk') =>
    improvementRate(voices, events, product, from, to)
  for (const to of [7, 8, 9, 10, 12, 13]) expect(rate(0, to).informed).toBe(0)
  expect(rate(0, 11)).toEqual({ improvementRate: 0.5, voices: 2, informed: 1 })
  expect(rate(0, 14)).toEqual({ improvementRate: 0.5, voices: 2, informed: 1 })
  expect(rate(8, 14)).toEqual({ improvementRate: 0, voices: 1, informed: 0 })
  expect(rate(0, 14, '')).toMatchObject({
    improvementRate: 1 / 3,
    voices: 3,
    informed: 1,
  })
  expect(rate(14, 15)).toMatchObject({ improvementRate: null })
  const again = [
    ...events,
    event(14, 'issues.linked', { ...ref, issue: 3 }),
    event(15, 'issues.closed', { ...ref, issue: 3, closedAt: 15 }, null),
    event(16, 'issues.notice_drafted', {
      ...ref,
      issue: 3,
      message: 'notice2',
    }),
    event(17, 'reply_sent', { message: 'notice2', approval }),
  ]
  expect(improvementRate(voices, again, 'desk', 0, 18).informed).toBe(1)
})
it('keeps the closure instant in the after interval and scopes both windows to the same product', () => {
  expect(proportions(voices, new Set([1]), 'desk', 9, 14)).toEqual({
    before: { total: 1, linked: 1, share: 1 },
    after: { total: 1, linked: 0, share: 0 },
  })
})
