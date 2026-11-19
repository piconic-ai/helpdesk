import { avatarImage } from './avatar'

export async function saveAvatarImage(
  bucket: R2Bucket,
  prefix: string,
  file: File,
) {
  const bytes = await avatarImage(file)
  const key = crypto.randomUUID()
  await bucket.put(prefix + key, bytes, {
    httpMetadata: { contentType: 'image/png' },
  })
  return key
}
