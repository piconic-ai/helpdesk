export type ScheduledSend = {
  sendAt: number
  queuedEvent: number | null
  lastInbound: number | null
}

// Event order also distinguishes a customer reply and an approval in the same millisecond.
export function decideSend(schedule: ScheduledSend | null, now: number) {
  if (!schedule) return 'skip'
  if (
    schedule.queuedEvent !== null &&
    (schedule.lastInbound ?? 0) > schedule.queuedEvent
  )
    return 'hold'
  return schedule.sendAt > now ? 'wait' : 'send'
}
