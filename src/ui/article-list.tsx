import type { SuggestionCount } from '../core/suggestions/suggestion'
import type { Child } from 'hono/jsx'

export function ArticleListRow({
  title,
  href,
  product,
  date,
  rating,
  status,
  performance = { shown: 0, opened: 0, solved: 0 },
}: {
  title: string
  href: string
  product: Child
  date: Child
  rating: string
  performance?: SuggestionCount
  status: string
}) {
  return (
    <li data-ui="article-list-row">
      <a href={href}>
        <strong>{title}</strong>
        <span>{status}</span>
        <span>{product}</span>
        <span>{date}</span>
        <span>{rating}</span>
        <span data-ui="article-performance">
          <span>提示 {performance.shown}回</span>
          <span>閲覧 {performance.opened}回</span>
          <span>
            解決率{' '}
            {performance.shown
              ? Math.round((100 * performance.solved) / performance.shown) + '%'
              : '—'}
          </span>
          {performance.shown >= 3 && !performance.solved && (
            <b title="3回以上提示され、解決に至った記録がない記事です。">
              見直し候補
            </b>
          )}
        </span>
      </a>
    </li>
  )
}
