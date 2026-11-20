import type { Context, Scope } from '../operations/catalog-usecase'
import { can, visibleProductIds } from './project-access'

export class PermissionDenied extends Error {}
export type ProductScope = readonly string[] | null

export function scopeBinding(products: ProductScope) {
  return products === null ? null : JSON.stringify(products)
}

// A scheduled or public extension invocation has no operator grant to intersect.
export function actingProducts(c: Context) {
  return c.actor.kind === 'extension' ? null : visibleProductIds(c.operator)
}

export function requireProduct(c: Context, product: string, permission: Scope) {
  if (c.actor.kind === 'extension') return
  const action =
    permission === 'admin' ? 'manage' : permission === 'read' ? 'read' : 'work'
  if (!can(c.operator, action, product).allowed)
    throw new PermissionDenied('Permission denied')
}

export async function requireConversations(
  c: Context,
  numbers: number[],
  permission: Scope,
) {
  if (!numbers.length || actingProducts(c) === null) return
  const ids = [...new Set(numbers)]
  const rows = await c.env.DB.prepare(
    'SELECT product FROM conversations WHERE number IN (SELECT value FROM json_each(?))',
  )
    .bind(JSON.stringify(ids))
    .all<{ product: string }>()
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
  const lookup =
    kind === 'message'
      ? 'WHERE m.id=?'
      : 'JOIN attachments a ON a.message=m.id WHERE a.key=?'
  const product = await c.env.DB.prepare(
    'SELECT c.product FROM conversations c JOIN messages m USING(number) ' +
      lookup,
  )
    .bind(id)
    .first<string>('product')
  if (!product) throw new Error('Conversation not found')
  requireProduct(c, product, permission)
}

export async function accessibleNumbers(
  db: D1Database,
  numbers: readonly number[],
  products: ProductScope,
) {
  if (!products || !numbers.length) return new Set(numbers)
  const rows = await db
    .prepare(
      'SELECT number FROM conversations WHERE number IN (SELECT value FROM json_each(?)) AND product IN (SELECT value FROM json_each(?))',
    )
    .bind(JSON.stringify(numbers), JSON.stringify(products))
    .all<{ number: number }>()
  return new Set(rows.results.map((r) => r.number))
}

export async function isProjectAssignee(
  db: D1Database,
  number: number,
  email: string,
) {
  return !!(await db
    .prepare(
      'SELECT 1 AS member FROM conversations c JOIN product_members pm USING(product) WHERE c.number=? AND pm.email=?',
    )
    .bind(number, email)
    .first('member'))
}

export async function projectOperators(db: D1Database, products: ProductScope) {
  const rows = await db
    .prepare(
      'SELECT product,email FROM product_members WHERE ?1 IS NULL OR product IN (SELECT value FROM json_each(?1))',
    )
    .bind(scopeBinding(products))
    .all<{ product: string; email: string }>()
  return Map.groupBy(rows.results, (row) => row.email)
}
