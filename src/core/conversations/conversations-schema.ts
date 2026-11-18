import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
  actorSchema,
  approvalSchema,
  conversationSchema,
  instantSchema,
  numberSchema,
} from './state'

export const conversations = sqliteTable('conversations', {
  number: integer().primaryKey({ autoIncrement: true }),
  product: text().notNull(),
  mailbox: text().notNull(),
  contact: text().notNull(),
  subject: text().notNull(),
  kind: text().notNull(),
  origin: text().notNull(),
  status: text().notNull(),
  closed_at: integer(),
  created_at: integer().notNull(),
  assignee: text(),
  reviewed_by: text(),
})
export const conversationRow = createSelectSchema(conversations).transform(
  (row) => {
    const state = conversationSchema.parse({
      ...row,
      status: {
        kind: row.status,
        closedAt: row.closed_at,
        by: row.reviewed_by,
      },
      assignment: row.assignee
        ? { kind: 'assigned', to: row.assignee }
        : { kind: 'unassigned' },
    })
    return { ...state, subject: row.subject, createdAt: row.created_at }
  },
)
export const messages = sqliteTable('messages', {
  id: text().primaryKey(),
  number: integer().notNull(),
  kind: text({ enum: ['inbound', 'note', 'outbound'] }).notNull(),
  body: text().notNull(),
  html: text(),
  raw_key: text(),
  message_id: text(),
  in_reply_to: text(),
  refs: text(),
  delivery: text(),
  approval: text(),
  actor: text(),
  reason: text(),
  provider_id: text(),
  sent_at: integer(),
  created_at: integer().notNull(),
})
const storedJson = z.string().transform((value, ctx): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Invalid stored JSON' })
    return z.NEVER
  }
})
const storedActor = storedJson.pipe(actorSchema)
const storedApproval = storedJson.pipe(approvalSchema)
const row = createSelectSchema(messages).extend({
  id: z.string().min(1),
  number: numberSchema,
  created_at: instantSchema,
})
const inactive = {
  delivery: z.null(),
  approval: z.null(),
  sent_at: z.null(),
  provider_id: z.null(),
  reason: z.null(),
}
const outbound = row.extend({ kind: z.literal('outbound'), actor: storedActor })
const undelivered = {
  sent_at: z.null(),
  provider_id: z.null(),
  reason: z.null(),
}
export const messageRow = z.union([
  row.extend({
    ...inactive,
    kind: z.literal('inbound'),
    actor: storedActor.nullable(),
  }),
  row.extend({ ...inactive, kind: z.literal('note'), actor: storedActor }),
  outbound.extend({
    ...undelivered,
    delivery: z.enum(['draft', 'awaiting_approval']),
    approval: z.null(),
  }),
  outbound.extend({
    ...undelivered,
    delivery: z.literal('queued'),
    approval: storedApproval,
  }),
  outbound.extend({
    delivery: z.literal('sent'),
    approval: storedApproval,
    sent_at: instantSchema,
    provider_id: z.string().min(1),
    reason: z.null(),
  }),
  outbound
    .extend({
      delivery: z.literal('failed'),
      approval: storedApproval,
      sent_at: instantSchema.nullable(),
      provider_id: z.string().min(1).nullable(),
      reason: z.string().min(1),
    })
    .refine((row) => (row.sent_at === null) === (row.provider_id === null)),
])
export const attachmentRow = z.object({
  key: z.string(),
  filename: z.string(),
  mime: z.string(),
})
export const auditRow = z.object({
  id: z.number(),
  number: z.number().nullable(),
  kind: z.string(),
  actor: z.string(),
  payload: z.string(),
  at: z.number(),
})
