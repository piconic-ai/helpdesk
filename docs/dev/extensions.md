# 拡張を追加する

拡張を TypeScript で定義し、`helpdesk.config.ts` に静的に import します。以下は会話画面に操作を一つ追加する例です。

```ts
import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'

export const reference: Extension = {
  id: 'reference',
  permissions: [],
  config: z.object({}),
  operations: [{
    name: 'format',
    description: 'Show the conversation reference',
    permission: 'read',
    input: z.object({ number: z.coerce.number().int().positive() }),
    output: z.string(),
    async run(ctx, input) {
      const { number } = z.object({ number: z.coerce.number() }).parse(input)
      return (await ctx.contact(number)).reference
    },
  }],
  panels: [{ slot: 'conversation', title: 'Reference', operations: ['format'] }],
}
```

`extensions` 配列に `{ extension: reference, enabled: false, settings: {} }` を追加します。全体の管理者が **拡張の管理** で権限を確認して有効にすると、会話画面、操作一覧 API、CLI と MCP に `reference.format` が現れます。設定を編集した場合は Worker をビルドし直してください。

## データと権限

`ctx.get/put/create/list/remove` は拡張固有の D1 テーブルを操作します。`create` は同じキーに先行する書き込みがあれば false を返します。追加テーブルの migration は `migrations` の末尾に SQL を足します。各要素はセミコロンを含まない `CREATE TABLE IF NOT EXISTS 拡張ID_テーブル名(...)` 文です。ID のハイフンはテーブル名ではアンダースコアになります。有効化時に順番に適用し、適用済みの版を D1 に残します。

操作に必要なトークンの範囲を `permission` に指定します。`humanOnly` は人の確認が必要な操作を機械クライアントから除きます。拡張自身の権限は `permissions` に宣言します。顧客の本文を読む `ctx.body` は `read_body`、ネットワークを使う `ctx.request` は `external_fetch` を必要とします。拡張コードは Worker に同梱するため、導入元のコードをビルド前にレビューしてください。

`ctx.voices()` は受け付けた問い合わせ・フィードバックの番号、プロジェクト、種類、現在の状態、受付時刻を返します。運営者から呼ぶと、所属するプロジェクトの会話が対象になります。集計対象は迷惑メールを除いた会話です。プロジェクトごとの設定が必要な拡張は `configurationGaps(ctx, products)` を定義すると、管理画面のカードに不足している設定を表示できます。

## 受付と配送

フォームの受付は `intakes` にパスと手続きを登録し、`ctx.open` で会話を作ります。本人確認済みの利用者が継続して問い合わせる入口では、相手と窓口を照合した会話に対して `ctx.addInboundMessage(number, body)` で追記できます。公開用のキー、ブラウザの Origin、回数上限はプロジェクト単位の `publicIntakes` に設定します。ブラウザは JSON を `POST /public/form/PRODUCT/submit` に送り、`X-Helpdesk-Key` を指定します。Turnstile を有効にする場合は `turnstileSecretBinding` と `CF-Turnstile-Response` を使用します。

公開フォームを helpdesk 上で提供する場合は、対象の拡張を有効にします。プロジェクトの管理者が「プロジェクトの設定」で対象を選び、「拡張の設定」で対応する受付を開いて「このサイトで受付を開始」を押します。この操作はホスト画面を現在のオリジンで公開します。外部の受付 API や Turnstile を使う場合は `publicIntakes[PRODUCT]` を設定し、ホスト画面のオリジンを `origins` に含めます。デプロイ時の設定がある場合は、そちらが優先されます。ヘルプの入口 `/help/` にも掲載するには、対象プロジェクトの「公開のヘルプ」で「ヘルプの入口にこのプロジェクトを掲載する」を選び、「公開設定を保存」を押します。保管済みのプロジェクトは入口の一覧から外れます。問い合わせは `/help/form/PRODUCT`、フィードバックは `/help/feedback/PRODUCT`、ヘルプチャットは `/help/chat/PRODUCT` で開けます。ヘルプチャットでは連絡先を入力する前に関連する記事を探せます。該当する記事がないときに、担当者が返信するためのメールアドレスを入力します。

Turnstile を使う公開フォームには、シークレットのバインディング名に加えて、対応するウィジェットの公開サイトキーを `turnstileSiteKey` に設定します。サイトキーが未設定の間は該当する HTML フォームの受付を停止します。

`subscribers` は核が書き込んだ出来事を非同期に受け取ります。キューが停止しても D1 にイベントと配送状況が残ります。定期処理は期限を過ぎた配送を再びキューに積みます。送信先側でも冪等性を確保してください。運営者は **拡張の管理** で失敗理由と試行回数を確認できます。

[拡張契約](../../src/core/extensions/extension.ts)・[フォーム受付](../../src/extensions/form/extension.ts)・[定型返信](../../src/extensions/canned/extension.ts)・[GitHub issue](../../src/extensions/issues/extension-usecase.ts)

## 同梱拡張から選ぶ実装例

| 追加したいこと | 実例 | 確かめる点 |
|---|---|---|
| フォームを会話にする | [feedback](../../src/extensions/feedback/extension.ts) | 公開入力を解析し、受付番号を返す。相手の情報をほかの利用者に返さない |
| 別の拡張が公開した記事を使う | [chat](../../src/extensions/chat/extension.ts) と [articles](../../src/extensions/articles/extension-routes.ts) | 公開済みの記事だけを resource として渡す。記事や判断結果が足りないときは問い合わせに引き継ぐ |
| 出来事に応じて送信する | [auto-ack](../../src/extensions/auto-ack/extension.ts) | `send` を宣言し、方針を有効にした管理者と送信のキーを指定する。再配送時に同じキーを使う |
| 外部へ通知する | [notify](../../src/extensions/notify/extension.ts) | `external_fetch` と必要な secret binding を宣言する。本文を載せる場合にだけ `read_body` を使う |
| 公開ページで回答を受ける | [survey](../../src/extensions/survey/extension-routes.ts) | ランダムなトークンで対象を特定し、同一 Origin の POST で最初の回答を記録する |
| 一覧と受信の振り分けに関与する | [snooze](../../src/extensions/snooze/extension.ts) と [merge](../../src/extensions/merge/extension.ts) | 元の会話番号とメールの履歴を保持する。無効化すれば拡張のフックは呼ばれない |
| 履歴から数値を求める | [metrics](../../src/extensions/metrics/calculate.ts) | 出来事の時刻と操作主体を純粋関数に渡し、例示データで計算を検証する |

## ローカルで試す

1. 最小の例を `src/extensions/reference/extension.ts` に保存し、設定に登録します。
2. ローカル開発手順でビルドと migration を実行し、全体の管理者が **拡張の管理** で有効にします。
3. 会話画面で **Show the conversation reference** を押し、表示が元の番号と一致することを確認します。API トークンを発行し、CLI で同じ操作を呼びます。
4. 拡張を無効にし、画面の操作と CLI の一覧から消えたことを確認します。

```sh
node cli/helpdesk.mjs operations
node cli/helpdesk.mjs --json reference.format '{"number":1}'
```

[ローカルの起動](development.md)・[トークンと CLI の設定](machine-access.md)・[サンプル操作を CLI と MCP から実行するテスト](../../tests/machine-access.test.ts)
