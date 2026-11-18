# 設計上の決定

- 問い合わせ番号は D1 がデプロイ全体で採番する。表示は `#123`、件名は `[#123]` とする。既定値として実装する。
- 初回の運営者登録と権限の決定は同じ SQL 文で行う。Access の発行元、宛先、署名、有効期限とメールアドレスを検証する。[Access JWT の検証](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- 送信結果の Message-ID を保存し、返信には元メールの In-Reply-To と References を設定する。Cloudflare が受理したか不明な送信を自動で再試行すると二重送信になり得るため、確実に失敗した送信だけを再送対象とする。[送信 API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)・[ヘッダー](https://developers.cloudflare.com/email-service/reference/headers/)

- Workers 上で postal-mime の解析と mimetext の MIME 組み立てを確認した。本番の送信は構造化 binding に本文を渡し、サービスに MIME の生成を委ねる。受信は先に原文を非公開の R2 に置き、キューで解析する。[受信ハンドラー](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/)・[R2 の API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)・[キューの再配送](https://developers.cloudflare.com/queues/configuration/batching-retries/)・[D1 の batch](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- 保存期間は既定で無期限とし、検索は件名・相手・本文の部分一致を採用した。本文と添付を削除する際は R2 のキーを D1 に一時記録し、中断後は定期処理から削除を再開する。
- ローカル開発者は環境名とアドレスの両方を指定する。非ローカル環境で開発用アドレスを検出した場合は要求を拒否する。

- MCP は公式 TypeScript SDK の stateless Streamable HTTP を採用した。CLI と MCP は同じトークンと操作の定義を使う。発行した秘密は一度だけ表示し、D1 にはダイジェストを保存する。[MCP transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)・[Cloudflare の transport](https://developers.cloudflare.com/agents/model-context-protocol/transport/)
- 段階2で受付、操作、出口を各1種類実装した。権限を実行時に検査する context、各拡張のストレージ、パネルの選択肢とリンクを共通の口に追加した。issue を閉じた後に作る下書きには安定したキーを付け、定期処理の再実行による重複を防ぐ。
