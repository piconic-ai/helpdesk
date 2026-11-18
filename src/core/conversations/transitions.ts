import type { InquiryStatus, Instant } from './state'

export type InquiryEvent =
  | { kind: 'customer_replied' }
  | { kind: 'operator_replied' }
  | { kind: 'closed' }
  | { kind: 'reopened' }
  | { kind: 'marked_spam' }
  | { kind: 'unmarked_spam' }

type Target = InquiryStatus['kind'] | 'reject'
const targets = {
  open: {
    customer_replied: 'open',
    operator_replied: 'pending',
    closed: 'closed',
    reopened: 'reject',
    marked_spam: 'spam',
    unmarked_spam: 'reject',
  },
  pending: {
    customer_replied: 'open',
    operator_replied: 'pending',
    closed: 'closed',
    reopened: 'open',
    marked_spam: 'spam',
    unmarked_spam: 'reject',
  },
  closed: {
    customer_replied: 'open',
    operator_replied: 'reject',
    closed: 'reject',
    reopened: 'open',
    marked_spam: 'spam',
    unmarked_spam: 'reject',
  },
  spam: {
    customer_replied: 'spam',
    operator_replied: 'reject',
    closed: 'reject',
    reopened: 'reject',
    marked_spam: 'reject',
    unmarked_spam: 'open',
  },
} satisfies Record<InquiryStatus['kind'], Record<InquiryEvent['kind'], Target>>

export type TransitionResult =
  | { ok: true; value: InquiryStatus }
  | { ok: false; reason: string }

export function transition(
  status: InquiryStatus,
  event: InquiryEvent,
  now: Instant,
): TransitionResult {
  const target = targets[status.kind][event.kind]
  switch (target) {
    case 'reject':
      return {
        ok: false,
        reason: `Cannot apply ${event.kind} to ${status.kind}`,
      }
    case 'closed':
      return { ok: true, value: { kind: 'closed', closedAt: now } }
    case 'spam':
    case 'open':
    case 'pending':
      return { ok: true, value: { kind: target } }
  }
}
