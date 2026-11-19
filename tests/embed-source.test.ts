import { afterAll, beforeAll, expect, it } from 'vitest'
import { openIntake } from '../src/core/intakes/intake-usecase'
import { testPlatform } from './platform'

let platform: Awaited<ReturnType<typeof testPlatform>>
beforeAll(async () => {
  platform = await testPlatform()
  await platform.DB.batch([
    platform.DB.prepare(
      "INSERT INTO products(id,name) VALUES('demo','Demo'),('other','Other')",
    ),
    platform.DB.prepare(
      "INSERT INTO mailboxes(address,product) VALUES('demo@example.com','demo'),('other@example.com','other')",
    ),
    platform.DB.prepare(
      "INSERT INTO hosted_intakes(product,origin,public_key) VALUES('demo','https://retired.example.com','old-key')",
    ),
    platform.DB.prepare(
      "INSERT INTO public_help_settings(product,setting,value,actor) VALUES('demo','https://billing.example.com','enabled','operator@example.com')",
    ),
  ])
})
afterAll(() => platform.dispose())

it.each([
  [
    'demo',
    'chat',
    'https://billing.example.com/receipts?private=ssid#draft',
    'https://billing.example.com/receipts',
  ],
  ['demo', 'chat', 'https://retired.example.com/old', undefined],
  [
    'demo',
    'chat',
    'https://active.example.com/current',
    'https://active.example.com/current',
  ],
  ['other', 'chat', 'https://billing.example.com/receipts', undefined],
  ['demo', 'chat', 'https://external.example.com/account', undefined],
  ['demo', 'form', 'https://billing.example.com/receipts', undefined],
  [
    'demo',
    'chat',
    'https://user:private@billing.example.com/profile',
    undefined,
  ],
  ['demo', 'chat', 'data:text/html,example', undefined],
] as const)(
  'records a product-registered page at intake: %s %s %s',
  async (product, origin, sourcePage, expected) => {
    const { number } = await openIntake(
      {
        ...platform,
        PUBLIC_INTAKES: {
          demo: { publicKey: 'test', origins: ['https://active.example.com'] },
        },
      },
      {
        product,
        origin,
        sourcePage,
        email: 'reader@example.com',
        subject: 'Receipt',
        body: 'Please help.',
      },
      { kind: 'extension', id: origin },
      Date.now(),
    )
    const payload = await platform.DB.prepare(
      "SELECT payload FROM events WHERE number=? AND kind='conversation_opened'",
    )
      .bind(number)
      .first<string>('payload')
    expect(JSON.parse(payload!)).toEqual(
      expected ? { origin, sourcePage: expected } : { origin },
    )
  },
)
