import { beforeAll, afterAll, expect, it, vi } from 'vitest'
import { generateKeyPair, exportJWK, SignJWT } from 'jose'
import { accessEmail } from '../src/core/operators/access-client'

const issuer = 'https://helpdesk-unit.cloudflareaccess.com'
const audience = 'helpdesk'
const team = await generateKeyPair('RS256')
const other = await generateKeyPair('RS256')
beforeAll(async () => {
  const jwk = {
    ...(await exportJWK(team.publicKey)),
    kid: 'team',
    alg: 'RS256',
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: URL) => {
      expect(String(url)).toBe(issuer + '/cdn-cgi/access/certs')
      return Response.json({ keys: [jwk] })
    }),
  )
})
afterAll(() => vi.unstubAllGlobals())

it.each([
  ['valid', issuer, audience, '1h', team, true],
  ['expired', issuer, audience, '1s ago', team, false],
  ['other application', issuer, 'other', '1h', team, false],
  [
    'other issuer',
    'https://other.cloudflareaccess.com',
    audience,
    '1h',
    team,
    false,
  ],
  ['untrusted signing key', issuer, audience, '1h', other, false],
] as const)(
  'F01-AC11: %s token',
  async (_name, iss, aud, expiration, pair, accepted) => {
    const token = await new SignJWT({ email: 'USER@example.org' })
      .setProtectedHeader({ alg: 'RS256', kid: 'team' })
      .setIssuer(iss)
      .setAudience(aud)
      .setExpirationTime(expiration)
      .sign(pair.privateKey)
    expect(await accessEmail(token, issuer, audience)).toBe(
      accepted ? 'user@example.org' : null,
    )
  },
)
