# 公開ヘルプ・記事・関連する管理画面の独立画像レビュー

対象は指定の109状態327枚です。各状態の375・1024・1440pxの画像を横に並べ、全体を縮小した一覧で見出し・カード・余白を比較しました。長い行、確認画面、メニュー、記事本文、チャットのフッターは原寸でも確認しました。保存先が `public/` の管理画面・部品見本も対象です。

**共通する問題は高0件、中6件、低4件です。** 件数は同じ問題が現れる画面・幅をまとめたものです。公開記事には問い合わせへの出口があり、質問送信エラーでは入力が残った画像と再試行の説明があります。領収書の発行手順と問い合わせが必要な二重請求の相談も、記事リンクと担当者への入口を見分けられます。

## 指摘

|重さ|共通する問題・幅|画像に見えることと影響|期待する見え方|原寸の例|
|---|---|---|---|---|
|中|未対応の行の高さと件名に残る幅・375|#11の差出人名が3行を占め、さらに件名・本文・付帯情報が続き、1件が約140pxになる。#6の件名は「購入手続き後に届いたメー…」。待ち時間と空の担当印の列を残す分だけ、似た案件を一覧で判別しにくい。広い幅は同じ各行をほぼ一定の高さで読める。|製品・差出人・案件を区別できる件名を先に読める配置にする。長い氏名を保つ場合にも、番号・待ち時間・付帯情報が件名の幅を過度に狭めないようにする。|[375](screens/menu-home-bulk-assignee-375.png)・[1440](screens/behavior-sort-menu-1440.png)|
|中|狭幅の操作ボタンの外形・375|失効確認の2ボタン、課題の「下書きを作る」、コードをコピーするボタンなどの外形は高さ約36px。同じ画面幅の公開フォームでは高さ44pxの操作が表示される。とくに取り消しと破壊的操作が隣り合う箇所で差が出る。|モバイルの44px基準に沿って見える枠と余白を確保する。実際のヒット領域は実機で確認する。|[失効確認](screens/loop-revoke-375.png)・[課題](screens/issues-board-375.png)・[設定](screens/widget-options-375.png)|
|中|会話の関連情報で対象が分からない・375|全面の「会話の関連情報」に切り替わると、会話番号・件名・製品が消える。「このプロダクト」のリポジトリを設定する場面も「この相手」の操作履歴を読む場面も、対象をその場で照合できない。1024では背景の会話、1440では横の会話が見える。|引き出しの見出し周辺に対象の製品・会話番号または短い件名を添える。|[設定](screens/issue-setup-375.png)・[履歴](screens/loop-history-375.png)・[1440](screens/issue-setup-1440.png)|
|中|課題に関連付ける会話の選択リスト・全幅、特に375|メニューでは製品と件名がほぼ行間なく重なり合うように続き、長い#11は文字の詰まった4行になる。375では#10の途中が画面下端にかかり、メニューの下端も見えない。1440でもポップアップが画面下端まで伸びる。|番号・製品の行と件名の間に行間を取る。候補数が多い場合は画面内に収まるリスト領域と、続きがあると分かる表示を設ける。スクロールの可否は画像では判断できない。|[375](screens/menu-issues-new-choice-menu-0-375.png)・[1440](screens/menu-issues-new-choice-menu-0-1440.png)|
|中|記事候補の執筆を始める入口・全幅|「記事を書き始める」が薄い文字だけで表され、その隣の「元の会話 #1」の方が濃い。1440では題と操作が行の両端に離れ、375では題の下に説明文のように並ぶ。候補から記事を書くことを始めにくい。|執筆の入口にボタンまたは明確なリンクの見た目を与え、元の会話は調査用の副操作として並べる。|[375](screens/article-candidates-375.png)・[1440](screens/article-candidates-1440.png)|
|中|集計の折れ線が示す期間・全幅|「過去7日」の53分・50%の横に小さな線があるが、点が1日を表すのか、同じ長さの過去の期間を表すのかを示す凡例がない。「声の集計」では日付範囲内の推移が同じ形式で並ぶ。数値は読めても、上昇・下降がいつのことかを判断しづらい。|対応状況は何日ごとの何期間か、声の集計は指定範囲をどう区切ったかを、各画面につき一度短く表示する。|[対応状況](screens/metrics-trends-1440.png)・[声](screens/voices-trends-1440.png)・[375](screens/metrics-trends-375.png)|
|低|確認ボタンの幅・1024、1440|統合確認だけは「キャンセル」「この会話を統合する」が本文幅いっぱいの2段で、短いラベルの右側に大きな余白が残る。連絡先削除・公開確認では内容幅のボタンが並ぶ。|広い幅では他の確認画面と同じくラベルに応じた幅で配置する。|[統合](screens/loop-merge-confirm-1440.png)・[公開](screens/loop-publish-1440.png)|
|低|集計の略称・1024|細いナビに同じグラフ形状の「声の集計」と「対応状況」が縦に並ぶ。後者は1440で「対応状況の集計」となり、狭い幅だけ個別対応を見る場所とも読める。|狭いナビでも2つの集計の違いが分かる短い名称を付ける。|[1024](screens/console-404-1024.png)・[1440](screens/console-404-1440.png)|
|低|小窓のフッターの折り返し・1024、1440|ヘルプの下端に青リンク3個があり、「問い合わせフォーム」だけ次の行に離れる。375の全面表示では3個とも横一列。特に質問を入力する前の小さいウィジェットで、フッターだけが2行分の高さを取る。|問い合わせ導線を読みやすい順でまとめ、360pxの小窓でも1項目だけ離れて残らない配置にする。|[1024](screens/widget-open-1024.png)・[375](screens/widget-open-375.png)|
|低|課題の通知待ちを表す文言・全幅|「知らせる待ち」「2件の声のうち1件にまだ知らせていません」とあり、数が修正件数か通知する相手の数かを読み返す。「直した」表には別途「知らせた 1 / 2」がある。|見出しは「修正を知らせる課題」、内訳は「問い合わせ2件のうち1件に未通知」など、数えた対象を明示する。|[375](screens/issues-board-375.png)・[1440](screens/behavior-issue-demo-1440.png)|

## 幅と表示状態の比較

- 公開記事や検索は、375pxでは左右に小さい余白を取り、1024px・1440pxでは中央の読み幅を維持しています。記事がない検索にも製品の「お問い合わせ」が残ります。[記事・375](screens/article-375.png)・[記事・1440](screens/article-1440.png)・[検索0件・1024](screens/loop-help-no-results-1024.png)
- 課題一覧は広い幅で通知待ちの操作を最初に置き、未修正と修正済みの声を表で比較できます。375pxでは各行に列名が戻り、件数や通知状況の意味を追えます。[課題・375](screens/issues-board-375.png)・[課題・1440](screens/issues-board-1440.png)
- 確認画面の同時表示例では、1024pxの関連情報の引き出しと、その上の課題リンク確認が二層の暗幕で区別されます。375pxの全面表示では親の会話は見えません。前後画像のスクロール位置・データが一致しているとは限らないため、暗幕による位置ずれやフォーカス移動の成否は評価対象外です。[関連付け・1024](screens/link-issue-1024.png)・[確認・1024](screens/loop-link-confirm-1024.png)
- 送信失敗時は質問または問い合わせ内容が元の欄にあり、下端の赤い通知が再試行方法を伝えています。受付時は番号と返信先、フィードバックは返信しない旨が明記されています。通信・保存・再試行の結果、操作速度、キーボードやタッチの挙動は静止画から確定できません。[失敗・375](screens/loop-chat-failed-375.png)・[再試行・1440](screens/loop-public-retry-1440.png)・[受付・1024](screens/feedback-receipt-1024.png)

## 各状態の目的と三つの問い

画像リンクの数字は表示幅です。異なる幅で受付番号や履歴件数が異なる場合は、画像ごとの記録として記載しました。

### article

利用者が領収書を発行する手順を読む。

- どこから？ 設定の「購入履歴」。
- 何を確認する？ 支払いを選んで宛名を確認し、ダウンロードする。
- 解決しないときは？ 評価ボタンの下に「お問い合わせ」がある。

[375](screens/article-375.png)・[1024](screens/article-1024.png)・[1440](screens/article-1440.png)

### article-candidates

編集者が問い合わせを記事にできる候補を選ぶ。

- 何件？ 1件。
- 何の記事？ Slideの「領収書の宛名を変更するには」。
- 根拠は？ 「元の会話 #1」があり、375では執筆と会話の入口が題の下に並ぶ。

[375](screens/article-candidates-375.png)・[1024](screens/article-candidates-1024.png)・[1440](screens/article-candidates-1440.png)

### article-edit

編集者が公開済みの記事を更新する。

- 対象は？ Slideの「領収書を発行する」。
- 何を書き換える？ 題名、任意の要約、3手順を含む本文。
- 反映方法は？ 広い幅は「更新を公開」「非公開にして保存」などを本文直下に表示し、375の初期範囲は本文まで。

[375](screens/article-edit-375.png)・[1024](screens/article-edit-1024.png)・[1440](screens/article-edit-1440.png)

### article-index

利用者がSlideの公開記事を探す。

- どの製品？ 上端にSlideマーク。
- 何を読める？ 件数1件の下に「領収書を発行する」。
- 別の用件は？ 検索欄と一覧下の「お問い合わせ」がある。

[375](screens/article-index-375.png)・[1024](screens/article-index-1024.png)・[1440](screens/article-index-1440.png)

### article-new

編集者が新しいヘルプ記事を書く。

- 対象は？ プロダクト選択の初期表示はDesk。
- 何を記入する？ 題名、任意の要約、本文。
- いつ公開する？ 広い幅のカード下端で公開・プレビュー・下書き保存を選べる。375の下端は本文欄。

[375](screens/article-new-375.png)・[1024](screens/article-new-1024.png)・[1440](screens/article-new-1440.png)

### article-preview

編集者が公開前の読みやすさを確かめる。

- 何の表示？ 「記事のプレビュー」の下に「領収書を発行する」。
- 手順の見え方は？ 本文は番号付き3項目。
- 直せる場所は？ 整形後の本文に続きSlideの編集カードと題名欄がある。

[375](screens/article-preview-375.png)・[1024](screens/article-preview-1024.png)・[1440](screens/article-preview-1440.png)

### article-vote

評価を送った読者が受付を確認する。

- 届いた？ 緑色の「記事への評価を受け付けました」。
- 元の記事は？ 「領収書を発行する」リンク。
- 別途相談できる？ 区切り線の下に「メールでお問い合わせ」。

[375](screens/article-vote-375.png)・[1024](screens/article-vote-1024.png)・[1440](screens/article-vote-1440.png)

### behavior-confirmed-notice

担当者が内部メモの保存を確かめる。

- どの会話？ Slideの#1「領収書の宛名を変更できますか」。
- 誰に見せる文？ 黄地に「内部メモ（相手には送られません）」と佐藤 優。
- 保存できた？ 下部に緑の通知。375では固定入力欄の上に重なる。

[375](screens/behavior-confirmed-notice-375.png)・[1024](screens/behavior-confirmed-notice-1024.png)・[1440](screens/behavior-confirmed-notice-1440.png)

### behavior-issue-demo

運営者がデモの課題から次の仕事を選ぶ。

- 何を知らせる？ 宛名変更の声2件中1件が未通知。
- 何が未修正？ 「領収書の一括ダウンロード」に声3件。
- 修正済みは？ 2件。広い幅の列見出しは375では行の中のラベルになる。

[375](screens/behavior-issue-demo-375.png)・[1024](screens/behavior-issue-demo-1024.png)・[1440](screens/behavior-issue-demo-1440.png)

### behavior-issue-demo-all-sent

担当者が修正後の告知状況を確認する。

- 何が直った？ 「請求明細のダウンロードを改善する」。
- 誰に知らせた？ #4と#8の右端がともに「知らせた」。
- 修正の前後は？ 修正前30日間の1/1件、修正後8日ぶんの1/8件を並記。

[375](screens/behavior-issue-demo-all-sent-375.png)・[1024](screens/behavior-issue-demo-all-sent-1024.png)・[1440](screens/behavior-issue-demo-all-sent-1440.png)

### behavior-issue-demo-open

担当者がデモで開いている課題の声を読む。

- 課題は？ Slideの「領収書の一括ダウンロード」。
- 声は？ #11、#4、#7の3件に「未通知」。
- 次の操作は？ 「課題を閉じる（デモ用）」があり、375では見出しの下に移る。

[375](screens/behavior-issue-demo-open-375.png)・[1024](screens/behavior-issue-demo-open-1024.png)・[1440](screens/behavior-issue-demo-open-1440.png)

### behavior-sort-menu

担当者が未対応の処理順を選ぶ。

- 対象は？ 7件の未対応。
- 現在の順番は？ 青枠の「待たせている順」に対応する項目にチェック。
- 代案は？ 「新しい順」。375のメニューは一覧上部に重なる。

[375](screens/behavior-sort-menu-375.png)・[1024](screens/behavior-sort-menu-1024.png)・[1440](screens/behavior-sort-menu-1440.png)

### candidate-editor

編集者が会話から記事の草稿を起こす。

- 発端は？ 元の会話に宛名変更・再発行の質問。
- 原文を確認するには？ 「元の会話 #1 を開く」。
- どんな草稿？ Slideと「領収書の宛名を変更するには」が入力済みで要約は空。

[375](screens/candidate-editor-375.png)・[1024](screens/candidate-editor-1024.png)・[1440](screens/candidate-editor-1440.png)

### chat-articles

利用者が自分の質問に合う記事を判断する。

- 何を質問した？ 「領収書はどこから発行できますか？」。
- 何が見つかった？ 関連記事に「領収書を発行する」。
- 合わなければ？ 「解決しなかった」とフッターのメール問い合わせがある。

[375](screens/chat-articles-375.png)・[1024](screens/chat-articles-1024.png)・[1440](screens/chat-articles-1440.png)

### chat-input

利用者がSlideのヘルプに質問する。

- 最初に誰が処理する？ 説明に「関連記事を自動で探します」。
- 何を入力する？ 「質問」のテキスト欄ひとつ。
- 実行するには？ 右寄せの黒い「質問する」。下には記事・メールへのリンク。

[375](screens/chat-input-375.png)・[1024](screens/chat-input-1024.png)・[1440](screens/chat-input-1440.png)

### chat-receipt

問い合わせた人がチャットからの受付を確認する。

- 受付番号は？ #12。
- どこに返信される？ reader@example.net。
- 何を送った？ 契約名変更の質問と、合う記事が見つからなかった説明が残る。

[375](screens/chat-receipt-375.png)・[1024](screens/chat-receipt-1024.png)・[1440](screens/chat-receipt-1440.png)

### console-404

担当者が見つからない会話から復帰する。

- 何が起きた？ 「対象が見つかりません」。
- どう直す？ 「受信箱から問い合わせを選び直してください」。
- どこへ行く？ 直下の「受信箱に戻る」。

[375](screens/console-404-375.png)・[1024](screens/console-404-1024.png)・[1440](screens/console-404-1440.png)

### deletion

管理者が削除対象の連絡先を選ぶ。

- 何が消える？ 会話、メール原文、添付ファイル。
- 誰が対象？ 未選択の「相手を選んでください」。
- 選んだ次は？ 「削除内容を確認」が1個のカード内にある。

[375](screens/deletion-375.png)・[1024](screens/deletion-1024.png)・[1440](screens/deletion-1440.png)

### feedback-input

利用者が改善要望を送る。

- 何に使う？ 意見を改善に活用し個別返信はないと冒頭に表示。
- 何が任意？ 連絡先メールアドレス。
- 返信が必要なら？ 主ボタン「送信」の下にメール問い合わせ。

[375](screens/feedback-input-375.png)・[1024](screens/feedback-input-1024.png)・[1440](screens/feedback-input-1440.png)

### feedback-list

担当者が未確認のフィードバックを確認する。

- 何件？ フィードバック1件。
- どの声？ Slide・佐々木 葵さん・運営画面のキーボード利用。
- 次の操作は？ 「受付済み」の横に「確認済みにする」。375では行の下段。

[375](screens/feedback-list-375.png)・[1024](screens/feedback-list-1024.png)・[1440](screens/feedback-list-1440.png)

### feedback-receipt

意見を送った利用者が受付と今後の対応を確認する。

- 受理された？ 緑の帯に受付番号（375は#14、1024は#13、1440は#12）。
- 連絡先は？ 「登録なし」。
- 返信は？ 「フィードバックへの返信はありません」とメール問い合わせリンク。

[375](screens/feedback-receipt-375.png)・[1024](screens/feedback-receipt-1024.png)・[1440](screens/feedback-receipt-1440.png)

### forget

管理者が取り消せないデータ削除を判断する。

- 対象は？ 渡辺 葵・customer8@example.net。
- 範囲は？ 会話1件、保存された原文と添付ファイル。
- 決定方法は？ 取消不能の説明の下にキャンセルと赤い「すべて削除」。

[375](screens/forget-375.png)・[1024](screens/forget-1024.png)・[1440](screens/forget-1440.png)

### help-home

利用者が問い合わせ先とヘルプを探す。

- 対象製品は？ 1件、Slide。
- 自力で調べるには？ 横断検索と「ヘルプ記事」。
- 返事がほしいなら？ 「お問い合わせ」に担当者からの返信を希望する人向けの説明。

[375](screens/help-home-375.png)・[1024](screens/help-home-1024.png)・[1440](screens/help-home-1440.png)

### help-results

利用者が製品横断の記事検索結果を選ぶ。

- 検索語は？ 欄と解除用の表示に「領収書」。
- 該当は？ 1件、Slideの「領収書を発行する」。
- それでも困ったら？ 結果の下に製品の「お問い合わせ」。

[375](screens/help-results-375.png)・[1024](screens/help-results-1024.png)・[1440](screens/help-results-1440.png)

### invalid

管理者が窓口登録の入力エラーを直す。

- どの欄？ 青いフォーカス枠と赤い境界の「窓口アドレスの先頭」。
- 何が問題？ 空白と@を除くよう直下に赤字。
- 何が残った？ 「invalid address」、Slide、example.comが見える。

[375](screens/invalid-375.png)・[1024](screens/invalid-1024.png)・[1440](screens/invalid-1440.png)

### issue-detail

担当者が直した課題の通知結果を調べる。

- 何の課題？ Slideの領収書の宛名変更。
- 誰が待つ？ #1は承認待ち、#6は知らせた。
- 改善の比較は？ 修正前30日1/8件と修正後1日ぶん1/1件、母数の説明付き。

[375](screens/issue-detail-375.png)・[1024](screens/issue-detail-1024.png)・[1440](screens/issue-detail-1440.png)

### issue-new

担当者が新しい課題を起票する。

- 元になる情報は？ 「会話を選ぶ」。
- 公開するものは？ タイトルと「公開する要約」、個人情報を入れない注意。
- 次は？ 「起票内容を確認」がフォーム下端にある。

[375](screens/issue-new-375.png)・[1024](screens/issue-new-1024.png)・[1440](screens/issue-new-1440.png)

### issue-preview

担当者がGitHubへの起票内容を確認する。

- どこに？ example/helpdesk。
- 何を公開？ 請求書の宛名を変えると確認画面が開かない旨と会話#1のリンク。
- 提出前に直せる？ 黒い起票ボタンの直下に「入力内容を修正する」。

[375](screens/issue-preview-375.png)・[1024](screens/issue-preview-1024.png)・[1440](screens/issue-preview-1440.png)

### issue-setup

担当者が会話から課題を起票するための設定を調べる。

- 何が不足？ 当該製品のリポジトリ設定。
- 誰が進める？ 「管理者が拡張の設定で確認できます」。
- 入口は？ GitHub Issueの設定リンク。375は全面、1024は引き出し、1440は会話右のカード。

[375](screens/issue-setup-375.png)・[1024](screens/issue-setup-1024.png)・[1440](screens/issue-setup-1440.png)

### issues-board

担当者が通知と修正の順番を決める。

- 先に何をする？ 知らせる待ち1件に黒い「下書きを作る」。
- 未修正は？ 一括ダウンロード1件、最初の声は11時間前。
- 直した課題は？ 宛名変更に声2件、知らせた数1/2。

[375](screens/issues-board-375.png)・[1024](screens/issues-board-1024.png)・[1440](screens/issues-board-1440.png)

### link-issue

担当者が会話に既存課題を結び付ける。

- 現在の関連数は？ 0件。
- どれを選ぶ？ 題で探す欄に青枠、2件のうち「#42 領収書の一括ダウンロード」を表示。
- 確定入口は？ 「既存の課題と紐づける」が選択欄の下。

[375](screens/link-issue-375.png)・[1024](screens/link-issue-1024.png)・[1440](screens/link-issue-1440.png)

### loop-canned-edit

管理者が保存済み定型文を直す。

- どれを編集？ 1件の「お問い合わせの受付」。
- 何を差し込める？ 本文例と説明に相手の名前とプロダクトの置換記号。
- 確定するには？ 本文下に「変更を保存」「取り消し」、広い幅では下に新規作成欄。

[375](screens/loop-canned-edit-375.png)・[1024](screens/loop-canned-edit-1024.png)・[1440](screens/loop-canned-edit-1440.png)

### loop-chat-failed

質問送信に失敗した利用者がやり直す。

- 何が失敗？ 画面下端に赤い「送信できませんでした」。
- 書き直す？ 「領収書を発行したい」が欄に残る。
- どうする？ 接続確認後に再試行する案内と元の「質問する」がある。

[375](screens/loop-chat-failed-375.png)・[1024](screens/loop-chat-failed-1024.png)・[1440](screens/loop-chat-failed-1440.png)

### loop-chat-solved

利用者が記事での解決を記録する。

- どの質問？ 「領収書を発行したい」。
- どの記事？ 直下の「領収書を発行する」。
- 結果と次の入口は？ 記録済みの一文に続き新しい質問欄がある。

[375](screens/loop-chat-solved-375.png)・[1024](screens/loop-chat-solved-1024.png)・[1440](screens/loop-chat-solved-1440.png)

### loop-convert

担当者が意見を返信可能な問い合わせに変更する。

- 対象は？ フィードバック#10とキーボード利用の件名。
- 何が変わる？ 「返信できる問い合わせに変更します」。
- 選択肢は？ 中央の確認にキャンセルと黒い「問い合わせに変更」。

[375](screens/loop-convert-375.png)・[1024](screens/loop-convert-1024.png)・[1440](screens/loop-convert-1440.png)

### loop-dates

担当者が対応状況の集計期間を指定する。

- どの期間？ 11月1日から18日。
- 日付の基準は？ 開始・終了とも日本時間。
- どこを編集中？ 青枠の「日付の範囲」の直下に2つの日付欄、背景に4日の平均時間。

[375](screens/loop-dates-375.png)・[1024](screens/loop-dates-1024.png)・[1440](screens/loop-dates-1440.png)

### loop-disable

管理者が振り分けルールの停止を確認する。

- 何を止める？ タイトルに機能名。
- 既存設定は？ 保持され、再有効化まで新しい処理が停止すると明記。
- 決め方は？ キャンセルと黒い「振り分けルールを無効にする」が縦に並ぶ。

[375](screens/loop-disable-375.png)・[1024](screens/loop-disable-1024.png)・[1440](screens/loop-disable-1440.png)

### loop-discard

担当者が承認前の下書きを破棄する。

- どの文？ 会話#5、更新時のメンバー数の文面。
- 何件？ 1件を削除と明記。
- 取りやめられる？ 赤い「下書きを破棄」の隣にキャンセル。

[375](screens/loop-discard-375.png)・[1024](screens/loop-discard-1024.png)・[1440](screens/loop-discard-1440.png)

### loop-enable

管理者が問い合わせフォームを有効化する。

- 対象範囲は？ 全プロダクトで使用可能。
- いつ受付開始？ 受付は製品ごとに開始と明記。
- 追加権限は？ なし。確認ボタンとキャンセルを別々に表示。

[375](screens/loop-enable-375.png)・[1024](screens/loop-enable-1024.png)・[1440](screens/loop-enable-1440.png)

### loop-feedback-undo

担当者が確認済みにした意見を必要に応じて戻す。

- どの意見？ #10、佐々木 葵さん。
- 今の状態は？ 行に「確認済み」。
- 戻すには？ 行に「未確認に戻す」、画面下部の完了通知にも「元に戻す」。

[375](screens/loop-feedback-undo-375.png)・[1024](screens/loop-feedback-undo-1024.png)・[1440](screens/loop-feedback-undo-1440.png)

### loop-help-no-results

検索に失敗した利用者が別の解決策を探す。

- 何を検索？ 「未掲載の振込口座」。
- 結果は？ 0件で虫眼鏡と「該当する記事はありません」。
- 次は？ 検索語の解除と、下のSlideカードに問い合わせへの入口。

[375](screens/loop-help-no-results-375.png)・[1024](screens/loop-help-no-results-1024.png)・[1440](screens/loop-help-no-results-1440.png)

### loop-history

担当者が会話で行われた操作を調べる。

- どこを見る？ 「操作履歴」が展開中。
- 最初の記録は？ 2時間前の受信にモニター記号と「システム」。
- 誰が見た？ 375は佐藤 優による「会話を表示」が同一相対時刻で2行、1024は1行、1440は受信のみ。

[375](screens/loop-history-375.png)・[1024](screens/loop-history-1024.png)・[1440](screens/loop-history-1440.png)

### loop-link-confirm

担当者がGitHubに会話リンクを投稿する内容を確かめる。

- 投稿先は？ example/helpdeskの#42。
- 何が載る？ 会話#1へのリンクをコメントする、と本文とドメインで特定。
- 確定前に止めるには？ 「キャンセル」。1024では会話→引き出し→確認の3層が見える。

[375](screens/loop-link-confirm-375.png)・[1024](screens/loop-link-confirm-1024.png)・[1440](screens/loop-link-confirm-1440.png)

### loop-merge-confirm

担当者が会話統合の向きを確かめる。

- 元は？ #1の領収書の宛名についての会話。
- 先は？ #2の招待メールの会話に統合する文。
- 実行は？ キャンセルの真下に幅いっぱいの黒い「この会話を統合する」。

[375](screens/loop-merge-confirm-375.png)・[1024](screens/loop-merge-confirm-1024.png)・[1440](screens/loop-merge-confirm-1440.png)

### loop-metric-definition

運営者が「声が改善に届いた割合」の意味を調べる。

- どの数値？ 0%、0件/10件。
- 何を数える？ 黒い説明に期間中受け付けた声のうち修正後に承認済みの知らせを送った会話とある。
- 比較できる？ 前期間の対象データがない、と説明末尾にある。

[375](screens/loop-metric-definition-375.png)・[1024](screens/loop-metric-definition-1024.png)・[1440](screens/loop-metric-definition-1440.png)

### loop-navigation

担当者が受信箱から別の作業へ移る。

- 現在地は？ 「未対応」7件を灰色で選択。
- どんな移動先？ 返信待ち・自分の担当・フィードバック・課題など。
- 表示方法は？ 375のみ左引き出しと×、1024はアイコン列、1440は文字付きの常設ナビ。

[375](screens/loop-navigation-375.png)・[1024](screens/loop-navigation-1024.png)・[1440](screens/loop-navigation-1440.png)

### loop-public-retry

送信を確認できなかった利用者が再試行する。

- 状態は？ 下部の赤い通知に「送信を確認できませんでした」。
- 何が残る？ 「配送日の確認」、届かない旨の本文、返信先。
- 次は？ 時間をおいて再試行との案内、送信ボタンとメールの入口。

[375](screens/loop-public-retry-375.png)・[1024](screens/loop-public-retry-1024.png)・[1440](screens/loop-public-retry-1440.png)

### loop-publish

編集者が記事を一般公開する直前に対象を確かめる。

- 記事は？ 「契約を更新する」。
- どこへ出る？ 「公開ヘルプに掲載します」。
- 進め方は？ キャンセルと黒い「公開する」が中央の確認内に並ぶ。

[375](screens/loop-publish-375.png)・[1024](screens/loop-publish-1024.png)・[1440](screens/loop-publish-1440.png)

### loop-revoke

管理者がAPIトークンの失効を最終確認する。

- 対象は？ 「運営用CLI」。
- 影響は？ 使用中のCLIやMCPクライアントが接続できなくなる。
- 確定は？ 赤い「失効させる」の左にキャンセル。

[375](screens/loop-revoke-375.png)・[1024](screens/loop-revoke-1024.png)・[1440](screens/loop-revoke-1440.png)

### menu-articles-candidates-choice-menu-0

編集者が記事候補の並びを変える。

- 候補数は？ 見出し下に1件。
- 今の条件は？ 記事の作成は「すべて」、並び順は標準にチェック。
- どう変える？ トリガー直下に「名前順」も表示。

[375](screens/menu-articles-candidates-choice-menu-0-375.png)・[1024](screens/menu-articles-candidates-choice-menu-0-1024.png)・[1440](screens/menu-articles-candidates-choice-menu-0-1440.png)

### menu-articles-choice-menu-0

編集者が記事一覧の表示順を選ぶ。

- どの記事？ 「領収書を発行する」が1件。
- 現在の順番は？ 「標準の順序」にチェックと青枠。
- 他の並べ方は？ 「名前順」が2番目にある。

[375](screens/menu-articles-choice-menu-0-375.png)・[1024](screens/menu-articles-choice-menu-0-1024.png)・[1440](screens/menu-articles-choice-menu-0-1440.png)

### menu-articles-new-choice-menu-0

執筆者が新しい記事の対象製品を選ぶ。

- どの画面？ 「記事を書く」の「記事の内容」。
- 選択済みは？ Deskにチェックと紺のD。
- 別の対象は？ 茶色のSとSlideがその下に並ぶ。

[375](screens/menu-articles-new-choice-menu-0-375.png)・[1024](screens/menu-articles-new-choice-menu-0-1024.png)・[1440](screens/menu-articles-new-choice-menu-0-1440.png)

### menu-articles-questions-choice-menu-0

編集者が未回答の質問を製品別に絞る。

- 対象は？ 「記事が無かった質問」0件。
- 今は？ 「すべてのプロダクト」にチェック。
- 何を選べる？ DeskとSlide。375はメニューが空状態の説明に重なる。

[375](screens/menu-articles-questions-choice-menu-0-375.png)・[1024](screens/menu-articles-questions-choice-menu-0-1024.png)・[1440](screens/menu-articles-questions-choice-menu-0-1440.png)

### menu-dev-ui-choice-menu-0

開発者が一覧の並べ替え部品を確認する。

- 見本は？ 「UI 部品見本」の受信箱2件。
- 選択は？ 「新着順」にチェックと青枠。
- もう一方は？ 「古い順」が2段目に表示。

[375](screens/menu-dev-ui-choice-menu-0-375.png)・[1024](screens/menu-dev-ui-choice-menu-0-1024.png)・[1440](screens/menu-dev-ui-choice-menu-0-1440.png)

### menu-dev-ui-sample-assignee

開発者が詳細の担当者選択を確認する。

- 対象は？ 「領収書の宛名について」の担当ボタン。
- 現在は？ ピンクの印を持つ佐藤 優にチェック。
- 選択先は？ 森 直子または未割り当て。広い幅では上に、375では下に開く。

[375](screens/menu-dev-ui-sample-assignee-375.png)・[1024](screens/menu-dev-ui-sample-assignee-1024.png)・[1440](screens/menu-dev-ui-sample-assignee-1440.png)

### menu-dev-ui-sample-menu

開発者が会話の副操作見本を確認する。

- 入口は？ 詳細の「その他の操作」。
- 何が選べる？ メニューは「削除する」1つ。
- 今どこにいる？ トリガーと項目の異なる青枠が表示され、375では本文前にメニューが重なる。

[375](screens/menu-dev-ui-sample-menu-375.png)・[1024](screens/menu-dev-ui-sample-menu-1024.png)・[1440](screens/menu-dev-ui-sample-menu-1440.png)

### menu-home-bulk-assignee

担当者が選択した問い合わせを一括で割り当てる。

- 何件？ 「7件を選択中」、各行にチェックと青い背景。
- 誰に？ 佐藤 優、森 直子。
- 選択を変えるには？ 件数の隣に「選択を解除」。375ではツールバーが複数段。

[375](screens/menu-home-bulk-assignee-375.png)・[1024](screens/menu-home-bulk-assignee-1024.png)・[1440](screens/menu-home-bulk-assignee-1440.png)

### menu-home-choice-menu-0

担当者が未対応一覧の状態を絞る。

- どの条件？ 絞り込み内の「状態」。
- 現在は？ 「未対応」にチェック。
- 他の選択は？ 返信待ち、完了、迷惑メール、すべてが記号付きの項目と並ぶ。

[375](screens/menu-home-choice-menu-0-375.png)・[1024](screens/menu-home-choice-menu-0-1024.png)・[1440](screens/menu-home-choice-menu-0-1440.png)

### menu-home-choice-menu-1

担当者が未対応一覧の対象製品を絞る。

- どの一覧？ 状態欄は未対応。
- どこまで含む？ 製品は「すべて」にチェック。
- 候補は？ 製品マーク付きのDeskとSlide。

[375](screens/menu-home-choice-menu-1-375.png)・[1024](screens/menu-home-choice-menu-1-1024.png)・[1440](screens/menu-home-choice-menu-1-1440.png)

### menu-home-choice-menu-2

担当者が未対応一覧をラベルで絞る。

- 今の条件は？ 「すべてのラベル」にチェック。
- どんな条件がある？ 再発行・社内確認・経理・請求など色点付き6候補。
- 整備するには？ 末尾に「ラベルを管理」。375はトリガーの上に展開。

[375](screens/menu-home-choice-menu-2-375.png)・[1024](screens/menu-home-choice-menu-2-1024.png)・[1440](screens/menu-home-choice-menu-2-1440.png)

### menu-home-choice-menu-3

担当者が未対応7件を並べ替える。

- 対象は？ 見出しの未対応7件。
- 選択は？ 「待たせている順」にチェック。
- 変更先は？ 「新しい順」。375は一覧の上に浮き、広い幅では検索欄右に揃う。

[375](screens/menu-home-choice-menu-3-375.png)・[1024](screens/menu-home-choice-menu-3-1024.png)・[1440](screens/menu-home-choice-menu-3-1440.png)

### menu-home-filter-assignee

担当者が未対応を担当者で絞る。

- 状態は？ 親パネルの状態は未対応。
- 現在の担当条件は？ 「すべて」にチェック。
- 誰が候補？ 佐藤 優と森 直子を色付き丸と実名で表示。

[375](screens/menu-home-filter-assignee-375.png)・[1024](screens/menu-home-filter-assignee-1024.png)・[1440](screens/menu-home-filter-assignee-1440.png)

### menu-issues-new-choice-menu-0

担当者が模擬GitHubに起票する会話を指定する。

- どの段階？ 「課題を追加」の「もとになる会話」。
- どう探す？ 「候補を絞り込む」に青いフォーカス枠。
- どう識別する？ #番号、製品、件名の2段表示。375は候補列が下端の#10途中まで。

[375](screens/menu-issues-new-choice-menu-0-375.png)・[1024](screens/menu-issues-new-choice-menu-0-1024.png)・[1440](screens/menu-issues-new-choice-menu-0-1440.png)

### menu-metrics-choice-menu-0

運営者が過去30日の対応状況を製品別に見る。

- 今の範囲は？ 全プロダクトにチェック。
- 選べる製品は？ DeskとSlide。
- 今の指標は？ 第一カードは4日、次は100%。375ではカードが縦に続く。

[375](screens/menu-metrics-choice-menu-0-375.png)・[1024](screens/menu-metrics-choice-menu-0-1024.png)・[1440](screens/menu-metrics-choice-menu-0-1440.png)

### menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0

運営者が日付指定済みの集計で製品を切り替える。

- 期間の状態は？ 「日付を指定」と「日付の範囲」、条件の末尾に11-18。
- 現在の対象は？ 全プロダクトがチェック済み。
- 代替は？ DeskとSlideがマーク付きで表示。

[375](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0-375.png)・[1024](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0-1024.png)・[1440](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0-1440.png)

### menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates

運営者が指定期間の始点を編集する。

- 何が選ばれている？ 開始日欄の2026に選択色、全体に青枠。
- 開始と終了は？ 11/01と11/18、両方が日本時間。
- 対象製品は？ 「すべてのプロダクト」が左に表示。

[375](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates-375.png)・[1024](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates-1024.png)・[1440](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates-1440.png)

### menu-query-999c3485-choice-menu-0

検索した担当者が状態条件を調べる。

- 何を検索？ 「未回答の調査番号」0件。
- 現在は？ 状態「すべて」にチェック。
- フォーカスは？ 「未対応」に青枠があり、選択値と操作位置を区別できる。

[375](screens/menu-query-999c3485-choice-menu-0-375.png)・[1024](screens/menu-query-999c3485-choice-menu-0-1024.png)・[1440](screens/menu-query-999c3485-choice-menu-0-1440.png)

### menu-query-999c3485-choice-menu-1

担当者が0件の検索の対象製品を確かめる。

- 検索内容は？ 「未回答の調査番号」。
- 現在の製品は？ 「すべて」にチェック。
- 他の製品は？ 青いDesk、茶色のSlideの2項目。

[375](screens/menu-query-999c3485-choice-menu-1-375.png)・[1024](screens/menu-query-999c3485-choice-menu-1-1024.png)・[1440](screens/menu-query-999c3485-choice-menu-1-1440.png)

### menu-query-999c3485-choice-menu-2

担当者が検索結果をラベルで絞る。

- 今の結果は？ 0件。
- 今のラベルは？ 「すべてのラベル」。
- 変更可能な内容は？ 「長期契約の更新手続きについて」など6項目と管理への入口。375では検索語がメニューの背後。

[375](screens/menu-query-999c3485-choice-menu-2-375.png)・[1024](screens/menu-query-999c3485-choice-menu-2-1024.png)・[1440](screens/menu-query-999c3485-choice-menu-2-1440.png)

### menu-query-999c3485-choice-menu-3

担当者が検索結果の順番や解除方法を探す。

- 結果は？ 見出しに0件。
- 並び順は？ 「待たせている順」が選択済み、「新しい順」もある。
- やり直せる？ 虫眼鏡の空状態に「絞り込みを解除」。

[375](screens/menu-query-999c3485-choice-menu-3-375.png)・[1024](screens/menu-query-999c3485-choice-menu-3-1024.png)・[1440](screens/menu-query-999c3485-choice-menu-3-1440.png)

### menu-query-999c3485-filter-assignee

担当者が検索結果の担当条件を見直す。

- 何件ある？ 「検索結果」0件。
- 選択中は？ 担当者欄は「すべて」にチェック。
- 人名は？ 佐藤 優、森 直子が並び、上には状態・プロダクトの条件も残る。

[375](screens/menu-query-999c3485-filter-assignee-375.png)・[1024](screens/menu-query-999c3485-filter-assignee-1024.png)・[1440](screens/menu-query-999c3485-filter-assignee-1440.png)

### menu-view-feedback-834dd78f-choice-menu-0

担当者が意見一覧の処理状態を選ぶ。

- 対象数は？ フィードバック1件。
- 現状は？ 状態「すべて」がチェック済みで、受付済みに青いフォーカス。
- 選択肢は？ 受付済み、確認済み、迷惑メール、すべて。

[375](screens/menu-view-feedback-834dd78f-choice-menu-0-375.png)・[1024](screens/menu-view-feedback-834dd78f-choice-menu-0-1024.png)・[1440](screens/menu-view-feedback-834dd78f-choice-menu-0-1440.png)

### menu-view-feedback-834dd78f-choice-menu-1

担当者が意見一覧を製品別に絞る。

- 処理状態は？ 状態欄は「すべて」。
- 製品の現在値は？ 「すべて」にチェック。
- 候補は？ DeskとSlideで、それぞれに製品記号。

[375](screens/menu-view-feedback-834dd78f-choice-menu-1-375.png)・[1024](screens/menu-view-feedback-834dd78f-choice-menu-1-1024.png)・[1440](screens/menu-view-feedback-834dd78f-choice-menu-1-1440.png)

### menu-view-feedback-834dd78f-choice-menu-2

担当者が意見をラベルから探す。

- 対象は？ フィードバック1件の一覧。
- どのラベルを使用中？ すべて。
- 何を選べる？ 色点付きの再発行、経理、領収書などと「ラベルを管理」。375ではトリガーの上に開く。

[375](screens/menu-view-feedback-834dd78f-choice-menu-2-375.png)・[1024](screens/menu-view-feedback-834dd78f-choice-menu-2-1024.png)・[1440](screens/menu-view-feedback-834dd78f-choice-menu-2-1440.png)

### menu-view-feedback-834dd78f-choice-menu-3

担当者がフィードバックの確認順を決める。

- 何件？ 一覧は1件。
- 現在は？ 「新しい順」にチェック。
- 別の優先順は？ 「未確認を先に」。下には「確認済みにする」。

[375](screens/menu-view-feedback-834dd78f-choice-menu-3-375.png)・[1024](screens/menu-view-feedback-834dd78f-choice-menu-3-1024.png)・[1440](screens/menu-view-feedback-834dd78f-choice-menu-3-1440.png)

### menu-voices-choice-menu-0

運営者が声の集計の対象製品を選ぶ。

- 集計対象は？ 問い合わせとフィードバック10件、迷惑メールを除く。
- 現在は？ 全プロダクトにチェック。
- 何で絞れる？ DeskとSlide。開始日・終了日も同じフィルター群に並ぶ。

[375](screens/menu-voices-choice-menu-0-375.png)・[1024](screens/menu-voices-choice-menu-0-1024.png)・[1440](screens/menu-voices-choice-menu-0-1440.png)

### metrics-trends

運営者が1週間の対応傾向をつかむ。

- どの期間？ 過去7日。
- 主な結果は？ 解決までの平均53分、一度で解決50%、平均作業時間10分。
- 比較は？ 前期差と小さい折れ線を値に併記し、5件未満は目安と説明。

[375](screens/metrics-trends-375.png)・[1024](screens/metrics-trends-1024.png)・[1440](screens/metrics-trends-1440.png)

### operation-result

運営者が特定製品の集計結果を項目ごとに読む。

- 対象は？ Slide、10月18日9時から11月18日8時59分。
- 解決まで？ 4日、一度で解決100%。
- どれだけ届いた？ 声5件、知らせが届いた声0件を右揃えの値で示す。

[375](screens/operation-result-375.png)・[1024](screens/operation-result-1024.png)・[1440](screens/operation-result-1440.png)

### public-404

利用者が存在しない公開ページから戻る。

- 製品は？ Slideマーク。
- 状況は？ 「ページが見つかりません」とアドレス確認の説明。
- 次の入口は？ 左揃えの「ヘルプに戻る」。

[375](screens/public-404-375.png)・[1024](screens/public-404-1024.png)・[1440](screens/public-404-1440.png)

### public-query

利用者がSlide内で領収書の記事を探す。

- 現在の検索語は？ 欄と解除用表示に「領収書」。
- 該当は？ 1件「領収書を発行する」。
- 別の手段は？ 一覧末尾にメール問い合わせ。

[375](screens/public-query-375.png)・[1024](screens/public-query-1024.png)・[1440](screens/public-query-1440.png)

### result

運営者が通常期間の対応状況を把握する。

- 範囲は？ 全プロダクト、過去30日。
- 何が目立つ？ 左端に黒線のある平均時間4日。
- データ量は？ 一度で解決100%には対象1件、平均作業時間にはデータなしと明記。

[375](screens/result-375.png)・[1024](screens/result-1024.png)・[1440](screens/result-1440.png)

### retention

管理者が完了会話を保存する期間を決める。

- 対象は？ 「完了した会話」。
- 現在は？ 「無期限」のラジオが選択済み。
- 変更方法は？ 「日数を指定」と「保存期間を変更」、隣に取り消し。

[375](screens/retention-375.png)・[1024](screens/retention-1024.png)・[1440](screens/retention-1440.png)

### route-dev-ui

開発者が共通画面部品を比較する。

- どこを見られる？ 一覧・詳細・編集・概要・状態のリンク。
- 最初の見本は？ 2件の受信箱と検索・状態・順序。
- 下に何が続く？ 公開中の記事と「詳細」の領収書の会話。

[375](screens/route-dev-ui-375.png)・[1024](screens/route-dev-ui-1024.png)・[1440](screens/route-dev-ui-1440.png)

### route-help

利用者が希望するサポート手段を選ぶ。

- どの製品？ Slideのみ。
- 担当者の回答は？ 「お問い合わせ」に返信希望者向けの説明。
- その他は？ ヘルプ記事、自動で探すヘルプチャット、返信不要のフィードバックが同じカードに並ぶ。

[375](screens/route-help-375.png)・[1024](screens/route-help-1024.png)・[1440](screens/route-help-1440.png)

### route-help-absent-slide

Slideの利用者が誤ったヘルプURLから戻る。

- 何が見えた？ Slideのヘッダーと「ページが見つかりません」。
- 確認箇所は？ 本文にアドレスを確認する案内。
- 復帰先は？ 「ヘルプに戻る」の単一ボタン。

[375](screens/route-help-absent-slide-375.png)・[1024](screens/route-help-absent-slide-1024.png)・[1440](screens/route-help-absent-slide-1440.png)

### route-mail-in-6

メールの読者が購入確認の本文を読む。

- 何のメール？ 購入に対するお礼。
- どの注文？ SL-2026-128。
- ほかに何が見える？ 左上の2行と白地だけで差出人・戻る操作はこの画像の範囲外。

[375](screens/route-mail-in-6-375.png)・[1024](screens/route-mail-in-6-1024.png)・[1440](screens/route-mail-in-6-1440.png)

### suggest-editor

編集者が未解決の質問を記事にする。

- 製品は？ Slideが選択済み。
- 題名は？ チームの利用履歴を月ごとに集計できるか、という質問が入力済み。
- 残りの作業は？ 任意の要約と空の本文、広い幅では公開・プレビュー・下書き保存も見える。

[375](screens/suggest-editor-375.png)・[1024](screens/suggest-editor-1024.png)・[1440](screens/suggest-editor-1440.png)

### suggest-form

問い合わせ前の利用者が関連記事と送る内容を確認する。

- 先に見られる記事は？ 「領収書を発行する（新しいタブ）」。
- 送る内容は？ 件名「経費精算について」、先月の領収書の要望、返信先。
- 判断は？ 「入力内容を修正する」と黒い「このまま送る」。

[375](screens/suggest-form-375.png)・[1024](screens/suggest-form-1024.png)・[1440](screens/suggest-form-1440.png)

### suggest-human

利用者が二重請求の疑いを担当者に相談する。

- 元の質問は？ 金額の違いと二重請求かの調査依頼。
- 有人窓口は？ 質問の直下に黒い「担当者に問い合わせる」。
- 記事も読める？ 領収書の発行記事と解決・未解決ボタンが下に続く。

[375](screens/suggest-human-375.png)・[1024](screens/suggest-human-1024.png)・[1440](screens/suggest-human-1440.png)

### suggest-library

編集者が見直す記事を選ぶ。

- 対象は？ Slideの領収書発行記事1件、公開中。
- 利用された？ 提示4回、閲覧1回、解決率0%。
- 何をする？ 行は「見直し候補」、上部に記事を書く・候補・記事が無かった質問の入口。

[375](screens/suggest-library-375.png)・[1024](screens/suggest-library-1024.png)・[1440](screens/suggest-library-1440.png)

### suggest-metric

運営者が記事提案による自己解決を確認する。

- どの指標？ 「待たずに解決できた割合」。
- 結果は？ 25%、1件/4件。
- 何との比較？ 「前期比 比較データなし」、下に解決件数1と完了件数1。

[375](screens/suggest-metric-375.png)・[1024](screens/suggest-metric-1024.png)・[1440](screens/suggest-metric-1440.png)

### suggest-questions

編集者が記事のない質問から執筆を始める。

- 質問数は？ 1件。
- どんな質問？ Slideのチーム利用履歴の月別集計。
- どこから書く？ 同じ行の右端に「記事を書く」、375では題が2行。

[375](screens/suggest-questions-375.png)・[1024](screens/suggest-questions-1024.png)・[1440](screens/suggest-questions-1440.png)

### suggest-questions-empty

編集者が記事不足の有無を確認する。

- 対象範囲は？ すべてのプロダクト。
- 残件は？ 0件、虫眼鏡の下に「記事を提案できなかった質問はまだありません」。
- 戻るには？ 画面上端の「記事一覧に戻る」。

[375](screens/suggest-questions-empty-375.png)・[1024](screens/suggest-questions-empty-1024.png)・[1440](screens/suggest-questions-empty-1440.png)

### survey-thanks

アンケート回答者が記録を確認する。

- どの製品？ Slide。
- どの会話？ 問い合わせ#8。
- どうなった？ 「ご回答ありがとうございます」の下、緑の帯に「回答を記録しました」。

[375](screens/survey-thanks-375.png)・[1024](screens/survey-thanks-1024.png)・[1440](screens/survey-thanks-1440.png)

### voices

運営者が届いた声の内訳を見る。

- 母集団は？ 迷惑メールを除く問い合わせ・フィードバック10件。
- 最多は？ ラベルなし7件、製品別はSlide9件。
- 個別確認は？ 「該当する声を見る」、期間入力の横に「集計する」。

[375](screens/voices-375.png)・[1024](screens/voices-1024.png)・[1440](screens/voices-1440.png)

### voices-filtered

運営者が集計の元になった声を追う。

- 範囲は？ Slide・全期間・9件。
- どう区別する？ 番号、件名、製品、日付と問い合わせ・フィードバックの種別。
- 戻り道は？ 上部の「声の集計に戻る」。

[375](screens/voices-filtered-375.png)・[1024](screens/voices-filtered-1024.png)・[1440](screens/voices-filtered-1440.png)

### voices-trends

運営者が期間内のラベル別・製品別の推移を比べる。

- 期間は？ 2026/10/01から11/18、対象27件。
- 多いラベルは？ 請求8件、ラベルなし・経理・領収書各7件。
- 製品差は？ 広い幅でSlide20件、Desk7件の背景棒と線。375の初期範囲はラベル表。

[375](screens/voices-trends-375.png)・[1024](screens/voices-trends-1024.png)・[1440](screens/voices-trends-1440.png)

### widget-article

製品画面内で利用者が領収書記事を読む。

- 記事の内容は？ 設定から購入履歴を開く3手順。
- やり取りには？ 上部に「やりとりに戻る」。
- 別表示は？ 本文下に「新しいタブで開く」。375は全面、広い幅では支払い履歴の右下。

[375](screens/widget-article-375.png)・[1024](screens/widget-article-1024.png)・[1440](screens/widget-article-1440.png)

### widget-closed

利用者が請求履歴からヘルプを探す。

- 何の画面？ Slideの「請求・領収書」。
- 履歴は？ 2026年11月と10月に各¥3,000、各行にCSV。
- 困ったら？ 黒い「ヘルプ」が3幅とも右下にある。

[375](screens/widget-closed-375.png)・[1024](screens/widget-closed-1024.png)・[1440](screens/widget-closed-1440.png)

### widget-csp

サイト管理者がヘルプ埋め込み時のCSP設定を確認する。

- どの製品？ 広い幅のカードはSlide、375はコード中にslide。
- 更新先は？ 埋め込み先サイトのContent-Security-Policy。
- 何を設定？ script-srcとframe-srcの両方に指定オリジンを追加する説明。

[375](screens/widget-csp-375.png)・[1024](screens/widget-csp-1024.png)・[1440](screens/widget-csp-1440.png)

### widget-edit-response

管理者が返信時期の目安を設定する。

- 対象と状態は？ Slideは受付中、Deskは受付開始前。
- 現在値は？ 「返信の目安：未設定」。
- どこに出る？ 受付後に利用者に表示する旨と「例：2営業日以内」、375では展開見出しが下端。

[375](screens/widget-edit-response-375.png)・[1024](screens/widget-edit-response-1024.png)・[1440](screens/widget-edit-response-1440.png)

### widget-edit-sites

管理者がチャットを埋め込むサイトを登録する。

- 対象は？ Slideは受付中、登録先0件。
- 何を入力？ 「埋め込み先のサイト」、広い幅ではhttpsの入力例。
- どう決める？ 「埋め込み先を登録」と取り消し。375初期範囲は入力欄の上端まで。

[375](screens/widget-edit-sites-375.png)・[1024](screens/widget-edit-sites-1024.png)・[1440](screens/widget-edit-sites-1440.png)

### widget-handoff

記事で解決できない利用者が質問を人へ引き継ぐ。

- 送るものは？ 「これまでの質問」と明記、元の領収書の質問が表示される。
- 何が必要？ 連絡先メール欄に青枠、名前は任意。
- 次の操作は？ 「送信」と「質問に戻る」。

[375](screens/widget-handoff-375.png)・[1024](screens/widget-handoff-1024.png)・[1440](screens/widget-handoff-1440.png)

### widget-no-match

合う記事がなかった利用者が問い合わせる。

- どの質問？ 「チームの名前を変更したい」。
- 検索結果は？ 合う記事は見つからなかったと一文で説明。
- 次は？ 返信先と任意の名前を入力して送信、質問に戻ることもできる。

[375](screens/widget-no-match-375.png)・[1024](screens/widget-no-match-1024.png)・[1440](screens/widget-no-match-1440.png)

### widget-open

利用者が製品内のヘルプを開いて質問を始める。

- 誰が答える？ まず記事を自動検索し、問い合わせ後に担当者が読むという説明。
- 入力箇所は？ 「質問」欄が青枠、その下に黒い「質問する」。
- 閉じる場所は？ 右上の×。375では全画面、1024・1440では右下の小窓。

[375](screens/widget-open-375.png)・[1024](screens/widget-open-1024.png)・[1440](screens/widget-open-1440.png)

### widget-options

管理者が埋め込みボタンと初期文言を調整する。

- 現在の配置は？ 「右下」。
- 表示名は？ ボタンの文言は「ヘルプ」、最初の説明文は別欄。
- 確認は？ 「変更したボタンを見本で確認」の操作。

[375](screens/widget-options-375.png)・[1024](screens/widget-options-1024.png)・[1440](screens/widget-options-1440.png)

### widget-preview

管理者が埋め込み見本の初期表示を確かめる。

- 何が開いた？ 設定内の「埋め込みの見本」にSlideのヘルプ。
- 何を入力？ 質問欄に青枠、直下に「質問する」。
- 補助導線は？ 記事一覧、返信不要の意見、問い合わせフォームが見本内にある。

[375](screens/widget-preview-375.png)・[1024](screens/widget-preview-1024.png)・[1440](screens/widget-preview-1440.png)

### widget-receipt

問い合わせた利用者が製品内で受付を確認する。

- 番号は？ 375/1024/1440の順に#14/#13/#12。
- 返信先は？ reader@example.com。
- 何について？ 「領収書を発行したい」と提示された発行記事が残る。

[375](screens/widget-receipt-375.png)・[1024](screens/widget-receipt-1024.png)・[1440](screens/widget-receipt-1440.png)

### widget-suggestions

利用者が埋め込みヘルプの候補記事を評価する。

- 何に対する回答？ 「領収書を発行したい」という元の質問。
- 提案された記事は？ 「領収書を発行する」のリンク1件。
- 解決しない場合は？ 「解決しなかった」、質問欄、問い合わせフォームがある。

[375](screens/widget-suggestions-375.png)・[1024](screens/widget-suggestions-1024.png)・[1440](screens/widget-suggestions-1440.png)
