import type { z } from 'zod'
import { shell } from '../conversations/conversations-page'
import type { ConsoleFrame } from '../conversations/console-usecase'
import type { tokenSummary } from './tokens'

const access = {
  read: '閲覧',
  draft: '閲覧・下書き',
  write: '閲覧・下書き・会話の管理',
}
export function tokensPage(
  tokens: z.infer<typeof tokenSummary>[],
  secret?: string,
  frame?: ConsoleFrame,
) {
  return shell(
    'API トークン',
    <>
      <header className="page-header">
        <h1>API トークン</h1>
      </header>
      {secret && (
        <section className="banner-success" role="status">
          <h2>トークンを発行しました</h2>
          <p>
            この画面で一度だけ表示します。コピーして CLI の HELPDESK_TOKEN
            または MCP の認証に設定してください。
          </p>
          <code>{secret}</code>
        </section>
      )}
      <section className="settings-card">
        <h2>トークンの発行</h2>
        <form method="post" action="/tokens">
          <label>
            トークン名
            <input name="label" required maxlength={100} />
          </label>
          <label>
            権限
            <select name="access">
              {Object.entries(access).map(([v, label]) => (
                <option value={v}>{label}</option>
              ))}
            </select>
          </label>
          <button className="button-primary">発行する</button>
        </form>
      </section>
      <section className="settings-card">
        <h2>発行済みのトークン</h2>
        {tokens.length ? (
          <ul className="token-list">
            {tokens.map((t) => (
              <li>
                <strong>{t.label}</strong>
                <span>{access[t.access]}</span>
                <button
                  className="button-danger"
                  aria-label={t.label + 'を失効させる'}
                  {...{ commandfor: 'revoke-' + t.id, command: 'show-modal' }}
                >
                  失効させる
                </button>
                <dialog
                  id={'revoke-' + t.id}
                  className="confirm-dialog"
                  aria-labelledby={'revoke-title-' + t.id}
                >
                  <h2 id={'revoke-title-' + t.id}>
                    トークンを失効させますか？
                  </h2>
                  <p>
                    「{t.label}」を使っている CLI や MCP
                    クライアントは接続できなくなります。
                  </p>
                  <div className="page-actions">
                    <form method="dialog">
                      <button autofocus>キャンセル</button>
                    </form>
                    <form method="post" action={'/tokens/' + t.id + '/revoke'}>
                      <button className="button-danger">失効させる</button>
                    </form>
                  </div>
                </dialog>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">発行済みのトークンはありません。</p>
        )}
      </section>
    </>,
    frame,
  )
}
