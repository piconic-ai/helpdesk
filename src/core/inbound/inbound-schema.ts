import {
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'
import { messages } from '../conversations/conversations-schema'
import { createSelectSchema } from 'drizzle-zod'

export const inboundReceipts = sqliteTable(
  'inbound_receipts',
  {
    rawKey: text('raw_key').primaryKey(),
    message: text()
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    mailbox: text().notNull(),
    sender: text().notNull(),
    sourceId: text('source_id').notNull(),
  },
  (t) => [unique().on(t.mailbox, t.sender, t.sourceId)],
)

export const inboundFailures = sqliteTable('inbound_failures', {
  rawKey: text('raw_key').primaryKey(),
  mailbox: text().notNull(),
  sender: text().notNull(),
  reason: text().notNull(),
  at: integer().notNull(),
})

export const attachments = sqliteTable(
  'attachments',
  {
    key: text().primaryKey(),
    message: text()
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    filename: text().notNull(),
    mime: text().notNull(),
  },
  (t) => [index('attachments_message').on(t.message)],
)

export const receiptSchema = createSelectSchema(inboundReceipts)
export const failureSchema = createSelectSchema(inboundFailures)
export const attachmentSchema = createSelectSchema(attachments)
