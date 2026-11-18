import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createSelectSchema } from 'drizzle-zod'

export const outbox = sqliteTable('outbox', {
  message: text('message').primaryKey(),
  attempt: text('attempt').notNull().unique(),
  phase: text('phase', { enum: ['ready', 'sending'] }).notNull(),
  claimedAt: integer('claimed_at'),
  queuedAt: integer('queued_at').notNull(),
})
export const outboxRowSchema = createSelectSchema(outbox)
