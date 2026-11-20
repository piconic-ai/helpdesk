import { z } from 'zod'
import { createSelectSchema } from 'drizzle-zod'
import {
  conversationSchema,
  actorSchema,
  approvalSchema,
  instantSchema,
} from '../conversations/state'
import {
  messages,
  attachmentRow,
  auditRow,
} from '../conversations/conversations-schema'
const summary = z.intersection(
  conversationSchema,
  z.object({ subject: z.string(), createdAt: instantSchema }),
)
const message = createSelectSchema(messages).extend({
  actor: actorSchema.nullable(),
  approval: approvalSchema.nullable(),
})
const receipt = z.object({ id: z.string() })
export const results = {
  bulk: z.object({ token: z.uuid(), count: z.number().int() }),
  undoBulk: z.object({ token: z.uuid(), count: z.number().int() }),
  doctor: z.object({
    ready: z.boolean(),
    issues: z.string().array(),
    domains: z.string().array(),
    providerCheck: z.literal('declared-only'),
  }),
  list: summary.array(),
  get: z.object({
    conversation: summary,
    messages: message.array(),
    attachments: attachmentRow.array(),
    history: summary.array(),
    events: auditRow.array(),
    labels: z.object({ name: z.string() }).array(),
    uncertain: z.string().array(),
  }),
  failures: z
    .object({ mailbox: z.string(), reason: z.string(), at: instantSchema })
    .array(),
  status: z.null(),
  note: z.null(),
  assign: z.null(),
  label: z.null(),
  reply: receipt,
  approve: receipt,
  replyAndClose: receipt,
  discard: z.null(),
  retry: receipt,
  sendReplyNow: receipt,
  undoReply: z.object({
    number: z.int().positive(),
    body: z.string(),
    restoredDraft: z.string().optional(),
  }),
  settings: z.object({
    operators: z
      .object({
        email: z.email(),
        role: z.enum(['admin', 'agent']),
        displayName: z.string(),
      })
      .array(),
    mailboxes: z
      .object({ address: z.email(), product: z.string(), name: z.string() })
      .array(),
    retentionDays: z.number(),
  }),
  mailbox: z.null(),
  role: z.null(),
  retention: z.null(),
  forget: z.null(),
}
