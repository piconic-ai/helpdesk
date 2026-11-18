import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
type Row = Record<string, unknown>
const encoded: Record<string, string[]> = {
  events: ['payload', 'actor', 'dedup_key'],
  messages: ['actor', 'approval'],
}

function contactValues(rows: Row[], field: string) {
  return [
    ...new Set(
      rows
        .map((row) => row[field])
        .filter((v): v is string => typeof v === 'string' && v.length > 0),
    ),
  ].sort((a, b) => b.length - a.length)
}

function redact(value: unknown, mask: (text: string) => string): unknown {
  if (typeof value === 'string') return mask(value)
  if (Array.isArray(value)) return value.map((v) => redact(v, mask))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [mask(key), redact(v, mask)]),
    )
  return value
}

function maskedRow(type: string, row: Row, mask: (text: string) => string) {
  return Object.fromEntries(
    Object.entries(row).map(([field, value]) => {
      if (typeof value === 'string' && encoded[type]?.includes(field)) {
        try {
          return [field, JSON.stringify(redact(JSON.parse(value), mask))]
        } catch {
          // Older deduplication keys may be plain text.
          return [field, mask(value)]
        }
      }
      return [field, redact(value, mask)]
    }),
  )
}

export function jsonLines(
  data: { conversations: Row[]; messages: Row[]; events: Row[] },
  unmask: boolean,
) {
  const names = contactValues(data.conversations, 'contact_name')
  const addresses = contactValues(data.conversations, 'contact')
  const mask = (text: string) => {
    for (const address of addresses)
      text = text.replaceAll(address, '[address]')
    text = text.replace(
      /[\w.!#$%&'*+/=?^\x60{|}~-]+@[\w.-]+\.[A-Z]{2,}/gi,
      '[address]',
    )
    for (const name of names) text = text.replaceAll(name, '[name]')
    return text
  }
  const lines: string[] = []
  for (const [type, rows] of Object.entries(data))
    for (const row of rows)
      lines.push(
        JSON.stringify({
          type,
          data: unmask ? row : maskedRow(type, row, mask),
        }),
      )
  return lines.join('\n') + (lines.length ? '\n' : '')
}
const input = z.object({ unmask: z.boolean().default(false) })
export const exportExtension: Extension = {
  id: 'export',
  permissions: ['read_body'],
  config: z.object({}),
  operations: [
    {
      name: 'jsonl',
      description: 'Export conversations, messages and events as JSON Lines',
      permission: 'read',
      input,
      output: z.string(),
      async run(ctx, args) {
        return jsonLines(await ctx.snapshot(), input.parse(args).unmask)
      },
    },
  ],
  panels: [{ slot: 'settings', title: 'Export', operations: ['jsonl'] }],
}
