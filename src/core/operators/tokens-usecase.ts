import { z } from 'zod'
import {
  saveToken,
  tokenIdentity,
  ownedTokens,
  tokenProjects,
  revokeToken,
} from './tokens-store'
import type { Operator } from './operators-store'
import { scopesFor, tokenRequest } from './tokens'
import type { Bindings } from '../settings/bindings'
import type { Context } from '../operations/catalog-usecase'

async function digest(secret: string) {
  const hashed = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(secret),
  )
  return Array.from(new Uint8Array(hashed), (v) =>
    v.toString(16).padStart(2, '0'),
  ).join('')
}
export async function issueToken(
  env: Bindings,
  owner: string,
  input: unknown,
  now: number,
) {
  const request = tokenRequest.parse(input)
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const secret =
    'hd_' + Array.from(bytes, (v) => v.toString(16).padStart(2, '0')).join('')
  await saveToken(env.DB, {
    ...request,
    id: crypto.randomUUID(),
    created_at: now,
    owner,
    digest: await digest(secret),
  })
  return secret
}
export async function machineIdentity(
  env: Bindings,
  authorization: string | undefined,
) {
  const match = /^Bearer (hd_[a-f0-9]{64})$/i.exec(authorization ?? '')
  if (!match) return null
  const identity = await tokenIdentity(env.DB, await digest(match[1]))
  if (!identity) return null
  const ctx: Context = {
    env,
    operator: {
      email: identity.email,
      role: identity.role,
      memberships: identity.memberships,
      tokenProducts: identity.products,
    },
    actor: { kind: 'agent', id: identity.id, onBehalfOf: identity.email },
    now: Date.now(),
    uuid: () => crypto.randomUUID(),
  }
  return { ctx, scopes: scopesFor(identity.access) }
}
export const listTokens = (env: Bindings, owner: string) =>
  ownedTokens(env.DB, owner)
export const disableToken = (
  env: Bindings,
  owner: string,
  id: string,
  now: number,
) => revokeToken(env.DB, owner, z.uuid().parse(id), now)

export async function tokenPageData(env: Bindings, operator: Operator) {
  const [tokens, projects] = await Promise.all([
    ownedTokens(env.DB, operator.email),
    tokenProjects(env.DB, operator),
  ])
  return { tokens, projects }
}
