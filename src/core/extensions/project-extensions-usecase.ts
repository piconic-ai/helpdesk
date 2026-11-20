import type { Context } from '../operations/catalog-usecase'
import { requireSettings } from '../settings/project-settings-usecase'
import { saveProjectExtension as writeSetting } from './project-extensions-store'
export async function saveProjectExtension(
  c: Context,
  product: string,
  id: string,
  enabled: boolean,
) {
  requireSettings(c, product)
  const item = c.env.EXTENSIONS?.all.find(
    (entry) => entry.extension.id === id && entry.enabled,
  )
  if (!item) return false
  await writeSetting(
    c.env.DB,
    product,
    id,
    enabled,
    c.operator.email,
    c.now,
    item.enabled,
  )
  return true
}
