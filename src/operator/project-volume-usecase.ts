import type { Context } from '../core/operations/catalog-usecase'
import { visibleProductIds } from '../core/operators/project-access'
import { projectVolume } from './project-volume-store'

export function reportProjectVolume(
  ctx: Context,
  from: number,
  to: number,
  selected: string,
) {
  return projectVolume(
    ctx.env.DB,
    from,
    to,
    visibleProductIds(ctx.operator),
    selected,
  )
}
