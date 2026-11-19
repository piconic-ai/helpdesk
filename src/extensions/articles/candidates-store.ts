import { z } from 'zod'
import type { CandidateSummary } from '../../core/extensions/article-judgment'

const candidate = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
})
const columns = 'd.slug AS id,d.title,substr(d.summary,1,200) AS summary'
const join =
  'article_search_keys k JOIN published_help_documents d ON d.key=k.key'
function searchExpression(text: string) {
  const grams = new Set<string>()
  for (const term of text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) {
    const chars = Array.from(term)
    for (let i = 0; i < chars.length - 2 && grams.size < 128; i++)
      grams.add(chars.slice(i, i + 3).join(''))
    if (grams.size === 128) break
  }
  return [...grams].map((gram) => '"' + gram + '"').join(' OR ')
}

export async function selectArticleCandidates(
  db: D1Database,
  product: string,
  text: string,
): Promise<CandidateSummary[]> {
  const available = await db
    .prepare(
      `SELECT ${columns} FROM ${join} WHERE k.product=? ORDER BY k.key LIMIT 21`,
    )
    .bind(product)
    .all()
  if (available.results.length <= 20)
    return candidate.array().parse(available.results)
  const query = searchExpression(text)
  if (!query) {
    // FTS5 trigrams cannot index a one- or two-character Japanese search.
    const term = text.trim().toLowerCase()
    if (!/^[\p{L}\p{N}]{1,2}$/u.test(term)) return []
    const short = await db
      .prepare(`SELECT ${columns} FROM ${join} WHERE k.product=?1 AND
      (instr(lower(d.title),?2) OR instr(lower(d.summary),?2) OR instr(lower(d.body),?2))
      ORDER BY (instr(lower(d.title),?2)>0) DESC,(instr(lower(d.summary),?2)>0) DESC,k.key LIMIT 20`)
      .bind(product, term)
      .all()
    return candidate.array().parse(short.results)
  }
  const matches = await db
    .prepare(`SELECT ${columns} FROM article_search
    JOIN article_search_keys k ON k.id=article_search.rowid
    JOIN published_help_documents d ON d.key=k.key
    WHERE article_search MATCH ? AND k.product=?
    ORDER BY bm25(article_search,6,3,1),k.key LIMIT 20`)
    .bind(query, product)
    .all()
  return candidate.array().parse(matches.results)
}
