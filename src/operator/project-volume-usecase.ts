import type { Context } from '../core/operations/catalog-usecase'
import type { ProductScope } from '../core/operators/project-permission'
import { projectVolume } from './project-volume-store'

export function reportProjectVolume(
  ctx: Context,
  from: number,
  to: number,
  scope: ProductScope,
) {
  return projectVolume(ctx.env.DB, from, to, scope)
}
