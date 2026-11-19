const day = 86_400_000

export type ReportPeriod =
  | { kind: 'rolling'; days: number }
  | { kind: 'custom'; start: string; end: string }

function calendar(zone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return (instant: number) => formatter.format(instant)
}

function shift(date: string, days: number) {
  return new Date(Date.parse(date) + days * day).toISOString().slice(0, 10)
}

// The first instant of a local date can differ from midnight around clock changes.
function startOfDate(date: string, localDate: (instant: number) => string) {
  const utc = Date.parse(date)
  let low = utc - day
  let high = utc + day
  while (low < high) {
    const mid = low + Math.floor((high - low) / 2)
    if (localDate(mid) < date) low = mid + 1
    else high = mid
  }
  return low
}

export function reportPeriod(period: ReportPeriod, now: number, zone: string) {
  const localDate = calendar(zone)
  const end = period.kind === 'custom' ? period.end : localDate(now)
  const start =
    period.kind === 'custom' ? period.start : shift(end, 1 - period.days)
  const from = startOfDate(start, localDate)
  const to =
    period.kind === 'custom' ? startOfDate(shift(end, 1), localDate) : now + 1
  return { from, to, start, end }
}

export function previousPeriods(from: number, to: number, zone: string) {
  const localDate = calendar(zone)
  const first = localDate(from)
  const days = 1 + (Date.parse(localDate(to - 1)) - Date.parse(first)) / day
  let end = from
  const windows = []
  for (let back = 1; back <= 6 && end > 0; back++) {
    const start = Math.max(
      0,
      startOfDate(shift(first, -back * days), localDate),
    )
    windows.unshift({ from: start, to: end })
    end = start
  }
  return windows
}
