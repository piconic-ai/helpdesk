# 公開ヘルプ・記事・関連する運営画面の独立レビュー

公開ヘルプ、埋め込みチャット、記事作成、課題、集計、メニューなど、指定された public 内の110状態を対象とした。各状態を375・1024・1440pxで横に並べて視認し、全330枚の縮小一覧で配置を比較した。判断基準は同梱の [デザイン指針](../../../../DESIGN.md) と [点検基準](../../../plan/review-loop.md#基準)。状態名は画像ファイルと対応しており、利用者向けの画面名ではない。

**高1件・中8件・低3件、計12件。** 同じ改善で直る幅・状態の違いは重複計上していない。高は統合前の本人照合に関する表示上のリスク。

## 改善点

### 1. 会話の統合時に相手を照合できない（高）

**見えたこと**　会話番号と件名の組は読めるが、最終確認に統合元・先の相手や統合後の返信先が出ない。375pxでは背面の引出しにも相手が見えない。別の静止画の同番号・同件名では #1 は山田花、#2 は佐々木葵。別撮影なので、異なる連絡先の統合が通るという実動作は未確認。

**あるべき姿**　統合元・先に氏名・連絡先を表示し、統合後どの相手とやり取りするかを実際の仕様に合わせて示す。

**比較画像**　loop-merge-confirm [375px](screens/loop-merge-confirm-375.png)・[1024px](screens/loop-merge-confirm-1024.png)・[1440px](screens/loop-merge-confirm-1440.png)、behavior-confirmed-notice [375px](screens/behavior-confirmed-notice-375.png)・[1024px](screens/behavior-confirmed-notice-1024.png)・[1440px](screens/behavior-confirmed-notice-1440.png)、loop-history [375px](screens/loop-history-375.png)・[1024px](screens/loop-history-1024.png)・[1440px](screens/loop-history-1440.png)

### 2. 未対応一覧で長い差出人と件名の優先度が逆転する（中）

**見えたこと**　375pxの先頭行は長い所属・氏名が2行を占め、業務の判断に必要な件名が「部門ごとに宛名の異なる領収書をま…」で切れる。短い行との高さの差も大きい。1024pxでも長い氏名の右に件名の断片だけが残る。

**あるべき姿**　差出人・件名に独立した表示領域を与え、製品・件名・待ち時間を短い行と同じ視線で追えるようにする。

**比較画像**　behavior-sort-menu [375px](screens/behavior-sort-menu-375.png)・[1024px](screens/behavior-sort-menu-1024.png)・[1440px](screens/behavior-sort-menu-1440.png)、menu-home-bulk-assignee [375px](screens/menu-home-bulk-assignee-375.png)・[1024px](screens/menu-home-bulk-assignee-1024.png)・[1440px](screens/menu-home-bulk-assignee-1440.png)、loop-navigation [375px](screens/loop-navigation-375.png)・[1024px](screens/loop-navigation-1024.png)・[1440px](screens/loop-navigation-1440.png)

### 3. 内部メモ保存の通知が次の入力欄に重なる（中）

**見えたこと**　3幅とも保存通知が返信欄の内側に浮かぶ。375pxでは固定の返信欄が元の会話本文を途中で覆い、保存したメモも同時に確認できない。

**あるべき姿**　保存結果を知らせる位置と入力面を分け、狭い画面でも記録への入口と次の入力内容を読み取れるようにする。

**比較画像**　behavior-confirmed-notice [375px](screens/behavior-confirmed-notice-375.png)・[1024px](screens/behavior-confirmed-notice-1024.png)・[1440px](screens/behavior-confirmed-notice-1440.png)、loop-feedback-undo [375px](screens/loop-feedback-undo-375.png)・[1024px](screens/loop-feedback-undo-1024.png)・[1440px](screens/loop-feedback-undo-1440.png)

### 4. 記事公開の確認で製品を照合しにくい（中）

**見えたこと**　最終確認は「契約を更新する」を「公開ヘルプ」に掲載するとのみ示す。背面のフォームはDeskだが、同じ記事作成画面でDeskとSlideを切り替えられる。

**あるべき姿**　最終確認の本文に公開先の製品名と記事名を並べる。

**比較画像**　loop-publish [375px](screens/loop-publish-375.png)・[1024px](screens/loop-publish-1024.png)・[1440px](screens/loop-publish-1440.png)、menu-articles-new-choice-menu-0 [375px](screens/menu-articles-new-choice-menu-0-375.png)・[1024px](screens/menu-articles-new-choice-menu-0-1024.png)・[1440px](screens/menu-articles-new-choice-menu-0-1440.png)

### 5. 送信前の記事提案に「解決して終える」という選択肢が見えない（中）

**見えたこと**　「この記事で解決しませんか」と尋ねて別タブの記事を示すが、戻った読者に示すのは入力の修正と問い合わせ送信だけ。チャットの同じ判断には「解決した」がある。

**あるべき姿**　記事で解決した読者が問い合わせを送らず意図的に終了できる操作と、送信がまだ行われていないことを明示する。

**比較画像**　suggest-form [375px](screens/suggest-form-375.png)・[1024px](screens/suggest-form-1024.png)・[1440px](screens/suggest-form-1440.png)、chat-articles [375px](screens/chat-articles-375.png)・[1024px](screens/chat-articles-1024.png)・[1440px](screens/chat-articles-1440.png)

### 6. 埋め込みヘルプの末尾で三つの異なる行き先が密集する（中）

**見えたこと**　375pxでは「ヘルプ記事の一覧」「返信不要のご意見」「問い合わせフォーム」が狭い間隔で横一列。文中リンクと同じ青い下線が連続し、返事が欲しいときの入口と意見送付が紛れやすい。ヒット領域の実寸は画像から判定していない。

**あるべき姿**　用途の異なる窓口は狭い幅で一行ずつにするか、余白を取った選択行にする。

**比較画像**　widget-open [375px](screens/widget-open-375.png)・[1024px](screens/widget-open-1024.png)・[1440px](screens/widget-open-1440.png)、widget-handoff [375px](screens/widget-handoff-375.png)・[1024px](screens/widget-handoff-1024.png)・[1440px](screens/widget-handoff-1440.png)、widget-receipt [375px](screens/widget-receipt-375.png)・[1024px](screens/widget-receipt-1024.png)・[1440px](screens/widget-receipt-1440.png)、widget-suggestions [375px](screens/widget-suggestions-375.png)・[1024px](screens/widget-suggestions-1024.png)・[1440px](screens/widget-suggestions-1440.png)

### 7. 起票元の未選択状態を選択済みとして表示する（中）

**見えたこと**　候補先頭の「会話を選ぶ」にチェックが付き、未選択の操作指示が実際の会話と同じ選択肢に見える。

**あるべき姿**　未選択時には案内を入力欄に残し、チェックは実際に選んだ会話に使う。

**比較画像**　menu-issues-new-choice-menu-0 [375px](screens/menu-issues-new-choice-menu-0-375.png)・[1024px](screens/menu-issues-new-choice-menu-0-1024.png)・[1440px](screens/menu-issues-new-choice-menu-0-1440.png)

### 8. チャット設定で対象製品の編集項目にたどり着きにくい（中）

**見えたこと**　375pxでSlideの返信目安や埋め込み先を編集する画像は、上半分を受付開始前のDeskカードが占め、編集欄は画面の下端以降。横長でも複数製品のフォームを縦に積む。

**あるべき姿**　製品と現在値を一覧で選べるようにし、展開した項目とその入力・保存を近くに出す。

**比較画像**　widget-edit-response [375px](screens/widget-edit-response-375.png)・[1024px](screens/widget-edit-response-1024.png)・[1440px](screens/widget-edit-response-1440.png)、widget-edit-sites [375px](screens/widget-edit-sites-375.png)・[1024px](screens/widget-edit-sites-1024.png)・[1440px](screens/widget-edit-sites-1440.png)

### 9. 記事一覧の「標準の順序」から並びの基準が分からない（中）

**見えたこと**　記事と候補のメニューに「標準の順序」「名前順」が並ぶ。標準が更新日・作成日・優先度のどれかを選択前に判断できない。

**あるべき姿**　既定順が使う実際のキーと方向を表示する。

**比較画像**　menu-articles-candidates-choice-menu-0 [375px](screens/menu-articles-candidates-choice-menu-0-375.png)・[1024px](screens/menu-articles-candidates-choice-menu-0-1024.png)・[1440px](screens/menu-articles-candidates-choice-menu-0-1440.png)、menu-articles-choice-menu-0 [375px](screens/menu-articles-choice-menu-0-375.png)・[1024px](screens/menu-articles-choice-menu-0-1024.png)・[1440px](screens/menu-articles-choice-menu-0-1440.png)

### 10. 統合確認だけ広い画面でもボタンが枠幅いっぱい（低）

**見えたこと**　1024・1440pxでも確定とキャンセルが確認枠いっぱいの二段。他の確認は文言幅で隣接する。

**あるべき姿**　広い幅では確認操作を文言幅にそろえ、入力元と統合先の照合を視覚的に優先する。

**比較画像**　loop-merge-confirm [375px](screens/loop-merge-confirm-375.png)・[1024px](screens/loop-merge-confirm-1024.png)・[1440px](screens/loop-merge-confirm-1440.png)、loop-link-confirm [375px](screens/loop-link-confirm-375.png)・[1024px](screens/loop-link-confirm-1024.png)・[1440px](screens/loop-link-confirm-1440.png)

### 11. 公開記事一覧で記事名がリンクとして見えにくい（低）

**見えたこと**　記事名は黒い太字と罫線だけで、同じ画面の窓口リンクは青い下線。1件だけの場合は見出しにも見える。

**あるべき姿**　記事に進むことを色・下線または行末の案内で示す。

**比較画像**　article-index [375px](screens/article-index-375.png)・[1024px](screens/article-index-1024.png)・[1440px](screens/article-index-1440.png)、public-query [375px](screens/public-query-375.png)・[1024px](screens/public-query-1024.png)・[1440px](screens/public-query-1440.png)

### 12. 0件の結果にも並べ替えを提示する（低）

**見えたこと**　該当する会話がない画面で「待たせている順」「新しい順」を選べる。結果を得るための「絞り込みを解除」と競合する。

**あるべき姿**　0件では条件の見直しを目立たせる。並び順を保持する場合も、その目的が伝わる扱いにする。

**比較画像**　menu-query-999c3485-choice-menu-3 [375px](screens/menu-query-999c3485-choice-menu-3-375.png)・[1024px](screens/menu-query-999c3485-choice-menu-3-1024.png)・[1440px](screens/menu-query-999c3485-choice-menu-3-1440.png)

## 画面を横断して確認したこと

公開記事は製品マーク・本文・問い合わせを細い一列に収めている。公開検索が0件でも製品別のヘルプ記事一覧と、人に問い合わせる窓口を選べる。埋め込みチャットは375pxで全面、1024・1440pxでは請求画面の右下に開く。記事表示・引継ぎ・受付画面も同じ位置関係を保つ。

運営画面の編集フォームは見出しと本文の左端をそろえ、横長でも入力欄の幅を抑えている。課題一覧は優先する通知待ちを先頭に置き、詳細で対象者別の状態と修正前後の数を見る。連絡先の削除確認には相手・件数・対象範囲が入り、会話統合確認との違いが目立つ。

## 静止画で確認できないこと

フォーカス枠・選択印・送信失敗後の入力値・完了通知は写った状態を確認した。キーやタッチによる移動、実際のフォーカス順・復帰先、Escape・外側クリック、タップ領域、スクロール可能範囲、反応時間、アニメーション中のレイアウト移動、読み上げ、記事リンクの到達先、キャンセル時の保持、通知が消えるまでの時間、再送の重複、承認後の外部配信、統合後の返信先、保存データの整合性は操作・ログを要する。別々の画像の受付番号や件数の差は、幅の違いによる不整合とは判定していない。

## 状態別の記録

各項目に利用者と目的、判断に使う三つの問い、見た目の三つの点検、元画像を記載した。

### 1. article

利用者が領収書の発行手順を読む。

- **何を発行できる？**　支払いごとの領収書。

- **どこから始める？**　設定の購入履歴。

- **解決できないときは？**　末尾のお問い合わせ。

**点検**　記事名が先頭。手順が番号付き。375では文が自然に折れ、横長では本文が中央の一列。

[375px](screens/article-375.png)・[1024px](screens/article-1024.png)・[1440px](screens/article-1440.png)

### 2. article-candidates

編集者が会話から挙がった記事候補を選ぶ。

- **何件ある？**　1件。

- **どの製品か？**　Slide。

- **根拠を見たいときは？**　元の会話 #1 を選ぶ。

**点検**　件数は見出し直下。執筆と原文参照は別操作。375では操作が候補名の下。

[375px](screens/article-candidates-375.png)・[1024px](screens/article-candidates-1024.png)・[1440px](screens/article-candidates-1440.png)

### 3. article-edit

編集者が公開記事の内容を更新する。

- **何の記事か？**　領収書を発行する。

- **要約は必要か？**　任意で200文字まで。

- **何を確かめられる？**　公開記事を読むかプレビューに進める。

**点検**　公開中の記事への入口が上。題名・要約・本文が一列。375の初画面には本文途中まで。

[375px](screens/article-edit-375.png)・[1024px](screens/article-edit-1024.png)・[1440px](screens/article-edit-1440.png)

### 4. article-index

Slide利用者が記事一覧から答えを探す。

- **何件読める？**　1件。

- **何で探す？**　「記事を検索」の欄。

- **直接相談するには？**　一覧下のお問い合わせ。

**点検**　件数が表題直下。検索欄の下に記事名。3幅で同じ読む順。

[375px](screens/article-index-375.png)・[1024px](screens/article-index-1024.png)・[1440px](screens/article-index-1440.png)

### 5. article-new

編集者が新しい記事を書く。

- **掲載先は？**　Desk。

- **何を書く？**　題名・要約・本文。

- **途中で終えるには？**　下書きを保存。

**点検**　製品を本文より先に表示。任意要約に説明。375では主要操作が初画面より下。

[375px](screens/article-new-375.png)・[1024px](screens/article-new-1024.png)・[1440px](screens/article-new-1440.png)

### 6. article-preview

編集者が公開前の記事を読み返す。

- **何を確認中？**　記事のプレビュー。

- **何が整形される？**　発行の手順が番号付きで表示される。

- **直すには？**　直下の記事の内容へ進む。

**点検**　プレビュー見出しが先頭。描画後の本文と編集欄を枠で分離。375も両者を縦に配置。

[375px](screens/article-preview-375.png)・[1024px](screens/article-preview-1024.png)・[1440px](screens/article-preview-1440.png)

### 7. article-vote

記事の読者が評価の受付を確かめる。

- **受理された？**　評価を受け付けたと表示。

- **元記事は？**　領収書を発行する。

- **相談できる？**　メールへのリンクがある。

**点検**　お礼と緑の受付文。記事名がリンク。3幅とも一列で読み切れる。

[375px](screens/article-vote-375.png)・[1024px](screens/article-vote-1024.png)・[1440px](screens/article-vote-1440.png)

### 8. behavior-confirmed-notice

担当者が内部メモの保存結果を確認する。

- **何が済んだ？**　内部メモの保存。

- **相手に送られた？**　広い幅の記録に「相手には送られません」。

- **次の入力先は？**　返信が選択された入力欄。

**点検**　緑の保存通知と黄色のメモ。返信と内部メモを文字で区別。375では通知が入力欄に重なり保存した本文は見えない。

[375px](screens/behavior-confirmed-notice-375.png)・[1024px](screens/behavior-confirmed-notice-1024.png)・[1440px](screens/behavior-confirmed-notice-1440.png)

### 9. behavior-issue-demo

運営者がデモの課題から知らせるべき相手を見つける。

- **優先作業は？**　知らせる待ち1件。

- **残り何件？**　2件の声のうち1件に未通知。

- **何をする？**　下書きを作る。

**点検**　通知待ちを最上段。未解決と修正済みを見出しで分離。375では表が項目名付きの縦の一覧。

[375px](screens/behavior-issue-demo-375.png)・[1024px](screens/behavior-issue-demo-1024.png)・[1440px](screens/behavior-issue-demo-1440.png)

### 10. behavior-issue-demo-all-sent

担当者が修正を全員に知らせた課題を点検する。

- **どの課題か？**　請求明細のダウンロードを改善する。

- **誰まで届いた？**　#4・#8 の両方に「知らせた」。

- **効果は？**　修正前後の件数と母数を参照。

**点検**　通知結果を対象者別に表示。前後比較に対象期間を併記。375でも前後2列。

[375px](screens/behavior-issue-demo-all-sent-375.png)・[1024px](screens/behavior-issue-demo-all-sent-1024.png)・[1440px](screens/behavior-issue-demo-all-sent-1440.png)

### 11. behavior-issue-demo-open

担当者が進行中の模擬課題の声を読む。

- **どの課題？**　領収書の一括ダウンロード。

- **対象は？**　紐づく声3件。

- **試せる操作は？**　課題を閉じる（デモ用）。

**点検**　状態が製品名の隣。会話番号と通知状態が行の両端。375では長い件名・氏名が複数行。

[375px](screens/behavior-issue-demo-open-375.png)・[1024px](screens/behavior-issue-demo-open-1024.png)・[1440px](screens/behavior-issue-demo-open-1440.png)

### 12. behavior-reply-controls-open

担当者が添付付き問い合わせに返信を準備する。

- **相手からの資料は？**　利用明細.txt。

- **使える候補は？**　該当記事はまだ無く、この件名を記事候補にできる。

- **送信先は？**　欄の下に宛先アドレス。

**点検**　添付名・サイズ併記。返信・内部メモを切替表示。375では展開した記事操作と送信先が同じ画面内。

[375px](screens/behavior-reply-controls-open-375.png)・[1024px](screens/behavior-reply-controls-open-1024.png)・[1440px](screens/behavior-reply-controls-open-1440.png)

### 13. behavior-sort-menu

担当者が未対応一覧の優先順位を変える。

- **今の順は？**　待たせている順。

- **他の順は？**　新しい順。

- **最長の待ちは？**　先頭行の11時間待ち。

**点検**　選択中にチェック。ボタン直下のメニュー。375では長い差出人と件名が複数行で競合。

[375px](screens/behavior-sort-menu-375.png)・[1024px](screens/behavior-sort-menu-1024.png)・[1440px](screens/behavior-sort-menu-1440.png)

### 14. candidate-editor

編集者が候補の元会話を参考に執筆する。

- **何が発端？**　領収書の宛名を変更したいという相談。

- **原文は？**　元の会話 #1 を開く。

- **編集先は？**　Slideの記事。

**点検**　元の会話を先に表示。編集領域を別の枠で区切る。375では原文と題名を一緒に読める。

[375px](screens/candidate-editor-375.png)・[1024px](screens/candidate-editor-1024.png)・[1440px](screens/candidate-editor-1440.png)

### 15. chat-articles

利用者が質問に合う記事を選ぶ。

- **元の質問は？**　領収書の発行場所。

- **どの記事か？**　領収書を発行する。

- **役に立たないときは？**　「解決しなかった」かメール窓口。

**点検**　質問を右寄せで再掲。記事直下に解決の二択。3幅とも小窓の幅を抑えている。

[375px](screens/chat-articles-375.png)・[1024px](screens/chat-articles-1024.png)・[1440px](screens/chat-articles-1440.png)

### 16. chat-input

利用者がSlideのヘルプに質問する。

- **誰が探す？**　関連するヘルプ記事を自動で探す。

- **人が読むのはいつ？**　問い合わせとして送った後。

- **どこから始める？**　質問欄と「質問する」。

**点検**　製品名を最上段。送信操作が黒。全幅で入力を一列に配置。

[375px](screens/chat-input-375.png)・[1024px](screens/chat-input-1024.png)・[1440px](screens/chat-input-1440.png)

### 17. chat-receipt

利用者がチャットから問い合わせが届いたことを確かめる。

- **受付番号は？**　#12。

- **返信先は？**　reader@example.net。

- **何を聞いた？**　契約名義を変更できるか。

**点検**　受付と返信先を先に提示。元質問・検索結果を下に残す。3幅とも短い一列。

[375px](screens/chat-receipt-375.png)・[1024px](screens/chat-receipt-1024.png)・[1440px](screens/chat-receipt-1440.png)

### 18. console-404

運営者が見つからない会話から復帰する。

- **何が起きた？**　対象が見つからない。

- **どこで探す？**　受信箱。

- **どう移る？**　「受信箱に戻る」。

**点検**　異常を表題で明示。説明と操作は隣接。幅によってナビが変わっても復帰先は同じ位置。

[375px](screens/console-404-375.png)・[1024px](screens/console-404-1024.png)・[1440px](screens/console-404-1440.png)

### 19. deletion

管理者が連絡先データを削除する対象を選ぶ。

- **範囲は？**　会話・メール原文・添付ファイル。

- **誰のデータか？**　削除する相手を候補から選ぶ。

- **次は即削除か？**　「削除内容を確認」に進む。

**点検**　対象選択が中心。影響範囲を選択の前に提示。フォームは横長でも短い一列。

[375px](screens/deletion-375.png)・[1024px](screens/deletion-1024.png)・[1440px](screens/deletion-1440.png)

### 20. feedback-input

利用者が返信を求めず意見を送る。

- **何を書く？**　意見・要望。

- **連絡先は必須？**　メール欄は任意。

- **回答は来る？**　個別の返信はないと冒頭にある。

**点検**　方針の説明を入力より先に表示。本文欄を最も広く確保。3幅で入力・送信の縦順が同じ。

[375px](screens/feedback-input-375.png)・[1024px](screens/feedback-input-1024.png)・[1440px](screens/feedback-input-1440.png)

### 21. feedback-list

担当者が届いたフィードバックを読む。

- **何件ある？**　1件。

- **どの内容？**　運営画面をキーボードで使う要望。

- **どう処理する？**　確認済みにする。

**点検**　状態が文字付き。行に処理操作を併設。375ではボタンが行の末尾に回る。

[375px](screens/feedback-list-375.png)・[1024px](screens/feedback-list-1024.png)・[1440px](screens/feedback-list-1440.png)

### 22. feedback-receipt

利用者が意見の受付を確かめる。

- **受理された？**　緑の通知に受付番号。

- **連絡先は？**　登録なし。

- **返信を待つ？**　返信はないと明記。

**点検**　受付通知が先頭。連絡先と返答方針が別行。幅ごとに番号が違うため、同一送信の比較はできない。

[375px](screens/feedback-receipt-375.png)・[1024px](screens/feedback-receipt-1024.png)・[1440px](screens/feedback-receipt-1440.png)

### 23. forget

管理者が特定の連絡先の全削除を最終確認する。

- **対象者は？**　氏名とメールが確認枠内にある。

- **何が消える？**　会話1件、メール原文、添付。

- **止められる？**　キャンセルがある。

**点検**　不可逆性を本文で説明。削除ボタンは赤枠。375でも対象情報と両操作が収まる。

[375px](screens/forget-375.png)・[1024px](screens/forget-1024.png)・[1440px](screens/forget-1440.png)

### 24. help-home

利用者が製品から適切な窓口を選ぶ。

- **どの製品？**　Slide。

- **自分で調べるには？**　記事検索かヘルプ記事。

- **人から返事が欲しい場合は？**　お問い合わせ。

**点検**　製品単位の枠。選択肢に用途の説明。375では名前と説明を上下に表示。

[375px](screens/help-home-375.png)・[1024px](screens/help-home-1024.png)・[1440px](screens/help-home-1440.png)

### 25. help-results

利用者が横断検索の結果を確かめる。

- **何で探した？**　領収書。

- **何がある？**　Slideの領収書記事1件。

- **ほかの手段は？**　下の製品別窓口。

**点検**　検索語を解除できる表示。結果名と製品が隣接。375でも窓口まで見える。

[375px](screens/help-results-375.png)・[1024px](screens/help-results-1024.png)・[1440px](screens/help-results-1440.png)

### 26. invalid

管理者が窓口アドレスの入力間違いを直す。

- **どこが問題？**　窓口アドレスの先頭。

- **直し方は？**　空白と@を除き、@より前を入力する。

- **他の入力は？**　製品名Slideと送信ドメインが残る。

**点検**　エラーが該当欄直下。赤枠と青いフォーカスを併記。375で修正案が折り返されても読める。

[375px](screens/invalid-375.png)・[1024px](screens/invalid-1024.png)・[1440px](screens/invalid-1440.png)

### 27. issue-detail

担当者が修正済み課題の通知状況を見る。

- **何を直した？**　領収書の宛名変更。

- **通知が残るのは？**　#1 は承認待ち、#6 は知らせた。

- **詳細を開くには？**　GitHubで開く。

**点検**　各行末に状態。比較値に件数と母数。375でも修正前後が横並び。

[375px](screens/issue-detail-375.png)・[1024px](screens/issue-detail-1024.png)・[1440px](screens/issue-detail-1440.png)

### 28. issue-new

担当者が相談をもとに課題を起票する。

- **何が必要？**　元の会話、タイトル、公開する要約。

- **個人情報は？**　含めないよう記載。

- **投稿前に見られる？**　起票内容を確認。

**点検**　対象→内容→確認の順。公開範囲が欄名に入る。3幅ともフォームに横長の余白を作らない。

[375px](screens/issue-new-375.png)・[1024px](screens/issue-new-1024.png)・[1440px](screens/issue-new-1440.png)

### 29. issue-preview

担当者が外部に起票する内容を照合する。

- **どこに出す？**　example/helpdesk。

- **元の情報は？**　掲載する会話 #1 のリンクが見える。

- **どう直す？**　入力内容を修正する。

**点検**　タイトルと本文を確認枠に集約。投稿操作が黒。375でも行の切れなく投稿先が読める。

[375px](screens/issue-preview-375.png)・[1024px](screens/issue-preview-1024.png)・[1440px](screens/issue-preview-1440.png)

### 30. issue-setup

担当者がGitHub連携を使えない理由を調べる。

- **どの製品？**　Desk。

- **何が必要？**　リポジトリ設定。

- **次にどこへ？**　GitHub Issueの設定。

**点検**　未設定の理由と入口を同じ枠に配置。他の会話情報と分離。375は関連情報単独、1024は引出し、1440は右列。

[375px](screens/issue-setup-375.png)・[1024px](screens/issue-setup-1024.png)・[1440px](screens/issue-setup-1440.png)

### 31. issues-board

担当者が修正済み課題の連絡を優先する。

- **まず何をする？**　未通知の下書きを作る。

- **何人分？**　2件の声のうち1件が未通知。

- **次に見るものは？**　開いている課題と直した課題。

**点検**　通知待ちが最上部。黒い主操作は下書き作成。375では各表の数に意味を示すラベルが付く。

[375px](screens/issues-board-375.png)・[1024px](screens/issues-board-1024.png)・[1440px](screens/issues-board-1440.png)

### 32. link-issue

担当者が既存のGitHub課題と会話を結ぶ。

- **現在は何件？**　関連付けた課題0件。

- **どう選ぶ？**　題で探す欄と候補リスト。

- **何を結ぶ？**　#42 領収書の一括ダウンロードを選択中。

**点検**　検索と選択を同じ枠に配置。検索欄のフォーカスが見える。375と1024は引出し、1440は固定の右列。

[375px](screens/link-issue-375.png)・[1024px](screens/link-issue-1024.png)・[1440px](screens/link-issue-1440.png)

### 33. loop-canned-edit

管理者が保存済み定型返信を更新する。

- **対象は？**　お問い合わせの受付。

- **差し替わる部分は？**　名前と製品の置換記号に説明が付く。

- **どの操作？**　変更を保存するか取り消す。

**点検**　編集箇所に薄い地色。新規定型文と分離。375では既存の編集部分が先に収まる。

[375px](screens/loop-canned-edit-375.png)・[1024px](screens/loop-canned-edit-1024.png)・[1440px](screens/loop-canned-edit-1440.png)

### 34. loop-chat-failed

利用者が質問送信の失敗からやり直す。

- **送れた？**　送信できなかったと赤い通知。

- **文は残る？**　領収書を発行したいという文が残る。

- **どうやり直す？**　接続を確認して質問をもう一度送る。

**点検**　入力は上・エラーは画面下。通知に閉じる操作。375では復旧文を折り返して全文表示。

[375px](screens/loop-chat-failed-375.png)・[1024px](screens/loop-chat-failed-1024.png)・[1440px](screens/loop-chat-failed-1440.png)

### 35. loop-chat-solved

利用者が記事で解決した結果を確かめる。

- **何を記録した？**　記事で解決したこと。

- **何の記事？**　領収書を発行する。

- **別件を聞ける？**　質問欄がある。

**点検**　元質問を再掲。評価の位置に完了文。3幅で記事と結果が近接。

[375px](screens/loop-chat-solved-375.png)・[1024px](screens/loop-chat-solved-1024.png)・[1440px](screens/loop-chat-solved-1440.png)

### 36. loop-convert

担当者がフィードバックを返信できる会話に変える。

- **どれを変える？**　フィードバック #10 と件名。

- **何が変わる？**　返信できる問い合わせになる。

- **取りやめるには？**　キャンセル。

**点検**　対象と効果が確認枠内。確定に動詞を使用。375でも二つの操作が並ぶ。

[375px](screens/loop-convert-375.png)・[1024px](screens/loop-convert-1024.png)・[1440px](screens/loop-convert-1440.png)

### 37. loop-dates

運営者が対応指標の対象日を指定する。

- **期間は？**　11月1日から18日。

- **何時基準？**　開始・終了の各欄に日本時間。

- **どこを編集している？**　開始日の年部分。

**点検**　起点に開いた状態の枠。日付の意味は欄ごとに表示。375で期間条件と集計説明の一部に選択枠が重なる。

[375px](screens/loop-dates-375.png)・[1024px](screens/loop-dates-1024.png)・[1440px](screens/loop-dates-1440.png)

### 38. loop-disable

管理者が振り分けを停止する前に影響を確かめる。

- **何を停止する？**　振り分けルール。

- **設定は失われる？**　保持される。

- **再開できる？**　再有効化まで新規処理が停止。

**点検**　現在有効のスイッチが背面。停止とキャンセルを明記。375では操作ボタンを縦に配置。

[375px](screens/loop-disable-375.png)・[1024px](screens/loop-disable-1024.png)・[1440px](screens/loop-disable-1440.png)

### 39. loop-discard

担当者がエージェントの下書き破棄を判断する。

- **どれを消す？**　会話 #5 の下書き1件。

- **文面は？**　破棄対象の本文を短く再掲。

- **止められる？**　キャンセル。

**点検**　確定のみ赤枠。本文と対象数を一緒に表示。375でも両操作が一画面。

[375px](screens/loop-discard-375.png)・[1024px](screens/loop-discard-1024.png)・[1440px](screens/loop-discard-1440.png)

### 40. loop-enable

管理者が公開問い合わせフォームを有効にする。

- **影響範囲は？**　全プロダクト。

- **すぐ受け付ける？**　受付はプロダクトごとに開始。

- **必要な権限は？**　追加の権限なしと説明。

**点検**　影響が本文にまとまる。有効化が黒い主操作。375では長い操作名も一行。

[375px](screens/loop-enable-375.png)・[1024px](screens/loop-enable-1024.png)・[1440px](screens/loop-enable-1440.png)

### 41. loop-feedback-undo

担当者がフィードバックの確認結果を戻す。

- **何が済んだ？**　#10 を確認済みにした。

- **どこに表れた？**　対象行の状態が確認済み。

- **誤操作の復帰は？**　通知内の元に戻す。

**点検**　行の状態と下の通知が対応。対象番号を併記。375では行にも未確認に戻す操作。

[375px](screens/loop-feedback-undo-375.png)・[1024px](screens/loop-feedback-undo-1024.png)・[1440px](screens/loop-feedback-undo-1440.png)

### 42. loop-help-no-results

利用者が記事検索0件から次の手を選ぶ。

- **条件は？**　未掲載の振込口座。

- **見つかった？**　記事0件。

- **どう続ける？**　条件を外すかSlideのお問い合わせへ。

**点検**　空状態に虫眼鏡と説明。検索語が残る。375でも選べる窓口が下に見える。

[375px](screens/loop-help-no-results-375.png)・[1024px](screens/loop-help-no-results-1024.png)・[1440px](screens/loop-help-no-results-1440.png)

### 43. loop-history

担当者が会話の操作履歴を確認する。

- **対象は？**　#2 ワークスペースの招待メールについて。

- **誰が受信した？**　システム。

- **いつか？**　2時間前。

**点検**　履歴見出しを展開。出来事と実行主体が一行。幅によって引出しと右列が切り替わる。

[375px](screens/loop-history-375.png)・[1024px](screens/loop-history-1024.png)・[1440px](screens/loop-history-1440.png)

### 44. loop-link-confirm

担当者が外部課題へのコメント投稿を承認する。

- **投稿先は？**　example/helpdesk の #42。

- **何をコメントする？**　会話へのリンク。

- **止めるには？**　キャンセル。

**点検**　対象の課題名を枠内に表示。会話番号とリンク先を併記。375でも投稿前の情報を枠内で読める。

[375px](screens/loop-link-confirm-375.png)・[1024px](screens/loop-link-confirm-1024.png)・[1440px](screens/loop-link-confirm-1440.png)

### 45. loop-merge-confirm

担当者が二つの会話を統合してよいか判断する。

- **統合元は？**　#1 領収書の宛名を変更できますか。

- **統合先は？**　#2 ワークスペースの招待メールについて。

- **相手は一致する？**　確認枠の中では照合できない。

**点検**　両件名に番号。相手と統合後の返信先を省略。広い幅でも操作が枠幅いっぱい。

[375px](screens/loop-merge-confirm-375.png)・[1024px](screens/loop-merge-confirm-1024.png)・[1440px](screens/loop-merge-confirm-1440.png)

### 46. loop-metric-definition

運営者が「声が改善に届いた割合」の意味を読む。

- **何の値？**　修正後の知らせが届いた声の割合。

- **分母は？**　説明枠に問い合わせとフィードバックを含む旨。

- **どこを見れば？**　該当カードの情報アイコン。

**点検**　選んだアイコンにフォーカス。黒地で定義を区別。375では説明が次のカードに重なるが全文が見える。

[375px](screens/loop-metric-definition-375.png)・[1024px](screens/loop-metric-definition-1024.png)・[1440px](screens/loop-metric-definition-1440.png)

### 47. loop-navigation

担当者が別の受信箱や集計画面を探す。

- **今の一覧は？**　未対応7件。

- **どこへ行ける？**　返信待ち・自分の担当・課題・集計など。

- **メニューを閉じるには？**　375の引出し右上に×。

**点検**　現在の項目を薄い背景で表示。受信箱と拡張に分類。1024はアイコン中心、1440は名称を併記。

[375px](screens/loop-navigation-375.png)・[1024px](screens/loop-navigation-1024.png)・[1440px](screens/loop-navigation-1440.png)

### 48. loop-public-retry

利用者が送信を確認できなかった問い合わせを再試行する。

- **受付は確定？**　確認できなかったと表示。

- **何が残った？**　件名・内容・連絡先。

- **次は？**　時間をおいて再度送信。

**点検**　赤い結果通知。入力欄は通常の並びを維持。375では再送操作と通知が同一画面。

[375px](screens/loop-public-retry-375.png)・[1024px](screens/loop-public-retry-1024.png)・[1440px](screens/loop-public-retry-1440.png)

### 49. loop-publish

編集者が公開前に掲載内容と掲載先を確認する。

- **記事は？**　契約を更新する。

- **公開する場所は？**　枠内には「公開ヘルプ」のみ。

- **取りやめられる？**　キャンセル。

**点検**　公開前の枠が中央。対象製品Deskは背面だけ。3幅とも確認文に製品名がない。

[375px](screens/loop-publish-375.png)・[1024px](screens/loop-publish-1024.png)・[1440px](screens/loop-publish-1440.png)

### 50. loop-revoke

管理者がAPIトークンの失効を決める。

- **対象は？**　運営用CLI。

- **影響は？**　使用中のCLIやMCPクライアントが接続不可。

- **中止するには？**　キャンセル。

**点検**　対象名が文中にある。赤い確定操作。375でも影響を読んでから選べる。

[375px](screens/loop-revoke-375.png)・[1024px](screens/loop-revoke-1024.png)・[1440px](screens/loop-revoke-1440.png)

### 51. menu-articles-candidates-choice-menu-0

編集者が記事候補を並べ替える。

- **対象は？**　記事の候補1件。

- **今の順は？**　標準の順序だが基準は読めない。

- **他の順は？**　名前順。

**点検**　選択にチェック。題とメニューを近接。375では候補行にメニューが重なる。

[375px](screens/menu-articles-candidates-choice-menu-0-375.png)・[1024px](screens/menu-articles-candidates-choice-menu-0-1024.png)・[1440px](screens/menu-articles-candidates-choice-menu-0-1440.png)

### 52. menu-articles-choice-menu-0

編集者が公開記事などを並べ替える。

- **どの一覧？**　ヘルプ記事1件。

- **今の順は？**　標準の順序。

- **他に何を選べる？**　名前順。

**点検**　見出しは件数付き。選択済みの表示は明確。375では執筆と条件群が縦に並ぶ。

[375px](screens/menu-articles-choice-menu-0-375.png)・[1024px](screens/menu-articles-choice-menu-0-1024.png)・[1440px](screens/menu-articles-choice-menu-0-1440.png)

### 53. menu-articles-new-choice-menu-0

編集者が新規記事の製品を選ぶ。

- **どこを編集中？**　記事の内容のプロダクト。

- **選択中は？**　Desk。

- **変更先は？**　Slide。

**点検**　マークと名前を併記。現在値にチェック。3幅とも製品ボタン直下に開く。

[375px](screens/menu-articles-new-choice-menu-0-375.png)・[1024px](screens/menu-articles-new-choice-menu-0-1024.png)・[1440px](screens/menu-articles-new-choice-menu-0-1440.png)

### 54. menu-articles-questions-choice-menu-0

編集者が記事を提示できなかった質問を製品別に調べる。

- **どの製品が対象？**　すべてのプロダクト。

- **候補は？**　DeskとSlide。

- **質問はある？**　0件。

**点検**　見出しと件数を併記。製品マークあり。375では条件メニューが空状態の説明の一部に重なる。

[375px](screens/menu-articles-questions-choice-menu-0-375.png)・[1024px](screens/menu-articles-questions-choice-menu-0-1024.png)・[1440px](screens/menu-articles-questions-choice-menu-0-1440.png)

### 55. menu-dev-ui-choice-menu-0

開発者が一覧の並べ替え部品を比較する。

- **どの見本？**　受信箱一覧。

- **今の順は？**　新着順。

- **別の順は？**　古い順。

**点検**　選択をチェックで表示。項目と起点が隣接。375でも項目が枠内。

[375px](screens/menu-dev-ui-choice-menu-0-375.png)・[1024px](screens/menu-dev-ui-choice-menu-0-1024.png)・[1440px](screens/menu-dev-ui-choice-menu-0-1440.png)

### 56. menu-dev-ui-sample-assignee

開発者が担当選択部品の見え方を確かめる。

- **現担当は？**　佐藤優。

- **他の候補は？**　森直子。

- **外すには？**　未割り当て。

**点検**　人のマークと名前を併記。現在値にチェック。375では下側、横長ではボタン上側に展開。

[375px](screens/menu-dev-ui-sample-assignee-375.png)・[1024px](screens/menu-dev-ui-sample-assignee-1024.png)・[1440px](screens/menu-dev-ui-sample-assignee-1440.png)

### 57. menu-dev-ui-sample-menu

開発者が詳細画面の副操作を確認する。

- **入口は？**　その他の操作。

- **何がある？**　削除する。

- **現在の項目は？**　削除するに青枠。

**点検**　主操作から分離。実行内容は動詞。3幅とも起点すぐ下に短いメニュー。

[375px](screens/menu-dev-ui-sample-menu-375.png)・[1024px](screens/menu-dev-ui-sample-menu-1024.png)・[1440px](screens/menu-dev-ui-sample-menu-1440.png)

### 58. menu-home-bulk-assignee

担当者が複数の未対応会話に担当を割り当てる。

- **何件が対象？**　7件を選択中。

- **誰に渡せる？**　佐藤優または森直子。

- **外すには？**　選択数の隣に選択を解除。

**点検**　選択行全体が薄青。人数ではなく対象件数を表示。375では一括操作が数行に回る。

[375px](screens/menu-home-bulk-assignee-375.png)・[1024px](screens/menu-home-bulk-assignee-1024.png)・[1440px](screens/menu-home-bulk-assignee-1440.png)

### 59. menu-home-choice-menu-0

担当者が受信箱の状態を絞る。

- **現在は？**　未対応。

- **他の状態は？**　返信待ち・完了・迷惑メール。

- **制限を外すには？**　すべて。

**点検**　状態に名前と記号。選択中にチェック。375でも項目が全部見える。

[375px](screens/menu-home-choice-menu-0-375.png)・[1024px](screens/menu-home-choice-menu-0-1024.png)・[1440px](screens/menu-home-choice-menu-0-1440.png)

### 60. menu-home-choice-menu-1

担当者が未対応一覧の製品を絞る。

- **現在の範囲は？**　すべて。

- **製品候補は？**　DeskとSlide。

- **他の条件は？**　状態は未対応。

**点検**　親枠に条件名。製品マークと名前を併記。375でも候補がボタン下に出る。

[375px](screens/menu-home-choice-menu-1-375.png)・[1024px](screens/menu-home-choice-menu-1-1024.png)・[1440px](screens/menu-home-choice-menu-1-1440.png)

### 61. menu-home-choice-menu-2

担当者が未対応一覧のラベルを選ぶ。

- **今の条件は？**　すべてのラベル。

- **候補をどう識別する？**　名称と色点。

- **ラベル自体を変えるには？**　ラベルを管理。

**点検**　長い名称も一行。現在値にチェック。375では上向きに開き他の条件を覆う。

[375px](screens/menu-home-choice-menu-2-375.png)・[1024px](screens/menu-home-choice-menu-2-1024.png)・[1440px](screens/menu-home-choice-menu-2-1440.png)

### 62. menu-home-choice-menu-3

担当者が未対応一覧の並べ替え候補を確認する。

- **対象は？**　未対応7件。

- **現在の順は？**　待たせている順。

- **切替先は？**　新しい順。

**点検**　起点に青枠。現在値に印。375でも二択が枠内。

[375px](screens/menu-home-choice-menu-3-375.png)・[1024px](screens/menu-home-choice-menu-3-1024.png)・[1440px](screens/menu-home-choice-menu-3-1440.png)

### 63. menu-home-filter-assignee

担当者が未対応一覧を人で絞る。

- **選択中は？**　すべて。

- **誰を選べる？**　佐藤優と森直子。

- **何に作用する？**　未対応の一覧。

**点検**　担当者ラベルの下に配置。人名とアバターを併記。375で親枠内のほかの条件と区別できる。

[375px](screens/menu-home-filter-assignee-375.png)・[1024px](screens/menu-home-filter-assignee-1024.png)・[1440px](screens/menu-home-filter-assignee-1440.png)

### 64. menu-issues-new-choice-menu-0

担当者が課題の元になる会話を探す。

- **どう検索する？**　候補を絞り込む欄。

- **何で区別する？**　番号、製品名、件名。

- **既に選択済み？**　「会話を選ぶ」にチェックが付いていて紛らわしい。

**点検**　検索欄に青枠。会話は見出しと件名の二段。375では6件程度見え、広い幅でも候補の下端に続きがある。

[375px](screens/menu-issues-new-choice-menu-0-375.png)・[1024px](screens/menu-issues-new-choice-menu-0-1024.png)・[1440px](screens/menu-issues-new-choice-menu-0-1440.png)

### 65. menu-metrics-choice-menu-0

運営者が過去30日の集計を製品別に見る。

- **対象期間は？**　過去30日。

- **対象製品は？**　すべてのプロダクト。

- **選択肢は？**　DeskとSlide。

**点検**　条件が集計の上。現在値に印。375は一列のカードの前に条件。

[375px](screens/menu-metrics-choice-menu-0-375.png)・[1024px](screens/menu-metrics-choice-menu-0-1024.png)・[1440px](screens/menu-metrics-choice-menu-0-1440.png)

### 66. menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0

運営者が日付指定のまま集計対象の製品を選ぶ。

- **今の製品は？**　すべてのプロダクト。

- **期間は？**　日付指定の期間条件が表示されている。

- **選べる製品は？**　DeskとSlide。

**点検**　製品マークと名前。日付条件を別項目として保持。375では開いたメニューが期間表示の一部を覆う。

[375px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0-375.png)・[1024px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0-1024.png)・[1440px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0-1440.png)

### 67. menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates

運営者が集計期間の両端を確かめる。

- **どこを変える？**　日付の範囲。

- **いつからいつまで？**　2026年11月1日から18日。

- **基準時は？**　日本時間。

**点検**　開始・終了を明記。開始年が選択中。375でも日付を一行で読める。

[375px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates-375.png)・[1024px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates-1024.png)・[1440px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates-1440.png)

### 68. menu-query-999c3485-choice-menu-0

担当者が会話検索0件の状態条件を変える。

- **何を検索した？**　未回答の調査番号。

- **選択中の状態は？**　すべて。

- **先頭の青枠は選択中？**　未対応はフォーカスで、チェックは「すべて」。

**点検**　選択と焦点に別の印。見出しに0件。375も条件操作を検索欄直下に置く。

[375px](screens/menu-query-999c3485-choice-menu-0-375.png)・[1024px](screens/menu-query-999c3485-choice-menu-0-1024.png)・[1440px](screens/menu-query-999c3485-choice-menu-0-1440.png)

### 69. menu-query-999c3485-choice-menu-1

担当者が空の検索結果で製品条件を調整する。

- **検索結果は？**　0件。

- **現在の範囲は？**　すべて。

- **個別の対象は？**　DeskまたはSlide。

**点検**　検索語は入力欄に残る。親枠に製品名の見出し。375でも候補名は省略されない。

[375px](screens/menu-query-999c3485-choice-menu-1-375.png)・[1024px](screens/menu-query-999c3485-choice-menu-1-1024.png)・[1440px](screens/menu-query-999c3485-choice-menu-1-1440.png)

### 70. menu-query-999c3485-choice-menu-2

担当者が検索条件のラベルを見直す。

- **どの結果？**　未回答の調査番号で0件。

- **絞り込み中か？**　すべてのラベルにチェック。

- **追加できる条件は？**　再発行、経理、請求、領収書など。

**点検**　色点と名称で判別。管理への操作を末尾に分離。375は上向きの長いメニューが条件領域を覆う。

[375px](screens/menu-query-999c3485-choice-menu-2-375.png)・[1024px](screens/menu-query-999c3485-choice-menu-2-1024.png)・[1440px](screens/menu-query-999c3485-choice-menu-2-1440.png)

### 71. menu-query-999c3485-choice-menu-3

担当者が0件の会話検索で並び順を確かめる。

- **検索結果は？**　0件。

- **選択中は？**　待たせている順。

- **続けて探すには？**　絞り込みを解除。

**点検**　空状態の説明あり。並び順は0件でも変更候補を表示。375でも条件解除が見える。

[375px](screens/menu-query-999c3485-choice-menu-3-375.png)・[1024px](screens/menu-query-999c3485-choice-menu-3-1024.png)・[1440px](screens/menu-query-999c3485-choice-menu-3-1440.png)

### 72. menu-query-999c3485-filter-assignee

担当者が検索結果を担当者で絞る。

- **現在の対象者は？**　すべて。

- **誰を選べる？**　佐藤優と森直子。

- **元の依頼は何件？**　検索結果0件。

**点検**　チェックで現在値を表示。本人名と丸印。375では入力とメニューが一列。

[375px](screens/menu-query-999c3485-filter-assignee-375.png)・[1024px](screens/menu-query-999c3485-filter-assignee-1024.png)・[1440px](screens/menu-query-999c3485-filter-assignee-1440.png)

### 73. menu-view-feedback-834dd78f-choice-menu-0

担当者がフィードバックを確認状態別に探す。

- **対象は？**　フィードバック1件。

- **状態は？**　すべて。

- **何で絞れる？**　受付済み・確認済み・迷惑メール。

**点検**　フィードバック専用の用語。選択とフォーカスを別表示。375でも全候補が見える。

[375px](screens/menu-view-feedback-834dd78f-choice-menu-0-375.png)・[1024px](screens/menu-view-feedback-834dd78f-choice-menu-0-1024.png)・[1440px](screens/menu-view-feedback-834dd78f-choice-menu-0-1440.png)

### 74. menu-view-feedback-834dd78f-choice-menu-1

担当者が製品別のフィードバックを探す。

- **対象範囲は？**　すべて。

- **候補は？**　Desk、Slide。

- **結果はどこに出る？**　条件の下のフィードバック一覧。

**点検**　製品名のラベル。マークに文字を併記。375で親枠内に候補が収まる。

[375px](screens/menu-view-feedback-834dd78f-choice-menu-1-375.png)・[1024px](screens/menu-view-feedback-834dd78f-choice-menu-1-1024.png)・[1440px](screens/menu-view-feedback-834dd78f-choice-menu-1-1440.png)

### 75. menu-view-feedback-834dd78f-choice-menu-2

担当者がフィードバックに付いたラベルを選ぶ。

- **現在値は？**　すべてのラベル。

- **長い候補は？**　長期契約の更新手続きについて。

- **整理するには？**　ラベルを管理。

**点検**　色点に名称を併記。管理を末尾に配置。375では上向きのメニューでフィードバック見出し付近まで覆う。

[375px](screens/menu-view-feedback-834dd78f-choice-menu-2-375.png)・[1024px](screens/menu-view-feedback-834dd78f-choice-menu-2-1024.png)・[1440px](screens/menu-view-feedback-834dd78f-choice-menu-2-1440.png)

### 76. menu-view-feedback-834dd78f-choice-menu-3

担当者が届いた意見を確認順に並べる。

- **現在は？**　新しい順。

- **別の優先順は？**　未確認を先に。

- **何件の一覧？**　1件。

**点検**　チェックで現在値。短い二択を起点の下に表示。375では行単位の確認操作が下に残る。

[375px](screens/menu-view-feedback-834dd78f-choice-menu-3-375.png)・[1024px](screens/menu-view-feedback-834dd78f-choice-menu-3-1024.png)・[1440px](screens/menu-view-feedback-834dd78f-choice-menu-3-1440.png)

### 77. menu-voices-choice-menu-0

運営者が声の集計対象を製品で絞る。

- **対象は？**　問い合わせとフィードバック。

- **選択中は？**　すべてのプロダクト。

- **何を選べる？**　DeskまたはSlide。

**点検**　対象に迷惑メールを除く旨。製品・期間・集計を一組に配置。375で日付欄は横並び。

[375px](screens/menu-voices-choice-menu-0-375.png)・[1024px](screens/menu-voices-choice-menu-0-1024.png)・[1440px](screens/menu-voices-choice-menu-0-1440.png)

### 78. metrics-trends

運営者が直近7日の対応傾向を見る。

- **解決まで何分？**　平均53分。

- **一度で解決した割合は？**　50%。

- **作業時間は？**　平均10分。

**点検**　対象期間を上部に表示。前期間との比較と折れ線を値の隣に置く。375では指標ごとに一列。

[375px](screens/metrics-trends-375.png)・[1024px](screens/metrics-trends-1024.png)・[1440px](screens/metrics-trends-1440.png)

### 79. operation-result

担当者が指定期間の集計結果を控える。

- **どの製品？**　Slide。

- **何が分かる？**　解決までの平均4日など。

- **記録が無い指標は？**　データなしと表示。

**点検**　期間を結果見出し直下に表示。値が右端で揃う。375でも項目と値の対を維持。

[375px](screens/operation-result-375.png)・[1024px](screens/operation-result-1024.png)・[1440px](screens/operation-result-1440.png)

### 80. public-404

利用者が公開ページの誤ったリンクから復帰する。

- **何が起きた？**　ページが見つからない。

- **どう直す？**　アドレスを確認。

- **他に探すには？**　ヘルプに戻る。

**点検**　製品名の次にエラー。対処と操作が近い。3幅で文章が途切れない。

[375px](screens/public-404-375.png)・[1024px](screens/public-404-1024.png)・[1440px](screens/public-404-1440.png)

### 81. public-query

利用者がSlide内の記事検索結果を確かめる。

- **どの製品？**　Slide。

- **何が出た？**　領収書を発行する、1件。

- **該当しないときは？**　メールでお問い合わせ。

**点検**　検索語と解除印。記事名と窓口を段で分離。375でも3段の流れ。

[375px](screens/public-query-375.png)・[1024px](screens/public-query-1024.png)・[1440px](screens/public-query-1440.png)

### 82. result

運営者が過去30日の対応成績を把握する。

- **範囲は？**　すべてのプロダクト。

- **解決まで？**　平均4日。

- **平均作業時間は？**　データなし。

**点検**　最初のカードに強い左線。比較不能を文字で表示。375は縦積み、横長は3・2・3のカード群。

[375px](screens/result-375.png)・[1024px](screens/result-1024.png)・[1440px](screens/result-1440.png)

### 83. retention

管理者が完了済み会話の保存期間を設定する。

- **対象は？**　完了した会話。

- **現在の設定は？**　無期限。

- **変更方法は？**　日数を指定し、保存期間を変更。

**点検**　対象と保持する期間を明記。現在値をラジオで表示。幅にかかわらず短い一列。

[375px](screens/retention-375.png)・[1024px](screens/retention-1024.png)・[1440px](screens/retention-1440.png)

### 84. route-dev-ui

開発者がUI部品の見本を参照する。

- **どんな見本？**　一覧・詳細・編集・概要・状態。

- **最初に見えるのは？**　受信箱の一覧。

- **別の種類は？**　上部の目次から選ぶ。

**点検**　見本ごとに区切り。件名・操作・選択を実データ風に配置。375は詳細が初画面の下に続く。

[375px](screens/route-dev-ui-375.png)・[1024px](screens/route-dev-ui-1024.png)・[1440px](screens/route-dev-ui-1440.png)

### 85. route-help

利用者が有効なヘルプ窓口から用途に合うものを選ぶ。

- **製品は？**　Slide。

- **人の返信を求めるには？**　お問い合わせ。

- **返信不要の場合は？**　フィードバック。

**点検**　4窓口に用途を併記。製品内で区切り線。375は名称と説明を2行化。

[375px](screens/route-help-375.png)・[1024px](screens/route-help-1024.png)・[1440px](screens/route-help-1440.png)

### 86. route-help-absent-slide

利用者が存在しないSlideページから別の入口へ戻る。

- **表示は？**　ページが見つかりません。

- **製品は？**　ヘッダーのSlide。

- **復帰先は？**　ヘルプ。

**点検**　表題は短い。確認することを説明。375・1024・1440とも復帰ボタンがすぐ下。

[375px](screens/route-help-absent-slide-375.png)・[1024px](screens/route-help-absent-slide-1024.png)・[1440px](screens/route-help-absent-slide-1440.png)

### 87. route-mail-in-6

受信メール本文の読者が注文番号を確かめる。

- **何の文面？**　購入へのお礼。

- **注文番号は？**　SL-2026-128。

- **この画像に返信操作はある？**　本文だけで、操作は写っていない。

**点検**　2行の本文。番号を一行で表示。3幅とも左上。外側の会話内での表示はこの画像単独では不明。

[375px](screens/route-mail-in-6-375.png)・[1024px](screens/route-mail-in-6-1024.png)・[1440px](screens/route-mail-in-6-1440.png)

### 88. suggest-editor

編集者が回答の無い質問から記事を起こす。

- **製品は？**　Slide。

- **題名は？**　チームの利用履歴を月ごとに集計できるかという質問。

- **何を加える？**　要約と本文。

**点検**　質問を題名欄に引継ぎ。要約は任意。375では長い題名の末尾が入力枠の外。

[375px](screens/suggest-editor-375.png)・[1024px](screens/suggest-editor-1024.png)・[1440px](screens/suggest-editor-1440.png)

### 89. suggest-form

利用者が問い合わせ送信前に案内された記事を読むか決める。

- **候補は？**　領収書を発行する（新しいタブ）。

- **送信前か？**　このまま送る操作が残っている。

- **記事で済んだら？**　解決して終了する操作は表示されない。

**点検**　質問形の見出し。件名・本文・返信先が縦に揃う。3幅とも編集と送信の操作だけが下に残る。

[375px](screens/suggest-form-375.png)・[1024px](screens/suggest-form-1024.png)・[1440px](screens/suggest-form-1440.png)

### 90. suggest-human

利用者が二重請求の疑いを人に相談する。

- **認識された相談は？**　領収書の金額違い。

- **担当者へ進める？**　質問直後に専用ボタン。

- **他の選択は？**　関連する記事と解決したかの二択。

**点検**　人への入口が黒。元質問を維持。375は幅広、広い画面のボタンはラベル幅。

[375px](screens/suggest-human-375.png)・[1024px](screens/suggest-human-1024.png)・[1440px](screens/suggest-human-1440.png)

### 91. suggest-library

編集者が公開記事の提示・閲覧・解決率を見て見直す。

- **どの記事か？**　領収書を発行する。

- **成績は？**　提示4回、閲覧1回、解決率0%。

- **見直すべきか？**　見直し候補と表示。

**点検**　状態と日付が同じ行群。記事の操作が上。375は成績を折り返しつつ一つの行内に置く。

[375px](screens/suggest-library-375.png)・[1024px](screens/suggest-library-1024.png)・[1440px](screens/suggest-library-1440.png)

### 92. suggest-metric

運営者が記事で解決できた割合を確認する。

- **何の指標？**　待たずに解決できた割合。

- **結果は？**　25%。

- **内訳は？**　1件／4件。

**点検**　母数を値の直下に表示。声が改善に届いた割合と別カード。375は対象カードまでスクロールした位置。

[375px](screens/suggest-metric-375.png)・[1024px](screens/suggest-metric-1024.png)・[1440px](screens/suggest-metric-1440.png)

### 93. suggest-questions

編集者が記事が無かった質問を選んで書く。

- **件数は？**　1件。

- **どんな質問？**　チームの利用履歴を月ごとに集計できるか。

- **次は？**　同じ行の記事を書く。

**点検**　製品名を表示。質問と操作を近接。375でも質問を折り返して全文読める。

[375px](screens/suggest-questions-375.png)・[1024px](screens/suggest-questions-1024.png)・[1440px](screens/suggest-questions-1440.png)

### 94. suggest-questions-empty

編集者が未回答質問の有無を確かめる。

- **件数は？**　0件。

- **意味は？**　記事を提案できなかった質問がまだない。

- **戻るには？**　記事一覧に戻る。

**点検**　空状態に虫眼鏡。製品条件が残る。375でも0件表示と説明が収まる。

[375px](screens/suggest-questions-empty-375.png)・[1024px](screens/suggest-questions-empty-1024.png)・[1440px](screens/suggest-questions-empty-1440.png)

### 95. survey-thanks

利用者がアンケート回答の受付を確認する。

- **どれについて？**　問い合わせ #8。

- **回答は届いた？**　記録したと表示。

- **追加作業はある？**　画面に追加の依頼はない。

**点検**　お礼の次に対象番号。緑の完了文。3幅とも短い読み切り画面。

[375px](screens/survey-thanks-375.png)・[1024px](screens/survey-thanks-1024.png)・[1440px](screens/survey-thanks-1440.png)

### 96. voices

運営者が届いた声の内訳を確認する。

- **何件の声？**　迷惑メールを除く10件。

- **どのラベルが多い？**　ラベルなし7件。

- **該当会話を読むには？**　該当する声を見る。

**点検**　対象範囲の説明が表題直下。件数を右に揃える。375はフィルターの下にラベル別を表示。

[375px](screens/voices-375.png)・[1024px](screens/voices-1024.png)・[1440px](screens/voices-1440.png)

### 97. voices-filtered

運営者が集計に含まれた個別の声を読む。

- **対象範囲は？**　Slide・全期間。

- **何件？**　9件。

- **集計へ戻れる？**　声の集計に戻る。

**点検**　番号と件名を先に表示。日付と受付種別を各行に併記。375では日付・製品が件名の下に回る。

[375px](screens/voices-filtered-375.png)・[1024px](screens/voices-filtered-1024.png)・[1440px](screens/voices-filtered-1440.png)

### 98. voices-trends

運営者が期間を指定して声の推移を比べる。

- **期間は？**　10月1日から11月18日。

- **計何件？**　27件。

- **多いラベルは？**　請求が8件。

**点検**　最多の棒が最長。折れ線と合計を各行右に集約。375でも日付2欄と上位の推移が読める。

[375px](screens/voices-trends-375.png)・[1024px](screens/voices-trends-1024.png)・[1440px](screens/voices-trends-1440.png)

### 99. widget-article

請求画面の利用者が埋め込み内で関連記事を読む。

- **何の記事？**　領収書を発行する。

- **手順は？**　購入履歴から対象を選んでダウンロード。

- **元の質問へ戻るには？**　やりとりに戻る。

**点検**　本文は番号付き。新しいタブも選べる。375は全画面、広い幅は右下の小窓。

[375px](screens/widget-article-375.png)・[1024px](screens/widget-article-1024.png)・[1440px](screens/widget-article-1440.png)

### 100. widget-closed

利用者が請求画面からヘルプを探す。

- **何のページ？**　請求・領収書。

- **何が見える？**　月ごとの支払額とCSV。

- **助けが必要なら？**　右下のヘルプ。

**点検**　表が主内容。入口は黒いラベル付き。3幅とも表とボタンが重ならない。

[375px](screens/widget-closed-375.png)・[1024px](screens/widget-closed-1024.png)・[1440px](screens/widget-closed-1440.png)

### 101. widget-csp

設置担当者が埋め込みに必要なCSPを確認する。

- **どこを変える？**　埋め込み先サイトのContent-Security-Policy。

- **項目は？**　script-src と frame-src。

- **どのオリジン？**　撮影環境のローカルURLが表示。

**点検**　説明は開閉見出し直下。コードと説明を分離。375では長いディレクティブ名が折り返す。

[375px](screens/widget-csp-375.png)・[1024px](screens/widget-csp-1024.png)・[1440px](screens/widget-csp-1440.png)

### 102. widget-edit-response

管理者がSlideチャットの返信目安を設定する。

- **どの窓口？**　受付中のSlide。

- **今の目安は？**　未設定。

- **設定例は？**　2営業日以内。

**点検**　製品別にカード。値と編集を同一まとまりに配置。375では対象の編集欄が初画面より下。

[375px](screens/widget-edit-response-375.png)・[1024px](screens/widget-edit-response-1024.png)・[1440px](screens/widget-edit-response-1440.png)

### 103. widget-edit-sites

管理者がチャットの埋め込みを許すサイトを登録する。

- **対象製品は？**　Slide。

- **登録済みは？**　0件。

- **何を入力する？**　埋め込み先サイトのURL。

**点検**　登録数が編集の前。保存と取り消しを併設。375では受付開始前のDeskが対象のSlideより先に大きく出る。

[375px](screens/widget-edit-sites-375.png)・[1024px](screens/widget-edit-sites-1024.png)・[1440px](screens/widget-edit-sites-1440.png)

### 104. widget-handoff

利用者が記事を読んでも残った質問を担当者に渡す。

- **何が送られる？**　これまでの質問。

- **必要な連絡先は？**　メール、名前は任意。

- **編集に戻れる？**　質問に戻る。

**点検**　元質問と記事を維持。メール欄に青枠。375は全面、広い幅は右下の窓で送信。

[375px](screens/widget-handoff-375.png)・[1024px](screens/widget-handoff-1024.png)・[1440px](screens/widget-handoff-1440.png)

### 105. widget-no-match

利用者が該当記事のない相談を担当者に送る。

- **元の質問は？**　チームの名前を変更したい。

- **検索結果は？**　合う記事なし。

- **次に何を入れる？**　連絡先メールと任意の名前。

**点検**　空結果を文章で説明。直後に人への引継ぎ入力。375でも送信と戻るが並ぶ。

[375px](screens/widget-no-match-375.png)・[1024px](screens/widget-no-match-1024.png)・[1440px](screens/widget-no-match-1440.png)

### 106. widget-open

利用者が請求画面内で自動記事検索を始める。

- **どこのヘルプ？**　Slide。

- **誰が対応する？**　まず自動で記事を探し、問い合わせ後に担当者が読む。

- **入力する場所は？**　青枠の質問欄。

**点検**　質問が唯一の主入力。閉じる操作が右上。375は全面、広い幅は会計画面が背後に見える。

[375px](screens/widget-open-375.png)・[1024px](screens/widget-open-1024.png)・[1440px](screens/widget-open-1440.png)

### 107. widget-options

設置担当者が埋め込みボタンの見え方を変える。

- **位置は？**　右下。

- **ラベルは？**　ヘルプ。

- **ほかに変えられる？**　最初の説明文。

**点検**　設定を一つの開閉領域に集約。見本で確認する操作あり。375でも欄が縦に並ぶ。

[375px](screens/widget-options-375.png)・[1024px](screens/widget-options-1024.png)・[1440px](screens/widget-options-1440.png)

### 108. widget-preview

設置担当者が変更したチャットの見本を確認する。

- **何を見ている？**　埋め込みの見本。

- **見本の初期状態は？**　Slideのヘルプと空の質問欄。

- **閉じるには？**　見本の右上に×。

**点検**　編集画面の内側に見本枠。質問欄に青いフォーカス。375では見本がカード内のほぼ全幅。

[375px](screens/widget-preview-375.png)・[1024px](screens/widget-preview-1024.png)・[1440px](screens/widget-preview-1440.png)

### 109. widget-receipt

利用者が埋め込みからの問い合わせ完了を確かめる。

- **受付番号は？**　幅別画像に #14・#13・#12。

- **返信先は？**　reader@example.com。

- **何を送った？**　領収書を発行したいという質問。

**点検**　受付通知を最上段。元質問と関連記事を残す。375は全面、広い幅は請求画面上の小窓。

[375px](screens/widget-receipt-375.png)・[1024px](screens/widget-receipt-1024.png)・[1440px](screens/widget-receipt-1440.png)

### 110. widget-suggestions

利用者が請求画面で案内された記事を確認する。

- **何を聞いた？**　領収書を発行したい。

- **候補は？**　領収書を発行する。

- **次は？**　解決した・解決しなかったを選べる。

**点検**　元質問と記事を分離。評価二択は記事直下。375のフッターは3リンクが同一行に密集。

[375px](screens/widget-suggestions-375.png)・[1024px](screens/widget-suggestions-1024.png)・[1440px](screens/widget-suggestions-1440.png)
