import { z } from 'zod'
export async function verifyTurnstile(
  secret: string,
  token: string,
  hostname: string,
  ip: string | null,
) {
  if (!token || token.length > 2048) return false
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)
  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!response.ok) return false
    const result = z
      .object({ success: z.literal(true), hostname: z.literal(hostname) })
      .safeParse(await response.json())
    return result.success
  } catch {
    return false
  }
}
