# 運営画面の画像レビュー

114状態・342枚。375×812、1024×900、1440×900の順に各状態を比較した。画面の目的は運営者の作業として記述した。根拠は各状態の3枚のPNG、判定の基準は同梱のDESIGN.mdとcriteria.md。メニューや通知は撮影時点の表示として扱った。送受信の成否、キャンセル操作、権限、フォーカス復帰、移動・スクロール・取り消しの実効性、実際のタップ領域・速度は未検証。

## 指摘一覧

共通原因で13件（高2件、中8件、低3件）。同じ問題を各会話・幅で繰り返し加算していない。状態ごとに見える内容は後半に記録した。

### 高　承認が必要な返信を特定しづらい

対象は3幅の一覧、375の詳細。未対応一覧の#5で「返信・お知らせいただいた問題の修正が完了しました…」のすぐ横に「承認待ち」がある。詳細の広い画面ではこの文は送信済みで、実際の承認待ちは別のメンバー数変更案。375の詳細で目立つリンクも「送信済みの返信へ」。#4の失敗には「別の返信で送信失敗」と明記される。

承認待ちの抜粋を使うか、別の返信が承認待ちと明記し、詳細では未承認の返信を優先して案内する。 [menu-home-inbox-filters・1440](screens/menu-home-inbox-filters-1440.png) [menu-conversation-5-thread-actions・375](screens/menu-conversation-5-thread-actions-375.png) [menu-conversation-5-thread-actions・1024](screens/menu-conversation-5-thread-actions-1024.png) [approval-list・375](screens/approval-list-375.png)

### 高　送信結果が不明なときに、もう一度送る操作が主ボタンのまま

対象は3幅。本文は保持され、赤い通知が別タブで結果を調べるよう案内する。その隣の返信欄には通常と同じ黒い「送信」と「送信して完了」が残る。配信されたか判断できない段階で、再送が次の手順に見える。

まず送信結果を確認する操作を主にし、再度送る際は直前の結果が不明であることを操作箇所にも伝える。実際に二重送信されるかは未確認。 [composer-failed・375](screens/composer-failed-375.png) [composer-failed・1440](screens/composer-failed-1440.png) [composer-typing・375](screens/composer-typing-375.png)

### 中　GitHubへの公開原稿の前面に取りやめる操作が見えない

対象は3幅、起票9状態。前面には投稿先、タイトル、要約と「起票内容を確認」。375・1024では関連情報パネルの「閉じる」が暗い背景に残り、1024では会話がさらに一段暗くなる。1440でも前面に閉じる操作が見えない。

公開原稿と同じ面に戻る／キャンセルを置く。Escや余白タップの可否、焦点制御は静止画では未確認。 [menu-conversation-1-notice-note-82513194-operation-issues-issues.preview・375](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-375.png) [menu-conversation-3-operation-issues-issues.preview・1024](screens/menu-conversation-3-operation-issues-issues.preview-1024.png) [menu-conversation-10-operation-issues-issues.preview・1440](screens/menu-conversation-10-operation-issues-issues.preview-1440.png)

### 中　狭い画面で空の返信欄が受信文と履歴を大きく覆う

対象は375。記事候補なしの#3・#4・#5・#7などでは空の返信欄、候補なしの説明、記事候補化、宛先、操作列が約400pxを占める。#7では森 海斗さんの名前の直後で本文と添付が隠れ、#4の失敗理由も一覧性を失う。通常の#1でも最後の質問が欄の縁で切れる。

まず依頼と対応状況が読める高さにし、返信開始後に編集や記事候補化を展開する。画面外へのスクロール可否とは別の指摘。 [menu-conversation-7-thread-actions・375](screens/menu-conversation-7-thread-actions-375.png) [menu-conversation-7-thread-actions・1024](screens/menu-conversation-7-thread-actions-1024.png) [menu-conversation-4-thread-actions・375](screens/menu-conversation-4-thread-actions-375.png) [thread-inbound・375](screens/thread-inbound-375.png)

### 中　送信前の本文冒頭が切れて読めない

対象は375、入力・送信中・結果不明の3状態。「…書の宛名を確認し、再発行の手順をご案内します。」が見える一方、最初の行は上半分が切れ、広い幅で読める「お問い合わせありがとうございます」が欠ける。

短い返信は先頭から末尾まで表示するか、少なくとも行の途中で表示を切らず、見直せることを示す。 [composer-typing・375](screens/composer-typing-375.png) [composer-sending・375](screens/composer-sending-375.png) [composer-failed・375](screens/composer-failed-375.png) [composer-typing・1024](screens/composer-typing-1024.png)

### 中　スマートフォンの受信行が多段になり、案件同士を見比べづらい

対象は375。#11では差出人だけで3行、その下に件名・抜粋・指標が別々に並ぶ。長い名前と待ち時間は残るが、件名は「部門ごとに宛名の異なる領…」。短い行でもラベルや状態が増えるたびに高さが変わる。

製品・差出人と件名・抜粋の読み順を揃え、補助指標をまとめて主要情報が比較できるようにする。 [inbox・375](screens/inbox-375.png) [all-inbox・375](screens/all-inbox-375.png) [my-inbox・375](screens/my-inbox-375.png) [inbox・1024](screens/inbox-1024.png)

### 中　送信して完了を選んだ直後、会話が完了済みか予約中か読めない

対象は3幅。属性は黒い「未対応」のままで、緑の通知は「返信の送信と会話の完了を取り消せます」。1024・1440で返信には「送信待ち」が出るが、会話の完了については同等の待機表示がない。

完了がまだなら送信後に完了予定と示し、完了済みなら状態の表示と通知を揃える。実際の確定タイミングは未確認。 [loop-reply-undo・375](screens/loop-reply-undo-375.png) [loop-reply-undo・1024](screens/loop-reply-undo-1024.png) [loop-reply-undo・1440](screens/loop-reply-undo-1440.png)

### 中　課題の修正前後を比較する際、未修正の課題も同じ操作で提示される

対象は3幅、#4・#7の比較。#4の関連情報で#42は未修正の丸点、#44は修正済みのチェック。比較の候補で先に選ばれているのは#42で、ボタンは「修正前後の件数を比較」。#7では#42だけが選択される。修正日や、修正前の課題を選ぶ意味を前面から読み取れない。

修正の有無を候補に文字で示し、比較可能な課題を最初に選ぶか、比較できない理由を説明する。計算や画面遷移は未確認。 [menu-conversation-4-operation-issues-issues.impact・1440](screens/menu-conversation-4-operation-issues-issues.impact-1440.png) [menu-conversation-4-operation-issues-issues.impact・375](screens/menu-conversation-4-operation-issues-issues.impact-375.png) [menu-conversation-7-operation-issues-issues.impact・375](screens/menu-conversation-7-operation-issues-issues.impact-375.png)

### 中　承認前後を示す文言が送信確認の中で一致しない

対象は3幅。背後は「承認待ち」で前面ボタンは「承認して送信」。確認本文はすでに「承認済みの返信を送信します」と読める。

今押すと承認と送信を行うことを、確認本文も同じ時制で示す。 [approval-confirm・375](screens/approval-confirm-375.png) [approval-confirm・1024](screens/approval-confirm-1024.png)

### 中　状態メニューの先頭で現在値の説明とフォーカス枠が接する

対象は3幅、キーボードフォーカスを示す状態メニュー。現在の状態を伝える1行の下に「完了にする」の青い枠がすぐ接し、文字の下線のように見える。375の#2では「返信待ち」の下に青線が渡る。

現在値の説明と最初の選択肢との間に、フォーカス枠を含む余白を取る。 [menu-conversation-1-thread-status・375](screens/menu-conversation-1-thread-status-375.png) [menu-conversation-2-thread-status・375](screens/menu-conversation-2-thread-status-375.png) [menu-conversation-4-thread-status・1024](screens/menu-conversation-4-thread-status-1024.png)

### 低　案件に記事を添える検索面が画面の片端に接する

対象は375。入力欄・候補は読めるが、記事選択の白い面は右の画素境界に達し、左にのみ余白が残る。

左右の外側に一定の余白を確保する。 [suggest-composer・375](screens/suggest-composer-375.png) [suggest-composer・1024](screens/suggest-composer-1024.png)

### 低　確認画面で送信に関する説明と本文の境目が弱い

対象は3幅。承認確認では、宛先を含む説明の直後に下書きが同じ文字色と行間で続き、どこからが顧客に届く文か視線を戻して確認する。

宛先と送信本文を見出しまたは余白で区別する。 [approval-confirm・375](screens/approval-confirm-375.png) [approval-confirm・1440](screens/approval-confirm-1440.png)

### 低　キーの組み合わせが行末で分断される

対象は375。「Cmd / Ctrl +」と「Enter で送信」が別行になり、一覧を一瞥してショートカットを取り出しにくい。

キーの組み合わせをひとまとまりにして折り返す。1024の画像ではEnterまで1行に収まる。 [loop-keyboard・375](screens/loop-keyboard-375.png) [loop-keyboard・1024](screens/loop-keyboard-1024.png)

## 状態別の記録

各項目の3問には、画像で読み取れた値・文言・配置を記した。幅の比較は最後の1行にまとめた。各状態の末尾から、その幅の原寸PNGを開ける。

### 001　全製品の会話から次に見る案件を決める

運営者が全製品の会話から次に見る案件を決めるために開く。

- 範囲は？ すべて10件、すべての状態が条件。
- 最長の待ちは？ 先頭の#11が11時間。
- 状態の違いは？ #5は承認待ち、#4は送信失敗。

375は#11の差出人が3行を占める。1024は2行、1440は1行に収まる。　[375](screens/all-inbox-375.png) / [1024](screens/all-inbox-1024.png) / [1440](screens/all-inbox-1440.png)

### 002　人に届く返信の内容を承認前に確かめる

運営者が人に届く返信の内容を承認前に確かめるために開く。

- 誰に届く？ customer5@example.net。
- 何を送る？ 更新時の人数変更と希望人数を聞く文章。
- どう判断する？ キャンセルと黒い「承認して送信」が並ぶ。

375はほぼ全幅、1024・1440は中央の小窓。背景の承認待ちと説明の「承認済み」は時制が異なる。　[375](screens/approval-confirm-375.png) / [1024](screens/approval-confirm-1024.png) / [1440](screens/approval-confirm-1440.png)

### 003　人の承認を要する下書きを探す

運営者が人の承認を要する下書きを探すために開く。

- 何件ある？ 承認待ち1件。
- どの会話？ Slideの山田 花さん、#5、5時間待ち。
- 相手の文と区別できる？ 抜粋先頭が「下書き」、砂時計と「承認待ち」もある。

375は件名末尾が省略され、黒い未対応と橙の承認待ちが次の段に並ぶ。1024・1440は右側に揃う。　[375](screens/approval-list-375.png) / [1024](screens/approval-list-1024.png) / [1440](screens/approval-list-1440.png)

### 004　領収書の照会に返信を書き始める

運営者が領収書の照会に返信を書き始めるために開く。

- 対象は？ Slideの#1、山田 花さん。
- 宛先は？ customer1@example.net。
- いま送れそうか？ 入力欄は空、「送信」「送信して完了」は薄い灰色。

375は宛先が2行で、上の固定帯に件名の頭がかかる。1024は会話列、1440は相手の関連情報を併記。　[375](screens/composer-empty-375.png) / [1024](screens/composer-empty-1024.png) / [1440](screens/composer-empty-1440.png)

### 005　送信結果を確認し、同じ返信の二重送信を避ける

運営者が送信結果を確認し、同じ返信の二重送信を避けるために開く。

- 何が起きた？ 赤い通知は「送信結果を確認できませんでした」。
- 原稿は残った？ 保持の説明と再発行案内の本文が見える。
- 次はどこ？ 「別のタブで送信結果を確認」がある一方、黒い「送信」も見える。

375は通知が受信文を覆い、入力欄冒頭が途切れる。1024・1440では本文を読める。　[375](screens/composer-failed-375.png) / [1024](screens/composer-failed-1024.png) / [1440](screens/composer-failed-1440.png)

### 006　顧客に届かない経理確認のメモを書く

運営者が顧客に届かない経理確認のメモを書くために開く。

- いまのモードは？ 内部メモを選択、入力欄も黄色。
- 内容は？ 次回の請求日までに経理担当へ確認する。
- 保存するときの表示は？ 「相手には送られません」と「メモを残す」。

375でもメモと非送信の説明が一緒に見える。1024・1440では入力欄が会話列幅に広がる。　[375](screens/composer-note-375.png) / [1024](screens/composer-note-1024.png) / [1440](screens/composer-note-1440.png)

### 007　入力した返信が送信中かを見分ける

運営者が入力した返信が送信中かを見分けるために開く。

- 何の返信？ #1、領収書再発行を案内する文。
- 進行中の印は？ 最下部の「送信中…」。
- 別の送信手段は？ 「送信して完了」も薄い灰色。

375では本文先頭の半行が切れる。1024・1440では本文は1行で読める。　[375](screens/composer-sending-375.png) / [1024](screens/composer-sending-1024.png) / [1440](screens/composer-sending-1440.png)

### 008　入力済みの案内文と送信先を点検する

運営者が入力済みの案内文と送信先を点検するために開く。

- 何を案内する？ 領収書の宛名を確認して再発行を案内する。
- どこを編集中？ 返信本文に青い枠。
- どこへ送る？ 差出人support@example.com、宛先customer1@example.net。

375は先頭行が上端で切れる。1024・1440では全文とプレビュー・送信系2ボタンが見える。　[375](screens/composer-typing-375.png) / [1024](screens/composer-typing-1024.png) / [1440](screens/composer-typing-1440.png)

### 009　未対応の着手順を決める

運営者が未対応の着手順を決めるために開く。

- 件数は？ 未対応7件。
- 次に待ちが長いのは？ #11が11時間、次の#7が7時間。
- 注意すべき会話は？ #5に承認待ち、#4に送信失敗。

375は長い差出人の#11が約140pxを占め、#1まで見渡せない。1024・1440は7行を表示。　[375](screens/inbox-375.png) / [1024](screens/inbox-1024.png) / [1440](screens/inbox-1440.png)

### 010　未対応がないとき別の仕事へ移る

運営者が未対応がないとき別の仕事へ移るために開く。

- 現在の件数は？ 未対応0件。
- 読み込み中と違う目印は？ トレイの線画と「未対応の問い合わせはありません」。
- 次の入口は？ 「すべての会話を見る」。

375は説明の下に入口、1024・1440は同じ行に入口。　[375](screens/inbox-empty-375.png) / [1024](screens/inbox-empty-1024.png) / [1440](screens/inbox-empty-1440.png)

### 011　請求ラベル内で送信失敗を見付ける

運営者が請求ラベル内で送信失敗を見付けるために開く。

- 対象は？ 未対応2件、請求チップ。
- どれが失敗？ #4渡辺 葵さん、赤い送信失敗。
- ほかの対象は？ #1山田 花さん、1時間待ち。

375はチップが抜粋の下、1024・1440は抜粋と同じ段。リストの取得エラー画面ではない。　[375](screens/inbox-failed-375.png) / [1024](screens/inbox-failed-1024.png) / [1440](screens/inbox-failed-1440.png)

### 012　選んだ製品と担当者の案件を確認する

運営者が選んだ製品と担当者の案件を確認するために開く。

- 誰の担当？ 佐藤 優。
- 製品と件数は？ Desk、1件。
- 何が残っている？ #3森 海斗さん、未対応で3時間待ち。

375は件名・内部メモの末尾が省略、1024・1440は請求書送付先の件名が読める。　[375](screens/inbox-filter-375.png) / [1024](screens/inbox-filter-1024.png) / [1440](screens/inbox-filter-1440.png)

### 013　領収書の検索結果が戻るのを待つ

運営者が領収書の検索結果が戻るのを待つために開く。

- 検索語は？ 青枠の欄に「領収書」。
- 結果はまだか？ 行の代わりに長さの違う灰色の棒3本。
- 見出しは？ 取得中にも「未対応7件」が残る。

375は棒が検索操作の下、1024・1440は検索と絞り込みが同じ行。7件が今回の検索結果かはこの時点では分からない。　[375](screens/inbox-loading-375.png) / [1024](screens/inbox-loading-1024.png) / [1440](screens/inbox-loading-1440.png)

### 014　#1で通常操作以外の整理方法を選ぶ

運営者が#1で通常操作以外の整理方法を選ぶために開く。

- 入口は？ 青い「その他の操作」。
- 後回しにできる？ 「スヌーズ」に展開記号。
- ほかの候補は？ 「迷惑メールにする」。

375ではメニューが件名に重なる。1024・1440はツールバー右側、件名は左に残る。　[375](screens/loop-actions-375.png) / [1024](screens/loop-actions-1024.png) / [1440](screens/loop-actions-1440.png)

### 015　#1を担当者へ割り振る

運営者が#1を担当者へ割り振るために開く。

- 現在の担当は？ チェック付き「担当なし」。
- 候補は？ 佐藤 優と森 直子。
- どこから開いている？ 「担当者を選ぶ」の青い枠。

375では右側に寄せて収め、選択印・マーク・名称の列が揃う。1024・1440は属性列の下に開く。　[375](screens/loop-assignee-375.png) / [1024](screens/loop-assignee-1024.png) / [1440](screens/loop-assignee-1440.png)

### 016　複数の未対応をまとめて処理する

運営者が複数の未対応をまとめて処理するために開く。

- 何件選んだ？ 2件を選択中。
- どれを選んだ？ #11と#7にチェックと淡青背景。
- どの操作がある？ 選択解除、担当者・ラベル、完了・迷惑メール。

375は一括操作が3段、1024・1440は1段。各幅とも全選択は横棒。　[375](screens/loop-bulk-375.png) / [1024](screens/loop-bulk-1024.png) / [1440](screens/loop-bulk-1440.png)

### 017　選んだ2件の担当者を決める

運営者が選んだ2件の担当者を決めるために開く。

- 対象は？ #11と#7、背景が淡青。
- 候補の人は？ 佐藤 優と森 直子。
- 選択中の入口は？ 担当者ボタンに青い枠。

375では候補が次段の一括操作の一部に重なり、1024・1440は1段の操作列の下。　[375](screens/loop-bulk-assignee-375.png) / [1024](screens/loop-bulk-assignee-1024.png) / [1440](screens/loop-bulk-assignee-1440.png)

### 018　2件に共通のラベルを付ける

運営者が2件に共通のラベルを付けるために開く。

- 対象は？ 2件を選択中。
- 一部だけにある印は？ 再発行等に横棒、説明が「選ぶと、選択中のすべての会話に付きます」。
- どんな候補がある？ 請求、領収書、長期契約の更新手続きについて等の6件。

375でも長い名前は1行、1024・1440は操作列の直下に候補と説明を表示。　[375](screens/loop-bulk-label-375.png) / [1024](screens/loop-bulk-label-1024.png) / [1440](screens/loop-bulk-label-1440.png)

### 019　未対応一覧を担当者で絞り込む

運営者が未対応一覧を担当者で絞り込むために開く。

- 対象の状態は？ 未対応。
- 現在の担当条件は？ 「すべて」にチェック。
- 誰が候補？ 佐藤 優、森 直子。

375は絞り込み面の下に人名一覧が重なる。1024・1440でも親の担当欄と子の候補が同時に見える。　[375](screens/loop-filter-assignee-375.png) / [1024](screens/loop-filter-assignee-1024.png) / [1440](screens/loop-filter-assignee-1440.png)

### 020　検索に一致する案件がない理由を見直す

運営者が検索に一致する案件がない理由を見直すために開く。

- 検索語は？ 未回答の調査番号。
- 結果は？ 0件、虫眼鏡と該当なしの説明。
- 戻る手掛かりは？ 「絞り込みを解除」と検索チップの×。

375は解除が説明の次行、1024・1440は横並び。　[375](screens/loop-filter-empty-375.png) / [1024](screens/loop-filter-empty-1024.png) / [1440](screens/loop-filter-empty-1440.png)

### 021　一覧の絞り込み条件を点検する

運営者が一覧の絞り込み条件を点検するために開く。

- 状態は？ 未対応。
- 製品・担当は？ いずれも「すべて」。
- 対象ラベルは？ すべてのラベル。

375は件名一覧の上を覆う。1024・1440は検索右側のボタンを起点に4項目が縦に並ぶ。　[375](screens/loop-filters-375.png) / [1024](screens/loop-filters-1024.png) / [1440](screens/loop-filters-1440.png)

### 022　一覧と会話で使えるキーを調べる

運営者が一覧と会話で使えるキーを調べるために開く。

- 次の行へは？ j、前はk。
- 返信とメモは？ rで返信、nで内部メモ。
- 説明を閉じるには？ Escと青い枠の「閉じる」。

3幅とも中央の説明窓。375ではCmd / Ctrl + Enterが2行にまたがる。　[375](screens/loop-keyboard-375.png) / [1024](screens/loop-keyboard-1024.png) / [1440](screens/loop-keyboard-1440.png)

### 023　#1に付いた分類を点検する

運営者が#1に付いた分類を点検するために開く。

- 現在は？ 経理、請求、領収書の3件にチェック。
- 選べる別候補は？ 再発行、社内確認、長期契約の更新手続きについて。
- 候補にない場合は？ 「新しいラベルを作成」と「ラベルを管理」。

375は返信欄にかかるが全候補が読める。1024・1440は見出しの属性行直下で開く。　[375](screens/loop-labels-375.png) / [1024](screens/loop-labels-1024.png) / [1440](screens/loop-labels-1440.png)

### 024　行を開かず最初の未対応を処理する

運営者が行を開かず最初の未対応を処理するために開く。

- 対象行は？ #11が青枠、チェックは空。
- どんな操作が見える？ 人に＋と箱の図形。
- どの案件？ 先頭の長い経理窓口名、11時間待ち。

375は操作図形が行の内側下段、1024・1440はフォーカス枠の右外。図形の操作名は画像にない。　[375](screens/loop-quick-actions-375.png) / [1024](screens/loop-quick-actions-1024.png) / [1440](screens/loop-quick-actions-1440.png)

### 025　領収書の案内がどう届くかを確認する

運営者が領収書の案内がどう届くかを確認するために開く。

- 差出人と宛先は？ support@example.comからcustomer1@example.net。
- 件名は？ Re: 領収書の宛名を変更できますか [#1]。
- 本文は？ 領収書は購入履歴から再発行できます。

375では入力欄のタブが上端で切れ、プレビュー末尾までで送信ボタンは画面外。1024・1440もプレビューが下部を占める。　[375](screens/loop-reply-preview-375.png) / [1024](screens/loop-reply-preview-1024.png) / [1440](screens/loop-reply-preview-1440.png)

### 026　送信待ちの返信を取り消せるか判断する

運営者が送信待ちの返信を取り消せるか判断するために開く。

- どの返信？ 広い幅では佐藤 優による購入履歴からの発行案内、送信待ち。
- 何を取り消せる？ 緑の通知に「返信の送信と会話の完了」。
- どこから？ 通知の「取り消す」。

375は見出しに「送信待ちの返信へ」。1024・1440では返信の送信待ちと属性の未対応が同時に見える。　[375](screens/loop-reply-undo-375.png) / [1024](screens/loop-reply-undo-1024.png) / [1440](screens/loop-reply-undo-1440.png)

### 027　#1の処理状態を変更する

運営者が#1の処理状態を変更するために開く。

- 現在は？ 「現在の状態・未対応」。
- 通常の次の操作は？ 完了にする。
- 除外する場合は？ 迷惑メールにする。

375ではポップアップが件名の下、1024・1440は状態チップの直下。3幅で状態名がボタンとメニューの両方に出る。　[375](screens/loop-status-375.png) / [1024](screens/loop-status-1024.png) / [1440](screens/loop-status-1440.png)

### 028　メモ保存後、問い合わせをヘルプ記事の候補にする

運営者がメモ保存後、問い合わせをヘルプ記事の候補にするために開く。

- 出典は？ #1「領収書の宛名を変更できますか」。
- 何を入力？ 「記事にする内容」が空で青い枠。
- 登録先は？ 入力直下の「記事の候補に追加」。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。1024・1440の背後では黄色い保存済みの経理メモと緑の保存通知が残る。　[375](screens/menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest-375.png) / [1024](screens/menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest-1024.png) / [1440](screens/menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest-1440.png)

### 029　メモ保存後、公開するGitHub課題の原稿を用意する

運営者がメモ保存後、公開するGitHub課題の原稿を用意するために開く。

- 起点は？ 問い合わせ#1「領収書の宛名を変更できますか」。
- どこに公開？ 投稿先はexample/helpdesk。
- 確認前に何を書く？ 空のタイトルと公開する要約。前面の唯一のボタンは「起票内容を確認」。

375は関連情報の前に白い入力面、1024は背景と右パネルの二段の濃淡、1440は暗転した右列に入力面。入力面にキャンセルは見えない。　[375](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-375.png) / [1024](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-1024.png) / [1440](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-1440.png)

### 030　メモ保存後、同じ相手との会話を統合する前に対象を照合する

運営者がメモ保存後、同じ相手との会話を統合する前に対象を照合するために開く。

- 統合元は？ #1「領収書の宛名を変更できますか」。
- 統合先は？ #2「ワークスペースの招待メールについて」が選択済み。
- 次は？ 「この会話を統合する内容を確認」。対象候補は1件。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。3幅とも元と先の番号を同じ選択面で読める。　[375](screens/menu-conversation-1-notice-note-82513194-operation-merge-merge.combine-375.png) / [1024](screens/menu-conversation-1-notice-note-82513194-operation-merge-merge.combine-1024.png) / [1440](screens/menu-conversation-1-notice-note-82513194-operation-merge-merge.combine-1440.png)

### 031　メモ保存後、山田 花さん宛ての受付返信を下書きにする

運営者がメモ保存後、山田 花さん宛ての受付返信を下書きにするために開く。

- 候補は？ 「お問い合わせの受付」にラジオ印。
- 誰向けの文？ 「Hello 山田 花, thank you for contacting Slide.」と展開済み。
- 次の操作は？ 「定型文から下書きを作成」。

375は定型文ボタンの上に候補。1024・1440は返信欄内のボタンの上に表示。　[375](screens/menu-conversation-1-notice-note-82513194-reply-templates-375.png) / [1024](screens/menu-conversation-1-notice-note-82513194-reply-templates-1024.png) / [1440](screens/menu-conversation-1-notice-note-82513194-reply-templates-1440.png)

### 032　メモ保存後、#1「領収書の宛名を変更できますか」の補助操作を探す

運営者がメモ保存後、#1「領収書の宛名を変更できますか」の補助操作を探すために開く。

- どこから？ ツールバーの「その他の操作」が青い。
- 先頭項目は？ 展開記号付き「スヌーズ」。
- この案件のほかの処理は？ さらに「迷惑メールにする」がある。

375は開いた面が件名中央に重なる。1024・1440は同じメニューが右上。黄色い保存済みの経理メモと緑の保存通知が残る。　[375](screens/menu-conversation-1-notice-note-82513194-thread-actions-375.png) / [1024](screens/menu-conversation-1-notice-note-82513194-thread-actions-1024.png) / [1440](screens/menu-conversation-1-notice-note-82513194-thread-actions-1440.png)

### 033　メモ保存後、#1「領収書の宛名を変更できますか」の担当を照合する

運営者がメモ保存後、#1「領収書の宛名を変更できますか」の担当を照合するために開く。

- いまの担当は？ 「担当なし」にチェック。
- 交代候補は？ 佐藤 優と森 直子、担当なしの3択。
- フォーカスは？ 先頭の「担当なし」に青枠、現在値は灰色。

375は属性の下に人名一覧、1024・1440も属性が起点。黄色い保存済みの経理メモと緑の保存通知が残る。　[375](screens/menu-conversation-1-notice-note-82513194-thread-assignee-375.png) / [1024](screens/menu-conversation-1-notice-note-82513194-thread-assignee-1024.png) / [1440](screens/menu-conversation-1-notice-note-82513194-thread-assignee-1440.png)

### 034　メモ保存後、#1「領収書の宛名を変更できますか」を分類する

運営者がメモ保存後、#1「領収書の宛名を変更できますか」を分類するために開く。

- 登録済みの分類は？ 経理・請求・領収書の3項目。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。黄色い保存済みの経理メモと緑の保存通知が残る。　[375](screens/menu-conversation-1-notice-note-82513194-thread-labels-375.png) / [1024](screens/menu-conversation-1-notice-note-82513194-thread-labels-1024.png) / [1440](screens/menu-conversation-1-notice-note-82513194-thread-labels-1440.png)

### 035　メモ保存後、#1「領収書の宛名を変更できますか」の状態を変更する

運営者がメモ保存後、#1「領収書の宛名を変更できますか」の状態を変更するために開く。

- 現在は？ 属性チップと「現在の状態」はともに未対応。
- フォーカスは？ 「完了にする」に青枠。
- ほかの行き先は？ 迷惑メールにする。

375では開いたボタンの下に選択面。1024・1440は属性が一列に収まり、同じ位置関係。黄色い保存済みの経理メモと緑の保存通知が残る。　[375](screens/menu-conversation-1-notice-note-82513194-thread-status-375.png) / [1024](screens/menu-conversation-1-notice-note-82513194-thread-status-1024.png) / [1440](screens/menu-conversation-1-notice-note-82513194-thread-status-1440.png)

### 036　問い合わせをヘルプ記事の候補にする

運営者が問い合わせをヘルプ記事の候補にするために開く。

- 出典は？ #1「領収書の宛名を変更できますか」。
- 何を入力？ 「記事にする内容」が空で青い枠。
- 登録先は？ 入力直下の「記事の候補に追加」。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。1024・1440の背後では山田 花さんが会社名への変更を希望している。　[375](screens/menu-conversation-1-operation-articles-articles.suggest-375.png) / [1024](screens/menu-conversation-1-operation-articles-articles.suggest-1024.png) / [1440](screens/menu-conversation-1-operation-articles-articles.suggest-1440.png)

### 037　公開するGitHub課題の原稿を用意する

運営者が公開するGitHub課題の原稿を用意するために開く。

- 起点は？ 問い合わせ#1「領収書の宛名を変更できますか」。
- どこに公開？ 投稿先はexample/helpdesk。
- 確認前に何を書く？ 空のタイトルと公開する要約。前面の唯一のボタンは「起票内容を確認」。

375は関連情報の前に白い入力面、1024は背景と右パネルの二段の濃淡、1440は暗転した右列に入力面。入力面にキャンセルは見えない。　[375](screens/menu-conversation-1-operation-issues-issues.preview-375.png) / [1024](screens/menu-conversation-1-operation-issues-issues.preview-1024.png) / [1440](screens/menu-conversation-1-operation-issues-issues.preview-1440.png)

### 038　同じ相手との会話を統合する前に対象を照合する

運営者が同じ相手との会話を統合する前に対象を照合するために開く。

- 統合元は？ #1「領収書の宛名を変更できますか」。
- 統合先は？ #2「ワークスペースの招待メールについて」が選択済み。
- 次は？ 「この会話を統合する内容を確認」。対象候補は1件。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。3幅とも元と先の番号を同じ選択面で読める。　[375](screens/menu-conversation-1-operation-merge-merge.combine-375.png) / [1024](screens/menu-conversation-1-operation-merge-merge.combine-1024.png) / [1440](screens/menu-conversation-1-operation-merge-merge.combine-1440.png)

### 039　山田 花さん宛ての受付返信を下書きにする

運営者が山田 花さん宛ての受付返信を下書きにするために開く。

- 候補は？ 「お問い合わせの受付」にラジオ印。
- 誰向けの文？ 「Hello 山田 花, thank you for contacting Slide.」と展開済み。
- 次の操作は？ 「定型文から下書きを作成」。

375は定型文ボタンの上に候補。1024・1440は返信欄内のボタンの下に表示。　[375](screens/menu-conversation-1-reply-templates-375.png) / [1024](screens/menu-conversation-1-reply-templates-1024.png) / [1440](screens/menu-conversation-1-reply-templates-1440.png)

### 040　#1「領収書の宛名を変更できますか」の補助操作を探す

運営者が#1「領収書の宛名を変更できますか」の補助操作を探すために開く。

- どこから？ ツールバーの「その他の操作」が青い。
- 先頭項目は？ 展開記号付き「スヌーズ」。
- この案件のほかの処理は？ さらに「迷惑メールにする」がある。

375は開いた面が件名中央に重なる。1024・1440は同じメニューが右上。山田 花さんが会社名への変更を希望している。　[375](screens/menu-conversation-1-thread-actions-375.png) / [1024](screens/menu-conversation-1-thread-actions-1024.png) / [1440](screens/menu-conversation-1-thread-actions-1440.png)

### 041　#1「領収書の宛名を変更できますか」の担当を照合する

運営者が#1「領収書の宛名を変更できますか」の担当を照合するために開く。

- いまの担当は？ 「担当なし」にチェック。
- 交代候補は？ 佐藤 優と森 直子、担当なしの3択。
- フォーカスは？ 先頭の「担当なし」に青枠、現在値は灰色。

375は属性の下に人名一覧、1024・1440も属性が起点。山田 花さんが会社名への変更を希望している。　[375](screens/menu-conversation-1-thread-assignee-375.png) / [1024](screens/menu-conversation-1-thread-assignee-1024.png) / [1440](screens/menu-conversation-1-thread-assignee-1440.png)

### 042　#1「領収書の宛名を変更できますか」を分類する

運営者が#1「領収書の宛名を変更できますか」を分類するために開く。

- 登録済みの分類は？ 経理・請求・領収書の3項目。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。山田 花さんが会社名への変更を希望している。　[375](screens/menu-conversation-1-thread-labels-375.png) / [1024](screens/menu-conversation-1-thread-labels-1024.png) / [1440](screens/menu-conversation-1-thread-labels-1440.png)

### 043　#1「領収書の宛名を変更できますか」の状態を変更する

運営者が#1「領収書の宛名を変更できますか」の状態を変更するために開く。

- 現在は？ 属性チップと「現在の状態」はともに未対応。
- フォーカスは？ 「完了にする」に青枠。
- ほかの行き先は？ 迷惑メールにする。

375では開いたボタンの下に選択面。1024・1440は属性が一列に収まり、同じ位置関係。山田 花さんが会社名への変更を希望している。　[375](screens/menu-conversation-1-thread-status-375.png) / [1024](screens/menu-conversation-1-thread-status-1024.png) / [1440](screens/menu-conversation-1-thread-status-1440.png)

### 044　公開するGitHub課題の原稿を用意する

運営者が公開するGitHub課題の原稿を用意するために開く。

- 起点は？ フィードバック#10「運営画面をキーボードで使っています」。
- どこに公開？ 投稿先はexample/helpdesk。
- 確認前に何を書く？ 空のタイトルと公開する要約。前面の唯一のボタンは「起票内容を確認」。

375は関連情報の前に白い入力面、1024は背景と右パネルの二段の濃淡、1440は暗転した右列に入力面。入力面にキャンセルは見えない。　[375](screens/menu-conversation-10-operation-issues-issues.preview-375.png) / [1024](screens/menu-conversation-10-operation-issues-issues.preview-1024.png) / [1440](screens/menu-conversation-10-operation-issues-issues.preview-1440.png)

### 045　#10「運営画面をキーボードで使っています」を分類する

運営者が#10「運営画面をキーボードで使っています」を分類するために開く。

- 登録済みの分類は？ チェック付きの項目なし。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。佐々木 葵さんのフィードバックの下は黄色い内部メモ欄。　[375](screens/menu-conversation-10-thread-labels-375.png) / [1024](screens/menu-conversation-10-thread-labels-1024.png) / [1440](screens/menu-conversation-10-thread-labels-1440.png)

### 046　問い合わせをヘルプ記事の候補にする

運営者が問い合わせをヘルプ記事の候補にするために開く。

- 出典は？ #2「ワークスペースの招待メールについて」。
- 何を入力？ 「記事にする内容」が空で青い枠。
- 登録先は？ 入力直下の「記事の候補に追加」。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。1024・1440の背後では招待再送の返信とGitHub Issue拡張が作った別の下書きが並ぶ。　[375](screens/menu-conversation-2-operation-articles-articles.suggest-375.png) / [1024](screens/menu-conversation-2-operation-articles-articles.suggest-1024.png) / [1440](screens/menu-conversation-2-operation-articles-articles.suggest-1440.png)

### 047　#2「ワークスペースの招待メールについて」に関連する修正前後の件数を調べる

運営者が#2「ワークスペースの招待メールについて」に関連する修正前後の件数を調べるために開く。

- 対象課題は？ 領収書の宛名を変更できるようにする（#43）。
- 期間は？ 30日間が選択済み。
- 次の操作は？ 「修正前後の件数を比較」。結果値はまだ画面にない。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。375では選択面が元ボタンの上、1024・1440では下にある。　[375](screens/menu-conversation-2-operation-issues-issues.impact-375.png) / [1024](screens/menu-conversation-2-operation-issues-issues.impact-1024.png) / [1440](screens/menu-conversation-2-operation-issues-issues.impact-1440.png)

### 048　公開するGitHub課題の原稿を用意する

運営者が公開するGitHub課題の原稿を用意するために開く。

- 起点は？ 問い合わせ#2「ワークスペースの招待メールについて」。
- どこに公開？ 投稿先はexample/helpdesk。
- 確認前に何を書く？ 空のタイトルと公開する要約。前面の唯一のボタンは「起票内容を確認」。

375は関連情報の前に白い入力面、1024は背景と右パネルの二段の濃淡、1440は暗転した右列に入力面。入力面にキャンセルは見えない。　[375](screens/menu-conversation-2-operation-issues-issues.preview-375.png) / [1024](screens/menu-conversation-2-operation-issues-issues.preview-1024.png) / [1440](screens/menu-conversation-2-operation-issues-issues.preview-1440.png)

### 049　同じ相手との会話を統合する前に対象を照合する

運営者が同じ相手との会話を統合する前に対象を照合するために開く。

- 統合元は？ #2「ワークスペースの招待メールについて」。
- 統合先は？ #1「領収書の宛名を変更できますか」が選択済み。
- 次は？ 「この会話を統合する内容を確認」。対象候補は1件。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。3幅とも元と先の番号を同じ選択面で読める。　[375](screens/menu-conversation-2-operation-merge-merge.combine-375.png) / [1024](screens/menu-conversation-2-operation-merge-merge.combine-1024.png) / [1440](screens/menu-conversation-2-operation-merge-merge.combine-1440.png)

### 050　山田 花さん宛ての受付返信を下書きにする

運営者が山田 花さん宛ての受付返信を下書きにするために開く。

- 候補は？ 「お問い合わせの受付」にラジオ印。
- 誰向けの文？ 「Hello 山田 花, thank you for contacting Slide.」と展開済み。
- 次の操作は？ 「定型文から下書きを作成」。

375は定型文ボタンの上に候補。1024・1440は返信欄内のボタンの上に表示。　[375](screens/menu-conversation-2-reply-templates-375.png) / [1024](screens/menu-conversation-2-reply-templates-1024.png) / [1440](screens/menu-conversation-2-reply-templates-1440.png)

### 051　#2「ワークスペースの招待メールについて」の補助操作を探す

運営者が#2「ワークスペースの招待メールについて」の補助操作を探すために開く。

- どこから？ ツールバーの「その他の操作」が青い。
- 先頭項目は？ 展開記号付き「スヌーズ」。
- この案件のほかの処理は？ 返信待ちなので「未対応に戻す」もある。

375は開いた面が件名中央に重なる。1024・1440は同じメニューが右上。招待再送の返信とGitHub Issue拡張が作った別の下書きが並ぶ。　[375](screens/menu-conversation-2-thread-actions-375.png) / [1024](screens/menu-conversation-2-thread-actions-1024.png) / [1440](screens/menu-conversation-2-thread-actions-1440.png)

### 052　#2「ワークスペースの招待メールについて」の担当を照合する

運営者が#2「ワークスペースの招待メールについて」の担当を照合するために開く。

- いまの担当は？ 「佐藤 優」にチェック。
- 交代候補は？ 佐藤 優と森 直子、担当なしの3択。
- フォーカスは？ 先頭の「担当なし」に青枠、現在値は灰色。

375は属性の下に人名一覧、1024・1440も属性が起点。招待再送の返信とGitHub Issue拡張が作った別の下書きが並ぶ。　[375](screens/menu-conversation-2-thread-assignee-375.png) / [1024](screens/menu-conversation-2-thread-assignee-1024.png) / [1440](screens/menu-conversation-2-thread-assignee-1440.png)

### 053　#2「ワークスペースの招待メールについて」を分類する

運営者が#2「ワークスペースの招待メールについて」を分類するために開く。

- 登録済みの分類は？ チェック付きの項目なし。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。招待再送の返信とGitHub Issue拡張が作った別の下書きが並ぶ。　[375](screens/menu-conversation-2-thread-labels-375.png) / [1024](screens/menu-conversation-2-thread-labels-1024.png) / [1440](screens/menu-conversation-2-thread-labels-1440.png)

### 054　#2「ワークスペースの招待メールについて」の状態を変更する

運営者が#2「ワークスペースの招待メールについて」の状態を変更するために開く。

- 現在は？ 属性チップと「現在の状態」はともに返信待ち。
- フォーカスは？ 「完了にする」に青枠。
- ほかの行き先は？ 未対応に戻す、迷惑メールにする。

375では開いたボタンの下に選択面。1024・1440は属性が一列に収まり、同じ位置関係。招待再送の返信とGitHub Issue拡張が作った別の下書きが並ぶ。　[375](screens/menu-conversation-2-thread-status-375.png) / [1024](screens/menu-conversation-2-thread-status-1024.png) / [1440](screens/menu-conversation-2-thread-status-1440.png)

### 055　問い合わせをヘルプ記事の候補にする

運営者が問い合わせをヘルプ記事の候補にするために開く。

- 出典は？ #3「更新前に請求書の送付先を確認したい」。
- 何を入力？ 「記事にする内容」が空で青い枠。
- 登録先は？ 入力直下の「記事の候補に追加」。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。1024・1440の背後では佐藤 優の黄色い内部メモに次回請求前日の案内予定がある。　[375](screens/menu-conversation-3-operation-articles-articles.suggest-375.png) / [1024](screens/menu-conversation-3-operation-articles-articles.suggest-1024.png) / [1440](screens/menu-conversation-3-operation-articles-articles.suggest-1440.png)

### 056　公開するGitHub課題の原稿を用意する

運営者が公開するGitHub課題の原稿を用意するために開く。

- 起点は？ 問い合わせ#3「更新前に請求書の送付先を確認したい」。
- どこに公開？ 投稿先はexample/desk。
- 確認前に何を書く？ 空のタイトルと公開する要約。前面の唯一のボタンは「起票内容を確認」。

375は関連情報の前に白い入力面、1024は背景と右パネルの二段の濃淡、1440は暗転した右列に入力面。入力面にキャンセルは見えない。　[375](screens/menu-conversation-3-operation-issues-issues.preview-375.png) / [1024](screens/menu-conversation-3-operation-issues-issues.preview-1024.png) / [1440](screens/menu-conversation-3-operation-issues-issues.preview-1440.png)

### 057　森 海斗さん宛ての受付返信を下書きにする

運営者が森 海斗さん宛ての受付返信を下書きにするために開く。

- 候補は？ 「お問い合わせの受付」にラジオ印。
- 誰向けの文？ 「Hello 森 海斗, thank you for contacting Desk.」と展開済み。
- 次の操作は？ 「定型文から下書きを作成」。

375は定型文ボタンの上に候補。1024・1440は返信欄内のボタンの上に表示。　[375](screens/menu-conversation-3-reply-templates-375.png) / [1024](screens/menu-conversation-3-reply-templates-1024.png) / [1440](screens/menu-conversation-3-reply-templates-1440.png)

### 058　#3「更新前に請求書の送付先を確認したい」の補助操作を探す

運営者が#3「更新前に請求書の送付先を確認したい」の補助操作を探すために開く。

- どこから？ ツールバーの「その他の操作」が青い。
- 先頭項目は？ 展開記号付き「スヌーズ」。
- この案件のほかの処理は？ さらに「迷惑メールにする」がある。

375は開いた面が件名中央に重なる。1024・1440は同じメニューが右上。佐藤 優の黄色い内部メモに次回請求前日の案内予定がある。　[375](screens/menu-conversation-3-thread-actions-375.png) / [1024](screens/menu-conversation-3-thread-actions-1024.png) / [1440](screens/menu-conversation-3-thread-actions-1440.png)

### 059　#3「更新前に請求書の送付先を確認したい」の担当を照合する

運営者が#3「更新前に請求書の送付先を確認したい」の担当を照合するために開く。

- いまの担当は？ 「佐藤 優」にチェック。
- 交代候補は？ 佐藤 優と森 直子、担当なしの3択。
- フォーカスは？ 先頭の「担当なし」に青枠、現在値は灰色。

375は属性の下に人名一覧、1024・1440も属性が起点。佐藤 優の黄色い内部メモに次回請求前日の案内予定がある。　[375](screens/menu-conversation-3-thread-assignee-375.png) / [1024](screens/menu-conversation-3-thread-assignee-1024.png) / [1440](screens/menu-conversation-3-thread-assignee-1440.png)

### 060　#3「更新前に請求書の送付先を確認したい」を分類する

運営者が#3「更新前に請求書の送付先を確認したい」を分類するために開く。

- 登録済みの分類は？ チェック付きの項目なし。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。佐藤 優の黄色い内部メモに次回請求前日の案内予定がある。　[375](screens/menu-conversation-3-thread-labels-375.png) / [1024](screens/menu-conversation-3-thread-labels-1024.png) / [1440](screens/menu-conversation-3-thread-labels-1440.png)

### 061　#3「更新前に請求書の送付先を確認したい」の状態を変更する

運営者が#3「更新前に請求書の送付先を確認したい」の状態を変更するために開く。

- 現在は？ 属性チップと「現在の状態」はともに未対応。
- フォーカスは？ 「完了にする」に青枠。
- ほかの行き先は？ 迷惑メールにする。

375では開いたボタンの下に選択面。1024・1440は属性が一列に収まり、同じ位置関係。佐藤 優の黄色い内部メモに次回請求前日の案内予定がある。　[375](screens/menu-conversation-3-thread-status-375.png) / [1024](screens/menu-conversation-3-thread-status-1024.png) / [1440](screens/menu-conversation-3-thread-status-1440.png)

### 062　問い合わせをヘルプ記事の候補にする

運営者が問い合わせをヘルプ記事の候補にするために開く。

- 出典は？ #4「月額プランの明細を確認したいです」。
- 何を入力？ 「記事にする内容」が空で青い枠。
- 登録先は？ 入力直下の「記事の候補に追加」。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。1024・1440の背後では受信拒否で失敗した返信と、拡張による送信済みの返信が並ぶ。　[375](screens/menu-conversation-4-operation-articles-articles.suggest-375.png) / [1024](screens/menu-conversation-4-operation-articles-articles.suggest-1024.png) / [1440](screens/menu-conversation-4-operation-articles-articles.suggest-1440.png)

### 063　#4「月額プランの明細を確認したいです」に関連する修正前後の件数を調べる

運営者が#4「月額プランの明細を確認したいです」に関連する修正前後の件数を調べるために開く。

- 対象課題は？ 領収書の一括ダウンロード（#42）。下に別候補#44がある。
- 期間は？ 30日間が選択済み。
- 次の操作は？ 「修正前後の件数を比較」。結果値はまだ画面にない。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。375では選択面が元ボタンの上、1024・1440では下にある。　[375](screens/menu-conversation-4-operation-issues-issues.impact-375.png) / [1024](screens/menu-conversation-4-operation-issues-issues.impact-1024.png) / [1440](screens/menu-conversation-4-operation-issues-issues.impact-1440.png)

### 064　公開するGitHub課題の原稿を用意する

運営者が公開するGitHub課題の原稿を用意するために開く。

- 起点は？ 問い合わせ#4「月額プランの明細を確認したいです」。
- どこに公開？ 投稿先はexample/helpdesk。
- 確認前に何を書く？ 空のタイトルと公開する要約。前面の唯一のボタンは「起票内容を確認」。

375は関連情報の前に白い入力面、1024は背景と右パネルの二段の濃淡、1440は暗転した右列に入力面。入力面にキャンセルは見えない。　[375](screens/menu-conversation-4-operation-issues-issues.preview-375.png) / [1024](screens/menu-conversation-4-operation-issues-issues.preview-1024.png) / [1440](screens/menu-conversation-4-operation-issues-issues.preview-1440.png)

### 065　渡辺 葵さん宛ての受付返信を下書きにする

運営者が渡辺 葵さん宛ての受付返信を下書きにするために開く。

- 候補は？ 「お問い合わせの受付」にラジオ印。
- 誰向けの文？ 「Hello 渡辺 葵, thank you for contacting Slide.」と展開済み。
- 次の操作は？ 「定型文から下書きを作成」。

375は定型文ボタンの上に候補。1024・1440は返信欄内のボタンの上に表示。　[375](screens/menu-conversation-4-reply-templates-375.png) / [1024](screens/menu-conversation-4-reply-templates-1024.png) / [1440](screens/menu-conversation-4-reply-templates-1440.png)

### 066　#4「月額プランの明細を確認したいです」の補助操作を探す

運営者が#4「月額プランの明細を確認したいです」の補助操作を探すために開く。

- どこから？ ツールバーの「その他の操作」が青い。
- 先頭項目は？ 展開記号付き「スヌーズ」。
- この案件のほかの処理は？ さらに「迷惑メールにする」がある。

375は開いた面が件名中央に重なる。1024・1440は同じメニューが右上。受信拒否で失敗した返信と、拡張による送信済みの返信が並ぶ。　[375](screens/menu-conversation-4-thread-actions-375.png) / [1024](screens/menu-conversation-4-thread-actions-1024.png) / [1440](screens/menu-conversation-4-thread-actions-1440.png)

### 067　#4「月額プランの明細を確認したいです」の担当を照合する

運営者が#4「月額プランの明細を確認したいです」の担当を照合するために開く。

- いまの担当は？ 「佐藤 優」にチェック。
- 交代候補は？ 佐藤 優と森 直子、担当なしの3択。
- フォーカスは？ 先頭の「担当なし」に青枠、現在値は灰色。

375は属性の下に人名一覧、1024・1440も属性が起点。受信拒否で失敗した返信と、拡張による送信済みの返信が並ぶ。　[375](screens/menu-conversation-4-thread-assignee-375.png) / [1024](screens/menu-conversation-4-thread-assignee-1024.png) / [1440](screens/menu-conversation-4-thread-assignee-1440.png)

### 068　#4「月額プランの明細を確認したいです」を分類する

運営者が#4「月額プランの明細を確認したいです」を分類するために開く。

- 登録済みの分類は？ 請求だけ。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。受信拒否で失敗した返信と、拡張による送信済みの返信が並ぶ。　[375](screens/menu-conversation-4-thread-labels-375.png) / [1024](screens/menu-conversation-4-thread-labels-1024.png) / [1440](screens/menu-conversation-4-thread-labels-1440.png)

### 069　#4「月額プランの明細を確認したいです」の状態を変更する

運営者が#4「月額プランの明細を確認したいです」の状態を変更するために開く。

- 現在は？ 属性チップと「現在の状態」はともに未対応。
- フォーカスは？ 「完了にする」に青枠。
- ほかの行き先は？ 迷惑メールにする。

375では開いたボタンの下に選択面。1024・1440は属性が一列に収まり、同じ位置関係。受信拒否で失敗した返信と、拡張による送信済みの返信が並ぶ。　[375](screens/menu-conversation-4-thread-status-375.png) / [1024](screens/menu-conversation-4-thread-status-1024.png) / [1440](screens/menu-conversation-4-thread-status-1440.png)

### 070　問い合わせをヘルプ記事の候補にする

運営者が問い合わせをヘルプ記事の候補にするために開く。

- 出典は？ #5「チームプランの契約更新について」。
- 何を入力？ 「記事にする内容」が空で青い枠。
- 登録先は？ 入力直下の「記事の候補に追加」。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。1024・1440の背後では佐藤 優の代理による承認待ちと、拡張の送信済み返信が並ぶ。　[375](screens/menu-conversation-5-operation-articles-articles.suggest-375.png) / [1024](screens/menu-conversation-5-operation-articles-articles.suggest-1024.png) / [1440](screens/menu-conversation-5-operation-articles-articles.suggest-1440.png)

### 071　#5「チームプランの契約更新について」に関連する修正前後の件数を調べる

運営者が#5「チームプランの契約更新について」に関連する修正前後の件数を調べるために開く。

- 対象課題は？ 領収書の宛名を変更できるようにする（#43）。
- 期間は？ 30日間が選択済み。
- 次の操作は？ 「修正前後の件数を比較」。結果値はまだ画面にない。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。375では選択面が元ボタンの下、1024・1440では下にある。　[375](screens/menu-conversation-5-operation-issues-issues.impact-375.png) / [1024](screens/menu-conversation-5-operation-issues-issues.impact-1024.png) / [1440](screens/menu-conversation-5-operation-issues-issues.impact-1440.png)

### 072　公開するGitHub課題の原稿を用意する

運営者が公開するGitHub課題の原稿を用意するために開く。

- 起点は？ 問い合わせ#5「チームプランの契約更新について」。
- どこに公開？ 投稿先はexample/helpdesk。
- 確認前に何を書く？ 空のタイトルと公開する要約。前面の唯一のボタンは「起票内容を確認」。

375は関連情報の前に白い入力面、1024は背景と右パネルの二段の濃淡、1440は暗転した右列に入力面。入力面にキャンセルは見えない。　[375](screens/menu-conversation-5-operation-issues-issues.preview-375.png) / [1024](screens/menu-conversation-5-operation-issues-issues.preview-1024.png) / [1440](screens/menu-conversation-5-operation-issues-issues.preview-1440.png)

### 073　山田 花さん宛ての受付返信を下書きにする

運営者が山田 花さん宛ての受付返信を下書きにするために開く。

- 候補は？ 「お問い合わせの受付」にラジオ印。
- 誰向けの文？ 「Hello 山田 花, thank you for contacting Slide.」と展開済み。
- 次の操作は？ 「定型文から下書きを作成」。

375は定型文ボタンの上に候補。1024・1440は返信欄内のボタンの上に表示。　[375](screens/menu-conversation-5-reply-templates-375.png) / [1024](screens/menu-conversation-5-reply-templates-1024.png) / [1440](screens/menu-conversation-5-reply-templates-1440.png)

### 074　#5「チームプランの契約更新について」の補助操作を探す

運営者が#5「チームプランの契約更新について」の補助操作を探すために開く。

- どこから？ ツールバーの「その他の操作」が青い。
- 先頭項目は？ 展開記号付き「スヌーズ」。
- この案件のほかの処理は？ さらに「迷惑メールにする」がある。

375は開いた面が件名中央に重なる。1024・1440は同じメニューが右上。佐藤 優の代理による承認待ちと、拡張の送信済み返信が並ぶ。　[375](screens/menu-conversation-5-thread-actions-375.png) / [1024](screens/menu-conversation-5-thread-actions-1024.png) / [1440](screens/menu-conversation-5-thread-actions-1440.png)

### 075　#5「チームプランの契約更新について」の担当を照合する

運営者が#5「チームプランの契約更新について」の担当を照合するために開く。

- いまの担当は？ 「担当なし」にチェック。
- 交代候補は？ 佐藤 優と森 直子、担当なしの3択。
- フォーカスは？ 先頭の「担当なし」に青枠、現在値は灰色。

375は属性の下に人名一覧、1024・1440も属性が起点。佐藤 優の代理による承認待ちと、拡張の送信済み返信が並ぶ。　[375](screens/menu-conversation-5-thread-assignee-375.png) / [1024](screens/menu-conversation-5-thread-assignee-1024.png) / [1440](screens/menu-conversation-5-thread-assignee-1440.png)

### 076　#5「チームプランの契約更新について」を分類する

運営者が#5「チームプランの契約更新について」を分類するために開く。

- 登録済みの分類は？ チェック付きの項目なし。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。佐藤 優の代理による承認待ちと、拡張の送信済み返信が並ぶ。　[375](screens/menu-conversation-5-thread-labels-375.png) / [1024](screens/menu-conversation-5-thread-labels-1024.png) / [1440](screens/menu-conversation-5-thread-labels-1440.png)

### 077　#5「チームプランの契約更新について」の状態を変更する

運営者が#5「チームプランの契約更新について」の状態を変更するために開く。

- 現在は？ 属性チップと「現在の状態」はともに未対応。
- フォーカスは？ 「完了にする」に青枠。
- ほかの行き先は？ 迷惑メールにする。

375では開いたボタンの下に選択面。1024・1440は属性が一列に収まり、同じ位置関係。佐藤 優の代理による承認待ちと、拡張の送信済み返信が並ぶ。　[375](screens/menu-conversation-5-thread-status-375.png) / [1024](screens/menu-conversation-5-thread-status-1024.png) / [1440](screens/menu-conversation-5-thread-status-1440.png)

### 078　問い合わせをヘルプ記事の候補にする

運営者が問い合わせをヘルプ記事の候補にするために開く。

- 出典は？ #6「購入手続き後に届いたメールのご確認」。
- 何を入力？ 「記事にする内容」が空で青い枠。
- 登録先は？ 入力直下の「記事の候補に追加」。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。1024・1440の背後では注文番号SL-2026-128が太字。　[375](screens/menu-conversation-6-operation-articles-articles.suggest-375.png) / [1024](screens/menu-conversation-6-operation-articles-articles.suggest-1024.png) / [1440](screens/menu-conversation-6-operation-articles-articles.suggest-1440.png)

### 079　公開するGitHub課題の原稿を用意する

運営者が公開するGitHub課題の原稿を用意するために開く。

- 起点は？ 問い合わせ#6「購入手続き後に届いたメールのご確認」。
- どこに公開？ 投稿先はexample/helpdesk。
- 確認前に何を書く？ 空のタイトルと公開する要約。前面の唯一のボタンは「起票内容を確認」。

375は関連情報の前に白い入力面、1024は背景と右パネルの二段の濃淡、1440は暗転した右列に入力面。入力面にキャンセルは見えない。　[375](screens/menu-conversation-6-operation-issues-issues.preview-375.png) / [1024](screens/menu-conversation-6-operation-issues-issues.preview-1024.png) / [1440](screens/menu-conversation-6-operation-issues-issues.preview-1440.png)

### 080　佐々木 葵さん宛ての受付返信を下書きにする

運営者が佐々木 葵さん宛ての受付返信を下書きにするために開く。

- 候補は？ 「お問い合わせの受付」にラジオ印。
- 誰向けの文？ 「Hello 佐々木 葵, thank you for contacting Slide.」と展開済み。
- 次の操作は？ 「定型文から下書きを作成」。

375は定型文ボタンの上に候補。1024・1440は返信欄内のボタンの下に表示。　[375](screens/menu-conversation-6-reply-templates-375.png) / [1024](screens/menu-conversation-6-reply-templates-1024.png) / [1440](screens/menu-conversation-6-reply-templates-1440.png)

### 081　#6「購入手続き後に届いたメールのご確認」の補助操作を探す

運営者が#6「購入手続き後に届いたメールのご確認」の補助操作を探すために開く。

- どこから？ ツールバーの「その他の操作」が青い。
- 先頭項目は？ 展開記号付き「スヌーズ」。
- この案件のほかの処理は？ さらに「迷惑メールにする」がある。

375は開いた面が件名中央に重なる。1024・1440は同じメニューが右上。注文番号SL-2026-128が太字。　[375](screens/menu-conversation-6-thread-actions-375.png) / [1024](screens/menu-conversation-6-thread-actions-1024.png) / [1440](screens/menu-conversation-6-thread-actions-1440.png)

### 082　#6「購入手続き後に届いたメールのご確認」の担当を照合する

運営者が#6「購入手続き後に届いたメールのご確認」の担当を照合するために開く。

- いまの担当は？ 「担当なし」にチェック。
- 交代候補は？ 佐藤 優と森 直子、担当なしの3択。
- フォーカスは？ 先頭の「担当なし」に青枠、現在値は灰色。

375は属性の下に人名一覧、1024・1440も属性が起点。注文番号SL-2026-128が太字。　[375](screens/menu-conversation-6-thread-assignee-375.png) / [1024](screens/menu-conversation-6-thread-assignee-1024.png) / [1440](screens/menu-conversation-6-thread-assignee-1440.png)

### 083　#6「購入手続き後に届いたメールのご確認」を分類する

運営者が#6「購入手続き後に届いたメールのご確認」を分類するために開く。

- 登録済みの分類は？ チェック付きの項目なし。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。注文番号SL-2026-128が太字。　[375](screens/menu-conversation-6-thread-labels-375.png) / [1024](screens/menu-conversation-6-thread-labels-1024.png) / [1440](screens/menu-conversation-6-thread-labels-1440.png)

### 084　#6「購入手続き後に届いたメールのご確認」の状態を変更する

運営者が#6「購入手続き後に届いたメールのご確認」の状態を変更するために開く。

- 現在は？ 属性チップと「現在の状態」はともに未対応。
- フォーカスは？ 「完了にする」に青枠。
- ほかの行き先は？ 迷惑メールにする。

375では開いたボタンの下に選択面。1024・1440は属性が一列に収まり、同じ位置関係。注文番号SL-2026-128が太字。　[375](screens/menu-conversation-6-thread-status-375.png) / [1024](screens/menu-conversation-6-thread-status-1024.png) / [1440](screens/menu-conversation-6-thread-status-1440.png)

### 085　問い合わせをヘルプ記事の候補にする

運営者が問い合わせをヘルプ記事の候補にするために開く。

- 出典は？ #7「添付した利用明細について」。
- 何を入力？ 「記事にする内容」が空で青い枠。
- 登録先は？ 入力直下の「記事の候補に追加」。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。1024・1440の背後では利用明細.txtと43 Bが受信文の下にある。　[375](screens/menu-conversation-7-operation-articles-articles.suggest-375.png) / [1024](screens/menu-conversation-7-operation-articles-articles.suggest-1024.png) / [1440](screens/menu-conversation-7-operation-articles-articles.suggest-1440.png)

### 086　#7「添付した利用明細について」に関連する修正前後の件数を調べる

運営者が#7「添付した利用明細について」に関連する修正前後の件数を調べるために開く。

- 対象課題は？ 領収書の一括ダウンロード（#42）。
- 期間は？ 30日間が選択済み。
- 次の操作は？ 「修正前後の件数を比較」。結果値はまだ画面にない。

375は関連情報が全幅、1024は暗転した会話の右に引き出し、1440は会話の右列に表示。375では選択面が元ボタンの下、1024・1440では下にある。　[375](screens/menu-conversation-7-operation-issues-issues.impact-375.png) / [1024](screens/menu-conversation-7-operation-issues-issues.impact-1024.png) / [1440](screens/menu-conversation-7-operation-issues-issues.impact-1440.png)

### 087　公開するGitHub課題の原稿を用意する

運営者が公開するGitHub課題の原稿を用意するために開く。

- 起点は？ 問い合わせ#7「添付した利用明細について」。
- どこに公開？ 投稿先はexample/helpdesk。
- 確認前に何を書く？ 空のタイトルと公開する要約。前面の唯一のボタンは「起票内容を確認」。

375は関連情報の前に白い入力面、1024は背景と右パネルの二段の濃淡、1440は暗転した右列に入力面。入力面にキャンセルは見えない。　[375](screens/menu-conversation-7-operation-issues-issues.preview-375.png) / [1024](screens/menu-conversation-7-operation-issues-issues.preview-1024.png) / [1440](screens/menu-conversation-7-operation-issues-issues.preview-1440.png)

### 088　森 海斗さん宛ての受付返信を下書きにする

運営者が森 海斗さん宛ての受付返信を下書きにするために開く。

- 候補は？ 「お問い合わせの受付」にラジオ印。
- 誰向けの文？ 「Hello 森 海斗, thank you for contacting Slide.」と展開済み。
- 次の操作は？ 「定型文から下書きを作成」。

375は定型文ボタンの上に候補。1024・1440は返信欄内のボタンの上に表示。　[375](screens/menu-conversation-7-reply-templates-375.png) / [1024](screens/menu-conversation-7-reply-templates-1024.png) / [1440](screens/menu-conversation-7-reply-templates-1440.png)

### 089　#7「添付した利用明細について」の補助操作を探す

運営者が#7「添付した利用明細について」の補助操作を探すために開く。

- どこから？ ツールバーの「その他の操作」が青い。
- 先頭項目は？ 展開記号付き「スヌーズ」。
- この案件のほかの処理は？ さらに「迷惑メールにする」がある。

375は開いた面が件名中央に重なる。1024・1440は同じメニューが右上。利用明細.txtと43 Bが受信文の下にある。　[375](screens/menu-conversation-7-thread-actions-375.png) / [1024](screens/menu-conversation-7-thread-actions-1024.png) / [1440](screens/menu-conversation-7-thread-actions-1440.png)

### 090　#7「添付した利用明細について」の担当を照合する

運営者が#7「添付した利用明細について」の担当を照合するために開く。

- いまの担当は？ 「担当なし」にチェック。
- 交代候補は？ 佐藤 優と森 直子、担当なしの3択。
- フォーカスは？ 先頭の「担当なし」に青枠、現在値は灰色。

375は属性の下に人名一覧、1024・1440も属性が起点。利用明細.txtと43 Bが受信文の下にある。　[375](screens/menu-conversation-7-thread-assignee-375.png) / [1024](screens/menu-conversation-7-thread-assignee-1024.png) / [1440](screens/menu-conversation-7-thread-assignee-1440.png)

### 091　#7「添付した利用明細について」を分類する

運営者が#7「添付した利用明細について」を分類するために開く。

- 登録済みの分類は？ チェック付きの項目なし。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。利用明細.txtと43 Bが受信文の下にある。　[375](screens/menu-conversation-7-thread-labels-375.png) / [1024](screens/menu-conversation-7-thread-labels-1024.png) / [1440](screens/menu-conversation-7-thread-labels-1440.png)

### 092　#7「添付した利用明細について」の状態を変更する

運営者が#7「添付した利用明細について」の状態を変更するために開く。

- 現在は？ 属性チップと「現在の状態」はともに未対応。
- フォーカスは？ 「完了にする」に青枠。
- ほかの行き先は？ 迷惑メールにする。

375では開いたボタンの下に選択面。1024・1440は属性が一列に収まり、同じ位置関係。利用明細.txtと43 Bが受信文の下にある。　[375](screens/menu-conversation-7-thread-status-375.png) / [1024](screens/menu-conversation-7-thread-status-1024.png) / [1440](screens/menu-conversation-7-thread-status-1440.png)

### 093　課題の紐付け画面で、#1「領収書の宛名を変更できますか」の補助操作を探す

運営者が課題の紐付け画面で、#1「領収書の宛名を変更できますか」の補助操作を探すために開く。

- どこから？ ツールバーの「その他の操作」が青い。
- 先頭項目は？ 展開記号付き「スヌーズ」。
- この案件のほかの処理は？ さらに「迷惑メールにする」がある。

375は開いた面が件名中央に重なる。1024・1440は同じメニューが右上。1440では「既存の課題を選ぶ」が展開され、#42と3件の課題が見える。　[375](screens/menu-extensions-issues-link-1-thread-actions-375.png) / [1024](screens/menu-extensions-issues-link-1-thread-actions-1024.png) / [1440](screens/menu-extensions-issues-link-1-thread-actions-1440.png)

### 094　課題の紐付け画面で、#1「領収書の宛名を変更できますか」の担当を照合する

運営者が課題の紐付け画面で、#1「領収書の宛名を変更できますか」の担当を照合するために開く。

- いまの担当は？ 「担当なし」にチェック。
- 交代候補は？ 佐藤 優と森 直子、担当なしの3択。
- フォーカスは？ 先頭の「担当なし」に青枠、現在値は灰色。

375は属性の下に人名一覧、1024・1440も属性が起点。1440では「既存の課題を選ぶ」が展開され、#42と3件の課題が見える。　[375](screens/menu-extensions-issues-link-1-thread-assignee-375.png) / [1024](screens/menu-extensions-issues-link-1-thread-assignee-1024.png) / [1440](screens/menu-extensions-issues-link-1-thread-assignee-1440.png)

### 095　課題の紐付け画面で、#1「領収書の宛名を変更できますか」を分類する

運営者が課題の紐付け画面で、#1「領収書の宛名を変更できますか」を分類するために開く。

- 登録済みの分類は？ 経理・請求・領収書の3項目。
- どの項目を操作中？ 再発行に青枠。候補には社内確認、請求、領収書もある。
- 新しい分類が必要なら？ 下部に「新しいラベルを作成」「ラベルを管理」。

375は中央から下までを覆う。1024・1440も長い契約更新ラベルが1行で読める。1440では「既存の課題を選ぶ」が展開され、#42と3件の課題が見える。　[375](screens/menu-extensions-issues-link-1-thread-labels-375.png) / [1024](screens/menu-extensions-issues-link-1-thread-labels-1024.png) / [1440](screens/menu-extensions-issues-link-1-thread-labels-1440.png)

### 096　課題の紐付け画面で、#1「領収書の宛名を変更できますか」の状態を変更する

運営者が課題の紐付け画面で、#1「領収書の宛名を変更できますか」の状態を変更するために開く。

- 現在は？ 属性チップと「現在の状態」はともに未対応。
- フォーカスは？ 「完了にする」に青枠。
- ほかの行き先は？ 迷惑メールにする。

375では開いたボタンの下に選択面。1024・1440は属性が一列に収まり、同じ位置関係。1440では「既存の課題を選ぶ」が展開され、#42と3件の課題が見える。　[375](screens/menu-extensions-issues-link-1-thread-status-375.png) / [1024](screens/menu-extensions-issues-link-1-thread-status-1024.png) / [1440](screens/menu-extensions-issues-link-1-thread-status-1440.png)

### 097　未対応一覧の検索範囲を確認する

運営者が未対応一覧の検索範囲を確認するために開く。

- 何件？ 7件。
- 現在の条件は？ 未対応、製品・担当・ラベルは全件。
- 注意表示は？ #5は「返信」の抜粋に承認待ち、#4には「別の返信で送信失敗」。

375は件名が省略、1024・1440は#5に修正完了を知らせる返信の抜粋が見える。　[375](screens/menu-home-inbox-filters-375.png) / [1024](screens/menu-home-inbox-filters-1024.png) / [1440](screens/menu-home-inbox-filters-1440.png)

### 098　請求で絞った案件の条件を見直す

運営者が請求で絞った案件の条件を見直すために開く。

- 現在のラベルは？ 請求。
- ほかの条件は？ 状態は未対応、製品・担当はすべて。
- 件数は？ 見出しに2件。

375は選択面の背後に行が隠れる。1024・1440は請求の除去チップと#4、#1の行の一部が見える。　[375](screens/menu-label-fd3f5651-inbox-filters-375.png) / [1024](screens/menu-label-fd3f5651-inbox-filters-1024.png) / [1440](screens/menu-label-fd3f5651-inbox-filters-1440.png)

### 099　Deskで自分に割り当てられた案件を見直す

運営者がDeskで自分に割り当てられた案件を見直すために開く。

- 製品は？ Dの角丸記号とDesk。
- 担当は？ 佐藤 優。
- 状態と件数は？ 状態「すべて」、「自分の担当」1件。

375は条件面が行をほぼ覆う。1024・1440では条件の左にDeskと佐藤 優のチップが見える。　[375](screens/menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters-375.png) / [1024](screens/menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters-1024.png) / [1440](screens/menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters-1440.png)

### 100　該当のない検索の追加条件を確認する

運営者が該当のない検索の追加条件を確認するために開く。

- 検索語は？ 未回答の調査番号。
- 件数は？ 0件。
- 追加で限定中か？ 状態・製品・担当・ラベルはいずれも「すべて」。

375では未該当の説明を選択面が覆い、1024は一部、1440では解除も読める。　[375](screens/menu-query-999c3485-inbox-filters-375.png) / [1024](screens/menu-query-999c3485-inbox-filters-1024.png) / [1440](screens/menu-query-999c3485-inbox-filters-1440.png)

### 101　迷惑メールの選別条件を点検する

運営者が迷惑メールの選別条件を点検するために開く。

- 何件？ 1件。
- 状態は？ 盾記号と「迷惑メール」。
- ほかの条件は？ 製品・担当はすべて、ラベルもすべて。

375は結果の右端だけが見える。1024・1440は#9未承諾の営業案内の行が読める。　[375](screens/menu-status-spam-48e45b08-inbox-filters-375.png) / [1024](screens/menu-status-spam-48e45b08-inbox-filters-1024.png) / [1440](screens/menu-status-spam-48e45b08-inbox-filters-1440.png)

### 102　受け付けたフィードバックの範囲を見る

運営者が受け付けたフィードバックの範囲を見るために開く。

- 何件？ 1件。
- 並びは？ 新しい順。
- 何で絞れる？ 状態・製品・ラベルの3項目。

375は選択面で件名が隠れる。1024・1440では#10「運営画面をキーボードで使っています」が見える。　[375](screens/menu-view-feedback-834dd78f-inbox-filters-375.png) / [1024](screens/menu-view-feedback-834dd78f-inbox-filters-1024.png) / [1440](screens/menu-view-feedback-834dd78f-inbox-filters-1440.png)

### 103　担当案件を待ち時間の長い順に整理する

運営者が担当案件を待ち時間の長い順に整理するために開く。

- 担当と範囲は？ 佐藤 優、すべての状態、3件。
- どれが急ぎ？ #4は4時間待ちで送信失敗。
- ほかの状態は？ #3は未対応、#2は返信待ち。

375では各行の状態が下段、1024・1440では同じ3件の右端に担当の「佐」。　[375](screens/my-inbox-375.png) / [1024](screens/my-inbox-1024.png) / [1440](screens/my-inbox-1440.png)

### 104　集計に含まれる声を個別案件に照らす

運営者が集計に含まれる声を個別案件に照らすために開く。

- 集計範囲は？ すべてのプロダクト・全期間・10件。
- 製品と日付は？ #1はSlide、#3はDesk、いずれも2026/11/18。
- 元の画面は？ 先頭に「声の集計に戻る」。

375は日付と製品が件名の下。1024・1440は右に独立列があり#10のフィードバックも見える。　[375](screens/route-voices-conversations-375.png) / [1024](screens/route-voices-conversations-1024.png) / [1440](screens/route-voices-conversations-1440.png)

### 105　返信に関連する既存記事を添える

運営者が返信に関連する既存記事を添えるために開く。

- 起点は？ 「記事を添える」。
- どう探す？ 「記事の題名で検索」が空で青枠。
- 候補は？ 「領収書を発行する」。

375は検索面の右枠が画面端に接し、1024・1440は入力欄内の起点上方に余白を持って収まる。　[375](screens/suggest-composer-375.png) / [1024](screens/suggest-composer-1024.png) / [1440](screens/suggest-composer-1440.png)

### 106　該当記事がない案件を記事化につなぐ

運営者が該当記事がない案件を記事化につなぐために開く。

- 候補は？ この問い合わせに合う記事の候補はまだない。
- 次は？ 「この件名を記事候補にする」。
- 返信の状況は？ 広い幅で佐藤 優が招待メール再送を案内、送信済み。

375は送信済みの本文と記事候補化が同じ画面、1024・1440は受信文から時系列を読める。　[375](screens/suggest-composer-empty-375.png) / [1024](screens/suggest-composer-empty-1024.png) / [1440](screens/suggest-composer-empty-1440.png)

### 107　代理作成の返信を人が確認する

運営者が代理作成の返信を人が確認するために開く。

- 誰の下書き？ エージェント下書き担当、佐藤 優の代理。
- 送信済みか？ 砂時計と「承認待ち」。
- 選択肢は？ 承認して送信、下書きを破棄。

375でも編集中の本文と両操作が見える。1024・1440は山田 花さんの元の質問も同時に見える。　[375](screens/thread-approval-375.png) / [1024](screens/thread-approval-1024.png) / [1440](screens/thread-approval-1440.png)

### 108　受信した明細の添付を確認する

運営者が受信した明細の添付を確認するために開く。

- 誰から？ 森 海斗さん、7時間前。
- 添付は？ 利用明細.txt、43 B、青いリンク。
- 次の作業は？ 下の返信・内部メモ欄。

375は受信カードと返信欄の枠が接する。1024・1440では間に余白がある。　[375](screens/thread-attachment-375.png) / [1024](screens/thread-attachment-1024.png) / [1440](screens/thread-attachment-1440.png)

### 109　会話に関連付けた課題や過去の問い合わせを調べる

運営者が会話に関連付けた課題や過去の問い合わせを調べるために開く。

- 関連課題は？ 領収書の宛名変更、example/helpdesk#43が1件。
- 関連会話は？ #6購入手続き後に届いたメールのご確認。
- ほかに辿れるものは？ 期間比較・既存の課題選択・操作履歴。

375は関連パネルだけで元会話の番号・件名は不明。1024の背後と1440の本文では#1、GitHub Issue作成の下書き。　[375](screens/thread-context-375.png) / [1024](screens/thread-context-1024.png) / [1440](screens/thread-context-1440.png)

### 110　失敗した返信の原因を調べる

運営者が失敗した返信の原因を調べるために開く。

- どの案件？ #4渡辺 葵さんの月額プラン明細。
- なぜ失敗？ 1024・1440の赤い帯に、宛先のメールサーバーが受信を拒否した旨。
- どこから再送？ 失敗した返信の下に「再送」。

375で見えるのは見出しの「送信失敗の返信へ」まで。理由と再送が見えるのは広い2幅。　[375](screens/thread-failed-375.png) / [1024](screens/thread-failed-1024.png) / [1440](screens/thread-failed-1440.png)

### 111　購入確認のメール本文を読む

運営者が購入確認のメール本文を読むために開く。

- 顧客は？ 佐々木 葵さん、6時間前。
- 確認対象は？ プランと発行済み領収書。
- 注文番号は？ 広い幅の本文でSL-2026-128が太字。

375では番号の手前を返信欄が覆う。1024・1440は本文と番号が連続して読める。　[375](screens/thread-html-375.png) / [1024](screens/thread-html-1024.png) / [1440](screens/thread-html-1440.png)

### 112　相手からの新着を読んで対応する

運営者が相手からの新着を読んで対応するために開く。

- 何の案件？ #1領収書の宛名変更。
- 誰から？ 山田 花さん、1時間前。
- どんな要望？ 会社名で再発行し、注文履歴から変更できるか知りたい。

375は最後の質問が返信欄の縁で切れる。1024・1440は受信文をすべて表示。　[375](screens/thread-inbound-375.png) / [1024](screens/thread-inbound-1024.png) / [1440](screens/thread-inbound-1440.png)

### 113　顧客への返信前に社内の経理メモを読む

運営者が顧客への返信前に社内の経理メモを読むために開く。

- 誰のメモ？ 佐藤 優、2時間前。
- 何をする？ 次回請求日の前日までに変更手続きを案内する。
- 非公開とわかる？ 黄色い面と「内部メモ（相手には送られません）」。

375は「内部メモへ」が見えるがメモ本体は画面外。1024・1440は受信文とメモ本文を同時に読める。　[375](screens/thread-note-375.png) / [1024](screens/thread-note-1024.png) / [1440](screens/thread-note-1440.png)

### 114　招待メールへの返信内容と現在の状態を確認する

運営者が招待メールへの返信内容と現在の状態を確認するために開く。

- 現在の状態は？ #2に返信待ち。
- 誰が対応？ 佐藤 優が1時間前に送信済み。
- 何を伝えた？ 招待メールを再送し受信箱の確認を依頼。

375は「送信済みの返信へ」まで。1024・1440は顧客の質問と佐藤 優の返信が別背景で並ぶ。　[375](screens/thread-replied-375.png) / [1024](screens/thread-replied-1024.png) / [1440](screens/thread-replied-1440.png)
