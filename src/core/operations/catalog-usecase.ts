import {
  visibleConversations,
  groupedDetail,
} from '../extensions/triage-usecase'
import { z } from 'zod'
import type { Bindings } from '../settings/bindings'
import type { Operator } from '../operators/operators-store'
import {
  getConversation,
  changeStatus,
  filterSchema,
} from '../conversations/conversations-store'
import { instantSchema, actorSchema } from '../conversations/state'
import { transition } from '../conversations/transitions'
import { deleteContent, drainDeleted } from '../retention/retention-store'
import { queueReply, approveReply, retryReply } from '../outbound/reply-usecase'
import * as store from './operator-store'

export type Scope = 'read' | 'draft' | 'write' | 'send' | 'admin'
export type Context = {
  env: Bindings
  operator: Operator
  actor: z.input<typeof actorSchema>
  now: number
  uuid: () => string
}
function audit(ctx: Context) {
  return { actor: JSON.stringify(ctx.actor), now: ctx.now }
}
function operation<S extends z.ZodType, T>(
  permission: Scope,
  input: S,
  run: (ctx: Context, i: z.output<S>) => Promise<T>,
) {
  return {
    permission,
    input,
    execute: (ctx: Context, i: unknown) => run(ctx, input.parse(i)),
  }
}
const number = z.coerce.number().int().positive()
const email = z.email().toLowerCase()
const body = z.string().trim().min(1).max(100000)
const address = z.object({ number })
const message = z.object({ id: z.string().min(1) })
const text = z.string().trim().min(1).max(200)
const empty = z.object({})
const status = z.object({
  number,
  event: z.enum(['closed', 'reopened', 'marked_spam', 'unmarked_spam']),
})

export const coreOperations = {
  list: operation('read', filterSchema, (c, i) =>
    visibleConversations(c.env, i, c.now),
  ),
  get: operation('read', address, (c, i) => groupedDetail(c.env, i.number)),
  failures: operation('read', empty, (c) => store.inboxFailures(c.env.DB)),
  status: operation('write', status, async (c, i) => {
    const current = await getConversation(c.env.DB, i.number)
    if (current.kind !== 'inquiry') throw new Error('An inquiry is required')
    const decision = transition(
      current.status,
      { kind: i.event },
      instantSchema.parse(c.now),
    )
    if (!decision.ok) throw new Error(decision.reason)
    await changeStatus(
      c.env.DB,
      audit(c),
      i.number,
      current.status.kind,
      decision.value.kind,
    )
  }),
  note: operation('write', address.extend({ body }), (c, i) =>
    store.addNote(c.env.DB, audit(c), i, c.uuid()),
  ),
  assign: operation(
    'write',
    address.extend({
      email: email.or(z.literal('')).transform((v) => v || null),
    }),
    (c, i) => store.setAssignment(c.env.DB, audit(c), i),
  ),
  label: operation(
    'write',
    address.extend({ label: text, action: z.enum(['add', 'remove']) }),
    (c, i) => store.setLabel(c.env.DB, audit(c), i),
  ),
  reply: operation('draft', address.extend({ body }), (c, i) =>
    queueReply(c.env, { ...i, actor: c.actor, now: c.now }),
  ),
  approve: operation('send', message, (c, i) =>
    approveReply(c.env, { ...i, actor: c.actor, now: c.now }),
  ),
  retry: operation('send', message, (c, i) =>
    retryReply(c.env, { ...i, actor: c.actor, now: c.now }),
  ),
  settings: operation('admin', empty, (c) => store.adminSettings(c.env.DB)),
  mailbox: operation(
    'admin',
    z.object({ product: text, name: text, address: email }),
    (c, i) =>
      store.setMailbox(
        c.env.DB,
        audit(c),
        i,
        c.env.EXTENSIONS?.active
          .filter((x) => x.extension.permissions.includes('send'))
          .map((x) => x.extension.id) ?? [],
        c.operator.email,
      ),
  ),
  role: operation(
    'admin',
    z.object({ email, role: z.enum(['admin', 'agent']) }),
    (c, i) => store.setRole(c.env.DB, audit(c), i),
  ),
  retention: operation(
    'admin',
    z.object({ days: z.coerce.number().int().min(0).max(36500) }),
    (c, i) => store.saveRetention(c.env.DB, audit(c), i.days),
  ),
  forget: operation('admin', z.object({ contact: email }), async (c, i) => {
    await deleteContent(c.env.DB, i)
    await drainDeleted(c.env.DB, c.env.RAW)
  }),
}
