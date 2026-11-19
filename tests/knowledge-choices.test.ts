import { expect, it } from 'vitest'
import { decideChat } from '../src/extensions/chat/chat'
import { rankingCases } from '../src/extensions/chat/chat.examples'
import { feedbackCases } from '../src/core/conversations/feedback.examples'
import { decideFeedback } from '../src/core/conversations/feedback'
import { conversationSchema } from '../src/core/conversations/state'
it.each(rankingCases)('F13: $name', ({ scores, expected, human }) =>
  expect(decideChat(scores, 0.6, human)).toEqual(expected),
)
it.each(feedbackCases)(
  'F11: %s feedback + %s → %s',
  (status, event, expected) => {
    const feedback = conversationSchema.parse({
      number: 1,
      product: 'shop',
      mailbox: 'shop@example.com',
      contact: 'a@example.org',
      origin: 'form',
      kind: 'feedback',
      status: { kind: status, by: 'staff' },
    })
    const next = decideFeedback(feedback, event)
    expect(next.ok ? next.status : 'rejected').toBe(expected)
  },
)
