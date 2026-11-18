import { z } from 'zod'

const pageSchema = z.object({
  success: z.literal(true),
  result: z.array(z.object({ name: z.string(), enabled: z.boolean() })),
  result_info: z
    .object({ total_pages: z.number().int().nonnegative().optional() })
    .optional(),
})

async function sendingDomains(zone, token, request) {
  const settings = []
  let page = 1
  let lastPage
  do {
    const url = new URL(
      `https://api.cloudflare.com/client/v4/zones/${zone}/email/sending/subdomains`,
    )
    url.searchParams.set('page', String(page))
    const response = await request(url, {
      headers: { Authorization: 'Bearer ' + token },
      redirect: 'error',
    })
    if (!response.ok)
      throw new Error(
        `Cloudflare Email Sending returned HTTP ${response.status}. Check zone access and Email Sending read permission.`,
      )
    const parsed = pageSchema.parse(await response.json())
    settings.push(...parsed.result)
    lastPage = parsed.result_info?.total_pages ?? 1
  } while (++page <= lastPage)
  return settings
}

export async function verifySendingDomains(report, variables, request = fetch) {
  const token = variables.CLOUDFLARE_API_TOKEN
  const zones =
    variables.CLOUDFLARE_ZONE_IDS?.split(',').map((zone) => zone.trim()) ?? []
  const issues = [...report.issues]
  try {
    if (
      !token ||
      !zones.length ||
      zones.some((zone) => !/^[0-9a-f]{32}$/i.test(zone))
    )
      throw new Error(
        'Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_IDS to check live Email Sending settings.',
      )
    const records = (
      await Promise.all(
        zones.map((zone) => sendingDomains(zone, token, request)),
      )
    ).flat()
    const enabled = new Map(
      records.map((r) => [r.name.toLowerCase(), r.enabled]),
    )
    for (const domain of report.domains) {
      const wildcard = '*.' + domain.split('.').slice(1).join('.')
      if (!(enabled.get(domain) ?? enabled.get(wildcard)))
        issues.push(
          `Enable ${domain} in Cloudflare Email Sending or include its zone in CLOUDFLARE_ZONE_IDS.`,
        )
    }
    return {
      ...report,
      issues,
      ready: issues.length === 0,
      providerCheck: 'checked',
    }
  } catch (error) {
    issues.push(error.message)
    return { ...report, issues, ready: false, providerCheck: 'unavailable' }
  }
}
