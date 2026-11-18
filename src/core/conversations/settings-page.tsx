import type { Child } from 'hono/jsx'
import { shell, action, field, select } from './console-page'
import type { Result } from './inbox-page'
import type { ConsoleFrame } from './console-usecase'

function setupIssue(issue: string) {
  if (issue.startsWith('Register the first mailbox'))
    return '最初の窓口を登録してください。'
  const domain = issue.match(/^Enable (\S+) in Cloudflare/)
  if (domain)
    return (
      domain[1] +
      ' のメール送信を有効にし、SENDING_DOMAINS に追加してください。'
    )
  if (issue.includes('comma-separated'))
    return 'SENDING_DOMAINS に送信ドメインをカンマ区切りで指定してください。'
  if (issue.includes('SENDING_DOMAINS'))
    return 'Cloudflare で窓口ドメインのメール送信を有効にし、SENDING_DOMAINS に設定してください。'
  return issue
}
export function settingsPage(
  data: Result<'settings'>,
  issues: string[],
  panels: Child,
  frame: ConsoleFrame,
) {
  return shell(
    '設定',
    <div className="settings-view">
      <header className="page-header">
        <h1 className="page-title">設定</h1>
      </header>
      {issues.length > 0 && (
        <section className="banner-error">
          <h2>初期設定が必要です</h2>
          <ul>
            {issues.map((i) => (
              <li>{setupIssue(i)}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="settings-card" id="mailboxes">
        <h2>プロダクトと窓口</h2>
        {data.mailboxes.length > 0 && (
          <ul>
            {data.mailboxes.map((m) => (
              <li>
                {m.name} · <code>{m.address}</code>
              </li>
            ))}
          </ul>
        )}
        {action(
          'mailbox',
          '窓口を登録',
          <>
            {field('product', 'プロダクト ID', '', 'text', true)}
            {field('name', 'プロダクト名', '', 'text', true)}
            {field('address', '窓口のメールアドレス', '', 'email', true)}
            <small>
              窓口を登録すると、現在有効な拡張の自動送信ポリシーが承認されます。
            </small>
          </>,
          undefined,
          'primary',
        )}
      </section>
      <section className="settings-card" id="operators">
        <h2>運営者</h2>
        {data.operators.map((o) =>
          action(
            'role',
            '権限を保存',
            <>
              <code>{o.email}</code>
              <input type="hidden" name="email" value={o.email} />
              {select(
                'role',
                '権限',
                { admin: '管理者', agent: '担当者' },
                o.role,
              )}
            </>,
          ),
        )}
      </section>
      <section className="settings-card" id="retention">
        <h2>保存期間</h2>
        {action(
          'retention',
          '保存期間を変更',
          <label className="field">
            <span>完了後に本文を保持する日数</span>
            <input
              className="text-input"
              name="days"
              type="number"
              min="0"
              max="36500"
              required
              value={data.retentionDays}
            />
            <small>0 を指定すると無期限で保存します。</small>
          </label>,
        )}
      </section>
      {panels}
      <section className="settings-card danger-zone" id="forget">
        <h2>連絡先のデータ削除</h2>
        <p>指定した相手の会話、メール原文、添付ファイルを削除します。</p>
        <form action="/actions/forget" method="post" data-forget="">
          {field('contact', '削除するメールアドレス', '', 'email', true)}
          <button
            className="button-danger"
            type="button"
            data-confirm-forget=""
          >
            削除内容を確認
          </button>
          <dialog className="confirm-dialog" aria-labelledby="delete-title">
            <h2 id="delete-title">連絡先のデータを削除しますか？</h2>
            <p>
              <strong data-delete-contact=""></strong>{' '}
              のすべての会話、メール原文、添付ファイルが削除されます。この操作は取り消せません。
            </p>
            <div className="page-actions">
              <button
                className="button-secondary"
                type="button"
                data-cancel-forget=""
                autofocus
              >
                キャンセル
              </button>
              <button className="button-danger" type="submit">
                すべて削除
              </button>
            </div>
          </dialog>
        </form>
      </section>
    </div>,
    frame,
  )
}
