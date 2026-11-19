import type { Bindings } from '../settings/bindings'
import { chatEmbedSites } from './public-settings-store'
import { hostedPolicy } from './hosted-policy-usecase'
import { z } from 'zod'
import {
  actorSchema,
  instantSchema,
  numberSchema,
} from '../conversations/state'
import {
  intakeSchema,
  embeddingPage,
  submissionSchema,
  keyedDraftId,
  type IntakePolicy,
} from './intake'
import { open, append, draft, contactInfo, consumeWindow } from './intake-store'
import { verifyTurnstile } from './turnstile-client'

type Env = Pick<Bindings, 'DB' | 'PUBLIC_INTAKES'>
function action(actor: unknown, now: number) {
  return {
    id: crypto.randomUUID(),
    actor: actorSchema.parse(actor),
    now: instantSchema.parse(now),
  }
}
async function registeredSourcePage(env: Env, product: string, value?: string) {
  const page = embeddingPage(value)
  if (!page) return
  const origin = new URL(page).origin
  if ((await chatEmbedSites(env.DB, product)).includes(origin)) return page
  if (await hostedPolicy(env, product, origin)) return page
}

export async function openIntake(
  env: Env,
  input: unknown,
  actor: unknown,
  now: number,
) {
  const intake = intakeSchema.parse(input)
  intake.sourcePage =
    intake.origin === 'chat'
      ? await registeredSourcePage(env, intake.product, intake.sourcePage)
      : undefined
  return open(env.DB, intake, action(actor, now))
}
export function addInboundMessage(
  env: Env,
  number: number,
  body: string,
  actor: unknown,
  now: number,
) {
  return append(
    env.DB,
    numberSchema.parse(number),
    submissionSchema.shape.body.parse(body),
    action(actor, now),
  )
}
export function saveDraft(
  env: Env,
  number: number,
  body: string,
  actor: unknown,
  now: number,
  key?: string,
) {
  const a = action(actor, now)
  const id = key === undefined ? a.id : keyedDraftId(number, key)
  return draft(
    env.DB,
    numberSchema.parse(number),
    submissionSchema.shape.body.parse(body),
    { ...a, id },
  )
}
export function templateContact(env: Env, number: number) {
  return contactInfo(env.DB, numberSchema.parse(number))
}
export async function verifyIntake(
  env: Env,
  product: string,
  request: Request,
  policy: IntakePolicy,
  now: number,
) {
  const origin = request.headers.get('Origin')
  if (
    !origin ||
    !policy.origins.includes(origin) ||
    request.headers.get('X-Helpdesk-Key') !== policy.publicKey
  )
    return false
  const ip = request.headers.get('CF-Connecting-IP')
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode((ip ?? 'local') + ' ' + product),
  )
  const client = Array.from(new Uint8Array(digest), (n) =>
    n.toString(16).padStart(2, '0'),
  ).join('')
  if (
    !(await consumeWindow(
      env.DB,
      product,
      client,
      Math.floor(now / 60000),
      policy.limitPerMinute,
    ))
  )
    return false
  if (!policy.turnstileSecretBinding) return true
  const secret = z
    .string()
    .min(1)
    .safeParse(Reflect.get(env, policy.turnstileSecretBinding))
  return (
    secret.success &&
    verifyTurnstile(
      secret.data,
      request.headers.get('CF-Turnstile-Response') ?? '',
      new URL(origin).hostname,
      ip,
    )
  )
}
