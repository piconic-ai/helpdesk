export type TrendPoint = { from: number; to: number; value: number | null }
const dates = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})
function interval(point: TrendPoint) {
  const start = dates.format(point.from),
    end = dates.format(point.to - 1)
  return start === end ? start : start + '〜' + end
}
export function Sparkline({
  series,
  label,
  format,
}: {
  series: TrendPoint[]
  label: string
  format: (value: number) => string
}) {
  const values = series.flatMap((point) =>
    point.value === null ? [] : [point.value],
  )
  const max = Math.max(0, ...values)
  const caption =
    label +
    'の推移。' +
    (values.length
      ? series
          .map(
            (p) =>
              interval(p) +
              ' ' +
              (p.value === null ? '記録なし' : format(p.value)),
          )
          .join('、')
      : '対象期間に記録がありません。')
  const points = series.map(({ value }, i) =>
    value === null
      ? null
      : {
          x: 2 + (68 * i) / Math.max(1, series.length - 1),
          y: 18 - (max ? (value / max) * 15 : 0),
        },
  )
  const line = points
    .map((p, i) => (p ? (points[i - 1] ? 'L' : 'M') + p.x + ',' + p.y : ''))
    .join(' ')
  return (
    <svg
      className="trend"
      viewBox="0 0 72 22"
      width="72"
      height="22"
      role="img"
      aria-label={caption}
    >
      <title>{caption}</title>
      <path className="trend-baseline" d="M2 19H70" fill="none" />
      <path stroke="currentColor" stroke-width="1.5" fill="none" d={line} />
      {points.map(
        (p, i) =>
          p &&
          (!points[i - 1] || !points[i + 1]) && (
            <circle fill="currentColor" cx={p.x} cy={p.y} r="1.5" />
          ),
      )}
    </svg>
  )
}

export function CountBar({ count, max }: { count: number; max: number }) {
  return (
    <svg className="count-bar" aria-hidden="true">
      <rect width={(100 * count) / max + '%'} height="100%" />
    </svg>
  )
}
