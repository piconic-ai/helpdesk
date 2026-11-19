# プロダクト・相手・状態の識別

[画面の変更前後](index.html)で、運営画面、公開窓口、部品見本を375・1024・1440pxで比較できる。変更前のコミットは `d8bd7c8`。新設の「ラベルの色」は、同じURLが変更前に返していた404画面と比較した。

| 操作 | 確認できること |
| --- | --- |
| [プロダクトを切り替える](index.html#product-switcher) | 名前と角丸のマークが候補に並ぶ。未設定のマークは名前の頭文字から自動で作られる。 |
| [アイコンを変更する](index.html#product-icon-settings) | 画像または絵文字を設定すると、運営画面・公開窓口・公開ページのfaviconに同じマークが出る。[画像](index.html#product-image)・[絵文字](index.html#product-emoji) |
| [受信箱を開く](index.html#inbox) | 相手・経路・待ち時間がそれぞれ決まった場所に出る。既読は閲覧した運営者ごとに保存される。 |
| [ラベルの色を選ぶ](index.html#label-colors) | 同じラベルが一覧・会話・絞り込みに同じ点で表示される。 |
| [解決時間の推移を見る](index.html#metrics-trends) | 7週間の例示データを同じ設定で集計した。平均を計算できない期間では線が途切れる。[声の内訳](index.html#voices-trends)では同じ分類内で最多の件数が最も長い棒になる。 |

識別色と記号の対応は[デザイン指針](../../../DESIGN.md)に記した。自動検査は、[2人の運営者による未読管理](../../../tests/ux/inbox-identity.pw.mjs)、[製品アイコンの変更](../../../tests/ux/product-icon.pw.mjs)、[時系列と課題状態](../../../tests/ux/metric-trends.pw.mjs)、[拡張の記号](../../../tests/ux/extension-symbols.pw.mjs)を実際のローカルWorkerとブラウザーで確認する。
