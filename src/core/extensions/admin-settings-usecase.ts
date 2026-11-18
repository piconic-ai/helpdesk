import { z } from 'zod'
import type { Context } from '../operations/catalog-usecase'
import { authorize } from '../operations/catalog'
import {
  changeExtensionSetting,
  restoreExtensionSetting,
  settingSnapshot,
  activationNamespace,
} from './admin-settings-store'
export { settingSnapshot as readExtensionSettings, activationNamespace }
export async function editExtensionSetting(
  ctx: Context,
  namespace: string,
  key: string,
  next: unknown,
  revision: unknown,
  expected?: unknown,
) {
  authorize(ctx, 'admin', new Set(['admin']))
  const token = ctx.uuid()
  const saved = await changeExtensionSetting(ctx.env.DB, {
    namespace,
    key,
    next: next === undefined ? null : JSON.stringify(next),
    operator: ctx.operator.email,
    now: ctx.now,
    token,
    revision: z.string().optional().parse(revision),
    expected: expected == null ? expected : JSON.stringify(expected),
  })
  return saved === 'changed' ? token : saved === 'unchanged' ? '' : null
}
export async function undoExtensionSetting(
  ctx: Context,
  namespace: string,
  token: unknown,
) {
  authorize(ctx, 'admin', new Set(['admin']))
  return restoreExtensionSetting(
    ctx.env.DB,
    namespace,
    z.uuid().parse(token),
    ctx.operator.email,
    ctx.now,
    ctx.uuid(),
  )
}
export { readPolicyMessage } from './admin-settings-store'
