import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { inquiryStatusSchema, instantSchema } from './state'
import { events, outcomes } from './transitions.examples'
import { transition } from './transitions'

const now = instantSchema.parse(42)
const cases = outcomes.flatMap(([kind, expected]) =>
  events.map((event, i) => ({
    status: inquiryStatusSchema.parse({ kind, closedAt: 1 }),
    event,
    expected: expected[i],
  })),
)
describe('inquiry transitions', () => {
  it.each(cases)(
    '$status.kind + $event → $expected',
    ({ status, event, expected }) => {
      const result = transition(status, { kind: event }, now)
      expect(result.ok ? result.value.kind : 'reject').toBe(expected)
      if (result.ok && result.value.kind === 'closed')
        expect(result.value.closedAt).toBe(now)
      if (!result.ok) expect(result.reason).toContain(status.kind)
    },
  )
  it('reopens every non-spam inquiry after a customer reply', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...events)), (sequence) => {
        let status = inquiryStatusSchema.parse({ kind: 'open' })
        for (const kind of sequence) {
          const result = transition(status, { kind }, now)
          if (result.ok) status = result.value
        }
        const expected = status.kind === 'spam' ? 'spam' : 'open'
        expect(transition(status, { kind: 'customer_replied' }, now)).toEqual({
          ok: true,
          value: { kind: expected },
        })
      }),
    )
  })
})
