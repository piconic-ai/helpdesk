import type {
  SuggestionCount,
  MissingArticle,
} from '../core/suggestions/suggestion'

export async function articlePerformance(db: D1Database) {
  return (
    await db
      .prepare(`SELECT product,article,count(*) AS shown,sum(opened) AS opened,sum(solved) AS solved FROM (
    SELECT p.product,json_extract(a.value,'$.id') AS article,
      EXISTS (SELECT 1 FROM suggestion_reactions r WHERE r.presentation=p.id AND r.action='opened' AND r.article=json_extract(a.value,'$.id')) AS opened,
      coalesce((SELECT r.action='resolved' AND r.article=json_extract(a.value,'$.id') FROM suggestion_reactions r WHERE r.presentation=p.id AND r.action IN ('resolved','unresolved','inquiry') ORDER BY r.at DESC,r.rowid DESC LIMIT 1),0)
        AND NOT EXISTS(SELECT 1 FROM suggestion_reactions r WHERE r.presentation=p.id AND r.action='inquiry') AS solved
      FROM suggestion_presentations p, json_each(p.articles) a)
    GROUP BY product,article`)
      .all<SuggestionCount & { product: string; article: string }>()
  ).results
}

export async function missingArticleQuestions(
  db: D1Database,
  product: string,
  page: number,
) {
  const predicate = `FROM suggestion_presentations WHERE json_array_length(articles)=0 AND (?1='' OR product=?1)`
  const total =
    (await db
      .prepare(`SELECT count(*) AS n ${predicate}`)
      .bind(product)
      .first<number>('n')) ?? 0
  const pages = Math.max(1, Math.ceil(total / 20))
  const current = Math.min(page, pages)
  const rows = await db
    .prepare(
      `SELECT id,product,question,at ${predicate} ORDER BY at DESC,id LIMIT 20 OFFSET ?2`,
    )
    .bind(product, (current - 1) * 20)
    .all<MissingArticle>()
  return { rows: rows.results, total, page: current, pages }
}

export function missingQuestion(db: D1Database, id: string) {
  return db
    .prepare(
      'SELECT product,question FROM suggestion_presentations WHERE id=? AND json_array_length(articles)=0',
    )
    .bind(id)
    .first<{ product: string; question: string }>()
}
