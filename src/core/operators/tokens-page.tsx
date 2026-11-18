import { listRows, ListFilters, PageLinks } from '../../ui/listing'
import type { z } from 'zod'
import { shell } from '../conversations/conversations-page'
import type { ConsoleFrame } from '../conversations/console-usecase'
import type { tokenSummary } from './tokens'
import {
  ListPage,
  Notice,
  FormSection,
  RowList,
  ListRow,
  ActionBar,
  EmptyState,
} from '../../ui/patterns'
import {
  Button,
  Field,
  Input,
  NativeSelect,
  ActionLink,
} from '../../ui/controls'
import { Dialog } from '../../ui/controls'

const access = {
  read: '閲覧',
  draft: '閲覧・下書き',
  write: '閲覧・下書き・会話の管理',
}
export function tokensPage(
  tokens: z.infer<typeof tokenSummary>[],
  secret?: string,
  frame?: ConsoleFrame,
  revoked = false,
) {
  const query = frame?.query ?? {}
  const list = listRows(tokens, query, (t) => ({
    text: t.label,
    filter: t.access,
  }))
  return shell(
    'API トークン',
    <ListPage
      title="API トークン"
      description={list.total + '件'}
      filters={
        <ListFilters
          title="トークン"
          path="/tokens"
          query={query}
          filterLabel="権限で絞り込む"
          options={Object.entries(access).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      }
      footer={<PageLinks path="/tokens" query={query} {...list} />}
      back={
        frame?.operator.role === 'admin'
          ? { href: '/settings', label: '設定に戻る' }
          : { href: '/account', label: 'アカウントに戻る' }
      }
      action={
        <ActionLink href="#new-token" variant="outline">
          新しいトークン
        </ActionLink>
      }
    >
      {revoked && <Notice kind="success">トークンを失効させました。</Notice>}
      {secret && (
        <Notice kind="success">
          <h2>トークンを発行しました</h2>
          <p>
            この画面で一度だけ表示します。コピーして CLI の HELPDESK_TOKEN
            または MCP の認証に設定してください。
          </p>
          <code>{secret}</code>
        </Notice>
      )}
      <h2>発行済みのトークン</h2>
      {list.rows.length ? (
        <RowList>
          {list.rows.map((t) => (
            <ListRow
              title={t.label}
              description={access[t.access]}
              action={
                <>
                  <Button
                    variant="destructive"
                    aria-label={t.label + 'を失効させる'}
                    {...{ commandfor: 'revoke-' + t.id, command: 'show-modal' }}
                  >
                    失効させる
                  </Button>
                  <Dialog
                    id={'revoke-' + t.id}
                    title="トークンを失効させますか？"
                    description={
                      '「' +
                      t.label +
                      '」を使っている CLI や MCP クライアントは接続できなくなります。'
                    }
                  >
                    <ActionBar>
                      <form method="dialog">
                        <Button autofocus>キャンセル</Button>
                      </form>
                      <form
                        method="post"
                        action={'/tokens/' + t.id + '/revoke'}
                      >
                        <Button variant="destructive">失効させる</Button>
                      </form>
                    </ActionBar>
                  </Dialog>
                </>
              }
            />
          ))}
        </RowList>
      ) : (
        <EmptyState>
          {tokens.length
            ? '条件に合うトークンはありません。'
            : '発行済みのトークンはありません。'}
        </EmptyState>
      )}
      <FormSection title="トークンの発行" id="new-token">
        <form method="post" action="/tokens">
          <Field label="トークン名">
            <Input name="label" required maxlength={100} />
          </Field>
          <Field label="発行する権限">
            <NativeSelect name="access" aria-label="発行する権限">
              {Object.entries(access).map(([v, label]) => (
                <option value={v}>{label}</option>
              ))}
            </NativeSelect>
          </Field>
          <Button variant="default">発行する</Button>
        </form>
      </FormSection>
    </ListPage>,
    frame,
  )
}
