import { raw } from 'hono/html'
import { shell } from '../core/conversations/console-page'
import type { ConsoleFrame } from '../core/conversations/console-usecase'
import type { Article } from '../extensions/articles/article'
import { publicPath } from '../extensions/articles/article'
import { articleMarkup } from '../extensions/articles/articles-pages'
import { fieldLabel, extensionLabel } from '../core/extensions/extension-labels'
import { guides, publicGuides } from '../core/extensions/extension-guides'
import type { Child } from 'hono/jsx'

export function productSelect(frame: ConsoleFrame, selected = '', all = false) {
  return (
    <label>
      プロダクト
      <select name="product" required={!all}>
        {all && (
          <option value="" selected={!selected}>
            すべてのプロダクト
          </option>
        )}
        {frame.products.map((p) => (
          <option value={p.id} selected={selected === p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  )
}
export function adminPage(
  title: string,
  frame: ConsoleFrame,
  body: Child,
  action?: Child,
) {
  return shell(
    title,
    <>
      <header className="page-header">
        <h1>{title}</h1>
        {action}
      </header>
      <div className="extension-workspace">{body}</div>
    </>,
    frame,
  )
}
export function libraryPage(
  frame: ConsoleFrame,
  articles: Article[],
  candidates: string[],
) {
  return adminPage(
    'ヘルプ記事',
    frame,
    <>
      {articles.length ? (
        <ul className="article-list">
          {articles.map((a) => (
            <li>
              <a
                href={
                  '/articles/edit?' +
                  new URLSearchParams({ product: a.product, id: a.id })
                }
              >
                {a.title}
              </a>{' '}
              <span className="label-chip">
                {a.status === 'published' ? '公開中' : '下書き'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">記事はまだありません。</p>
      )}
      {candidates.length > 0 && (
        <section className="settings-card">
          <h2>記事の候補</h2>
          <ul>
            {candidates.map((topic) => (
              <li>{topic}</li>
            ))}
          </ul>
        </section>
      )}
    </>,
    <a className="button-primary" href="/articles/new">
      記事を書く
    </a>,
  )
}
export function editorPage(
  frame: ConsoleFrame,
  data: Partial<Article>,
  preview: boolean,
  notice?: string,
) {
  const published = data.status === 'published'
  return adminPage(
    data.id ? '記事の編集' : '記事を書く',
    frame,
    <>
      {notice && (
        <p role="status" className="banner-success">
          {notice}
        </p>
      )}
      {published && (
        <a href={publicPath(data.product!, data.id!)}>公開記事を読む</a>
      )}
      {preview && (
        <article className="settings-card help-article">
          <h2>{data.title}</h2>
          {raw(articleMarkup(data.body ?? ''))}
        </article>
      )}
      <form className="settings-card" method="post" action="/articles/edit">
        {data.id ? (
          <>
            <input type="hidden" name="id" value={data.id} />
            <input type="hidden" name="product" value={data.product} />
            <p>{frame.products.find((p) => p.id === data.product)?.name}</p>
          </>
        ) : (
          productSelect(frame, data.product)
        )}
        <label>
          題名
          <input
            name="title"
            required
            maxlength={200}
            value={data.title ?? ''}
          />
        </label>
        <label>
          本文
          <textarea name="body" rows={10} required maxlength={100000}>
            {data.body ?? ''}
          </textarea>
        </label>
        <div className="public-actions">
          <button name="intent" value="preview">
            プレビュー
          </button>
          <button name="intent" value="draft">
            {published ? '非公開にして保存' : '下書きを保存'}
          </button>
          <button className="button-primary" name="intent" value="publish">
            {published ? '更新を公開' : '公開する'}
          </button>
        </div>
      </form>
      <a href="/articles">記事一覧に戻る</a>
    </>,
  )
}
type Portal = {
  id: string
  name: string
  url: string
  ready: boolean
  configured: boolean
  repository?: string
}
export function guidePage(
  id: string,
  frame: ConsoleFrame,
  items: Portal[],
  contents?: Child,
  notice?: string,
) {
  return adminPage(
    extensionLabel(id),
    frame,
    <>
      {notice && (
        <p role="status" className="banner-success">
          {notice}
        </p>
      )}
      <p>
        {guides[id]?.start ?? '設定後、対象の画面で動作を確認してください。'}
      </p>
      {id === 'articles' && <a href="/articles">記事の管理を開く</a>}
      {id === 'metrics' && <a href="/metrics">集計画面を開く</a>}
      {items.map((p) => (
        <section className="settings-card">
          <h2>{p.name}</h2>
          {id === 'issues' ? (
            <form method="post" action="/extensions/issues/repository">
              <input type="hidden" name="product" value={p.id} />
              <label>
                GitHub リポジトリ
                <input
                  name="repository"
                  value={p.repository}
                  placeholder="owner/repository"
                  required
                />
              </label>
              <button>登録する</button>
            </form>
          ) : p.ready ? (
            <>
              <a href={p.url}>{publicGuides[id]}</a>
              <p>
                <code>{p.url}</code>
              </p>
              <p>
                サイトに埋め込む場合は、表示先のオリジンをこのプロダクトの
                publicIntakes.origins に登録してください。
              </p>
              <label>
                埋め込みコード
                <textarea readonly rows={3}>
                  {'<iframe src="' +
                    p.url +
                    '" title="' +
                    extensionLabel(id) +
                    '" width="100%" height="540" loading="lazy"></iframe>'}
                </textarea>
              </label>
            </>
          ) : p.configured ? (
            <p>
              設定済みの受付ポリシーに、このサイトのオリジンを追加してください。
            </p>
          ) : (
            <form
              method="post"
              action={'/settings/public-intakes/' + encodeURIComponent(p.id)}
            >
              <input
                name="returnTo"
                type="hidden"
                value={'/extensions/' + id}
              />
              <button>このサイトで受付を開始</button>
            </form>
          )}
        </section>
      ))}
      {contents}
      <a href="/extensions">拡張の管理に戻る</a>
    </>,
  )
}
export type MetricFilter = {
  period: string
  product: string
  start: string
  end: string
}
export function metricsPage(
  frame: ConsoleFrame,
  filter: MetricFilter,
  result: Record<string, number | null>,
) {
  return adminPage(
    '対応状況の集計',
    frame,
    <>
      <form className="settings-card" action="/metrics" method="get">
        {productSelect(frame, filter.product, true)}
        <label>
          期間
          <select name="period">
            {[
              ['7', '過去7日'],
              ['30', '過去30日'],
              ['90', '過去90日'],
              ['custom', '日付を指定'],
            ].map(([value, label]) => (
              <option value={value} selected={value === filter.period}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>日付で指定（日本時間）</legend>
          <label>
            開始日
            <input type="date" name="start" value={filter.start} />
          </label>
          <label>
            終了日
            <input type="date" name="end" value={filter.end} />
          </label>
        </fieldset>
        <button>集計する</button>
      </form>
      <section className="settings-card">
        <h2>集計結果</h2>
        <dl className="result-fields">
          {Object.entries(result).map(([key, value]) => (
            <div>
              <dt>{fieldLabel(key)}</dt>
              <dd>{metricValue(key, value)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>,
  )
}
function metricValue(key: string, value: number | null) {
  if (value === null) return 'データなし'
  if (key.endsWith('Ms'))
    return Math.round(value / 60000).toLocaleString('ja-JP') + '分'
  if (key === 'firstContactRate')
    return new Intl.NumberFormat('ja-JP', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value)
  return String(value)
}
