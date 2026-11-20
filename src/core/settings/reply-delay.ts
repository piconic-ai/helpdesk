import { z } from 'zod'

export const replyDelay = z.literal([10, 30, 60, 300])
export const replyDelayInput = z.coerce.number().pipe(replyDelay)
export type ReplyDelay = z.infer<typeof replyDelay>
export const defaultReplyDelay: ReplyDelay = 10
export const replyDelayLabels = {
  10: '10秒',
  30: '30秒',
  60: '1分',
  300: '5分',
}

export function sendDelay(operator: ReplyDelay, projectMin: ReplyDelay | null) {
  return Math.max(operator, projectMin ?? defaultReplyDelay)
}
