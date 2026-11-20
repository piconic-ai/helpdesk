import type { ExtensionContext } from '../core/extensions/extension'
import { article, articleKey } from '../extensions/articles/article'
export type ArticleCandidate = {
  number: number
  product: string
  topic: string
  subject: string
  articleId: string | null
}
const sourceQuery = `SELECT c.number,c.product,c.subject,json_extract(d.value,'$.topic') AS topic,
  json_extract(a.value,'$.id') AS articleId
  FROM conversations c
  JOIN articles_data d ON d.key='candidate/'||c.number
  LEFT JOIN articles_data m ON m.key='candidate-article/'||c.number
  LEFT JOIN articles_data a ON a.key=json_extract(m.value,'$.key')`
import {
  scopeBinding,
  type ProductScope,
} from '../core/operators/project-targets-store'
export async function articleCandidates(
  db: D1Database,
  scope: ProductScope = null,
) {
  return (
    await db
      .prepare(
        sourceQuery +
          ' WHERE ?1 IS NULL OR c.product IN (SELECT value FROM json_each(?1)) ORDER BY c.number DESC',
      )
      .bind(scopeBinding(scope))
      .all<ArticleCandidate>()
  ).results
}
export async function candidateForEditor(
  db: D1Database,
  lookup: { number: number } | { product: string; id: string },
) {
  const candidate =
    'number' in lookup
      ? await db
          .prepare(sourceQuery + ' WHERE c.number=?')
          .bind(lookup.number)
          .first<ArticleCandidate>()
      : await db
          .prepare(sourceQuery + ' WHERE c.product=? AND a.key=?')
          .bind(lookup.product, articleKey(lookup.product, lookup.id))
          .first<ArticleCandidate>()
  if (!candidate) return null
  const excerpt = await db
    .prepare(
      "SELECT substr(body,1,1000) AS excerpt FROM messages WHERE number=? AND kind='inbound' AND body!='' ORDER BY created_at,id LIMIT 1",
    )
    .bind(candidate.number)
    .first<string>('excerpt')
  return { ...candidate, excerpt }
}
export type CandidateSource = NonNullable<
  Awaited<ReturnType<typeof candidateForEditor>>
>

export async function articleOrigin(
  db: D1Database,
  api: ExtensionContext,
  product: string,
  id?: string,
  number?: number,
) {
  if (number !== undefined) {
    if (id) return null
    const source = await candidateForEditor(db, { number })
    return source?.product === product
      ? { source, status: 'draft' as const, existingId: source.articleId }
      : null
  }
  if (!id) return { source: null, status: 'draft' as const, existingId: null }
  const previous = article.safeParse(await api.get(articleKey(product, id)))
  if (!previous.success) return null
  const source = await candidateForEditor(db, { product, id })
  return { source, status: previous.data.status, existingId: null }
}
