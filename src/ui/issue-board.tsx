import { createElement } from 'hono/jsx'
import { glyph } from './glyph'
import { ProductMark } from './product-mark'
import { ContactAvatar } from './operator-identity'
import type { Child } from 'hono/jsx'
import { Stack, Cluster } from './layout'
import { stamp } from './console-shell'
import {
  ActionLink,
  Button,
  Field,
  Input,
  NativeSelect,
  Textarea,
} from './controls'
import { EmptyState, FormSection } from './patterns'

type IssueSummary = {
  title: string
  href: string
  productMarks: { id: string; name: string }[]
  count: number
}
export function IssueProducts({
  products,
  detail = false,
}: {
  products: IssueSummary['productMarks']
  detail?: boolean
}) {
  const shown = detail ? products : products.slice(0, 5)
  return (
    <span className="issue-products">
      {Array.from({ length: Math.ceil(shown.length / 5) }, (_, line) => (
        <span className="issue-products-line">
          {shown.slice(line * 5, line * 5 + 5).map((product) => (
            <ProductMark product={product} size={detail ? 'heading' : 'list'} />
          ))}
        </span>
      ))}
      {shown.length < products.length && (
        <small>ほか{products.length - shown.length}件</small>
      )}
    </span>
  )
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
        {glyph('issue_notify')} 知らせる待ち <small>{issues.length}件</small>
      </h2>
      <ul className="issue-pending" data-layout="stack" data-gap="md">
        {issues.map((issue) => (
          <li data-layout="cluster" data-gap="sm">
            <Stack className="issue-summary" gap="xs">
              <a href={issue.href}>{issue.title}</a>
              <IssueProducts products={issue.productMarks} />
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
          {glyph(closed ? 'issue_fixed' : 'issue_open')} {heading}{' '}
          <small>{total}件</small>
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
                <td data-label="プロダクト">
                  <IssueProducts products={r.productMarks} />
                </td>
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
        <EmptyState icon={closed ? 'issue_fixed' : 'issue_open'}>
          {heading}課題はありません。
        </EmptyState>
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
  product,
  days,
}: {
  before: ImpactPeriod
  after: ImpactPeriod
  product: { id: string; name: string }
  days: number
}) {
  return (
    <FormSection
      title={
        <>
          <ProductMark product={product} size="heading" />
          の修正前後（目安）
        </>
      }
    >
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
    email?: string | null
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
              <ContactAvatar name={v.name} email={v.email} />
              <span className="issue-voice-caption">
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

export function IssuePostFields({
  title,
  summary,
}: {
  title?: string
  summary?: string
}) {
  return (
    <>
      <Field label="タイトル">
        <Input name="title" value={title} required maxlength={200} />
      </Field>
      <Field
        label="公開する要約"
        description="氏名・メールアドレスなどの個人情報は含めないでください。"
      >
        <Textarea name="summary" required maxlength={2000} rows={3}>
          {summary}
        </Textarea>
      </Field>
    </>
  )
}

export function NewIssueForm({
  choices,
  action,
}: {
  choices: {
    number: number
    subject: string
    product: string
    productName: string
  }[]
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
        <NativeSelect name="number" required data-product-select="">
          <button type="button">{createElement('selectedcontent', {})}</button>
          <option value="" disabled>
            会話を選ぶ
          </option>
          {choices.map((c) => (
            <option value={c.number}>
              <span className="choice-reference">
                #{c.number}{' '}
                <ProductMark product={{ id: c.product, name: c.productName }} />
              </span>{' '}
              <span data-choice-subject="">{c.subject}</span>
            </option>
          ))}
        </NativeSelect>
      </Field>
      <IssuePostFields />
      <Button>起票内容を確認</Button>
    </form>
  )
}

export function IssueNoticeReview({
  notices,
  action,
}: {
  action: string
  notices: {
    number: number
    subject: string
    email: string
    reviewKey: string
    body: string
    canApprove: boolean
  }[]
}) {
  if (!notices.length) return null
  return (
    <form
      method="post"
      action={action}
      aria-label="知らせの下書きを承認"
      data-layout="stack"
      data-gap="md"
    >
      <h2>知らせの下書きを承認</h2>
      {notices.map((n) => (
        <fieldset className="settings-card" data-layout="stack" data-gap="sm">
          <legend>
            #{n.number} {n.subject}
          </legend>
          <label>
            <input
              type="checkbox"
              name="notice"
              value={n.reviewKey}
              disabled={!n.canApprove}
            />{' '}
            {n.email || '宛先未設定'}
          </label>
          <p className="notice-draft-body">{n.body}</p>
          <ActionLink href={'/conversation/' + n.number} variant="ghost">
            {n.canApprove ? '会話で文面を編集する' : '会話で状態を確認する'}
          </ActionLink>
        </fieldset>
      ))}
      {notices.some((n) => n.canApprove) && (
        <Button variant="default">選んだ下書きを承認して送信</Button>
      )}
    </form>
  )
}
