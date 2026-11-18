import type { ConsoleFrame } from '../core/conversations/console-usecase'
import { shell } from '../core/conversations/console-page'
import { issueUrl } from '../extensions/issues/issues'
import { issueKey } from '../extensions/issues/outcomes'
import type { issueBoard } from '../extensions/issues/board-usecase'
import {
  ListPage,
  FormSection,
  EmptyState,
  Notice,
  ActionBar,
} from '../ui/patterns'
import { ListFilters, listRows, PageLinks } from '../ui/listing'
import { ActionLink, Button } from '../ui/controls'

type Row = Awaited<ReturnType<typeof issueBoard>>[number]
const states: Record<string, string> = {
  open: '開いている',
  closed: '閉じた',
  unknown: '状態を同期待ち',
}
function ratio(value: { total: number; linked: number; share: number | null }) {
  const share =
    value.share === null
      ? '対象の声なし'
      : new Intl.NumberFormat('ja-JP', {
          style: 'percent',
          maximumFractionDigits: 1,
        }).format(value.share)
  return share + '（' + value.linked + ' / ' + value.total + '件）'
}
const deliveryLabels: Record<string, string> = {
  reply_drafted: '承認待ち',
  reply_queued: '送信待ち',
  reply_failed: '送信失敗',
  reply_sent: '送信済み',
  reply_discarded: '下書きを破棄',
}
function productDetails(row: Row, product: string, showRepository: boolean) {
  return (
    <>
      <p>
        {product} · {states[row.state]} · 紐づく声 {row.voices.length}件 ·
        知らせた声 {row.informed}件
      </p>
      <ActionBar>
        {showRepository && (
          <ActionLink href={issueUrl(row.repository, row.issue)}>
            {row.repository} #{row.issue}
          </ActionLink>
        )}
        {row.voices.map((v) => (
          <ActionLink variant="ghost" href={'/conversation/' + v.number}>
            会話 #{v.number}
            {v.delivery ? ' · ' + (deliveryLabels[v.delivery] ?? '未送信') : ''}
            {v.status === 'closed' && v.delivery === 'reply_drafted'
              ? '（再開して承認）'
              : ''}
          </ActionLink>
        ))}
      </ActionBar>
      {row.impact && (
        <>
          <p>プロダクトの声に占める割合（目安）</p>
          <p>
            修正前30日 {ratio(row.impact.before)} ／ 修正後30日{' '}
            {ratio(row.impact.after)}
          </p>
          <small>
            修正後は今日までを集計します。件数が少ない間は割合が大きく変動します。
          </small>
          {row.remaining > 0 && (
            <form action="/issues/drafts" method="post">
              <input type="hidden" name="product" value={row.product} />
              <input type="hidden" name="repository" value={row.repository} />
              <input type="hidden" name="issue" value={row.issue} />
              <Button>知らせる下書きを作る</Button>
            </form>
          )}
        </>
      )}
    </>
  )
}

function entry(products: Row[], names: Map<string, string>) {
  const [first] = products
  const total = products.reduce((n, p) => n + p.voices.length, 0)
  const informed = products.reduce((n, p) => n + p.informed, 0)
  return (
    <FormSection title={first.title}>
      {products.length > 1 && (
        <>
          <p>
            {states[first.state]} · 紐づく声 {total}件 · 知らせた声 {informed}件
          </p>
          <ActionLink href={issueUrl(first.repository, first.issue)}>
            {first.repository} #{first.issue}
          </ActionLink>
        </>
      )}
      {products.map((p) =>
        productDetails(
          p,
          names.get(p.product) ?? p.product,
          products.length === 1,
        ),
      )}
    </FormSection>
  )
}

export function issueBoardPage(
  frame: ConsoleFrame,
  rows: Row[],
  query: Record<string, string>,
) {
  const names = new Map(frame.products.map((p) => [p.id, p.name]))
  const issues = Map.groupBy(rows, (r) => issueKey(r.repository, r.issue))
  const list = listRows([...issues.values()], query, (group) => ({
    text: [
      group[0].title,
      group[0].repository,
      ...group.map((r) => names.get(r.product)),
    ].join(' '),
    filter: group[0].state,
  }))
  return shell(
    '課題',
    <ListPage
      title="課題"
      description={list.total + '件'}
      filters={
        <ListFilters
          title="課題"
          path="/issues"
          query={query}
          options={[
            { value: 'open', label: states.open },
            { value: 'closed', label: states.closed },
          ]}
          filterLabel="状態"
        />
      }
      footer={<PageLinks path="/issues" query={query} {...list} />}
    >
      {query.drafts === 'unchanged' && (
        <Notice kind="info">
          新しい下書きの対象はありません。各会話で配送状況を確認できます。
        </Notice>
      )}
      {query.drafts === 'ready' && (
        <Notice kind="success">
          知らせの下書きを用意しました。対象の会話から宛先と本文を確認し、承認して送信してください。
        </Notice>
      )}
      {list.rows.length ? (
        list.rows.map((r) => entry(r, names))
      ) : (
        <EmptyState>
          該当する課題はありません。会話の「GitHub
          Issue」で起票するか、既存の課題と紐づけてください。
        </EmptyState>
      )}
    </ListPage>,
    frame,
  )
}
