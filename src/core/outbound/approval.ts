import type { Actor, Approval, Delivery } from '../conversations/state'

export class ReplyStateConflict extends Error {}

export function replyDelivery(
  actor: Actor,
): Extract<Delivery, { kind: 'queued' | 'awaiting_approval' }> {
  if (actor.kind !== 'operator') return { kind: 'awaiting_approval' }
  return { kind: 'queued', approval: { kind: 'operator', by: actor.id } }
}

export function operatorApproval(actor: Actor): Approval {
  if (actor.kind !== 'operator')
    throw new Error('A human operator must approve this reply')
  return { kind: 'operator', by: actor.id }
}
