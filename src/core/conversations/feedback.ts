import type { Conversation } from './state'

export type FeedbackEvent = 'review' | 'convert' | 'unreview'
type Decision =
  | { ok: true; kind: 'inquiry'; status: 'open' }
  | { ok: true; kind: 'feedback'; status: 'reviewed' | 'received' }
  | { ok: false; reason: string }

export function decideFeedback(
  current: Conversation,
  event: FeedbackEvent,
): Decision {
  if (current.kind !== 'feedback')
    return { ok: false, reason: 'The conversation is already an inquiry' }
  if (current.status.kind === 'spam')
    return {
      ok: false,
      reason: 'Quarantined feedback cannot be reviewed or converted',
    }
  switch (event) {
    case 'unreview':
      return current.status.kind === 'reviewed'
        ? { ok: true, kind: 'feedback', status: 'received' }
        : { ok: false, reason: 'Feedback has not been reviewed' }
    case 'convert':
      if (!current.contact)
        return {
          ok: false,
          reason: 'Feedback without a reply address cannot be converted',
        }
      return { ok: true, kind: 'inquiry', status: 'open' }
    case 'review':
      return current.status.kind === 'received'
        ? { ok: true, kind: 'feedback', status: 'reviewed' }
        : { ok: false, reason: 'Feedback has already been reviewed' }
  }
}
