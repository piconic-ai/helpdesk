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
