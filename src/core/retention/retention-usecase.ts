import type { Bindings } from '../settings/bindings'
import { deleteContent, drainDeleted, retentionDays } from './retention-store'
export async function purgeExpired(env: Bindings, now: number) {
  const days = await retentionDays(env.DB)
  if (days > 0) await deleteContent(env.DB, { before: now - days * 86400000 })
  await drainDeleted(env.DB, env.RAW)
}
