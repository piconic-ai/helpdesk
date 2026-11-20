import type { Bindings } from '../settings/bindings'
import {
  deleteContent,
  drainDeleted,
  retentionPolicies,
} from './retention-store'
export async function purgeExpired(
  env: Pick<Bindings, 'DB' | 'RAW'>,
  now: number,
) {
  for (const { product, days } of await retentionPolicies(env.DB)) {
    if (days > 0)
      await deleteContent(env.DB, { product, before: now - days * 86400000 })
  }
  await drainDeleted(env.DB, env.RAW)
}
