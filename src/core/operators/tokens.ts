import { z } from 'zod'
import type { Scope } from '../operations/catalog-usecase'

export const tokenAccess = z.enum(['read', 'draft', 'write'])
export const tokenRequest = z.object({
  label: z.string().trim().min(1).max(100),
  access: tokenAccess,
  products: z.array(z.string().min(1)).min(1).optional(),
})
export const tokenSummary = tokenRequest.extend({
  id: z.uuid(),
  created_at: z.number().int().nonnegative(),
})
export function scopesFor(
  access: z.infer<typeof tokenAccess>,
): ReadonlySet<Scope> {
  const scopes = new Set<Scope>(['read'])
  if (access !== 'read') scopes.add('draft')
  if (access === 'write') scopes.add('write')
  return scopes
}
