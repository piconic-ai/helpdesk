import { z } from 'zod'
import type { Context, Scope } from '../operations/catalog-usecase'
import { actingProducts, requireProduct } from './project-permission'
import { conversationProducts, mediaProduct } from './project-targets-store'

export async function requireConversations(
  c: Context,
  numbers: number[],
  permission: Scope,
) {
  if (!numbers.length || actingProducts(c) === null) return
  const ids = [...new Set(numbers)]
  const rows = await conversationProducts(c.env.DB, ids)
  if (rows.results.length !== ids.length)
    throw new Error('Conversation not found')
  for (const row of rows.results) requireProduct(c, row.product, permission)
}

export async function requireMedia(
  c: Context,
  kind: 'message' | 'attachment',
  id: string,
  permission: Scope,
) {
  if (actingProducts(c) === null) return
  const product = await mediaProduct(c.env.DB, kind, id)
  if (!product) throw new Error('Conversation not found')
  requireProduct(c, product, permission)
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
export async function authorizeCoreReferences(
  ctx: Context,
  permission: Scope,
  parsed: unknown,
) {
  await authorizeReferences(ctx, permission, parsed)
  if (
    permission === 'send' &&
    parsed &&
    typeof parsed === 'object' &&
    'id' in parsed &&
    typeof parsed.id === 'string'
  ) {
    await requireMedia(ctx, 'message', parsed.id, permission)
  }
}
