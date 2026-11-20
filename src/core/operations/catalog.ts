import { labelName } from '../conversations/labels'
import { z } from 'zod'
import { bulkInput } from '../conversations/inbox-changes'
import { filterSchema } from '../conversations/filters'
import type { Context, Scope, handlers as usecases } from './catalog-usecase'
import { can } from '../operators/project-access'
import {
  PermissionDenied,
  requireConversations,
  requireMedia,
  requireProduct,
} from '../operators/project-targets-store'
export { PermissionDenied }

export function authorize(
  ctx: Context,
  permission: Scope,
  scopes: ReadonlySet<Scope>,
  product?: string,
) {
  if (
    !scopes.has(permission) ||
    (permission === 'admin' &&
      !can(ctx.operator, product ? 'manage' : 'global', product).allowed) ||
    ((permission === 'send' || permission === 'admin') &&
      ctx.actor.kind !== 'operator')
  )
    throw new PermissionDenied('Permission denied')
}
// All operation inputs are validated before their resource references are resolved.
const references = z.object({
  product: z.string().optional().catch(undefined),
  number: z.number().optional().catch(undefined),
  numbers: z.array(z.number()).optional().catch(undefined),
  target: z.number().optional().catch(undefined),
  candidateNumber: z.number().optional().catch(undefined),
})
export async function authorizeReferences(
  ctx: Context,
  permission: Scope,
  input: unknown,
) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return
  const refs = references.parse(input)
  if (refs.product) requireProduct(ctx, refs.product, permission)
  const numbers = [
    refs.number,
    refs.target,
    refs.candidateNumber,
    ...(refs.numbers ?? []),
  ].filter((n): n is number => n !== undefined)
  await requireConversations(ctx, numbers, permission)
}
function operation<S extends z.ZodType, T>(
  permission: Scope,
  input: S,
  run: (ctx: Context, i: z.output<S>) => Promise<T>,
) {
  return {
    permission,
    input,
    execute: async (ctx: Context, i: unknown) => {
      const parsed = input.parse(i)
      await authorizeReferences(ctx, permission, parsed)
      if (
        permission === 'send' &&
        parsed &&
        typeof parsed === 'object' &&
        'id' in parsed &&
        typeof parsed.id === 'string'
      )
        await requireMedia(ctx, 'message', parsed.id, permission)
      return run(ctx, parsed)
    },
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
      z.object({
        days: z.coerce.number().int().min(0).max(36500),
        product: text.optional(),
      }),
      handlers.retention,
    ),
    forget: operation(
      'admin',
      z.object({ contact: email, product: text.optional() }),
      handlers.forget,
    ),
  }
}
