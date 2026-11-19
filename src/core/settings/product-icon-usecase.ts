import type { Bindings } from './bindings'
import { saveAvatarImage } from '../operators/avatar-storage-usecase'
import { readProductIcon, replaceProductIcon } from './product-icon-store'

const prefix = 'product-icons/'
export class InvalidProductIcon extends Error {}

function singleEmoji(value: unknown) {
  if (typeof value === 'string' && /^\p{RGI_Emoji}$/v.test(value.trim()))
    return value.trim()
  throw new InvalidProductIcon('絵文字を1つ入力してください。')
}

export async function changeProductIcon(
  env: Bindings,
  product: string,
  mode: unknown,
  value: unknown,
  file: File | null,
) {
  if (!(await readProductIcon(env.DB, product))) return false
  const emoji = mode === 'emoji' ? singleEmoji(value) : null
  if (!['initial', 'emoji', 'image'].includes(String(mode)))
    throw new InvalidProductIcon('アイコンの種類を選んでください。')
  if (mode === 'image' && !file)
    throw new InvalidProductIcon('アイコンに使う画像を選んでください。')
  const key =
    mode === 'image' && file
      ? await saveAvatarImage(env.RAW, prefix, file)
      : null
  let old
  try {
    old = await replaceProductIcon(env.DB, product, emoji, key)
  } catch (e) {
    if (key) await env.RAW.delete(prefix + key)
    throw e
  }
  if (old) await env.RAW.delete(prefix + old)
  return true
}

export async function productIcon(env: Bindings, product: string) {
  const row = await readProductIcon(env.DB, product)
  if (!row) return null
  const image = row.image_key ? await env.RAW.get(prefix + row.image_key) : null
  return { name: row.name, emoji: row.emoji, image }
}
