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
    async run(_ctx, input) {
      return '#' + z.object({ number: z.coerce.number() }).parse(input).number
    },
  }],
  panels: [{ slot: 'conversation', title: 'Reference', operations: ['format'] }],
}
```

`extensions` 配列に `{ extension: reference, enabled: false, settings: {} }` を追加します。管理者が **Extensions** で権限を確認して有効にすると、会話画面、操作一覧 API、CLI と MCP に `reference.format` が現れます。設定を編集した場合は Worker をビルドし直してください。

## データと権限

`ctx.get/put/create/list/remove` は拡張固有の D1 テーブルを操作します。`create` は同じキーに先行する書き込みがあれば false を返します。追加テーブルの migration は `migrations` の末尾に SQL を足します。各要素はセミコロンを含まない `CREATE TABLE IF NOT EXISTS 拡張ID_テーブル名(...)` 文です。ID のハイフンはテーブル名ではアンダースコアになります。有効化時に順番に適用し、適用済みの版を D1 に残します。

操作に必要なトークンの範囲を `permission` に指定します。`humanOnly` は人の確認が必要な操作を機械クライアントから除きます。拡張自身の権限は `permissions` に宣言します。顧客の本文を読む `ctx.body` は `read_body`、ネットワークを使う `ctx.request` は `external_fetch` を必要とします。拡張コードは Worker に同梱するため、導入元のコードをビルド前にレビューしてください。

## 受付と配送

フォームの受付は `intakes` にパスと手続きを登録し、`ctx.open` で会話を作ります。公開用のキー、ブラウザの Origin、回数上限はプロダクト単位の `publicIntakes` に設定します。ブラウザは JSON を `POST /public/form/PRODUCT/submit` に送り、`X-Helpdesk-Key` を指定します。Turnstile を有効にする場合は `turnstileSecretBinding` と `CF-Turnstile-Response` を使用します。

`subscribers` は核が書き込んだ出来事を非同期に受け取ります。キューが停止しても D1 にイベントと配送状況が残ります。定期処理は期限を過ぎた配送を再びキューに積みます。送信先側でも冪等性を確保してください。運営者は **Extensions** で失敗理由と試行回数を確認できます。

[拡張契約](../../src/core/extensions/extension.ts)・[フォーム受付](../../src/extensions/form/extension.ts)・[定型返信](../../src/extensions/canned/extension.ts)・[GitHub issue](../../src/extensions/issues/extension-usecase.ts)
