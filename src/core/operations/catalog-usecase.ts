import { changeInbox, undoInbox } from '../conversations/inbox-change-usecase'
import { makeCatalog } from './catalog'
import type { filterSchema } from '../conversations/filters'
import {
  changeGroupLabel,
  visibleConversations,
  groupedDetail,
} from '../extensions/triage-usecase'
import { z } from 'zod'
import type { Bindings } from '../settings/bindings'
import type { Operator } from '../operators/operators-store'
import {
  getConversation,
  changeStatus,
} from '../conversations/conversations-store'
import { instantSchema, actorSchema } from '../conversations/state'
import { transition } from '../conversations/transitions'
import { deleteContent, drainDeleted } from '../retention/retention-store'
import {
  queueReply,
  undoReply,
  sendReplyNow,
  approveReply,
  discardReply,
  retryReply,
} from '../outbound/reply-usecase'
import { diagnose } from '../settings/doctor-usecase'
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
type Ticket = { number: number }
type Reply = Ticket & { body: string }
export const handlers = {
  bulk: changeInbox,
  undoBulk: undoInbox,
  doctor: (c: Context) => diagnose(c.env),
  list: (c: Context, i: z.infer<typeof filterSchema>) =>
    visibleConversations(c.env, i, c.now),
  get: (c: Context, n: number) => groupedDetail(c.env, n),
  failures: (c: Context) => store.inboxFailures(c.env.DB),
  status: async (
    c: Context,
    i: Ticket & {
      event: 'closed' | 'reopened' | 'marked_spam' | 'unmarked_spam'
    },
  ) => {
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
  },
  note: (c: Context, i: Reply) =>
    store.addNote(c.env.DB, audit(c), i, c.uuid()),
  assign: (c: Context, i: Ticket & { email: string | null }) =>
    store.setAssignment(c.env.DB, audit(c), i),
  label: (
    c: Context,
    i: Ticket & { label: string; action: 'add' | 'remove' },
  ) => changeGroupLabel(c.env, audit(c), i),
  reply: (c: Context, i: Reply) =>
    queueReply(c.env, { ...i, undoable: true, actor: c.actor, now: c.now }),
  sendReplyNow: (c: Context, i: { id: string }) =>
    sendReplyNow(c.env, { ...i, actor: c.actor, now: c.now }),
  undoReply: (c: Context, i: { id: string }) =>
    undoReply(c.env, { ...i, actor: c.actor, now: c.now }),
  retry: (c: Context, i: { id: string }) =>
    retryReply(c.env, { ...i, actor: c.actor, now: c.now }),
  replyAndClose: (c: Context, i: Reply) =>
    queueReply(c.env, {
      ...i,
      undoable: true,
      close: true,
      actor: c.actor,
      now: c.now,
    }),
  discard: (c: Context, i: { id: string }) =>
    discardReply(c.env, { ...i, actor: c.actor, now: c.now }),
  approve: (c: Context, i: { id: string; body?: string }) =>
    approveReply(c.env, { ...i, actor: c.actor, now: c.now }),
  settings: (c: Context) => store.adminSettings(c.env.DB),
  mailbox: (
    c: Context,
    i: { product: string; name: string; address: string },
  ) =>
    store.setMailbox(
      c.env.DB,
      audit(c),
      i,
      c.env.EXTENSIONS?.active
        .filter((x) => x.extension.permissions.includes('send'))
        .map((x) => x.extension.id) ?? [],
      c.operator.email,
    ),
  role: (
    c: Context,
    i: { email: string; role: 'admin' | 'agent'; displayName?: string },
  ) => store.setRole(c.env.DB, audit(c), i),
  retention: (c: Context, i: { days: number }) =>
    store.saveRetention(c.env.DB, audit(c), i.days),
  forget: async (c: Context, i: { contact: string }) => {
    await deleteContent(c.env.DB, i)
    await drainDeleted(c.env.DB, c.env.RAW)
  },
}
export const coreOperations = makeCatalog(handlers)
