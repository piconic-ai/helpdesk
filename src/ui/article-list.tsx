import type { Child } from 'hono/jsx'

export function ArticleListRow({
  title,
  href,
  product,
  date,
  rating,
  status,
}: {
  title: string
  href: string
  product: string
  date: Child
  rating: string
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
      </a>
    </li>
  )
}
