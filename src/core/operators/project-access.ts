import { z } from 'zod'

export const projectRole = z.enum(['admin', 'agent'])
export type ProjectRole = z.infer<typeof projectRole>
type Authority = {
  role: ProjectRole
  memberships?: Readonly<Record<string, ProjectRole>>
  tokenProducts?: readonly string[]
}
export type ProjectAction = 'read' | 'work' | 'manage' | 'global'

export function can(
  actor: Authority,
  action: ProjectAction,
  productId?: string,
) {
  if (action === 'global') {
    const allowed = actor.role === 'admin' && actor.tokenProducts === undefined
    return {
      allowed,
      reason: allowed ? 'global_admin' : 'global_admin_required',
    }
  }
  if (
    !productId ||
    (actor.tokenProducts && !actor.tokenProducts.includes(productId))
  ) {
    return { allowed: false, reason: 'outside_project_scope' }
  }
  if (actor.role === 'admin') return { allowed: true, reason: 'global_admin' }
  const role =
    actor.memberships && Object.hasOwn(actor.memberships, productId)
      ? actor.memberships[productId]
      : undefined
  if (!role) return { allowed: false, reason: 'not_a_member' }
  if (action === 'manage' && role !== 'admin') {
    return { allowed: false, reason: 'project_admin_required' }
  }
  return { allowed: true, reason: 'member' }
}

export function visibleProductIds(actor: Authority): string[] | null {
  if (can(actor, 'global').allowed) return null
  const candidates = actor.tokenProducts ?? Object.keys(actor.memberships ?? {})
  return candidates.filter((id) => can(actor, 'read', id).allowed)
}
