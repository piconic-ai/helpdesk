import { drainDeleted } from '../retention/retention-store'
import type { Context } from '../operations/catalog-usecase'
import { PermissionDenied } from '../operations/catalog'
import { can, visibleProductIds } from '../operators/project-access'
import { copyLabels } from '../conversations/label-colors-store'
import {
  operatorMemberships,
  projectDirectory,
  projectMailboxes,
  saveProjectLifecycle,
  deleteReviewedProject,
  usedPrefixes,
} from './project-settings-store'
import {
  availablePrefix,
  ticketPrefixSchema,
} from '../conversations/ticket-reference'
import { listOperators } from '../operators/operators-store'

export function requireSettings(ctx: Context, product?: string) {
  const access = can(
    ctx.operator,
    product === undefined ? 'global' : 'manage',
    product,
  )
  if (!access.allowed) throw new PermissionDenied(access.reason)
}
export async function settingsProjects(ctx: Context) {
  const rows = await projectDirectory(
    ctx.env.DB,
    visibleProductIds(ctx.operator),
  )
  return rows.filter((p) => can(ctx.operator, 'manage', p.id).allowed)
}
export async function projectSettingValues(ctx: Context, product: string) {
  requireSettings(ctx, product)
  const [info, mailboxes] = await Promise.all([
    projectDirectory(ctx.env.DB, [product]),
    projectMailboxes(ctx.env.DB, product),
  ])
  const project = info[0]
  if (!project) return null
  return { project, mailboxes, operators: [], retentionDays: project.days }
}
export async function settingsOperators(ctx: Context) {
  requireSettings(ctx)
  const [operators, memberships] = await Promise.all([
    listOperators(ctx.env.DB),
    operatorMemberships(ctx.env.DB),
  ])
  return operators.map((o) => ({
    ...o,
    projects: memberships.filter((m) => m.email === o.email),
  }))
}
export async function projectLabelCopy(ctx: Context, from: string, to: string) {
  requireSettings(ctx, to)
  if (!can(ctx.operator, 'read', from).allowed)
    throw new PermissionDenied('Permission denied')
  await copyLabels(ctx.env.DB, from, to)
}
export async function prefixSuggestion(ctx: Context, prefix: unknown) {
  return availablePrefix(
    ticketPrefixSchema.parse(prefix),
    await usedPrefixes(ctx.env.DB),
  )
}
export async function changeLifecycle(
  ctx: Context,
  product: string,
  change: Parameters<typeof saveProjectLifecycle>[3],
) {
  requireSettings(ctx, change.kind === 'archive' ? undefined : product)
  await saveProjectLifecycle(
    ctx.env.DB,
    { actor: JSON.stringify(ctx.actor), now: ctx.now },
    product,
    change,
  )
}

export async function deleteProject(
  ctx: Context,
  review: Parameters<typeof deleteReviewedProject>[2],
) {
  requireSettings(ctx)
  const extensions =
    (await ctx.env.projectDeletion?.(ctx.env.DB, review.product)) ?? []
  await deleteReviewedProject(
    ctx.env.DB,
    { actor: JSON.stringify(ctx.actor), now: ctx.now },
    review,
    extensions,
  )
  await drainDeleted(ctx.env.DB, ctx.env.RAW)
}
