# 会話と受信箱の目視記録（2周目）

2周目に撮影した40状態を各3幅、計120枚開きました。各状態で目的と主操作、対象と状態を区別できるか、文字や印が欠けていないかの3点以上を探し、前後の画面とのつながり、配置・余白・文字・言葉も見比べました。ボタンの切り替え速度や実際の送信結果は静止画から判定できないため、操作検査で扱います。

## 指摘

高0件、中1件、低3件です。

| 重さ | 対象と影響 | あるべき姿 |
| --- | --- | --- |
| 中 | 返信の通信障害。「送信できませんでした」と断定した直後に最新の会話で結果を確認するよう促しています。送信側が処理してから接続が途切れた場合に、すでに受け付けた返信を再度送る判断につながります。 | 依頼を拒否できた場合と応答を確認できなかった場合でメッセージを変えます。結果不明時は本文を維持し、最新の会話を開けるようにします。 |
| 低 | 375 pxの受信箱のうち、送信失敗・請求・担当が重なる#4の差出人は「渡…」までです。番号・件名と警告は読めますが、氏名は詳細を開いて照合します。 | 状態が重なる行でも、氏名を確認する手掛かりを残します。 |
| 低 | 空の返信欄に「送信」が入力後と同じ濃さで表示されます。本文なしで送れるように見え、押すまで入力が必要と分かりにくくなります。 | 空の返信では送信操作を無効と示し、入力してから有効にします。 |
| 低 | 1440 pxの推奨記事なしで、「記事の候補に追加」が返信欄と右欄の2か所に並びます。どちらが作業対象なのか見比べます。 | 同じ問い合わせを候補に加える操作の入口を整理します。 |

## 1周目の指摘との照合

検索は375 pxでも説明と入力語が収まり、通常の行の差出人は件名と分けて読めます。失敗・担当などが重なる行の例外は上記に残しました。課題#42は1440 pxでも全文字を確認できます。返信失敗の確認リンクは赤い案内の中にあり、以前の「履歴への入口がない」状態は解消しました。今回の指摘は、その案内で送信の成否を断定する言葉です。

返信・内部メモの青枠は入力欄だけに付き、送信ボタンの左端と段は処理中も動きません。ギャラリーの削除とキャンセルに余白があり、条件選択の状態・ラベルには矢印が1つずつです。初期読み込み中に矢印キーが届くかは1周目に追加した遅延読み込みの操作検査で確認します。

## 状態ごとの観察

| 状態 | 375 px | 1024 px | 1440 px |
| --- | --- | --- | --- |
| candidates | 「佐藤 優」の横だけにチェック。3行は「未割り当て」まで見えます。 [画像](screens/candidates-375.png) | 森と未割り当ての頭文字、各行の余白を区別できます。 [画像](screens/candidates-1024.png) | 人物の行と未割り当ては同じ幅で、チェックが右端に収まります。 [画像](screens/candidates-1440.png) |
| confirmation | 「見本の会話を削除しますか？」と2ボタンを同時に読めます。 [画像](screens/confirmation-375.png) | キャンセル右端と赤い削除の間に白い間隔があります。 [画像](screens/confirmation-1024.png) | 赤は削除だけ。説明とボタン列は重なりません。 [画像](screens/confirmation-1440.png) |
| inbox | 検索対象を全文読めます。#7の「森 海斗」、#1の「山田 花」が件名の下に見えます。 [画像](screens/inbox-375.png) | 未対応7件。#7の添付印と#4の送信失敗を別々の行で読めます。 [画像](screens/inbox-1024.png) | 左の件名、右のSlide／Deskと待ち時間、下のラベルを縦に比較できます。 [画像](screens/inbox-1440.png) |
| inbox-empty | 未対応0件、トレー、未対応の問い合わせはない旨が縦に並びます。 [画像](screens/inbox-empty-375.png) | ナビの未対応0と本文が一致し、返信待ち1は別に残ります。 [画像](screens/inbox-empty-1024.png) | 検索条件欄の下の空状態は一覧の中央で、文字は短くまとまります。 [画像](screens/inbox-empty-1440.png) |
| inbox-failed | 請求2件のうち#4は警告＋送信失敗を読めます。差出人は「渡…」までです。 [画像](screens/inbox-failed-375.png) | 渡辺 葵・赤い失敗・satoの印が同じ行に収まります。 [画像](screens/inbox-failed-1024.png) | 請求の条件を外す印と、対象メッセージの失敗を異なる場所に示します。 [画像](screens/inbox-failed-1440.png) |
| inbox-filter | Desk・satoの条件、森 海斗の1件、未対応の印を読めます。 [画像](screens/inbox-filter-375.png) | Deskのナビに自分の担当1。見出しの結果も1件です。 [画像](screens/inbox-filter-1024.png) | 3時間待ち・メモの印・未対応・担当のSが右端に並びます。 [画像](screens/inbox-filter-1440.png) |
| inbox-loading | 「領収書」の消去印まで青枠内に収まり、下は長さの異なる灰色の3本線です。 [画像](screens/inbox-loading-375.png) | 検索中も絞り込みと並び順が残り、一覧行は隠れます。 [画像](screens/inbox-loading-1024.png) | 7件の見出しは残り、待機表示と入力済みの語が離れすぎません。 [画像](screens/inbox-loading-1440.png) |
| thread-inbound | #1、3ラベル、山田 花の本文、返信の入口まで順に追えます。 [画像](screens/thread-inbound-375.png) | 山田のアドレスと受信時刻、その下の宛先を読み比べられます。 [画像](screens/thread-inbound-1024.png) | 操作履歴は右欄、山田の問い合わせと返信は中央の同一列です。 [画像](screens/thread-inbound-1440.png) |
| thread-approval | 代理作成の表示の下に承認待ち、その下に下書きが続きます。 [画像](screens/thread-approval-375.png) | 元の質問とは背景が分かれ、下書きの直下で承認または破棄を選べます。 [画像](screens/thread-approval-1024.png) | 代理人とオレンジの砂時計が並び、通常の返信は独立した枠に入ります。 [画像](screens/thread-approval-1440.png) |
| thread-attachment | 森 海斗の文末に「利用明細.txt」と43 Bの表記があります。 [画像](screens/thread-attachment-375.png) | ファイルリンクの直下で本文枠が終わり、返信先も見えます。 [画像](screens/thread-attachment-1024.png) | 添付を本文の列内に保ち、右欄の履歴と読み分けられます。 [画像](screens/thread-attachment-1440.png) |
| thread-failed | satoの「送信失敗」と、受信拒否の理由まで読めます。 [画像](screens/thread-failed-375.png) | 赤い拒否理由に続く「再送」は当該返信の灰色枠内にあります。 [画像](screens/thread-failed-1024.png) | 渡辺の受信内容、satoの送信内容、再送が同じ列で時系列に並びます。 [画像](screens/thread-failed-1440.png) |
| thread-html | 外部画像非表示の説明の下で注文番号SL-2026-128を読めます。 [画像](screens/thread-html-375.png) | 元の連絡と注文番号が白枠内、返信がその下に収まります。 [画像](screens/thread-html-1024.png) | 短いHTMLメールの末尾で枠が終わり、返信への間隔は適切です。 [画像](screens/thread-html-1440.png) |
| thread-note | 黄色のメモに相手には送られないこと、sato、2時間前を表示します。 [画像](screens/thread-note-375.png) | 森の問い合わせ、黄色の内部メモ、返信欄は互いに間隔があります。 [画像](screens/thread-note-1024.png) | Deskの返信先が見える返信欄と、経理チームの内部記録を区別できます。 [画像](screens/thread-note-1440.png) |
| thread-replied | 返信待ち・佐々木の問い合わせ・satoの送信済み返信まで画面に収まります。 [画像](screens/thread-replied-375.png) | 「2時間前」の受信に「1時間前」の返信が続きます。 [画像](screens/thread-replied-1024.png) | 「送信済み」の紙飛行機と文字、返信枠の薄い背景が一緒に見えます。 [画像](screens/thread-replied-1440.png) |
| composer-empty | 返信入力の案内、宛先、送信を含む3操作を同時に確認できます。 [画像](screens/composer-empty-375.png) | 宛先の次段に黒い「送信」があり、空欄も入力後と同じ濃さです。 [画像](screens/composer-empty-1024.png) | 本文と返信欄は同じ左端。右の操作履歴から離れています。 [画像](screens/composer-empty-1440.png) |
| composer-failed | 3行の赤い説明の直下に別タブの確認リンクがあります。本文も残っています。 [画像](screens/composer-failed-375.png) | 説明とリンクは別の行ですが、「送信できませんでした」と結果確認を同時に求めます。 [画像](screens/composer-failed-1024.png) | 同じ赤枠内で最新の会話へ進めます。別の右欄を探す必要はありません。 [画像](screens/composer-failed-1440.png) |
| composer-note | 「内部メモ（相手には送られません）」・入力中の青枠・保存が見えます。 [画像](screens/composer-note-375.png) | 青枠は本文だけを囲み、タブとボタンを巻き込みません。 [画像](screens/composer-note-1024.png) | 送信先の代わりに、注意書きと左側の「メモを残す」が現れます。 [画像](screens/composer-note-1440.png) |
| composer-typing | 3行の返信と青枠が収まり、下の3操作が1段に並びます。 [画像](screens/composer-typing-375.png) | 青枠は1つ、宛先と送信ボタンまで見えます。 [画像](screens/composer-typing-1024.png) | 1行の本文にフォーカスがあり、タブ・宛先には青枠がありません。 [画像](screens/composer-typing-1440.png) |
| composer-sending | 「送信中…」は入力時の送信と同じ段の右端に残ります。 [画像](screens/composer-sending-375.png) | 灰色の「送信して完了」と「送信中…」が宛先の次段に並びます。 [画像](screens/composer-sending-1024.png) | 待機中も本文が見え、送信ボタンの左端は入力時と一致します。 [画像](screens/composer-sending-1440.png) |
| link-issue | パネル内の題検索・課題#42・候補2件・紐づけが順に読めます。 [画像](screens/link-issue-375.png) | 閉じるが右上にあり、暗い背景の#1とは対象を区別できます。 [画像](screens/link-issue-1024.png) | 右欄でも選択肢が「#42」で始まり「領収書の一括ダウンロード」まで読めます。 [画像](screens/link-issue-1440.png) |
| all-inbox | 「すべて」10件。#4は赤い警告印、#5は砂時計、#2は「返信待ち」を表示します。 [画像](screens/all-inbox-375.png) | 完了の#8と迷惑メールの#9を含む10行が見えます。 [画像](screens/all-inbox-1024.png) | 状態・経過時間は右端に揃い、複数ラベルは「+4」などにまとまります。 [画像](screens/all-inbox-1440.png) |
| my-inbox | sato、すべての2条件。#4・#3・#2の右端にSが並びます。 [画像](screens/my-inbox-375.png) | 未対応2件と返信待ち1件。製品名はSlide／Deskと読めます。 [画像](screens/my-inbox-1024.png) | 件名と失敗・メモ・送信済みの区別を、3行横並びの列で追えます。 [画像](screens/my-inbox-1440.png) |
| approval-list | #5・山田 花・5時間待ちが別々に読め、砂時計の横に未対応を表示します。 [画像](screens/approval-list-375.png) | 1件の選択中ナビと、行内の「承認待ち」の文字が一致します。 [画像](screens/approval-list-1024.png) | 件名と契約更新の質問まで表示され、返信の承認状態と会話の状態が並びます。 [画像](screens/approval-list-1440.png) |
| feedback-list | 「新しい順」が読め、#10の「確認済みにする」は次段で独立します。 [画像](screens/feedback-list-375.png) | 「受付済み」の隣に確認操作。会話の待ち時間とは異なる「10時間前」です。 [画像](screens/feedback-list-1024.png) | 佐々木の意見・本文・受付状態・確認操作を1行内で確認できます。 [画像](screens/feedback-list-1440.png) |
| approval-confirm | customer5の宛先、人数変更の回答文、キャンセルと承認操作がすべて読めます。 [画像](screens/approval-confirm-375.png) | モーダルと背後の下書きの双方に本文があり、確定ボタンはモーダル内で識別できます。 [画像](screens/approval-confirm-1024.png) | 背景の代理作成者と前面の送信先が別の位置にあり、操作対象が分かります。 [画像](screens/approval-confirm-1440.png) |
| thread-context | 記事候補、example/helpdesk#43、会話#6、件数比較が全面のパネル内に収まります。 [画像](screens/thread-context-375.png) | 右パネルに課題1件、左側には暗くなった返信下書きが残ります。 [画像](screens/thread-context-1024.png) | 中央に拡張の下書きと承認操作、右には課題とその比較操作が表示されます。 [画像](screens/thread-context-1440.png) |
| suggest-composer | ポップオーバーの端は画面右端、青枠の下に「領収書を発行する」が収まります。 [画像](screens/suggest-composer-375.png) | 返信タブと宛先の間から記事を選べ、送信の操作は見えています。 [画像](screens/suggest-composer-1024.png) | 題名の検索は中央、右欄の候補追加は別の操作として並びます。 [画像](screens/suggest-composer-1440.png) |
| suggest-composer-empty | 入力欄の下に候補追加と記事を添える操作。宛先・送信も見えます。 [画像](screens/suggest-composer-empty-375.png) | 「記事の候補に追加」が入力欄と同じ幅に広がり、手動添付は次段です。 [画像](screens/suggest-composer-empty-1024.png) | 返信欄と右のヘルプ記事に同名の「記事の候補に追加」が二つ見えます。 [画像](screens/suggest-composer-empty-1440.png) |
| loop-actions | その他の操作の直下にスヌーズと迷惑メールが並び、本文を読み続けられます。 [画像](screens/loop-actions-375.png) | 右向き三角のスヌーズと、すぐ変更する迷惑メールを区別できます。 [画像](screens/loop-actions-1024.png) | メニューは件名の右側、前後への矢印はその外に残ります。 [画像](screens/loop-actions-1440.png) |
| loop-assignee | 担当なしにチェック。moriとsatoは頭文字と色で分かれます。 [画像](screens/loop-assignee-375.png) | 未対応とは別の担当メニューが開き、選択中だけ背景が変わります。 [画像](screens/loop-assignee-1024.png) | 見出しを保ち、担当選択の下で2人の名前を比較できます。 [画像](screens/loop-assignee-1440.png) |
| loop-labels | 長い「長期契約の更新手続きについて」まで1行。3つの選択にはチェックが見えます。 [画像](screens/loop-labels-375.png) | 6色と新規作成が同じメニューに入り、選択済みの背景が揃います。 [画像](screens/loop-labels-1024.png) | 色の印と右端のチェックが縦列になり、選択の有無が分かります。 [画像](screens/loop-labels-1440.png) |
| loop-status | 現在の未対応を黒い印で示し、下に完了と迷惑メールが並びます。 [画像](screens/loop-status-375.png) | 現在の状態の横にトレー、変更先には動詞が付きます。 [画像](screens/loop-status-1024.png) | 状態欄の下で完結し、担当・ラベルへ続く上の行は見えます。 [画像](screens/loop-status-1440.png) |
| loop-bulk | 2件選択の操作帯と左の黒いチェックを照合できます。ホバー中の#7に個別操作も出ます。 [画像](screens/loop-bulk-375.png) | 5つの一括操作が1段。選択背景は先頭2行の左端に揃います。 [画像](screens/loop-bulk-1024.png) | #11／#7は選択済み、#6以下は未選択。解除は操作帯の右にあります。 [画像](screens/loop-bulk-1440.png) |
| loop-bulk-assignee | moriとsatoが操作帯内に開き、選んだ2行と「2件を選択」が残ります。 [画像](screens/loop-bulk-assignee-375.png) | 2人の印は青緑のMと紫のS。個別の担当変更とは場所が違います。 [画像](screens/loop-bulk-assignee-1024.png) | 選んだ2行にチェックが残ったまま、操作帯の直下に2候補が出ます。 [画像](screens/loop-bulk-assignee-1440.png) |
| loop-bulk-label | 2件の表示の下で、長い名前も含めラベル6候補を1行ずつ読めます。 [画像](screens/loop-bulk-label-375.png) | パネルと操作帯が重ならず、背景の選択チェックを確認できます。 [画像](screens/loop-bulk-label-1024.png) | 6つの候補を中央寄せしており、名前の長さに応じて色丸の位置が左右に動きます。 [画像](screens/loop-bulk-label-1440.png) |
| loop-filters | 状態・製品・担当・ラベルが収まります。状態とラベルの矢印が1つに揃っています。 [画像](screens/loop-filters-375.png) | ポップオーバーは左へ開き、3つの選択欄に同じ灰色の矢印があります。 [画像](screens/loop-filters-1024.png) | 右上に開いてもはみ出さず、4条件を順に読めます。 [画像](screens/loop-filters-1440.png) |
| loop-filter-assignee | 担当の子メニューに「すべて」のチェック、moriとsatoが続きます。 [画像](screens/loop-filter-assignee-375.png) | 親の状態・製品は残り、手前に担当者の名前と頭文字が出ます。 [画像](screens/loop-filter-assignee-1024.png) | 親の下端を越えて子メニューが開きますが、2人とも切れずに読めます。 [画像](screens/loop-filter-assignee-1440.png) |
| loop-convert | 意見を返信できる問い合わせに変える説明と、キャンセル・変更を同時に読めます。 [画像](screens/loop-convert-375.png) | 元の件名が背後に残り、確定する黒ボタンの対象を確認できます。 [画像](screens/loop-convert-1024.png) | 確認済みにする操作は暗い背景側、変換の確定は中央の前面にあります。 [画像](screens/loop-convert-1440.png) |
| loop-discard | 破棄がこの会話の下書き1件に限られると表示されます。 [画像](screens/loop-discard-375.png) | 承認待ちの下書きの上でキャンセルと破棄を別々に選べます。 [画像](screens/loop-discard-1024.png) | 対象1件・確定・キャンセルが中央にまとまり、元の送信ボタンは暗くなります。 [画像](screens/loop-discard-1440.png) |
| loop-filter-empty | 検索語「未回答の調査番号」は入力欄と解除チップの両方で全文が読めます。 [画像](screens/loop-filter-empty-375.png) | 件数0と虫眼鏡、条件に一致しない説明が中央に出ます。 [画像](screens/loop-filter-empty-1024.png) | 左ナビの未対応7と検索結果0を、上の条件と照合できます。 [画像](screens/loop-filter-empty-1440.png) |

## 修正後の確認

通信が途切れた時と、入力を検証して明確に拒否した時で異なる案内を表示した。応答が消えてもデータは記録されているケースを再現し、元の下書きを保ったまま別タブで記録済みの返信を確認できた。空欄の送信は淡い背景と濃い文字で表し、押した時は必須の本文欄にフォーカスする。通常送信、下書き復元、定型返信の挿入を含む関連ブラウザーテスト16件で確認した。
