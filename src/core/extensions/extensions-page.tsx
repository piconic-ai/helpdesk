import type { Child } from 'hono/jsx'
import type { panels, management } from './registry-usecase'
import { shell } from '../conversations/conversations-page'
import type { ConsoleFrame } from '../conversations/console-usecase'
import { extensionLabel, fieldLabel, operationLabel } from './extension-labels'

const permissions = {
  read_body: '問い合わせ本文の閲覧',
  send: 'メール送信',
  external_fetch: '外部サービスへの接続',
}
export function managementPage(
  data: Awaited<ReturnType<typeof management>>,
  frame?: ConsoleFrame,
) {
  return shell(
    '拡張機能',
    <>
      <header className="page-header">
        <h1>拡張機能</h1>
      </header>
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
        {data.entries.map((e) => (
          <section
            className="settings-card"
            id={'extension-' + e.id}
            data-extension={e.id}
          >
            <div className="card-heading">
              <h2>{extensionLabel(e.id)}</h2>
              <span className="label-chip">{e.enabled ? '有効' : '無効'}</span>
            </div>
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
function panelContents(p: Panel, number?: number) {
  return (
    <>
      {p.script && <script defer src={p.script}></script>}
      {p.content && <p className="extension-content">{p.content}</p>}
      {p.links.map((link) => (
        <p>
          <a href={link.href}>{link.label}</a>
        </p>
      ))}
      {p.operations.map((op) => (
        <form
          method="post"
          className="extension-form"
          action={'/actions/' + op.name}
        >
          {Object.keys(op.inputSchema.properties ?? {}).map((key) =>
            operationField(op, key, p, number),
          )}
          <button className="button-secondary">
            {operationLabel(op.name, op.description)}
          </button>
        </form>
      ))}
    </>
  )
}
export function extensionPanels(data: Panel[], number?: number) {
  return (
    <>
      {data.map((p) => {
        const title =
          extensionLabel(p.id) === p.id ? p.title : extensionLabel(p.id)
        return (
          <section
            className="settings-card extension-panel"
            data-number={number}
            data-extension={p.id}
            id={'extension-' + p.id}
          >
            {p.slot === 'list' ? (
              <details>
                <summary>{title}</summary>
                {panelContents(p, number)}
              </details>
            ) : (
              <>
                <h2>{title}</h2>
                {panelContents(p, number)}
              </>
            )}
          </section>
        )
      })}
    </>
  )
}

function resultText(key: string, value: unknown) {
  if (value === null) return 'データなし'
  if (typeof value === 'number') {
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
