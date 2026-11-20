import { labelName } from '../conversations/labels'
import { z } from 'zod'
import { bulkInput } from '../conversations/inbox-changes'
import { filterSchema } from '../conversations/filters'
import type { Context, Scope, handlers as usecases } from './catalog-usecase'
export class PermissionDenied extends Error {}
export function authorize(
  ctx: Context,
  permission: Scope,
  scopes: ReadonlySet<Scope>,
) {
  if (
    !scopes.has(permission) ||
    (permission === 'admin' && ctx.operator.role !== 'admin') ||
    ((permission === 'send' || permission === 'admin') &&
      ctx.actor.kind !== 'operator')
  )
    throw new PermissionDenied('Permission denied')
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

export function makeCatalog(handlers: typeof usecases) {
  return {
    bulk: operation('write', bulkInput, handlers.bulk),
    undoBulk: operation(
      'write',
      z.object({ token: z.uuid() }),
      handlers.undoBulk,
    ),
    doctor: operation('read', empty, handlers.doctor),
    list: operation('read', filterSchema, (c, i) => handlers.list(c, i)),
    get: operation('read', address, (c, i) => handlers.get(c, i.number)),
    failures: operation('read', empty, handlers.failures),
    status: operation('write', status, handlers.status),
    note: operation('write', address.extend({ body }), handlers.note),
    assign: operation(
      'write',
      address.extend({
        email: email.or(z.literal('')).transform((v) => v || null),
      }),
      handlers.assign,
    ),
    label: operation(
      'write',
      z.discriminatedUnion('action', [
        address.extend({ label: labelName, action: z.literal('add') }),
        address.extend({ label: text, action: z.literal('remove') }),
      ]),
      handlers.label,
    ),
    reply: operation('draft', address.extend({ body }), handlers.reply),
    approve: operation(
      'send',
      message.extend({ body: body.optional() }),
      handlers.approve,
    ),
    discard: operation('send', message, handlers.discard),
    replyAndClose: operation(
      'send',
      address.extend({ body }),
      handlers.replyAndClose,
    ),
    sendReplyNow: operation('send', message, handlers.sendReplyNow),
    undoReply: operation('send', message, handlers.undoReply),
    retry: operation('send', message, handlers.retry),
    settings: operation('admin', empty, handlers.settings),
    mailbox: operation(
      'admin',
      z.object({ product: text, name: text, address: email }),
      handlers.mailbox,
    ),
    role: operation(
      'admin',
      z.object({
        email,
        role: z.enum(['admin', 'agent']),
        displayName: z.string().trim().max(100).optional(),
      }),
      handlers.role,
    ),
    retention: operation(
      'admin',
      z.object({ days: z.coerce.number().int().min(0).max(36500) }),
      handlers.retention,
    ),
    forget: operation('admin', z.object({ contact: email }), handlers.forget),
  }
}
