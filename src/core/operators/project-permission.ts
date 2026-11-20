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
