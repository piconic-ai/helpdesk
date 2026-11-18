# 設計の決まり

すべての段階に共通する設計の決まりと、リポジトリの構成を示します。

## 設計の決まり

### 原則

- **純粋関数を優先する。** 出力は明示した入力だけで決める。D1、R2、Queue、通信、`env`、現在時刻、乱数は境界に置く。「いま」が必要なら `now` を引数に取る。
- **有効な状態だけを型で表す。** 持つデータが違う状態は、判別可能な union にする。無関係なフラグや省略可能なフィールドを並べない。
- **境界で解析する。** メール、リクエスト、設定、保存済みの行、外部の応答は信頼できない入力として扱い、zod でドメインの型に解析してから純粋な処理に渡す。
- **操作を1か所に定義する。** 操作は「名前・入力のスキーマ・必要な権限・手続き」の組として1度だけ定義し、画面、HTTP API、CLI、MCP のすべてがそれを呼ぶ。入口ごとに判断を書かない。
- **外へ出る副作用は、判断の結果として値で返す。** 純粋な処理は送信を実行せず、「この返信を送信待ちにする」という結果を返す。
- **核は拡張を知らない。** `src/core/` は `src/extensions/` を読み込まない。拡張は核の型を広げず、必要なデータは自分のテーブルに持つ。
- **具体的な必要がないのに、層や抽象を足さない。**

### 層

ファイル名が層を表し、層が「外の世界の何に触れてよいか」を決めます。

| 層 | ファイル名 | 役割 | 使ってはいけないもの |
|---|---|---|---|
| 純粋 | 下のどれにも当たらない `.ts` | 検証、変換、会話の判定、状態の遷移、方針の判断 | hono、drizzle-orm、`env`、各種 binding、`fetch`、現在時刻、乱数 |
| schema | `schema.ts`、`*-schema.ts` | テーブル定義と、そこから導く型・検証 | 同上 |
| store | `*-store.ts` | D1・R2 の読み書き。行をドメインの型に解析する | hono、`fetch`、client・入口 |
| client | `*-client.ts` | 外部との通信と、応答の解析 | hono、drizzle-orm、store・入口 |
| pages | `*-pages.ts`、`*-page.tsx` | HTML を組み立てる。値はエスケープする | D1・R2、時刻、乱数、store・client |
| 手続き | `*-usecase.ts` | 読む → 純粋な判断 → 書く・キューに積む、の順につなぐ | hono、HTML、判断や変換そのもの |
| 入口 | `*-routes.ts`、`*-email.ts`、`*-queue.ts`、`*-cron.ts`、`*-mcp.ts`、`middleware.ts` | 入力を解析し、手続きを呼び、結果を返す | 判断や変換そのもの |

依存の向きは、入口 → 手続き → {store, client} → 純粋 の一方向です。pages は入口だけが呼びます。型だけの読み込みは依存に数えません。

手続きは次の形に保ちます。判断を書き込んだら、純粋な関数に取り出します。

```ts
const current = await store.load(id)            // read
const decision = decide(current, command, now)   // pure
await store.apply(decision)                      // write (events and outbox in the same batch)
```

slide の `scripts/layers.mjs` を移植し、上の表と「核は拡張を読み込まない」を検査します。既知の例外の一覧は空で始めます。

### ドメインの型

```ts
type Conversation = Inquiry | Feedback

type Inquiry = Common & { kind: 'inquiry'; status: InquiryStatus; assignment: Assignment }
type Feedback = Common & { kind: 'feedback'; status: FeedbackStatus }

type Common = {
  number: ConversationNumber
  product: ProductId
  mailbox: MailboxAddress         // the From address of replies is derived from this
  contact: ContactId
  origin: 'email' | 'form' | 'chat'
}

type InquiryStatus =
  | { kind: 'open' }                       // the operator's turn
  | { kind: 'pending' }                    // waiting for the customer
  | { kind: 'closed'; closedAt: Instant }
  | { kind: 'spam' }

type FeedbackStatus =
  | { kind: 'received' }
  | { kind: 'reviewed'; by: OperatorId }
  | { kind: 'spam' }

type Assignment =
  | { kind: 'unassigned' }
  | { kind: 'assigned'; to: OperatorId }

type Message =
  | { kind: 'inbound'; from: Address; receivedAt: Instant; raw: RawKey }
  | { kind: 'note'; author: Actor; body: string }
  | { kind: 'outbound'; author: Actor; body: string; delivery: Delivery }

type Delivery =
  | { kind: 'draft' }
  | { kind: 'awaiting_approval' }
  | { kind: 'queued'; approval: Approval }
  | { kind: 'sent'; approval: Approval; sentAt: Instant; providerId: string }
  | { kind: 'failed'; approval: Approval; reason: SendFailure }

type Approval =
  | { kind: 'operator'; by: OperatorId }
  | { kind: 'standing'; policy: PolicyId; enabledBy: OperatorId }

type Actor =
  | { kind: 'operator'; id: OperatorId }
  | { kind: 'agent'; id: AgentId; onBehalfOf: OperatorId }
  | { kind: 'extension'; id: ExtensionId }
  | { kind: 'system' }
```

この型が守ること:

- 内部メモ(`note`)は送信の状態を持たないので、相手に送られない。
- 送信待ち以降の状態は必ず承認を持つ。エージェントと拡張は承認者になれない。
- 自動で送るもの(受付返信など)は、運営者が有効にした方針による承認(`standing`)として記録する。誰が有効にしたかが必ず残る。
- 返信の差出人は入力で受けず、会話の `mailbox` から導く。
- フィードバックは返信の状態を持たない。フィードバックへ返事をしたいときは、「問い合わせに変える」操作を通す。

ID、アドレス、問い合わせ番号、時刻は、解析を通った値だけが持てる branded type にします。フィールドの追加は自分で判断して構いません。variant の追加と削除は、理由を `docs/decisions.md` に書いてから行います。

### 遷移

```ts
type InquiryEvent =
  | { kind: 'customer_replied' } | { kind: 'operator_replied' }
  | { kind: 'closed' } | { kind: 'reopened' }
  | { kind: 'marked_spam' } | { kind: 'unmarked_spam' }

function transition(status: InquiryStatus, event: InquiryEvent, now: Instant): Result<InquiryStatus, Rejected>
```

- `switch` に `default` を書かず、戻り値の型を明示する。
- 許さない組み合わせは例外にせず、理由を持つ `Rejected` を返す。
- 4 状態 × 6 出来事 = 24 通りを表にして仕様に書き、すべてテストする。次の4つは確定です。残りは、利用者が驚かない結果を自分で決めます。
  - `open` + `operator_replied` → `pending`
  - `pending` + `customer_replied` → `open`
  - `closed` + `customer_replied` → `open`
  - `spam` + `customer_replied` → `spam` のまま

フィードバックの遷移と、問い合わせへの変換も、同じ書き方で作ります。

### 出来事

核は、起きたことを追記だけの記録として `events` に残します。数値はここから計算し、拡張の出口もここを購読します。

```ts
type CoreEvent =
  | { kind: 'conversation_opened'; number: ConversationNumber; origin: Origin }
  | { kind: 'message_received'; number: ConversationNumber }
  | { kind: 'reply_sent'; number: ConversationNumber; approval: Approval }
  | { kind: 'reply_failed'; number: ConversationNumber }
  | { kind: 'status_changed'; number: ConversationNumber; from: StatusKind; to: StatusKind }
  | { kind: 'assigned'; number: ConversationNumber; to: OperatorId | null }
```

出来事は、それを起こした書き込みと同じ D1 の batch で書きます。すべての出来事に、時刻と `Actor` を持たせます。拡張は、自分の出来事(記事で解決した、issue を起こした、など)を、自分の名前空間で同じ記録に追記できます。

### 受信の流れ

1. **Email Worker(入口)**: 原文をまず R2 に保存し、キューに積む。ここでは解析しない。
2. **キューの処理**: 原文を解析し、ドメインの型にする。
3. **純粋な判断**: 宛先から窓口とプロダクトを決める(登録のない宛先は受け付けない)。自動送信メールとバウンスを見分ける。どの会話に入れるかを決める。
4. **store**: 会話、メッセージ、出来事を同じ batch で書く。新しい会話には、ここで問い合わせ番号を振る。採番は、同時に届いても重複しないよう SQL の中で行う。

同じメールを2回処理しても結果が変わらないようにします。

```ts
function threadFor(mail: ParsedMail, candidates: ConversationRef[]):
  | { kind: 'existing'; number: ConversationNumber }
  | { kind: 'new' }
```

手がかりは `In-Reply-To` と `References`、欠けている場合は件名の `[#123]` です。**どの手がかりが一致しても、差出人がその会話の相手でなければ新しい会話にします。** ヘッダーも番号も誰でも書けるため、他人の会話に割り込めてしまうからです。

自動送信メールとバウンスは、会話を `open` に戻しません。バウンスは、対応する返信を `failed` にします。

### 送信の流れ

1. 返信の操作を受け、純粋な判断が `outbound` のメッセージを作る。運営者の操作なら `queued`、エージェントの操作なら `awaiting_approval` になる。
2. メッセージ、出来事、送信待ちの記録(`outbox`)を、同じ batch で書く。
3. キューの処理が client を通して送信し、結果を `sent` か `failed` に書く。同じ記録を2回処理しても二重に送らないよう、送信ごとに固定のキーを持たせる。
4. `Message-ID`、`In-Reply-To`、`References` を組み立て、件名に `[#123]` を添える。

Email Workers の `message.reply()` は受信の処理の中でしか使えないため、使いません。送信は `send-client.ts` の1ファイルに閉じ込めます。

### 表示と公開の入口の安全

- HTML メールは無害化し、sandbox 付きの iframe と別の CSP で隔離して表示する。外部の画像は既定で読み込まない。
- 添付は、ダウンロードとしてだけ返す。
- 運営画面のすべての応答に、slide と同等のセキュリティヘッダーを付ける(slide で `Content-Security-Policy` を検索して実例を見る)。
- 公開の入口(フォーム、フィードバック、チャット)は、プロダクトごとの公開キー、許可する Origin、回数制限、Turnstile の検証(設定したとき)を持つ。応答から、他人の会話や運営の内部の情報が分からないようにする。

## リポジトリの構成

```
src/
  core/
    conversations/   state.ts transitions.ts threading.ts numbering.ts
                     conversations-schema.ts conversations-store.ts
                     conversations-usecase.ts conversations-routes.ts conversations-pages.ts
    inbound/         parse.ts classify.ts inbound-email.ts inbound-queue.ts
    outbound/        compose.ts approval.ts send-client.ts outbound-queue.ts
    operations/      catalog.ts permissions.ts operations-routes.ts operations-mcp.ts
    events/          events.ts events-store.ts dispatch-queue.ts
    operators/       operators-schema.ts operators-store.ts tokens.ts middleware.ts
    retention/       retention.ts retention-cron.ts
    extensions/      extension.ts registry.ts
    settings/        config.ts
  extensions/        spam/ notify/ auto-ack/ metrics/ form/ canned/ issues/ feedback/
                     articles/ chat/ survey/ snooze/ merge/ rules/ presence/ export/
cli/
migrations/
docs/
  product.md
  decisions.md
  features/          仕様と受け入れ条件
  dev/               architecture.md、development.md、planning.md、extensions.md、self-hosting.md
scripts/             layers.mjs、layers.test.mjs、check-docs.py
helpdesk.config.ts
AGENTS.md
```
