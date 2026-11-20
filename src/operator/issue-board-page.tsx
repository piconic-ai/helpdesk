import { withProject } from '../core/settings/project-setting-links'
import { projectTerm } from '../core/settings/project-term'
import { displayReference } from '../core/conversations/ticket-reference'
import type { ConsoleFrame } from '../core/conversations/console-usecase'
import { shell } from '../core/conversations/console-page'
import { issueUrl } from '../extensions/issues/issues'
import { issueKey } from '../extensions/issues/outcomes'
import type { issueBoard } from '../extensions/issues/board-usecase'
import type { IssueNoticeDraft } from './issue-voices-store'
import { Stack } from '../ui/layout'
import {
  IssueImpact,
  IssueProducts,
  PendingIssues,
  IssueTable,
  IssueVoices,
  IssueNoticeReview,
  NewIssueForm,
} from '../ui/issue-board'
import {
  DetailPage,
  ListPage,
  EmptyState,
  Notice,
  FormSection,
} from '../ui/patterns'
import { paginateRows } from '../ui/pagination'
import { ListFilters, matchesSearch, PageLinks } from '../ui/listing'
import { ActionLink, Button } from '../ui/controls'

type Row = Awaited<ReturnType<typeof issueBoard>>[number]
type Contact = { name: string; subject: string; email: string | null }
const path = (row: Pick<Row, 'repository' | 'issue'>) =>
  '/issues/' + issueKey(row.repository, row.issue)
function issueCard(row: Row, names: Map<string, string>) {
  const { voices } = row
  const name = names.get(row.product) ?? row.product
  return {
    ...row,
    href: withProject(path(row), row.product),
    productMarks: [{ id: row.product, name }],
    productNames: name,
    count: voices.length,
    awaitingApproval: voices.filter(
      (v) =>
        !v.informed && v.kind === 'inquiry' && v.delivery === 'reply_drafted',
    ).length,
    needsDraft: voices.some(
      (v) =>
        !v.informed &&
        v.kind === 'inquiry' &&
        (!v.delivery || v.delivery === 'reply_discarded'),
    ),
    firstAt: voices.reduce(
      (first, voice) => Math.min(first, voice.createdAt),
      Infinity,
    ),
    after: row.impact?.after.linked ?? 0,
  }
}
type Issue = ReturnType<typeof issueCard>
const productNames = (frame: ConsoleFrame) =>
  new Map(frame.products.map((p) => [p.id, p.name]))

function DraftButton({ issue, primary }: { issue: Issue; primary: boolean }) {
  return (
    <form action="/issues/drafts" method="post">
      <input type="hidden" name="repository" value={issue.repository} />
      <input type="hidden" name="issue" value={issue.issue} />
      <input type="hidden" name="product" value={issue.product} />
      <Button variant={primary ? 'default' : 'outline'}>下書きを作る</Button>
    </form>
  )
}

function PendingAction({ issue, primary }: { issue: Issue; primary: boolean }) {
  if (!issue.awaitingApproval && issue.needsDraft)
    return <DraftButton issue={issue} primary={primary} />
  return (
    <ActionLink href={issue.href} variant={primary ? 'default' : 'outline'}>
      {issue.awaitingApproval
        ? '承認待ち ' + issue.awaitingApproval + '件を確認する'
        : '配送状況を確認する'}
    </ActionLink>
  )
}

export function issueBoardPage(
  frame: ConsoleFrame,
  rows: Row[],
  query: Record<string, string>,
) {
  const names = productNames(frame)
  const all = rows
    .filter((r) => !query.product || r.product === query.product)
    .map((row) => issueCard(row, names))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, 'ja'))
  const showFilters = all.length > 20
  const issues = showFilters
    ? all.filter(
        (r) =>
          matchesSearch(r.title + ' ' + r.productNames, query.q) &&
          (!query.filter || r.state === query.filter),
      )
    : all
  const closed = issues
    .filter((r) => r.state === 'closed')
    .sort((a, b) => (b.closedAt ?? 0) - (a.closedAt ?? 0))
  const openPage = paginateRows(
    issues.filter((r) => r.state !== 'closed'),
    query.page,
  )
  const closedPage = paginateRows(closed, query.page)
  const page = openPage.pages >= closedPage.pages ? openPage : closedPage
  const tableRow = (issue: Issue) => ({
    ...issue,
    href: issue.href,
    awaitingSync: issue.state === 'unknown',
  })
  return shell(
    '課題',
    <ListPage
      title="課題"
      description={
        frame.demoGithub
          ? 'デモ用の模擬 GitHub で起票と通知を試せます。'
          : '声をもとに直すことを決め、直したら声の主に知らせます。'
      }
      action={
        <ActionLink href={withProject('/issues/new', query.product)}>
          課題を追加
        </ActionLink>
      }
      footer={<PageLinks path="/issues" query={query} {...page} />}
      filters={
        <ListFilters
          title="課題"
          projects={frame.products}
          searchable={showFilters}
          path="/issues"
          query={query}
          sortable={false}
          filterLabel="状態"
          options={
            showFilters
              ? [
                  { value: 'open', label: '開いている' },
                  { value: 'closed', label: '直した' },
                ]
              : undefined
          }
        />
      }
    >
      <Stack gap="lg">
        <PendingIssues
          issues={closed
            .filter((r) => r.remaining > 0)
            .map((issue, index) => ({
              ...issue,
              href: issue.href,
              action: <PendingAction issue={issue} primary={index === 0} />,
            }))}
        />
        <IssueTable
          issues={openPage.rows.map(tableRow)}
          now={frame.now}
          total={openPage.total}
          closed={false}
        />
        <IssueTable
          issues={closedPage.rows.map(tableRow)}
          now={frame.now}
          total={closedPage.total}
          closed
        />
      </Stack>
    </ListPage>,
    frame,
  )
}
const labels: Record<string, string> = {
  reply_drafted: '承認待ち',
  reply_queued: '送信待ち',
  reply_failed: '送信失敗',
  reply_discarded: '下書きを破棄',
}
function delivery(v: Row['voices'][number]) {
  if (v.informed) return '知らせた'
  if (v.kind === 'feedback') return '返信不要'
  if (v.status === 'closed' && v.delivery === 'reply_drafted')
    return '再開して承認'
  return labels[v.delivery ?? ''] ?? '未通知'
}
export function issueDetailPage(
  frame: ConsoleFrame,
  rows: Row[],
  contacts: Map<number, Contact>,
  drafts?: string,
  notices: IssueNoticeDraft[] = [],
) {
  const names = productNames(frame)
  const issue = issueCard(rows[0], names)
  return shell(
    issue.title,
    <DetailPage
      title={issue.title}
      back={{
        href: withProject('/issues', frame.query.product),
        label: '課題の一覧に戻る',
      }}
      description={
        <>
          {frame.demoGithub && 'デモ用の模擬 GitHub · '}
          <IssueProducts products={issue.productMarks} detail /> ·{' '}
          {
            { closed: '直した', open: '開いている', unknown: '状態を同期待ち' }[
              issue.state
            ]
          }
        </>
      }
      action={
        frame.demoGithub ? (
          issue.state === 'open' && (
            <form
              method="post"
              action={withProject(path(issue) + '/demo-close', issue.product)}
            >
              <Button>課題を閉じる（デモ用）</Button>
            </form>
          )
        ) : (
          <ActionLink href={issueUrl(issue.repository, issue.issue)}>
            GitHub で開く
          </ActionLink>
        )
      }
    >
      <Stack gap="lg">
        {drafts === 'ready' && (
          <Notice toast kind="success">
            知らせの下書きを用意しました。下の会話を開いて内容を確認し、承認して送信してください。
          </Notice>
        )}
        {drafts === 'unchanged' && (
          <Notice kind="info">
            新しい下書きの対象はありません。下の会話で配送状況を確認できます。
          </Notice>
        )}
        {issue.state === 'closed' && issue.needsDraft && (
          <DraftButton issue={issue} primary={!issue.awaitingApproval} />
        )}
        {drafts === 'select' && (
          <Notice kind="info">承認する宛先を選んでください。</Notice>
        )}
        {drafts === 'approved' && (
          <Notice toast kind="success">
            選んだ下書きを承認しました。
          </Notice>
        )}
        {drafts === 'changed' && (
          <Notice kind="info">
            下書きの状態が変わりました。宛先と文面をもう一度確認してください。
          </Notice>
        )}
        <IssueNoticeReview
          notices={notices.map((n) => ({
            ...n,
            reference: displayReference(frame, n),
          }))}
          action={withProject(path(issue) + '/approve', issue.product)}
        />
        <IssueVoices
          voices={rows.flatMap((r) =>
            r.voices.map((v) => ({
              number: v.number,
              href: '/conversation/' + v.number,
              reference: displayReference(frame, {
                product: r.product,
                number: v.number,
              }),
              ...contacts.get(v.number),
              delivery: delivery(v),
            })),
          )}
        />
        {rows.map(
          (r) =>
            r.impact &&
            r.closedAt !== null && (
              <IssueImpact
                product={{
                  id: r.product,
                  name: names.get(r.product) ?? r.product,
                }}
                before={r.impact.before}
                after={r.impact.after}
                days={Math.max(
                  1,
                  Math.min(30, Math.ceil((frame.now - r.closedAt) / 86400000)),
                )}
              />
            ),
        )}
      </Stack>
    </DetailPage>,
    frame,
  )
}
export function issueNewPage(
  frame: ConsoleFrame,
  choices: {
    number: number
    subject: string
    product: string
    productName: string
  }[],
) {
  return shell(
    '課題を追加',
    <DetailPage
      title="課題を追加"
      back={{
        href: withProject('/issues', frame.query.product),
        label: '課題の一覧に戻る',
      }}
    >
      {frame.demoGithub && <p>デモ用の模擬 GitHub に起票します。</p>}
      <FormSection title="起票する内容">
        {choices.length ? (
          <NewIssueForm
            action="/actions/issues.preview"
            choices={choices.map((c) => ({
              ...c,
              reference: displayReference(frame, c),
            }))}
          />
        ) : (
          <EmptyState icon="issues">
            起票できる会話はありません。起票先とトークンを設定した{projectTerm}
            の会話から追加できます。
          </EmptyState>
        )}
      </FormSection>
    </DetailPage>,
    frame,
  )
}
