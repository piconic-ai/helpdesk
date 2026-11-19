const percent = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 1 })
export const metricDefinition: Record<string, string> = {
  selfResolutionRate:
    '期間内にチャットまたは問い合わせフォームで記事を示した回数のうち、期間末までに利用者が「解決した」を選び、問い合わせに進まなかった割合。',
  improvementRate:
    '期間中に受け付けた声のうち、課題の修正後、期間末までに承認済みの知らせを送信できた会話の割合。問い合わせとフィードバックを各1件と数え、迷惑メールは除きます。',
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
  if (key.endsWith('Rate')) return percent.format(value * 100) + '%'
  return value.toLocaleString('ja-JP')
}
export function difference(
  key: string,
  current: number | null,
  previous: number | null,
) {
  if (current === null && previous === null)
    return '両期間にこの指標の対象データがありません。'
  if (current === null)
    return '選択した期間にこの指標の対象データがありません。'
  if (previous === null)
    return '直前の同じ期間にこの指標の対象データがありません。'
  const delta = current - previous
  if (!delta) return '変化なし'
  const magnitude = key.endsWith('Rate')
    ? percent.format(Math.abs(delta) * 100) + 'ポイント'
    : metricValue(key, Math.abs(delta))
  return (delta > 0 ? '+' : '−') + magnitude
}

export const metricSummary: Record<string, string> = {
  selfResolutionRate: '記事で解決した提示の割合',
  resolutionMs: '受付から解決まで',
  firstContactRate: '再開せずに一度で解決',
  operatorMs: '閲覧から返信まで',
  improvementRate: '修正後に知らせが届いた声',
  resolved: '会話と記事での解決',
  closed: '期間中に完了した会話',
  measured: '作業時間を計測した会話',
}
