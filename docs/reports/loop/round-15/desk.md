# 受信箱・会話の画面確認

114状態の原画像342枚を確認しました。各状態を375×812・1024×900・1440×900の順に横に並べて比較し、文字の省略、メニューの起点、入力欄や確認操作の位置は該当する原画像でも確認しました。件数は同じ操作・表示に由来する指摘を一件にまとめたものです。状態ごとの問いは、画面内に根拠がある答えと、写っていない部分を区別しました。

## 改善点

| 重さ | 画面と起きていること | あるべき姿・判定の理由 | 画像 |
|---|---|---|---|
| 高 | 会話 #5 の課題起票。375pxでは入力面が画面の中ほどから下へ開き、要約欄の途中で切れる。「起票内容を確認」と「入力を閉じる」の両方が暗幕のかかった画面内に見えない。 | 公開内容を扱う場面で、入力後に確認へ進む・中止するという両方の出口を見える位置に置く。1024pxで表示される操作に375pxでは手がかりがなく、「つながり」「幅」の作業停止相当。スクロールで回復するかは未確認。 | [menu-conversation-5-operation-issues-issues.preview・375px](screens/menu-conversation-5-operation-issues-issues.preview-375.png) · [menu-conversation-5-operation-issues-issues.preview・1024px](screens/menu-conversation-5-operation-issues-issues.preview-1024.png) · [menu-conversation-5-operation-issues-issues.preview・1440px](screens/menu-conversation-5-operation-issues-issues.preview-1440.png) |
| 中 | 会話 #2 と #4 の担当者・ラベルメニュー。375pxでは起点の文字が固定ツールバーの裏に入り、候補だけがツールバー直下に現れる。 | 展開したボタン名と候補を一緒に表示する。「どのボタンのメニューか分からない」の見本に該当。 | [menu-conversation-2-thread-assignee・375px](screens/menu-conversation-2-thread-assignee-375.png) · [menu-conversation-2-thread-labels・375px](screens/menu-conversation-2-thread-labels-375.png) · [menu-conversation-4-thread-assignee・375px](screens/menu-conversation-4-thread-assignee-375.png) · [menu-conversation-4-thread-labels・375px](screens/menu-conversation-4-thread-labels-375.png) · [menu-conversation-4-thread-assignee・1024px](screens/menu-conversation-4-thread-assignee-1024.png) |
| 中 | 一覧の先頭 #11。375pxで長い差出人名が太字で2行になり、件名は「部門ごとに宛名の異なる領収書を…」で切れる。1024pxでも件名は「部門ごとに宛名の異なる領…」まで。 | 要件の中心が読める件名の幅を確保し、長い所属名を縮める。「一覧の行が読み下せる順になっていない」「省略された言葉」の基準。 | [inbox・375px](screens/inbox-375.png) · [inbox・1024px](screens/inbox-1024.png) · [all-inbox・1440px](screens/all-inbox-1440.png) |
| 中 | 全状態の受信箱。1440pxで #8・#9 の時刻・担当者の右端だけが他の8行より約38px右へずれる。 | 状態や利用できる行操作にかかわらず、時刻と担当者を同じ列に固定する。件数の多い一覧で行ごとに見る位置が変わり、「揃え」に抵触する。 | [all-inbox・1440px](screens/all-inbox-1440.png) · [all-inbox・1024px](screens/all-inbox-1024.png) |
| 中 | 検索待ち。「領収書」と入力済みで一覧が灰色3本に変わった後も「未対応 7件」が確定件数と同じ黒文字のまま。 | 読み込み中に表示する件数が前の一覧の件数なのか、現在の検索の結果なのか判別できるようにする。表示済みの結果と未確定の結果が同じ見た目になり、「状態」に抵触する。 | [inbox-loading・375px](screens/inbox-loading-375.png) · [inbox-loading・1024px](screens/inbox-loading-1024.png) · [inbox・375px](screens/inbox-375.png) |
| 中 | 返信の送信結果が分からない場合、375pxでは赤いお知らせが画面中ほどで元の問い合わせ本文を覆う。1024/1440pxでは画面下部で、元の文・入力文を並べて読める。 | 再送の前に会話を確認するよう案内しているので、参照すべき本文を表示したまま復旧操作を選べる位置に置く。DESIGNの通知位置と「知らせ」「場所」に該当。 | [composer-failed・375px](screens/composer-failed-375.png) · [composer-failed・1024px](screens/composer-failed-1024.png) · [composer-failed・1440px](screens/composer-failed-1440.png) |
| 中 | 会話 #7 の課題 #42。比較できる対象がこの1件だけで「修正前の件数のみ確認できます」と明記しているのに、操作名は「修正前後の件数を比較」。 | 選んだ課題で確認できる方に合わせて、操作を「修正前の件数を確認」と表示する。頻繁に使う判断画面で期待する結果が操作名と矛盾し、「言葉」「知らせ」の基準に抵触する。 | [menu-conversation-7-operation-issues-issues.impact・375px](screens/menu-conversation-7-operation-issues-issues.impact-375.png) · [menu-conversation-7-operation-issues-issues.impact・1024px](screens/menu-conversation-7-operation-issues-issues.impact-1024.png) · [menu-conversation-7-operation-issues-issues.impact・1440px](screens/menu-conversation-7-operation-issues-issues.impact-1440.png) |
| 低 | 1024pxで左ナビに似た棒グラフが2つ並び、下の表示名は「対応状況」。1440pxで初めて「対応状況の集計」と読める。 | 縮小したナビでも遷移先が会話処理か集計かを区別できる表記にする。基準「文字・言葉」。アイコンと短い名前は残り、作業への入口は確認できる。 | [inbox・1024px](screens/inbox-1024.png) · [inbox・1440px](screens/inbox-1440.png) |

**共通原因単位で高1件・中6件・低1件です。** 高は撮影時の画面で確認・中止ともに見えないことへの判定です。公開操作自体の成功・失敗は未判定です。送信承認の前後は同じ幅で背景の受信カード、操作列、入力枠の位置が一致しました。黄色い内部メモには非送信の明示があり、橙の承認待ちと赤の配送失敗も色と文言の両方で識別できます。

## 状態別の確認

運営者が開く目的と、対象・操作・結果や見え方に関する具体的な問いを各状態で三つ記載します。各画像リンクはその状態を撮影した原寸画像です。番号はこの表の行番号です。

### 1. all-inbox

運営者が全件から先に対応する会話を探すために開きます。

1. 何件どの順か？ 10件を待たせている順に表示。
2. 要注意の会話は？ #5 に別返信の承認待ち、#4 に送信失敗。
3. 時刻と担当を縦に追えるか？ 1440pxでは末尾2行の右端がずれる。

[375px](screens/all-inbox-375.png) · [1024px](screens/all-inbox-1024.png) · [1440px](screens/all-inbox-1440.png)

### 2. approval-confirm

運営者がエージェントの返信を承認して送るために開きます。

1. 誰に届くか？ customer5@example.net。
2. 何が届くか？ 更新時のメンバー数変更と希望人数を尋ねる本文。
3. やめられるか？ キャンセルと黒い「承認して送信」が並ぶ。

[375px](screens/approval-confirm-375.png) · [1024px](screens/approval-confirm-1024.png) · [1440px](screens/approval-confirm-1440.png)

### 3. approval-list

運営者が承認待ちだけを処理するために開きます。

1. 対象は何件か？ 1件。
2. 相手の文と区別できるか？ #5 の抜粋に「下書き」、橙の「承認待ち」がある。
3. 何の会話か？ 山田花さんのチームプランの契約更新。

[375px](screens/approval-list-375.png) · [1024px](screens/approval-list-1024.png) · [1440px](screens/approval-list-1440.png)

### 4. composer-empty

運営者が領収書の相談に返信を書き始めるために開きます。

1. 返信先は？ 広い幅で support@example.com から customer1@example.net。
2. 何を入力するか？ 「返信を入力」とある空欄。
3. 空で送れる見た目か？ 広い幅の送信は淡色、375pxは「返信の操作を開く」にまとめる。

[375px](screens/composer-empty-375.png) · [1024px](screens/composer-empty-1024.png) · [1440px](screens/composer-empty-1440.png)

### 5. composer-failed

運営者が結果不明の返信を二重送信せずに確認するために開きます。

1. 何が起きたか？ 送信結果を確認できず、本文は保持したと赤帯が案内。
2. 次に何をするか？ 別タブで送信結果を確認、または最新の会話を読み直す。
3. 保持した文と会話を見比べられるか？ 375pxは赤帯が元の本文に被る。

[375px](screens/composer-failed-375.png) · [1024px](screens/composer-failed-1024.png) · [1440px](screens/composer-failed-1440.png)

### 6. composer-note

運営者が経理への確認を内部メモとして残すために開きます。

1. 誰に届くか？ 黄色の入力面に「相手には送られません」。
2. 何を記録するか？ 次回請求日までの経理担当への確認。
3. どう確定するか？ 「メモを残す」が黒い主ボタン。

[375px](screens/composer-note-375.png) · [1024px](screens/composer-note-1024.png) · [1440px](screens/composer-note-1440.png)

### 7. composer-sending

運営者が返信処理の進行状況を確認するために開きます。

1. 何を処理中か？ 領収書の再発行手順を案内する返信。
2. 二重に押せる見た目か？ 末尾ボタンが淡色の「送信中…」。
3. 相手に届いたか？ 到達を示す表示はなく、画面は処理中。

[375px](screens/composer-sending-375.png) · [1024px](screens/composer-sending-1024.png) · [1440px](screens/composer-sending-1440.png)

### 8. composer-typing

運営者が記入した領収書への返信を送るために開きます。

1. 編集箇所は？ 青枠の本文欄。
2. 相手は？ 宛先表示に customer1@example.net。
3. 完了も同時にできるか？ 「送信して完了」と黒い「送信」が並ぶ。

[375px](screens/composer-typing-375.png) · [1024px](screens/composer-typing-1024.png) · [1440px](screens/composer-typing-1440.png)

### 9. inbox

運営者が未対応の問い合わせを順にさばくために開きます。

1. 何件か？ 7件。
2. 最長待ちは？ #11 が11時間待ち。
3. その要件を読めるか？ 長い差出人に押され、375/1024pxとも件名の末尾が欠ける。

[375px](screens/inbox-375.png) · [1024px](screens/inbox-1024.png) · [1440px](screens/inbox-1440.png)

### 10. inbox-empty

運営者が未対応がないことを確認して次へ進むために開きます。

1. 残件は？ 見出しに0件。
2. 空欄の意味は？ 「未対応の問い合わせはありません」。
3. 次に見られるものは？ 「すべての会話を見る」。

[375px](screens/inbox-empty-375.png) · [1024px](screens/inbox-empty-1024.png) · [1440px](screens/inbox-empty-1440.png)

### 11. inbox-failed

運営者が請求に関する配送失敗を見つけるために開きます。

1. 範囲は？ 「請求」を付けた未対応2件。
2. 失敗したのは？ #4 月額プランの明細。
3. どこで気づくか？ 抜粋横に赤い警告と「送信失敗」、#1には付かない。

[375px](screens/inbox-failed-375.png) · [1024px](screens/inbox-failed-1024.png) · [1440px](screens/inbox-failed-1440.png)

### 12. inbox-filter

運営者が自分のDesk担当分を処理するために開きます。

1. 対象は？ Deskと佐藤優の条件で1件。
2. どんな相談か？ #3 更新前の請求書の送付先。
3. 状況は？ 未対応、抜粋に内部メモと表示。

[375px](screens/inbox-filter-375.png) · [1024px](screens/inbox-filter-1024.png) · [1440px](screens/inbox-filter-1440.png)

### 13. inbox-loading

運営者が領収書の検索結果を待つために開きます。

1. 何を検索中か？ 青枠の欄に「領収書」。
2. 結果は出ているか？ 3本の灰色の帯で行の代わりを表示。
3. 表示件数は確定か？ 「未対応 7件」は残り、適用範囲を判断できない。

[375px](screens/inbox-loading-375.png) · [1024px](screens/inbox-loading-1024.png) · [1440px](screens/inbox-loading-1440.png)

### 14. loop-actions

運営者が会話を後で扱うか迷惑メールにするために開きます。

1. どこから開いたか？ 「その他の操作」の背景が青。
2. 後に回せるか？ 「スヌーズ」の展開項目。
3. 迷惑メールへの入口は？ 同じメニュー内に専用ボタン。

[375px](screens/loop-actions-375.png) · [1024px](screens/loop-actions-1024.png) · [1440px](screens/loop-actions-1440.png)

### 15. loop-assignee

運営者が領収書相談の担当者を決めるために開きます。

1. 今の担当は？ 「担当なし」にチェック。
2. 候補は？ 佐藤優と森直子。
3. どの会話に適用するか？ #1の属性列の担当者ボタン直下に開く。

[375px](screens/loop-assignee-375.png) · [1024px](screens/loop-assignee-1024.png) · [1440px](screens/loop-assignee-1440.png)

### 16. loop-bulk

運営者が複数の未対応会話を一度に処理するために開きます。

1. 対象は何件か？ 選択中2件。
2. どの行か？ #11と#7にチェックと淡青の面。
3. 選び直せるか？ 「選択を解除」が対象件数の隣にある。

[375px](screens/loop-bulk-375.png) · [1024px](screens/loop-bulk-1024.png) · [1440px](screens/loop-bulk-1440.png)

### 17. loop-bulk-assignee

運営者が選んだ2会話を同一担当者に割り振るために開きます。

1. 範囲は？ チェックされた2件。
2. 誰を選べるか？ 佐藤優と森直子。
3. どのボタンが展開中か？ 青枠の「担当者を選ぶ」直下に候補。

[375px](screens/loop-bulk-assignee-375.png) · [1024px](screens/loop-bulk-assignee-1024.png) · [1440px](screens/loop-bulk-assignee-1440.png)

### 18. loop-bulk-label

運営者が複数の会話に共通ラベルを付けるために開きます。

1. 全対象に付けるか？ 選択中のすべての会話に付くと説明。
2. 一部だけに付くラベルは？ 再発行・社内確認などに「−」がある。
3. 別のラベルを整備できるか？ 末尾に「ラベルを管理」。

[375px](screens/loop-bulk-label-375.png) · [1024px](screens/loop-bulk-label-1024.png) · [1440px](screens/loop-bulk-label-1440.png)

### 19. loop-filter-assignee

運営者が担当者で未対応一覧を絞るために開きます。

1. 現在は？ 「すべて」にチェック。
2. 個人を選べるか？ 佐藤優・森直子が候補。
3. 他条件は同時に読めるか？ 担当者の小メニューが親の下部に重なり、ラベル欄が隠れる。

[375px](screens/loop-filter-assignee-375.png) · [1024px](screens/loop-filter-assignee-1024.png) · [1440px](screens/loop-filter-assignee-1440.png)

### 20. loop-filter-empty

運営者が検索不一致から条件を見直すために開きます。

1. 何を探したか？ 「未回答の調査番号」。
2. 結果は？ 0件、虫眼鏡と不一致の説明。
3. 再開できるか？ 「絞り込みを解除」が空状態のすぐそばにある。

[375px](screens/loop-filter-empty-375.png) · [1024px](screens/loop-filter-empty-1024.png) · [1440px](screens/loop-filter-empty-1440.png)

### 21. loop-filters

運営者が未対応一覧の条件を確認するために開きます。

1. 選択状態は？ 状態が「未対応」。
2. 追加条件は？ プロダクト、担当者、ラベル。
3. 元リストへ戻れる場所は？ 一覧の上にポップオーバーが重なり起点が青い。閉じ操作の挙動は未確認。

[375px](screens/loop-filters-375.png) · [1024px](screens/loop-filters-1024.png) · [1440px](screens/loop-filters-1440.png)

### 22. loop-keyboard

運営者が受信箱のキーボード操作を調べるために開きます。

1. 行移動と開くキーは？ j/kとEnter。
2. 会話中の入力切替は？ rで返信、nで内部メモ。
3. 閉じ方は？ Escの説明と青枠の「閉じる」。

[375px](screens/loop-keyboard-375.png) · [1024px](screens/loop-keyboard-1024.png) · [1440px](screens/loop-keyboard-1440.png)

### 23. loop-labels

運営者が領収書相談のラベルを調整するために開きます。

1. 選択済みは？ 経理・請求・領収書にチェック。
2. 新設できるか？ 「新しいラベルを作成」。
3. 管理先は？ メニュー末尾に「ラベルを管理」。

[375px](screens/loop-labels-375.png) · [1024px](screens/loop-labels-1024.png) · [1440px](screens/loop-labels-1440.png)

### 24. loop-quick-actions

運営者が一覧の行から直接処理するために開きます。

1. 対象行は？ 最長待ちの#11に青枠。
2. どこに操作があるか？ 右端に担当追加・完了を表す二つの絵。
3. 操作名を読めるか？ この画像では文字の説明が表示されていない。

[375px](screens/loop-quick-actions-375.png) · [1024px](screens/loop-quick-actions-1024.png) · [1440px](screens/loop-quick-actions-1440.png)

### 25. loop-reply-preview

運営者が送る前に返信の宛先と内容を照合するために開きます。

1. 誰宛てか？ customer1@example.net。
2. 件名は？ 元の領収書の件名にReと会話番号。
3. 本文は？ 購入履歴から再発行できるという同じ文がプレビュー内にある。

[375px](screens/loop-reply-preview-375.png) · [1024px](screens/loop-reply-preview-1024.png) · [1440px](screens/loop-reply-preview-1440.png)

### 26. loop-reply-undo

運営者が完了予定の返信を必要なら取り消すために開きます。

1. 配信済みか？ 「送信待ちです」。
2. 会話はいつ閉じるか？ 送信後に完了と表示。
3. 戻せるか？ 緑の通知に「取り消す」。操作後の結果は静止画では不明。

[375px](screens/loop-reply-undo-375.png) · [1024px](screens/loop-reply-undo-1024.png) · [1440px](screens/loop-reply-undo-1440.png)

### 27. loop-status

運営者が領収書相談の状態を変えるために開きます。

1. 現在は？ メニュー内にも「未対応」。
2. 完了にできるか？ 「完了にする」がある。
3. 別の振り分けは？ 「迷惑メールにする」が同じメニューにある。

[375px](screens/loop-status-375.png) · [1024px](screens/loop-status-1024.png) · [1440px](screens/loop-status-1440.png)

### 28. menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest

運営者がメモ保存後に領収書の宛名変更をヘルプ記事の候補にするために開きます。

1. 元の相談は？ 入力枠の冒頭に#1「領収書の宛名変更」。
2. 何を書くか？ 青い枠の「記事にする内容」。
3. 書いた内容を誰に見せるか？ 記事候補への追加で、顧客宛て送信や公開のボタンはこの面にない。

[375px](screens/menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest-375.png) · [1024px](screens/menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest-1024.png) · [1440px](screens/menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest-1440.png)

### 29. menu-conversation-1-notice-note-82513194-operation-issues-issues.preview

運営者がメモ保存後に領収書の宛名変更をGitHub課題に起票するために開きます。

1. どこに公開するか？ 問い合わせ #1 から example/helpdesk に投稿する旨を表示。
2. どんな入力が必要か？ タイトルと公開する要約が別々の欄。
3. 公開前に確認できるか？ 「起票内容を確認」と「入力を閉じる」が入力面内にある。

[375px](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-375.png) · [1024px](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-1024.png) · [1440px](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-1440.png)

### 30. menu-conversation-1-notice-note-82513194-operation-merge-merge.combine

運営者がメモ保存後に領収書の宛名変更を別の会話にまとめるために開きます。

1. 統合元は？ #1「領収書の宛名変更」。
2. 統合先は？ 選択欄に #2「ワークスペースの招待メール」。
3. その場で確定するか？ 「この会話を統合する内容を確認」と予告する。

[375px](screens/menu-conversation-1-notice-note-82513194-operation-merge-merge.combine-375.png) · [1024px](screens/menu-conversation-1-notice-note-82513194-operation-merge-merge.combine-1024.png) · [1440px](screens/menu-conversation-1-notice-note-82513194-operation-merge-merge.combine-1440.png)

### 31. menu-conversation-1-notice-note-82513194-reply-templates

運営者がメモ保存後に領収書の宛名変更の返信に定型文を使うために開きます。

1. どの定型文か？ 「お問い合わせの受付」に丸印。
2. 差し込み先は？ 本文冒頭に Hello 山田 花、末尾に Slide。
3. 選択で送信されるか？ 表示される操作は「定型文から下書きを作成」。

[375px](screens/menu-conversation-1-notice-note-82513194-reply-templates-375.png) · [1024px](screens/menu-conversation-1-notice-note-82513194-reply-templates-1024.png) · [1440px](screens/menu-conversation-1-notice-note-82513194-reply-templates-1440.png)

### 32. menu-conversation-1-notice-note-82513194-thread-actions

運営者がメモ保存後に領収書の宛名変更の処理を後回しにするために開きます。

1. どこから開くか？ ツールバーの「その他の操作」に青枠。
2. 後に回す入口は？ 「スヌーズ」に展開用三角。
3. 他に何を選べるか？ 「迷惑メールにする」。

[375px](screens/menu-conversation-1-notice-note-82513194-thread-actions-375.png) · [1024px](screens/menu-conversation-1-notice-note-82513194-thread-actions-1024.png) · [1440px](screens/menu-conversation-1-notice-note-82513194-thread-actions-1440.png)

### 33. menu-conversation-1-notice-note-82513194-thread-assignee

運営者がメモ保存後に領収書の宛名変更の担当を決めるために開きます。

1. 現在の担当は？ 担当なしの行がチェック済み。
2. 誰に振れるか？ 佐藤優・森直子の候補に名前と色付きの丸。
3. どの属性に作用するか？ 青い担当欄の下に候補が並ぶ。

[375px](screens/menu-conversation-1-notice-note-82513194-thread-assignee-375.png) · [1024px](screens/menu-conversation-1-notice-note-82513194-thread-assignee-1024.png) · [1440px](screens/menu-conversation-1-notice-note-82513194-thread-assignee-1440.png)

### 34. menu-conversation-1-notice-note-82513194-thread-labels

運営者がメモ保存後に領収書の宛名変更のラベルを調整するために開きます。

1. 現状は？ 経理・請求・領収書にチェック。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. 候補が合わない場合は？ 下部に新しいラベルの作成と管理がある。

[375px](screens/menu-conversation-1-notice-note-82513194-thread-labels-375.png) · [1024px](screens/menu-conversation-1-notice-note-82513194-thread-labels-1024.png) · [1440px](screens/menu-conversation-1-notice-note-82513194-thread-labels-1440.png)

### 35. menu-conversation-1-notice-note-82513194-thread-status

運営者がメモ保存後に領収書の宛名変更の状態を確認・変更するために開きます。

1. 今の状態は？ 未対応の文字とアイコンが起点とメニュー内に出る。
2. 完了にできるか？ 先頭の「完了にする」が青い枠。
3. 他の行き先は？ 「迷惑メールにする」。

[375px](screens/menu-conversation-1-notice-note-82513194-thread-status-375.png) · [1024px](screens/menu-conversation-1-notice-note-82513194-thread-status-1024.png) · [1440px](screens/menu-conversation-1-notice-note-82513194-thread-status-1440.png)

### 36. menu-conversation-1-operation-articles-articles.suggest

運営者が領収書の宛名変更をヘルプ記事の候補にするために開きます。

1. 元の相談は？ 入力枠の冒頭に#1「領収書の宛名変更」。
2. 何を書くか？ 青い枠の「記事にする内容」。
3. 書いた内容を誰に見せるか？ 記事候補への追加で、顧客宛て送信や公開のボタンはこの面にない。

[375px](screens/menu-conversation-1-operation-articles-articles.suggest-375.png) · [1024px](screens/menu-conversation-1-operation-articles-articles.suggest-1024.png) · [1440px](screens/menu-conversation-1-operation-articles-articles.suggest-1440.png)

### 37. menu-conversation-1-operation-issues-issues.preview

運営者が領収書の宛名変更をGitHub課題に起票するために開きます。

1. どこに公開するか？ 問い合わせ #1 から example/helpdesk に投稿する旨を表示。
2. どんな入力が必要か？ タイトルと公開する要約が別々の欄。
3. 公開前に確認できるか？ 「起票内容を確認」と「入力を閉じる」が入力面内にある。

[375px](screens/menu-conversation-1-operation-issues-issues.preview-375.png) · [1024px](screens/menu-conversation-1-operation-issues-issues.preview-1024.png) · [1440px](screens/menu-conversation-1-operation-issues-issues.preview-1440.png)

### 38. menu-conversation-1-operation-merge-merge.combine

運営者が領収書の宛名変更を別の会話にまとめるために開きます。

1. 統合元は？ #1「領収書の宛名変更」。
2. 統合先は？ 選択欄に #2「ワークスペースの招待メール」。
3. その場で確定するか？ 「この会話を統合する内容を確認」と予告する。

[375px](screens/menu-conversation-1-operation-merge-merge.combine-375.png) · [1024px](screens/menu-conversation-1-operation-merge-merge.combine-1024.png) · [1440px](screens/menu-conversation-1-operation-merge-merge.combine-1440.png)

### 39. menu-conversation-1-reply-templates

運営者が領収書の宛名変更の返信に定型文を使うために開きます。

1. どの定型文か？ 「お問い合わせの受付」に丸印。
2. 差し込み先は？ 本文冒頭に Hello 山田 花、末尾に Slide。
3. 選択で送信されるか？ 表示される操作は「定型文から下書きを作成」。

[375px](screens/menu-conversation-1-reply-templates-375.png) · [1024px](screens/menu-conversation-1-reply-templates-1024.png) · [1440px](screens/menu-conversation-1-reply-templates-1440.png)

### 40. menu-conversation-1-thread-actions

運営者が領収書の宛名変更の処理を後回しにするために開きます。

1. どこから開くか？ ツールバーの「その他の操作」に青枠。
2. 後に回す入口は？ 「スヌーズ」に展開用三角。
3. 他に何を選べるか？ 「迷惑メールにする」。

[375px](screens/menu-conversation-1-thread-actions-375.png) · [1024px](screens/menu-conversation-1-thread-actions-1024.png) · [1440px](screens/menu-conversation-1-thread-actions-1440.png)

### 41. menu-conversation-1-thread-assignee

運営者が領収書の宛名変更の担当を決めるために開きます。

1. 現在の担当は？ 担当なしの行がチェック済み。
2. 誰に振れるか？ 佐藤優・森直子の候補に名前と色付きの丸。
3. どの属性に作用するか？ 青い担当欄の下に候補が並ぶ。

[375px](screens/menu-conversation-1-thread-assignee-375.png) · [1024px](screens/menu-conversation-1-thread-assignee-1024.png) · [1440px](screens/menu-conversation-1-thread-assignee-1440.png)

### 42. menu-conversation-1-thread-labels

運営者が領収書の宛名変更のラベルを調整するために開きます。

1. 現状は？ 経理・請求・領収書にチェック。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. 候補が合わない場合は？ 下部に新しいラベルの作成と管理がある。

[375px](screens/menu-conversation-1-thread-labels-375.png) · [1024px](screens/menu-conversation-1-thread-labels-1024.png) · [1440px](screens/menu-conversation-1-thread-labels-1440.png)

### 43. menu-conversation-1-thread-status

運営者が領収書の宛名変更の状態を確認・変更するために開きます。

1. 今の状態は？ 未対応の文字とアイコンが起点とメニュー内に出る。
2. 完了にできるか？ 先頭の「完了にする」が青い枠。
3. 他の行き先は？ 「迷惑メールにする」。

[375px](screens/menu-conversation-1-thread-status-375.png) · [1024px](screens/menu-conversation-1-thread-status-1024.png) · [1440px](screens/menu-conversation-1-thread-status-1440.png)

### 44. menu-conversation-10-operation-issues-issues.preview

運営者が運営画面のキーボード操作をGitHub課題に起票するために開きます。

1. どこに公開するか？ フィードバック #10 から example/helpdesk に投稿する旨を表示。
2. どんな入力が必要か？ タイトルと公開する要約が別々の欄。
3. 公開前に確認できるか？ 「起票内容を確認」と「入力を閉じる」が入力面内にある。

[375px](screens/menu-conversation-10-operation-issues-issues.preview-375.png) · [1024px](screens/menu-conversation-10-operation-issues-issues.preview-1024.png) · [1440px](screens/menu-conversation-10-operation-issues-issues.preview-1440.png)

### 45. menu-conversation-10-thread-labels

運営者が運営画面のキーボード操作のラベルを調整するために開きます。

1. 現状は？ チェック済みの行は見えず、先頭の再発行に青枠。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. 候補が合わない場合は？ 下部に新しいラベルの作成と管理がある。

[375px](screens/menu-conversation-10-thread-labels-375.png) · [1024px](screens/menu-conversation-10-thread-labels-1024.png) · [1440px](screens/menu-conversation-10-thread-labels-1440.png)

### 46. menu-conversation-2-operation-articles-articles.suggest

運営者がワークスペースの招待メールをヘルプ記事の候補にするために開きます。

1. 元の相談は？ 入力枠の冒頭に#2「ワークスペースの招待メール」。
2. 何を書くか？ 青い枠の「記事にする内容」。
3. 書いた内容を誰に見せるか？ 記事候補への追加で、顧客宛て送信や公開のボタンはこの面にない。

[375px](screens/menu-conversation-2-operation-articles-articles.suggest-375.png) · [1024px](screens/menu-conversation-2-operation-articles-articles.suggest-1024.png) · [1440px](screens/menu-conversation-2-operation-articles-articles.suggest-1440.png)

### 47. menu-conversation-2-operation-issues-issues.impact

運営者がワークスペースの招待メールに関連する修正の効果を調べるために開きます。

1. 対象の課題は？ #43 領収書の宛名変更。
2. どの期間を使うか？ 選択欄に30日間。
3. 何を比較できるか？ 「修正前後の件数を比較」がある。実際の比較結果はまだ表示されていない。

[375px](screens/menu-conversation-2-operation-issues-issues.impact-375.png) · [1024px](screens/menu-conversation-2-operation-issues-issues.impact-1024.png) · [1440px](screens/menu-conversation-2-operation-issues-issues.impact-1440.png)

### 48. menu-conversation-2-operation-issues-issues.preview

運営者がワークスペースの招待メールをGitHub課題に起票するために開きます。

1. どこに公開するか？ 問い合わせ #2 から example/helpdesk に投稿する旨を表示。
2. どんな入力が必要か？ タイトルと公開する要約が別々の欄。
3. 公開前に確認できるか？ 「起票内容を確認」と「入力を閉じる」が入力面内にある。

[375px](screens/menu-conversation-2-operation-issues-issues.preview-375.png) · [1024px](screens/menu-conversation-2-operation-issues-issues.preview-1024.png) · [1440px](screens/menu-conversation-2-operation-issues-issues.preview-1440.png)

### 49. menu-conversation-2-operation-merge-merge.combine

運営者がワークスペースの招待メールを別の会話にまとめるために開きます。

1. 統合元は？ #2「ワークスペースの招待メール」。
2. 統合先は？ 選択欄に #1「領収書の宛名変更」。
3. その場で確定するか？ 「この会話を統合する内容を確認」と予告する。

[375px](screens/menu-conversation-2-operation-merge-merge.combine-375.png) · [1024px](screens/menu-conversation-2-operation-merge-merge.combine-1024.png) · [1440px](screens/menu-conversation-2-operation-merge-merge.combine-1440.png)

### 50. menu-conversation-2-reply-templates

運営者がワークスペースの招待メールの返信に定型文を使うために開きます。

1. どの定型文か？ 「お問い合わせの受付」に丸印。
2. 差し込み先は？ 本文冒頭に Hello 山田 花、末尾に Slide。
3. 選択で送信されるか？ 表示される操作は「定型文から下書きを作成」。

[375px](screens/menu-conversation-2-reply-templates-375.png) · [1024px](screens/menu-conversation-2-reply-templates-1024.png) · [1440px](screens/menu-conversation-2-reply-templates-1440.png)

### 51. menu-conversation-2-thread-actions

運営者がワークスペースの招待メールの処理を後回しにするために開きます。

1. どこから開くか？ ツールバーの「その他の操作」に青枠。
2. 後に回す入口は？ 「スヌーズ」に展開用三角。
3. 他に何を選べるか？ 未対応に戻す、迷惑メールにする。

[375px](screens/menu-conversation-2-thread-actions-375.png) · [1024px](screens/menu-conversation-2-thread-actions-1024.png) · [1440px](screens/menu-conversation-2-thread-actions-1440.png)

### 52. menu-conversation-2-thread-assignee

運営者がワークスペースの招待メールの担当を決めるために開きます。

1. 現在の担当は？ 佐藤優の行がチェック済み。
2. 誰に振れるか？ 佐藤優・森直子の候補に名前と色付きの丸。
3. 起点の名前も見えるか？ 広い幅で担当欄直下、375pxはボタン文字が上部ツールバーに隠れる。

[375px](screens/menu-conversation-2-thread-assignee-375.png) · [1024px](screens/menu-conversation-2-thread-assignee-1024.png) · [1440px](screens/menu-conversation-2-thread-assignee-1440.png)

### 53. menu-conversation-2-thread-labels

運営者がワークスペースの招待メールのラベルを調整するために開きます。

1. 現状は？ チェック済みの行は見えず、先頭の再発行に青枠。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. どのボタンから開いたか読めるか？ 1024/1440pxはラベル欄、375pxは上部ツールバーが起点の文字を覆う。

[375px](screens/menu-conversation-2-thread-labels-375.png) · [1024px](screens/menu-conversation-2-thread-labels-1024.png) · [1440px](screens/menu-conversation-2-thread-labels-1440.png)

### 54. menu-conversation-2-thread-status

運営者がワークスペースの招待メールの状態を確認・変更するために開きます。

1. 今の状態は？ 返信待ちの文字とアイコンが起点とメニュー内に出る。
2. 完了にできるか？ 先頭の「完了にする」が青い枠。
3. 他の行き先は？ 未対応に戻す、迷惑メールにする。

[375px](screens/menu-conversation-2-thread-status-375.png) · [1024px](screens/menu-conversation-2-thread-status-1024.png) · [1440px](screens/menu-conversation-2-thread-status-1440.png)

### 55. menu-conversation-3-operation-articles-articles.suggest

運営者が請求書の送付先をヘルプ記事の候補にするために開きます。

1. 元の相談は？ 入力枠の冒頭に#3「請求書の送付先」。
2. 何を書くか？ 青い枠の「記事にする内容」。
3. 書いた内容を誰に見せるか？ 記事候補への追加で、顧客宛て送信や公開のボタンはこの面にない。

[375px](screens/menu-conversation-3-operation-articles-articles.suggest-375.png) · [1024px](screens/menu-conversation-3-operation-articles-articles.suggest-1024.png) · [1440px](screens/menu-conversation-3-operation-articles-articles.suggest-1440.png)

### 56. menu-conversation-3-operation-issues-issues.preview

運営者が請求書の送付先をGitHub課題に起票するために開きます。

1. どこに公開するか？ 問い合わせ #3 から example/desk に投稿する旨を表示。
2. どんな入力が必要か？ タイトルと公開する要約が別々の欄。
3. 公開前に確認できるか？ 「起票内容を確認」と「入力を閉じる」が入力面内にある。

[375px](screens/menu-conversation-3-operation-issues-issues.preview-375.png) · [1024px](screens/menu-conversation-3-operation-issues-issues.preview-1024.png) · [1440px](screens/menu-conversation-3-operation-issues-issues.preview-1440.png)

### 57. menu-conversation-3-reply-templates

運営者が請求書の送付先の返信に定型文を使うために開きます。

1. どの定型文か？ 「お問い合わせの受付」に丸印。
2. 差し込み先は？ 本文冒頭に Hello 森 海斗、末尾に Desk。
3. 選択で送信されるか？ 表示される操作は「定型文から下書きを作成」。

[375px](screens/menu-conversation-3-reply-templates-375.png) · [1024px](screens/menu-conversation-3-reply-templates-1024.png) · [1440px](screens/menu-conversation-3-reply-templates-1440.png)

### 58. menu-conversation-3-thread-actions

運営者が請求書の送付先の処理を後回しにするために開きます。

1. どこから開くか？ ツールバーの「その他の操作」に青枠。
2. 後に回す入口は？ 「スヌーズ」に展開用三角。
3. 他に何を選べるか？ 「迷惑メールにする」。

[375px](screens/menu-conversation-3-thread-actions-375.png) · [1024px](screens/menu-conversation-3-thread-actions-1024.png) · [1440px](screens/menu-conversation-3-thread-actions-1440.png)

### 59. menu-conversation-3-thread-assignee

運営者が請求書の送付先の担当を決めるために開きます。

1. 現在の担当は？ 佐藤優の行がチェック済み。
2. 誰に振れるか？ 佐藤優・森直子の候補に名前と色付きの丸。
3. どの属性に作用するか？ 青い担当欄の下に候補が並ぶ。

[375px](screens/menu-conversation-3-thread-assignee-375.png) · [1024px](screens/menu-conversation-3-thread-assignee-1024.png) · [1440px](screens/menu-conversation-3-thread-assignee-1440.png)

### 60. menu-conversation-3-thread-labels

運営者が請求書の送付先のラベルを調整するために開きます。

1. 現状は？ チェック済みの行は見えず、先頭の再発行に青枠。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. 候補が合わない場合は？ 下部に新しいラベルの作成と管理がある。

[375px](screens/menu-conversation-3-thread-labels-375.png) · [1024px](screens/menu-conversation-3-thread-labels-1024.png) · [1440px](screens/menu-conversation-3-thread-labels-1440.png)

### 61. menu-conversation-3-thread-status

運営者が請求書の送付先の状態を確認・変更するために開きます。

1. 今の状態は？ 未対応の文字とアイコンが起点とメニュー内に出る。
2. 完了にできるか？ 先頭の「完了にする」が青い枠。
3. 他の行き先は？ 「迷惑メールにする」。

[375px](screens/menu-conversation-3-thread-status-375.png) · [1024px](screens/menu-conversation-3-thread-status-1024.png) · [1440px](screens/menu-conversation-3-thread-status-1440.png)

### 62. menu-conversation-4-operation-articles-articles.suggest

運営者が月額プランの明細をヘルプ記事の候補にするために開きます。

1. 元の相談は？ 入力枠の冒頭に#4「月額プランの明細」。
2. 何を書くか？ 青い枠の「記事にする内容」。
3. 書いた内容を誰に見せるか？ 記事候補への追加で、顧客宛て送信や公開のボタンはこの面にない。

[375px](screens/menu-conversation-4-operation-articles-articles.suggest-375.png) · [1024px](screens/menu-conversation-4-operation-articles-articles.suggest-1024.png) · [1440px](screens/menu-conversation-4-operation-articles-articles.suggest-1440.png)

### 63. menu-conversation-4-operation-issues-issues.impact

運営者が月額プランの明細に関連する修正の効果を調べるために開きます。

1. 対象の課題は？ #44 請求明細のダウンロードと #42 領収書の一括ダウンロード。
2. どの期間を使うか？ 選択欄に30日間。
3. 何を比較できるか？ 「修正前後の件数を比較」がある。実際の比較結果はまだ表示されていない。

[375px](screens/menu-conversation-4-operation-issues-issues.impact-375.png) · [1024px](screens/menu-conversation-4-operation-issues-issues.impact-1024.png) · [1440px](screens/menu-conversation-4-operation-issues-issues.impact-1440.png)

### 64. menu-conversation-4-operation-issues-issues.preview

運営者が月額プランの明細をGitHub課題に起票するために開きます。

1. どこに公開するか？ 問い合わせ #4 から example/helpdesk に投稿する旨を表示。
2. どんな入力が必要か？ タイトルと公開する要約が別々の欄。
3. 公開前に確認できるか？ 「起票内容を確認」と「入力を閉じる」が入力面内にある。

[375px](screens/menu-conversation-4-operation-issues-issues.preview-375.png) · [1024px](screens/menu-conversation-4-operation-issues-issues.preview-1024.png) · [1440px](screens/menu-conversation-4-operation-issues-issues.preview-1440.png)

### 65. menu-conversation-4-reply-templates

運営者が月額プランの明細の返信に定型文を使うために開きます。

1. どの定型文か？ 「お問い合わせの受付」に丸印。
2. 差し込み先は？ 本文冒頭に Hello 渡辺 葵、末尾に Slide。
3. 選択で送信されるか？ 表示される操作は「定型文から下書きを作成」。

[375px](screens/menu-conversation-4-reply-templates-375.png) · [1024px](screens/menu-conversation-4-reply-templates-1024.png) · [1440px](screens/menu-conversation-4-reply-templates-1440.png)

### 66. menu-conversation-4-thread-actions

運営者が月額プランの明細の処理を後回しにするために開きます。

1. どこから開くか？ ツールバーの「その他の操作」に青枠。
2. 後に回す入口は？ 「スヌーズ」に展開用三角。
3. 他に何を選べるか？ 「迷惑メールにする」。

[375px](screens/menu-conversation-4-thread-actions-375.png) · [1024px](screens/menu-conversation-4-thread-actions-1024.png) · [1440px](screens/menu-conversation-4-thread-actions-1440.png)

### 67. menu-conversation-4-thread-assignee

運営者が月額プランの明細の担当を決めるために開きます。

1. 現在の担当は？ 佐藤優の行がチェック済み。
2. 誰に振れるか？ 佐藤優・森直子の候補に名前と色付きの丸。
3. 起点の名前も見えるか？ 広い幅で担当欄直下、375pxはボタン文字が上部ツールバーに隠れる。

[375px](screens/menu-conversation-4-thread-assignee-375.png) · [1024px](screens/menu-conversation-4-thread-assignee-1024.png) · [1440px](screens/menu-conversation-4-thread-assignee-1440.png)

### 68. menu-conversation-4-thread-labels

運営者が月額プランの明細のラベルを調整するために開きます。

1. 現状は？ 請求にチェック。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. どのボタンから開いたか読めるか？ 1024/1440pxはラベル欄、375pxは上部ツールバーが起点の文字を覆う。

[375px](screens/menu-conversation-4-thread-labels-375.png) · [1024px](screens/menu-conversation-4-thread-labels-1024.png) · [1440px](screens/menu-conversation-4-thread-labels-1440.png)

### 69. menu-conversation-4-thread-status

運営者が月額プランの明細の状態を確認・変更するために開きます。

1. 今の状態は？ 未対応の文字とアイコンが起点とメニュー内に出る。
2. 完了にできるか？ 先頭の「完了にする」が青い枠。
3. 他の行き先は？ 「迷惑メールにする」。

[375px](screens/menu-conversation-4-thread-status-375.png) · [1024px](screens/menu-conversation-4-thread-status-1024.png) · [1440px](screens/menu-conversation-4-thread-status-1440.png)

### 70. menu-conversation-5-operation-articles-articles.suggest

運営者がチームプランの契約更新をヘルプ記事の候補にするために開きます。

1. 元の相談は？ 入力枠の冒頭に#5「チームプランの契約更新」。
2. 何を書くか？ 青い枠の「記事にする内容」。
3. 書いた内容を誰に見せるか？ 記事候補への追加で、顧客宛て送信や公開のボタンはこの面にない。

[375px](screens/menu-conversation-5-operation-articles-articles.suggest-375.png) · [1024px](screens/menu-conversation-5-operation-articles-articles.suggest-1024.png) · [1440px](screens/menu-conversation-5-operation-articles-articles.suggest-1440.png)

### 71. menu-conversation-5-operation-issues-issues.impact

運営者がチームプランの契約更新に関連する修正の効果を調べるために開きます。

1. 対象の課題は？ #43 領収書の宛名変更。
2. どの期間を使うか？ 選択欄に30日間。
3. 何を比較できるか？ 「修正前後の件数を比較」がある。実際の比較結果はまだ表示されていない。

[375px](screens/menu-conversation-5-operation-issues-issues.impact-375.png) · [1024px](screens/menu-conversation-5-operation-issues-issues.impact-1024.png) · [1440px](screens/menu-conversation-5-operation-issues-issues.impact-1440.png)

### 72. menu-conversation-5-operation-issues-issues.preview

運営者がチームプランの契約更新をGitHub課題に起票するために開きます。

1. どこに公開するか？ 問い合わせ #5 から example/helpdesk に投稿する旨を表示。
2. どんな入力が必要か？ タイトルと公開する要約が別々の欄。
3. 確認や中止へ進めるか？ 1024/1440pxは両方表示、375pxは要約の途中で切れ、両方とも画面外。

[375px](screens/menu-conversation-5-operation-issues-issues.preview-375.png) · [1024px](screens/menu-conversation-5-operation-issues-issues.preview-1024.png) · [1440px](screens/menu-conversation-5-operation-issues-issues.preview-1440.png)

### 73. menu-conversation-5-reply-templates

運営者がチームプランの契約更新の返信に定型文を使うために開きます。

1. どの定型文か？ 「お問い合わせの受付」に丸印。
2. 差し込み先は？ 本文冒頭に Hello 山田 花、末尾に Slide。
3. 選択で送信されるか？ 表示される操作は「定型文から下書きを作成」。

[375px](screens/menu-conversation-5-reply-templates-375.png) · [1024px](screens/menu-conversation-5-reply-templates-1024.png) · [1440px](screens/menu-conversation-5-reply-templates-1440.png)

### 74. menu-conversation-5-thread-actions

運営者がチームプランの契約更新の処理を後回しにするために開きます。

1. どこから開くか？ ツールバーの「その他の操作」に青枠。
2. 後に回す入口は？ 「スヌーズ」に展開用三角。
3. 他に何を選べるか？ 「迷惑メールにする」。

[375px](screens/menu-conversation-5-thread-actions-375.png) · [1024px](screens/menu-conversation-5-thread-actions-1024.png) · [1440px](screens/menu-conversation-5-thread-actions-1440.png)

### 75. menu-conversation-5-thread-assignee

運営者がチームプランの契約更新の担当を決めるために開きます。

1. 現在の担当は？ 担当なしの行がチェック済み。
2. 誰に振れるか？ 佐藤優・森直子の候補に名前と色付きの丸。
3. どの属性に作用するか？ 青い担当欄の下に候補が並ぶ。

[375px](screens/menu-conversation-5-thread-assignee-375.png) · [1024px](screens/menu-conversation-5-thread-assignee-1024.png) · [1440px](screens/menu-conversation-5-thread-assignee-1440.png)

### 76. menu-conversation-5-thread-labels

運営者がチームプランの契約更新のラベルを調整するために開きます。

1. 現状は？ チェック済みの行は見えず、先頭の再発行に青枠。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. 候補が合わない場合は？ 下部に新しいラベルの作成と管理がある。

[375px](screens/menu-conversation-5-thread-labels-375.png) · [1024px](screens/menu-conversation-5-thread-labels-1024.png) · [1440px](screens/menu-conversation-5-thread-labels-1440.png)

### 77. menu-conversation-5-thread-status

運営者がチームプランの契約更新の状態を確認・変更するために開きます。

1. 今の状態は？ 未対応の文字とアイコンが起点とメニュー内に出る。
2. 完了にできるか？ 先頭の「完了にする」が青い枠。
3. 他の行き先は？ 「迷惑メールにする」。

[375px](screens/menu-conversation-5-thread-status-375.png) · [1024px](screens/menu-conversation-5-thread-status-1024.png) · [1440px](screens/menu-conversation-5-thread-status-1440.png)

### 78. menu-conversation-6-operation-articles-articles.suggest

運営者が購入後に届いたメールをヘルプ記事の候補にするために開きます。

1. 元の相談は？ 入力枠の冒頭に#6「購入後に届いたメール」。
2. 何を書くか？ 青い枠の「記事にする内容」。
3. 書いた内容を誰に見せるか？ 記事候補への追加で、顧客宛て送信や公開のボタンはこの面にない。

[375px](screens/menu-conversation-6-operation-articles-articles.suggest-375.png) · [1024px](screens/menu-conversation-6-operation-articles-articles.suggest-1024.png) · [1440px](screens/menu-conversation-6-operation-articles-articles.suggest-1440.png)

### 79. menu-conversation-6-operation-issues-issues.preview

運営者が購入後に届いたメールをGitHub課題に起票するために開きます。

1. どこに公開するか？ 問い合わせ #6 から example/helpdesk に投稿する旨を表示。
2. どんな入力が必要か？ タイトルと公開する要約が別々の欄。
3. 公開前に確認できるか？ 「起票内容を確認」と「入力を閉じる」が入力面内にある。

[375px](screens/menu-conversation-6-operation-issues-issues.preview-375.png) · [1024px](screens/menu-conversation-6-operation-issues-issues.preview-1024.png) · [1440px](screens/menu-conversation-6-operation-issues-issues.preview-1440.png)

### 80. menu-conversation-6-reply-templates

運営者が購入後に届いたメールの返信に定型文を使うために開きます。

1. どの定型文か？ 「お問い合わせの受付」に丸印。
2. 差し込み先は？ 本文冒頭に Hello 佐々木 葵、末尾に Slide。
3. 選択で送信されるか？ 表示される操作は「定型文から下書きを作成」。

[375px](screens/menu-conversation-6-reply-templates-375.png) · [1024px](screens/menu-conversation-6-reply-templates-1024.png) · [1440px](screens/menu-conversation-6-reply-templates-1440.png)

### 81. menu-conversation-6-thread-actions

運営者が購入後に届いたメールの処理を後回しにするために開きます。

1. どこから開くか？ ツールバーの「その他の操作」に青枠。
2. 後に回す入口は？ 「スヌーズ」に展開用三角。
3. 他に何を選べるか？ 「迷惑メールにする」。

[375px](screens/menu-conversation-6-thread-actions-375.png) · [1024px](screens/menu-conversation-6-thread-actions-1024.png) · [1440px](screens/menu-conversation-6-thread-actions-1440.png)

### 82. menu-conversation-6-thread-assignee

運営者が購入後に届いたメールの担当を決めるために開きます。

1. 現在の担当は？ 担当なしの行がチェック済み。
2. 誰に振れるか？ 佐藤優・森直子の候補に名前と色付きの丸。
3. どの属性に作用するか？ 青い担当欄の下に候補が並ぶ。

[375px](screens/menu-conversation-6-thread-assignee-375.png) · [1024px](screens/menu-conversation-6-thread-assignee-1024.png) · [1440px](screens/menu-conversation-6-thread-assignee-1440.png)

### 83. menu-conversation-6-thread-labels

運営者が購入後に届いたメールのラベルを調整するために開きます。

1. 現状は？ チェック済みの行は見えず、先頭の再発行に青枠。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. 候補が合わない場合は？ 下部に新しいラベルの作成と管理がある。

[375px](screens/menu-conversation-6-thread-labels-375.png) · [1024px](screens/menu-conversation-6-thread-labels-1024.png) · [1440px](screens/menu-conversation-6-thread-labels-1440.png)

### 84. menu-conversation-6-thread-status

運営者が購入後に届いたメールの状態を確認・変更するために開きます。

1. 今の状態は？ 未対応の文字とアイコンが起点とメニュー内に出る。
2. 完了にできるか？ 先頭の「完了にする」が青い枠。
3. 他の行き先は？ 「迷惑メールにする」。

[375px](screens/menu-conversation-6-thread-status-375.png) · [1024px](screens/menu-conversation-6-thread-status-1024.png) · [1440px](screens/menu-conversation-6-thread-status-1440.png)

### 85. menu-conversation-7-operation-articles-articles.suggest

運営者が添付した利用明細をヘルプ記事の候補にするために開きます。

1. 元の相談は？ 入力枠の冒頭に#7「添付した利用明細」。
2. 何を書くか？ 青い枠の「記事にする内容」。
3. 書いた内容を誰に見せるか？ 記事候補への追加で、顧客宛て送信や公開のボタンはこの面にない。

[375px](screens/menu-conversation-7-operation-articles-articles.suggest-375.png) · [1024px](screens/menu-conversation-7-operation-articles-articles.suggest-1024.png) · [1440px](screens/menu-conversation-7-operation-articles-articles.suggest-1440.png)

### 86. menu-conversation-7-operation-issues-issues.impact

運営者が添付した利用明細に関連する修正の効果を調べるために開きます。

1. 対象の課題は？ #42 領収書の一括ダウンロード。
2. どの期間を使うか？ 選択欄に30日間。
3. 何を比較できるか？ 説明に修正前の件数のみ確認とあるが、ボタンは「修正前後の件数を比較」。

[375px](screens/menu-conversation-7-operation-issues-issues.impact-375.png) · [1024px](screens/menu-conversation-7-operation-issues-issues.impact-1024.png) · [1440px](screens/menu-conversation-7-operation-issues-issues.impact-1440.png)

### 87. menu-conversation-7-operation-issues-issues.preview

運営者が添付した利用明細をGitHub課題に起票するために開きます。

1. どこに公開するか？ 問い合わせ #7 から example/helpdesk に投稿する旨を表示。
2. どんな入力が必要か？ タイトルと公開する要約が別々の欄。
3. 公開前に確認できるか？ 「起票内容を確認」と「入力を閉じる」が入力面内にある。

[375px](screens/menu-conversation-7-operation-issues-issues.preview-375.png) · [1024px](screens/menu-conversation-7-operation-issues-issues.preview-1024.png) · [1440px](screens/menu-conversation-7-operation-issues-issues.preview-1440.png)

### 88. menu-conversation-7-reply-templates

運営者が添付した利用明細の返信に定型文を使うために開きます。

1. どの定型文か？ 「お問い合わせの受付」に丸印。
2. 差し込み先は？ 本文冒頭に Hello 森 海斗、末尾に Slide。
3. 選択で送信されるか？ 表示される操作は「定型文から下書きを作成」。

[375px](screens/menu-conversation-7-reply-templates-375.png) · [1024px](screens/menu-conversation-7-reply-templates-1024.png) · [1440px](screens/menu-conversation-7-reply-templates-1440.png)

### 89. menu-conversation-7-thread-actions

運営者が添付した利用明細の処理を後回しにするために開きます。

1. どこから開くか？ ツールバーの「その他の操作」に青枠。
2. 後に回す入口は？ 「スヌーズ」に展開用三角。
3. 他に何を選べるか？ 「迷惑メールにする」。

[375px](screens/menu-conversation-7-thread-actions-375.png) · [1024px](screens/menu-conversation-7-thread-actions-1024.png) · [1440px](screens/menu-conversation-7-thread-actions-1440.png)

### 90. menu-conversation-7-thread-assignee

運営者が添付した利用明細の担当を決めるために開きます。

1. 現在の担当は？ 担当なしの行がチェック済み。
2. 誰に振れるか？ 佐藤優・森直子の候補に名前と色付きの丸。
3. どの属性に作用するか？ 青い担当欄の下に候補が並ぶ。

[375px](screens/menu-conversation-7-thread-assignee-375.png) · [1024px](screens/menu-conversation-7-thread-assignee-1024.png) · [1440px](screens/menu-conversation-7-thread-assignee-1440.png)

### 91. menu-conversation-7-thread-labels

運営者が添付した利用明細のラベルを調整するために開きます。

1. 現状は？ チェック済みの行は見えず、先頭の再発行に青枠。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. 候補が合わない場合は？ 下部に新しいラベルの作成と管理がある。

[375px](screens/menu-conversation-7-thread-labels-375.png) · [1024px](screens/menu-conversation-7-thread-labels-1024.png) · [1440px](screens/menu-conversation-7-thread-labels-1440.png)

### 92. menu-conversation-7-thread-status

運営者が添付した利用明細の状態を確認・変更するために開きます。

1. 今の状態は？ 未対応の文字とアイコンが起点とメニュー内に出る。
2. 完了にできるか？ 先頭の「完了にする」が青い枠。
3. 他の行き先は？ 「迷惑メールにする」。

[375px](screens/menu-conversation-7-thread-status-375.png) · [1024px](screens/menu-conversation-7-thread-status-1024.png) · [1440px](screens/menu-conversation-7-thread-status-1440.png)

### 93. menu-extensions-issues-link-1-thread-actions

運営者が既存課題の選択中に領収書の宛名変更の処理を後回しにするために開きます。

1. どこから開くか？ ツールバーの「その他の操作」に青枠。
2. 後に回す入口は？ 「スヌーズ」に展開用三角。
3. 他に何を選べるか？ 「迷惑メールにする」。

[375px](screens/menu-extensions-issues-link-1-thread-actions-375.png) · [1024px](screens/menu-extensions-issues-link-1-thread-actions-1024.png) · [1440px](screens/menu-extensions-issues-link-1-thread-actions-1440.png)

### 94. menu-extensions-issues-link-1-thread-assignee

運営者が既存課題の選択中に領収書の宛名変更の担当を決めるために開きます。

1. 現在の担当は？ 担当なしの行がチェック済み。
2. 誰に振れるか？ 佐藤優・森直子の候補に名前と色付きの丸。
3. どの属性に作用するか？ 青い担当欄の下に候補が並ぶ。

[375px](screens/menu-extensions-issues-link-1-thread-assignee-375.png) · [1024px](screens/menu-extensions-issues-link-1-thread-assignee-1024.png) · [1440px](screens/menu-extensions-issues-link-1-thread-assignee-1440.png)

### 95. menu-extensions-issues-link-1-thread-labels

運営者が既存課題の選択中に領収書の宛名変更のラベルを調整するために開きます。

1. 現状は？ 経理・請求・領収書にチェック。
2. 既存の候補は？ 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。
3. 候補が合わない場合は？ 下部に新しいラベルの作成と管理がある。

[375px](screens/menu-extensions-issues-link-1-thread-labels-375.png) · [1024px](screens/menu-extensions-issues-link-1-thread-labels-1024.png) · [1440px](screens/menu-extensions-issues-link-1-thread-labels-1440.png)

### 96. menu-extensions-issues-link-1-thread-status

運営者が既存課題の選択中に領収書の宛名変更の状態を確認・変更するために開きます。

1. 今の状態は？ 未対応の文字とアイコンが起点とメニュー内に出る。
2. 完了にできるか？ 先頭の「完了にする」が青い枠。
3. 他の行き先は？ 「迷惑メールにする」。

[375px](screens/menu-extensions-issues-link-1-thread-status-375.png) · [1024px](screens/menu-extensions-issues-link-1-thread-status-1024.png) · [1440px](screens/menu-extensions-issues-link-1-thread-status-1440.png)

### 97. menu-home-inbox-filters

運営者が未対応一覧の条件を点検するために開きます。

1. どの状態か？ 未対応、7件。
2. 他の制約は？ プロダクト・担当者はすべて、すべてのラベル。
3. どの項目を操作中か？ 状態欄に青枠がある。

[375px](screens/menu-home-inbox-filters-375.png) · [1024px](screens/menu-home-inbox-filters-1024.png) · [1440px](screens/menu-home-inbox-filters-1440.png)

### 98. menu-label-fd3f5651-inbox-filters

運営者が請求ラベルの対象を見直すために開きます。

1. 何件か？ 未対応2件。
2. どの絞り込みが効いているか？ メニューのラベル欄も検索下のチップも「請求」。
3. 解除先は？ メニュー外の請求チップに×がある。

[375px](screens/menu-label-fd3f5651-inbox-filters-375.png) · [1024px](screens/menu-label-fd3f5651-inbox-filters-1024.png) · [1440px](screens/menu-label-fd3f5651-inbox-filters-1440.png)

### 99. menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters

運営者が自分の担当条件を調べるために開きます。

1. どのプロダクトか？ Desk。
2. 誰の担当か？ 佐藤優。
3. 状態まで制限しているか？ 状態欄はすべて、自分の担当の見出しは1件。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters-375.png) · [1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters-1024.png) · [1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters-1440.png)

### 100. menu-query-999c3485-inbox-filters

運営者が0件の検索で他の制限を調べるために開きます。

1. 検索語は？ 未回答の調査番号。
2. 他に制限はあるか？ 状態・プロダクト・担当者・ラベルはすべて。
3. 条件を消す入口は？ 入力欄下の検索チップに×。375pxでは空状態の説明はパネル裏。

[375px](screens/menu-query-999c3485-inbox-filters-375.png) · [1024px](screens/menu-query-999c3485-inbox-filters-1024.png) · [1440px](screens/menu-query-999c3485-inbox-filters-1440.png)

### 101. menu-status-spam-48e45b08-inbox-filters

運営者が迷惑メールだけを絞り込むために開きます。

1. 現在は何件か？ 1件。
2. 対象状態は？ 盾印と「迷惑メール」。
3. 他に制約は？ プロダクト・担当者・ラベルはすべて。

[375px](screens/menu-status-spam-48e45b08-inbox-filters-375.png) · [1024px](screens/menu-status-spam-48e45b08-inbox-filters-1024.png) · [1440px](screens/menu-status-spam-48e45b08-inbox-filters-1440.png)

### 102. menu-view-feedback-834dd78f-inbox-filters

運営者がフィードバックの範囲を確認するために開きます。

1. 件数と順序は？ 1件、新しい順。
2. どの条件を選べるか？ 状態・プロダクト・ラベル。
3. 通常の受信箱と違う欄は？ 担当者欄は表示されない。

[375px](screens/menu-view-feedback-834dd78f-inbox-filters-375.png) · [1024px](screens/menu-view-feedback-834dd78f-inbox-filters-1024.png) · [1440px](screens/menu-view-feedback-834dd78f-inbox-filters-1440.png)

### 103. my-inbox

運営者が自分の担当分を優先順位順に処理するために開きます。

1. 対象は？ 佐藤優の3件、すべての状態。
2. 先頭の要注意案件は？ 月額プランの明細に送信失敗。
3. 返信済みで相手待ちはあるか？ 招待メールの#2に返信待ち。

[375px](screens/my-inbox-375.png) · [1024px](screens/my-inbox-1024.png) · [1440px](screens/my-inbox-1440.png)

### 104. route-voices-conversations

運営者が声の集計から元の相談を確認するために開きます。

1. 対象範囲は？ すべてのプロダクト・全期間・10件。
2. 何で識別できるか？ 番号・件名・プロダクト・日付・問い合わせ/フィードバックの種別。
3. 集計に戻れるか？ 冒頭に「声の集計に戻る」。

[375px](screens/route-voices-conversations-375.png) · [1024px](screens/route-voices-conversations-1024.png) · [1440px](screens/route-voices-conversations-1440.png)

### 105. suggest-composer

運営者が領収書への返信に記事を添えるために開きます。

1. 何を探せるか？ 「記事の題名で検索」の入力。
2. どんな候補があるか？ 「領収書を発行する」。
3. すでに送られたか？ 返信欄上に選択用ポップオーバーが開いており、送信済みの表示はない。

[375px](screens/suggest-composer-375.png) · [1024px](screens/suggest-composer-1024.png) · [1440px](screens/suggest-composer-1440.png)

### 106. suggest-composer-empty

運営者が記事候補のない問い合わせを知識化するために開きます。

1. 何についてか？ ワークスペースの招待メール。
2. 記事はあるか？ 「この問い合わせに合う記事の候補はまだありません」。
3. 次にできることは？ 「この件名を記事候補にする」。

[375px](screens/suggest-composer-empty-375.png) · [1024px](screens/suggest-composer-empty-1024.png) · [1440px](screens/suggest-composer-empty-1440.png)

### 107. thread-approval

運営者がエージェントの下書きを読み、承認の可否を選ぶために開きます。

1. 誰が作ったか？ 下書き担当エージェント、佐藤優の代理。
2. 送信済みか？ 橙の「承認待ち」。
3. 選択肢は？ 「承認して送信」と「下書きを破棄」。

[375px](screens/thread-approval-375.png) · [1024px](screens/thread-approval-1024.png) · [1440px](screens/thread-approval-1440.png)

### 108. thread-attachment

運営者が問い合わせに付いた利用明細を確認するために開きます。

1. 誰からか？ 森海斗、対象の明細を添付と記載。
2. どのファイルか？ 利用明細.txt、43 B。
3. 開き方は？ 本文下のファイル名が青いリンク。中身と取得結果は画像外。

[375px](screens/thread-attachment-375.png) · [1024px](screens/thread-attachment-1024.png) · [1440px](screens/thread-attachment-1440.png)

### 109. thread-context

運営者が関連情報から既存の課題を調べるために開きます。

1. どの会話か？ #1・Slide。
2. 関連課題は？ 領収書の宛名の変更を扱う #43 が1件。
3. 元に戻れるか？ 375/1024pxは「閉じる」、1440pxは会話と右パネルが並ぶ。

[375px](screens/thread-context-375.png) · [1024px](screens/thread-context-1024.png) · [1440px](screens/thread-context-1440.png)

### 110. thread-failed

運営者が失敗した明細への返信を復旧するために開きます。

1. 何が失敗したか？ 佐藤優の返信に「送信失敗」。
2. 理由は？ 広い幅で宛先のメールサーバーが受信を拒否と表示。
3. 再開先は？ 広い幅に「再送」、375pxでは属性の「送信失敗の返信へ」で該当箇所を示す。

[375px](screens/thread-failed-375.png) · [1024px](screens/thread-failed-1024.png) · [1440px](screens/thread-failed-1440.png)

### 111. thread-html

運営者が購入後のメール本文を原文のまま読むために開きます。

1. 誰からか？ 佐々木葵。
2. 注文を識別できるか？ SL-2026-128が太字で1行に収まる。
3. 返信の入口は？ 下に「返信」と「内部メモ」を切り替える入力面がある。

[375px](screens/thread-html-375.png) · [1024px](screens/thread-html-1024.png) · [1440px](screens/thread-html-1440.png)

### 112. thread-inbound

運営者が新着の領収書相談を読んで応答するために開きます。

1. 要求は？ 領収書の宛名を会社名に変更し再発行したい。
2. 状態は？ #1 Slide、未対応。
3. どこで返すか？ 受信文の直下に返信欄、375pxは追加の操作を開ける。

[375px](screens/thread-inbound-375.png) · [1024px](screens/thread-inbound-1024.png) · [1440px](screens/thread-inbound-1440.png)

### 113. thread-note

運営者が顧客の文と社内の経理確認を読み分けるために開きます。

1. 受信内容は？ 更新前に請求書の送付先を変更する相談。
2. 社内記録は？ 佐藤優の黄色いカードに「相手には送られません」。
3. 内容は読めるか？ 広い幅で経理への確認と期限を表示。375pxは固定返信欄でメモ下部が見えない。

[375px](screens/thread-note-375.png) · [1024px](screens/thread-note-1024.png) · [1440px](screens/thread-note-1440.png)

### 114. thread-replied

運営者が招待メールに対する以前の返信を確認するために開きます。

1. 現在の会話状態は？ 返信待ち。
2. 何を送ったか？ 広い幅で招待メールを再送し、受信箱の確認を依頼した文。
3. 配送状態は？ 返信カードに佐藤優・送信済み。375pxは「送信済みの返信へ」がある。

[375px](screens/thread-replied-375.png) · [1024px](screens/thread-replied-1024.png) · [1440px](screens/thread-replied-1440.png)

## 静止画で確かめられないこと

確認・キャンセルの後の遷移、Tab・Escape・IME操作、スクロールが止まるか、フォーカスの復帰、ボタンの実際のタップ領域、送信・通知・取り消しの実行結果、画面切り替えの体感速度、候補記事・添付の取得結果は確認していません。撮影状態が異なる会話同士から担当変更や配信の履歴は推定していません。
