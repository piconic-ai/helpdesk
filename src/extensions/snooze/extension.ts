import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
const scheduleTime = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Asia/Tokyo',
})
const number = z.coerce.number().int().positive()
const schedule = z.object({ number, until: z.iso.datetime({ offset: true }) })
const entry = z.object({ number, until: z.number().int() })
export const snooze: Extension = {
  id: 'snooze',
  permissions: [],
  config: z.object({}).strict(),
  operations: [
    {
      name: 'defer',
      description: 'Snooze until ISO date and time',
      permission: 'write',
      input: schedule,
      output: entry,
      async run(ctx, value) {
        const { number, until } = schedule.parse(value),
          timestamp = Date.parse(until)
        if (timestamp <= ctx.now) throw new Error('Choose a future time')
        await ctx.contact(number)
        const data = { number, until: timestamp }
        await ctx.put('until/' + number, data)
        return data
      },
    },
    {
      name: 'resume',
      description: 'Return to inbox',
      permission: 'write',
      input: z.object({ number }),
      output: z.null(),
      async run(ctx, value) {
        const n = z.object({ number }).parse(value).number
        await ctx.remove('until/' + n)
        return null
      },
    },
  ],
  panels: [
    {
      slot: 'conversation',
      title: 'Snooze',
      operations: ['defer', 'resume'],
      async content(ctx, n) {
        const item = entry.nullable().parse(await ctx.get('until/' + n))
        return item && item.until > ctx.now
          ? '再表示日時（日本時間）　' + scheduleTime.format(item.until)
          : ''
      },
    },
  ],
  async hidden(storage, now) {
    return (await storage.list('until/'))
      .map((row) => entry.parse(row.value))
      .filter((row) => row.until > now)
      .map((row) => row.number)
  },
}
