import type { Conversation } from './state'
import { z } from 'zod'

const payload = z.object({
  from: z.string().optional(),
  to: z.string().nullable().optional(),
  name: z.string().optional(),
  action: z.string().optional(),
  condition: z.string().optional(),
  label: z.string().optional(),
  assignee: z.string().optional(),
})
const status: Record<string, string> = {
  open: '未対応',
  pending: '返信待ち',
  closed: '完了',
  spam: '迷惑メール',
  received: '受付済み',
  reviewed: '確認済み',
}
export function timelineChange(
  event: { kind: string; payload: string },
  operators: readonly { email: string; displayName: string }[],
) {
  if (
    !['status_changed', 'assigned', 'label_changed', 'rules.applied'].includes(
      event.kind,
    )
  )
    return
  let fields
  try {
    fields = payload.parse(JSON.parse(event.payload))
  } catch {
    return
  }
  const person = (email: string) =>
    operators.find((person) => person.email === email)?.displayName || email
  switch (event.kind) {
    case 'status_changed':
      return (
        '状態を変更　' +
        (status[fields.from ?? ''] ?? '') +
        ' → ' +
        (status[fields.to ?? ''] ?? '')
      )
    case 'assigned':
      return fields.to ? '担当者を変更　' + person(fields.to) : '担当を解除'
    case 'label_changed':
      return (
        'ラベル「' +
        (fields.name ?? fields.label ?? '') +
        '」を' +
        (fields.action === 'remove' ? '解除' : '追加')
      )
    case 'rules.applied':
      return (
        '振り分けルールを適用　' +
        [
          fields.condition,
          fields.label,
          fields.assignee && person(fields.assignee),
        ]
          .filter(Boolean)
          .join(' · ')
      )
  }
}

type HistoryEvent = { kind: string; at: number; payload: string; actor: string }
export function timelineLabel(e: { kind: string; payload: string }) {
  if (e.kind !== 'label_changed' && e.kind !== 'rules.applied') return
  try {
    const fields = payload.parse(JSON.parse(e.payload))
    return fields.name ?? fields.label
  } catch {
    return
  }
}
function changeKey(e: HistoryEvent) {
  if (e.kind === 'assigned' || e.kind === 'status_changed') return e.kind
  if (e.kind !== 'label_changed') return null
  try {
    const change = payload.parse(JSON.parse(e.payload))
    return 'label:' + (change.name ?? change.label)
  } catch {
    return null
  }
}

type MessageTime = { created_at: number }
type Occurrence = HistoryEvent & { id: number }
type ThreadEntry<M, E> =
  | { kind: 'message'; value: M }
  | { kind: 'event'; value: E }
type Fold<M, E> = { kind: 'fold'; count: number; items: ThreadEntry<M, E>[] }

export function threadTimeline<M extends MessageTime, E extends Occurrence>(
  messages: readonly M[],
  events: readonly E[],
): (ThreadEntry<M, E> | Fold<M, E>)[] {
  const rows: ThreadEntry<M, E>[] = [
    ...messages.map((value) => ({ kind: 'message' as const, value })),
    ...events
      .filter(
        (e) =>
          e.kind !== 'conversation_viewed' && e.kind !== 'operation_invoked',
      )
      .map((value) => ({ kind: 'event' as const, value })),
  ]
  const at = (row: ThreadEntry<M, E>) =>
    row.kind === 'message' ? row.value.created_at : row.value.at
  rows.sort(
    (a, b) =>
      at(a) - at(b) ||
      (a.kind === 'event' && b.kind === 'event' ? a.value.id - b.value.id : 0),
  )
  const entries: ThreadEntry<M, E>[] = []
  for (const row of rows) {
    const last = entries.at(-1)
    if (
      row.kind === 'event' &&
      last?.kind === 'event' &&
      sameEdit(last.value, row.value)
    )
      entries.pop()
    entries.push(row)
  }
  if (messages.length <= 10) return entries
  const positions = entries.flatMap((row, i) =>
    row.kind === 'message' ? [i] : [],
  )
  const first = positions[0] + 1,
    last = positions[positions.length - 5]
  return [
    ...entries.slice(0, first),
    {
      kind: 'fold',
      count: messages.length - 6,
      items: entries.slice(first, last),
    },
    ...entries.slice(last),
  ]
}

function sameEdit(previous: HistoryEvent, current: HistoryEvent) {
  const key = changeKey(current)
  return (
    !!key &&
    key === changeKey(previous) &&
    current.actor === previous.actor &&
    current.at - previous.at <= 60000
  )
}

type Activity = MessageTime & {
  kind: string
  delivery?: string | null
  sent_at?: number | null
}
export function nextThreadAction(
  status: Conversation['status']['kind'],
  messages: readonly Activity[],
  now: number,
) {
  switch (status) {
    case 'closed':
      return '完了しました。再開するには返信を書きます'
    case 'received':
      return 'フィードバックを確認する'
    case 'reviewed':
      return 'フィードバックは確認済みです'
    case 'spam':
      return '必要なら迷惑メールを解除してください'
  }
  if (
    messages.some(
      (m) => m.delivery === 'draft' || m.delivery === 'awaiting_approval',
    )
  )
    return '下書きを確認して送る'
  if (messages.some((m) => m.delivery === 'queued'))
    return '返信の送信を待っています'
  if (status === 'pending') return '相手の返事を待っています'
  const lastSent = messages.reduce(
    (last, m) => Math.max(last, m.sent_at ?? 0),
    0,
  )
  const inbound = messages.find(
    (m) => m.kind === 'inbound' && m.created_at >= lastSent,
  )
  if (!inbound) return '返信する'
  const minutes = Math.max(0, Math.floor((now - inbound.created_at) / 60000))
  const waiting =
    minutes >= 60 ? Math.floor(minutes / 60) + '時間' : minutes + '分'
  return '返信する（' + waiting + '待たせています）'
}
