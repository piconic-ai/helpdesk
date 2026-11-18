# 段階3　同梱拡張

F07〜F19 の全受け入れ条件と F06-AC4 を検証しました。未完の拡張はありません。各条件の ID は[進捗表](../plan/PROGRESS.md)に記録しました。

| 対象 | 確認した結果 |
|---|---|
| spam、notify、auto-ack | 隔離と復帰、通知の本文設定、自動送信除外、運営者による方針承認、再配送時の重複防止 |
| metrics、survey、issues | プロダクト別・期間別の A・D・F、完了後のアンケート、同じ回答の重複防止、issue 別の修正前後の件数と割合 |
| feedback、articles、chat | 同じ番号での問い合わせへの変換、公開記事の検索・無害化・投票、記事の提案と元の質問の引き継ぎ |
| export | CLI・MCP で会話・メッセージ・出来事の JSON Lines を取得。相手の名前とアドレスの既定マスキング |
| snooze、merge、rules、presence | 時刻での復帰、元の番号への返信と検索、規則によるラベルと担当者設定、Chromium の2画面での閲覧・入力中の表示 |

## 実行結果

- `pnpm format:check`、`pnpm build`、`pnpm exec tsc --noEmit`、`python3 scripts/check-docs.py`、`cccc .` が成功しました。仕様は19件、関数の Cognitive Complexity は最大15でした。
- `pnpm test:coverage` は19ファイル193件が成功しました。文85.08%、分岐76.32%、関数87.86%、行87.76%でした。
- `node scripts/test-stage1-matrix.mjs` は全拡張有効・全拡張無効で各58件が成功しました。D1 の有効化設定を切り替え、Worker バンドルでの受信とキュー処理、ブラウザでの返信と完了を含めて検証しました。

## 導入先で確認すること

本番の送信・ドメイン認証、GitHub、Slack・Discord の権限と到達性はローカル試験の対象外です。AI の得点に基づく分岐は自動化しました。日本語での記事選択と閾値、文面とデザインは利用する記事・窓口に合わせて確認してください。個人情報の書き出しを許すトークンの発行範囲も運営者が判断します。

[設計上の決定](../decisions.md)・[自動メール用ヘッダー](https://developers.cloudflare.com/email-service/reference/headers/)・[Workers AI の reranker](https://developers.cloudflare.com/workers-ai/models/bge-reranker-base/)・[GitHub Issues](https://docs.github.com/en/rest/issues/issues)
