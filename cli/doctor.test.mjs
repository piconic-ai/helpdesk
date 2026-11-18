import { it, expect, vi } from 'vitest'
import { verifySendingDomains } from './doctor.mjs'
const zone = 'a'.repeat(32)
const variables = {
  CLOUDFLARE_API_TOKEN: 'test-token',
  CLOUDFLARE_ZONE_IDS: zone,
}
const report = {
  ready: true,
  issues: [],
  domains: ['shop.example.org', 'example.net'],
  providerCheck: 'declared-only',
}

it('F20-AC4 reads all pages of enabled sending domains without sending mail', async () => {
  const pages = [
    [{ name: 'example.net', enabled: true }],
    [{ name: '*.example.org', enabled: true }],
  ]
  const request = vi.fn(async (url, options) => {
    expect(url.origin + url.pathname).toBe(
      `https://api.cloudflare.com/client/v4/zones/${zone}/email/sending/subdomains`,
    )
    expect(options.method ?? 'GET').toBe('GET')
    expect(options.headers.Authorization).toBe('Bearer test-token')
    return Response.json({
      success: true,
      result: pages[Number(url.searchParams.get('page')) - 1],
      result_info: { total_pages: 2 },
    })
  })
  expect(await verifySendingDomains(report, variables, request)).toMatchObject({
    ready: true,
    providerCheck: 'checked',
  })
  expect(request).toHaveBeenCalledTimes(2)
})
it('F20-AC4 surfaces disabled domains, unavailable credentials and provider refusal', async () => {
  const response = () =>
    Promise.resolve(
      Response.json({
        success: true,
        result: [
          { name: '*.example.org', enabled: true },
          { name: 'shop.example.org', enabled: false },
        ],
      }),
    )
  const result = await verifySendingDomains(report, variables, response)
  expect(result.ready).toBe(false)
  expect(result.issues).toHaveLength(2)
  const unavailable = await verifySendingDomains(report, {}, vi.fn())
  expect(unavailable.providerCheck).toBe('unavailable')
  expect(unavailable.issues[0]).toContain('CLOUDFLARE_API_TOKEN')
  const denied = await verifySendingDomains(report, variables, () =>
    Promise.resolve(new Response(null, { status: 403 })),
  )
  expect(denied.ready).toBe(false)
  expect(denied.issues[0]).toContain('HTTP 403')
})
