import { Button, Input, Popover, Textarea, Field } from '../../ui/controls'
import { ActionBar, Candidate, CandidateList, Notice } from '../../ui/patterns'
import { LabelDot } from '../../ui/inbox-parts'
import { DraftReview } from '../../ui/thread-parts'
import { operatorAvatar } from '../operators/identity-page'
import { action } from './console-page'
import type { ConsoleFrame } from './console-usecase'
import type { Result } from './inbox-page'

type Inquiry = Extract<Result<'get'>['conversation'], { kind: 'inquiry' }>
export function assignment(c: Inquiry, frame: ConsoleFrame) {
  const email = c.assignment.kind === 'assigned' ? c.assignment.to : ''
  const assigned = frame.operators.find((o) => o.email === email)
  const name = assigned?.displayName || email || '担当なし'
  const choices = [{ email: '', displayName: '担当なし' }, ...frame.operators]
  return (
    <Popover
      id="thread-assignee"
      label={
        <>
          {email ? (
            <>
              <span aria-hidden="true">{operatorAvatar(assigned, email)}</span>{' '}
              担当: {name}
            </>
          ) : (
            '担当者を選ぶ'
          )}
        </>
      }
    >
      <CandidateList>
        {choices.map((op) => {
          const label = op.displayName
          return (
            <form action="/actions/assign" method="post">
              <Input type="hidden" name="number" value={c.number} />
              <Input type="hidden" name="email" value={op.email} />
              <Button
                variant="ghost"
                aria-pressed={op.email === email}
                aria-label={label}
              >
                <Candidate
                  icon={operatorAvatar(op.email ? op : undefined)}
                  selected={op.email === email}
                  label={label}
                />
              </Button>
            </form>
          )
        })}
      </CandidateList>
    </Popover>
  )
}
export function labelPicker(
  number: number,
  labels: { name: string }[],
  choices: string[],
  colors: Record<string, number>,
) {
  const used = new Set(labels.map((l) => l.name))
  return (
    <Popover
      id="thread-labels"
      label={
        labels.length ? (
          <>
            ラベル:{' '}
            {labels.map((l, index) => (
              <>
                {index ? '、' : ''}
                <LabelDot label={l.name} colors={colors} />
                {l.name}
              </>
            ))}
          </>
        ) : (
          'ラベルを選ぶ'
        )
      }
    >
      <CandidateList>
        {choices.map((name) => {
          const selected = used.has(name)
          return (
            <form action="/actions/label" method="post">
              <Input type="hidden" name="number" value={number} />
              <Input type="hidden" name="label" value={name} />
              <Input
                type="hidden"
                name="action"
                value={selected ? 'remove' : 'add'}
              />
              <Button
                variant="ghost"
                aria-pressed={selected}
                aria-label={name + (selected ? 'を外す' : 'を付ける')}
              >
                <Candidate
                  icon={<LabelDot label={name} colors={colors} />}
                  selected={selected}
                  label={name}
                />
              </Button>
            </form>
          )
        })}
      </CandidateList>
      <details>
        <summary>新しいラベルを作成</summary>
        {action(
          'label',
          '作成して付ける',
          <>
            <Input type="hidden" name="action" value="add" />
            <Field label="新しいラベル名">
              <Input name="label" required maxlength={200} />
            </Field>
          </>,
          number,
        )}
      </details>
    </Popover>
  )
}
export function draftReview(
  id: string,
  number: number,
  body: string,
  canSend: boolean,
) {
  const message = <Input type="hidden" name="id" value={id} />
  return (
    <DraftReview>
      {canSend && (
        <form action="/actions/approve" method="post" id={'approve-' + id}>
          {message}
          <Input type="hidden" name="number" value={number} />
          <Field label="下書きの本文">
            <Textarea name="body" rows={4} required maxlength={100000}>
              {body}
            </Textarea>
          </Field>
        </form>
      )}
      <ActionBar>
        {canSend && (
          <Button variant="default" form={'approve-' + id}>
            承認して送信
          </Button>
        )}
        {action('discard', '下書きを破棄', message, number, 'quiet')}
      </ActionBar>
    </DraftReview>
  )
}
export function replyUndoForm(
  number: number,
  hold: { id: string; remaining: number; target: 'pending' | 'closed' },
) {
  return (
    <form
      action="/actions/undoReply"
      method="post"
      data-undo-reply={hold.remaining}
      data-layout="cluster"
      data-gap="sm"
    >
      <Input type="hidden" name="id" value={hold.id} />
      <Input type="hidden" name="number" value={number} />
      <span>
        {hold.target === 'closed'
          ? '送信後に会話を完了します。'
          : 'まもなく返信を送信します。'}
      </span>
      <Button variant="outline" type="submit">
        取り消す
      </Button>
    </form>
  )
}
const notices: Record<string, string> = {
  undoReply: '送信を取り消しました。返信欄で編集できます。',
  reply: '返信を送信待ちに追加しました。',
  replyAndClose: '返信と会話の完了を受け付けました。',
  'feedback.review': 'フィードバックを確認済みにしました。',
  'feedback.unreview': '未確認に戻しました。',
  'feedback.convert': 'フィードバックを問い合わせに変更しました。',
  'snooze.defer': '指定した日時まで会話を保留しました。',
  'snooze.undo': '保留の設定を元に戻しました。',
  'snooze.resume': '保留を解除して受信箱に戻しました。',
  'canned.apply': '定型文から返信の下書きを作成しました。',
  'merge.combine': '会話を統合しました。',
  'issues.create': '確認した内容で Issue を起票しました。',
  'issues.link': '選択した Issue を会話に関連付けました。',
  'articles.suggest': '記事の候補を保存しました。',
  note: '内部メモを保存しました。',
  closed: '会話を完了しました。',
  reopened: '会話を再開しました。',
  unmarked_spam: '迷惑メールを解除しました。',
  marked_spam: '迷惑メールに変更しました。',
  assign: '担当者を変更しました。',
  label: 'ラベルを更新しました。',
  approve: '下書きを承認し、送信待ちに追加しました。',
  retry: '再送を受け付けました。',
  discard: '下書きを破棄しました。',
}
export function threadNotice(code?: string, number?: number, undoId?: string) {
  const text =
    code && Object.hasOwn(notices, code)
      ? notices[code]
      : code?.includes('.')
        ? '操作を完了しました。'
        : ''
  return text ? (
    <Notice kind="success">
      {text}
      {number &&
        undoId &&
        (code === 'snooze.defer' || code === 'snooze.resume') &&
        action(
          'snooze.undo',
          '元に戻す',
          <Input type="hidden" name="changeId" value={undoId} />,
          number,
          'quiet',
        )}
      {number &&
        undoId &&
        code === 'canned.apply' &&
        action(
          'discard',
          '元に戻す',
          <Input type="hidden" name="id" value={undoId} />,
          number,
          'quiet',
        )}
      {number &&
        code === 'feedback.review' &&
        action('feedback.unreview', '元に戻す', null, number, 'quiet')}
    </Notice>
  ) : null
}
