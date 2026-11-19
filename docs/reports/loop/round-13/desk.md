# 運営者の受信箱・会話画面の目視レビュー

desk/ の114状態を375×812、1024×900、1440×900の3幅で横に並べ、342枚を確認した。比較対象は同じ状態の別幅、および同じ種類の一覧・会話・メニューである。判定は配布された DESIGN.md と criteria.md の重さの見本に従った。以降の番号は画面記録の通し番号であり、会話番号には # を付けた。

## 直したい箇所

|重さ|状態・幅|実際に見えること|期待する見え方|
|---|---|---|---|
|高|thread-failed、375。1024・1440と比較|#4の先頭は「未対応」と受信文。その直下から画面下端まで空の返信欄が占め、未達を示す文字・理由・再送が一つも見えない。1024・1440には「送信失敗」「宛先のメールサーバーが受信を拒否しました。」「再送」が揃う。新規返信を書ける見た目で、先行返信の未達を見過ごす。|会話を開いた時点で未達と判断でき、失敗した返信と再送にたどれる手がかりを件名近くに出す。スクロールによる到達可能性は未検証。|
|中|thread-note、thread-replied、thread-inbound、thread-html、375|#3の内部メモ、#2の送信済み回答、#1の最後の質問、#6の注文番号を返信欄が覆う。#3・#2は直前のやり取りがあることも表示内から分からない。1024・1440は該当箇所を読める。|返信を書く前に直近のやり取りの種類や読み残しに気づける。入力開始前の返信欄は本文の読み取りを優先する。|
|中|inbox、all-inbox、my-inbox、approval-list、loop-bulk、375。inboxの#11は1024にも一部発生|長い差出人は保たれるが、#11では件名、抜粋・時間、印とラベルが別の段へ移る。#5は承認待ち、#4は失敗と請求が抜粋の下に流れ、担当の丸は画面の右端より約100px内側。1024では#11の差出人が2行、1440では一覧の時間と担当が揃う。|狭幅でも差出人・件名、次に抜粋・時刻を同じ順と位置で追える。長い名前を維持し、補足・操作は必要に応じてまとめる。|
|中|inbox、thread-context、menu-conversation-1-operation-issues-issues.preview、1024|細いサイドバーで他の行がアイコンと件数になる一方、集計2項目は同じ棒グラフに「声」「対応」だけが残る。1440の「声の集計」「対応状況の集計」と比べ、行き先を文字から識別しづらい。|同じ幅で意味の通る短い名称または互いに識別できる印を揃える。ツールチップの動作は未検証。|
|中|loop-reply-undo、375・1024・1440。menu-conversation-1-notice-note-82513194-thread-assignee、375|取り消し通知が375では受信文、広い2幅では送信待ちの返信本文に重なる。メモ保存通知は375で差出人・宛先の途中を隠す。照合したい本文や宛先と通知が同じ場所を使う。|通知と取り消す操作を読める位置に保ち、見直している本文・宛先も同時に読める。通知の継続時間や取り消し成立は未検証。|
|中|menu-conversation-2-operation-issues-issues.impact、menu-conversation-4-operation-issues-issues.impact、375・1024・1440|選択欄の#43は「領収書の宛名を変更できるようにす」まで、#42は末尾のリポジトリ表記の途中まで。375では選択欄の裏にリンクや別のカードも隠れる。|比較対象の番号と題名を読み切れる。番号やリポジトリを副情報にする場合は欄の外にも全文が見える。|
|中|loop-labels、menu-conversation-1-thread-labels、loop-bulk-label、375・1024・1440|「社内確認」と「長期契約の更新手続きについて」が同じ見え方の緑。「再発行」「経理」「請求」も小さい点では濃色が近い。名前とチェックでは識別できるが、点は識別の助けになりにくい。|同時に選ぶラベルには見分けやすい印を使い、名前やチェックによる識別も保つ。保存色がユーザー指定かは未検証。|
|中|menu-conversation-3-operation-articles-articles.suggest、1440|右の「ヘルプ記事」に開いたフォームと本文下の返信欄に同じ「記事の候補に追加」が同時にある。片方は入力欄の送信、片方は空の候補からの入口だが、同じ文言で段階が読めない。|候補を書く入口と入力後に登録する操作を文言で区別する。|
|低|loop-quick-actions、375|先頭行の青いフォーカス枠が右端まで伸び、右辺が見えない。割り当て・完了の印は見える。|フォーカス枠の全周と隣接する操作の区別を画面内に収める。|
|低|menu-conversation-4-operation-issues-issues.preview、menu-conversation-2-operation-issues-issues.impact、1024（右パネル）|「起票内容を確認」などを載せる小フォームは、項目により枠がカードをまたぐ。375の比較・確認操作にはメニュー幅いっぱいのものがあり、起点のボタンより大きく見える。|起点と選択フォームを同じまとまりとして読み取れる適度な幅と余白を確保する。|

## 画像で確かめた点と検証の境界

承認待ちの一覧は「下書き」と橙の「承認待ち」、承認の最終確認は宛先と全文を示す。内部メモは黄色の面に「相手には送られません」と明記する。検索0件には絞り込み解除、未対応0件には全会話への入口がある。送信結果不明では本文保持の案内と、確認用に別のタブを開くリンクが出ている。

送信、承認前の配送防止、メモの非送信、再送・取り消しの成功、ダウンロード、検索・絞り込みの実行結果、操作回数、フォーカスの復帰、キー操作、スクロール到達、反応速度、通知時間、モーダル開閉の途中の位置変化は静止画では未検証。画像に写っていない操作を不可とは判定していない。

## 状態別の記録

すべての利用者は問い合わせの運営担当者。「目的」がその状態を開く理由。「問いと答え」は撮影時点の3問、「観察」は3点以上の具体的な手がかり。フォームやボタンの説明は画像の文言に基づく。各見出しの下に左から375、1024、1440の元画像を示す。

### 001　all-inbox

運営担当者がすべての会話から着手する案件を決めるために開く。

[375px](screens/all-inbox-375.png)　[1024px](screens/all-inbox-1024.png)　[1440px](screens/all-inbox-1440.png)

**問いと画像からの答え**

- 何件か。10件。
- どの範囲か。すべての状態。
- 先頭は何か。11時間待ちの#11。

**観察**

- 375では#11の差出人と件名が別段になり、その下にさらに抜粋と印が並ぶ。
- 1024では長い差出人が2行。
- 1440では右側に時間と担当が縦に揃い、未対応・返信待ち・迷惑メールを区別できる。

### 002　approval-confirm

運営担当者が下書きを相手に送る前に承認するために開く。

[375px](screens/approval-confirm-375.png)　[1024px](screens/approval-confirm-1024.png)　[1440px](screens/approval-confirm-1440.png)

**問いと画像からの答え**

- 誰に届くか。customer5@example.net。
- 何を送るか。更新時の人数変更を案内する返信全文。
- 中止できるか。キャンセル。

**観察**

- 白い確認枠に宛先と実際の返信がある。
- 黒い「承認して送信」と白い「キャンセル」を横並びにしている。
- 375でも両ボタンと全文が収まり、背後の承認待ちカードは暗くなる。

### 003　approval-list

運営担当者が人の承認が必要な返信を見つけるために開く。

[375px](screens/approval-list-375.png)　[1024px](screens/approval-list-1024.png)　[1440px](screens/approval-list-1440.png)

**問いと画像からの答え**

- 残りは何件か。1件。
- 誰のどの案件か。山田 花さんの#5。
- 抜粋は誰の文か。下書き。

**観察**

- 一覧に「下書き」および橙の「承認待ち」がある。
- 黒の「未対応」は会話側の状態。
- 375では待ち時間と2つの印が複数段、1024・1440では1つの行の左右に収まる。

### 004　composer-empty

運営担当者が空の返信欄で新しく回答を書き始めるために開く。

[375px](screens/composer-empty-375.png)　[1024px](screens/composer-empty-1024.png)　[1440px](screens/composer-empty-1440.png)

**問いと画像からの答え**

- どの案件か。#1 領収書の宛名変更。
- どのモードか。返信。
- 今送れるか。送信ボタンは灰色。

**観察**

- 本文欄の案内は「返信を入力」。
- 差出人support@example.comと宛先customer1@example.netが表示される。
- 375では宛先が次行、1024・1440では同じ行で読める。

### 005　composer-failed

運営担当者が送信結果が確認できない返信を照合するために開く。

[375px](screens/composer-failed-375.png)　[1024px](screens/composer-failed-1024.png)　[1440px](screens/composer-failed-1440.png)

**問いと画像からの答え**

- 何が起きたか。送信結果を確認できない。
- 文は残ったか。保持した旨と入力文が見える。
- 次に何をするか。別のタブで送信結果を確認。

**観察**

- 赤い通知は単純な失敗と断定していない。
- リンクと「閉じる」がある。
- 375では相手の本文を覆い、1024・1440では返信欄の下に表示される。

### 006　composer-note

運営担当者が顧客へ送らず内部の引き継ぎを書くために開く。

[375px](screens/composer-note-375.png)　[1024px](screens/composer-note-1024.png)　[1440px](screens/composer-note-1440.png)

**問いと画像からの答え**

- どのモードか。内部メモ。
- 誰が読むか。相手には送られない。
- 何を残すか。次回の請求日までに経理担当へ確認する。

**観察**

- 入力欄全体が黄色。
- 青い入力フォーカスと黒い「メモを残す」が同じ領域にある。
- 3幅とも通常の送信ボタンと宛先表示がメモの操作に混ざらない。

### 007　composer-sending

運営担当者が入力した返信の送信中に状態を確認するために開く。

[375px](screens/composer-sending-375.png)　[1024px](screens/composer-sending-1024.png)　[1440px](screens/composer-sending-1440.png)

**問いと画像からの答え**

- 進行中か。送信中…。
- 送る相手は誰か。customer1@example.net。
- 送った内容は何か。宛名確認と再発行手順の案内。

**観察**

- 3幅に送信中の文言が見える。
- 通常の送信・送信して完了が淡色になる。
- 375は入力欄の冒頭が途中で切れ、1024・1440は本文を一行で読める。

### 008　composer-typing

運営担当者が返信の文章と宛先を確認し送るために開く。

[375px](screens/composer-typing-375.png)　[1024px](screens/composer-typing-1024.png)　[1440px](screens/composer-typing-1440.png)

**問いと画像からの答え**

- 何に答えるか。領収書の宛名変更。
- 何を書いたか。宛名を確認し、再発行手順を案内する。
- どの操作が主か。送信。

**観察**

- 入力中は青い枠。
- プレビューと送信して完了は黒い送信と区別できる。
- 375の入力表示は数行、1024・1440は横に長く本文を読める。

### 009　inbox

運営担当者が未対応の問い合わせを優先順に開くために開く。

[375px](screens/inbox-375.png)　[1024px](screens/inbox-1024.png)　[1440px](screens/inbox-1440.png)

**問いと画像からの答え**

- 残りは何件か。7件。
- 順序は何か。待たせている順。
- 対応の例外はあるか。#5に承認待ち、#4に送信失敗。

**観察**

- #11が11時間待ちで最上段。
- 1024で長い差出人が2行、1440で1行。
- 375で#4の赤い失敗と請求ラベルが抜粋より下へ移動する。

### 010　inbox-empty

運営担当者が未対応がないことを確かめて次へ進むために開く。

[375px](screens/inbox-empty-375.png)　[1024px](screens/inbox-empty-1024.png)　[1440px](screens/inbox-empty-1440.png)

**問いと画像からの答え**

- 未対応はいくつか。0件。
- なぜ行がないか。未対応の問い合わせがない。
- 次の入口は。すべての会話を見る。

**観察**

- 受信箱の線画と空の理由が並ぶ。
- 検索・並べ替えは上部に残る。
- 375では説明と次の操作を上下に、1024・1440では横に配置している。

### 011　inbox-failed

運営担当者が請求に関する未対応と未達を探すために開く。

[375px](screens/inbox-failed-375.png)　[1024px](screens/inbox-failed-1024.png)　[1440px](screens/inbox-failed-1440.png)

**問いと画像からの答え**

- 何件か。2件。
- どの条件か。請求。
- どの送信が失敗したか。#4 月額プランの明細。

**観察**

- #4の行に警告記号と赤い「送信失敗」。
- #1は赤い表示がなく両者を識別できる。
- 375では2行とも抜粋と補足が複数段になる。

### 012　inbox-filter

運営担当者がDeskで自分が担当する問い合わせに戻るために開く。

[375px](screens/inbox-filter-375.png)　[1024px](screens/inbox-filter-1024.png)　[1440px](screens/inbox-filter-1440.png)

**問いと画像からの答え**

- どの商品か。Desk。
- どの担当か。佐藤 優。
- 該当する会話は。#3 請求書の送付先。

**観察**

- 条件が個別に解除できるチップとして並ぶ。
- #3の抜粋は内部メモと明記される。
- 375は黒い未対応と担当丸印が抜粋の下、広い2幅は右寄せ。

### 013　inbox-loading

運営担当者が検索結果が読み込まれていることを確かめるために開く。

[375px](screens/inbox-loading-375.png)　[1024px](screens/inbox-loading-1024.png)　[1440px](screens/inbox-loading-1440.png)

**問いと画像からの答え**

- 入力した語は。領収書。
- どこが更新中か。検索下の行領域に灰色バー。
- 結果は何件か。まだ判別できない。

**観察**

- 検索欄を青い枠で表示。
- 3本の薄いバーは長短を付け本文の代わりになる。
- 3幅とも「未対応 7件」は残り、検索結果件数との関係は示されない。

### 014　loop-actions

運営担当者が会話の通常操作以外の処理を探すために開く。

[375px](screens/loop-actions-375.png)　[1024px](screens/loop-actions-1024.png)　[1440px](screens/loop-actions-1440.png)

**問いと画像からの答え**

- 何のメニューか。その他の操作。
- 後で対応できるか。スヌーズ。
- 受信対象から外せるか。迷惑メールにする。

**観察**

- 開いたボタンが青い輪郭。
- メニューはボタンの直下。
- 375では件名にかかるが2操作は同時に読める。

### 015　loop-assignee

運営担当者が領収書案件の担当を割り当てるために開く。

[375px](screens/loop-assignee-375.png)　[1024px](screens/loop-assignee-1024.png)　[1440px](screens/loop-assignee-1440.png)

**問いと画像からの答え**

- 現在の担当は。担当なし。
- 候補は。佐藤 優と森 直子。
- どこから変更するか。担当者を選ぶ。

**観察**

- 現在値にチェック。
- 候補に異なる頭文字と氏名。
- 375は右側に収まり、広い2幅では件名直下の属性の隣に開く。

### 016　loop-bulk

運営担当者が複数の会話を選びまとめて処理するために開く。

[375px](screens/loop-bulk-375.png)　[1024px](screens/loop-bulk-1024.png)　[1440px](screens/loop-bulk-1440.png)

**問いと画像からの答え**

- 何件を選んだか。2件。
- どれか。#11と#7。
- 何ができるか。担当・ラベル・完了・迷惑メール。

**観察**

- 選択行は薄青と黒のチェック。
- 件数のすぐ隣に選択を解除。
- 375で一括操作が3段、1024・1440では横一列。

### 017　loop-bulk-assignee

運営担当者が選択した2件を同じ人へ渡すために開く。

[375px](screens/loop-bulk-assignee-375.png)　[1024px](screens/loop-bulk-assignee-1024.png)　[1440px](screens/loop-bulk-assignee-1440.png)

**問いと画像からの答え**

- 対象は。2件。
- 誰に渡せるか。佐藤 優・森 直子。
- 元の行は見えるか。青い2行が残る。

**観察**

- 担当者を選ぶの下に候補。
- 氏名に頭文字が付く。
- 375のメニューは他の一括操作の一部を隠すが候補2人は全員読める。

### 018　loop-bulk-label

運営担当者が選択中の会話に一括でラベルを付けるために開く。

[375px](screens/loop-bulk-label-375.png)　[1024px](screens/loop-bulk-label-1024.png)　[1440px](screens/loop-bulk-label-1440.png)

**問いと画像からの答え**

- 対象は。2件。
- 一部だけ付いている印は。横線。
- 選ぶとどうなるか。選択中のすべてに付く。

**観察**

- 再発行・社内確認・経理などの左に横線。
- 請求と領収書には横線がない。
- 375では末尾の説明が折り返し、全3幅で「ラベルを管理」まで見える。

### 019　loop-filter-assignee

運営担当者が担当者名で受信箱を絞り込むために開く。

[375px](screens/loop-filter-assignee-375.png)　[1024px](screens/loop-filter-assignee-1024.png)　[1440px](screens/loop-filter-assignee-1440.png)

**問いと画像からの答え**

- どの条件か。担当者。
- 現在値は。すべて。
- 選択肢は。すべて・佐藤 優・森 直子。

**観察**

- 外側に状態・プロダクト・担当者などの条件。
- 担当者の入力直下に小さな第2メニュー。
- 375でも現在値にチェックと両候補の頭文字を表示。

### 020　loop-filter-empty

運営担当者が検索結果がない理由を見て条件を解除するために開く。

[375px](screens/loop-filter-empty-375.png)　[1024px](screens/loop-filter-empty-1024.png)　[1440px](screens/loop-filter-empty-1440.png)

**問いと画像からの答え**

- 何を検索したか。未回答の調査番号。
- 何件か。0件。
- 戻り方は。絞り込みを解除。

**観察**

- 虫眼鏡と一致なしの説明。
- 検索語は検索窓と解除チップで確認可。
- 375で説明と解除を縦、広い2幅は横に置く。

### 021　loop-filters

運営担当者が未対応一覧から条件を選んで狭めるために開く。

[375px](screens/loop-filters-375.png)　[1024px](screens/loop-filters-1024.png)　[1440px](screens/loop-filters-1440.png)

**問いと画像からの答え**

- 状態は。未対応。
- 商品・担当は。すべて。
- ラベルは。すべてのラベル。

**観察**

- 4つの条件を縦並び。
- 絞り込みボタンの直下に展開。
- 375の左側と広い2幅の右側に収まる。

### 022　loop-keyboard

運営担当者が受信箱と会話で使うキーを調べるために開く。

[375px](screens/loop-keyboard-375.png)　[1024px](screens/loop-keyboard-1024.png)　[1440px](screens/loop-keyboard-1440.png)

**問いと画像からの答え**

- 一覧の移動は。j/k。
- 会話の返信は。r。
- 閉じ方は。Escまたは閉じる。

**観察**

- 受信箱・会話・共通でグループ化。
- 背景を暗くしている。
- 3幅すべてで閉じるボタンに青い枠が見える。

### 023　loop-labels

運営担当者が会話に付いているラベルを更新するために開く。

[375px](screens/loop-labels-375.png)　[1024px](screens/loop-labels-1024.png)　[1440px](screens/loop-labels-1440.png)

**問いと画像からの答え**

- 付与済みは。経理・請求・領収書。
- 増やせるか。新しいラベルを作成。
- 管理へ行けるか。ラベルを管理。

**観察**

- 選択には灰色背景とチェックを併用。
- 新規作成と管理は選択肢の下。
- 375で長いラベル名も1行で読める。

### 024　loop-quick-actions

運営担当者が一覧で1件にフォーカスしてすぐ操作するために開く。

[375px](screens/loop-quick-actions-375.png)　[1024px](screens/loop-quick-actions-1024.png)　[1440px](screens/loop-quick-actions-1440.png)

**問いと画像からの答え**

- 対象は。先頭の#11。
- 何が現れたか。人と＋、チェックの操作。
- 選択済みか。行のチェックボックスは空。

**観察**

- 青枠は先頭の会話。
- 行の右側に2個のアイコン。
- 375の青枠の右辺は画面端で見えず、1024・1440で枠内外の区分が見える。

### 025　loop-reply-preview

運営担当者が書いた返信の送信内容を見直すために開く。

[375px](screens/loop-reply-preview-375.png)　[1024px](screens/loop-reply-preview-1024.png)　[1440px](screens/loop-reply-preview-1440.png)

**問いと画像からの答え**

- 差出人は。support@example.com。
- 宛先は。customer1@example.net。
- 件名と本文は。Re:の件名と購入履歴からの再発行案内。

**観察**

- 差出人・宛先・件名が別々の段。
- プレビューの枠が入力本文の下。
- 3幅の画像に送信決定ボタンは写っておらず次の操作は未検証。

### 026　loop-reply-undo

運営担当者が返信と完了を取り消すか判断するために開く。

[375px](screens/loop-reply-undo-375.png)　[1024px](screens/loop-reply-undo-1024.png)　[1440px](screens/loop-reply-undo-1440.png)

**問いと画像からの答え**

- 何を変更するか。返信送信と会話の完了。
- 何を取り消せるか。両方。
- 現在の配送は。広い2幅で送信待ち。

**観察**

- 緑の通知に取り消すボタン。
- ヘッダーは未対応のまま。
- 375の通知は受信本文に、1024・1440では追加された返信の本文に重なる。

### 027　loop-status

運営担当者が今の状態を確認して会話を仕分けるために開く。

[375px](screens/loop-status-375.png)　[1024px](screens/loop-status-1024.png)　[1440px](screens/loop-status-1440.png)

**問いと画像からの答え**

- 現在は。未対応。
- 終えられるか。完了にする。
- 対象外にできるか。迷惑メールにする。

**観察**

- 黒の未対応が起点。
- 開いたメニュー冒頭でも現在状態を明示。
- 375でも2操作が1行ずつ表示される。

### 028　menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest

運営担当者が#1「領収書の宛名を変更できますか」から記事候補を残すために開く。

[375px](screens/menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-conversation-1-notice-note-82513194-operation-articles-articles.suggest-1440.png)

**問いと画像からの答え**

- どの会話からか。#1「領収書の宛名を変更できますか」。
- 何を書くか。記事にする内容。
- 何が作られるか。記事の候補。

**観察**

- 「記事候補を書く」のすぐそばに元の番号・件名。
- 入力欄に青い輪郭、この時点の欄は空。
- 375は関連情報のみ、1024は背後を暗くした右パネル、1440は会話横で入力する。
- 1024・1440の背後には黄色い内部メモが見える。

### 029　menu-conversation-1-notice-note-82513194-operation-issues-issues.preview

運営担当者が#1「領収書の宛名を変更できますか」を元に外部へ起票する内容を準備するために開く。

[375px](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-375.png)　[1024px](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-conversation-1-notice-note-82513194-operation-issues-issues.preview-1440.png)

**問いと画像からの答え**

- 元は何か。#1「領収書の宛名を変更できますか」。
- 投稿先は。example/helpdesk。
- 公開するものは。タイトルと要約。

**観察**

- 元の問い合わせの番号と件名が入力欄より先。
- 見出しは「公開する要約」、次は「起票内容を確認」。
- 375は関連情報だけ、1024の右パネルでは背後が暗く、1440では会話と同時に見える。
- 1024・1440の背後には黄色い内部メモが見える。

### 030　menu-conversation-1-notice-note-82513194-operation-merge-merge.combine

運営担当者が#1「領収書の宛名を変更できますか」とまとめる先を照合するために開く。

[375px](screens/menu-conversation-1-notice-note-82513194-operation-merge-merge.combine-375.png)　[1024px](screens/menu-conversation-1-notice-note-82513194-operation-merge-merge.combine-1024.png)　[1440px](screens/menu-conversation-1-notice-note-82513194-operation-merge-merge.combine-1440.png)

**問いと画像からの答え**

- 元は何か。#1「領収書の宛名を変更できますか」。
- 先は何か。#2 ワークスペースの招待メールについて。
- 直ちに統合するか。画面の次の操作は内容確認。

**観察**

- 統合元と統合先を別の見出しで表示。
- 候補は1件、番号と件名で選べる。
- 375ではスマホ全幅のパネルで全文を折り返し、広い2幅では会話の右側に入力欄を置く。
- 1024・1440の背後には黄色い内部メモが見える。

### 031　menu-conversation-1-notice-note-82513194-reply-templates

運営担当者が#1「領収書の宛名を変更できますか」の返信のたたき台を選ぶために開く。

[375px](screens/menu-conversation-1-notice-note-82513194-reply-templates-375.png)　[1024px](screens/menu-conversation-1-notice-note-82513194-reply-templates-1024.png)　[1440px](screens/menu-conversation-1-notice-note-82513194-reply-templates-1440.png)

**問いと画像からの答え**

- 選択中の定型文は。お問い合わせの受付。
- 宛名と製品は。山田 花、Slide。
- 次は何か。定型文から下書きを作成。

**観察**

- ラジオの印が候補名の横。
- 本文例はHelloから始まり商品名で結ぶ。
- 375では返信欄の下側に重なり、3幅とも作成ボタンと起点の「定型文を選ぶ」が見える。
- 広い2幅ではメモの保存通知と黄色いメモを確認できる。

### 032　menu-conversation-1-notice-note-82513194-thread-actions

運営担当者が#1「領収書の宛名を変更できますか」の副次的な処理を選ぶために開く。

[375px](screens/menu-conversation-1-notice-note-82513194-thread-actions-375.png)　[1024px](screens/menu-conversation-1-notice-note-82513194-thread-actions-1024.png)　[1440px](screens/menu-conversation-1-notice-note-82513194-thread-actions-1440.png)

**問いと画像からの答え**

- どの会話か。#1「領収書の宛名を変更できますか」。
- 可能な処理は。スヌーズ・迷惑メールにする。
- 後で対応する入口は。スヌーズ。

**観察**

- 上部の「その他の操作」から下に展開。
- スヌーズの左に展開記号があり項目にも青枠。
- 375では件名の中央にかかり、広い2幅ではツールバーの右寄りに収まる。
- 広い2幅ではメモの保存通知と黄色いメモを確認できる。

### 033　menu-conversation-1-notice-note-82513194-thread-assignee

運営担当者が#1「領収書の宛名を変更できますか」の現在の担当を確認し割り当てるために開く。

[375px](screens/menu-conversation-1-notice-note-82513194-thread-assignee-375.png)　[1024px](screens/menu-conversation-1-notice-note-82513194-thread-assignee-1024.png)　[1440px](screens/menu-conversation-1-notice-note-82513194-thread-assignee-1440.png)

**問いと画像からの答え**

- 現在誰の担当か。担当なし。
- 候補は。佐藤 優・森 直子。
- 担当を外せるか。「担当なし」が選択肢にある。

**観察**

- 実名と色付き頭文字を併記。
- チェックが現在値、最初の「担当なし」に青いフォーカス。
- 375では件名の下に折り返した属性に隣接し、1024・1440では横1列の属性の下に開く。
- 広い2幅ではメモの保存通知と黄色いメモを確認できる。

### 034　menu-conversation-1-notice-note-82513194-thread-labels

運営担当者が#1「領収書の宛名を変更できますか」に合うラベルを探すために開く。

[375px](screens/menu-conversation-1-notice-note-82513194-thread-labels-375.png)　[1024px](screens/menu-conversation-1-notice-note-82513194-thread-labels-1024.png)　[1440px](screens/menu-conversation-1-notice-note-82513194-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#1「領収書の宛名を変更できますか」。
- 現在付いているものは。経理・請求・領収書。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。
- 広い2幅ではメモの保存通知と黄色いメモを確認できる。

### 035　menu-conversation-1-notice-note-82513194-thread-status

運営担当者が#1「領収書の宛名を変更できますか」の対応状態を変更するために開く。

[375px](screens/menu-conversation-1-notice-note-82513194-thread-status-375.png)　[1024px](screens/menu-conversation-1-notice-note-82513194-thread-status-1024.png)　[1440px](screens/menu-conversation-1-notice-note-82513194-thread-status-1440.png)

**問いと画像からの答え**

- 現在の状態は。未対応。
- 終えられるか。完了にする。
- ほかの扱いは。迷惑メールにする。

**観察**

- 起点の状態バッジが青枠。
- メニュー内にも「現在の状態」と同じ印が並ぶ。
- 375でメニューは受信文の上、1024・1440では会話の属性直下。
- 広い2幅ではメモの保存通知と黄色いメモを確認できる。

### 036　menu-conversation-1-operation-articles-articles.suggest

運営担当者が#1「領収書の宛名を変更できますか」から記事候補を残すために開く。

[375px](screens/menu-conversation-1-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-conversation-1-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-conversation-1-operation-articles-articles.suggest-1440.png)

**問いと画像からの答え**

- どの会話からか。#1「領収書の宛名を変更できますか」。
- 何を書くか。記事にする内容。
- 何が作られるか。記事の候補。

**観察**

- 「記事候補を書く」のすぐそばに元の番号・件名。
- 入力欄に青い輪郭、この時点の欄は空。
- 375は関連情報のみ、1024は背後を暗くした右パネル、1440は会話横で入力する。

### 037　menu-conversation-1-operation-issues-issues.preview

運営担当者が#1「領収書の宛名を変更できますか」を元に外部へ起票する内容を準備するために開く。

[375px](screens/menu-conversation-1-operation-issues-issues.preview-375.png)　[1024px](screens/menu-conversation-1-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-conversation-1-operation-issues-issues.preview-1440.png)

**問いと画像からの答え**

- 元は何か。#1「領収書の宛名を変更できますか」。
- 投稿先は。example/helpdesk。
- 公開するものは。タイトルと要約。

**観察**

- 元の問い合わせの番号と件名が入力欄より先。
- 見出しは「公開する要約」、次は「起票内容を確認」。
- 375は関連情報だけ、1024の右パネルでは背後が暗く、1440では会話と同時に見える。

### 038　menu-conversation-1-operation-merge-merge.combine

運営担当者が#1「領収書の宛名を変更できますか」とまとめる先を照合するために開く。

[375px](screens/menu-conversation-1-operation-merge-merge.combine-375.png)　[1024px](screens/menu-conversation-1-operation-merge-merge.combine-1024.png)　[1440px](screens/menu-conversation-1-operation-merge-merge.combine-1440.png)

**問いと画像からの答え**

- 元は何か。#1「領収書の宛名を変更できますか」。
- 先は何か。#2 ワークスペースの招待メールについて。
- 直ちに統合するか。画面の次の操作は内容確認。

**観察**

- 統合元と統合先を別の見出しで表示。
- 候補は1件、番号と件名で選べる。
- 375ではスマホ全幅のパネルで全文を折り返し、広い2幅では会話の右側に入力欄を置く。

### 039　menu-conversation-1-reply-templates

運営担当者が#1「領収書の宛名を変更できますか」の返信のたたき台を選ぶために開く。

[375px](screens/menu-conversation-1-reply-templates-375.png)　[1024px](screens/menu-conversation-1-reply-templates-1024.png)　[1440px](screens/menu-conversation-1-reply-templates-1440.png)

**問いと画像からの答え**

- 選択中の定型文は。お問い合わせの受付。
- 宛名と製品は。山田 花、Slide。
- 次は何か。定型文から下書きを作成。

**観察**

- ラジオの印が候補名の横。
- 本文例はHelloから始まり商品名で結ぶ。
- 375では返信欄の下側に重なり、3幅とも作成ボタンと起点の「定型文を選ぶ」が見える。

### 040　menu-conversation-1-thread-actions

運営担当者が#1「領収書の宛名を変更できますか」の副次的な処理を選ぶために開く。

[375px](screens/menu-conversation-1-thread-actions-375.png)　[1024px](screens/menu-conversation-1-thread-actions-1024.png)　[1440px](screens/menu-conversation-1-thread-actions-1440.png)

**問いと画像からの答え**

- どの会話か。#1「領収書の宛名を変更できますか」。
- 可能な処理は。スヌーズ・迷惑メールにする。
- 後で対応する入口は。スヌーズ。

**観察**

- 上部の「その他の操作」から下に展開。
- スヌーズの左に展開記号があり項目にも青枠。
- 375では件名の中央にかかり、広い2幅ではツールバーの右寄りに収まる。

### 041　menu-conversation-1-thread-assignee

運営担当者が#1「領収書の宛名を変更できますか」の現在の担当を確認し割り当てるために開く。

[375px](screens/menu-conversation-1-thread-assignee-375.png)　[1024px](screens/menu-conversation-1-thread-assignee-1024.png)　[1440px](screens/menu-conversation-1-thread-assignee-1440.png)

**問いと画像からの答え**

- 現在誰の担当か。担当なし。
- 候補は。佐藤 優・森 直子。
- 担当を外せるか。「担当なし」が選択肢にある。

**観察**

- 実名と色付き頭文字を併記。
- チェックが現在値、最初の「担当なし」に青いフォーカス。
- 375では件名の下に折り返した属性に隣接し、1024・1440では横1列の属性の下に開く。

### 042　menu-conversation-1-thread-labels

運営担当者が#1「領収書の宛名を変更できますか」に合うラベルを探すために開く。

[375px](screens/menu-conversation-1-thread-labels-375.png)　[1024px](screens/menu-conversation-1-thread-labels-1024.png)　[1440px](screens/menu-conversation-1-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#1「領収書の宛名を変更できますか」。
- 現在付いているものは。経理・請求・領収書。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。

### 043　menu-conversation-1-thread-status

運営担当者が#1「領収書の宛名を変更できますか」の対応状態を変更するために開く。

[375px](screens/menu-conversation-1-thread-status-375.png)　[1024px](screens/menu-conversation-1-thread-status-1024.png)　[1440px](screens/menu-conversation-1-thread-status-1440.png)

**問いと画像からの答え**

- 現在の状態は。未対応。
- 終えられるか。完了にする。
- ほかの扱いは。迷惑メールにする。

**観察**

- 起点の状態バッジが青枠。
- メニュー内にも「現在の状態」と同じ印が並ぶ。
- 375でメニューは受信文の上、1024・1440では会話の属性直下。

### 044　menu-conversation-10-operation-issues-issues.preview

運営担当者が#10「運営画面をキーボードで使っています」を元に外部へ起票する内容を準備するために開く。

[375px](screens/menu-conversation-10-operation-issues-issues.preview-375.png)　[1024px](screens/menu-conversation-10-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-conversation-10-operation-issues-issues.preview-1440.png)

**問いと画像からの答え**

- 元は何か。#10「運営画面をキーボードで使っています」。
- 投稿先は。example/helpdesk。
- 公開するものは。タイトルと要約。

**観察**

- 元のフィードバックの番号と件名が入力欄より先。
- 見出しは「公開する要約」、次は「起票内容を確認」。
- 375は関連情報だけ、1024の右パネルでは背後が暗く、1440では会話と同時に見える。

### 045　menu-conversation-10-thread-labels

運営担当者が#10「運営画面をキーボードで使っています」に合うラベルを探すために開く。

[375px](screens/menu-conversation-10-thread-labels-375.png)　[1024px](screens/menu-conversation-10-thread-labels-1024.png)　[1440px](screens/menu-conversation-10-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#10「運営画面をキーボードで使っています」。
- 現在付いているものは。チェックの付いた候補は見えない。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。

### 046　menu-conversation-2-operation-articles-articles.suggest

運営担当者が#2「ワークスペースの招待メールについて」から記事候補を残すために開く。

[375px](screens/menu-conversation-2-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-conversation-2-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-conversation-2-operation-articles-articles.suggest-1440.png)

**問いと画像からの答え**

- どの会話からか。#2「ワークスペースの招待メールについて」。
- 何を書くか。記事にする内容。
- 何が作られるか。記事の候補。

**観察**

- 「記事候補を書く」のすぐそばに元の番号・件名。
- 入力欄に青い輪郭、この時点の欄は空。
- 375は関連情報のみ、1024は背後を暗くした右パネル、1440は会話横で入力する。

### 047　menu-conversation-2-operation-issues-issues.impact

運営担当者が#2「ワークスペースの招待メールについて」に関係する修正前後の件数を比較するために開く。

[375px](screens/menu-conversation-2-operation-issues-issues.impact-375.png)　[1024px](screens/menu-conversation-2-operation-issues-issues.impact-1024.png)　[1440px](screens/menu-conversation-2-operation-issues-issues.impact-1440.png)

**問いと画像からの答え**

- どの課題か。#43。
- 期間は。30日間。
- 次の操作は。修正前後の件数を比較。

**観察**

- 課題の選択欄が青く縁取られる。
- #43の番号は残るが選択欄で長い表示の末尾が切れる。
- 375では関連情報の全幅、1024では右の引き出し、1440では常設の右欄に比較操作がある。

### 048　menu-conversation-2-operation-issues-issues.preview

運営担当者が#2「ワークスペースの招待メールについて」を元に外部へ起票する内容を準備するために開く。

[375px](screens/menu-conversation-2-operation-issues-issues.preview-375.png)　[1024px](screens/menu-conversation-2-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-conversation-2-operation-issues-issues.preview-1440.png)

**問いと画像からの答え**

- 元は何か。#2「ワークスペースの招待メールについて」。
- 投稿先は。example/helpdesk。
- 公開するものは。タイトルと要約。

**観察**

- 元の問い合わせの番号と件名が入力欄より先。
- 見出しは「公開する要約」、次は「起票内容を確認」。
- 375は関連情報だけ、1024の右パネルでは背後が暗く、1440では会話と同時に見える。

### 049　menu-conversation-2-operation-merge-merge.combine

運営担当者が#2「ワークスペースの招待メールについて」とまとめる先を照合するために開く。

[375px](screens/menu-conversation-2-operation-merge-merge.combine-375.png)　[1024px](screens/menu-conversation-2-operation-merge-merge.combine-1024.png)　[1440px](screens/menu-conversation-2-operation-merge-merge.combine-1440.png)

**問いと画像からの答え**

- 元は何か。#2「ワークスペースの招待メールについて」。
- 先は何か。#1 領収書の宛名を変更できますか。
- 直ちに統合するか。画面の次の操作は内容確認。

**観察**

- 統合元と統合先を別の見出しで表示。
- 候補は1件、番号と件名で選べる。
- 375ではスマホ全幅のパネルで全文を折り返し、広い2幅では会話の右側に入力欄を置く。

### 050　menu-conversation-2-reply-templates

運営担当者が#2「ワークスペースの招待メールについて」の返信のたたき台を選ぶために開く。

[375px](screens/menu-conversation-2-reply-templates-375.png)　[1024px](screens/menu-conversation-2-reply-templates-1024.png)　[1440px](screens/menu-conversation-2-reply-templates-1440.png)

**問いと画像からの答え**

- 選択中の定型文は。お問い合わせの受付。
- 宛名と製品は。山田 花、Slide。
- 次は何か。定型文から下書きを作成。

**観察**

- ラジオの印が候補名の横。
- 本文例はHelloから始まり商品名で結ぶ。
- 375では返信欄の下側に重なり、3幅とも作成ボタンと起点の「定型文を選ぶ」が見える。

### 051　menu-conversation-2-thread-actions

運営担当者が#2「ワークスペースの招待メールについて」の副次的な処理を選ぶために開く。

[375px](screens/menu-conversation-2-thread-actions-375.png)　[1024px](screens/menu-conversation-2-thread-actions-1024.png)　[1440px](screens/menu-conversation-2-thread-actions-1440.png)

**問いと画像からの答え**

- どの会話か。#2「ワークスペースの招待メールについて」。
- 可能な処理は。スヌーズ・未対応に戻す・迷惑メールにする。
- 後で対応する入口は。スヌーズ。

**観察**

- 上部の「その他の操作」から下に展開。
- スヌーズの左に展開記号があり項目にも青枠。
- 375では件名の中央にかかり、広い2幅ではツールバーの右寄りに収まる。

### 052　menu-conversation-2-thread-assignee

運営担当者が#2「ワークスペースの招待メールについて」の現在の担当を確認し割り当てるために開く。

[375px](screens/menu-conversation-2-thread-assignee-375.png)　[1024px](screens/menu-conversation-2-thread-assignee-1024.png)　[1440px](screens/menu-conversation-2-thread-assignee-1440.png)

**問いと画像からの答え**

- 現在誰の担当か。佐藤 優。
- 候補は。佐藤 優・森 直子。
- 担当を外せるか。「担当なし」が選択肢にある。

**観察**

- 実名と色付き頭文字を併記。
- チェックが現在値、最初の「担当なし」に青いフォーカス。
- 375では件名の下に折り返した属性に隣接し、1024・1440では横1列の属性の下に開く。

### 053　menu-conversation-2-thread-labels

運営担当者が#2「ワークスペースの招待メールについて」に合うラベルを探すために開く。

[375px](screens/menu-conversation-2-thread-labels-375.png)　[1024px](screens/menu-conversation-2-thread-labels-1024.png)　[1440px](screens/menu-conversation-2-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#2「ワークスペースの招待メールについて」。
- 現在付いているものは。チェックの付いた候補は見えない。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。

### 054　menu-conversation-2-thread-status

運営担当者が#2「ワークスペースの招待メールについて」の対応状態を変更するために開く。

[375px](screens/menu-conversation-2-thread-status-375.png)　[1024px](screens/menu-conversation-2-thread-status-1024.png)　[1440px](screens/menu-conversation-2-thread-status-1440.png)

**問いと画像からの答え**

- 現在の状態は。返信待ち。
- 終えられるか。完了にする。
- ほかの扱いは。未対応に戻す・迷惑メールにする。

**観察**

- 起点の状態バッジが青枠。
- メニュー内にも「現在の状態」と同じ印が並ぶ。
- 375でメニューは受信文の上、1024・1440では会話の属性直下。

### 055　menu-conversation-3-operation-articles-articles.suggest

運営担当者が#3「更新前に請求書の送付先を確認したい」から記事候補を残すために開く。

[375px](screens/menu-conversation-3-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-conversation-3-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-conversation-3-operation-articles-articles.suggest-1440.png)

**問いと画像からの答え**

- どの会話からか。#3「更新前に請求書の送付先を確認したい」。
- 何を書くか。記事にする内容。
- 何が作られるか。記事の候補。

**観察**

- 「記事候補を書く」のすぐそばに元の番号・件名。
- 入力欄に青い輪郭、この時点の欄は空。
- 375は関連情報のみ、1024は背後を暗くした右パネル、1440は会話横で入力する。

### 056　menu-conversation-3-operation-issues-issues.preview

運営担当者が#3「更新前に請求書の送付先を確認したい」を元に外部へ起票する内容を準備するために開く。

[375px](screens/menu-conversation-3-operation-issues-issues.preview-375.png)　[1024px](screens/menu-conversation-3-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-conversation-3-operation-issues-issues.preview-1440.png)

**問いと画像からの答え**

- 元は何か。#3「更新前に請求書の送付先を確認したい」。
- 投稿先は。example/desk。
- 公開するものは。タイトルと要約。

**観察**

- 元の問い合わせの番号と件名が入力欄より先。
- 見出しは「公開する要約」、次は「起票内容を確認」。
- 375は関連情報だけ、1024の右パネルでは背後が暗く、1440では会話と同時に見える。

### 057　menu-conversation-3-reply-templates

運営担当者が#3「更新前に請求書の送付先を確認したい」の返信のたたき台を選ぶために開く。

[375px](screens/menu-conversation-3-reply-templates-375.png)　[1024px](screens/menu-conversation-3-reply-templates-1024.png)　[1440px](screens/menu-conversation-3-reply-templates-1440.png)

**問いと画像からの答え**

- 選択中の定型文は。お問い合わせの受付。
- 宛名と製品は。森 海斗、Desk。
- 次は何か。定型文から下書きを作成。

**観察**

- ラジオの印が候補名の横。
- 本文例はHelloから始まり商品名で結ぶ。
- 375では返信欄の下側に重なり、3幅とも作成ボタンと起点の「定型文を選ぶ」が見える。

### 058　menu-conversation-3-thread-actions

運営担当者が#3「更新前に請求書の送付先を確認したい」の副次的な処理を選ぶために開く。

[375px](screens/menu-conversation-3-thread-actions-375.png)　[1024px](screens/menu-conversation-3-thread-actions-1024.png)　[1440px](screens/menu-conversation-3-thread-actions-1440.png)

**問いと画像からの答え**

- どの会話か。#3「更新前に請求書の送付先を確認したい」。
- 可能な処理は。スヌーズ・迷惑メールにする。
- 後で対応する入口は。スヌーズ。

**観察**

- 上部の「その他の操作」から下に展開。
- スヌーズの左に展開記号があり項目にも青枠。
- 375では件名の中央にかかり、広い2幅ではツールバーの右寄りに収まる。

### 059　menu-conversation-3-thread-assignee

運営担当者が#3「更新前に請求書の送付先を確認したい」の現在の担当を確認し割り当てるために開く。

[375px](screens/menu-conversation-3-thread-assignee-375.png)　[1024px](screens/menu-conversation-3-thread-assignee-1024.png)　[1440px](screens/menu-conversation-3-thread-assignee-1440.png)

**問いと画像からの答え**

- 現在誰の担当か。佐藤 優。
- 候補は。佐藤 優・森 直子。
- 担当を外せるか。「担当なし」が選択肢にある。

**観察**

- 実名と色付き頭文字を併記。
- チェックが現在値、最初の「担当なし」に青いフォーカス。
- 375では件名の下に折り返した属性に隣接し、1024・1440では横1列の属性の下に開く。

### 060　menu-conversation-3-thread-labels

運営担当者が#3「更新前に請求書の送付先を確認したい」に合うラベルを探すために開く。

[375px](screens/menu-conversation-3-thread-labels-375.png)　[1024px](screens/menu-conversation-3-thread-labels-1024.png)　[1440px](screens/menu-conversation-3-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#3「更新前に請求書の送付先を確認したい」。
- 現在付いているものは。チェックの付いた候補は見えない。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。

### 061　menu-conversation-3-thread-status

運営担当者が#3「更新前に請求書の送付先を確認したい」の対応状態を変更するために開く。

[375px](screens/menu-conversation-3-thread-status-375.png)　[1024px](screens/menu-conversation-3-thread-status-1024.png)　[1440px](screens/menu-conversation-3-thread-status-1440.png)

**問いと画像からの答え**

- 現在の状態は。未対応。
- 終えられるか。完了にする。
- ほかの扱いは。迷惑メールにする。

**観察**

- 起点の状態バッジが青枠。
- メニュー内にも「現在の状態」と同じ印が並ぶ。
- 375でメニューは受信文の上、1024・1440では会話の属性直下。

### 062　menu-conversation-4-operation-articles-articles.suggest

運営担当者が#4「月額プランの明細を確認したいです」から記事候補を残すために開く。

[375px](screens/menu-conversation-4-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-conversation-4-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-conversation-4-operation-articles-articles.suggest-1440.png)

**問いと画像からの答え**

- どの会話からか。#4「月額プランの明細を確認したいです」。
- 何を書くか。記事にする内容。
- 何が作られるか。記事の候補。

**観察**

- 「記事候補を書く」のすぐそばに元の番号・件名。
- 入力欄に青い輪郭、この時点の欄は空。
- 375は関連情報のみ、1024は背後を暗くした右パネル、1440は会話横で入力する。

### 063　menu-conversation-4-operation-issues-issues.impact

運営担当者が#4「月額プランの明細を確認したいです」に関係する修正前後の件数を比較するために開く。

[375px](screens/menu-conversation-4-operation-issues-issues.impact-375.png)　[1024px](screens/menu-conversation-4-operation-issues-issues.impact-1024.png)　[1440px](screens/menu-conversation-4-operation-issues-issues.impact-1440.png)

**問いと画像からの答え**

- どの課題か。#42。
- 期間は。30日間。
- 次の操作は。修正前後の件数を比較。

**観察**

- 課題の選択欄が青く縁取られる。
- #42の番号は残るが選択欄で長い表示の末尾が切れる。
- 375では関連情報の全幅、1024では右の引き出し、1440では常設の右欄に比較操作がある。

### 064　menu-conversation-4-operation-issues-issues.preview

運営担当者が#4「月額プランの明細を確認したいです」を元に外部へ起票する内容を準備するために開く。

[375px](screens/menu-conversation-4-operation-issues-issues.preview-375.png)　[1024px](screens/menu-conversation-4-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-conversation-4-operation-issues-issues.preview-1440.png)

**問いと画像からの答え**

- 元は何か。#4「月額プランの明細を確認したいです」。
- 投稿先は。example/helpdesk。
- 公開するものは。タイトルと要約。

**観察**

- 元の問い合わせの番号と件名が入力欄より先。
- 見出しは「公開する要約」、次は「起票内容を確認」。
- 375は関連情報だけ、1024の右パネルでは背後が暗く、1440では会話と同時に見える。

### 065　menu-conversation-4-reply-templates

運営担当者が#4「月額プランの明細を確認したいです」の返信のたたき台を選ぶために開く。

[375px](screens/menu-conversation-4-reply-templates-375.png)　[1024px](screens/menu-conversation-4-reply-templates-1024.png)　[1440px](screens/menu-conversation-4-reply-templates-1440.png)

**問いと画像からの答え**

- 選択中の定型文は。お問い合わせの受付。
- 宛名と製品は。渡辺 葵、Slide。
- 次は何か。定型文から下書きを作成。

**観察**

- ラジオの印が候補名の横。
- 本文例はHelloから始まり商品名で結ぶ。
- 375では返信欄の下側に重なり、3幅とも作成ボタンと起点の「定型文を選ぶ」が見える。

### 066　menu-conversation-4-thread-actions

運営担当者が#4「月額プランの明細を確認したいです」の副次的な処理を選ぶために開く。

[375px](screens/menu-conversation-4-thread-actions-375.png)　[1024px](screens/menu-conversation-4-thread-actions-1024.png)　[1440px](screens/menu-conversation-4-thread-actions-1440.png)

**問いと画像からの答え**

- どの会話か。#4「月額プランの明細を確認したいです」。
- 可能な処理は。スヌーズ・迷惑メールにする。
- 後で対応する入口は。スヌーズ。

**観察**

- 上部の「その他の操作」から下に展開。
- スヌーズの左に展開記号があり項目にも青枠。
- 375では件名の中央にかかり、広い2幅ではツールバーの右寄りに収まる。

### 067　menu-conversation-4-thread-assignee

運営担当者が#4「月額プランの明細を確認したいです」の現在の担当を確認し割り当てるために開く。

[375px](screens/menu-conversation-4-thread-assignee-375.png)　[1024px](screens/menu-conversation-4-thread-assignee-1024.png)　[1440px](screens/menu-conversation-4-thread-assignee-1440.png)

**問いと画像からの答え**

- 現在誰の担当か。佐藤 優。
- 候補は。佐藤 優・森 直子。
- 担当を外せるか。「担当なし」が選択肢にある。

**観察**

- 実名と色付き頭文字を併記。
- チェックが現在値、最初の「担当なし」に青いフォーカス。
- 375では件名の下に折り返した属性に隣接し、1024・1440では横1列の属性の下に開く。

### 068　menu-conversation-4-thread-labels

運営担当者が#4「月額プランの明細を確認したいです」に合うラベルを探すために開く。

[375px](screens/menu-conversation-4-thread-labels-375.png)　[1024px](screens/menu-conversation-4-thread-labels-1024.png)　[1440px](screens/menu-conversation-4-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#4「月額プランの明細を確認したいです」。
- 現在付いているものは。請求。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。

### 069　menu-conversation-4-thread-status

運営担当者が#4「月額プランの明細を確認したいです」の対応状態を変更するために開く。

[375px](screens/menu-conversation-4-thread-status-375.png)　[1024px](screens/menu-conversation-4-thread-status-1024.png)　[1440px](screens/menu-conversation-4-thread-status-1440.png)

**問いと画像からの答え**

- 現在の状態は。未対応。
- 終えられるか。完了にする。
- ほかの扱いは。迷惑メールにする。

**観察**

- 起点の状態バッジが青枠。
- メニュー内にも「現在の状態」と同じ印が並ぶ。
- 375でメニューは受信文の上、1024・1440では会話の属性直下。

### 070　menu-conversation-5-operation-articles-articles.suggest

運営担当者が#5「チームプランの契約更新について」から記事候補を残すために開く。

[375px](screens/menu-conversation-5-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-conversation-5-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-conversation-5-operation-articles-articles.suggest-1440.png)

**問いと画像からの答え**

- どの会話からか。#5「チームプランの契約更新について」。
- 何を書くか。記事にする内容。
- 何が作られるか。記事の候補。

**観察**

- 「記事候補を書く」のすぐそばに元の番号・件名。
- 入力欄に青い輪郭、この時点の欄は空。
- 375は関連情報のみ、1024は背後を暗くした右パネル、1440は会話横で入力する。

### 071　menu-conversation-5-operation-issues-issues.impact

運営担当者が#5「チームプランの契約更新について」に関係する修正前後の件数を比較するために開く。

[375px](screens/menu-conversation-5-operation-issues-issues.impact-375.png)　[1024px](screens/menu-conversation-5-operation-issues-issues.impact-1024.png)　[1440px](screens/menu-conversation-5-operation-issues-issues.impact-1440.png)

**問いと画像からの答え**

- どの課題か。#43。
- 期間は。30日間。
- 次の操作は。修正前後の件数を比較。

**観察**

- 課題の選択欄が青く縁取られる。
- #43の番号は残るが選択欄で長い表示の末尾が切れる。
- 375では関連情報の全幅、1024では右の引き出し、1440では常設の右欄に比較操作がある。

### 072　menu-conversation-5-operation-issues-issues.preview

運営担当者が#5「チームプランの契約更新について」を元に外部へ起票する内容を準備するために開く。

[375px](screens/menu-conversation-5-operation-issues-issues.preview-375.png)　[1024px](screens/menu-conversation-5-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-conversation-5-operation-issues-issues.preview-1440.png)

**問いと画像からの答え**

- 元は何か。#5「チームプランの契約更新について」。
- 投稿先は。example/helpdesk。
- 公開するものは。タイトルと要約。

**観察**

- 元の問い合わせの番号と件名が入力欄より先。
- 見出しは「公開する要約」、次は「起票内容を確認」。
- 375は関連情報だけ、1024の右パネルでは背後が暗く、1440では会話と同時に見える。

### 073　menu-conversation-5-reply-templates

運営担当者が#5「チームプランの契約更新について」の返信のたたき台を選ぶために開く。

[375px](screens/menu-conversation-5-reply-templates-375.png)　[1024px](screens/menu-conversation-5-reply-templates-1024.png)　[1440px](screens/menu-conversation-5-reply-templates-1440.png)

**問いと画像からの答え**

- 選択中の定型文は。お問い合わせの受付。
- 宛名と製品は。山田 花、Slide。
- 次は何か。定型文から下書きを作成。

**観察**

- ラジオの印が候補名の横。
- 本文例はHelloから始まり商品名で結ぶ。
- 375では返信欄の下側に重なり、3幅とも作成ボタンと起点の「定型文を選ぶ」が見える。

### 074　menu-conversation-5-thread-actions

運営担当者が#5「チームプランの契約更新について」の副次的な処理を選ぶために開く。

[375px](screens/menu-conversation-5-thread-actions-375.png)　[1024px](screens/menu-conversation-5-thread-actions-1024.png)　[1440px](screens/menu-conversation-5-thread-actions-1440.png)

**問いと画像からの答え**

- どの会話か。#5「チームプランの契約更新について」。
- 可能な処理は。スヌーズ・迷惑メールにする。
- 後で対応する入口は。スヌーズ。

**観察**

- 上部の「その他の操作」から下に展開。
- スヌーズの左に展開記号があり項目にも青枠。
- 375では件名の中央にかかり、広い2幅ではツールバーの右寄りに収まる。

### 075　menu-conversation-5-thread-assignee

運営担当者が#5「チームプランの契約更新について」の現在の担当を確認し割り当てるために開く。

[375px](screens/menu-conversation-5-thread-assignee-375.png)　[1024px](screens/menu-conversation-5-thread-assignee-1024.png)　[1440px](screens/menu-conversation-5-thread-assignee-1440.png)

**問いと画像からの答え**

- 現在誰の担当か。担当なし。
- 候補は。佐藤 優・森 直子。
- 担当を外せるか。「担当なし」が選択肢にある。

**観察**

- 実名と色付き頭文字を併記。
- チェックが現在値、最初の「担当なし」に青いフォーカス。
- 375では件名の下に折り返した属性に隣接し、1024・1440では横1列の属性の下に開く。

### 076　menu-conversation-5-thread-labels

運営担当者が#5「チームプランの契約更新について」に合うラベルを探すために開く。

[375px](screens/menu-conversation-5-thread-labels-375.png)　[1024px](screens/menu-conversation-5-thread-labels-1024.png)　[1440px](screens/menu-conversation-5-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#5「チームプランの契約更新について」。
- 現在付いているものは。チェックの付いた候補は見えない。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。

### 077　menu-conversation-5-thread-status

運営担当者が#5「チームプランの契約更新について」の対応状態を変更するために開く。

[375px](screens/menu-conversation-5-thread-status-375.png)　[1024px](screens/menu-conversation-5-thread-status-1024.png)　[1440px](screens/menu-conversation-5-thread-status-1440.png)

**問いと画像からの答え**

- 現在の状態は。未対応。
- 終えられるか。完了にする。
- ほかの扱いは。迷惑メールにする。

**観察**

- 起点の状態バッジが青枠。
- メニュー内にも「現在の状態」と同じ印が並ぶ。
- 375でメニューは受信文の上、1024・1440では会話の属性直下。

### 078　menu-conversation-6-operation-articles-articles.suggest

運営担当者が#6「購入手続き後に届いたメールのご確認」から記事候補を残すために開く。

[375px](screens/menu-conversation-6-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-conversation-6-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-conversation-6-operation-articles-articles.suggest-1440.png)

**問いと画像からの答え**

- どの会話からか。#6「購入手続き後に届いたメールのご確認」。
- 何を書くか。記事にする内容。
- 何が作られるか。記事の候補。

**観察**

- 「記事候補を書く」のすぐそばに元の番号・件名。
- 入力欄に青い輪郭、この時点の欄は空。
- 375は関連情報のみ、1024は背後を暗くした右パネル、1440は会話横で入力する。

### 079　menu-conversation-6-operation-issues-issues.preview

運営担当者が#6「購入手続き後に届いたメールのご確認」を元に外部へ起票する内容を準備するために開く。

[375px](screens/menu-conversation-6-operation-issues-issues.preview-375.png)　[1024px](screens/menu-conversation-6-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-conversation-6-operation-issues-issues.preview-1440.png)

**問いと画像からの答え**

- 元は何か。#6「購入手続き後に届いたメールのご確認」。
- 投稿先は。example/helpdesk。
- 公開するものは。タイトルと要約。

**観察**

- 元の問い合わせの番号と件名が入力欄より先。
- 見出しは「公開する要約」、次は「起票内容を確認」。
- 375は関連情報だけ、1024の右パネルでは背後が暗く、1440では会話と同時に見える。

### 080　menu-conversation-6-reply-templates

運営担当者が#6「購入手続き後に届いたメールのご確認」の返信のたたき台を選ぶために開く。

[375px](screens/menu-conversation-6-reply-templates-375.png)　[1024px](screens/menu-conversation-6-reply-templates-1024.png)　[1440px](screens/menu-conversation-6-reply-templates-1440.png)

**問いと画像からの答え**

- 選択中の定型文は。お問い合わせの受付。
- 宛名と製品は。佐々木 葵、Slide。
- 次は何か。定型文から下書きを作成。

**観察**

- ラジオの印が候補名の横。
- 本文例はHelloから始まり商品名で結ぶ。
- 375では返信欄の下側に重なり、3幅とも作成ボタンと起点の「定型文を選ぶ」が見える。

### 081　menu-conversation-6-thread-actions

運営担当者が#6「購入手続き後に届いたメールのご確認」の副次的な処理を選ぶために開く。

[375px](screens/menu-conversation-6-thread-actions-375.png)　[1024px](screens/menu-conversation-6-thread-actions-1024.png)　[1440px](screens/menu-conversation-6-thread-actions-1440.png)

**問いと画像からの答え**

- どの会話か。#6「購入手続き後に届いたメールのご確認」。
- 可能な処理は。スヌーズ・迷惑メールにする。
- 後で対応する入口は。スヌーズ。

**観察**

- 上部の「その他の操作」から下に展開。
- スヌーズの左に展開記号があり項目にも青枠。
- 375では件名の中央にかかり、広い2幅ではツールバーの右寄りに収まる。

### 082　menu-conversation-6-thread-assignee

運営担当者が#6「購入手続き後に届いたメールのご確認」の現在の担当を確認し割り当てるために開く。

[375px](screens/menu-conversation-6-thread-assignee-375.png)　[1024px](screens/menu-conversation-6-thread-assignee-1024.png)　[1440px](screens/menu-conversation-6-thread-assignee-1440.png)

**問いと画像からの答え**

- 現在誰の担当か。担当なし。
- 候補は。佐藤 優・森 直子。
- 担当を外せるか。「担当なし」が選択肢にある。

**観察**

- 実名と色付き頭文字を併記。
- チェックが現在値、最初の「担当なし」に青いフォーカス。
- 375では件名の下に折り返した属性に隣接し、1024・1440では横1列の属性の下に開く。

### 083　menu-conversation-6-thread-labels

運営担当者が#6「購入手続き後に届いたメールのご確認」に合うラベルを探すために開く。

[375px](screens/menu-conversation-6-thread-labels-375.png)　[1024px](screens/menu-conversation-6-thread-labels-1024.png)　[1440px](screens/menu-conversation-6-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#6「購入手続き後に届いたメールのご確認」。
- 現在付いているものは。チェックの付いた候補は見えない。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。

### 084　menu-conversation-6-thread-status

運営担当者が#6「購入手続き後に届いたメールのご確認」の対応状態を変更するために開く。

[375px](screens/menu-conversation-6-thread-status-375.png)　[1024px](screens/menu-conversation-6-thread-status-1024.png)　[1440px](screens/menu-conversation-6-thread-status-1440.png)

**問いと画像からの答え**

- 現在の状態は。未対応。
- 終えられるか。完了にする。
- ほかの扱いは。迷惑メールにする。

**観察**

- 起点の状態バッジが青枠。
- メニュー内にも「現在の状態」と同じ印が並ぶ。
- 375でメニューは受信文の上、1024・1440では会話の属性直下。

### 085　menu-conversation-7-operation-articles-articles.suggest

運営担当者が#7「添付した利用明細について」から記事候補を残すために開く。

[375px](screens/menu-conversation-7-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-conversation-7-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-conversation-7-operation-articles-articles.suggest-1440.png)

**問いと画像からの答え**

- どの会話からか。#7「添付した利用明細について」。
- 何を書くか。記事にする内容。
- 何が作られるか。記事の候補。

**観察**

- 「記事候補を書く」のすぐそばに元の番号・件名。
- 入力欄に青い輪郭、この時点の欄は空。
- 375は関連情報のみ、1024は背後を暗くした右パネル、1440は会話横で入力する。

### 086　menu-conversation-7-operation-issues-issues.impact

運営担当者が#7「添付した利用明細について」に関係する修正前後の件数を比較するために開く。

[375px](screens/menu-conversation-7-operation-issues-issues.impact-375.png)　[1024px](screens/menu-conversation-7-operation-issues-issues.impact-1024.png)　[1440px](screens/menu-conversation-7-operation-issues-issues.impact-1440.png)

**問いと画像からの答え**

- どの課題か。#42。
- 期間は。30日間。
- 次の操作は。修正前後の件数を比較。

**観察**

- 課題の選択欄が青く縁取られる。
- #42の番号は残るが選択欄で長い表示の末尾が切れる。
- 375では関連情報の全幅、1024では右の引き出し、1440では常設の右欄に比較操作がある。

### 087　menu-conversation-7-operation-issues-issues.preview

運営担当者が#7「添付した利用明細について」を元に外部へ起票する内容を準備するために開く。

[375px](screens/menu-conversation-7-operation-issues-issues.preview-375.png)　[1024px](screens/menu-conversation-7-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-conversation-7-operation-issues-issues.preview-1440.png)

**問いと画像からの答え**

- 元は何か。#7「添付した利用明細について」。
- 投稿先は。example/helpdesk。
- 公開するものは。タイトルと要約。

**観察**

- 元の問い合わせの番号と件名が入力欄より先。
- 見出しは「公開する要約」、次は「起票内容を確認」。
- 375は関連情報だけ、1024の右パネルでは背後が暗く、1440では会話と同時に見える。

### 088　menu-conversation-7-reply-templates

運営担当者が#7「添付した利用明細について」の返信のたたき台を選ぶために開く。

[375px](screens/menu-conversation-7-reply-templates-375.png)　[1024px](screens/menu-conversation-7-reply-templates-1024.png)　[1440px](screens/menu-conversation-7-reply-templates-1440.png)

**問いと画像からの答え**

- 選択中の定型文は。お問い合わせの受付。
- 宛名と製品は。森 海斗、Slide。
- 次は何か。定型文から下書きを作成。

**観察**

- ラジオの印が候補名の横。
- 本文例はHelloから始まり商品名で結ぶ。
- 375では返信欄の下側に重なり、3幅とも作成ボタンと起点の「定型文を選ぶ」が見える。

### 089　menu-conversation-7-thread-actions

運営担当者が#7「添付した利用明細について」の副次的な処理を選ぶために開く。

[375px](screens/menu-conversation-7-thread-actions-375.png)　[1024px](screens/menu-conversation-7-thread-actions-1024.png)　[1440px](screens/menu-conversation-7-thread-actions-1440.png)

**問いと画像からの答え**

- どの会話か。#7「添付した利用明細について」。
- 可能な処理は。スヌーズ・迷惑メールにする。
- 後で対応する入口は。スヌーズ。

**観察**

- 上部の「その他の操作」から下に展開。
- スヌーズの左に展開記号があり項目にも青枠。
- 375では件名の中央にかかり、広い2幅ではツールバーの右寄りに収まる。

### 090　menu-conversation-7-thread-assignee

運営担当者が#7「添付した利用明細について」の現在の担当を確認し割り当てるために開く。

[375px](screens/menu-conversation-7-thread-assignee-375.png)　[1024px](screens/menu-conversation-7-thread-assignee-1024.png)　[1440px](screens/menu-conversation-7-thread-assignee-1440.png)

**問いと画像からの答え**

- 現在誰の担当か。担当なし。
- 候補は。佐藤 優・森 直子。
- 担当を外せるか。「担当なし」が選択肢にある。

**観察**

- 実名と色付き頭文字を併記。
- チェックが現在値、最初の「担当なし」に青いフォーカス。
- 375では件名の下に折り返した属性に隣接し、1024・1440では横1列の属性の下に開く。

### 091　menu-conversation-7-thread-labels

運営担当者が#7「添付した利用明細について」に合うラベルを探すために開く。

[375px](screens/menu-conversation-7-thread-labels-375.png)　[1024px](screens/menu-conversation-7-thread-labels-1024.png)　[1440px](screens/menu-conversation-7-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#7「添付した利用明細について」。
- 現在付いているものは。チェックの付いた候補は見えない。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。

### 092　menu-conversation-7-thread-status

運営担当者が#7「添付した利用明細について」の対応状態を変更するために開く。

[375px](screens/menu-conversation-7-thread-status-375.png)　[1024px](screens/menu-conversation-7-thread-status-1024.png)　[1440px](screens/menu-conversation-7-thread-status-1440.png)

**問いと画像からの答え**

- 現在の状態は。未対応。
- 終えられるか。完了にする。
- ほかの扱いは。迷惑メールにする。

**観察**

- 起点の状態バッジが青枠。
- メニュー内にも「現在の状態」と同じ印が並ぶ。
- 375でメニューは受信文の上、1024・1440では会話の属性直下。

### 093　menu-extensions-issues-link-1-thread-actions

運営担当者が#1「領収書の宛名を変更できますか」の副次的な処理を選ぶために開く。

[375px](screens/menu-extensions-issues-link-1-thread-actions-375.png)　[1024px](screens/menu-extensions-issues-link-1-thread-actions-1024.png)　[1440px](screens/menu-extensions-issues-link-1-thread-actions-1440.png)

**問いと画像からの答え**

- どの会話か。#1「領収書の宛名を変更できますか」。
- 可能な処理は。スヌーズ・迷惑メールにする。
- 後で対応する入口は。スヌーズ。

**観察**

- 上部の「その他の操作」から下に展開。
- スヌーズの左に展開記号があり項目にも青枠。
- 375では件名の中央にかかり、広い2幅ではツールバーの右寄りに収まる。
- 1440では右側に「題で探す」と既存課題の選択があり、1024・375の会話側には表示されない。

### 094　menu-extensions-issues-link-1-thread-assignee

運営担当者が#1「領収書の宛名を変更できますか」の現在の担当を確認し割り当てるために開く。

[375px](screens/menu-extensions-issues-link-1-thread-assignee-375.png)　[1024px](screens/menu-extensions-issues-link-1-thread-assignee-1024.png)　[1440px](screens/menu-extensions-issues-link-1-thread-assignee-1440.png)

**問いと画像からの答え**

- 現在誰の担当か。担当なし。
- 候補は。佐藤 優・森 直子。
- 担当を外せるか。「担当なし」が選択肢にある。

**観察**

- 実名と色付き頭文字を併記。
- チェックが現在値、最初の「担当なし」に青いフォーカス。
- 375では件名の下に折り返した属性に隣接し、1024・1440では横1列の属性の下に開く。
- 1440では右側に「題で探す」と既存課題の選択があり、1024・375の会話側には表示されない。

### 095　menu-extensions-issues-link-1-thread-labels

運営担当者が#1「領収書の宛名を変更できますか」に合うラベルを探すために開く。

[375px](screens/menu-extensions-issues-link-1-thread-labels-375.png)　[1024px](screens/menu-extensions-issues-link-1-thread-labels-1024.png)　[1440px](screens/menu-extensions-issues-link-1-thread-labels-1440.png)

**問いと画像からの答え**

- 何に付けるか。#1「領収書の宛名を変更できますか」。
- 現在付いているものは。経理・請求・領収書。
- 一覧になければ。新しいラベルを作成。

**観察**

- 先頭の再発行に青枠。
- ラベルに小さい色の点、社内確認と長期契約の更新手続きについては近い緑。
- 375でも長い候補と最下部の管理操作は収まり、広い2幅では会話見出し下で開く。
- 1440では右側に「題で探す」と既存課題の選択があり、1024・375の会話側には表示されない。

### 096　menu-extensions-issues-link-1-thread-status

運営担当者が#1「領収書の宛名を変更できますか」の対応状態を変更するために開く。

[375px](screens/menu-extensions-issues-link-1-thread-status-375.png)　[1024px](screens/menu-extensions-issues-link-1-thread-status-1024.png)　[1440px](screens/menu-extensions-issues-link-1-thread-status-1440.png)

**問いと画像からの答え**

- 現在の状態は。未対応。
- 終えられるか。完了にする。
- ほかの扱いは。迷惑メールにする。

**観察**

- 起点の状態バッジが青枠。
- メニュー内にも「現在の状態」と同じ印が並ぶ。
- 375でメニューは受信文の上、1024・1440では会話の属性直下。
- 1440では右側に「題で探す」と既存課題の選択があり、1024・375の会話側には表示されない。

### 097　menu-home-inbox-filters

運営担当者が未対応の一覧の抽出条件を見直すために開く。

[375px](screens/menu-home-inbox-filters-375.png)　[1024px](screens/menu-home-inbox-filters-1024.png)　[1440px](screens/menu-home-inbox-filters-1440.png)

**問いと画像からの答え**

- どの一覧か。未対応。
- 該当は何件か。7件。
- 適用中の条件は。状態は未対応、商品・担当はすべて、すべてのラベル。

**観察**

- 375では見出し下の「絞り込み」に接して開く。
- 1024では左に細いナビ、1440では左に項目名と件数のナビが残る。
- メニューの最初の状態欄に青いフォーカス。

### 098　menu-label-fd3f5651-inbox-filters

運営担当者が請求を付けた案件の抽出条件を見直すために開く。

[375px](screens/menu-label-fd3f5651-inbox-filters-375.png)　[1024px](screens/menu-label-fd3f5651-inbox-filters-1024.png)　[1440px](screens/menu-label-fd3f5651-inbox-filters-1440.png)

**問いと画像からの答え**

- どの一覧か。未対応。
- 該当は何件か。2件。
- 適用中の条件は。ラベルは請求。

**観察**

- 375では見出し下の「絞り込み」に接して開く。
- 1024では左に細いナビ、1440では左に項目名と件数のナビが残る。
- メニューの最初の状態欄に青いフォーカス。

### 099　menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters

運営担当者がDeskの自分の担当の抽出条件を見直すために開く。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-inbox-filters-1440.png)

**問いと画像からの答え**

- どの一覧か。自分の担当。
- 該当は何件か。1件。
- 適用中の条件は。Deskと佐藤 優。

**観察**

- 375では見出し下の「絞り込み」に接して開く。
- 1024では左に細いナビ、1440では左に項目名と件数のナビが残る。
- メニューの最初の状態欄に青いフォーカス。

### 100　menu-query-999c3485-inbox-filters

運営担当者が検索で見つからなかった案件の抽出条件を見直すために開く。

[375px](screens/menu-query-999c3485-inbox-filters-375.png)　[1024px](screens/menu-query-999c3485-inbox-filters-1024.png)　[1440px](screens/menu-query-999c3485-inbox-filters-1440.png)

**問いと画像からの答え**

- どの一覧か。検索結果。
- 該当は何件か。0件。
- 適用中の条件は。状態・商品・担当はいずれもすべて、検索語は未回答の調査番号。

**観察**

- 375では見出し下の「絞り込み」に接して開く。
- 1024では左に細いナビ、1440では左に項目名と件数のナビが残る。
- メニューの最初の状態欄に青いフォーカス。

### 101　menu-status-spam-48e45b08-inbox-filters

運営担当者が迷惑メールの抽出条件を見直すために開く。

[375px](screens/menu-status-spam-48e45b08-inbox-filters-375.png)　[1024px](screens/menu-status-spam-48e45b08-inbox-filters-1024.png)　[1440px](screens/menu-status-spam-48e45b08-inbox-filters-1440.png)

**問いと画像からの答え**

- どの一覧か。迷惑メール。
- 該当は何件か。1件。
- 適用中の条件は。状態は迷惑メール、商品と担当はすべて。

**観察**

- 375では見出し下の「絞り込み」に接して開く。
- 1024では左に細いナビ、1440では左に項目名と件数のナビが残る。
- メニューの最初の状態欄に青いフォーカス。

### 102　menu-view-feedback-834dd78f-inbox-filters

運営担当者がフィードバックの抽出条件を見直すために開く。

[375px](screens/menu-view-feedback-834dd78f-inbox-filters-375.png)　[1024px](screens/menu-view-feedback-834dd78f-inbox-filters-1024.png)　[1440px](screens/menu-view-feedback-834dd78f-inbox-filters-1440.png)

**問いと画像からの答え**

- どの一覧か。フィードバック。
- 該当は何件か。1件。
- 適用中の条件は。状態・プロダクト・ラベルの3項目。

**観察**

- 375では見出し下の「絞り込み」に接して開く。
- 1024では左に細いナビ、1440では左に項目名と件数のナビが残る。
- メニューの最初の状態欄に青いフォーカス、他の受信箱にある担当者欄は表示されない。

### 103　my-inbox

運営担当者が自分が割り当てられた案件を処理するために開く。

[375px](screens/my-inbox-375.png)　[1024px](screens/my-inbox-1024.png)　[1440px](screens/my-inbox-1440.png)

**問いと画像からの答え**

- 誰の担当か。佐藤 優。
- 何件か。3件。
- どれが未達か。#4。

**観察**

- 「佐藤 優」「すべての状態」の解除チップ。
- 3行とも佐の丸印。
- 375では時間と担当が行中央寄り、1024・1440は右側に揃う。

### 104　route-voices-conversations

運営担当者が集計に含まれた会話とフィードバックを特定するために開く。

[375px](screens/route-voices-conversations-375.png)　[1024px](screens/route-voices-conversations-1024.png)　[1440px](screens/route-voices-conversations-1440.png)

**問いと画像からの答え**

- どの範囲か。すべてのプロダクト・全期間。
- 何件か。10件。
- 元の集計に戻れるか。声の集計に戻る。

**観察**

- 1440では件名・製品・日付・種類が列になる。
- 長い#11だけ件名が2行。
- 375では製品マークと日付が件名の下に移り、右に問い合わせなどの種類が残る。

### 105　suggest-composer

運営担当者が返信に添えられる関連記事を選ぶために開く。

[375px](screens/suggest-composer-375.png)　[1024px](screens/suggest-composer-1024.png)　[1440px](screens/suggest-composer-1440.png)

**問いと画像からの答え**

- 探し方は。記事の題名で検索。
- 候補は。領収書を発行する。
- どこに使うか。返信欄の「記事を添える」。

**観察**

- 候補一覧には項目が1つ。
- 検索欄は空で青い枠。
- 375では返信欄の上に大きく重なり、広い2幅では入力欄の左下に小さく開く。

### 106　suggest-composer-empty

運営担当者が返信に合う記事がまだないときの次の手を決めるために開く。

[375px](screens/suggest-composer-empty-375.png)　[1024px](screens/suggest-composer-empty-1024.png)　[1440px](screens/suggest-composer-empty-1440.png)

**問いと画像からの答え**

- どの案件か。招待メールの再送。
- 候補はあるか。合う記事候補はまだない。
- 次は何か。記事の候補に追加。

**観察**

- 3幅とも空の理由と次の操作が返信欄に隣接。
- 直前の送信済み返信も見える。
- 375は宛先が2行、広い2幅は1行。

### 107　thread-approval

運営担当者がエージェントの返信案を確認して承認するために開く。

[375px](screens/thread-approval-375.png)　[1024px](screens/thread-approval-1024.png)　[1440px](screens/thread-approval-1440.png)

**問いと画像からの答え**

- 作成者は。エージェント 下書き担当、佐藤 優の代理。
- 配送状態は。承認待ち。
- 判断の選択肢は。承認して送信・下書きを破棄。

**観察**

- 橙の砂時計と承認待ちの文字。
- 返信本文を専用枠に載せる。
- 375でも黒い承認ボタンと破棄が見え、その下に空の通常返信欄を別に置く。

### 108　thread-attachment

運営担当者が相手が送った明細の添付を特定するために開く。

[375px](screens/thread-attachment-375.png)　[1024px](screens/thread-attachment-1024.png)　[1440px](screens/thread-attachment-1440.png)

**問いと画像からの答え**

- 誰からか。森 海斗。
- どの書類か。利用明細.txt。
- サイズは。43 B。

**観察**

- 本文の下にファイルアイコンと青いリンク。
- サイズはファイル名の右。
- 375でも返信欄の上に添付行が見え、広い2幅では受信枠内に余白がある。

### 109　thread-context

運営担当者が会話に関連する課題や過去のやり取りを調べるために開く。

[375px](screens/thread-context-375.png)　[1024px](screens/thread-context-1024.png)　[1440px](screens/thread-context-1440.png)

**問いと画像からの答え**

- 何の課題か。領収書の宛名を変更できるようにする、#43。
- ほかの会話は。課題に関連して#6、同じ相手のほかの問い合わせはなし。
- 次は何か。比較期間を選ぶ／課題を起票。

**観察**

- 375は関連情報で全幅を占める。
- 1024は背景を暗くした右パネルで閉じるがある。
- 1440は本文横の常設欄、操作履歴は折りたたまれている。

### 110　thread-failed

運営担当者が不達の返信を特定し再送を判断するために開く。

[375px](screens/thread-failed-375.png)　[1024px](screens/thread-failed-1024.png)　[1440px](screens/thread-failed-1440.png)

**問いと画像からの答え**

- 誰の返信か。佐藤 優。
- なぜ届かなかったか。宛先メールサーバーが受信を拒否。
- 再送の入口は。広い2幅に再送、375の表示内では発見できない。

**観察**

- 1024・1440で赤い送信失敗と本文、拒否理由、再送をまとめている。
- 375には相手の文しか見えず下に空の返信欄。
- ヘッダーは一般的な「未対応」で配送失敗を読み取れない。

### 111　thread-html

運営担当者が注文情報を含むHTMLメールの内容を読むために開く。

[375px](screens/thread-html-375.png)　[1024px](screens/thread-html-1024.png)　[1440px](screens/thread-html-1440.png)

**問いと画像からの答え**

- 案件は。購入手続き後に届いたメール。
- 何を確かめたいか。購入プランと領収書の内容。
- 注文番号は。広い2幅にSL-2026-128、375の表示内では見えない。

**観察**

- 受信本文中に定型の購入お礼。
- 注文番号は本文中の太字。
- 375では本文の後半に返信欄が重なり、3幅とも外部画像表示のリンクは画像内にない。外部画像が含まれるかは不明。

### 112　thread-inbound

運営担当者が新しい問い合わせの内容と回答先を読むために開く。

[375px](screens/thread-inbound-375.png)　[1024px](screens/thread-inbound-1024.png)　[1440px](screens/thread-inbound-1440.png)

**問いと画像からの答え**

- 誰からか。山田 花。
- 希望は。領収書の宛名を会社名に変えて再発行。
- どこへ返信するか。customer1@example.net。

**観察**

- 白い受信枠に名前・アドレス・時間。
- 本文が2段落。
- 375は最終段落に返信欄がかかり、広い2幅では「注文履歴の画面から変更できますか？」まで読める。

### 113　thread-note

運営担当者が請求書の変更依頼とチーム内の引き継ぎを確認するために開く。

[375px](screens/thread-note-375.png)　[1024px](screens/thread-note-1024.png)　[1440px](screens/thread-note-1440.png)

**問いと画像からの答え**

- 相手の依頼は。請求書の送付先変更。
- 内部では何をするか。次回請求日の前日までに手続きを案内。
- 相手に届くか。広い2幅のメモに相手には送られません。

**観察**

- 1024・1440では佐藤 優の黄色いメモと受信本文を連続して表示。
- 375では受信文のすぐ下に空の返信欄。
- 375の表示域にメモの有無や内容は現れない。

### 114　thread-replied

運営担当者が先に送った回答を読んで二重返信を避けるために開く。

[375px](screens/thread-replied-375.png)　[1024px](screens/thread-replied-1024.png)　[1440px](screens/thread-replied-1440.png)

**問いと画像からの答え**

- 現在は。返信待ち。
- 何を伝えたか。招待メールを再送し受信箱の確認を依頼。
- 誰がいつ答えたか。広い2幅で佐藤 優・1時間前。

**観察**

- 広い2幅では受信文の下に送信済みの薄灰色カード。
- 見出し付近に返信待ちと担当名。
- 375では空の返信欄が手前にあり送信した文と時刻は見当たらない。
