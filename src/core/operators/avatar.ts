import { Buffer } from 'node:buffer'
import { PNG } from 'pngjs/browser.js'
import jpeg from 'jpeg-js'

export const maxAvatarBytes = 2 * 1024 * 1024
const size = 96
export class InvalidAvatar extends Error {
  constructor() {
    super('JPEG または PNG の画像（2 MB・200万画素以下）を選んでください。')
  }
}

function decodePng(bytes: Buffer) {
  if (
    bytes.readUInt32BE(8) !== 13 ||
    bytes.toString('ascii', 12, 16) !== 'IHDR'
  )
    throw new InvalidAvatar()
  const pixels = bytes.readUInt32BE(16) * bytes.readUInt32BE(20)
  if (!pixels || pixels > 2_000_000 || bytes[28] !== 0)
    throw new InvalidAvatar()
  for (let offset = 33; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset)
    const type = bytes.toString('ascii', offset + 4, offset + 8)
    offset += 12 + length
    if (type === 'IHDR' || offset > bytes.length) throw new InvalidAvatar()
    if (type === 'IEND' && offset === bytes.length) return PNG.sync.read(bytes)
  }
  throw new InvalidAvatar()
}

function square(image: { width: number; height: number; data: Uint8Array }) {
  const side = Math.min(image.width, image.height)
  const left = (image.width - side) / 2
  const top = (image.height - side) / 2
  const result = new PNG({ width: size, height: size })
  for (let y = 0; y < size; y++) {
    const row = Math.floor(top + ((y + 0.5) * side) / size) * image.width
    for (let x = 0; x < size; x++) {
      const start = (row + Math.floor(left + ((x + 0.5) * side) / size)) * 4
      result.data.set(image.data.subarray(start, start + 4), (y * size + x) * 4)
    }
  }
  return Uint8Array.from(PNG.sync.write(result))
}

export async function avatarImage(file: File) {
  if (!file.size || file.size > maxAvatarBytes) throw new InvalidAvatar()
  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    if (/\.png$/i.test(file.name) && file.type === 'image/png')
      return square(decodePng(bytes))
    if (/\.jpe?g$/i.test(file.name) && file.type === 'image/jpeg')
      return square(
        jpeg.decode(bytes, {
          useTArray: true,
          tolerantDecoding: false,
          maxResolutionInMP: 2,
          maxMemoryUsageInMB: 48,
        }),
      )
  } catch {
    throw new InvalidAvatar()
  }
  throw new InvalidAvatar()
}
