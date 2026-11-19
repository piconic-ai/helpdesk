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
type Bin = {
  dimension: 'product' | 'label' | 'month'
  value: string | null
  title: string
  first: number
  last: number
  width: number
  bin: number
  count: number
}
const jst = 9 * 3600000
export async function voiceBuckets(db: D1Database, q: VoiceFilters) {
  // Keep at most seven points per row, even for a report spanning many years.
  const result = await cohort(
    db,
    q,
    `
    , dates AS (
      SELECT *, CAST((created_at+32400000)/86400000 AS INTEGER) AS received FROM voices
    ), bounds AS (
      SELECT coalesce(CAST((?4+32400000)/86400000 AS INTEGER),min(received)) AS start,
        coalesce(CAST((?5-1+32400000)/86400000 AS INTEGER),max(received)) AS end FROM dates
    ), dimensions AS (
      SELECT 'product' AS dimension,product AS value,productName AS title,received,start AS first,end AS last
        FROM dates CROSS JOIN bounds
      UNION ALL
      SELECT 'label',labels.name,coalesce(labels.name,'ラベルなし'),received,start,end
        FROM dates CROSS JOIN bounds LEFT JOIN labels USING(number)
      UNION ALL
      SELECT 'month',month,month,received,
        max(start,unixepoch(month||'-01')/86400),
        min(end,unixepoch(month||'-01','+1 month')/86400-1)
        FROM dates CROSS JOIN bounds
    ), bins AS (
      SELECT *,max(1,(last-first+7)/7) AS width FROM dimensions
    )
    SELECT dimension,value,title,first,last,width,(received-first)/width AS bin,count(*) AS count
      FROM bins GROUP BY dimension,value,bin
  `,
  ).all<Bin>()
  const groups = Map.groupBy(result.results, (r) =>
    JSON.stringify([r.dimension, r.value]),
  )
  return Array.from(groups.values(), (bins) => {
    const { dimension, value, title, first, last, width } = bins[0]
    const series = Array.from(
      { length: Math.ceil((last - first + 1) / width) },
      (_, i) => ({
        from: (first + i * width) * day - jst,
        to: Math.min(last + 1, first + (i + 1) * width) * day - jst,
        value: 0,
      }),
    )
    let count = 0
    for (const bin of bins) {
      series[bin.bin].value = bin.count
      count += bin.count
    }
    return { dimension, value, title, count, series }
  }).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, 'ja'))
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
    SELECT number,subject,product,productName,kind,created_at AS at FROM voices
    ORDER BY created_at DESC,number DESC LIMIT 20 OFFSET ?7`,
    (page - 1) * 20,
  ).all<{
    number: number
    subject: string
    productName: string
    product: string
    kind: string
    at: number
  }>()
  return { total: count, pages, page, rows: rows.results }
}
