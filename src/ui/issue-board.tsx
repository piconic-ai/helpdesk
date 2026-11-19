import type { Child } from 'hono/jsx'
import { Stack, Cluster } from './layout'
import { stamp } from './console-shell'
import { Button, Field, Input, NativeSelect, Textarea } from './controls'
import { EmptyState, FormSection } from './patterns'

type IssueSummary = {
  title: string
  href: string
  productNames: string
  count: number
}
export function PendingIssues({
  issues,
}: {
  issues: (IssueSummary & { remaining: number; action: Child })[]
}) {
  if (!issues.length) return null
  return (
    <section
      className="issue-section"
      data-layout="stack"
      data-gap="sm"
      aria-labelledby="pending-issues"
    >
      <h2 id="pending-issues">
        知らせる待ち <small>{issues.length}件</small>
      </h2>
      <ul className="issue-pending" data-layout="stack" data-gap="md">
        {issues.map((issue) => (
          <li data-layout="cluster" data-gap="sm">
            <Stack className="issue-summary" gap="xs">
              <a href={issue.href}>{issue.title}</a>
              <span>{issue.productNames}</span>
              <p>
                {issue.count}件の声のうち{issue.remaining}
                件にまだ知らせていません。
              </p>
            </Stack>
            {issue.action}
          </li>
        ))}
      </ul>
    </section>
  )
}
export function IssueTable({
  closed,
  issues,
  now,
  total,
}: {
  closed: boolean
  issues: (IssueSummary & {
    awaitingSync: boolean
    informed: number
    after: number
    firstAt: number
  })[]
  now: number
  total: number
}) {
  const heading = closed ? '直した' : '開いている'
  const id = closed ? 'closed-issues' : 'open-issues'
  return (
    <section
      className="issue-section"
      data-layout="stack"
      data-gap="sm"
      aria-labelledby={id}
    >
      <Cluster className="issue-section-heading">
        <h2 id={id}>
          {heading} <small>{total}件</small>
        </h2>
        {!closed && issues.length > 0 && <small>声が多い順</small>}
      </Cluster>
      {issues.length ? (
        <table className="issue-table" aria-label={heading}>
          <thead>
            <tr>
              <th scope="col">課題</th>
              <th scope="col">プロダクト</th>
              <th scope="col">声</th>
              {closed ? (
                <>
                  <th scope="col">知らせた</th>
                  <th scope="col">直した後の声</th>
                </>
              ) : (
                <th scope="col">最初の声</th>
              )}
            </tr>
          </thead>
          <tbody>
            {issues.map((r) => (
              <tr>
                <th scope="row">
                  <a href={r.href}>{r.title}</a>
                  {r.awaitingSync && <small>状態を同期待ち</small>}
                </th>
                <td data-label="プロダクト">{r.productNames}</td>
                <td data-label="声">{r.count}件</td>
                {closed ? (
                  <>
                    <td data-label="知らせた">
                      {r.informed} / {r.count}
                    </td>
                    <td data-label="直した後の声">
                      {r.after}件 <small>（目安）</small>
                    </td>
                  </>
                ) : (
                  <td data-label="最初の声">{stamp(r.firstAt, now)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState>{heading}課題はありません。</EmptyState>
      )}
    </section>
  )
}
function Share({ value }: { value: ImpactPeriod }) {
  return (
    <small>
      {value.share === null
        ? '対象の声なし'
        : new Intl.NumberFormat('ja-JP', {
            style: 'percent',
            maximumFractionDigits: 1,
          }).format(value.share)}
      （{value.linked} / {value.total}件）
    </small>
  )
}
type ImpactPeriod = { total: number; linked: number; share: number | null }
export function IssueImpact({
  before,
  after,
  name,
  days,
}: {
  before: ImpactPeriod
  after: ImpactPeriod
  name: string
  days: number
}) {
  return (
    <FormSection title={name + 'の修正前後（目安）'}>
      <div className="issue-impact">
        <div>
          <span>直す前 30日</span>
          <strong>{before.linked}件</strong>
          <Share value={before} />
        </div>
        <div>
          <span>直した後 {days}日ぶん</span>
          <strong>{after.linked}件</strong>
          <Share value={after} />
        </div>
      </div>
      <small>
        割合はこのプロダクトに届いた声のうち、この課題に関連する声の割合です。
      </small>
    </FormSection>
  )
}
export function IssueVoices({
  voices,
}: {
  voices: {
    number: number
    name?: string
    subject?: string
    href: string
    delivery: string
  }[]
}) {
  return (
    <section
      className="issue-section"
      data-layout="stack"
      data-gap="sm"
      aria-labelledby="issue-voices"
    >
      <h2 id="issue-voices">
        紐づく声 <small>{voices.length}件</small>
      </h2>
      <ul className="issue-voices">
        {voices.map((v) => (
          <li>
            <a href={v.href}>
              <span className="issue-number">#{v.number}</span>
              <span>
                <strong>{v.name}</strong>
                <span>{v.subject}</span>
              </span>
              <small>{v.delivery}</small>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function NewIssueForm({
  choices,
  action,
}: {
  choices: { number: number; subject: string; productName: string }[]
  action: string
}) {
  return (
    <form
      className="issue-section"
      data-layout="stack"
      data-gap="sm"
      action={action}
      method="post"
    >
      <Field label="もとになる会話">
        <NativeSelect name="number" required>
          <option value="">会話を選ぶ</option>
          {choices.map((c) => (
            <option value={c.number}>
              #{c.number} {c.productName} · {c.subject}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="タイトル">
        <Input name="title" required maxlength={200} />
      </Field>
      <Field
        label="公開する要約"
        description="氏名・メールアドレスなどの個人情報は含めないでください。"
      >
        <Textarea name="summary" required maxlength={2000} rows={3} />
      </Field>
      <Button>起票内容を確認</Button>
    </form>
  )
}
