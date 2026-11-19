import { afterAll, beforeAll, expect, it } from 'vitest'
import worker, { app } from '../worker'
import { testPlatform } from './platform'
import {
  bindingExamples,
  declarationExamples,
} from '../src/core/settings/doctor.examples'
import { diagnose } from '../src/core/settings/doctor-usecase'
import type { Bindings } from '../src/core/settings/bindings'
import { registry } from '../src/core/extensions/registry'
import { chat } from '../src/extensions/chat/extension'

let platform: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
beforeAll(async () => {
  platform = await testPlatform()
  env = {
    ...platform,
    LOCAL_OPERATOR: 'owner@example.org',
    ENVIRONMENT: 'local',
  } as unknown as Bindings
})
afterAll(() => platform?.dispose())

it.each(bindingExamples)(
  'F20-AC2 identifies $name and its Wrangler configuration on startup',
  async ({ name, section }) => {
    const broken = { ...env, [name]: {} }
    const res = await app.request('http://local/styles.css', {}, broken)
    expect(res.status).toBe(500)
    expect(await res.text()).toContain(
      `Configure the ${name} binding in Wrangler's ${section}`,
    )
  },
)
it('F20-AC2 stops email, queue and scheduled processing before any work when local bypass is misconfigured', async () => {
  const broken = { ...env, ENVIRONMENT: 'production' }
  for (const call of [
    () => worker.email({} as ForwardableEmailMessage, broken),
    () => worker.queue({} as MessageBatch, broken),
    () => worker.scheduled({} as ScheduledController, broken),
  ])
    await expect(call()).rejects.toThrow(/LOCAL_OPERATOR.*ENVIRONMENT=local/)
})
it('F20-AC2 requires the AI binding only when the dependent extension is enabled', async () => {
  const entry = { extension: chat, settings: { threshold: 0.7 }, enabled: true }
  const run = (enabled: boolean) =>
    app.request(
      'http://local/settings',
      {},
      {
        ...env,
        AI: undefined,
        EXTENSIONS: registry([{ ...entry, enabled }]),
      },
    )
  expect(await (await run(true)).text()).toContain(
    "Configure the AI binding in Wrangler's ai section for the chat extension",
  )
  expect((await run(false)).status).toBe(200)
})
it('F20-AC4 the first administrator sees both onboarding steps and can register a mailbox', async () => {
  const url = 'http://local'
  const page = await app.request(url + '/settings', {}, env)
  expect(page.status).toBe(200)
  const text = await page.text()
  expect(text).toContain('最初の窓口を登録してください。')
  expect(text).toContain('SENDING_DOMAINS に設定してください。')
  const form = new URLSearchParams({
    product: 'shop',
    name: 'Shop',
    address: 'shop@example.org',
  })
  expect(
    (
      await app.request(
        url + '/actions/mailbox',
        { method: 'POST', headers: { origin: url }, body: form },
        env,
      )
    ).status,
  ).toBe(303)
  for (const { value, issue } of declarationExamples) {
    const report = await diagnose({ ...env, SENDING_DOMAINS: value })
    expect(report.domains).toEqual(['example.org'])
    expect(report.ready).toBe(issue === null)
    if (issue) expect(report.issues.join(' ')).toContain(issue)
  }
})

it('rejects a demo GitHub service during production initialization', async () => {
  const production = {
    ...env,
    LOCAL_OPERATOR: undefined,
    ENVIRONMENT: 'production',
    DEMO_GITHUB: env.ASSETS,
  }
  const response = await app.request('http://local/issues', {}, production)
  expect(response.status).toBe(500)
  expect(await response.text()).toContain(
    'DEMO_GITHUB requires a local service binding',
  )
  await expect(
    worker.scheduled({ scheduledTime: 0 } as ScheduledController, production),
  ).rejects.toThrow(/DEMO_GITHUB/)
})
