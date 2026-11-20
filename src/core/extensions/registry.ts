import { z } from 'zod'
import type { Extension } from './extension'
export type Registration = {
  extension: Extension
  settings: unknown
  enabled: boolean
}
export type Installed = Registration & {
  enabledBy: string | null
  projects?: ReadonlyMap<string, { by: string | null; afterEvent: number }>
}
export function forProject(item: Installed, product: string) {
  if (!item.projects) return item
  const setting = item.projects.get(product)
  return setting
    ? {
        ...item,
        enabledBy: setting.by,
        projects: new Map([[product, setting]]),
      }
    : undefined
}
export function extensionProducts(
  item: Installed,
  scope: readonly string[] | null,
) {
  return item.projects
    ? [...item.projects.keys()].filter(
        (project) => scope === null || scope.includes(project),
      )
    : scope
}
export function activeExtensions(registry?: Registry, product?: string | null) {
  const available = registry?.active ?? []
  return product
    ? available.flatMap((item) => forProject(item, product) ?? [])
    : available
}
export function projectRegistry(registry: Registry, product: string): Registry {
  return { ...registry, active: activeExtensions(registry, product) }
}
export function projectApprover(item: Installed, product?: string) {
  return product ? (forProject(item, product)?.enabledBy ?? null) : null
}

export type Registry = { all: Installed[]; active: Installed[] }
export function registry(
  entries: Registration[],
  overrides: Map<string, { enabled: boolean; by: string }> = new Map(),
): Registry {
  const ids = new Set<string>()
  const all = entries.map((entry) => {
    const id = z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/)
      .parse(entry.extension.id)
    if (ids.has(id)) throw new Error('Duplicate extension ' + id)
    ids.add(id)
    const override = overrides.get(id)
    const enabled = override?.enabled ?? entry.enabled
    let settings = entry.settings
    if (enabled) {
      const parsed = entry.extension.config.safeParse(settings)
      if (!parsed.success)
        throw new Error(
          id +
            ' configuration: ' +
            parsed.error.issues
              .map((i) => i.path.join('.') + ' ' + i.message)
              .join(', '),
        )
      settings = parsed.data
    }
    return { ...entry, settings, enabled, enabledBy: override?.by ?? null }
  })
  return { all, active: all.filter((i) => i.enabled) }
}
