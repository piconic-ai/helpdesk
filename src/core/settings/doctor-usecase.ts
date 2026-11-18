import { checkOnboarding } from './doctor'
import { z } from 'zod'
import type { Bindings } from './bindings'
import type { Extension } from '../extensions/extension'

const required = [
  ['DB', ['prepare', 'batch'], 'd1_databases'],
  ['RAW', ['get', 'head', 'put', 'list', 'delete'], 'r2_buckets'],
  ['JOBS', ['send'], 'queues.producers'],
  ['EMAIL', ['send'], 'send_email'],
  ['ASSETS', ['fetch'], 'assets'],
] as const

function hasMethods(binding: unknown, methods: readonly string[]) {
  return (
    binding != null &&
    methods.every(
      (method) =>
        typeof (binding as Record<string, unknown>)[method] === 'function',
    )
  )
}

export function requireBindings(env: Bindings) {
  const issues = required.flatMap(([name, methods, field]) =>
    hasMethods(env[name], methods)
      ? []
      : [`Configure the ${name} binding in Wrangler's ${field}.`],
  )
  if (env.LOCAL_OPERATOR && env.ENVIRONMENT !== 'local')
    issues.push(
      'LOCAL_OPERATOR requires ENVIRONMENT=local. Remove LOCAL_OPERATOR from deployed Workers.',
    )
  if (issues.length) throw new Error(issues.join(' '))
}

export function requireExtensionBindings(env: Bindings, extension: Extension) {
  if (extension.requiresAI && !hasMethods(env.AI, ['run']))
    throw new Error(
      `Configure the AI binding in Wrangler's ai section for the ${extension.id} extension.`,
    )
}

export async function diagnose(env: Bindings) {
  const { results } = await env.DB.prepare(
    "SELECT DISTINCT lower(substr(address,instr(address,'@')+1)) AS domain FROM mailboxes ORDER BY domain",
  ).all<{ domain: string }>()
  const domains = results.map((row) => z.hostname().parse(row.domain))
  return checkOnboarding(domains, env.SENDING_DOMAINS)
}

// Inspect onboarding at cold start. The settings page and CLI always read current state.
const inspected = new WeakSet<D1Database>()
export async function inspectStartup(env: Bindings) {
  if (inspected.has(env.DB)) return
  const report = await diagnose(env)
  if (report.issues.length)
    console.warn('Helpdesk setup:', report.issues.join(' '))
  inspected.add(env.DB)
}
