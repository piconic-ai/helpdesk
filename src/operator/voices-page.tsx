import { ProductMark, ProductSelect } from '../ui/product-mark'
import { LabelDot } from '../ui/inbox-parts'
import { CountBar, Sparkline } from '../ui/trends'
import type { ConsoleFrame } from '../core/conversations/console-usecase'
import { shell } from '../core/conversations/console-page'
import { ActionLink, Button, Field, Input } from '../ui/controls'
import {
  ListPage,
  OverviewPage,
  FormSection,
  FilterBar,
  EmptyState,
  RowList,
  ListRow,
  ActionBar,
} from '../ui/patterns'
import type { voiceBuckets, voiceList } from './voices-usecase'
import { type VoiceFilters, voicePath } from './voice-filters'

const summary = '/voices'
const details = '/voices/conversations'
type Buckets = Awaited<ReturnType<typeof voiceBuckets>>
type Results = Awaited<ReturnType<typeof voiceList>>

function VoiceFilterBar({
  frame,
  q,
}: {
  frame: ConsoleFrame
  q: VoiceFilters
}) {
  return (
    <FilterBar>
      <form action={summary} method="get">
        <Field label="プロダクト">
          <ProductSelect
            products={frame.products}
            selected={q.product}
            empty="すべてのプロダクト"
          />
        </Field>
        <Field label="開始日">
          <Input
            type="date"
            name="start"
            value={q.start}
            max={q.end || undefined}
          />
        </Field>
        <Field label="終了日">
          <Input
            type="date"
            name="end"
            value={q.end}
            min={q.start || undefined}
          />
        </Field>
        <Button>集計する</Button>
      </form>
    </FilterBar>
  )
}
const titles = { label: 'ラベル別', product: 'プロダクト別', month: '受付月別' }
export function voicesOverview(
  frame: ConsoleFrame,
  q: VoiceFilters,
  rows: Buckets,
) {
  const total = rows
    .filter((r) => r.dimension === 'product')
    .reduce((sum, r) => sum + r.count, 0)
  return shell(
    '声の集計',
    <OverviewPage
      title="声の集計"
      description={
        '問い合わせとフィードバック ' + total + '件 · 迷惑メールを除く'
      }
      filters={<VoiceFilterBar frame={frame} q={q} />}
      action={
        <ActionLink href={voicePath(details, q)}>該当する声を見る</ActionLink>
      }
    >
      {total ? (
        <section aria-label="声の内訳">
          {(['label', 'product', 'month'] as const).map((dimension) => {
            const buckets = rows.filter((r) => r.dimension === dimension)
            const max = buckets.reduce(
              (highest, r) => Math.max(highest, r.count),
              0,
            )
            if (dimension === 'month')
              buckets.sort((a, b) => b.title.localeCompare(a.title))
            return (
              <FormSection title={titles[dimension]}>
                <RowList>
                  {buckets.map((r) => {
                    const filter =
                      r.value === null
                        ? { label: '', unlabeled: '1' as const }
                        : { [dimension]: r.value }
                    return (
                      <ListRow
                        title={
                          r.dimension === 'product' && r.value ? (
                            <ProductMark
                              product={{ id: r.value, name: r.title }}
                            />
                          ) : (
                            <>
                              {r.dimension === 'label' && r.value && (
                                <LabelDot
                                  label={r.value}
                                  colors={frame.labelColors}
                                />
                              )}{' '}
                              {r.title}
                            </>
                          )
                        }
                        status={
                          <>
                            <Sparkline
                              label={r.title + 'の件数'}
                              series={r.series}
                              format={(value) => value + '件'}
                            />{' '}
                            {r.count}件
                          </>
                        }
                        backdrop={
                          dimension !== 'month' && (
                            <CountBar count={r.count} max={max} />
                          )
                        }
                        href={voicePath(details, { ...q, ...filter })}
                      />
                    )
                  })}
                </RowList>
              </FormSection>
            )
          })}
        </section>
      ) : (
        <EmptyState icon="voices">この条件で届いた声はありません。</EmptyState>
      )}
    </OverviewPage>,
    frame,
  )
}
export function voicesResults(
  frame: ConsoleFrame,
  q: VoiceFilters,
  result: Results,
) {
  const product = frame.products.find((p) => p.id === q.product)
  const conditions = [
    q.unlabeled ? 'ラベルなし' : q.label,
    q.month,
    q.start && q.start + '以降',
    q.end && q.end + 'まで',
  ]
    .filter(Boolean)
    .join(' · ')
  return shell(
    '該当する声',
    <ListPage
      title="該当する声"
      description={
        <>
          {product && (
            <>
              <ProductMark product={product} /> ·{' '}
            </>
          )}
          {[conditions, result.total + '件'].filter(Boolean).join(' · ')}
        </>
      }
      back={{
        href: voicePath(summary, {
          product: q.product,
          start: q.start,
          end: q.end,
        }),
        label: '声の集計に戻る',
      }}
      footer={
        result.pages > 1 && (
          <ActionBar>
            {result.page > 1 && (
              <ActionLink href={voicePath(details, q, result.page - 1)}>
                前のページ
              </ActionLink>
            )}
            {result.page} / {result.pages}
            {result.page < result.pages && (
              <ActionLink href={voicePath(details, q, result.page + 1)}>
                次のページ
              </ActionLink>
            )}
          </ActionBar>
        )
      }
    >
      {result.rows.length ? (
        <RowList>
          {result.rows.map((row) => (
            <ListRow
              title={'#' + row.number + ' ' + row.subject}
              href={'/conversation/' + row.number}
              description={
                <>
                  <ProductMark
                    product={{ id: row.product, name: row.productName }}
                  />{' '}
                  ·{' '}
                  {new Intl.DateTimeFormat('ja-JP', {
                    timeZone: 'Asia/Tokyo',
                  }).format(row.at)}
                </>
              }
              status={row.kind === 'feedback' ? 'フィードバック' : '問い合わせ'}
            />
          ))}
        </RowList>
      ) : (
        <EmptyState icon="voices">この条件で届いた声はありません。</EmptyState>
      )}
    </ListPage>,
    frame,
  )
}
