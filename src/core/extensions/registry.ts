import { z } from 'zod'
import type { Extension } from './extension'
export type Registration = {
  extension: Extension
  settings: unknown
  enabled: boolean
}
export type Installed = Registration & { enabledBy: string | null }
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
