import type { Child } from 'hono/jsx'
import type { panels, management } from './registry-usecase'
import { shell } from '../conversations/conversations-page'
import type { ConsoleFrame } from '../conversations/console-usecase'
import { guides } from './extension-guides'
import type { coreOperations } from '../operations/catalog-usecase'
import { extensionLabel, fieldLabel, operationLabel } from './extension-labels'

const permissions = {
  read_body: '問い合わせ本文の閲覧',
  send: 'メール送信',
  external_fetch: '外部サービスへの接続',
}
export function managementPage(
  data: Awaited<ReturnType<typeof management>>,
  frame?: ConsoleFrame,
  changed?: string,
) {
  const updated = data.entries.find((e) => e.id === changed)
  return shell(
    '拡張機能',
    <>
      <header className="page-header">
        <h1>拡張機能</h1>
      </header>
      {updated && (
        <p role="status" className="banner-success">
          {extensionLabel(updated.id)}を{updated.enabled ? '有効' : '無効'}
          にしました。
        </p>
      )}
      {data.failures.length > 0 && (
        <section className="banner-error" role="alert">
          <h2>拡張への配信に失敗しました</h2>
          {data.failures.map((f) => (
            <p>
              {extensionLabel(String(f.extension))} · イベント {String(f.event)}{' '}
              · {String(f.error)}
            </p>
          ))}
        </section>
      )}
      <div className="settings-groups">
        {[true, false].map((enabled) => (
          <section>
            <h2>{enabled ? '有効な拡張' : '無効な拡張'}</h2>
            {data.entries
              .filter((e) => e.enabled === enabled)
              .map((e) => (
                <section
                  className="settings-card"
                  id={'extension-' + e.id}
                  data-extension={e.id}
                >
                  <div className="card-heading">
                    <h3>{extensionLabel(e.id)}</h3>
                    <span className="label-chip">
                      {e.enabled ? '有効' : '無効'}
                    </span>
                  </div>
                  <p>{guides[e.id]?.description ?? e.id}</p>
                  {e.enabled && (
                    <a href={'/extensions/' + e.id}>設定・使い始め方</a>
                  )}
                  <p>
                    使用する権限　
                    {e.permissions.map((p) => permissions[p]).join('、') ||
                      '追加の権限はありません'}
                  </p>
                  {!!e.secrets.length && (
                    <p>
                      必要なシークレット　<code>{e.secrets.join('、')}</code>
                    </p>
                  )}
                  <form method="post" action={'/extensions/' + e.id}>
                    <input
                      type="hidden"
                      name="enabled"
                      value={e.enabled ? 'no' : 'yes'}
                    />
                    <button
                      className="button-secondary"
                      aria-label={
                        extensionLabel(e.id) +
                        (e.enabled ? 'を無効にする' : 'を有効にする')
                      }
                    >
                      {e.enabled ? '無効にする' : '有効にする'}
                    </button>
                  </form>
                </section>
              ))}
          </section>
        ))}
      </div>
    </>,
    frame,
  )
}

type Panel = Awaited<ReturnType<typeof panels>>[number]
type Operation = Panel['operations'][number]
const statuses: Record<string, string> = { draft: '下書き', published: '公開' }
function operationField(
  op: Operation,
  key: string,
  panel: Panel,
  number?: number,
) {
  if (key === 'number' && number)
    return <input type="hidden" name={key} value={number} />
  const required = op.inputSchema.required?.includes(key)
  const options = panel.choices[key]
  const label = fieldLabel(key)
  if (options)
    return (
      <label>
        {label}
        <select name={key}>
          {options.map((value) => (
            <option value={value}>{statuses[value] ?? value}</option>
          ))}
        </select>
      </label>
    )
  if (['body', 'markdown', 'summary'].includes(key))
    return (
      <label>
        {label}
        <textarea name={key} rows={3} required={required} />
      </label>
    )
  if (key === 'unmask')
    return (
      <label>
        {label}
        <select name={key}>
          <option value="">伏せて書き出す</option>
          <option value="true">含めて書き出す</option>
        </select>
      </label>
    )
  return (
    <label>
      {label}
      <input name={key} required={required} />
    </label>
  )
}
type Details = Awaited<ReturnType<typeof coreOperations.get.execute>>
function mergeTargets(data: Details) {
  return data.history.filter(
    (item) =>
      item.mailbox === data.conversation.mailbox && item.kind === 'inquiry',
  )
}
function actionsFor(p: Panel, data?: Details) {
  if (!data) return p.operations
  const c = data.conversation
  return p.operations.filter((op) => {
    switch (op.name) {
      case 'feedback.review':
        return c.kind === 'feedback' && c.status.kind === 'received'
      case 'feedback.convert':
        return c.kind === 'feedback' && c.status.kind !== 'spam'
      case 'articles.attach':
      case 'issues.link':
      case 'issues.create':
        return false
      case 'issues.impact':
        return (
          c.kind === 'inquiry' &&
          p.links.some((l) => l.href.startsWith('https://github.com/'))
        )
      case 'merge.combine':
        return c.kind === 'inquiry' && mergeTargets(data).length > 0
      case 'snooze.resume':
        return c.kind === 'inquiry' && !!p.content
      case 'snooze.defer':
        return c.kind === 'inquiry' && !p.content
      case 'issues.preview':
      case 'canned.apply':
        return (
          c.kind === 'inquiry' && ['open', 'pending'].includes(c.status.kind)
        )
      default:
        return true
    }
  })
}
function formField(
  op: Operation,
  key: string,
  p: Panel,
  number?: number,
  data?: Details,
) {
  if (key === 'product' && data)
    return <input type="hidden" name={key} value={data.conversation.product} />
  if (key === 'target' && data)
    return (
      <label>
        統合先の問い合わせ
        <select name="target" required>
          {mergeTargets(data).map((t) => (
            <option value={t.number}>
              {t.subject} (#{t.number})
            </option>
          ))}
        </select>
      </label>
    )
  if (key === 'issue')
    return (
      <label>
        Issue
        <select name="issue">
          {p.links
            .filter((l) => l.href.startsWith('https://github.com/'))
            .map((l) => (
              <option value={l.href.split('/').at(-1)}>{l.label}</option>
            ))}
        </select>
      </label>
    )
  if (key === 'days')
    return (
      <label>
        期間
        <select name="days">
          <option value="7">7日間</option>
          <option value="30" selected>
            30日間
          </option>
          <option value="90">90日間</option>
        </select>
      </label>
    )
  if (key === 'until')
    return (
      <label>
        再表示日時（日本時間）
        <input required type="datetime-local" name="untilLocal" />
      </label>
    )
  return operationField(op, key, p, number)
}
function actionForm(op: Operation, p: Panel, number?: number, data?: Details) {
  return (
    <form
      method="post"
      className="extension-form"
      action={'/actions/' + op.name}
    >
      {Object.keys(op.inputSchema.properties ?? {}).map((key) =>
        formField(op, key, p, number, data),
      )}
      <button className="button-secondary">
        {operationLabel(op.name, op.description)}
      </button>
    </form>
  )
}
function summaryFor(p: Panel, data?: Details) {
  if (p.content) return p.content
  switch (p.id) {
    case 'issues':
      return (
        '関連付けた Issue　' +
        p.links.filter((l) => l.href.startsWith('https://github.com/')).length +
        '件'
      )
    case 'snooze':
      return 'この会話は保留されていません。'
    case 'merge':
      return data
        ? '統合できる問い合わせ　' + mergeTargets(data).length + '件'
        : ''
    case 'canned':
      return '利用できる定型文　' + (p.choices.template?.length ?? 0) + '件'
    case 'feedback':
      return data?.conversation.status.kind === 'received'
        ? '未確認のフィードバックです。'
        : '確認済みのフィードバックです。'
    default:
      return ''
  }
}
function panel(p: Panel, number?: number, data?: Details) {
  const ops = actionsFor(p, data)
  if (!ops.length && !p.content && !p.links.length && !p.script) return null
  if (
    data &&
    data.conversation.kind === 'feedback' &&
    ['issues', 'articles', 'snooze', 'merge', 'canned'].includes(p.id)
  )
    return null
  const summary = summaryFor(p, data)
  const title = extensionLabel(p.id) === p.id ? p.title : extensionLabel(p.id)
  return (
    <section
      className="settings-card extension-panel"
      data-number={number}
      data-extension={p.id}
      id={'extension-' + p.id}
    >
      <h2>{title}</h2>
      {p.script && <script defer src={p.script}></script>}
      {summary && <p className="extension-content">{summary}</p>}
      {p.links.map((l) => (
        <p>
          <a href={l.href}>{l.label}</a>
        </p>
      ))}
      {ops.map((op) => {
        if (op.name.startsWith('feedback.') || p.slot === 'settings')
          return actionForm(op, p, number, data)
        const label =
          op.name === 'issues.preview'
            ? 'Issue を起票する'
            : operationLabel(op.name, op.description)
        return (
          <details>
            <summary>{label}</summary>
            {actionForm(op, p, number, data)}
          </details>
        )
      })}
      {ops.some((op) => op.name === 'issues.preview') && (
        <a href={'/extensions/issues/link/' + number}>既存の Issue を選ぶ</a>
      )}
    </section>
  )
}
export function extensionPanels(
  data: Panel[],
  number?: number,
  conversation?: Details,
) {
  return <>{data.map((p) => panel(p, number, conversation))}</>
}

export function issuePreview(
  result: {
    repository: string
    title: string
    body: string
    number: number
    confirmation: string
  },
  frame: ConsoleFrame,
) {
  return shell(
    '起票内容を確認',
    <>
      <h1>起票内容を確認</h1>
      <section className="settings-card">
        <p>{result.repository}</p>
        <h2>{result.title}</h2>
        <pre className="message-body">{result.body}</pre>
        <form action="/actions/issues.create" method="post">
          <input
            name="confirmation"
            type="hidden"
            value={result.confirmation}
          />
          <input name="number" type="hidden" value={result.number} />
          <button className="button-primary">確認した内容で起票</button>
        </form>
        <a href={'/conversation/' + result.number}>会話に戻る</a>
      </section>
    </>,
    frame,
  )
}
function resultText(key: string, value: unknown) {
  if (value === null) return 'データなし'
  if (typeof value === 'number') {
    if (['from', 'to', 'until', 'closedAt'].includes(key))
      return new Intl.DateTimeFormat('ja-JP', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Asia/Tokyo',
      }).format(value)
    if (['resolutionMs', 'operatorMs'].includes(key))
      return Math.round(value / 60000).toLocaleString('ja-JP') + '分'
    if (['firstContactRate', 'ratio'].includes(key))
      return new Intl.NumberFormat('ja-JP', {
        style: 'percent',
        maximumFractionDigits: 1,
      }).format(value)
  }
  if (key === 'status' && typeof value === 'string')
    return statuses[value] ?? value
  return String(value)
}
function resultValue(key: string, value: unknown): Child {
  if (Array.isArray(value))
    return (
      <ul>
        {value.map((v) => (
          <li>{resultValue(key, v)}</li>
        ))}
      </ul>
    )
  if (value && typeof value === 'object')
    return (
      <dl className="result-fields">
        {Object.entries(value).map(([k, v]) => (
          <div>
            <dt>{fieldLabel(k)}</dt>
            <dd>{resultValue(k, v)}</dd>
          </div>
        ))}
      </dl>
    )
  return <span>{resultText(key, value)}</span>
}
export function operationResult(
  name: string,
  result: unknown,
  number?: number,
  frame?: ConsoleFrame,
) {
  const title = operationLabel(name)
  return shell(
    title,
    <>
      <header className="page-header">
        <h1>{title}</h1>
      </header>
      <section className="settings-card">
        {name === 'export.jsonl' ? (
          <pre>{String(result)}</pre>
        ) : result === null ? (
          <p role="status" className="banner-success">
            操作が完了しました。
          </p>
        ) : (
          resultValue('', result)
        )}
      </section>
      <a
        className="button-quiet"
        href={number ? '/conversation/' + number : '/'}
      >
        {number ? '会話に戻る' : '受信箱に戻る'}
      </a>
    </>,
    frame,
  )
}
