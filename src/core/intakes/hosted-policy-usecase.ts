import type { Bindings } from '../settings/bindings'
import { intakePolicySchema, type IntakePolicy } from './intake'
import {
  isArchived,
  savedHostedPolicy,
  startHostedIntake,
} from './hosted-policy-store'
import type { Context } from '../operations/catalog-usecase'
import { authorize } from '../operations/catalog'

export async function hostedPolicy(
  env: Pick<Bindings, 'DB' | 'PUBLIC_INTAKES'>,
  product: string,
  origin: string,
): Promise<IntakePolicy | undefined> {
  if (await isArchived(env.DB, product)) return undefined
  if (Object.hasOwn(env.PUBLIC_INTAKES ?? {}, product)) {
    const parsed = intakePolicySchema.safeParse(env.PUBLIC_INTAKES?.[product])
    if (parsed.success && parsed.data.origins.includes(origin))
      return parsed.data
    return undefined
  }
  const publicKey = await savedHostedPolicy(env.DB, product, origin)
  if (publicKey)
    return intakePolicySchema.parse({ publicKey, origins: [origin] })
}

export async function enableHostedIntake(
  ctx: Context,
  product: string,
  origin: string,
) {
  authorize(ctx, 'admin', new Set(['admin']), product)
  if (Object.hasOwn(ctx.env.PUBLIC_INTAKES ?? {}, product))
    throw new Error('Deployment policy takes precedence')
  return startHostedIntake(ctx.env.DB, product, origin, ctx.uuid(), {
    actor: JSON.stringify(ctx.actor),
    now: ctx.now,
  })
}
