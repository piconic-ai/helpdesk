# ローカルで開発する

Node.js 24 と pnpm 12.16.1 を使います。リポジトリのルートで次を実行してください。

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm exec wrangler d1 migrations apply DB --local
pnpm build
pnpm exec wrangler dev --local --ip 127.0.0.1 --port 8787 --var ENVIRONMENT:local --var LOCAL_OPERATOR:operator@example.com --var SENDING_DOMAINS:example.com
```

## 受信から完了まで

1. ブラウザで `http://127.0.0.1:8787/settings` を開きます。初回の運営者が管理者になります。
2. **Product ID** に `shop`、**Product name** に `Shop`、**Mailbox address** に `support@example.com` を入力し、**Register mailbox** を押します。
3. 別の端末で、添付と HTML 本文を含むメールをローカルの受信口に渡します。

   ```sh
   curl --fail-with-body --data-binary @tests/fixtures/mail-flow.eml \
     'http://127.0.0.1:8787/cdn-cgi/local/email?from=person@example.net&to=support@example.com'
   ```

4. **Inbox** を開きます。キューがメールを取り込むと **Receipt download** が現れます。会話を開くと送信元、本文、添付、返信欄が表示されます。
5. **Reply** に本文を書き、**Preview reply** で確認して **Send reply** を押します。ローカルの Email Service が送信を受け付けると、会話は `pending` になります。必要に応じてページを再読み込みしてください。
6. 同じ会話に相手の返事が入ることを確かめます。次のメールを投入し、会話を再読み込みしてください。本文が追加され、状態が `open` に戻ります。

   ```sh
   curl --fail-with-body --data-binary @tests/fixtures/mail-follow-up.eml \
     'http://127.0.0.1:8787/cdn-cgi/local/email?from=person@example.net&to=support@example.com'
   ```

7. **event** で `closed` を選び、**Update status** を押します。既定の受信箱から会話が消えます。**status** を `closed` にして **Filter** を押すと、完了済みの会話を確認できます。

開発用の固定運営者はループバックだけで使用します。Wrangler は D1 と R2 の状態を `.wrangler/state` に保存します。同じメールを再投入すると再配送として扱います。新しい会話を試すときは、例を別ファイルに複製し、Message-ID を変えてください。

この手順の自動テストは、一時ディレクトリに DB を作成して Chromium で操作します。受信には Wrangler のローカルメール入口を使い、送信はローカルに記録されます。受信者のメールソフトへの到達性とスレッド表示は、本番用の窓口で人が確認します。

```sh
pnpm exec vitest run tests/mail-flow.test.ts
```

[Cloudflare のローカル受信手順](https://developers.cloudflare.com/email-service/observability/local-development/routing/)と[ローカル送信の仕組み](https://developers.cloudflare.com/email-service/observability/local-development/sending/)も参照してください。

## 変更を検証する

```sh
pnpm format:check
pnpm build
pnpm exec tsc --noEmit
pnpm test:coverage
python3 scripts/check-docs.py
cccc .
```

CI は Chromium と cccc v1.8.6 を使用します。カバレッジの内訳は `coverage/coverage-summary.json` に出ます。`scripts/layers.test.mjs` は各ファイルの依存方向と核から拡張への依存を検査します。BarefootJS のコンポーネントを編集したら、再度 `pnpm build` を実行してテンプレートとブラウザ用のスクリプトを更新してください。
