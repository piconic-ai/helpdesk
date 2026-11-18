const percent = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 1 })
export const metricDefinition: Record<string, string> = {
  resolutionMs:
    '受付から完了まで、または記事を開いてから解決するまでの平均時間。',
  firstContactRate:
    '完了した会話のうち、返信1回以内で再開や未解決の回答がなかった割合。',
  operatorMs:
    '計測できた完了会話で、運営者が閲覧してから返信を送信待ちにするまでの合計時間の平均。',
  resolved: '完了した会話と、記事で解決した件数の合計。',
  closed: '選択した期間に完了し、期間末に完了のままだった会話の数。',
  measured: '完了した会話のうち、閲覧から返信までの対応時間を計測できた件数。',
}
export function duration(ms: number) {
  const minutes = Math.abs(ms) / 60000
  if (minutes < 60) return Math.round(minutes) + '分'
  if (minutes < 1440) return percent.format(minutes / 60) + '時間'
  return percent.format(minutes / 1440) + '日'
}
export function metricValue(key: string, value: number | null) {
  if (value === null) return 'データなし'
  if (key.endsWith('Ms')) return duration(value)
  if (key === 'firstContactRate') return percent.format(value * 100) + '%'
  return value.toLocaleString('ja-JP')
}
export function difference(
  key: string,
  current: number | null,
  previous: number | null,
) {
  if (current === null || previous === null) return '比較データなし'
  const delta = current - previous
  if (!delta) return '変化なし'
  const magnitude =
    key === 'firstContactRate'
      ? percent.format(Math.abs(delta) * 100) + 'ポイント'
      : metricValue(key, Math.abs(delta))
  return (delta > 0 ? '+' : '−') + magnitude
}
