const percent = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 1 })
export function duration(ms: number) {
  const minutes = Math.abs(ms) / 60000
  if (minutes < 60) return Math.round(minutes) + '分'
  if (minutes < 1440) return percent.format(minutes / 60) + '時間'
  return percent.format(minutes / 1440) + '日'
}
export function metricValue(key: string, value: number | null) {
  if (value === null) return 'データなし'
  if (key.endsWith('Ms')) return duration(value)
  if (key.endsWith('Rate')) return percent.format(value * 100) + '%'
  return value.toLocaleString('ja-JP')
}
