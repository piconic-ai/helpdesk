import { afterAll, beforeAll, expect, it } from 'vitest'
import { app } from '../worker'
import { testPlatform } from './platform'

let platform: Awaited<ReturnType<typeof testPlatform>>
beforeAll(async () => {
  platform = await testPlatform()
})
afterAll(async () => {
  await platform?.dispose()
})

it.each([
  ['local', 200],
  ['production', 404],
  ['staging', 404],
  [undefined, 404],
] as const)(
  'serves the gallery only with local Worker bindings (%s)',
  async (environment, status) => {
    const response = await app.request(
      'http://localhost/dev/ui',
      { headers: { Accept: 'text/html' } },
      { ...platform, AI: undefined, ENVIRONMENT: environment },
    )
    expect(response.status).toBe(status)
    expect((await response.text()).includes('UI 部品見本')).toBe(status === 200)
  },
)
