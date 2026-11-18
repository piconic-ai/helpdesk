import type { Child } from 'hono/jsx'
import type { ConsoleFrame } from './console-usecase'
import { shell } from '../../ui/console-shell'
import {
  Button,
  ActionLink,
  Field,
  Input,
  NativeSelect,
} from '../../ui/controls'
import { OverviewPage, Notice } from '../../ui/patterns'
export {
  statuses,
  noteLabel,
  stamp,
  badge,
  glyph,
  inboxUrl,
  selectedView,
  shell,
} from '../../ui/console-shell'
export function field(
  name: string,
  title: string,
  value = '',
  type = 'text',
  required = false,
) {
  return (
    <Field label={title}>
      <Input type={type} name={name} value={value} required={required} />
    </Field>
  )
}
export function select(
  name: string,
  title: string,
  choices: Record<string, string>,
  value: string,
) {
  return (
    <Field label={title}>
      <NativeSelect name={name} aria-label={title}>
        {Object.entries(choices).map(([key, label]) => (
          <option value={key} selected={key === value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    </Field>
  )
}
export function action(
  name: string,
  label: string,
  children: Child,
  number?: number,
  variant = 'secondary',
) {
  return (
    <form action={'/actions/' + name} method="post">
      {number !== undefined && (
        <input type="hidden" name="number" value={number} />
      )}
      {children}
      <Button
        variant={
          variant === 'danger'
            ? 'destructive'
            : variant === 'primary'
              ? 'default'
              : variant === 'quiet'
                ? 'ghost'
                : 'outline'
        }
      >
        {label}
      </Button>
    </form>
  )
}
export function operatorErrorPage(
  status: 400 | 403 | 404 | 409,
  frame?: ConsoleFrame,
) {
  const copy = {
    400: [
      '入力内容を確認してください',
      '入力し直して、もう一度お試しください。',
    ],
    403: [
      'この画面を操作する権限がありません',
      '管理者に権限を確認してください。',
    ],
    404: ['対象が見つかりません', '受信箱から問い合わせを選び直してください。'],
    409: [
      '操作を完了できませんでした',
      '現在の状態を確認してから、もう一度お試しください。',
    ],
  }
  const [title, detail] = copy[status]
  return shell(
    title,
    <OverviewPage title={title}>
      <Notice kind="error">{detail}</Notice>
      <ActionLink href="/">受信箱に戻る</ActionLink>
    </OverviewPage>,
    frame,
  )
}
