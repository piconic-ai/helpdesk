# 問い合わせ対応・フィードバック・課題の画面

[画面ごとの変更前後](index.html)では、運営画面、公開窓口、部品見本を含めて、98の画面・状態を375・1024・1440pxで比較できる。変更前は `bff62c3`。新設した課題の追加・詳細は、当時の Worker で同じ URL を開いた結果を載せた。その他の変更前画像には、そのコミットで回帰検証済みの画像を用いた。

| 確認したこと | ブラウザーで読む・試す箇所 |
| --- | --- |
| 画面全体の余白 | 集計の上段と下段、アカウントの入力から保存、会話の記録と返信欄、拡張の見出しとカード。画面の親要素が間隔を持つ。[集計画面](index.html#extension-metrics) |
| 問い合わせへの返信 | 通常の送信は5秒間取り消せる。完了を伴う送信を取り消したときも本文が戻る。承認待ちの返信では宛先と内容を確認する。[返信欄](index.html#composer-typing) |
| フィードバック | 利用者は連絡先を空のまま送信できる。運営者は一覧で確認済みにして元に戻せる。問い合わせへの変更には返信先が必要。[一覧](index.html#feedback-list) |
| 課題の管理 | 通知待ち、声が多い未解決の課題、修正した結果の順に読む。課題を開いて、誰に知らせたかと期間別の件数を確認する。[一覧](index.html#issues-board) · [詳細](index.html#issue-detail) |
| 日常の仕事がつながること | [5つのワークフローとテスト](../workflows.md) · [操作手順](../../hands-on.md) |

この段階の画像は、計画5を反映したコミットで `pnpm build` を実行したあと、次の手順で再現できる。

```sh
HELPDESK_DAILY_CAPTURE=docs/reports/ux-5/after pnpm test:ui
HELPDESK_GALLERY_CAPTURE=docs/reports/ux-5/after node tests/ui/gallery-capture.mjs
node tests/ui/compare-captures.mjs docs/reports/ux-5 docs/reports/ux-5/before docs/reports/ux-5/after
```
