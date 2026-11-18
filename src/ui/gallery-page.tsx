import { RowHeadline, RowPreview, RowLabels, inboxIcon } from './inbox-parts'
import { BfScripts } from '@barefootjs/hono/scripts'
import { ReplyComposer } from '@/components/ReplyComposer'
import { Tooltip } from '@/components/PatternTooltip'
import {
  ActionLink,
  ActionMenu,
  Button,
  Dialog,
  Field,
  Input,
  NativeSelect,
  Popover,
  Textarea,
} from './controls'
import {
  ActionBar,
  AttributeRow,
  Candidate,
  CandidateList,
  ConversationRow,
  DetailPage,
  EditPage,
  EmptyState,
  ExtensionCard,
  FilterBar,
  FormSection,
  ListPage,
  ListRow,
  LoadingState,
  Message,
  MetricCard,
  MetricGrid,
  Notice,
  OverviewPage,
  RowList,
  SettingRow,
} from './patterns'

const tickets = [
  { id: 1, sender: '山田 花', subject: '領収書の宛名について', read: false },
  {
    id: 2,
    sender: '森 海斗',
    subject: 'ワークスペースに参加したい',
    read: true,
  },
]
function GalleryFilters({ query }: { query: URLSearchParams }) {
  const q = query.get('q') ?? ''
  const status = query.get('state') ?? ''
  return (
    <FilterBar
      chips={
        (q || status) && (
          <ActionLink href="/dev/ui#list" variant="ghost">
            条件を外す ×
          </ActionLink>
        )
      }
    >
      <form action="/dev/ui#list" data-live-filters="">
        <Field label="検索">
          <Input name="q" type="search" value={q} placeholder="差出人・件名" />
        </Field>
        <Field label="状態">
          <NativeSelect name="state">
            <option value="">すべて</option>
            <option value="unread" selected={status === 'unread'}>
              未読
            </option>
            <option value="read" selected={status === 'read'}>
              既読
            </option>
          </NativeSelect>
        </Field>
        <Field label="順序">
          <NativeSelect name="sort">
            <option value="">新着順</option>
            <option value="old" selected={query.get('sort') === 'old'}>
              古い順
            </option>
          </NativeSelect>
        </Field>
      </form>
    </FilterBar>
  )
}
function InboxExample({ query }: { query: URLSearchParams }) {
  const state = query.get('state')
  const rows = tickets.filter(
    (r) =>
      (!state || r.read === (state === 'read')) &&
      (r.sender + r.subject).includes(query.get('q') ?? ''),
  )
  if (query.get('sort') === 'old') rows.reverse()
  return (
    <ListPage
      title="受信箱"
      description={rows.length + '件'}
      action={
        <ActionBar>
          <ActionLink href="#edit">記事を書く</ActionLink>
          <ActionMenu id="gallery-list-menu" label="一覧の操作">
            <ActionLink href="#states" variant="ghost">
              読み込み中・空の一覧を確認
            </ActionLink>
          </ActionMenu>
        </ActionBar>
      }
      filters={<GalleryFilters query={query} />}
    >
      {rows.length ? (
        <RowList>
          {rows.map((r) => (
            <ConversationRow
              number={r.id}
              href="#detail"
              read={r.read}
              selection={
                <Input type="checkbox" aria-label={r.subject + 'を選択'} />
              }
              headline={
                <RowHeadline
                  sender={r.sender}
                  subject={r.subject}
                  product="Slide"
                />
              }
              preview={
                <RowPreview
                  number={r.id}
                  text="サポートへのお問い合わせです。"
                  icon={inboxIcon('受信')}
                >
                  <RowLabels labels={['請求']} />
                </RowPreview>
              }
              time="1時間前"
              assignee="佐"
            />
          ))}
        </RowList>
      ) : (
        <EmptyState>条件に一致する問い合わせはありません。</EmptyState>
      )}
      <RowList>
        <ListRow
          title="領収書を発行する"
          description="Slide"
          status="公開中"
          href="#detail"
          action={
            <ActionLink href="#edit" variant="ghost">
              編集
            </ActionLink>
          }
        />
      </RowList>
    </ListPage>
  )
}
function ExampleChoices() {
  return (
    <CandidateList>
      {['佐藤 優', '森 直子', '未割り当て'].map((name, i) => (
        <Button type="button" variant="ghost" data-gallery-choice={name}>
          <Candidate label={name} icon={name[0]} selected={i === 0} />
        </Button>
      ))}
    </CandidateList>
  )
}
function ThreadExample() {
  return (
    <DetailPage
      title="領収書の宛名について"
      back={{ href: '#list', label: '受信箱' }}
      action={
        <ActionBar>
          <Button data-gallery-toggle="" aria-pressed="false" type="button">
            完了にする
          </Button>
          <ActionMenu id="sample-menu" label="その他の操作">
            <Button
              type="button"
              variant="ghost"
              command="show-modal"
              commandfor="sample-confirm"
            >
              削除する
            </Button>
          </ActionMenu>
        </ActionBar>
      }
      attributes={
        <AttributeRow>
          <Popover
            id="sample-assignee"
            label={<span data-gallery-assignee="">担当・佐藤 優</span>}
          >
            <ExampleChoices />
          </Popover>
          <span>未対応</span>
          <span className="label-chip">請求</span>
        </AttributeRow>
      }
      aside={
        <FormSection title="連絡先">
          <p>山田 花</p>
          <code>reader@example.net</code>
        </FormSection>
      }
    >
      <Message kind="inbound" header="山田 花 · 1時間前">
        経理部の名義で領収書を発行できますか？
      </Message>
      <Message kind="outbound" header="佐藤 優 · 送信済み">
        請求ページでお宛名を変更できます。
      </Message>
      <Message kind="note" header="内部メモ">
        次回更新時に確認する。
      </Message>
      <Message kind="record">森 直子 がラベル「請求」を追加しました。</Message>
      <ReplyComposer
        number={1}
        mailbox="support@example.com"
        contact="reader@example.net"
      />
      <Dialog
        id="sample-confirm"
        title="見本の会話を削除しますか？"
        description="見本の表示を閉じます。"
      >
        <form method="dialog">
          <Button autofocus>キャンセル</Button>
          <Button variant="destructive">削除する</Button>
        </form>
      </Dialog>
    </DetailPage>
  )
}
function EditExample() {
  return (
    <EditPage
      title="記事の編集"
      back={{ href: '#list', label: '記事一覧' }}
      footer={
        <ActionBar>
          <Button form="sample-edit" variant="default">
            保存
          </Button>
          <Button form="sample-edit" type="reset" variant="ghost">
            取り消し
          </Button>
        </ActionBar>
      }
    >
      <form id="sample-edit" data-gallery-save="">
        <FormSection
          title="記事の内容"
          description="公開する題と本文を入力します。"
        >
          <Field label="題">
            <Input required name="title" value="領収書を発行する" />
          </Field>
          <Field label="本文">
            <Textarea name="body">購入履歴から領収書を発行できます。</Textarea>
          </Field>
        </FormSection>
      </form>
    </EditPage>
  )
}
function OverviewExample() {
  return (
    <OverviewPage
      title="対応状況"
      description="直近30日の集計"
      filters={
        <FilterBar>
          <ActionLink href="#list" variant="ghost">
            条件を確認
          </ActionLink>
        </FilterBar>
      }
    >
      <MetricGrid>
        <MetricCard
          title="解決までの平均時間"
          value="4時間"
          change="前期より1時間短縮"
          definition="受付から完了までにかかった時間の平均。"
        />
        <MetricCard
          title="一度で解決"
          value="82%"
          change="前期より3ポイント増"
          definition="一度の返信で解決した問い合わせの割合。"
        />
        <MetricCard
          title="平均作業時間"
          value="8分"
          change="前期の完了件数は0件です。"
          definition="1件の対応に使った平均時間。"
        />
      </MetricGrid>
      <SettingRow
        title="プロダクトと窓口"
        description="製品別の受付先を管理します。"
        href="#edit"
        value="窓口 2件"
      />
      <ExtensionCard
        title="ヘルプ記事"
        description="よくある質問の答えを公開します。"
        toggle={
          <label>
            <Input type="checkbox" role="switch" checked />
            <span>有効</span>
          </label>
        }
        settings={<ActionLink href="#edit">設定</ActionLink>}
      />
      <ExtensionCard
        title="フィードバック"
        description="利用者からの声を集めます。"
        toggle={
          <label>
            <Input type="checkbox" role="switch" />
            <span>無効</span>
          </label>
        }
        settings={<Button disabled>設定</Button>}
      />
    </OverviewPage>
  )
}
export function galleryPage(query: URLSearchParams) {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>UI 部品見本 · Helpdesk</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/ui/inbox.css" />
        <script defer src="/ui/live-filters.js"></script>
        <script type="module" src="/ui/barefoot-overlays.js"></script>
        <script defer src="/ui/gallery.js"></script>
      </head>
      <body data-ui="gallery">
        <main>
          <header>
            <p>Helpdesk</p>
            <h1>UI 部品見本</h1>
            <nav aria-label="画面の型">
              <a href="#list">一覧</a>
              <a href="#detail">詳細</a>
              <a href="#edit">編集</a>
              <a href="#overview">概要</a>
              <a href="#states">状態</a>
            </nav>
          </header>
          <section id="list" aria-label="一覧の見本">
            <h2>一覧</h2>
            <InboxExample query={query} />
          </section>
          <section id="detail" aria-label="詳細の見本">
            <h2>詳細</h2>
            <ThreadExample />
          </section>
          <section id="edit" aria-label="編集の見本">
            <h2>編集</h2>
            <EditExample />
          </section>
          <section id="overview" aria-label="概要の見本">
            <h2>概要</h2>
            <OverviewExample />
          </section>
          <section id="states" aria-label="部品の状態">
            <h2>部品の状態</h2>
            <ActionBar>
              <Button variant="default" data-gallery-toggle="">
                有効
              </Button>
              <Button disabled>無効</Button>
              <Tooltip
                id="gallery-tooltip"
                content="キーボードでも操作できます"
              >
                <button type="button">ヒント</button>
              </Tooltip>
            </ActionBar>
            <FormSection title="入力欄の状態">
              {' '}
              <Field
                label="入力エラー"
                description="メールアドレスを入力してください。"
              >
                <Input type="email" aria-invalid="true" value="support" />
              </Field>
              <Field label="公開先">
                <NativeSelect disabled>
                  <option>Slide</option>
                </NativeSelect>
              </Field>
            </FormSection>
            <Notice kind="success">保存しました。</Notice>
            <Notice kind="error">
              保存に失敗しました。もう一度試してください。
            </Notice>
            <Notice kind="info">更新を確認しています。</Notice>
            <EmptyState>未対応の問い合わせはありません。</EmptyState>
            <LoadingState />
            <ExampleChoices />
          </section>
        </main>
        <BfScripts />
      </body>
    </html>
  )
}
