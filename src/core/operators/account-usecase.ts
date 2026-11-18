import { z } from 'zod'
import type { Bindings } from '../settings/bindings'
import { avatarImage } from './avatar'
import { saveProfile, saveSender } from './account-store'

export const displayName = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine(
    (value) => !/[\u0000-\u001f\u007f]/.test(value),
    '改行や制御文字は使えません。',
  )
export async function updateAccount(
  env: Bindings,
  email: string,
  name: string,
  file: File | null,
) {
  const key = file ? crypto.randomUUID() : null
  if (key && file) {
    const bytes = await avatarImage(file)
    await env.RAW.put('avatars/' + key, bytes, {
      httpMetadata: { contentType: 'image/png' },
    })
  }
  const old = await saveProfile(env.DB, email, name, key)
  if (key && old) await env.RAW.delete('avatars/' + old)
}
export function accountImage(env: Bindings, key: string) {
  return env.RAW.get('avatars/' + key)
}
export function updateSender(
  env: Bindings,
  product: string,
  name: string,
  show: boolean,
) {
  return saveSender(env.DB, product, name, show)
}
