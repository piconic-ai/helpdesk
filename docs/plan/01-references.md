# 読むものと技術スタック

実装の前に読むものと、使う技術を示します。

## 最初に読むもの

1. `docs/product.md`(プロダクト指針)と `docs/dev/architecture.md`(実装方針)。リポジトリにあれば読みます。無ければ、`docs/plan/` だけを根拠に進め、土台の作業の中で、`docs/plan/` の `00-overview.md`・`03-design.md`・`stage-2-extension-points.md`をもとに2つのファイルを書き起こしてください。
2. 公開リポジトリ `https://github.com/piconic-ai/slide`。同じ作者の別プロダクトで、helpdesk はその開発の決まりを引き継ぎます。作業用の別ディレクトリに clone して、次を読んでください。
   - `AGENTS.md`、`docs/dev/architecture.md`、`docs/dev/planning.md`、`docs/dev/development.md`
   - `docs/features/` の仕様(書式の実例)
   - `scripts/layers.mjs`、`scripts/layers.test.mjs`、`scripts/check-docs.py`
   - `cccc.toml`、`vitest.config.ts`、`.github/workflows/ci.yml`、`package.json`
   - `src/publication/state.ts`、`src/publication/transitions.ts`(状態を union で持ち、遷移を純粋な関数にする実例)
   - `src/operator/access.ts`、`src/operator/access-client.ts`(Cloudflare Access の検証の実例)
   - `src/db/test-migrations.ts`、`src/operator/routes.test.ts`(ローカルの D1 と実際の HTTP を通すテストの実例)
   - `.agents/skills/`(作業の進め方)

slide のプロダクトのコードは写しません。開発の道具(層の検査、文書の検査、CI、整形、カバレッジと複雑度の基準)と書き方は、helpdesk に合わせて移植します。

`docs/plan/` と、`docs/` のほかの内容が食い違ったときは、`docs/plan/` を優先し、食い違いを `docs/decisions.md` に書いてください。

## 技術スタック

| 役割 | 使うもの |
|---|---|
| 実行環境 | Cloudflare Workers + Hono。Worker は1つで、`fetch`・`email`・`queue`・`scheduled` の入口を持つ |
| データ | D1 + drizzle-orm。行の型と検証スキーマは drizzle-zod でテーブル定義から導く。検証は zod |
| ファイル | 非公開の R2(受信メールの原文、添付) |
| 受信 | Email Routing → Email Worker |
| 送信 | Cloudflare Email Service の送信(Workers の binding)。ベータ |
| 非同期 | Queues(受信後の解析、送信、出口への配送)、Cron Triggers(保存期間、再試行) |
| 画面 | BarefootJS(slide と同じ使い方)。CSS は slide と同じ道具 |
| 判断 | Workers AI |
| 検査 | Vitest、Playwright、fast-check、oxfmt、tsc、cccc |

Cloudflare の API(Email Workers、送信の binding、Queues、D1、Workers AI、Access)と MCP は、**記憶で書かず、実装の前に現在の公式ドキュメントを読んでください**。特に送信はベータで、API が変わっている可能性があります。読んだページの URL を `docs/decisions.md` に残します。

メールの解析と組み立ては自分で書きません。候補は `postal-mime`(解析)と `mimetext`(組み立て)です。Workers 上で動くことを先に小さく確かめ、動かなければ代わりを選んで記録します。BarefootJS の API は `pnpm exec bf docs` と `pnpm exec bf guide` で調べます。製品名の表記は「BarefootJS」です。
