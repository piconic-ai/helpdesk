# 段階4　セルフホストと全体の検証

空のローカル環境から手順書のコマンドを順に実行し、最初の管理者と窓口を登録しました。サンプルメールが受信箱に1件現れ、読み取りトークンで会話・メッセージ・出来事を書き出せました。[セルフホスト手順](../dev/self-hosting.md)

## 段階4の受け入れ条件

| 条件 | 自動で確認した結果 |
|---|---|
| F20-AC1 | 一時ディレクトリに依存関係をインストールし、ビルド、空の D1 への migration、Wrangler の起動、窓口登録、CLI 診断、メール受信、マスク済み JSON Lines の内容確認まで成功 |
| F20-AC2 | 必須の DB・RAW・JOBS・EMAIL・ASSETS を個別に欠いたときに binding 名と Wrangler の修正箇所を表示。チャットを有効にしたときは AI も検査。CLI からも設定エラーを確認 |
| F20-AC3 | 文書中の binding、変数、リソース作成名、migration、スクリプトと実ファイルの対応を検査。ローカルのコマンドは手順書から読み取って実行 |
| F20-AC4 | 初回の設定画面で窓口と送信ドメインの不足を確認。読み取りトークンの `doctor` は送信ドメイン不足で終了コード1を返し、設定後は `ready: true` と終了コード0を返した |

英語版と日本語版の README に導入手順へのリンクを用意しました。拡張ガイドには、最小の拡張を登録して画面と CLI から試す例と、同梱拡張の実装例があります。[English README](../../README.md)・[日本語 README](../../README.ja.md)・[拡張開発](../dev/extensions.md)

## 段階1から4までの結果

| 段階 | 受け入れ条件と到達点 |
|---|---|
| 1 | F01-AC1〜31。実際のローカルメール入口から受信し、ブラウザで返信・再受信・完了まで操作。保存、権限、重複防止、削除を検証。[段階1報告](stage-1.md) |
| 2 | F02〜F05 と F06-AC1〜3。拡張登録、フォーム、定型返信、GitHub issue、権限付き HTTP API・CLI・MCP を検証。[段階2報告](stage-2.md) |
| 3 | F06-AC4 と F07〜F19。全16拡張の仕様を揃え、指標、公開記事、チャット、アンケート、会話の整理と書き出しを検証。[段階3報告](stage-3.md) |
| 4 | F20-AC1〜4。初めての管理者が手順書から窓口を開き、不足した設定を診断できることをローカルで確認。 |

計画した20機能の受け入れ条件92項目を完了し、未完の機能はありません。初回の本番導入と外部サービスを使う確認は導入先に残しています。[受け入れ条件の進捗](../plan/PROGRESS.md)

## 最終検証

| コマンド | 結果 |
|---|---|
| `pnpm format:check` | 成功 |
| `pnpm build` | Vite、UnoCSS、Wrangler の Worker バンドル生成と deploy の dry-run が成功 |
| `pnpm exec tsc --noEmit` | 型エラー0件 |
| `pnpm test:coverage` | 24ファイル212件が成功。文84.69%、分岐76.26%、関数88.02%、行87.07% |
| `python3 scripts/check-docs.py` | 20機能の仕様、英日 README を含むリンク、JSON、手順のコマンドと設定を確認 |
| `cccc .` | 関数の Cognitive Complexity は最大15 |
| `node scripts/test-stage1-matrix.mjs` | 全拡張有効・無効の両方で各63件が成功。段階1の受信・ブラウザ操作を含む |
| `python3 scripts/test-self-host.py` | 依存関係とローカルストレージを作り直し、手順書にある操作を完走。全体テストにも含めた |

受信直後のキュー障害は、キューが受理する前と受理後に応答だけが失われる場合の両方を再現しました。D1 に受信処理を予約し、定期処理で再投入することで、どちらも原文を保ち、メッセージは1件になりました。書き出しでは引用符を含む相手名が履歴の JSON に残るケースを再現し、マスク後の値を再び JSON として読めることを確認しました。

既存データを D1 の全文検索索引に移行し、日本語・記号・短い語の部分一致と、統合前の会話を検索できることを確認しました。保存期間満了や相手の削除後は、該当する本文が索引からも消えます。[検索の移行試験](../../tests/search.test.ts)・[D1 の対応拡張](https://developers.cloudflare.com/d1/sql-api/sql-statements/)

## 決めたことと人の確認

- 通常の `doctor` は登録済みの窓口と `SENDING_DOMAINS` の宣言を照合します。任意の `--live` は運営者の端末から Cloudflare の送信設定を読みます。ページ分割・権限拒否・無効ドメインには模擬応答を使いました。実際のアカウントでの照合は導入先で実施してください。[設計上の決定](../decisions.md)
- 送信結果の Message-ID を保存し、受理結果が不明な送信は自動再送を止めます。実運用では送信履歴を照合してください。実宛先への到達、迷惑メール判定、SPF・DKIM・DMARC、Gmail・Outlook・iPhone でのスレッド表示は人の確認事項です。[メール運用の判断](../decisions.md)
- 所有者がドメイン、Access の初期許可対象、Email Routing と送信ドメイン、Queues の配信と失敗時の運用、Workers AI の利用枠・費用を確認してください。GitHub、Webhook、Turnstile は、使う拡張だけ実際の権限と接続を検証してください。[導入時の設定](../dev/self-hosting.md)
- 実際の記事を使った日本語チャットの案内精度、画面の文言とデザイン、作者以外の人がガイドだけで導入できるかは実利用者の確認事項です。リポジトリの公開範囲とライセンスは所有者の判断に残しています。
- 本番へのデプロイ、DNS やアカウントの変更、実在の相手への送信と issue 起票は実施していません。本番反映時は、設定をコミットして push し、リモートと一致する SHA のクリーンなチェックアウトから承認済みの migration と deploy を実行してください。運用記録には SHA、push 結果、デプロイ結果と最終作業ツリー状態を残します。[初回デプロイと更新手順](../dev/self-hosting.md)

料金と設定の根拠は、[Email Service の料金](https://developers.cloudflare.com/email-service/platform/pricing/)、[受信](https://developers.cloudflare.com/email-service/get-started/route-emails/)、[送信ドメイン](https://developers.cloudflare.com/email-service/get-started/send-emails/)、[Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) を参照しました。D1・R2・Queues の料金と接続先は[セルフホスト手順](../dev/self-hosting.md)に掲載しています。
