import {
  presentation,
  reaction,
  previousInput,
  type PreviousSuggestion,
} from './suggestion'

export async function presentSuggestion(
  db: D1Database,
  input: unknown,
  now: number,
) {
  const p = presentation.parse(input)
  const stable = p.key ? JSON.stringify([p.number ?? null, p.key]) : null
  const id = await db
    .prepare(`INSERT INTO suggestion_presentations(id,product,surface,question,articles,highest_score,contact,number,stable_key,at)
    SELECT ?1,?2,?3,?4,?5,?6,coalesce((SELECT contact FROM conversations WHERE number=?8),?7),?8,?9,?10
    WHERE ?8 IS NULL OR EXISTS (SELECT 1 FROM conversations WHERE number=?8 AND product=?2 AND (?7 IS NULL OR contact=?7 COLLATE NOCASE))
    ON CONFLICT(product,surface,stable_key) DO UPDATE SET stable_key=excluded.stable_key RETURNING id`)
    .bind(
      crypto.randomUUID(),
      p.product,
      p.surface,
      p.question,
      JSON.stringify(p.articles),
      p.highestScore,
      p.contact ?? null,
      p.number ?? null,
      stable,
      now,
    )
    .first<string>('id')
  if (!id) throw new Error('Suggestion conversation is unavailable')
  return id
}

export async function reactToSuggestion(
  db: D1Database,
  input: unknown,
  now: number,
) {
  const parsed = reaction.safeParse(input)
  if (!parsed.success) return false
  const r = parsed.data
  if (['opened', 'resolved', 'attached'].includes(r.action) && !r.article)
    return false
  // A duplicate reaction succeeds without counting a second open or resolution.
  const row = await db
    .prepare(`INSERT INTO suggestion_reactions(presentation,action,article,at)
    SELECT p.id,?1,?2,?3 FROM suggestion_presentations p
    WHERE p.id=?4 AND p.product=?5 AND (?6 IS NULL OR p.surface=?6)
      AND (?7 IS NULL OR p.number=?7)
      AND (?2='' OR EXISTS(SELECT 1 FROM json_each(p.articles) a WHERE json_extract(a.value,'$.id')=?2))
      AND (?1!='attached' OR p.surface='composer')
      AND (p.surface!='composer' OR ?1 NOT IN ('resolved','unresolved') OR EXISTS(
        SELECT 1 FROM suggestion_reactions r WHERE r.presentation=p.id AND r.article=?2 AND r.action='opened'))
    ON CONFLICT(presentation,action,article) DO UPDATE SET at=suggestion_reactions.at RETURNING presentation`)
    .bind(
      r.action,
      r.article ?? '',
      now,
      r.presentation,
      r.product,
      r.surface ?? null,
      r.number ?? null,
    )
    .first<string>('presentation')
  return !!row
}

// Evaluate each reporting period as it stood at its end, so a later handoff
// cannot change the previous period's result.
import {
  scopeBinding,
  type ProductScope,
} from '../operators/project-targets-store'
export async function suggestionResolution(
  db: D1Database,
  product: string,
  from: number,
  to: number,
  scope: ProductScope = null,
) {
  const counts = await db
    .prepare(`SELECT count(*) AS shownSuggestions, count(*) FILTER(WHERE
    (SELECT r.action FROM suggestion_reactions r WHERE r.presentation=p.id AND r.action IN ('resolved','unresolved','inquiry') AND r.at<?3 ORDER BY r.at DESC,r.rowid DESC LIMIT 1)='resolved'
    AND NOT EXISTS(SELECT 1 FROM suggestion_reactions r WHERE r.presentation=p.id AND r.action='inquiry' AND r.at<?3)) AS solvedSuggestions
    FROM suggestion_presentations p WHERE p.surface IN ('chat','form') AND json_array_length(p.articles)>0
      AND (?1='' OR p.product=?1) AND p.at>=?2 AND p.at<?3 AND (?4 IS NULL OR p.product IN (SELECT value FROM json_each(?4)))`)
    .bind(product, from, to, scopeBinding(scope))
    .first<{ shownSuggestions: number; solvedSuggestions: number }>()
  const shownSuggestions = counts?.shownSuggestions ?? 0
  const solvedSuggestions = counts?.solvedSuggestions ?? 0
  return {
    shownSuggestions,
    solvedSuggestions,
    selfResolutionRate: shownSuggestions
      ? solvedSuggestions / shownSuggestions
      : null,
  }
}

export async function previousSuggestion(
  db: D1Database,
  input: unknown,
): Promise<PreviousSuggestion | null> {
  const scope = previousInput.parse(input)
  const row = await db
    .prepare(`SELECT id AS presentation,articles,highest_score AS highestScore FROM suggestion_presentations
    WHERE product=? AND surface=? AND number=? AND stable_key=?`)
    .bind(
      scope.product,
      scope.surface,
      scope.number,
      JSON.stringify([scope.number, scope.key]),
    )
    .first<{
      presentation: string
      articles: string
      highestScore: number | null
    }>()
  return (
    row && {
      ...row,
      articles: presentation.shape.articles.parse(JSON.parse(row.articles)),
    }
  )
}

// Append both statements to the batch that creates the conversation and inbound message.
export function inquirySuggestionStatements(
  db: D1Database,
  ids: string[],
  messageId: string,
  now: number,
) {
  const tokens = JSON.stringify(ids)
  return [
    db
      .prepare(`UPDATE suggestion_presentations AS p SET
      number=m.number, contact=c.contact
      FROM messages m JOIN conversations c ON c.number=m.number
      WHERE m.id=?1 AND c.product=p.product AND c.origin=p.surface AND p.number IS NULL
        AND (p.contact IS NULL OR p.contact=c.contact COLLATE NOCASE)
        AND p.id IN (SELECT value FROM json_each(?2))`)
      .bind(messageId, tokens),
    db
      .prepare(`INSERT OR IGNORE INTO suggestion_reactions(presentation,action,at)
      SELECT p.id,'inquiry',?1 FROM suggestion_presentations p JOIN messages m USING(number)
      WHERE m.id=?2 AND p.id IN (SELECT value FROM json_each(?3))`)
      .bind(now, messageId, tokens),
  ]
}
