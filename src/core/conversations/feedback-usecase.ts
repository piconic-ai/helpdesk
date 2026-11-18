import { getConversation } from './conversations-store'
import { actorSchema } from './state'
import { decideFeedback, type FeedbackEvent } from './feedback'
import { applyFeedback } from './feedback-store'
export async function changeFeedback(
  env: { DB: D1Database },
  number: number,
  rawActor: unknown,
  now: number,
  event: FeedbackEvent,
) {
  const current = await getConversation(env.DB, number)
  const actor = actorSchema.parse(rawActor)
  const next = decideFeedback(current, event)
  if (!next.ok) throw new Error(next.reason)
  if (actor.kind !== 'operator')
    throw new Error(
      'This feedback operation requires an operator and active feedback',
    )
  return applyFeedback(
    env.DB,
    number,
    current.status.kind,
    next.kind,
    next.status,
    event === 'review' ? actor.id : null,
    actor,
    now,
  )
}
