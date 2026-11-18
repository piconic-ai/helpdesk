import type { ConsoleFrame } from '../conversations/console-usecase'
import { shell, field } from '../conversations/console-page'
import { operatorAvatar } from './identity-page'
import { EditPage, Notice, FormSection, SettingRow } from '../../ui/patterns'
import { Field, Input } from '../../ui/controls'
import { SaveActions } from '../../ui/admin'

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
    <EditPage title="アカウント" back={{ href: '/', label: '受信箱に戻る' }}>
      {frame.query.saved && (
        <Notice kind="success">アカウントを保存しました。</Notice>
      )}
      {error && <Notice kind="error">{error}</Notice>}
      <FormSection title="プロフィール">
        <p>
          {operatorAvatar(self, frame.operator.email)}{' '}
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
          <Field label="アイコン画像">
            <Input
              type="file"
              name="avatar"
              accept="image/png,image/jpeg"
              aria-describedby="avatar-formats"
            />
          </Field>
          <small id="avatar-formats">
            JPEG・PNG（非インターレース）、2
            MB・200万画素まで。中央を正方形に切り抜きます。
          </small>
          <SaveActions primary verb="アカウントを保存" cancel="/" />
        </form>
      </FormSection>
      {frame.operator.role !== 'admin' && (
        <SettingRow
          title="API トークンの管理"
          href="/tokens"
          description="自分が発行した CLI・MCP のトークンを管理します。"
        />
      )}
    </EditPage>,
    frame,
  )
}
