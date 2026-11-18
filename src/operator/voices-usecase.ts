import type { VoiceFilters } from './voice-filters'

const day = 86400000
function cohort(
  db: D1Database,
  q: VoiceFilters,
  sql: string,
  ...extra: number[]
) {
  const midnight = (date: string) => Date.parse(date + 'T00:00:00+09:00')
  return db
    .prepare(
      `WITH voices AS (
    SELECT c.number,c.product,p.name AS productName,c.subject,c.kind,c.created_at,
      strftime('%Y-%m',c.created_at/1000,'unixepoch','+9 hours') AS month
    FROM conversations c JOIN products p ON p.id=c.product
    WHERE c.status!='spam' AND (?1='' OR c.product=?1)
      AND (?2='' OR EXISTS (SELECT 1 FROM labels WHERE number=c.number AND name=?2))
      AND (?3='' OR NOT EXISTS (SELECT 1 FROM labels WHERE number=c.number))
      AND (?4 IS NULL OR c.created_at>=?4) AND (?5 IS NULL OR c.created_at<?5)
      AND (?6='' OR month=?6)
  ) ` + sql,
    )
    .bind(
      q.product,
      q.label,
      q.unlabeled,
      q.start ? midnight(q.start) : null,
      q.end ? midnight(q.end) + day : null,
      q.month,
      ...extra,
    )
}
type Bucket = {
  dimension: 'product' | 'label' | 'month'
  value: string | null
  title: string
  count: number
}
export async function voiceBuckets(db: D1Database, q: VoiceFilters) {
  const result = await cohort(
    db,
    q,
    `
    SELECT 'product' AS dimension,product AS value,productName AS title,COUNT(*) AS count FROM voices GROUP BY product
    UNION ALL
    SELECT 'label',labels.name,coalesce(labels.name,'ラベルなし'),COUNT(*) FROM voices LEFT JOIN labels USING(number) GROUP BY labels.name
    UNION ALL
    SELECT 'month',month,month,COUNT(*) FROM voices GROUP BY month
    ORDER BY dimension,count DESC,title
  `,
  ).all<Bucket>()
  return result.results
}

export async function voiceList(
  db: D1Database,
  q: VoiceFilters,
  requested: string | undefined,
) {
  const total = await cohort(
    db,
    q,
    'SELECT COUNT(*) AS n FROM voices',
  ).first<number>('n')
  const count = total ?? 0
  const pages = Math.max(1, Math.ceil(count / 20))
  const page = Math.max(
    1,
    Math.min(pages, /^\d+$/.test(requested ?? '') ? Number(requested) : 1),
  )
  const rows = await cohort(
    db,
    q,
    `
    SELECT number,subject,productName,kind,created_at AS at FROM voices
    ORDER BY created_at DESC,number DESC LIMIT 20 OFFSET ?7`,
    (page - 1) * 20,
  ).all<{
    number: number
    subject: string
    productName: string
    kind: string
    at: number
  }>()
  return { total: count, pages, page, rows: rows.results }
}
