import { labelName } from './labels'
import { z } from 'zod'
import { instantSchema, inquiryStatusSchema } from './state'
import { transition } from './transitions'

const numbers = z.array(z.number().int().positive()).min(1).max(20)
export const bulkInput = z.discriminatedUnion('action', [
  z.object({
    numbers,
    action: z.literal('assign'),
    email: z.email().toLowerCase().nullable(),
  }),
  z.object({
    numbers,
    action: z.literal('add'),
    label: labelName,
  }),
  z.object({
    numbers,
    action: z.literal('remove'),
    label: z.string().trim().min(1).max(200),
  }),
  z.object({
    numbers,
    action: z.enum(['closed', 'reopened', 'marked_spam', 'unmarked_spam']),
  }),
])
export type InboxChange = z.infer<typeof bulkInput>
const status = z.object({
  kind: z.literal('status'),
  value: z.string(),
  closedAt: z.number().nullable(),
  reviewedBy: z.string().nullable(),
})
export const stateSchema = z.discriminatedUnion('kind', [
  status,
  z.object({ kind: z.literal('assign'), email: z.string().nullable() }),
  z.object({
    kind: z.literal('label'),
    label: z.string(),
    members: z.array(z.number()),
  }),
])
export type InboxState = z.infer<typeof stateSchema>
export type Selected = {
  number: number
  kind: string
  status: string
  assignee: string | null
  closed_at: number | null
  reviewed_by: string | null
  members: number[]
  revision: number
}
export function currentState(row: Selected, change: InboxChange): InboxState {
  if (change.action === 'assign') return { kind: 'assign', email: row.assignee }
  if ('label' in change)
    return { kind: 'label', label: change.label, members: row.members }
  return {
    kind: 'status',
    value: row.status,
    closedAt: row.closed_at,
    reviewedBy: row.reviewed_by,
  }
}
export function nextState(
  row: Selected,
  change: InboxChange,
  now: number,
): InboxState {
  const original = currentState(row, change)
  if (change.action === 'assign') {
    if (row.kind !== 'inquiry') throw new Error('An inquiry is required')
    return { kind: 'assign', email: change.email }
  }
  if ('label' in change)
    return {
      kind: 'label',
      label: change.label,
      members:
        change.action === 'remove'
          ? []
          : row.members.length
            ? row.members
            : [row.number],
    }
  if (row.kind === 'feedback') {
    if (change.action !== 'marked_spam')
      throw new Error('An inquiry is required')
    return { kind: 'status', value: 'spam', closedAt: null, reviewedBy: null }
  }
  const current = inquiryStatusSchema.parse({
    kind: row.status,
    closedAt: row.closed_at,
  })
  const decision = transition(
    current,
    { kind: change.action },
    instantSchema.parse(now),
  )
  if (!decision.ok) return original
  return {
    kind: 'status',
    value: decision.value.kind,
    closedAt: decision.value.kind === 'closed' ? decision.value.closedAt : null,
    reviewedBy: null,
  }
}
export function auditChange(previous: InboxState, next: InboxState) {
  if (next.kind === 'assign')
    return { kind: 'assigned', data: { to: next.email } }
  if (next.kind === 'label')
    return {
      kind: 'label_changed',
      data: {
        name: next.label,
        action: next.members.length ? 'add' : 'remove',
      },
    }
  return {
    kind: 'status_changed',
    data: {
      from: previous.kind === 'status' ? previous.value : undefined,
      to: next.value,
    },
  }
}
export function revisionKind(change: InboxChange) {
  if (change.action === 'assign') return 'assigned'
  if ('label' in change) return 'label_changed'
  return 'status_changed'
}
