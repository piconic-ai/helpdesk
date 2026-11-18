import { createRemoteJWKSet, jwtVerify } from 'jose'
import { z } from 'zod'

const keys = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

export async function accessEmail(
  token: string,
  issuer: string,
  audience: string,
) {
  const url = new URL(issuer)
  if (
    url.protocol !== 'https:' ||
    !url.hostname.endsWith('.cloudflareaccess.com') ||
    url.origin !== issuer
  )
    return null
  const jwks =
    keys.get(issuer) ??
    createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer))
  keys.set(issuer, jwks)
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'email'],
    })
    return z.email().safeParse(payload.email).data?.toLowerCase() ?? null
  } catch {
    return null
  }
}
