import { z } from 'zod'
import type {
  Extension,
  ExtensionContext,
} from '../../core/extensions/extension'
const scheduleTime = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Asia/Tokyo',
})
const number = z.coerce.number().int().positive()
const change = z.object({ number, changeId: z.uuid().optional() })
const schedule = change.extend({ until: z.iso.datetime({ offset: true }) })
const entry = z.object({ number, until: z.number().int() })
const record = entry.extend({
  previous: z.number().optional(),
  changeId: z.uuid().optional(),
  by: z.string().optional(),
})
async function setDeadline(
  ctx: ExtensionContext,
  number: number,
  until: number,
  changeId?: string,
) {
  const key = 'until/' + number
  const before = await ctx.get(key)
  const previous = before ? record.parse(before).until : 0
  const next = {
    number,
    until,
    previous,
    changeId,
    by: JSON.stringify(ctx.actor),
  }
  if (!(await ctx.compareSwap(key, before, next)))
    throw new Error('Snooze changed. Reload and retry.')
}
export const snooze: Extension = {
  id: 'snooze',
  icon: 'snooze',
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
        const { number, until, changeId } = schedule.parse(value),
          timestamp = Date.parse(until)
        if (timestamp <= ctx.now) throw new Error('Choose a future time')
        await ctx.contact(number)
        const data = { number, until: timestamp }
        await setDeadline(ctx, number, timestamp, changeId)
        return data
      },
    },
    {
      name: 'resume',
      description: 'Return to inbox',
      permission: 'write',
      input: change,
      output: z.null(),
      async run(ctx, value) {
        const { number, changeId } = change.parse(value)
        await setDeadline(ctx, number, 0, changeId)
        return null
      },
    },
    {
      name: 'undo',
      description: 'Restore the preceding snooze deadline',
      permission: 'write',
      humanOnly: true,
      input: change.required(),
      output: z.null(),
      async run(ctx, input) {
        const { number, changeId } = change.required().parse(input)
        const key = 'until/' + number
        const before = await ctx.get(key)
        const data = record.parse(before)
        if (data.changeId !== changeId || data.by !== JSON.stringify(ctx.actor))
          throw new Error('Snooze changed. Reload and retry.')
        if (
          !(await ctx.compareSwap(key, before, {
            number,
            until: data.previous ?? 0,
          }))
        )
          throw new Error('Snooze changed. Reload and retry.')
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
