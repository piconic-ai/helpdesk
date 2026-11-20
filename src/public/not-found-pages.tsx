import { projectTerm } from '../core/settings/project-term'
import { ProductMark } from '../ui/product-mark'
import { matchesSearch, PageLinks } from '../ui/listing'
import { paginateRows } from '../ui/pagination'
import { ActionLink } from '../ui/controls'
import {
  ActionBar,
  DetailPage,
  ListPage,
  EmptyState,
  FormSection,
} from '../ui/patterns'
import { PublicLinks, PublicSearch } from '../ui/public-forms'
import { publicDocument } from './layout-pages'

export function missingPublicPage(
  product: { name: string; mailbox: string | null },
  back: string,
) {
  const title = 'ページが見つかりません'
  return publicDocument(product, {
    title,
    html: String(
      <DetailPage title={title}>
        <p>アドレスを確認するか、ヘルプからお探しください。</p>
        <ActionBar>
          <ActionLink href={back}>ヘルプに戻る</ActionLink>
        </ActionBar>
      </DetailPage>,
    ),
  })
}

type Destination = { label: string; path: string }
export function helpLanding(
  products: {
    id: string
    name: string
    links: Destination[]
    matches: Destination[]
  }[],
  query: string,
  page?: string,
  filter = '',
) {
  const search = products.some((p) =>
    p.links.some((link) => link.path.startsWith('/help/articles/')),
  )
  const matches = paginateRows(
    products.flatMap((product) =>
      product.matches.map((item) => ({
        ...item,
        description: <ProductMark product={product} />,
      })),
    ),
    page,
  )
  const directory = paginateRows(
    products.filter((p) => matchesSearch(p.name, filter)),
    page,
  )
  const result = query ? matches : directory
  const title = 'ヘルプ'
  return publicDocument(
    { name: title, mailbox: null },
    {
      title,
      html: String(
        <ListPage
          title={query ? '記事の検索結果' : `${projectTerm}から探す`}
          description={
            query
              ? '記事 ' + matches.total + '件'
              : `${projectTerm} ` + directory.total + '件'
          }
          footer={
            <PageLinks path="/help/" query={{ q: query, filter }} {...result} />
          }
          filters={
            <>
              {search && (
                <PublicSearch label="すべてのヘルプ記事を検索" query={query} />
              )}
              {products.length > 8 && (
                <PublicSearch
                  name="filter"
                  label={`${projectTerm}名で検索`}
                  query={filter}
                />
              )}
            </>
          }
        >
          {query && matches.total === 0 && (
            <EmptyState icon="search">該当する記事はありません。</EmptyState>
          )}
          {query && matches.total > 0 && <PublicLinks items={matches.rows} />}
          {directory.total ? (
            (query ? products : directory.rows).map((p) => (
              <FormSection title={<ProductMark product={p} size="heading" />}>
                <PublicLinks items={p.links} />
              </FormSection>
            ))
          ) : (
            <EmptyState icon="articles">
              {filter
                ? `該当する${projectTerm}はありません。`
                : `ご利用の${projectTerm}の「お問い合わせ」または「ヘルプ」を開いてください。`}
            </EmptyState>
          )}
        </ListPage>,
      ),
    },
    { search: search || products.length > 8 },
  )
}
