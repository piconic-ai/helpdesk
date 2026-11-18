import type { ConsoleFrame } from '../conversations/console-usecase'
import { shell, field } from '../conversations/console-page'
import { operatorAvatar } from './identity-page'

export function accountPage(
  frame: ConsoleFrame,
  name?: string,
  error?: string,
) {
  const self = frame.operators.find(
    (person) => person.email === frame.operator.email,
  )
  return shell(
    'アカウント',
    <div className="settings-view">
      <header className="page-header">
        <h1 className="page-title">アカウント</h1>
      </header>
      {frame.query.saved && (
        <p className="banner-success" role="status">
          アカウントを保存しました。
        </p>
      )}
      {error && (
        <p className="banner-error" role="alert">
          {error}
        </p>
      )}
      <section className="settings-card">
        <h2>プロフィール</h2>
        <p className="actor-identity">
          {operatorAvatar(self, frame.operator.email)}
          <code>{frame.operator.email}</code>
        </p>
        <form method="post" action="/account" enctype="multipart/form-data">
          {field(
            'displayName',
            '表示名',
            name ?? self?.displayName ?? '',
            'text',
            true,
          )}
          <label className="field">
            <span>アイコン画像</span>
            <input
              type="file"
              name="avatar"
              accept="image/png,image/jpeg"
              aria-describedby="avatar-formats"
            />
          </label>
          <small id="avatar-formats">
            JPEG・PNG（非インターレース）、2
            MB・200万画素まで。中央を正方形に切り抜きます。
          </small>
          <button className="button-primary">アカウントを保存</button>
        </form>
      </section>
    </div>,
    frame,
  )
}
