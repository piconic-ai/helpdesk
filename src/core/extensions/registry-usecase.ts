import { products } from '../conversations/console-store'
import { migrateExtensions } from './migrations-store'
import { z } from 'zod'
import {
  changeExtensionSetting,
  activationNamespace,
} from './admin-settings-store'
import type { Bindings } from '../settings/bindings'
import { conversationProject } from '../operators/project-targets-store'
import { projectExtensions } from './project-extensions-store'
import { activeExtensions, registry, type Registration } from './registry'
import { readOverrides, deliveryFailures } from './extension-store'
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
  bundledIndexes: Record<string, readonly string[]> = {},
) {
  requireBindings(env)
  const installed =
    env.EXTENSIONS ?? registry(entries, await readOverrides(env.DB))
  for (const { extension } of installed.active)
    requireExtensionBindings(env, extension)
  await inspectStartup(env)
  await migrateExtensions(env.DB, installed.active, bundledIndexes)
  return {
    ...env,
    EXTENSIONS: await projectExtensions(env.DB, installed),
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
  if (target.enabled === enabled && target.enabledBy === ctx.operator.email)
    return null
  const token = ctx.uuid()
  const prior = target.enabledBy
    ? JSON.stringify([Number(target.enabled), target.enabledBy])
    : null
  const changed = await changeExtensionSetting(ctx.env.DB, {
    namespace: activationNamespace,
    key: id,
    next: JSON.stringify([Number(enabled), ctx.operator.email]),
    expected: prior,
    operator: ctx.operator.email,
    now: ctx.now,
    token,
  })
  if (changed === 'conflict') throw new Error('Extension setting changed')
  return changed === 'changed' && enabled && !target.enabled ? token : null
}
export async function management(ctx: Context) {
  if (ctx.operator.role !== 'admin') throw new Error('Administrator required')
  const choices = await products(ctx.env.DB, null, false)
  return {
    entries: await Promise.all(
      (ctx.env.EXTENSIONS?.all ?? []).map(async (i) => ({
        configurationGaps: i.enabled
          ? ((await i.extension.configurationGaps?.(
              extensionContext(ctx, i),
              choices,
            )) ?? [])
          : [],
        summary: i.enabled
          ? await i.extension.settingsSummary?.(extensionContext(ctx, i))
          : undefined,
        id: i.extension.id,
        icon: i.extension.icon,
        enabled: i.enabled,
        permissions: i.extension.permissions,
        secrets: i.extension.secrets ?? [],
        missing: (
          i.extension.requiredSecrets ??
          i.extension.secrets ??
          []
        ).filter((name) => !Reflect.get(ctx.env, name)),
        needsAI: Boolean(i.extension.requiresAI && !ctx.env.AI),
      })),
    ),
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
  const product =
    number === undefined
      ? undefined
      : await conversationProject(ctx.env.DB, number)
  for (const installed of activeExtensions(ctx.env.EXTENSIONS, product)) {
    const api = extensionContext(ctx, installed)
    for (const panel of installed.extension.panels ?? []) {
      if (panel.slot !== slot) continue
      if (panel.available && !(await panel.available(api, number))) continue
      const names = panel.operations.map(
        (n) => installed.extension.id + '.' + n,
      )
      result.push({
        id: installed.extension.id,
        icon: installed.extension.icon,
        slot,
        title: panel.title,
        script: panel.script,
        scriptType: panel.scriptType,
        content: await panel.content?.(api, number),
        links: (await panel.links?.(api, number)) ?? [],
        choices: (await panel.choices?.(api, number)) ?? {},
        choiceLabels: (await panel.choiceLabels?.(api, number)) ?? {},
        operations: operations.filter((o) => names.includes(o.name)),
      })
    }
  }
  return result
}

export async function replyLinks(
  ctx: Context,
  product: string,
  origin: string,
  inbound?: { number: number; id: string },
) {
  const results = await Promise.all(
    activeExtensions(ctx.env.EXTENSIONS, product).map(
      async (item) =>
        item.extension.replyLinks?.(
          extensionContext(ctx, item),
          product,
          inbound,
        ) ?? [],
    ),
  )
  return {
    offerToWrite: results.some((r) => !Array.isArray(r) && r.offerToWrite),
    articles: results
      .flatMap((r) => (Array.isArray(r) ? r : r.links))
      .map((link) => ({
        title: link.title,
        excerpt: link.excerpt,
        url: new URL(link.path, origin).href,
      })),
  }
}
