import { listRows, ListFilters, PageLinks } from '../../ui/listing'
import { projectTerm } from '../settings/project-term'
import { ProductMark } from '../../ui/product-mark'
import type { tokenPageData } from './tokens-usecase'
import { shell } from '../conversations/conversations-page'
import type { ConsoleFrame } from '../conversations/console-usecase'
import {
  ListPage,
  Notice,
  FormSection,
  RowList,
  ListRow,
  ActionBar,
  EmptyState,
} from '../../ui/patterns'
import { Button, Field, Input, NativeSelect } from '../../ui/controls'
import { Dialog } from '../../ui/controls'

const access = {
  read: '閲覧',
  draft: '閲覧・下書き',
  write: '閲覧・下書き・会話の管理',
}
type TokenPageData = Awaited<ReturnType<typeof tokenPageData>>
const allProjects = 'アクセスできるすべての' + projectTerm

function scopeSummary(
  token: TokenPageData['tokens'][number],
  projects: TokenPageData['projects'],
) {
  if (token.products === undefined) return allProjects
  const selected = new Set(token.products)
  const names = projects.filter((p) => selected.has(p.id)).map((p) => p.name)
  return names.length ? names.join('、') : '現在アクセスできる対象はありません'
}

function TokenProjectScope({ projects }: Pick<TokenPageData, 'projects'>) {
  const choices = projects.filter((p) => p.archivedAt === null)
  return (
    <fieldset className="template-choices" data-token-scope="">
      <legend>{'対象の' + projectTerm}</legend>
      <label>
        <Input type="radio" name="projectScope" value="all" checked />
        {allProjects}
      </label>
      {choices.length > 0 && (
        <>
          <label>
            <Input type="radio" name="projectScope" value="selected" />
            {projectTerm + 'を選ぶ'}
          </label>
          <div data-token-projects="" data-layout="stack" data-gap="xs">
            {choices.length > 8 && (
              <Input
                type="search"
                data-token-search=""
                aria-label="候補を絞り込む"
                placeholder="候補を絞り込む"
              />
            )}
            {choices.map((p) => (
              <label>
                <Input type="checkbox" name="products" value={p.id} />
                <span>
                  <ProductMark product={p} />
                </span>
              </label>
            ))}
            <small data-token-empty-search="" hidden>
              一致する候補はありません。
            </small>
          </div>
        </>
      )}
    </fieldset>
  )
}
export function tokensPage(
  { tokens, projects }: TokenPageData,
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
        (tokens.length > 0 || !!query.q) && (
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
        )
      }
      footer={<PageLinks path="/tokens" query={query} {...list} />}
      back={
        frame?.operator.role === 'admin'
          ? { href: '/settings', label: '設定に戻る' }
          : { href: '/account', label: 'アカウントに戻る' }
      }
    >
      {revoked && (
        <Notice toast kind="success">
          トークンを失効させました。
        </Notice>
      )}
      {secret && (
        <Notice toast kind="success">
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
              description={access[t.access] + ' · ' + scopeSummary(t, projects)}
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
        <EmptyState icon={tokens.length ? 'search' : 'tokens'}>
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
          <TokenProjectScope projects={projects} />
          <Button variant="default">発行する</Button>
        </form>
      </FormSection>
    </ListPage>,
    frame,
  )
}
