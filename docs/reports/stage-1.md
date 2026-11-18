# 段階1　窓口メールの受信から完了まで

F01-AC1 から F01-AC31 までを検証しました。ローカルの Email Worker に投入したメールが受信箱に現れ、Chromium で返信すると送信済みになりました。相手の再返信は同じ会話に入り、完了操作後は既定の一覧から消えました。

| 条件 | 自動検証の対象 |
|---|---|
| AC1–10 | workerd の受信入口、R2、Queues、D1。別窓口への同時配送、重複、なりすましの手がかり、解析失敗、日本語の文字コード |
| AC11–16 | Access の署名・期限・発行元・宛先、検索と絞り込み、相手の履歴。ブラウザで外部通信0件と添付のダウンロードを確認 |
| AC17–22 | 送信 binding へ渡す差出人・返信ヘッダー、送信と再送、二重処理、内部メモの分離。失敗注入はテスト用送信先を使用 |
| AC23–27 | 再受信、完了、担当者、隔離、バウンス。24通りの状態遷移 |
| AC28–31 | 管理者と担当者の権限差、R2 を含む削除、保存期間、状態と同時に書き込まれる出来事 |

## コマンドと結果

- `pnpm format:check`、`pnpm build`、`pnpm exec tsc --noEmit` が成功しました。ビルドは Worker の dry-run まで実行しました。
- `pnpm test:coverage` は10ファイル154件が成功しました。文71.78%、分岐66.11%、関数71.19%、行74.00%でした。計測には Chromium と別プロセスのローカル Worker での操作が含まれますが、そのプロセス内の実行行はカバレッジ集計に入りません。
- `python3 scripts/check-docs.py` と `cccc .` が成功しました。関数単位の Cognitive Complexity の最大値は13でした。

## 運用前に人が確かめること

実宛先への到達、迷惑メールの判定、SPF・DKIM・DMARC、Gmail・Outlook・iPhone のスレッド表示、運営画面の文言と見やすさは本番設定後の確認事項です。実運用の Access、Queues、送信ドメイン、料金も確認してください。

受理結果が不明な送信は自動再送を抑止します。運営者は送信サービスの履歴を確認してください。[設計上の決定](../decisions.md)・[ローカルでの再現手順](../dev/development.md)

## 参照した公式資料

[Email Workers 受信](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/)・[送信 binding](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)・[メールヘッダー](https://developers.cloudflare.com/email-service/reference/headers/)・[ローカル受信](https://developers.cloudflare.com/email-service/observability/local-development/routing/)・[ローカル送信](https://developers.cloudflare.com/email-service/observability/local-development/sending/)・[Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)・[D1](https://developers.cloudflare.com/d1/worker-api/d1-database/)・[R2](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)・[Queues](https://developers.cloudflare.com/queues/configuration/batching-retries/)
