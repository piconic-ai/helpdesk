import { expect, test } from 'vitest'
import { previousPeriods, reportPeriod } from './report-period'

test.each([
  [
    '2026-02-28T15:00:00Z',
    'Asia/Tokyo',
    '2026-02-23',
    '2026-03-01',
    '2026-02-22T15:00:00Z',
  ],
  [
    '2026-02-28T15:00:00Z',
    'America/Los_Angeles',
    '2026-02-22',
    '2026-02-28',
    '2026-02-22T08:00:00Z',
  ],
  [
    '2026-03-12T18:30:00Z',
    'America/New_York',
    '2026-03-06',
    '2026-03-12',
    '2026-03-06T05:00:00Z',
  ],
])(
  'counts through the present instant in %s / %s',
  (instant, zone, start, end, utcStart) => {
    const now = Date.parse(instant)
    expect(reportPeriod({ kind: 'rolling', days: 7 }, now, zone)).toEqual({
      from: Date.parse(utcStart),
      to: now + 1,
      start,
      end,
    })
  },
)

test('counts complete local calendar days across a daylight-saving change', () => {
  const period = reportPeriod(
    { kind: 'custom', start: '2026-03-08', end: '2026-03-08' },
    0,
    'America/New_York',
  )
  expect(period.to - period.from).toBe(23 * 3600000)
  expect(
    previousPeriods(period.from, period.to, 'America/New_York').at(-1),
  ).toEqual({
    from: Date.parse('2026-03-07T05:00:00Z'),
    to: Date.parse('2026-03-08T05:00:00Z'),
  })
})
