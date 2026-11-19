import type { SuggestionCount } from '../core/suggestions/suggestion'
import {
  RecommendationSettings,
  type RecommendationForm,
} from './recommendation-settings-page'
import { WidgetSettings } from './widget-settings-page'
import { ProductMark, ProductSelect } from '../ui/product-mark'
import { OutcomeCard } from '../ui/outcome-cards'
import { ArticleListRow } from '../ui/article-list'
import type {
  ArticleCandidate,
  CandidateSource,
} from './article-candidates-usecase'
import { Popover } from '../ui/controls'
import type { ListWindow } from '../ui/listing'
import { listRows, ListFilters, PageLinks } from '../ui/listing'
import {
  ListPage,
  DetailPage,
  EditPage,
  OverviewPage,
  FilterBar,
  ListRow,
  MetricGrid,
  RowList,
  Notice,
  EmptyState,
  ActionBar,
  FormSection,
} from '../ui/patterns'
import {
  ActionLink,
  Button,
  Field,
  Input,
  NativeSelect,
  Textarea,
} from '../ui/controls'
import { ArticlePreview, SaveActions } from '../ui/admin'
import {
  metricValue,
  metricDefinition,
  difference,
  metricSummary,
} from './metric-values'
import { raw } from 'hono/html'
import { shell } from '../core/conversations/console-page'
import type { ConsoleFrame } from '../core/conversations/console-usecase'
import type { Article } from '../extensions/articles/article'
import { publicPath } from '../extensions/articles/article'
import { articleMarkup } from '../extensions/articles/articles-pages'
import { fieldLabel, extensionLabel } from '../core/extensions/extension-labels'
import {
  publicSettingsFields,
  type PublicSettings,
} from './public-settings-page'
import { guides, publicGuides } from '../core/extensions/extension-guides'
import type { Child } from 'hono/jsx'

export function productSelect(frame: ConsoleFrame, selected = '', all = false) {
  return (
    <label>
      プロダクト
      <ProductSelect
        products={frame.products}
        selected={selected}
        empty={all ? 'すべてのプロダクト' : undefined}
      />
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
    <EditPage
      title={title}
      action={action}
      back={{ href: '/', label: '受信箱に戻る' }}
    >
      {body}
    </EditPage>,
    frame,
  )
}
type LibraryItem = Article & { helpful: number; votes: number }
const issueDate = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone: 'Asia/Tokyo',
})
export function libraryPage(
  frame: ConsoleFrame,
  items: LibraryItem[],
  performance: (SuggestionCount & { product: string; article: string })[],
  candidateCount: number,
  query: Record<string, string>,
) {
  const list = listRows(items, query, (a) => ({
    text:
      a.title +
      ' ' +
      (frame.products.find((p) => p.id === a.product)?.name ?? a.product),
    filter: a.status,
  }))
  const totals = new Map(
    performance.map((row) => [JSON.stringify([row.product, row.article]), row]),
  )
  const articles = list.rows
  const filters = (
    <ListFilters
      title="記事"
      path="/articles"
      query={query}
      filterLabel="公開状態"
      options={[
        { value: 'published', label: '公開中' },
        { value: 'draft', label: '下書き' },
      ]}
    />
  )
  return shell(
    'ヘルプ記事',
    <ListPage
      title="ヘルプ記事"
      description={list.total + '件'}
      footer={<PageLinks path="/articles" query={query} {...list} />}
      filters={filters}
      action={
        <ActionBar>
          <ActionLink href="/articles/questions">記事が無かった質問</ActionLink>
          <ActionLink href="/articles/candidates">
            候補（{candidateCount}件）
          </ActionLink>
          <ActionLink variant="default" href="/articles/new">
            記事を書く
          </ActionLink>
        </ActionBar>
      }
    >
      {articles.length ? (
        <RowList>
          {articles.map((a) => (
            <ArticleListRow
              title={a.title}
              performance={totals.get(JSON.stringify([a.product, a.id]))}
              href={
                '/articles/edit?' +
                new URLSearchParams({ product: a.product, id: a.id })
              }
              product={
                <ProductMark
                  product={
                    frame.products.find((p) => p.id === a.product) ?? {
                      id: a.product,
                      name: a.product,
                    }
                  }
                />
              }
              date={
                a.updatedAt !== undefined ? (
                  <time datetime={new Date(a.updatedAt).toISOString()}>
                    更新 {issueDate.format(a.updatedAt)}
                  </time>
                ) : (
                  '更新日未記録'
                )
              }
              rating={
                a.votes
                  ? '役に立った ' +
                    Math.round((100 * a.helpful) / a.votes) +
                    '%（' +
                    a.votes +
                    '件）'
                  : '評価なし'
              }
              status={a.status === 'published' ? '公開中' : '下書き'}
            />
          ))}
        </RowList>
      ) : (
        <EmptyState icon={items.length ? 'search' : 'articles'}>
          {items.length
            ? '条件に合う記事はありません。'
            : '記事はまだありません。'}
        </EmptyState>
      )}
    </ListPage>,
    frame,
  )
}
export function candidatesPage(
  frame: ConsoleFrame,
  candidates: ArticleCandidate[],
  query: Record<string, string>,
) {
  const list = listRows(candidates, query, (c) => ({
    text: c.topic + ' ' + c.subject + ' ' + c.product,
    filter: c.articleId ? 'started' : 'open',
  }))
  return shell(
    '記事の候補',
    <ListPage
      title="記事の候補"
      description={list.total + '件'}
      back={{ href: '/articles', label: '記事一覧に戻る' }}
      filters={
        <ListFilters
          title="候補"
          path="/articles/candidates"
          query={query}
          filterLabel="記事の作成"
          options={[
            { value: 'open', label: '未着手' },
            { value: 'started', label: '着手済み' },
          ]}
        />
      }
      footer={<PageLinks path="/articles/candidates" query={query} {...list} />}
    >
      {list.total ? (
        <RowList>
          {list.rows.map((c) => (
            <ListRow
              title={c.topic}
              href={
                c.articleId
                  ? '/articles/edit?' +
                    new URLSearchParams({ product: c.product, id: c.articleId })
                  : '/articles/new?candidate=' + c.number
              }
              description={
                <ProductMark
                  product={
                    frame.products.find((p) => p.id === c.product) ?? {
                      id: c.product,
                      name: c.product,
                    }
                  }
                />
              }
              status={c.articleId ? '着手済み' : '記事を書き始める'}
              action={
                <ActionLink
                  variant="ghost"
                  href={'/conversation/' + c.number}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  元の会話 #{c.number}
                </ActionLink>
              }
            />
          ))}
        </RowList>
      ) : (
        <EmptyState icon="search">該当する記事の候補はありません。</EmptyState>
      )}
    </ListPage>,
    frame,
  )
}
function SourceReference({ source }: { source: CandidateSource }) {
  return (
    <FormSection title="元の会話">
      <p>
        <strong>{source.subject}</strong>
      </p>
      {source.excerpt && <blockquote>{source.excerpt}</blockquote>}
      <ActionLink
        variant="ghost"
        href={'/conversation/' + source.number}
        target="_blank"
        rel="noopener noreferrer"
      >
        元の会話 #{source.number} を開く
      </ActionLink>
    </FormSection>
  )
}
function articleProduct(
  frame: ConsoleFrame,
  data: Partial<Article>,
  source?: CandidateSource | null,
) {
  if (!data.id && !source) return productSelect(frame, data.product)
  const product = frame.products.find((p) => p.id === data.product)
  return (
    <>
      {source && !data.id && (
        <input type="hidden" name="number" value={source.number} />
      )}
      {data.id && <input type="hidden" name="id" value={data.id} />}
      <input type="hidden" name="product" value={data.product} />
      {product && (
        <p>
          <ProductMark product={product} />
        </p>
      )}
    </>
  )
}
export function editorPage(
  frame: ConsoleFrame,
  data: Partial<Article>,
  preview: boolean,
  notice?: string,
  source?: CandidateSource | null,
) {
  const published = data.status === 'published'
  const title = data.id ? '記事の編集' : '記事を書く'
  const back = { href: '/articles', label: '記事一覧に戻る' }
  const form = (
    <form method="post" action="/articles/edit">
      {source && <SourceReference source={source} />}
      <FormSection title="記事の内容">
        {articleProduct(frame, data, source)}
        <Field label="題名">
          <Input
            name="title"
            required
            maxlength={200}
            value={data.title ?? ''}
          />
        </Field>
        <Field
          label="要約（任意）"
          description="質問に合う記事を選ぶための説明です。200文字ほどでまとめてください。"
        >
          <Textarea name="summary" rows={3} maxlength={400}>
            {data.summary ?? ''}
          </Textarea>
        </Field>
        <Field label="本文">
          <Textarea name="body" rows={10} required maxlength={100000}>
            {data.body ?? ''}
          </Textarea>
        </Field>
        <ActionBar>
          <Button variant="default" name="intent" value="publish">
            {published ? '更新を公開' : '公開する'}
          </Button>
          <Button variant="outline" name="intent" value="preview">
            プレビュー
          </Button>
          <Button variant="ghost" name="intent" value="draft">
            {published ? '非公開にして保存' : '下書きを保存'}
          </Button>
          <ActionLink href="/articles" variant="ghost" data-discard-draft="">
            取り消し
          </ActionLink>
        </ActionBar>
      </FormSection>
    </form>
  )
  if (preview)
    return shell(
      '記事のプレビュー',
      <DetailPage title="記事のプレビュー" back={back}>
        <ArticlePreview title={data.title ?? ''}>
          {raw(articleMarkup(data.body ?? ''))}
        </ArticlePreview>
        {form}
      </DetailPage>,
      frame,
    )
  return shell(
    title,
    <EditPage
      title={title}
      back={back}
      action={
        published && (
          <ActionLink
            variant="outline"
            href={publicPath(data.product!, data.id!)}
          >
            公開記事を読む
          </ActionLink>
        )
      }
    >
      {notice && <Notice kind="success">{notice}</Notice>}
      {form}
    </EditPage>,
    frame,
  )
}
type Portal = {
  id: string
  name: string
  url: string
  ready: boolean
  configured: boolean
  tokenReady?: boolean
  repository?: string
  recommendation?: RecommendationForm
  publicSettings?: PublicSettings
}
export function guidePage(
  id: string,
  frame: ConsoleFrame,
  items: Portal[],
  contents?: Child,
  notice?: string,
  undoId?: string,
  hasError = false,
  permissions = '追加の権限はありません',
  list?: ListWindow,
) {
  const Page = list === undefined ? EditPage : ListPage
  const create =
    id === 'rules'
      ? { id: 'new-rule', label: '新しいルール' }
      : { id: 'new-template', label: '新しい定型文' }
  return shell(
    extensionLabel(id),
    <Page
      title={extensionLabel(id)}
      description={list === undefined ? undefined : list.total + '件'}
      filters={
        list && (
          <ListFilters
            title={extensionLabel(id)}
            path={'/extensions/' + id}
            query={frame.query}
          />
        )
      }
      footer={
        list && (
          <PageLinks path={'/extensions/' + id} query={frame.query} {...list} />
        )
      }
      back={{ href: '/extensions', label: '拡張の管理に戻る' }}
      action={
        list === undefined ? undefined : (
          <ActionLink href={'#' + create.id}>{create.label}</ActionLink>
        )
      }
    >
      {notice && (
        <Notice kind={hasError ? 'error' : 'success'}>
          {notice}
          {undoId && (
            <form method="post" action={'/extensions/' + id + '/undo-setting'}>
              <input type="hidden" name="changeId" value={undoId} />
              <Button>元に戻す</Button>
            </form>
          )}
        </Notice>
      )}
      <p>
        {guides[id]?.start ?? '設定後、対象の画面で動作を確認してください。'}
      </p>
      {id === 'issues' && (
        <p>
          {items.some((p) => p.tokenReady)
            ? 'GITHUB_TOKEN は設定済みです。'
            : 'GITHUB_TOKEN は未設定です。'}
          投稿には Worker のシークレット GITHUB_TOKEN
          が必要です。対象リポジトリの Issues
          に読み書きできるトークンを設定してください。
        </p>
      )}
      {id === 'articles' && (
        <ActionLink href="/articles">記事の管理を開く</ActionLink>
      )}
      {id === 'metrics' && (
        <ActionLink href="/metrics">集計画面を開く</ActionLink>
      )}
      {id === 'chat' && (
        <>
          <link rel="stylesheet" href="/ui/widget-settings.css" />
          <script defer src="/ui/widget-settings.js" />
        </>
      )}
      {items.map((p) => (
        <FormSection title={<ProductMark product={p} size="heading" />}>
          {id === 'issues' ? (
            <form method="post" action="/extensions/issues/repository">
              <input type="hidden" name="product" value={p.id} />
              <label>
                GitHub リポジトリ
                <Input
                  name="repository"
                  value={p.repository}
                  placeholder="owner/repository"
                  required
                />
              </label>
              <SaveActions verb="登録する" cancel="/extensions/issues" />
            </form>
          ) : p.ready ? (
            <>
              <ActionLink href={p.url}>{publicGuides[id]}</ActionLink>
              <p>
                <code>{p.url}</code>
              </p>
              {id === 'chat' && p.publicSettings?.widget ? (
                <WidgetSettings
                  product={p}
                  url={p.url}
                  options={p.publicSettings.widget}
                />
              ) : (
                <>
                  <p>登録済みのサイトに次のコードを貼り付けてください。</p>
                  <label>
                    埋め込みコード
                    <Textarea readonly rows={3}>
                      {'<iframe src="' +
                        p.url +
                        '" title="' +
                        extensionLabel(id) +
                        '" width="100%" height="540" loading="lazy"></iframe>'}
                    </Textarea>
                  </label>
                </>
              )}
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
              <Input
                name="returnTo"
                type="hidden"
                value={'/extensions/' + id}
              />
              <Button>このサイトで受付を開始</Button>
            </form>
          )}
          {p.recommendation && (
            <RecommendationSettings
              product={p.id}
              settings={p.recommendation}
            />
          )}
          {p.ready &&
            p.publicSettings &&
            publicSettingsFields(id, p.id, p.publicSettings)}
        </FormSection>
      ))}
      {contents}
      <FormSection title="使用する権限">
        <p>{permissions}</p>
      </FormSection>
    </Page>,
    frame,
  )
}
export type MetricFilter = {
  period: string
  product: string
  start: string
  end: string
}
const outcomes = ['resolutionMs', 'firstContactRate', 'operatorMs']
const counts = [
  'improvementRate',
  'selfResolutionRate',
  'resolved',
  'closed',
  'measured',
]
type MetricWindow = {
  from: number
  to: number
  values: Record<string, number | null>
}
export function metricsPage(
  frame: ConsoleFrame,
  filter: MetricFilter,
  result: Record<string, number | null>,
  history: MetricWindow[],
) {
  const previous = history.at(-2)?.values ?? {}
  const selected = frame.products.find((p) => p.id === filter.product)
  function compactChange(key: string) {
    if (result[key] == null || previous[key] == null) return '比較データなし'
    return difference(key, result[key], previous[key] ?? null)
  }
  function card(key: string) {
    return (
      <OutcomeCard
        id={key}
        title={fieldLabel(key)}
        value={metricValue(key, result[key])}
        series={history.map(({ from, to, values }) => ({
          from,
          to,
          value: values[key],
        }))}
        format={(value) => metricValue(key, value)}
        summary={
          key === 'operatorMs' && result[key] == null
            ? '会話を開き、返信して完了すると計測'
            : metricSummary[key]
        }
        details={
          metricDefinition[key] +
          ' ' +
          difference(key, result[key], previous[key] ?? null)
        }
        change={
          key === 'improvementRate'
            ? result.informed +
              '件 / ' +
              result.voices +
              '件・前期比 ' +
              compactChange(key)
            : key === 'selfResolutionRate'
              ? result.solvedSuggestions +
                '件 / ' +
                result.shownSuggestions +
                '件・前期比 ' +
                compactChange(key)
              : '前期比 ' + compactChange(key)
        }
      />
    )
  }
  function url(change: Partial<MetricFilter>) {
    const next = { ...filter, ...change }
    const query = new URLSearchParams({ period: next.period })
    if (next.product) query.set('product', next.product)
    if (next.period === 'custom') {
      query.set('start', next.start)
      query.set('end', next.end)
    }
    return '/metrics?' + query
  }
  const filters = (
    <FilterBar
      chips={
        <>
          {selected && (
            <ActionLink variant="ghost" href={url({ product: '' })}>
              プロダクト：
              <ProductMark product={selected} /> ×
            </ActionLink>
          )}
          {filter.period !== '30' && (
            <ActionLink variant="ghost" href={url({ period: '30' })}>
              期間：
              {filter.period === 'custom'
                ? filter.start + ' 〜 ' + filter.end
                : filter.period + '日'}{' '}
              ×
            </ActionLink>
          )}
        </>
      }
    >
      <form action="/metrics" method="get" data-live-filters="">
        {productSelect(frame, filter.product, true)}
        <Field label="期間">
          <NativeSelect name="period" aria-label="期間">
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
          </NativeSelect>
        </Field>
        {filter.period === 'custom' ? (
          <Popover id="metric-dates" variant="outline" label="日付の範囲">
            <Field label="開始日（日本時間）">
              <Input
                type="date"
                name="start"
                max={filter.end}
                value={filter.start}
                required
              />
            </Field>
            <Field label="終了日（日本時間）">
              <Input
                type="date"
                name="end"
                min={filter.start}
                value={filter.end}
                required
              />
            </Field>
          </Popover>
        ) : (
          <>
            <input type="hidden" name="start" value={filter.start} />
            <input type="hidden" name="end" value={filter.end} />
          </>
        )}
      </form>
    </FilterBar>
  )
  return shell(
    '対応状況の集計',
    <OverviewPage title="対応状況の集計" filters={filters}>
      <p>
        直前の同じ日数と比較しています。
        {(result.resolved ?? 0) < 5 &&
          '解決件数が5件未満のため、値は目安です。'}
      </p>
      <section aria-label="集計結果">
        <MetricGrid>{outcomes.map(card)}</MetricGrid>
      </section>
      <section aria-label="集計の内訳">
        <MetricGrid>{counts.map(card)}</MetricGrid>
      </section>
    </OverviewPage>,
    frame,
  )
}
