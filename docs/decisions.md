# 設計上の決定

- 問い合わせ番号は D1 がデプロイ全体で採番する。表示は `#123`、件名は `[#123]` とする。既定値として実装する。
- 初回の運営者登録と権限の決定は同じ SQL 文で行う。Access の発行元、宛先、署名、有効期限とメールアドレスを検証する。[Access JWT の検証](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- 送信結果の Message-ID を保存し、返信には元メールの In-Reply-To と References を設定する。Cloudflare が受理したか不明な送信を自動で再試行すると二重送信になり得るため、確実に失敗した送信だけを再送対象とする。[送信 API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)・[ヘッダー](https://developers.cloudflare.com/email-service/reference/headers/)

- Workers 上で postal-mime の解析と mimetext の MIME 組み立てを確認した。本番の送信は構造化 binding に本文を渡し、サービスに MIME の生成を委ねる。受信は先に原文を非公開の R2 に置き、キューで解析する。[受信ハンドラー](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/)・[R2 の API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)・[キューの再配送](https://developers.cloudflare.com/queues/configuration/batching-retries/)・[D1 の batch](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- 保存期間は既定で無期限とし、検索は件名・相手・本文の部分一致を採用した。本文と添付を削除する際は R2 のキーを D1 に一時記録し、中断後は定期処理から削除を再開する。
- ローカル開発者は環境名とアドレスの両方を指定する。非ローカル環境で開発用アドレスを検出した場合は要求を拒否する。

- MCP は公式 TypeScript SDK の stateless Streamable HTTP を採用した。CLI と MCP は同じトークンと操作の定義を使う。発行した秘密は一度だけ表示し、D1 にはダイジェストを保存する。[MCP transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)・[Cloudflare の transport](https://developers.cloudflare.com/agents/model-context-protocol/transport/)
- 段階2で受付、操作、出口を各1種類実装した。権限を実行時に検査する context、各拡張のストレージ、パネルの選択肢とリンクを共通の口に追加した。issue を閉じた後に作る下書きには安定したキーを付け、定期処理の再実行による重複を防ぐ。

## 段階3の拡張契約

自動送信、一覧での保留、古い番号の解決、公開記事の閲覧、記事選択の判断、指標用の出来事の読み取りが必要になった。既存のフォーム・定型返信・issue 拡張の契約を保持し、追加の口は用途ごとに選択して使う。送信には `send` 権限と運営者が有効化した方針を必要とする。公開画面は運営者向けの認証から独立し、公開用のデータだけを返す。書き出しの既定値では自由記述に含まれる相手の情報も伏せる。

- スヌーズの期限はタイムゾーン付き ISO 8601 で受け取り、一覧取得時の時刻と比較する。期限どおりに再表示でき、定期ジョブの実行間隔に依存しない。
- 会話の統合は相手と窓口の両方が一致するときに許可する。元の番号と出来事を保存し、検索・表示・受信時に統合先の番号を解決する。同時に矛盾する統合が要求された場合は、一方の更新を拒否する。
- プレゼンスは5秒おきに更新し、最終更新から45秒経った表示を外す。返信欄への入力中はモードだけを送る。複数のタブを区別し、同じ運営者は1人として数える。

- 自動受付は最初の人間のメールだけを対象にし、運営者が窓口の登録または設定画面で有効化した方針を承認として記録する。迷惑メールの判定を受付返信側でも適用し、出口の配送順に依存しない。
- 統合は同じ窓口・相手に限る。スヌーズの時刻は UTC、プレゼンスは5秒ごとに更新し45秒で失効する。作業時間 F は画面で閲覧した運営者が返信をキューに入れたときに計上する。
- チャットは公開記事を Workers AI の reranker で採点し、既定の閾値0.6以上の記事を最大3件提示する。本文の生成は行わない。[モデルの公式仕様](https://developers.cloudflare.com/workers-ai/models/bge-reranker-base/)
- 配送待ちの行にキュー投入の有効期限を記録する。全拡張を動かした受信テストで、並列コンシューマーによる同じイベントの過剰な再投入を検出したため。投入後に停止した場合は期限後に再開できる。
