import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
type Row = Record<string, unknown>
function redact(value: unknown, names: string[]): unknown {
  if (typeof value === 'string') {
    let text = value.replace(
      /[\w.!#$%&'*+/=?^\x60{|}~-]+@[\w.-]+\.[A-Z]{2,}/gi,
      '[address]',
    )
    for (const name of names) text = text.replaceAll(name, '[name]')
    return text
  }
  if (Array.isArray(value)) return value.map((v) => redact(v, names))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, redact(v, names)]),
    )
  return value
}
export function jsonLines(
  data: { conversations: Row[]; messages: Row[]; events: Row[] },
  unmask: boolean,
) {
  const names = [
    ...new Set(
      data.conversations
        .map((c) => c.contact_name)
        .filter((n): n is string => typeof n === 'string' && n.length > 0),
    ),
  ].sort((a, b) => b.length - a.length)
  const lines: string[] = []
  for (const [type, rows] of Object.entries(data)) {
    for (const row of rows)
      lines.push(
        JSON.stringify({ type, data: unmask ? row : redact(row, names) }),
      )
  }
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
