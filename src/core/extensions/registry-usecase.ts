import { migrateExtensions } from './migrations-store'
import { z } from 'zod'
import type { Bindings } from '../settings/bindings'
import { registry, type Registration } from './registry'
import { readOverrides, setEnabled, deliveryFailures } from './extension-store'
import { describe } from '../operations/runtime-usecase'
import type { Context, Scope } from '../operations/catalog-usecase'
import type { Panel } from './extension'
import { extensionContext } from './context-usecase'
import { intakePolicySchema } from '../intakes/intake'
import {
  requireBindings,
  requireExtensionBindings,
  inspectStartup,
} from '../settings/doctor-usecase'
export async function configure(
  env: Bindings,
  entries: Registration[],
  publicIntakes: Record<string, unknown>,
) {
  requireBindings(env)
  const installed =
    env.EXTENSIONS ?? registry(entries, await readOverrides(env.DB))
  for (const { extension } of installed.active)
    requireExtensionBindings(env, extension)
  await inspectStartup(env)
  await migrateExtensions(env.DB, installed.active)
  return {
    ...env,
    EXTENSIONS: installed,
    PUBLIC_INTAKES: z
      .record(z.string(), intakePolicySchema)
      .parse(env.PUBLIC_INTAKES ?? publicIntakes),
  }
}
export async function toggle(ctx: Context, id: string, enabled: boolean) {
  if (ctx.operator.role !== 'admin' || ctx.actor.kind !== 'operator')
    throw new Error('Administrator required')
  const target = ctx.env.EXTENSIONS?.all.find((x) => x.extension.id === id)
  if (!target) throw new Error('Unknown extension')
  if (enabled) {
    registry([{ ...target, enabled }])
    requireExtensionBindings(ctx.env, target.extension)
  }
  await setEnabled(ctx.env.DB, id, enabled, ctx.operator.email, ctx.now)
}
export async function management(ctx: Context) {
  if (ctx.operator.role !== 'admin') throw new Error('Administrator required')
  return {
    entries: (ctx.env.EXTENSIONS?.all ?? []).map((i) => ({
      id: i.extension.id,
      enabled: i.enabled,
      permissions: i.extension.permissions,
      secrets: i.extension.secrets ?? [],
    })),
    failures: await deliveryFailures(ctx.env.DB),
  }
}
export async function panels(
  ctx: Context,
  scopes: ReadonlySet<Scope>,
  slot: Panel['slot'],
  number?: number,
) {
  const result = []
  const operations = describe(ctx, scopes)
  for (const installed of ctx.env.EXTENSIONS?.active ?? []) {
    const api = extensionContext(ctx, installed)
    for (const panel of installed.extension.panels ?? []) {
      if (panel.slot !== slot) continue
      const names = panel.operations.map(
        (n) => installed.extension.id + '.' + n,
      )
      result.push({
        title: panel.title,
        script: panel.script,
        content: await panel.content?.(api, number),
        links: (await panel.links?.(api, number)) ?? [],
        choices: (await panel.choices?.(api)) ?? {},
        operations: operations.filter((o) => names.includes(o.name)),
      })
    }
  }
  return result
}
