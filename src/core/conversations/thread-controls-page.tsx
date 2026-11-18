import { action } from './console-page'
import type { ConsoleFrame } from './console-usecase'
import type { Result } from './inbox-page'

type Inquiry = Extract<Result<'get'>['conversation'], { kind: 'inquiry' }>
export function assignment(c: Inquiry, frame: ConsoleFrame) {
  const email = c.assignment.kind === 'assigned' ? c.assignment.to : ''
  const assigned = frame.operators.find((o) => o.email === email)
  const set = (value: string, label: string) =>
    action(
      'assign',
      label,
      <input type="hidden" name="email" value={value} />,
      c.number,
      'quiet',
    )
  return (
    <>
      <details className="action-menu thread-picker">
        <summary className="button-secondary" title="担当者を選ぶ">
          担当: {assigned?.displayName || email || '担当なし'}
        </summary>
        <div>
          {frame.operators
            .filter((o) => o.email !== email)
            .map((o) => set(o.email, o.displayName || o.email))}
          {email && set('', '担当を外す')}
        </div>
      </details>
      {email !== frame.operator.email &&
        set(frame.operator.email, '自分が担当する')}
    </>
  )
}
export function labelPicker(
  number: number,
  labels: { name: string }[],
  choices: string[],
) {
  const used = new Set(labels.map((l) => l.name))
  function toggle(name: string, remove: boolean) {
    const verb = remove ? '外す' : '付ける'
    return (
      <form action="/actions/label" method="post">
        <input type="hidden" name="number" value={number} />
        <input type="hidden" name="label" value={name} />
        <input type="hidden" name="action" value={remove ? 'remove' : 'add'} />
        <button
          className={remove ? 'label-chip' : 'button-quiet'}
          aria-label={name + 'を' + verb}
        >
          {name}
          {remove ? ' ×' : ''}
        </button>
      </form>
    )
  }
  return (
    <>
      {labels.map((l) => toggle(l.name, true))}
      <details className="action-menu thread-picker">
        <summary className="button-secondary">ラベルを選ぶ</summary>
        <div>
          {choices
            .filter((name) => !used.has(name))
            .map((name) => toggle(name, false))}
          <details>
            <summary>新しいラベルを作成</summary>
            {action(
              'label',
              '作成して付ける',
              <>
                <input type="hidden" name="action" value="add" />
                <label>
                  新しいラベル名
                  <input name="label" required maxlength={200} />
                </label>
              </>,
              number,
            )}
          </details>
        </div>
      </details>
    </>
  )
}
export function draftReview(
  id: string,
  number: number,
  body: string,
  canSend: boolean,
) {
  const message = <input type="hidden" name="id" value={id} />
  return (
    <div className="draft-review">
      {canSend &&
        action(
          'approve',
          '承認して送信',
          <>
            {message}
            <label className="field">
              下書きの本文
              <textarea name="body" rows={4} required maxlength={100000}>
                {body}
              </textarea>
            </label>
          </>,
          number,
        )}
      {action('discard', '下書きを破棄', message, number, 'danger')}
    </div>
  )
}
const notices: Record<string, string> = {
  reply: '返信を送信待ちに追加しました。',
  replyAndClose: '返信を送信待ちに追加し、会話を完了しました。',
  'feedback.review': 'フィードバックを確認済みにしました。',
  'feedback.convert': 'フィードバックを問い合わせに変更しました。',
  'snooze.defer': '指定した日時まで会話を保留しました。',
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
export function threadNotice(code?: string) {
  const text =
    code && Object.hasOwn(notices, code)
      ? notices[code]
      : code?.includes('.')
        ? '操作を完了しました。'
        : ''
  return text ? (
    <p className="banner-success" role="status">
      {text}
    </p>
  ) : null
}
