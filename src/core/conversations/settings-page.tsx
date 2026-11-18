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
      <section className="banner-error">
        <h2>初期設定が必要です</h2>
        <ul>
          {issues.map((i) => (
            <li>{setupIssue(i)}</li>
          ))}
        </ul>
      </section>
    )
  )
}

export function settingsPage(issues: string[], frame: ConsoleFrame) {
  return shell(
    '設定',
    <div className="settings-view">
      <header className="page-header">
        <h1 className="page-title">設定</h1>
      </header>
      {setupIssues(issues)}
      <nav className="settings-card" aria-label="設定項目">
        <ul className="article-list">
          <li>
            <a href="/settings/mailboxes">プロダクトと窓口</a>
          </li>
          <li>
            <a href="/settings/operators">運営者</a>
          </li>
          <li>
            <a href="/settings/retention">保存期間</a>
          </li>
          <li>
            <a href="/tokens">API トークンの管理</a>
          </li>
        </ul>
      </nav>
      <section className="settings-card danger-zone">
        <h2>データ管理</h2>
        <ul className="article-list">
          {frame.extensions.some((e) => e.id === 'export') && (
            <li>
              <a href="/extensions/export">データの書き出し</a>
            </li>
          )}
          <li>
            <a href="/settings/deletion">連絡先のデータ削除</a>
          </li>
        </ul>
      </section>
    </div>,
    frame,
  )
}
function addressFields(domains: string[]) {
  if (!domains.length)
    return field('address', '窓口のメールアドレス', '', 'email', true)
  return (
    <>
      <label className="field">
        <span>窓口アドレスの先頭</span>
        <input name="local" required pattern="[^@\s]+" maxlength={64} />
      </label>
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
  return (
    <>
      {data.mailboxes.length > 0 && (
        <section className="settings-card">
          <h2>登録済みの窓口</h2>
          <ul>
            {data.mailboxes.map((m) => (
              <li>
                {m.name} · <code>{m.address}</code>
              </li>
            ))}
          </ul>
        </section>
      )}
      {frame.products.map((p) => (
        <section className="settings-card">
          <h2>{p.name} のメール差出人</h2>
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
              <input
                type="checkbox"
                name="showOperator"
                checked={p.showOperator}
              />{' '}
              返信した運営者の表示名を差出人に含める
            </label>
            <button className="button-secondary">差出人を保存</button>
          </form>
        </section>
      ))}
      <section className="settings-card" id="mailboxes">
        <h2>新しいプロダクトと窓口</h2>
        <form action="/settings/mailboxes" method="post">
          {field('name', 'プロダクト名', '', 'text', true)}
          {addressFields(domains)}
          <small>現在有効な拡張の自動送信ポリシーが承認されます。</small>
          <button className="button-primary">窓口を登録</button>
        </form>
      </section>
      {data.mailboxes.length > 0 && (
        <section className="settings-card">
          <details>
            <summary>登録済みのプロダクトに窓口を追加</summary>
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
              <button className="button-secondary">窓口を追加</button>
            </form>
          </details>
        </section>
      )}
    </>
  )
}
function operators(data: Data) {
  const admins = data.operators.filter((o) => o.role === 'admin')
  return (
    <section className="settings-card" id="operators">
      <h2>運営者の一覧</h2>
      {data.operators.map((o) => (
        <section aria-label={o.email}>
          <h3>{o.displayName}</h3>
          {action(
            'role',
            '運営者を保存',
            <>
              <code>{o.email}</code>
              <input type="hidden" name="email" value={o.email} />
              <label className="field">
                <span>表示名</span>
                <input
                  name="displayName"
                  maxlength={100}
                  value={o.displayName}
                />
              </label>
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
      ))}
    </section>
  )
}
function retention(data: Data) {
  return (
    <section className="settings-card" id="retention">
      <h2>完了した会話の保存期間</h2>
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
  )
}
function deletion(contacts: Contact[]) {
  return (
    <section className="settings-card danger-zone" id="forget">
      <h2>相手を選んでデータを削除</h2>
      <p>指定した相手の会話、メール原文、添付ファイルを削除します。</p>
      {!contacts.length ? (
        <p className="empty-state">削除できる連絡先はありません。</p>
      ) : (
        <form action="/actions/forget" method="post" data-forget="">
          <label className="field">
            <span>削除する相手</span>
            <select name="contact" required>
              <option value="">相手を選んでください</option>
              {contacts.map((c) => (
                <option value={c.email} data-conversations={c.conversations}>
                  {c.name ? c.name + ' · ' : ''}
                  {c.email}
                </option>
              ))}
            </select>
          </label>
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
              <strong data-delete-contact=""></strong> の会話{' '}
              <strong data-delete-count=""></strong>{' '}
              件と、保存されたメール原文・添付ファイルが削除されます。この操作は取り消せません。
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
      )}
    </section>
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
  const content = {
    mailboxes: () => mailboxes(data, domains, frame),
    operators: () => operators(data),
    retention: () => retention(data),
    deletion: () => deletion(contacts),
  }
  return shell(
    titles[section],
    <div className="settings-view">
      <a href="/settings" className="back-link">
        設定に戻る
      </a>
      <header className="page-header">
        <h1 className="page-title">{titles[section]}</h1>
      </header>
      {(saved === 'yes' || (section === 'mailboxes' && saved === 'sender')) && (
        <p role="status" className="banner-success">
          {saved === 'sender'
            ? 'メールの差出人を保存しました。'
            : notices[section]}
        </p>
      )}
      {content[section]()}
    </div>,
    frame,
  )
}
