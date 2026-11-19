# 第6周　会話・受信箱

40状態を375・1024・1440pxで撮影した第6周の原寸画像120枚を開き、各状態の対象と現在値、文言の読みやすさ、次の操作の位置を確認しました。高0件、中0件、低2件です。低は前周から継続する2つの表示を原因ごとに数えています。

## 修正箇所の再確認

- 承認待ちとフィードバックの375px幅で「件名・差出人・本文を検索」を最後まで読めます。絞り込みと並び順は次の段に収まり、承認待ちの会話やフィードバックの確認ボタンを押す場所も残っています。[承認待ち](screens/approval-list-375.png)・[フィードバック](screens/feedback-list-375.png)
- 配信先に拒否された返信は失敗と理由、再送操作を示しています。結果を確認できない返信は入力を残し、最新の状況を確認するリンクを示しています。空欄時の薄灰色ボタンの文字、送信中の表示も確認しました。[確定した失敗](screens/thread-failed-375.png)・[結果の照会](screens/composer-failed-375.png)・[空欄](screens/composer-empty-1024.png)・[送信中](screens/composer-sending-1440.png)
- 課題選択で番号と題名が並び、展開矢印が末尾に収まります。下書きの破棄は中央のダイアログで対象件数を示し、キャンセルと破棄のボタンが離れています。[課題選択](screens/link-issue-1440.png)・[下書き破棄](screens/loop-discard-375.png)

## 継続する低指摘

- **低　会話一覧の差出人の省略。** 375pxの会話 #4 では、送信失敗・ラベル・担当者の表示が差出人と同じ行にあり、「渡…」から氏名全体を判別できません。一覧で姓まで見えれば同名件名の識別が早くなります。番号と件名で会話を開くと、渡辺 葵とアドレスを確認できます。[担当一覧](screens/my-inbox-375.png)・[失敗一覧](screens/inbox-failed-375.png)・[会話の差出人](screens/thread-failed-375.png)
- **低　記事候補の登録ボタンが2か所に出る。** 記事候補がない会話を1440pxで開くと、返信欄と右のヘルプ記事欄に同じ「記事の候補に追加」が出ます。担当者が異なる操作かを一度考える配置です。375・1024pxの返信画面で見える登録ボタンは1つです。[1440pxの2か所](screens/suggest-composer-empty-1440.png)・[375pxの返信欄](screens/suggest-composer-empty-375.png)

## 状態別の観察

| 状態 | 375px | 1024px | 1440px |
| --- | --- | --- | --- |
| all-inbox | 10件の見出しと「すべて」の条件に続き、未対応・返信待ちが並ぶ。 [375px](screens/all-inbox-375.png) | 送信失敗・承認待ちは色と語句の両方を使い、5時間待ちと4時間待ちを区別できる。 [1024px](screens/all-inbox-1024.png) | 下端の完了と迷惑メールも個別の行に収まり、長い差出人は先頭部分を残して省略。  [1440px](screens/all-inbox-1440.png) |
| approval-confirm | 宛先、送信される2行の返信、キャンセルと承認ボタンが白い枠内に収まる。 [375px](screens/approval-confirm-375.png) | 背景の山田花の会話を暗くし、customer5宛ての確認と送信操作を中央に表示。 [1024px](screens/approval-confirm-1024.png) | 右の関連情報まで背景色が均一。主操作とキャンセルの間に隙間がある。 [1440px](screens/approval-confirm-1440.png) |
| approval-list | 「件名・差出人・本文を検索」が全幅に収まる。次段に絞り込み・待たせている順、対象行に #5 と砂時計。 [375px](screens/approval-list-375.png) | 左で選択中の承認待ち1件と一覧の件数が一致し、山田花の行に承認待ち・未対応を同時表示。 [1024px](screens/approval-list-1024.png) | 件名・本文の質問を一行ずつ読め、右端にSlideと5時間待ちが並ぶ。 [1440px](screens/approval-list-1440.png) |
| candidates | 佐藤 優と森 直子の下に未割り当てが収まる。 [375px](screens/candidates-375.png) | 選択印は佐藤 優の右端だけに付く。 [1024px](screens/candidates-1024.png) | 3行の高さと人名・頭文字の間隔が揃う。 [1440px](screens/candidates-1440.png) |
| composer-empty | 宛先の折り返し後に、プレビュー・送信して完了・送信の3操作が1列に収まる。 [375px](screens/composer-empty-375.png) | まだ空欄で2つの送信操作が灰色、どちらも文字を読める。 [1024px](screens/composer-empty-1024.png) | 空欄の「返信を入力」と右の相手の問い合わせが視覚的に分かれる。 [1440px](screens/composer-empty-1440.png) |
| composer-failed | 本文保持と再送前の確認案内が赤い枠内に収まり、別タブのリンクが続く。 [375px](screens/composer-failed-375.png) | 結果を確認できなかった旨とリンクが宛先行より上に見える。 [1024px](screens/composer-failed-1024.png) | 書いた本文・確認リンク・送信ボタンを1画面内で把握できる。 [1440px](screens/composer-failed-1440.png) |
| composer-note | 入力欄の上に橙色で非送信の説明、下に黒いメモを残すボタン。 [375px](screens/composer-note-375.png) | 選択中の内部メモにだけ黒い文字、青い枠内に経理への確認内容が見える。 [1024px](screens/composer-note-1024.png) | メモ欄にメールアドレスが付かず、保存の操作名も返信と異なる。 [1440px](screens/composer-note-1440.png) |
| composer-sending | 入力した3行を保持し、下部の灰色ボタンで「送信中…」が読める。 [375px](screens/composer-sending-375.png) | 送信して完了と内部メモも灰色に変わり、進行中と分かる。 [1024px](screens/composer-sending-1024.png) | 宛先はcustomer1で、返信欄は元メールの下から動かない。 [1440px](screens/composer-sending-1440.png) |
| composer-typing | 3行の下書きが青い枠に入り、黒い送信ボタンに切り替わる。 [375px](screens/composer-typing-375.png) | 送信して完了はアウトライン、送信は黒で横並び。 [1024px](screens/composer-typing-1024.png) | 再発行の案内が1行で入り、本文と操作ボタンの間に宛先が見える。 [1440px](screens/composer-typing-1440.png) |
| confirmation | 見本の会話が対象だと分かり、左右にボタンが収まる。 [375px](screens/confirmation-375.png) | 白いキャンセルと赤い削除の間に隙間がある。 [1024px](screens/confirmation-1024.png) | 削除ボタンの色面と説明文が重ならない。 [1440px](screens/confirmation-1440.png) |
| feedback-list | 検索対象の説明は全文表示。#10の受付済みと「確認済みにする」は上下に分かれる。 [375px](screens/feedback-list-375.png) | 製品、10時間前、確認ボタンが受付内容の右に並び、本文末まで読める。 [1024px](screens/feedback-list-1024.png) | 画面左のフィードバック1件と見出しが一致。差出人・件名・操作の間に余白がある。 [1440px](screens/feedback-list-1440.png) |
| inbox | 未対応7件。検索説明の下に絞り込みと並び順をまとめている。 [375px](screens/inbox-375.png) | #11から#1まで7件。添付、承認待ち、送信失敗が行ごとに見える。 [1024px](screens/inbox-1024.png) | 上段は件名と待ち時間、下段は番号・本文・状態の順に追える。 [1440px](screens/inbox-1440.png) |
| inbox-empty | 0件と未対応の問い合わせがない旨が両方読める。 [375px](screens/inbox-empty-375.png) | 左側の未対応0件と中央の空状態が一致する。 [1024px](screens/inbox-empty-1024.png) | 検索欄の下に受信トレイのアイコンと説明が中央揃えになる。 [1440px](screens/inbox-empty-1440.png) |
| inbox-failed | 請求ラベルの条件下で、#4に失敗と担当Sが残るが差出人は「渡…」まで。 [375px](screens/inbox-failed-375.png) | #4の渡辺 葵と#1の山田 花が区別でき、警告は#4に付く。 [1024px](screens/inbox-failed-1024.png) | 4時間と1時間の並び、請求の条件、該当2件を確認できる。 [1440px](screens/inbox-failed-1440.png) |
| inbox-filter | Desk、satoの条件と#3の1件。検索欄・条件解除の×まで読める。 [375px](screens/inbox-filter-375.png) | 製品Deskと「自分の担当1件」が左側のメニューとも一致。 [1024px](screens/inbox-filter-1024.png) | 右端に未対応とS、左端に森 海斗。行内で所属が分かる。 [1440px](screens/inbox-filter-1440.png) |
| inbox-loading | 入力語「領収書」とクリアの×の周囲に青枠。結果部分に横線3本。 [375px](screens/inbox-loading-375.png) | 灰色の線の上に検索・絞り込み・待たせている順が表示される。 [1024px](screens/inbox-loading-1024.png) | ナビの未対応は7、検索は青枠のまま、本文部分だけが読み込み表示。 [1440px](screens/inbox-loading-1440.png) |
| link-issue | 全面の関連情報に検索欄の青い枠。「#42 領収書の一括ダウンロード」が展開矢印の手前まで収まる。 [375px](screens/link-issue-375.png) | 右のパネル内に2件の課題と紐付けボタン。閉じるボタンが右上に残る。 [1024px](screens/link-issue-1024.png) | 常設の右列でも#42から末尾まで読め、候補を探す欄と起票ボタンが分かれる。 [1440px](screens/link-issue-1440.png) |
| loop-actions | 「その他の操作」の下にスヌーズと迷惑メール。開いた枠は右端までに収まる。 [375px](screens/loop-actions-375.png) | 前後矢印がボタン右に残り、スヌーズの三角は右向きで閉じた状態。 [1024px](screens/loop-actions-1024.png) | 右列の手前で開くメニューに両操作が収まり、顧客本文は全行読める。 [1440px](screens/loop-actions-1440.png) |
| loop-assignee | 「担当なし」にチェック。moriとsatoは名前と丸い頭文字で見分けられる。 [375px](screens/loop-assignee-375.png) | 担当者指定の直下に3択。現在値だけに背景色が付き、右のラベルと重ならない。 [1024px](screens/loop-assignee-1024.png) | 左の本文に重なる小さなメニューで完結し、右列や送信操作を覆わない。 [1440px](screens/loop-assignee-1440.png) |
| loop-bulk | 「2件を選択」の下に操作が折り返され、#11と#7にチェックが付く。 [375px](screens/loop-bulk-375.png) | 一覧上部に担当・ラベル・完了・迷惑メール・解除が一列に収まる。 [1024px](screens/loop-bulk-1024.png) | 2つの黒いチェックに薄青背景、残り5件の白いチェックとの違いが分かる。 [1440px](screens/loop-bulk-1440.png) |
| loop-bulk-assignee | 担当者選択の下にmori・satoの2行。選択件数と一覧先頭の2チェックが見える。 [375px](screens/loop-bulk-assignee-375.png) | 操作帯の真下に候補。頭文字と名前は読め、完了にするボタンに重ならない。 [1024px](screens/loop-bulk-assignee-1024.png) | 候補の横にも選択中の先頭行を確認でき、右の製品と待ち時間は隠れない。 [1440px](screens/loop-bulk-assignee-1440.png) |
| loop-bulk-label | 左余白内で開いたリストに6候補。最長のラベルも全文を表示。 [375px](screens/loop-bulk-label-375.png) | 対象2件の表示と完了・解除は操作帯に残り、6候補は色と名称で区別できる。 [1024px](screens/loop-bulk-label-1024.png) | 操作帯のラベル指定の下にパネル。選択した2行のチェック欄を覆わない。 [1440px](screens/loop-bulk-label-1440.png) |
| loop-convert | 問い合わせへ変更すると返信が可能になる説明を2行で表示。2ボタンが並ぶ。 [375px](screens/loop-convert-375.png) | 背後に佐々木葵のフィードバック。中央の確認は「確認済みにする」と区別できる。 [1024px](screens/loop-convert-1024.png) | 内部メモ画面の上に変更の説明があり、右に問い合わせへ変更する主操作が収まる。 [1440px](screens/loop-convert-1440.png) |
| loop-discard | 対象は「この会話から下書き1件」。白枠内でキャンセルと破棄が独立。 [375px](screens/loop-discard-375.png) | 画面中央に削除件数と2ボタン、背後に対象の下書き欄を確認できる。 [1024px](screens/loop-discard-1024.png) | 承認送信は背後に暗く見え、手前に「下書きを破棄」が黒でひとつ表示される。 [1440px](screens/loop-discard-1440.png) |
| loop-filter-assignee | 製品「すべて」の下で担当者欄が開き、選択中の「すべて」、mori、satoが見える。 [375px](screens/loop-filter-assignee-375.png) | 担当者候補の白い枠が元の条件パネルから出ても切れず、2人の頭文字を読める。 [1024px](screens/loop-filter-assignee-1024.png) | 条件パネルと候補が右側に収まり、本文の左側・待ち時間順の操作も残る。 [1440px](screens/loop-filter-assignee-1440.png) |
| loop-filter-empty | 検索語「未回答の調査番号」と解除用の×、中央の0件の説明を同時に読める。 [375px](screens/loop-filter-empty-375.png) | 条件の下に虫眼鏡と一致しない旨が並び、左の受信箱の7件とは区別できる。 [1024px](screens/loop-filter-empty-1024.png) | 0件の見出しは検索欄の左に揃い、結果説明はコンテンツ領域の中央に配置される。 [1440px](screens/loop-filter-empty-1440.png) |
| loop-filters | 絞り込みの下に状態・製品・担当者・ラベルが縦に並び、未対応とすべての値が読める。 [375px](screens/loop-filters-375.png) | 一覧右上にメニューが開き、一番下のラベルの矢印まで表示。 [1024px](screens/loop-filters-1024.png) | 検索・並び順の間を起点に4条件を表示。状態と製品の入力は別々に読める。 [1440px](screens/loop-filters-1440.png) |
| loop-labels | 「長期契約の更新手続きについて」を全文表示し、経理・請求・領収書に個別のチェック。 [375px](screens/loop-labels-375.png) | 色丸・ラベル名・チェックが横に並び、下に新しいラベルを作成する行がある。 [1024px](screens/loop-labels-1024.png) | 選択中の3ラベルが起点とメニューで一致。右の関連情報まで被らない。 [1440px](screens/loop-labels-1440.png) |
| loop-status | 「現在の状態・未対応」の下に、完了・迷惑メールに変更する2択を表示。 [375px](screens/loop-status-375.png) | 起点の黒い未対応とメニューの現在値が一致し、担当者選択の位置とも区別できる。 [1024px](screens/loop-status-1024.png) | 本文左上に開き、現在値と2つの変更先を一列ずつ読める。 [1440px](screens/loop-status-1440.png) |
| my-inbox | sato・すべての条件の下に3件。各行の右端は担当S、#4の差出人は「渡…」になる。 [375px](screens/my-inbox-375.png) | 自分の担当3件を左で強調。失敗・未対応・返信待ちを同じ列で見分けられる。 [1024px](screens/my-inbox-1024.png) | #4・#3・#2の順に並び、本文のプレビューと担当者が重ならない。 [1440px](screens/my-inbox-1440.png) |
| suggest-composer | 記事の題名の入力に青い枠。「領収書を発行する」、宛先と送信操作も表示。 [375px](screens/suggest-composer-375.png) | 返信入力の左側に検索が開き、候補と下側の「記事を添える」を区別できる。 [1024px](screens/suggest-composer-1024.png) | 中央の候補1件と右のヘルプ記事枠が離れ、検索フォーカスが中央にある。 [1440px](screens/suggest-composer-1440.png) |
| suggest-composer-empty | 送信済みの履歴の下に候補追加、記事を添える、宛先、送信の順に表示。 [375px](screens/suggest-composer-empty-375.png) | 記事の候補追加ボタンが本文欄の下に一つあり、付近のメールアドレスを読める。 [1024px](screens/suggest-composer-empty-1024.png) | 右列のヘルプ記事と返信欄の両方に「記事の候補に追加」があり、同じ操作か迷う余地が残る。 [1440px](screens/suggest-composer-empty-1440.png) |
| thread-approval | 山田 花の依頼と代理作成者、橙の承認待ち、下書き本文を追える。 [375px](screens/thread-approval-375.png) | 白い編集欄の下に、承認して送信と下書きを破棄が並ぶ。 [1024px](screens/thread-approval-1024.png) | 代理作成の下書きの下に別の新規返信欄があり混同しない。 [1440px](screens/thread-approval-1440.png) |
| thread-attachment | 明細ファイルのリンクは「利用明細.txt」、隣は43 Bで折り返さない。 [375px](screens/thread-attachment-375.png) | 森 海斗の本文内にファイル名と青いアイコンが収まる。 [1024px](screens/thread-attachment-1024.png) | 受信カードの下に独立した返信欄、関連情報は右に表示される。 [1440px](screens/thread-attachment-1440.png) |
| thread-context | 全画面パネルでexample/helpdesk#43・会話#6の番号が読み取れる。 [375px](screens/thread-context-375.png) | 右のパネル上端に閉じる、中央に件数比較、下端に履歴が並ぶ。 [1024px](screens/thread-context-1024.png) | 本文・下書きの右に課題リンクと同じ相手の問い合わせが並び、関連情報が返信本文を狭め過ぎない。 [1440px](screens/thread-context-1440.png) |
| thread-failed | 受信者の名は渡辺 葵、customer4の完全なアドレスと拒否理由を読める。 [375px](screens/thread-failed-375.png) | 失敗したメッセージに拒否理由と再送操作がセットになっている。 [1024px](screens/thread-failed-1024.png) | 返信済み本文と赤い理由が灰色カード内にあり、下に新規返信欄がある。 [1440px](screens/thread-failed-1440.png) |
| thread-html | 2行の件名、画像非表示の説明、太字の注文番号SL-2026-128を読める。 [375px](screens/thread-html-375.png) | 画像非表示の文と購入メールの本文が別々の段落。 [1024px](screens/thread-html-1024.png) | 注文番号まで左カード内、次の返信欄や右の関連情報と混ざらない。 [1440px](screens/thread-html-1440.png) |
| thread-inbound | 領収書の依頼と注文履歴から変更できるかの質問が1枚の受信カードに入る。 [375px](screens/thread-inbound-375.png) | カードは山田 花・1時間前で、返信先customer1と一致。 [1024px](screens/thread-inbound-1024.png) | 件名の下に未対応、左に質問・返信、右にほかの問い合わせの有無が表示される。 [1440px](screens/thread-inbound-1440.png) |
| thread-note | 森 海斗の問い合わせの下に黄色のメモ。非送信の注記と作成者satoが読める。 [375px](screens/thread-note-375.png) | 黄色い記録と下の白い新規返信欄は離れている。 [1024px](screens/thread-note-1024.png) | 2時間前の内部メモとdeskの差出人をもつ新規返信を識別できる。 [1440px](screens/thread-note-1440.png) |
| thread-replied | 佐々木 葵の招待メールの質問、satoの送信済み返信が縦に並ぶ。 [375px](screens/thread-replied-375.png) | 上部の返信待ちと返信自体の送信済みは表示位置とアイコンが違う。 [1024px](screens/thread-replied-1024.png) | 同じ相手への次の返信欄が下にあり、過去の返信内容が上で保持される。 [1440px](screens/thread-replied-1440.png) |
