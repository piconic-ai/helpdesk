import { ProductMark } from '../ui/product-mark'
import { PageLinks } from '../ui/listing'
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
  const directory = paginateRows(products, page)
  const result = query ? matches : directory
  const title = 'ヘルプ'
  return publicDocument(
    { name: title, mailbox: null },
    {
      title,
      html: String(
        <ListPage
          title={query ? '記事の検索結果' : 'プロダクトから探す'}
          description={
            query
              ? '記事 ' + matches.total + '件'
              : 'プロダクト ' + directory.total + '件'
          }
          footer={<PageLinks path="/help/" query={{ q: query }} {...result} />}
          filters={
            search && (
              <PublicSearch label="すべてのヘルプ記事を検索" query={query} />
            )
          }
        >
          {query && matches.total === 0 && (
            <EmptyState icon="search">該当する記事はありません。</EmptyState>
          )}
          {query && matches.total > 0 && <PublicLinks items={matches.rows} />}
          {products.length ? (
            (query ? products : directory.rows).map((p) => (
              <FormSection title={<ProductMark product={p} size="heading" />}>
                <PublicLinks items={p.links} />
              </FormSection>
            ))
          ) : (
            <EmptyState icon="articles">
              ご利用のプロダクトの「お問い合わせ」または「ヘルプ」を開いてください。
            </EmptyState>
          )}
        </ListPage>,
      ),
    },
    { search },
  )
}
