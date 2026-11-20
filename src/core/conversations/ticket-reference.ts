import { z } from 'zod'

export const ticketPrefixSchema = z
  .string()
  .regex(/^[A-Z]{2,5}$/)
  .brand<'TicketPrefix'>()

export type TicketPrefix = z.infer<typeof ticketPrefixSchema>

export function ticketReference(prefix: TicketPrefix, number: number) {
  return prefix + '-' + number
}

export const ticketSubjectTag = /\[(?:#|([A-Z]{2,5})-)([1-9]\d*)\]/

// Prefer a prefix that still resembles the one the operator entered.
export function availablePrefix(
  requested: TicketPrefix,
  used: ReadonlySet<string>,
) {
  for (let length = 1; length <= 5; length++) {
    const stem = requested.slice(0, 5 - length)
    for (let n = 0; n < 26 ** length; n++) {
      let suffix = ''
      let value = n
      for (let position = 0; position < length; position++) {
        suffix = String.fromCharCode(65 + (value % 26)) + suffix
        value = Math.floor(value / 26)
      }
      const prefix = stem + suffix
      if (!used.has(prefix)) return prefix
    }
  }
}
