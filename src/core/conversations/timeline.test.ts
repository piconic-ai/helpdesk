import { expect, it } from 'vitest'
import { threadTimeline, nextThreadAction } from './timeline'

const message = (at: number) => ({ id: 'm' + at, created_at: at })
const change = (id: number, at: number, kind = 'assigned') => ({
  id,
  at,
  kind,
  actor: 'operator',
  payload: '{}',
})

it('collapses adjacent edits, keeps edits across a message separate, and orders tied events by ID', () => {
  const entries = threadTimeline(
    [message(30)],
    [
      change(5, 40),
      change(4, 30, 'issues.linked'),
      change(3, 30, 'reply_failed'),
      change(2, 20),
      change(1, 10),
    ],
  )
  expect(
    entries.map((item) => (item.kind === 'fold' ? 'fold' : item.value.id)),
  ).toEqual([2, 'm30', 3, 4, 5])
})

it('keeps the first and last five messages around an expandable middle that retains its events', () => {
  const messages = Array.from({ length: 11 }, (_, i) => message(i * 10))
  const rows = threadTimeline(messages, [change(1, 25, 'issues.linked')])
  expect(rows.map((item) => item.kind)).toEqual([
    'message',
    'fold',
    ...Array(5).fill('message'),
  ])
  const middle = rows.find((item) => item.kind === 'fold')!
  expect(middle.count).toBe(5)
  expect(middle.items.map((item) => item.value.id)).toEqual([
    'm10',
    'm20',
    1,
    'm30',
    'm40',
    'm50',
  ])
  expect(
    threadTimeline(messages.slice(0, 10), []).some(
      (item) => item.kind === 'fold',
    ),
  ).toBe(false)
})

it('points to approval before replying, gives the wait from the oldest unanswered message, and explains closed conversations', () => {
  const now = 10 * 3600000
  const incoming = { kind: 'inbound', created_at: now - 2 * 3600000 }
  expect(nextThreadAction('open', [incoming], now)).toBe(
    '返信する（2時間待たせています）',
  )
  expect(
    nextThreadAction(
      'open',
      [
        incoming,
        { kind: 'outbound', delivery: 'awaiting_approval', created_at: now },
      ],
      now,
    ),
  ).toBe('下書きを確認して送る')
  expect(nextThreadAction('pending', [], now)).toBe('相手の返事を待っています')
  expect(nextThreadAction('closed', [], now)).toBe(
    '完了しました。再開するには返信を書きます',
  )
})
