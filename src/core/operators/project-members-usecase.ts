import { z } from 'zod'
import { PermissionDenied } from '../operations/catalog'
import type { Context } from '../operations/catalog-usecase'
import { can, projectRole } from './project-access'
import {
  readMembers,
  searchPeople,
  saveMember,
  removeMember,
} from './project-members-store'

const address = z.object({
  product: z.string().min(1),
  email: z.email().toLowerCase(),
})
const change = address.extend({ role: projectRole })
const removal = address.extend({
  expectedAssigned: z.coerce.number().int().nonnegative().optional(),
})

function manage(ctx: Context, product: string) {
  if (
    ctx.actor.kind !== 'operator' ||
    !can(ctx.operator, 'manage', product).allowed
  ) {
    throw new PermissionDenied('Permission denied')
  }
  return { actor: JSON.stringify(ctx.actor), now: ctx.now }
}

export async function projectMembers(ctx: Context, product: string) {
  manage(ctx, product)
  return readMembers(ctx.env.DB, product)
}
export async function searchProjectOperators(
  ctx: Context,
  product: string,
  query: string,
) {
  manage(ctx, product)
  return searchPeople(
    ctx.env.DB,
    product,
    z.string().trim().max(320).parse(query),
  )
}
export async function saveProjectMember(
  ctx: Context,
  input: z.input<typeof change>,
) {
  const member = change.parse(input)
  await saveMember(ctx.env.DB, manage(ctx, member.product), member)
}
export async function removeProjectMember(
  ctx: Context,
  input: z.input<typeof removal>,
) {
  const member = removal.parse(input)
  await removeMember(ctx.env.DB, manage(ctx, member.product), member)
}
