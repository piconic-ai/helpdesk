import {
  listRows,
  ListFilters,
  matchesSearch,
  PageLinks,
} from '../../ui/listing'
import { Dialog } from '../../ui/controls'
import {
  ListPage,
  EditPage,
  OverviewPage,
  ListRow,
  SettingRow,
  RowList,
  Notice,
  EmptyState,
  ActionBar,
  FormSection,
} from '../../ui/patterns'
import { Button, Field, Input, NativeSelect } from '../../ui/controls'
import { SaveActions, Disclosure } from '../../ui/admin'
import { z } from 'zod'
import { shell, action, field, select } from './console-page'
import type { Result } from './inbox-page'
import type { ConsoleFrame } from './console-usecase'

const titles = {
  mailboxes: 'プロダクトと窓口',
  operators: '運営者',
  retention: '保存期間',
  deletion: '連絡先のデータ削除',
}
export const settingsSections = z.enum([
  'mailboxes',
  'operators',
  'retention',
  'deletion',
])
type Section = z.infer<typeof settingsSections>
type Data = Result<'settings'>
type Contact = { email: string; name: string | null; conversations: number }

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
function setupIssues(issues: string[]) {
  return (
    issues.length > 0 && (
      <Notice kind="error">
        <h2>初期設定が必要です</h2>
        <ul>
          {issues.map((i) => (
            <li>{setupIssue(i)}</li>
          ))}
        </ul>
      </Notice>
    )
  )
}

export function settingsPage(
  issues: string[],
  frame: ConsoleFrame,
  data: Data,
  tokenCount: number,
) {
  const query = frame.query
  const general = [
    {
      href: '/settings/mailboxes',
      title: titles.mailboxes,
      description: '問い合わせを受け付ける窓口とメールの差出人を管理します。',
      value: '窓口 ' + data.mailboxes.length + '件',
    },
    {
      href: '/settings/operators',
      title: titles.operators,
      description: '運営者の表示名と権限を変更します。',
      value: data.operators.length + '人',
    },
    {
      href: '/settings/retention',
      title: titles.retention,
      description: '完了した問い合わせの本文を保持する期間を設定します。',
      value: data.retentionDays ? data.retentionDays + '日' : '無期限',
    },
    {
      href: '/tokens',
      title: 'API トークンの管理',
      description: 'CLI や MCP に使う自分のトークンを発行・失効します。',
      value: tokenCount + '件',
    },
  ]
  const sensitive = [
    {
      href: '/settings/deletion',
      title: titles.deletion,
      description: '相手と削除される会話の件数を確認してから実行します。',
      value: '取り消し不可',
    },
  ]
  if (frame.extensions.some((e) => e.id === 'export'))
    sensitive.unshift({
      href: '/extensions/export',
      title: 'データの書き出し',
      description: '会話・メッセージ・操作履歴を JSON Lines 形式で取得します。',
      value: 'JSON Lines',
    })
  const matchingRows = (rows: typeof general, group: string) =>
    rows
      .filter((row) =>
        matchesSearch(
          [group, row.title, row.description, row.value].join(' '),
          query.q,
        ),
      )
      .map((row) => <SettingRow {...row} />)
  const settings = matchingRows(general, '設定項目')
  const dataManagement = matchingRows(sensitive, 'データ管理')
  return shell(
    '設定',
    <OverviewPage
      title="設定"
      filters={
        <ListFilters
          title="設定項目"
          path="/settings"
          query={query}
          sortable={false}
        />
      }
    >
      {setupIssues(issues)}
      {settings.length > 0 && <nav aria-label="設定項目">{settings}</nav>}
      {dataManagement.length > 0 && (
        <FormSection
          title="データ管理"
          description="連絡先を削除すると、その相手との会話や添付ファイルも消えます。"
        >
          {dataManagement}
        </FormSection>
      )}
      {!settings.length && !dataManagement.length && (
        <EmptyState>
          条件に合う設定項目はありません。検索条件を解除すると、すべての項目を表示できます。
        </EmptyState>
      )}
    </OverviewPage>,
    frame,
  )
}
function addressFields(domains: string[]) {
  if (!domains.length)
    return field('address', '窓口のメールアドレス', '', 'email', true)
  return (
    <>
      <Field label="窓口アドレスの先頭">
        <Input name="local" required pattern="[^@\s]+" maxlength={64} />
      </Field>
      {select(
        'domain',
        '送信ドメイン',
        Object.fromEntries(domains.map((d) => [d, d])),
        domains[0],
      )}
    </>
  )
}
function mailboxes(data: Data, domains: string[], frame: ConsoleFrame) {
  const cancel = '/settings'
  return (
    <>
      {data.mailboxes.length > 0 && (
        <FormSection title="登録済みの窓口">
          <RowList>
            {data.mailboxes.map((m) => (
              <ListRow title={m.name} description={<code>{m.address}</code>} />
            ))}
          </RowList>
        </FormSection>
      )}
      {frame.products.map((p) => (
        <FormSection title={p.name + ' のメール差出人'}>
          <form
            method="post"
            action={'/settings/senders/' + encodeURIComponent(p.id)}
          >
            {field(
              'senderName',
              '差出人名',
              p.senderName ?? p.name,
              'text',
              true,
            )}
            <label>
              <Input
                type="checkbox"
                name="showOperator"
                checked={p.showOperator}
              />{' '}
              返信した運営者の表示名を差出人に含める
            </label>
            <SaveActions verb="差出人を保存" cancel={cancel} />
          </form>
        </FormSection>
      ))}
      <FormSection title="新しいプロダクトと窓口" id="mailboxes">
        <form action="/settings/mailboxes" method="post">
          {field('name', 'プロダクト名', '', 'text', true)}
          {addressFields(domains)}
          <small>現在有効な拡張の自動送信ポリシーが承認されます。</small>
          <SaveActions verb="窓口を登録" cancel={cancel} primary />
        </form>
      </FormSection>
      {data.mailboxes.length > 0 && (
        <Disclosure title="登録済みのプロダクトに窓口を追加">
          <form action="/settings/mailboxes" method="post">
            {select(
              'product',
              'プロダクト',
              Object.fromEntries(
                data.mailboxes.map((m) => [m.product, m.name]),
              ),
              data.mailboxes[0].product,
            )}
            {addressFields(domains)}
            <SaveActions verb="窓口を追加" cancel={cancel} />
          </form>
        </Disclosure>
      )}
    </>
  )
}
function operators(data: Data, visible: Data['operators']) {
  const admins = data.operators.filter((o) => o.role === 'admin')
  return (
    <RowList>
      {visible.map((o) => (
        <ListRow
          title={o.displayName}
          description={<code>{o.email}</code>}
          status={o.role === 'admin' ? '管理者' : '担当者'}
          action={
            <Disclosure title={'編集：' + o.displayName}>
              <section aria-label={o.email}>
                <h3>{o.displayName}</h3>
                {action(
                  'role',
                  '運営者を保存',
                  <>
                    <input type="hidden" name="email" value={o.email} />
                    <Field label="表示名">
                      <Input
                        name="displayName"
                        maxlength={100}
                        value={o.displayName}
                      />
                    </Field>
                    {admins.length === 1 && admins[0].email === o.email ? (
                      <>
                        <p>権限　管理者</p>
                        <small>
                          最後の管理者です。権限を変更するには、先にほかの運営者を管理者にしてください。
                        </small>
                        <input type="hidden" name="role" value="admin" />
                      </>
                    ) : (
                      select(
                        'role',
                        '権限',
                        { admin: '管理者', agent: '担当者' },
                        o.role,
                      )
                    )}
                  </>,
                )}
              </section>
            </Disclosure>
          }
        />
      ))}
    </RowList>
  )
}
function retention(data: Data) {
  return (
    <FormSection title="完了した会話の保存期間" id="retention">
      <form action="/actions/retention" method="post">
        <Field
          label="完了後に本文を保持する日数"
          description="0 を指定すると無期限で保存します。"
        >
          <Input
            name="days"
            type="number"
            min="0"
            max="36500"
            required
            value={data.retentionDays}
          />
        </Field>
        <SaveActions verb="保存期間を変更" cancel="/settings" primary />
      </form>
    </FormSection>
  )
}
function deletion(contacts: Contact[]) {
  return (
    <FormSection id="forget" title="相手を選んでデータを削除">
      <p>指定した相手の会話、メール原文、添付ファイルを削除します。</p>
      {!contacts.length ? (
        <EmptyState>削除できる連絡先はありません。</EmptyState>
      ) : (
        <form action="/actions/forget" method="post" data-forget="">
          <Field label="削除する相手">
            <NativeSelect name="contact" required>
              <option value="">相手を選んでください</option>
              {contacts.map((c) => (
                <option value={c.email} data-conversations={c.conversations}>
                  {c.name ? c.name + ' · ' : ''}
                  {c.email}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Button variant="destructive" type="button" data-confirm-forget="">
            削除内容を確認
          </Button>
          <Dialog
            id="delete-contact"
            title="連絡先のデータを削除しますか？"
            description={
              <>
                <strong data-delete-contact=""></strong> の会話{' '}
                <strong data-delete-count=""></strong>{' '}
                件と、保存されたメール原文・添付ファイルが削除されます。この操作は取り消せません。
              </>
            }
          >
            <ActionBar>
              <Button
                variant="outline"
                type="button"
                data-cancel-forget=""
                autofocus
              >
                キャンセル
              </Button>
              <Button variant="destructive" type="submit">
                すべて削除
              </Button>
            </ActionBar>
          </Dialog>
        </form>
      )}
    </FormSection>
  )
}
const notices: Record<Section, string> = {
  mailboxes: '窓口を登録しました。',
  operators: '運営者の情報を保存しました。',
  retention: '保存期間を変更しました。',
  deletion: '選択した相手のデータを削除しました。',
}
export function settingsSectionPage(
  section: Section,
  data: Data,
  domains: string[],
  contacts: Contact[],
  frame: ConsoleFrame,
  saved: string | undefined,
) {
  const list = listRows(data.operators, frame.query, (person) => ({
    text: person.displayName + ' ' + person.email,
    filter: person.role,
  }))
  const content = {
    mailboxes: () => mailboxes(data, domains, frame),

    retention: () => retention(data),
    deletion: () => deletion(contacts),
  }
  const notice = (saved === 'yes' ||
    (section === 'mailboxes' && saved === 'sender')) && (
    <Notice kind="success">
      {saved === 'sender' ? 'メールの差出人を保存しました。' : notices[section]}
    </Notice>
  )
  const back = { href: '/settings', label: '設定に戻る' }
  const title = titles[section]
  return shell(
    title,
    section === 'operators' ? (
      <ListPage
        title={title}
        description={list.total + '人'}
        filters={
          <ListFilters
            title="運営者"
            path="/settings/operators"
            query={frame.query}
            filterLabel="権限で絞り込む"
            options={[
              { value: 'admin', label: '管理者' },
              { value: 'agent', label: '担当者' },
            ]}
          />
        }
        footer={
          <PageLinks path="/settings/operators" query={frame.query} {...list} />
        }
        back={back}
      >
        {notice}
        {list.rows.length ? (
          operators(data, list.rows)
        ) : (
          <EmptyState>条件に合う運営者はいません。</EmptyState>
        )}
      </ListPage>
    ) : (
      <EditPage title={title} back={back}>
        {notice}
        {content[section]()}
      </EditPage>
    ),
    frame,
  )
}
