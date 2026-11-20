import { projectTerm } from '../core/settings/project-term'
import type { ConsoleFrame } from '../core/conversations/console-usecase'
import { shell } from '../core/conversations/console-page'
import type { MissingArticle } from '../core/suggestions/suggestion'
import {
  ListPage,
  RowList,
  ListRow,
  EmptyState,
  FilterBar,
} from '../ui/patterns'
import { ProductMark, ProductSelect } from '../ui/product-mark'
import { ActionLink } from '../ui/controls'
import { Cluster } from '../ui/layout'

export function missingArticlesPage(
  frame: ConsoleFrame,
  product: string,
  list: { total: number; page: number; pages: number; rows: MissingArticle[] },
) {
  function pageLink(page: number) {
    const q = new URLSearchParams()
    if (product) q.set('product', product)
    if (page > 1) q.set('page', String(page))
    return '/articles/questions' + (q.size ? '?' + q : '')
  }
  return shell(
    '記事が無かった質問',
    <ListPage
      title="記事が無かった質問"
      description={list.total + '件'}
      back={{ href: '/articles', label: '記事一覧に戻る' }}
      filters={
        <FilterBar>
          <form action="/articles/questions" method="get" data-live-filters="">
            <label>
              {projectTerm}
              <ProductSelect
                products={frame.products}
                selected={product}
                empty={`すべての${projectTerm}`}
              />
            </label>
          </form>
        </FilterBar>
      }
      footer={
        list.pages > 1 && (
          <Cluster aria-label="ページ送り">
            {list.page > 1 && (
              <ActionLink href={pageLink(list.page - 1)}>前のページ</ActionLink>
            )}
            <span>
              {list.page} / {list.pages}
            </span>
            {list.page < list.pages && (
              <ActionLink href={pageLink(list.page + 1)}>次のページ</ActionLink>
            )}
          </Cluster>
        )
      }
    >
      {list.rows.length ? (
        <RowList>
          {list.rows.map((row) => (
            <ListRow
              title={row.question}
              description={
                <ProductMark
                  product={
                    frame.products.find((p) => p.id === row.product) ?? {
                      id: row.product,
                      name: row.product,
                    }
                  }
                />
              }
              action={
                <ActionLink
                  href={'/articles/new?question=' + row.id}
                  aria-label={'この質問から記事を書く：' + row.question}
                >
                  記事を書く
                </ActionLink>
              }
            />
          ))}
        </RowList>
      ) : (
        <EmptyState icon="search">
          記事を提案できなかった質問はまだありません。
        </EmptyState>
      )}
    </ListPage>,
    frame,
  )
}
