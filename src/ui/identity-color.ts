import { identityPalette } from './identity-palette'
export { identityPalette }
export const identityColorNames = [
  '青',
  '水色',
  '紫',
  '桃',
  '橙',
  '黄緑',
  '茶',
  '灰',
] as const

export function identityColor(key: string) {
  let hash = 2166136261
  for (const char of key.normalize('NFC').trim().toLowerCase())
    hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619)
  return (hash >>> 0) % identityPalette.length
}

const graphemes = new Intl.Segmenter('ja', { granularity: 'grapheme' })
export function initial(text: string) {
  const first = graphemes.segment(text.trim()).containing(0)
  return first?.segment.toLocaleUpperCase('ja') || '？'
}
