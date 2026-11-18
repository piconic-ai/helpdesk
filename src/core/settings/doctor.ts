import { z } from 'zod'

export function checkOnboarding(domains: string[], declaration: unknown) {
  const declared = (typeof declaration === 'string' ? declaration : '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const issues: string[] = []
  if (!domains.length) issues.push('Register the first mailbox in /settings.')
  if (declaration != null && typeof declaration !== 'string')
    issues.push('Set SENDING_DOMAINS to a string of comma-separated hostnames.')
  else if (!declared.length)
    issues.push(
      'Enable your mailbox domain in Cloudflare Email Sending and set SENDING_DOMAINS to the enabled domain names.',
    )
  else {
    if (declared.some((d) => !z.hostname().safeParse(d).success))
      issues.push('Use comma-separated hostnames in SENDING_DOMAINS.')
    for (const domain of domains)
      if (!declared.includes(domain))
        issues.push(
          `Enable ${domain} in Cloudflare Email Sending and add it to SENDING_DOMAINS.`,
        )
  }
  return {
    ready: issues.length === 0,
    issues,
    domains,
    providerCheck: 'declared-only' as const,
  }
}
