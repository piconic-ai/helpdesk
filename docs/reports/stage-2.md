# 段階2　拡張と機械クライアント

F02-AC1〜6、F03 の全条件、F04-AC1〜3、F05-AC1、F06-AC1〜3 を自動検証しました。未完の条件はありません。

- 受付・画面・操作一覧の有効化と無効化、設定エラー、権限拒否、配送失敗の表示と再試行を確認しました。失敗した購読処理の再配送後も元の出来事が残りました。
- 認証した MCP クライアントから一覧を取得し、返信を承認待ちにできました。閲覧用トークンでの書き込みは拒否されました。CLI は実プロセスの標準出力・標準エラー・終了コードを検査しました。
- フォームから受付番号を取得し、定型返信を選ぶと相手名とプロダクト名が入った下書きができました。公開入口はキー、Origin、回数を検査します。
- GitHub 通信を置き換え、確認済みの内容、同じ issue への複数会話の紐づけ、完了後の下書きの重複防止を確認しました。実リポジトリの権限と接続、実際の Turnstile は導入時に人が確認します。

## 検証

`pnpm format:check`、`pnpm build`、`pnpm exec tsc --noEmit`、`pnpm test:coverage`、`python3 scripts/check-docs.py`、`cccc .` が成功しました。全15ファイル167件が通り、文78.02%、分岐68.40%、関数80.80%、行80.05%でした。

## 設計と参照

最小の拡張は共通の登録口から操作を追加できます。導入者が判断するのは必要な拡張、公開 Origin、リポジトリ、認める権限です。[拡張の作り方](../dev/extensions.md)・[設計上の決定](../decisions.md)・[CLI と MCP の使い方](../dev/machine-access.md)

[MCP Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)・[公式 TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)・[Cloudflare MCP transport](https://developers.cloudflare.com/agents/model-context-protocol/transport/)・[Turnstile の検証](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)・[GitHub Issues](https://docs.github.com/en/rest/issues/issues)・[Issue comments](https://docs.github.com/en/rest/issues/comments)
