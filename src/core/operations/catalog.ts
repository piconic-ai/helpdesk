import type { Scope, Context } from './catalog-usecase'
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
