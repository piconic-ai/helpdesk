# 設定・拡張・メニューの独立画面レビュー

113状態の各375・1024・1440px、合計339枚を比較した。画面名は入力PNGの幅を除いたファイル名。3幅を同じ倍率で左から順に並べて確認し、重なり・間隔は元寸の画像でも確認した。質問への答えはその状態の表示に限る。静止画で観察できない送信の成否、キー操作、フォーカス復帰、速度は判定対象外とした。

## 指摘

高0件、中5件、低1件。同じ原因が複数の状態に現れるものは1件としている。

### 中1（375px）

- 根拠画像　extension-spam、menu-status-spam-48e45b08-bulk-assignee、menu-label-fd3f5651-bulk-assignee、menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3
- 実際　隔離中の#9は、製品・氏名、件名と時刻、番号・抜粋、空の担当者丸の4段。担当者丸は左下で1行分を占める。#3でも状態と担当者が抜粋の下へ移る。
- 期待　狭幅でも件名と抜粋を軸に2行にまとめ、時刻・担当者を右端に揃える。
- 基準　幅・揃え・会話を探す順位

### 中2（375px）

- 根拠画像　menu-label-fd3f5651-choice-menu-3、menu-label-fd3f5651-bulk-assignee
- 実際　#4の「別の返信で送信失敗」が薄赤の背景からはみ出し、右の吹き出し・件数と重なる。末尾は「請求」チップにも隠れる。選択中も同じ。
- 期待　送信失敗のラベル全体が読める領域を確保し、件数とラベルは別の位置に収める。
- 基準　文字・間隔・要対応の状態

### 中3（1024・1440px）

- 根拠画像　loop-rule-edit
- 実際　変更を保存のボタン下辺と、上へ・下への操作段の上辺が同じ高さ。「上へ」の背景が「変更を保存」の枠に接する。
- 期待　編集の保存・取り消しと並べ替え・削除の2群に間隔を置く。
- 基準　間隔・まとまり

### 中4（375・1024・1440px）

- 根拠画像　behavior-product-add、guide-auto-ack、guide-survey、extensions
- 実際　窓口の登録で自動送信を承認する説明は「受付の自動返信」「満足度アンケート」。拡張管理や設定の見出しは「自動受付返信」「解決アンケート」。満足度と解決の語意も異なる。
- 期待　同意を求める欄でも、実際に設定・確認する拡張と同じ機能名を使う。
- 基準　言葉・指針

### 中5（1024・1440px）

- 根拠画像　extension-auto-ack、extension-notify、extension-rules、extensions
- 実際　「答える」は3列目まで埋めた後「定型返信」だけが次段左端に残る。1024では「会話の統／合」など狭い題も生じる。
- 期待　4項目は2列×2行等でまとめ、同じ用途内でカードを孤立させず、見出しの領域を確保する。
- 基準　まとまり・幅

### 低1（375・1024・1440px）

- 根拠画像　account、extension-snooze
- 実際　プロフィールのファイル入力の選択ボタンと未選択文が英語。保留の日時欄には英語式の月日年が出る。周囲の説明は日本語。画像からはブラウザーの言語設定とアプリ自身の言語の寄与は区別できない。
- 期待　日本語利用時に入力の未選択や日付順を周囲の表示から理解できるようにする。
- 基準　言葉

## 状態別の画像記録

各項目の「観察」は3点以上。リンクは各幅の原寸画像。件数・現在値は撮影された状態ごとに異なる。

### 001　account

運営者が自分の表示名と画像を更新するために開く。

[375px](screens/account-375.png)　[1024px](screens/account-1024.png)　[1440px](screens/account-1440.png)

1. どのアカウントか？ 佐藤優、sato@example.com。
2. 変えられるものは？ 表示名とアイコン画像。
3. どう確定するか？ 「アカウントを保存」。

観察

- 緑の頭文字がアドレスの左に並ぶ。
- 選択ファイルの有無だけ英語で表示される。
- 375は縦1列、1024・1440は同じ幅のカードで保存と取り消しが隣接する。

### 002　behavior-label-add

運営者が分類名を新規登録するために開く。

[375px](screens/behavior-label-add-375.png)　[1024px](screens/behavior-label-add-1024.png)　[1440px](screens/behavior-label-add-1440.png)

1. どこに追加するか？ ラベル一覧。
2. 制約は？ ラベル名20字まで。
3. どう確定するか？ 「追加する」。

観察

- 右上の起点に青い枠がある。
- 入力と黒い確定を小窓にまとめている。
- 375は右端内に寄せ、1024・1440でも一覧の行を保つ。

### 003　behavior-label-delete

管理者が使用中のラベルを削除する前に影響を確かめるために開く。

[375px](screens/behavior-label-delete-375.png)　[1024px](screens/behavior-label-delete-1024.png)　[1440px](screens/behavior-label-delete-1440.png)

1. どれを消すか？ 「経理」。
2. 対象はいくつか？ 使用中の会話2件。
3. 会話自体はどうなるか？ 本文は各会話からラベルを外すと説明する。

観察

- 暗幕と白い中央ダイアログ。
- 赤い「削除」と白いキャンセルが離れている。
- 375でも説明と2ボタンが画面内、1024・1440でも対象名が読める。

### 004　behavior-label-merge

管理者が経理分類を別の分類へまとめるために開く。

[375px](screens/behavior-label-merge-375.png)　[1024px](screens/behavior-label-merge-1024.png)　[1440px](screens/behavior-label-merge-1440.png)

1. 元はどれか？ 「経理」。
2. 行き先は？ 「再発行」。
3. 範囲は？ 使用中の2件。

観察

- 元と先が本文で引用されている。
- 黒い確定は「別のラベルにまとめる」。
- 375・1024・1440とも背面の同じ一覧と中央の確認が区別できる。

### 005　behavior-label-rename

運営者が既存の経理ラベルを改名するために開く。

[375px](screens/behavior-label-rename-375.png)　[1024px](screens/behavior-label-rename-1024.png)　[1440px](screens/behavior-label-rename-1440.png)

1. どのラベルか？ 経理。
2. 何を入力するか？ 20字以内の新しい名前。
3. やめるには？ 「取り消し」。

観察

- 名前自身が起点で青枠。
- 「経理」が入力済み。
- 375でも入力と確定は枠内、1024・1440では名前の下に小窓。

### 006　behavior-label-swatches

運営者が経理ラベルの識別色を変えるために開く。

[375px](screens/behavior-label-swatches-375.png)　[1024px](screens/behavior-label-swatches-1024.png)　[1440px](screens/behavior-label-swatches-1440.png)

1. どの行か？ 経理。
2. 現在色は？ 下段右の灰色にチェック。
3. 候補はいくつか？ 2段4列の8色。

観察

- 行の小さな灰色点に青枠。
- チェックと背景で現色を示す。
- 375・1024・1440とも表の左側に収まる。

### 007　behavior-product-add

管理者が新しい製品の受付窓口を登録するために開く。

[375px](screens/behavior-product-add-375.png)　[1024px](screens/behavior-product-add-1024.png)　[1440px](screens/behavior-product-add-1440.png)

1. 必要な名称は？ プロダクト名。
2. 受信アドレスはどう指定するか？ 先頭部分と送信ドメイン。
3. 登録すると何に同意するか？ 新着通知、受付返信、完了時アンケートの自動送信。

観察

- 製品名と宛先の先頭が別欄。
- ドメインはexample.comの選択欄。
- 375は承認説明が長いが登録まで見え、1024・1440でも同内容が登録の直前に来る。

### 008　extension-articles

記事担当者が公開中の記事を探し、追加や改善を行うために開く。

[375px](screens/extension-articles-375.png)　[1024px](screens/extension-articles-1024.png)　[1440px](screens/extension-articles-1440.png)

1. 何件か？ 1件。
2. 公開されているのは？ 「領収書を発行する」。
3. 作成するには？ 「記事を書く」。

観察

- 候補0件が上部にある。
- 提示・閲覧とも0回で解決率は横線。
- 375で検索が1段を使い、1024・1440は3条件が横並び。

### 009　extension-auto-ack

管理者が拡張一覧で自動受付返信の稼働状況を調べるために開く。

[375px](screens/extension-auto-ack-375.png)　[1024px](screens/extension-auto-ack-1024.png)　[1440px](screens/extension-auto-ack-1440.png)

1. 何をするか？ 初回問い合わせへの自動受付。
2. 現在は？ スイッチの横に有効。
3. 文面を調べるには？ 同じカードの「設定」。

観察

- 隔離と自動受付が同じ受付グループ。
- 無効なフィードバックと有効な自動受付を文字で判別できる。
- 375は1列、1024・1440は3列で、1024の見出しは複数行。

### 010　extension-canned

担当者が返信用の定型文を会話に差し込むために開く。

[375px](screens/extension-canned-375.png)　[1024px](screens/extension-canned-1024.png)　[1440px](screens/extension-canned-1440.png)

1. どの会話か？ 領収書の宛名についての質問。
2. どの文か？ 「お問い合わせの受付」、山田花とSlideを含む。
3. すぐ相手に届くか？ 「定型文から下書きを作成」。

観察

- 定型文の名前と展開後の文が同じ枠。
- 未入力の送信操作は灰色。
- 375は起点の上、1024・1440は起点の下に候補を開く。

### 011　extension-chat

利用者がSlideのヘルプに質問するために開く。

[375px](screens/extension-chat-375.png)　[1024px](screens/extension-chat-1024.png)　[1440px](screens/extension-chat-1440.png)

1. 何を入力するか？ 困りごとを質問欄へ。
2. 最初に誰が調べるか？ 記事を自動で検索する。
3. 他の連絡手段は？ メールで問い合わせるリンク。

観察

- 製品のSマークとSlideの表記がある。
- テキストエリアと黒い「質問する」が一組。
- 375はほぼ全幅、1024・1440は画面中央の小幅の枠。

### 012　extension-export

管理者が個人情報の扱いを確認してデータを出力するために開く。

[375px](screens/extension-export-375.png)　[1024px](screens/extension-export-1024.png)　[1440px](screens/extension-export-1440.png)

1. 範囲は？ 全期間・全プロダクト。
2. 件数は？ 会話11件、メッセージ17件、操作履歴12件。
3. 既定の出力は？ 個人情報を伏せたJSON Lines。

観察

- 匿名化しても住所等の自由記述は残ると説明する。
- 権限は「問い合わせ本文の閲覧」。
- 375は説明が折り返し、1024・1440でフォームは同じ幅。

### 013　extension-feedback

運営者が受け取ったフィードバックを確認するために開く。

[375px](screens/extension-feedback-375.png)　[1024px](screens/extension-feedback-1024.png)　[1440px](screens/extension-feedback-1440.png)

1. 誰の声か？ 佐々木葵。
2. 次の対応は？ 確認済みにするか問い合わせに変更。
3. メモは誰に届くか？ 相手に送られない。

観察

- 黄地に内部メモと宛先制限を明記。
- 受付済みの状態が件名の下にある。
- 375はツールバーが複数段、1440は関連情報が右、1024は主内容1列。

### 014　extension-form

利用者がSlideへ問い合わせを送るために開く。

[375px](screens/extension-form-375.png)　[1024px](screens/extension-form-1024.png)　[1440px](screens/extension-form-1440.png)

1. どの製品か？ ページ上部にSlide。
2. 何が必要か？ 件名・内容・連絡先メールアドレスの全項目。
3. 送るには？ 最下段の黒い送信。

観察

- 各ラベルは入力欄の直上。
- 本文だけ複数行入力。
- 375も広い2幅も縦1列、広幅はフォーム幅を制限。

### 015　extension-issues

担当者が会話から公開するGitHub課題を起草するために開く。

[375px](screens/extension-issues-375.png)　[1024px](screens/extension-issues-1024.png)　[1440px](screens/extension-issues-1440.png)

1. 元の会話は？ #1 領収書の宛名。
2. 投稿先は？ example/helpdesk。
3. 何を公開するか？ タイトルと「公開する要約」を入れて起票内容を確認。

観察

- 関連付けた課題0件を表示。
- 投稿前に明示的な確認ボタン。
- 375は関連情報が全面、1024は右ドロワー、1440は会話と横並び。

### 016　extension-merge

担当者が同じ相手の会話をまとめるために開く。

[375px](screens/extension-merge-375.png)　[1024px](screens/extension-merge-1024.png)　[1440px](screens/extension-merge-1440.png)

1. 統合元は？ #1 領収書の宛名。
2. 選べる先は？ #2 ワークスペースの招待メール、候補1件。
3. どう確かめるか？ 「この会話を統合する内容を確認」。

観察

- 元と先に件名・番号がある。
- ボタン直下に選択小窓。
- 375・1024は関連情報のドロワー、1440は会話の右側に表示。

### 017　extension-metrics

運営者が一定期間の対応状況を評価するために開く。

[375px](screens/extension-metrics-375.png)　[1024px](screens/extension-metrics-1024.png)　[1440px](screens/extension-metrics-1440.png)

1. 期間は？ 過去30日。
2. 解決まで何日か？ 平均4日。
3. どの程度信頼できるか？ 解決5件未満のため目安、100%は対象1件。

観察

- 平均作業時間は「データなし」。
- 件数とその前期差・推移を併記。
- 375は縦積み、1024・1440は3枚・2枚・3枚の群で主値に左線。

### 018　extension-notify

管理者が新着通知がどこへ届くかを確かめるために開く。

[375px](screens/extension-notify-375.png)　[1024px](screens/extension-notify-1024.png)　[1440px](screens/extension-notify-1440.png)

1. 現在は？ 新着通知は有効。
2. 通知先は？ Slack。
3. 詳細に進むには？ 新着通知カードの設定。

観察

- 無効のアンケートとスイッチの位置を共有。
- 説明は新着と担当変更を通知すると明記。
- 375は1列、1024・1440は『答える』の定型返信だけが次の行に残る。

### 019　extension-presence

担当者が同じ会話を見ている人を確認するために開く。

[375px](screens/extension-presence-375.png)　[1024px](screens/extension-presence-1024.png)　[1440px](screens/extension-presence-1440.png)

1. 他に見ている人は？ いないと明記。
2. 他の会話は？ この相手のほかの問い合わせはない。
3. どこに出るか？ 「会話の関連情報」。

観察

- 2種類の空状態に別の見出し。
- 操作履歴は閉じた行。
- 375で閉じるボタン、1024で右ドロワー、1440で常時表示欄。

### 020　extension-rules

管理者が振り分けを設定できるか確認するために開く。

[375px](screens/extension-rules-375.png)　[1024px](screens/extension-rules-1024.png)　[1440px](screens/extension-rules-1440.png)

1. 現在有効か？ 振り分けルールは有効。
2. 保存されたルールは？ 0件。
3. 何を自動化できるか？ 件名や製品で担当者やラベルを決める。

観察

- 説明・件数・設定が同一カード。
- 新着通知は有効だが通知先が未設定と読める。
- 375で設定まで見え、1024・1440は同じ用途のカードが並ぶ。

### 021　extension-snooze

担当者が会話を指定日時まで保留するために開く。

[375px](screens/extension-snooze-375.png)　[1024px](screens/extension-snooze-1024.png)　[1440px](screens/extension-snooze-1440.png)

1. 今は保留中か？ 保留されていない。
2. 何時を指定するか？ 再表示日時、日本時間。
3. 次の操作は？ 「指定日時まで保留」。

観察

- その他の操作が青枠。
- 迷惑メール操作が保留操作の下に別ボタン。
- 375で小窓が画面右内に収まり、1024・1440でも同じ時刻欄がある。

### 022　extension-spam

担当者が隔離されたメールを点検するために開く。

[375px](screens/extension-spam-375.png)　[1024px](screens/extension-spam-1024.png)　[1440px](screens/extension-spam-1440.png)

1. 何件か？ 1件。
2. 何が対象か？ #9 未承諾の営業案内。
3. 誰からか？ Slideの山田花。

観察

- 検索・絞り込み・並び順がリストの上。
- 迷惑メールの解除可能な条件チップ。
- 375で件名と抜粋と空の担当者丸が縦に積み上がり、広い2幅は担当者丸が右端。

### 023　extension-survey

利用者が問い合わせの解決状況を回答するために開く。

[375px](screens/extension-survey-375.png)　[1024px](screens/extension-survey-1024.png)　[1440px](screens/extension-survey-1440.png)

1. どの問い合わせか？ #8。
2. 選択肢は？ はい／いいえ。
3. 選択の結果は？ 選んだ回答を送信する。

観察

- Slideと製品マークが上にある。
- 二択は同じ強さでいずれも既定に見えない。
- 375・1024・1440で両ボタンは横並びのまま。

### 024　extensions

管理者が拡張機能を探して有効状態を管理するために開く。

[375px](screens/extensions-375.png)　[1024px](screens/extensions-1024.png)　[1440px](screens/extensions-1440.png)

1. いくつ有効か？ 16件。
2. 探す手段は？ 検索と有効状態の絞り込み。
3. どう変更するか？ 各見出しの横に有効スイッチ。

観察

- 「受け付ける」「答える」の用途で分かれる。
- カード内に個別の設定入口。
- 375で単列、1024・1440で3列、『答える』の4枚は3＋1。

### 025　guide-articles

管理者が製品サイトに記事を公開するために開く。

[375px](screens/guide-articles-375.png)　[1024px](screens/guide-articles-1024.png)　[1440px](screens/guide-articles-1440.png)

1. 何を開けるか？ 記事の管理とヘルプページ。
2. 対象製品は？ DeskとSlide。
3. どう埋め込むか？ 製品別のコードをコピー。

観察

- URLとコードが段を分けて並ぶ。
- 先頭のDeskカードだけで複数行のコードが表示される。
- 375では2製品目の設定が初画面下に続き、広い2幅でも2枚目のコードは下端。

### 026　guide-auto-ack

管理者が自動で送られる受付メールを検査するために開く。

[375px](screens/guide-auto-ack-375.png)　[1024px](screens/guide-auto-ack-1024.png)　[1440px](screens/guide-auto-ack-1440.png)

1. 対象は？ 全製品の初回メール。
2. 誰が有効にしたか？ 佐藤優、11月4日14時。
3. Deskの文面は？ 自動受付であることと返信で追記できる旨。

観察

- 承認者と日時が同じ枠。
- 件名の番号が表示例と明記。
- 375では文例まで、広い2幅では文面編集の入口も見える。

### 027　guide-canned

返信担当者が定型文を探し追加するために開く。

[375px](screens/guide-canned-375.png)　[1024px](screens/guide-canned-1024.png)　[1440px](screens/guide-canned-1440.png)

1. 登録数は？ 1件。
2. 登録済みは？ お問い合わせの受付。
3. 新規に必要なものは？ 表示名と本文。

観察

- 検索と順序を一覧の上に配置。
- 名前と製品の差し込み記法を入力補助に表示。
- 375は既存行を縦に読み、広い2幅では名前・本文・編集が同じ行。

### 028　guide-chat

管理者が製品ごとのヘルプチャット受付を設定するために開く。

[375px](screens/guide-chat-375.png)　[1024px](screens/guide-chat-1024.png)　[1440px](screens/guide-chat-1440.png)

1. Deskで何ができるか？ このサイトで受付を開始。
2. Slideで変えられるものは？ 埋め込み先と返信の目安。
3. 動作確認は？ ヘルプチャットを開く。

観察

- 製品ごとのカードが縦に連続。
- Slide内で登録・保存と各取り消しが繰り返す。
- 375ではSlide設定の途中まで、広い2幅でも埋め込みコードまで縦に長い。

### 029　guide-export

管理者が書き出す情報の範囲を把握するために開く。

[375px](screens/guide-export-375.png)　[1024px](screens/guide-export-1024.png)　[1440px](screens/guide-export-1440.png)

1. 対象は？ 全期間の全製品。
2. 伏せる対象は？ メールアドレスと登録した相手の名前。
3. 実行手段は？ JSON Linesを書き出す。

観察

- 11会話・17メッセージ・12履歴を表示。
- 自由記述が残るという説明が選択の前。
- 375・1024・1440とも権限カードが出力カードの次。

### 030　guide-feedback

管理者が利用者の声を受け付ける窓口を準備するために開く。

[375px](screens/guide-feedback-375.png)　[1024px](screens/guide-feedback-1024.png)　[1440px](screens/guide-feedback-1440.png)

1. 届いた声はどこか？ フィードバックの受信箱。
2. Deskの状態は？ 受付開始ボタン。
3. Slideの状態は？ フィードバックを開くボタンと埋め込みコード。

観察

- 各製品の印と名称がカード上端。
- 本文で送信から受信確認まで説明。
- 375は先行カードを過ぎてコードが現れ、広い2幅ではコピー操作まで見える。

### 031　guide-form

管理者が問い合わせフォームを接続し受付を試すために開く。

[375px](screens/guide-form-375.png)　[1024px](screens/guide-form-1024.png)　[1440px](screens/guide-form-1440.png)

1. 最初に何をするか？ 製品の受付を開始。
2. どこで試すか？ 公開フォームを開く。
3. 結果はどこか？ Slideの受信箱。

観察

- 未設定Deskに受付開始がある。
- Slideにはコードと返信目安の入力を同じ枠に表示。
- 375・1024・1440とも製品が縦順で、375ではコードが画面下に続く。

### 032　guide-issues

管理者が会話を課題化する投稿先を設定するために開く。

[375px](screens/guide-issues-375.png)　[1024px](screens/guide-issues-1024.png)　[1440px](screens/guide-issues-1440.png)

1. 接続状況は？ GitHubの接続用トークンは設定済み。
2. どこへ投稿するか？ Slideはexample/helpdesk。
3. Deskに何が必要か？ GitHubリポジトリの登録。

観察

- 登録と更新が製品の状態で異なる動詞。
- 下に接続の設定手順と権限。
- 375・1024・1440で同じ2製品を縦に比較。

### 033　guide-merge

担当者が会話の統合手順を調べるために開く。

[375px](screens/guide-merge-375.png)　[1024px](screens/guide-merge-1024.png)　[1440px](screens/guide-merge-1440.png)

1. 条件は？ 同じ相手・同じ窓口。
2. 移るものは？ 開いている会話のメッセージ。
3. どこで始めるか？ 受信箱で会話を選ぶ。

観察

- 「関連情報」を開くと説明。
- 追加権限なしを独立表示。
- 375は入口が横幅いっぱい、1024・1440はラベル幅のボタン。

### 034　guide-metrics

管理者が集計の使い方を調べるために開く。

[375px](screens/guide-metrics-375.png)　[1024px](screens/guide-metrics-1024.png)　[1440px](screens/guide-metrics-1440.png)

1. 何で絞るか？ プロダクトと期間。
2. 何を比較するか？ 問い合わせ完了の前後の指標。
3. 入口は？ 集計画面を開く。

観察

- 説明→入口→権限の順。
- 追加の権限なし。
- 375の広い入口と1024・1440の短い入口が同じ文言。

### 035　guide-notify

管理者が新着通知の接続先と権限を調べるために開く。

[375px](screens/guide-notify-375.png)　[1024px](screens/guide-notify-1024.png)　[1440px](screens/guide-notify-1440.png)

1. 通知先は？ Slack。
2. 手順はどこか？ 「接続の設定手順」。
3. 権限は？ 外部接続、本文閲覧、メール送信。

観察

- 手順が閉じており現在値が上。
- 権限群は1枚のカード。
- 375は権限が折り返し、1024・1440は同じ行。

### 036　guide-presence

担当者が同じ会話を見ている人の確認方法を調べるために開く。

[375px](screens/guide-presence-375.png)　[1024px](screens/guide-presence-1024.png)　[1440px](screens/guide-presence-1440.png)

1. 何が分かるか？ 名前と閲覧中・入力中。
2. どこに出るか？ 返信欄と関連情報。
3. 始めるには？ 受信箱で会話を選ぶ。

観察

- 一人のときの表示を事前に説明。
- 追加権限なし。
- 375は説明が4行以上、広い2幅は読める範囲に幅を制限。

### 037　guide-rules

管理者が振り分けルールを初めて登録するために開く。

[375px](screens/guide-rules-375.png)　[1024px](screens/guide-rules-1024.png)　[1440px](screens/guide-rules-1440.png)

1. 現在は？ 保存済み0件。
2. どんな条件か？ 製品、件名に含む言葉。
3. どの処理を設定するか？ ラベルまたは担当者。

観察

- 空欄なら全件に適用を明記。
- 保存と取り消しは同じ位置。
- 375は単列で保存まで、1024・1440では下の権限欄も見える。

### 038　guide-snooze

担当者が保留と復帰の流れを調べるために開く。

[375px](screens/guide-snooze-375.png)　[1024px](screens/guide-snooze-1024.png)　[1440px](screens/guide-snooze-1440.png)

1. どこで指定するか？ 会話の「その他の操作」。
2. 期限には？ 受信箱に戻る。
3. 期限前に戻すには？ 同じ会話の「保留を解除」。

観察

- 日本時間で日時指定すると説明。
- 受信箱への入口がすぐ下。
- 375・1024・1440とも説明、入口、権限の順。

### 039　guide-spam

担当者が誤隔離された問い合わせの解除方法を調べるために開く。

[375px](screens/guide-spam-375.png)　[1024px](screens/guide-spam-1024.png)　[1440px](screens/guide-spam-1440.png)

1. 何を開くか？ 隔離された会話。
2. どう戻すか？ 会話の操作から迷惑メールを解除。
3. 入口は？ 「迷惑メールを開く」。

観察

- 隔離の仕組みと解除の次手を結ぶ。
- 追加権限なし。
- 375はボタンが本文幅、1024・1440はラベル幅。

### 040　guide-survey

管理者が完了後の解決アンケート文面を確認するために開く。

[375px](screens/guide-survey-375.png)　[1024px](screens/guide-survey-1024.png)　[1440px](screens/guide-survey-1440.png)

1. いつ送るか？ 問い合わせ完了時。
2. 有効化した人は？ 佐藤優。
3. 受け手は何を見るか？ 自動フォローアップの件名・質問と回答リンク。

観察

- 全プロダクトについて承認と表示。
- 回答先は送信ごとに発行と明記。
- 375はURLが折り返し、広い2幅では例と編集欄の入口が見える。

### 041　label-colors

運営者が既存の分類と使われ方を確認するために開く。

[375px](screens/label-colors-375.png)　[1024px](screens/label-colors-1024.png)　[1440px](screens/label-colors-1440.png)

1. 何が並ぶか？ 再発行から領収書まで6種。
2. 何件に付くか？ 経理・請求は各2件。
3. 追加は？ 右上の「ラベルを追加」。

観察

- 色点と名前が左の同じ列。
- 会話数は右寄せ。
- 375では長い名前が省略、1024・1440で全名表示。

### 042　loop-account-menu

担当者が画面操作のショートカットを調べるために開く。

[375px](screens/loop-account-menu-375.png)　[1024px](screens/loop-account-menu-1024.png)　[1440px](screens/loop-account-menu-1440.png)

1. どのアカウントか？ 佐藤優。
2. 何が開いているか？ 名前右端の三点メニュー。
3. 行き先は？ 「キーボード操作 ?」。

観察

- 起点の三点に青枠。
- メニューが起点より上。
- 375ではドロワー越しに受信箱、1024・1440ではサイドバーの右へ展開。

### 043　loop-label-new

担当者が会話に新しいラベルを作って付けるために開く。

[375px](screens/loop-label-new-375.png)　[1024px](screens/loop-label-new-1024.png)　[1440px](screens/loop-label-new-1440.png)

1. 何が付いているか？ 経理・請求・領収書。
2. 新しい名前は？ 契約更新。
3. 確定は？ 「作成して付ける」。

観察

- 選択済みをチェックと灰地で識別。
- 新規の入力に青枠。
- 375では最下部の管理入口が画面端にかかり、広い2幅で全候補が見える。

### 044　loop-mailbox-add

管理者が既存製品Slideに受信先を増やすために開く。

[375px](screens/loop-mailbox-add-375.png)　[1024px](screens/loop-mailbox-add-1024.png)　[1440px](screens/loop-mailbox-add-1440.png)

1. 既存窓口は？ support@example.com。
2. 新規はどう指定するか？ 先頭とドメイン。
3. 確定は？ 「窓口を追加」。

観察

- 差出人設定と登録済み窓口が別カード。
- 追加の詳細が展開済み。
- 375では追加まで縦1列、広い2幅は固定幅の入力。

### 045　loop-operator-edit

管理者が運営者のプロフィールや権限を編集するために開く。

[375px](screens/loop-operator-edit-375.png)　[1024px](screens/loop-operator-edit-1024.png)　[1440px](screens/loop-operator-edit-1440.png)

1. 対象者は？ 佐藤優。
2. 今の権限は？ 管理者。
3. なぜ変更できないか？ 最後の管理者で、先に他の人を管理者にする必要。

観察

- 名前は入力済み。
- 森直子の担当者行は閉じたまま。
- 375では編集が下段、1024・1440は通常行の右端から展開。

### 046　loop-rule-delete

管理者がルール削除の対象条件を確認するために開く。

[375px](screens/loop-rule-delete-375.png)　[1024px](screens/loop-rule-delete-1024.png)　[1440px](screens/loop-rule-delete-1440.png)

1. 何番目か？ 1番目。
2. 何を削除するか？ 全製品・件名「領収書」・ラベル「請求」。
3. 取りやめられるか？ キャンセルあり。

観察

- 暗幕と赤い削除ボタン。
- 対象条件を確認本文に再掲。
- 3幅とも小窓内に対象と両ボタンが収まる。

### 047　loop-rule-edit

管理者が登録済みルールを編集するために開く。

[375px](screens/loop-rule-edit-375.png)　[1024px](screens/loop-rule-edit-1024.png)　[1440px](screens/loop-rule-edit-1440.png)

1. 対象は？ 1番目の領収書ルール。
2. 何を付けるか？ 請求。
3. 誰に割り振るか？ 担当者は「変更しない」。

観察

- 編集部分を薄い背景で展開。
- 1件なので上下への移動は灰色。
- 1024・1440で保存と並べ替えの2段のボタンが縦に接する。375では確定欄は画面下。

### 048　mailboxes

管理者が製品と受付先の対応を確認するために開く。

[375px](screens/mailboxes-375.png)　[1024px](screens/mailboxes-1024.png)　[1440px](screens/mailboxes-1440.png)

1. 登録製品は？ DeskとSlide。
2. 各窓口は？ desk@example.com、support@example.com。
3. 新規登録は？ プロダクトを追加。

観察

- 製品の印・名称・窓口を同じ行。
- 2行の区切りは細線。
- 3幅とも窓口は1行、375でも追加が見出しの右。

### 049　menu-dev-ui-gallery-list-menu

開発者が部品見本の一覧操作を確認するために開く。

[375px](screens/menu-dev-ui-gallery-list-menu-375.png)　[1024px](screens/menu-dev-ui-gallery-list-menu-1024.png)　[1440px](screens/menu-dev-ui-gallery-list-menu-1440.png)

1. 見本はどの画面か？ 受信箱2件。
2. 開いているものは？ 一覧の操作。
3. 何を確認できるか？ 読み込み中・空の一覧。

観察

- 起点と候補に青枠。
- 一覧・詳細・編集などへの移動が上部。
- 375では検索より上に小窓が重なり、広い2幅では右上に展開。

### 050　menu-extensions-auto-ack-choice-menu-0

管理者が自動受付文面の対象製品を選ぶために開く。

[375px](screens/menu-extensions-auto-ack-choice-menu-0-375.png)　[1024px](screens/menu-extensions-auto-ack-choice-menu-0-1024.png)　[1440px](screens/menu-extensions-auto-ack-choice-menu-0-1440.png)

1. 今の製品は？ Deskにチェック。
2. ほかに選べるものは？ Slide。
3. 選択が変えるものは？ 下にある製品の送信文面。

観察

- 起点が青枠。
- 選択肢は製品マークと名前。
- 3幅とも2項目が起点下に収まる。

### 051　menu-extensions-canned-choice-menu-0

担当者が登録済み定型文の順序を変更するために開く。

[375px](screens/menu-extensions-canned-choice-menu-0-375.png)　[1024px](screens/menu-extensions-canned-choice-menu-0-1024.png)　[1440px](screens/menu-extensions-canned-choice-menu-0-1440.png)

1. 今の順序は？ 標準の順序。
2. 代替は？ 名前順。
3. 何を並べるか？ 保存済みの定型文1件。

観察

- チェックとフォーカス枠が別の目印。
- 検索はメニューの外。
- 375は検索下、1024・1440は検索右の起点下に展開。

### 052　menu-extensions-issues-link-1-operation-articles-articles.suggest

担当者が会話をもとに記事候補を残すために開く。

[375px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-1440.png)

1. 元は？ #1 領収書の宛名。
2. 何を入力するか？ 記事にする内容。
3. 結果は？ 記事の候補に追加。

観察

- 入力に青枠。
- 課題操作のカードとは見出しが別。
- 375はほぼ全面、1024はドロワー、1440は右欄で同じ入力。

### 053　menu-extensions-issues-link-1-operation-issues-issues.preview

担当者が会話から課題の公開案を起草するために開く。

[375px](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-375.png)　[1024px](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-1440.png)

1. 元は？ #1 領収書の宛名。
2. 投稿先は？ example/helpdesk。
3. 次は？ 起票内容を確認。

観察

- タイトルがフォーカス中。
- 「公開する要約」と明記。
- 375と1440は起点上にフォーム、1024は起点下。どの幅でも下書きと確認操作が可視。

### 054　menu-extensions-issues-link-1-operation-merge-merge.combine

担当者が会話の統合先を選ぶために開く。

[375px](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-375.png)　[1024px](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-1024.png)　[1440px](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-1440.png)

1. 元は？ #1 領収書の宛名。
2. 先は？ #2 ワークスペースの招待メール。
3. 何を押すか？ この会話を統合する内容を確認。

観察

- プルダウンに青い輪郭。
- 記事とGitHub課題は別見出し。
- 375・1024は関連情報が前面、1440はスレッドと並べて選べる。

### 055　menu-extensions-issues-link-1-reply-templates

担当者が返信の定型文を展開するために開く。

[375px](screens/menu-extensions-issues-link-1-reply-templates-375.png)　[1024px](screens/menu-extensions-issues-link-1-reply-templates-1024.png)　[1440px](screens/menu-extensions-issues-link-1-reply-templates-1440.png)

1. どの候補か？ お問い合わせの受付。
2. どんな文になるか？ 山田花とSlideを埋め込んだ英文。
3. 次の操作は？ 定型文から下書きを作成。

観察

- ラジオの選択と起点が可視。
- 送信と送信して完了は灰色。
- 375は上に、1024・1440は下に開く。

### 056　menu-extensions-rules-choice-menu-0

管理者が新規ルールの適用製品を選ぶために開く。

[375px](screens/menu-extensions-rules-choice-menu-0-375.png)　[1024px](screens/menu-extensions-rules-choice-menu-0-1024.png)　[1440px](screens/menu-extensions-rules-choice-menu-0-1440.png)

1. 初期値は？ すべてのプロダクトに適用。
2. 個別対象は？ DeskとSlide。
3. どのルールか？ 保存済み0件の新規ルール。

観察

- 全製品にチェック。
- 個別候補にブランドの印。
- 3幅とも同じ操作の直下に候補が並ぶ。

### 057　menu-extensions-rules-choice-menu-1

管理者が振り分けで付ける分類を選ぶために開く。

[375px](screens/menu-extensions-rules-choice-menu-1-375.png)　[1024px](screens/menu-extensions-rules-choice-menu-1-1024.png)　[1440px](screens/menu-extensions-rules-choice-menu-1-1440.png)

1. 現在は？ 付けない。
2. 候補は？ 再発行・社内確認・経理・請求など6種。
3. 不足時の入口は？ 「ラベルを管理」。

観察

- 候補の色点に名前を併記。
- 先頭の「付けない」がチェック付き。
- 375は上、1024・1440は下に全候補を表示。

### 058　menu-extensions-survey-choice-menu-0

管理者がアンケートメールの製品別文面を切り替えるために開く。

[375px](screens/menu-extensions-survey-choice-menu-0-375.png)　[1024px](screens/menu-extensions-survey-choice-menu-0-1024.png)　[1440px](screens/menu-extensions-survey-choice-menu-0-1440.png)

1. 今は？ Desk。
2. ほかには？ Slide。
3. 何が切り替わるか？ 件名と回答リンクを含む送信文面。

観察

- 製品マークが入口にも候補にもある。
- 全製品の承認と個別の表示製品を別の群で表示。
- 3幅とも候補が下に現れ、現在のチェックが読める。

### 059　menu-home-account-menu

担当者が受信箱からキーボード操作案内を開くために開く。

[375px](screens/menu-home-account-menu-375.png)　[1024px](screens/menu-home-account-menu-1024.png)　[1440px](screens/menu-home-account-menu-1440.png)

1. 起点は？ サイドバー下の三点。
2. 誰のメニューか？ 佐藤優。
3. 選べる項目は？ キーボード操作。

観察

- フォーカスが項目に見える。
- 名前と三点は隣接。
- 375はナビゲーションドロワー、広い2幅は固定サイドバーの足元。

### 060　menu-home-bulk-label

担当者が未対応を一括分類するために開く。

[375px](screens/menu-home-bulk-label-375.png)　[1024px](screens/menu-home-bulk-label-1024.png)　[1440px](screens/menu-home-bulk-label-1440.png)

1. 範囲は？ 7件を選択中。
2. 候補は？ 色点付きの6ラベル。
3. 現在の付与状況は？ 各候補の先頭に部分適用の横棒。

観察

- 行が青い背景に変わる。
- 選択解除が件数の隣。
- 375は一括操作が縦に折り返し、広い2幅は1列。

### 061　menu-home-product-switcher

担当者が受信箱の製品範囲を切り替えるために開く。

[375px](screens/menu-home-product-switcher-375.png)　[1024px](screens/menu-home-product-switcher-1024.png)　[1440px](screens/menu-home-product-switcher-1440.png)

1. 現在は？ すべてのプロダクト。
2. 候補は？ DeskとSlide。
3. いま対象は何件か？ 未対応7件。

観察

- 全製品にチェック。
- 異なる製品マーク。
- 375はドロワー最上部、1024・1440は固定ナビの上部。

### 062　menu-label-fd3f5651-bulk-assignee

担当者が請求ラベルの未対応2件の担当をまとめて指定するために開く。

[375px](screens/menu-label-fd3f5651-bulk-assignee-375.png)　[1024px](screens/menu-label-fd3f5651-bulk-assignee-1024.png)　[1440px](screens/menu-label-fd3f5651-bulk-assignee-1440.png)

1. 対象は？ 未対応2件を選択中。
2. 担当候補は？ 佐藤優と森直子。
3. どの行か？ #4 月額プランの明細と#1 領収書の宛名。

観察

- チェック付きの行が薄青。
- 候補に名前と別色の頭文字。現在はどちらにもチェックがない。
- 375は操作列が複数段、1024・1440は選択数の右側で担当を選ぶ。

### 063　menu-label-fd3f5651-bulk-label

担当者が請求ラベルの未対応2件のラベルをまとめて指定するために開く。

[375px](screens/menu-label-fd3f5651-bulk-label-375.png)　[1024px](screens/menu-label-fd3f5651-bulk-label-1024.png)　[1440px](screens/menu-label-fd3f5651-bulk-label-1440.png)

1. 対象は？ 未対応2件を選択中。
2. 何を付けられるか？ 再発行から領収書まで6種。
3. 現在の付与状況は？ 請求がチェック、経理・領収書が横棒。

観察

- 対象会話を青い背景で区別。
- 「ラベルを管理」が選択肢の下。
- 375は右端近くまで候補が広がり、1024・1440は一括ツールバーの下。

### 064　menu-label-fd3f5651-choice-menu-0

担当者が請求ラベルの未対応2件の表示状態を絞り込むために開く。

[375px](screens/menu-label-fd3f5651-choice-menu-0-375.png)　[1024px](screens/menu-label-fd3f5651-choice-menu-0-1024.png)　[1440px](screens/menu-label-fd3f5651-choice-menu-0-1440.png)

1. いまの状態は？ 未対応。
2. 候補は？ 未対応・返信待ち・完了・迷惑メール・すべて。
3. どの集合にかかるか？ 未対応2件。

観察

- 現在値にチェック、先頭の未対応にフォーカス。
- 状態名に対応する識別アイコン。
- 375は検索下の絞り込み、1024・1440は検索右側から展開。

### 065　menu-label-fd3f5651-choice-menu-1

担当者が請求ラベルの未対応2件の製品フィルターを選ぶために開く。

[375px](screens/menu-label-fd3f5651-choice-menu-1-375.png)　[1024px](screens/menu-label-fd3f5651-choice-menu-1-1024.png)　[1440px](screens/menu-label-fd3f5651-choice-menu-1-1440.png)

1. いまの製品は？ すべて。
2. 個別製品は？ DeskとSlide。
3. 表示中は？ 未対応2件。

観察

- 現在製品にチェック。
- 製品固有のマークが名称の隣。
- 3幅とも絞り込みの上に候補が重なり、入力列から起点を特定できる。

### 066　menu-label-fd3f5651-choice-menu-2

担当者が請求ラベルの未対応2件のラベル条件を切り替えるために開く。

[375px](screens/menu-label-fd3f5651-choice-menu-2-375.png)　[1024px](screens/menu-label-fd3f5651-choice-menu-2-1024.png)　[1440px](screens/menu-label-fd3f5651-choice-menu-2-1440.png)

1. いまの条件は？ 請求。
2. 候補はいくつか？ 全件と6種のラベル。
3. 管理に進むには？ 最下部の「ラベルを管理」。

観察

- 現値にチェックがある。
- 先頭のすべてに青いフォーカス枠。
- 375で一覧は起点の上、1024・1440は下に開く。

### 067　menu-label-fd3f5651-choice-menu-3

担当者が請求ラベルの未対応2件の表示順を確かめるために開く。

[375px](screens/menu-label-fd3f5651-choice-menu-3-375.png)　[1024px](screens/menu-label-fd3f5651-choice-menu-3-1024.png)　[1440px](screens/menu-label-fd3f5651-choice-menu-3-1440.png)

1. 対象は？ 未対応2件。
2. 現在の順序は？ 待たせている順。
3. ほかには？ 新しい順。

観察

- 選択条件を示すチップが検索の下。
- 待たせている順にチェック。
- 375は検索下のボタン、1024・1440は検索右端のボタンから2択。

### 068　menu-label-fd3f5651-filter-assignee

担当者が請求ラベルの未対応2件の担当者条件を切り替えるために開く。

[375px](screens/menu-label-fd3f5651-filter-assignee-375.png)　[1024px](screens/menu-label-fd3f5651-filter-assignee-1024.png)　[1440px](screens/menu-label-fd3f5651-filter-assignee-1440.png)

1. 現在の条件は？ すべて。
2. 候補者は？ 佐藤優と森直子。
3. 条件を外すには？ すべてを選ぶ。

観察

- 候補の頭文字と氏名を併記。
- 現在値にチェック。
- 375は絞り込み枠の左側、1024・1440は検索右下に同じ親子メニュー。

### 069　menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee

担当者がDeskで佐藤優が担当する1件の担当をまとめて指定するために開く。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-1440.png)

1. 対象は？ 自分の担当1件を選択中。
2. 担当候補は？ 佐藤優と森直子。
3. どの行か？ #3 更新前に請求書の送付先を確認したい。

観察

- チェック付きの行が薄青。
- 候補に名前と別色の頭文字。佐藤優にチェック。
- 375は操作列が複数段、1024・1440は選択数の右側で担当を選ぶ。

### 070　menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label

担当者がDeskで佐藤優が担当する1件のラベルをまとめて指定するために開く。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-1440.png)

1. 対象は？ 自分の担当1件を選択中。
2. 何を付けられるか？ 再発行から領収書まで6種。
3. 現在の付与状況は？ 6候補にチェックはない。

観察

- 対象会話を青い背景で区別。
- 「ラベルを管理」が選択肢の下。
- 375は右端近くまで候補が広がり、1024・1440は一括ツールバーの下。

### 071　menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0

担当者がDeskで佐藤優が担当する1件の表示状態を絞り込むために開く。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-1440.png)

1. いまの状態は？ すべて。
2. 候補は？ 未対応・返信待ち・完了・迷惑メール・すべて。
3. どの集合にかかるか？ 自分の担当1件。

観察

- 現在値にチェック、先頭の未対応にフォーカス。
- 状態名に対応する識別アイコン。
- 375は検索下の絞り込み、1024・1440は検索右側から展開。

### 072　menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1

担当者がDeskで佐藤優が担当する1件の製品フィルターを選ぶために開く。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-1440.png)

1. いまの製品は？ Desk。
2. 個別製品は？ DeskとSlide。
3. 表示中は？ 自分の担当1件。

観察

- 現在製品にチェック。
- 製品固有のマークが名称の隣。
- 3幅とも絞り込みの上に候補が重なり、入力列から起点を特定できる。

### 073　menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2

担当者がDeskで佐藤優が担当する1件のラベル条件を切り替えるために開く。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-1440.png)

1. いまの条件は？ すべてのラベル。
2. 候補はいくつか？ 全件と6種のラベル。
3. 管理に進むには？ 最下部の「ラベルを管理」。

観察

- 現値にチェックがある。
- 先頭のすべてに青いフォーカス枠。
- 375で一覧は起点の上、1024・1440は下に開く。

### 074　menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3

担当者がDeskで佐藤優が担当する1件の表示順を確かめるために開く。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-1440.png)

1. 対象は？ 自分の担当1件。
2. 現在の順序は？ 待たせている順。
3. ほかには？ 新しい順。

観察

- 選択条件を示すチップが検索の下。
- 待たせている順にチェック。
- 375は検索下のボタン、1024・1440は検索右端のボタンから2択。

### 075　menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee

担当者がDeskで佐藤優が担当する1件の担当者条件を切り替えるために開く。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-1440.png)

1. 現在の条件は？ 佐藤優。
2. 候補者は？ 佐藤優と森直子。
3. 条件を外すには？ すべてを選ぶ。

観察

- 候補の頭文字と氏名を併記。
- 現在値にチェック。
- 375は絞り込み枠の左側、1024・1440は検索右下に同じ親子メニュー。

### 076　menu-settings-labels-add-label

運営者が分類一覧から新規の名前を入れるために開く。

[375px](screens/menu-settings-labels-add-label-375.png)　[1024px](screens/menu-settings-labels-add-label-1024.png)　[1440px](screens/menu-settings-labels-add-label-1440.png)

1. どの一覧か？ ラベル6種。
2. 何を入力するか？ 新しいラベル名、20字まで。
3. 確定は？ 「追加する」。

観察

- 空の入力に青枠。
- 追加の起点が一覧右上。
- 375で確定ボタンが小窓幅に広がり、広い2幅では文字に合う幅。

### 077　menu-settings-labels-label-actions-0

運営者が「再発行」の統合先または削除を選ぶために開く。

[375px](screens/menu-settings-labels-label-actions-0-375.png)　[1024px](screens/menu-settings-labels-label-actions-0-1024.png)　[1440px](screens/menu-settings-labels-label-actions-0-1440.png)

1. 対象は？ 再発行。
2. 現在の統合先は？ 社内確認。
3. 他の操作は？ 削除。

観察

- 1行目の操作に青い枠、会話数1件。
- メニューの先頭にも対象名を示す。
- 375では右に収めてボタンを縦並び、1024は左側に寄せ、1440は起点下に展開。

### 078　menu-settings-labels-label-actions-1

運営者が「社内確認」の統合先または削除を選ぶために開く。

[375px](screens/menu-settings-labels-label-actions-1-375.png)　[1024px](screens/menu-settings-labels-label-actions-1-1024.png)　[1440px](screens/menu-settings-labels-label-actions-1-1440.png)

1. 対象は？ 社内確認。
2. 現在の統合先は？ 再発行。
3. 他の操作は？ 削除。

観察

- 2行目の操作に青い枠、会話数1件。
- メニューの先頭にも対象名を示す。
- 375では右に収めてボタンを縦並び、1024は左側に寄せ、1440は起点下に展開。

### 079　menu-settings-labels-label-actions-2

運営者が「経理」の統合先または削除を選ぶために開く。

[375px](screens/menu-settings-labels-label-actions-2-375.png)　[1024px](screens/menu-settings-labels-label-actions-2-1024.png)　[1440px](screens/menu-settings-labels-label-actions-2-1440.png)

1. 対象は？ 経理。
2. 現在の統合先は？ 再発行。
3. 他の操作は？ 削除。

観察

- 3行目の操作に青い枠、会話数2件。
- メニューの先頭にも対象名を示す。
- 375では右に収めてボタンを縦並び、1024は左側に寄せ、1440は起点下に展開。

### 080　menu-settings-labels-label-actions-3

運営者が「請求」の統合先または削除を選ぶために開く。

[375px](screens/menu-settings-labels-label-actions-3-375.png)　[1024px](screens/menu-settings-labels-label-actions-3-1024.png)　[1440px](screens/menu-settings-labels-label-actions-3-1440.png)

1. 対象は？ 請求。
2. 現在の統合先は？ 再発行。
3. 他の操作は？ 削除。

観察

- 4行目の操作に青い枠、会話数2件。
- メニューの先頭にも対象名を示す。
- 375では右に収めてボタンを縦並び、1024は左側に寄せ、1440は起点下に展開。

### 081　menu-settings-labels-label-actions-4

運営者が「長期契約の更新手続きについて」の統合先または削除を選ぶために開く。

[375px](screens/menu-settings-labels-label-actions-4-375.png)　[1024px](screens/menu-settings-labels-label-actions-4-1024.png)　[1440px](screens/menu-settings-labels-label-actions-4-1440.png)

1. 対象は？ 長期契約の更新手続きについて。
2. 現在の統合先は？ 再発行。
3. 他の操作は？ 削除。

観察

- 5行目の操作に青い枠、会話数1件。
- メニューの先頭にも対象名を示す。
- 375では右に収めてボタンを縦並び、1024は左側に寄せ、1440は起点下に展開。

### 082　menu-settings-labels-label-actions-5

運営者が「領収書」の統合先または削除を選ぶために開く。

[375px](screens/menu-settings-labels-label-actions-5-375.png)　[1024px](screens/menu-settings-labels-label-actions-5-1024.png)　[1440px](screens/menu-settings-labels-label-actions-5-1440.png)

1. 対象は？ 領収書。
2. 現在の統合先は？ 再発行。
3. 他の操作は？ 削除。

観察

- 6行目の操作に青い枠、会話数1件。
- メニューの先頭にも対象名を示す。
- 375では右に収めてボタンを縦並び、1024は左側に寄せ、1440は起点下に展開。

### 083　menu-settings-labels-label-color-0

運営者が「再発行」の色を確認・変更するために開く。

[375px](screens/menu-settings-labels-label-color-0-375.png)　[1024px](screens/menu-settings-labels-label-color-0-1024.png)　[1440px](screens/menu-settings-labels-label-color-0-1440.png)

1. 対象は？ 再発行。
2. 今の色は？ 茶色。
3. どう判別するか？ 下段3番目にチェック。

観察

- 1行目の色点に青枠。
- 8色は4列2段、先頭の紺にフォーカス。
- 3幅とも色見本は行の色点の下で、件数・操作は右側に残る。

### 084　menu-settings-labels-label-color-1

運営者が「社内確認」の色を確認・変更するために開く。

[375px](screens/menu-settings-labels-label-color-1-375.png)　[1024px](screens/menu-settings-labels-label-color-1-1024.png)　[1440px](screens/menu-settings-labels-label-color-1-1440.png)

1. 対象は？ 社内確認。
2. 今の色は？ 黄緑。
3. どう判別するか？ 下段2番目にチェック。

観察

- 2行目の色点に青枠。
- 8色は4列2段、先頭の紺にフォーカス。
- 3幅とも色見本は行の色点の下で、件数・操作は右側に残る。

### 085　menu-settings-labels-label-color-2

運営者が「経理」の色を確認・変更するために開く。

[375px](screens/menu-settings-labels-label-color-2-375.png)　[1024px](screens/menu-settings-labels-label-color-2-1024.png)　[1440px](screens/menu-settings-labels-label-color-2-1440.png)

1. 対象は？ 経理。
2. 今の色は？ 灰色。
3. どう判別するか？ 下段4番目にチェック。

観察

- 3行目の色点に青枠。
- 8色は4列2段、先頭の紺にフォーカス。
- 3幅とも色見本は行の色点の下で、件数・操作は右側に残る。

### 086　menu-settings-labels-label-color-3

運営者が「請求」の色を確認・変更するために開く。

[375px](screens/menu-settings-labels-label-color-3-375.png)　[1024px](screens/menu-settings-labels-label-color-3-1024.png)　[1440px](screens/menu-settings-labels-label-color-3-1440.png)

1. 対象は？ 請求。
2. 今の色は？ 紺。
3. どう判別するか？ 上段1番目にチェック。

観察

- 4行目の色点に青枠。
- 8色は4列2段、先頭の紺にフォーカス。
- 3幅とも色見本は行の色点の下で、件数・操作は右側に残る。

### 087　menu-settings-labels-label-color-4

運営者が「長期契約の更新手続きについて」の色を確認・変更するために開く。

[375px](screens/menu-settings-labels-label-color-4-375.png)　[1024px](screens/menu-settings-labels-label-color-4-1024.png)　[1440px](screens/menu-settings-labels-label-color-4-1440.png)

1. 対象は？ 長期契約の更新手続きについて。
2. 今の色は？ 黄緑。
3. どう判別するか？ 下段2番目にチェック。

観察

- 5行目の色点に青枠。
- 8色は4列2段、先頭の紺にフォーカス。
- 3幅とも色見本は行の色点の下で、件数・操作は右側に残る。

### 088　menu-settings-labels-label-color-5

運営者が「領収書」の色を確認・変更するために開く。

[375px](screens/menu-settings-labels-label-color-5-375.png)　[1024px](screens/menu-settings-labels-label-color-5-1024.png)　[1440px](screens/menu-settings-labels-label-color-5-1440.png)

1. 対象は？ 領収書。
2. 今の色は？ 青緑。
3. どう判別するか？ 上段2番目にチェック。

観察

- 6行目の色点に青枠。
- 8色は4列2段、先頭の紺にフォーカス。
- 3幅とも色見本は行の色点の下で、件数・操作は右側に残る。

### 089　menu-settings-labels-label-rename-0

運営者が「再発行」を改名するために開く。

[375px](screens/menu-settings-labels-label-rename-0-375.png)　[1024px](screens/menu-settings-labels-label-rename-0-1024.png)　[1440px](screens/menu-settings-labels-label-rename-0-1440.png)

1. どれを編集するか？ 再発行。
2. 制限は？ 新しい名前は20字まで。
3. どう終えるか？ 名前を変更または取り消し。

観察

- 1行目の名称が青枠の起点。
- 入力は既存の名称で始まり、空欄から書き直す必要がない。
- 375は小窓内の変更が幅広、1024・1440は短いボタン。

### 090　menu-settings-labels-label-rename-1

運営者が「社内確認」を改名するために開く。

[375px](screens/menu-settings-labels-label-rename-1-375.png)　[1024px](screens/menu-settings-labels-label-rename-1-1024.png)　[1440px](screens/menu-settings-labels-label-rename-1-1440.png)

1. どれを編集するか？ 社内確認。
2. 制限は？ 新しい名前は20字まで。
3. どう終えるか？ 名前を変更または取り消し。

観察

- 2行目の名称が青枠の起点。
- 入力は既存の名称で始まり、空欄から書き直す必要がない。
- 375は小窓内の変更が幅広、1024・1440は短いボタン。

### 091　menu-settings-labels-label-rename-2

運営者が「経理」を改名するために開く。

[375px](screens/menu-settings-labels-label-rename-2-375.png)　[1024px](screens/menu-settings-labels-label-rename-2-1024.png)　[1440px](screens/menu-settings-labels-label-rename-2-1440.png)

1. どれを編集するか？ 経理。
2. 制限は？ 新しい名前は20字まで。
3. どう終えるか？ 名前を変更または取り消し。

観察

- 3行目の名称が青枠の起点。
- 入力は既存の名称で始まり、空欄から書き直す必要がない。
- 375は小窓内の変更が幅広、1024・1440は短いボタン。

### 092　menu-settings-labels-label-rename-3

運営者が「請求」を改名するために開く。

[375px](screens/menu-settings-labels-label-rename-3-375.png)　[1024px](screens/menu-settings-labels-label-rename-3-1024.png)　[1440px](screens/menu-settings-labels-label-rename-3-1440.png)

1. どれを編集するか？ 請求。
2. 制限は？ 新しい名前は20字まで。
3. どう終えるか？ 名前を変更または取り消し。

観察

- 4行目の名称が青枠の起点。
- 入力は既存の名称で始まり、空欄から書き直す必要がない。
- 375は小窓内の変更が幅広、1024・1440は短いボタン。

### 093　menu-settings-labels-label-rename-4

運営者が「長期契約の更新手続きについて」を改名するために開く。

[375px](screens/menu-settings-labels-label-rename-4-375.png)　[1024px](screens/menu-settings-labels-label-rename-4-1024.png)　[1440px](screens/menu-settings-labels-label-rename-4-1440.png)

1. どれを編集するか？ 長期契約の更新手続きについて。
2. 制限は？ 新しい名前は20字まで。
3. どう終えるか？ 名前を変更または取り消し。

観察

- 5行目の名称が青枠の起点。
- 入力は既存の名称で始まり、空欄から書き直す必要がない。
- 375は小窓内の変更が幅広、1024・1440は短いボタン。長い名前は入力欄の端で切れる。

### 094　menu-settings-labels-label-rename-5

運営者が「領収書」を改名するために開く。

[375px](screens/menu-settings-labels-label-rename-5-375.png)　[1024px](screens/menu-settings-labels-label-rename-5-1024.png)　[1440px](screens/menu-settings-labels-label-rename-5-1440.png)

1. どれを編集するか？ 領収書。
2. 制限は？ 新しい名前は20字まで。
3. どう終えるか？ 名前を変更または取り消し。

観察

- 6行目の名称が青枠の起点。
- 入力は既存の名称で始まり、空欄から書き直す必要がない。
- 375は小窓内の変更が幅広、1024・1440は短いボタン。

### 095　menu-settings-operators-choice-menu-0

管理者が運営者一覧の並びを変更するために開く。

[375px](screens/menu-settings-operators-choice-menu-0-375.png)　[1024px](screens/menu-settings-operators-choice-menu-0-1024.png)　[1440px](screens/menu-settings-operators-choice-menu-0-1440.png)

1. 現在は？ 標準の順序。
2. 他の順序は？ 名前順。
3. 対象は？ 運営者2人。

観察

- 名前とメール、権限が一覧に残る。
- 標準の順序にチェック。
- 375は権限選択の右に起点、1024・1440は検索・権限・並び順が1列。

### 096　menu-status-spam-48e45b08-bulk-assignee

担当者が隔離された1件の担当をまとめて指定するために開く。

[375px](screens/menu-status-spam-48e45b08-bulk-assignee-375.png)　[1024px](screens/menu-status-spam-48e45b08-bulk-assignee-1024.png)　[1440px](screens/menu-status-spam-48e45b08-bulk-assignee-1440.png)

1. 対象は？ 迷惑メール1件を選択中。
2. 担当候補は？ 佐藤優と森直子。
3. どの行か？ #9 未承諾の営業案内。

観察

- チェック付きの行が薄青。
- 候補に名前と別色の頭文字。現在はどちらにもチェックがない。
- 375は操作列が複数段、1024・1440は選択数の右側で担当を選ぶ。

### 097　menu-status-spam-48e45b08-bulk-label

担当者が隔離された1件のラベルをまとめて指定するために開く。

[375px](screens/menu-status-spam-48e45b08-bulk-label-375.png)　[1024px](screens/menu-status-spam-48e45b08-bulk-label-1024.png)　[1440px](screens/menu-status-spam-48e45b08-bulk-label-1440.png)

1. 対象は？ 迷惑メール1件を選択中。
2. 何を付けられるか？ 再発行から領収書まで6種。
3. 現在の付与状況は？ 6候補にチェックはない。

観察

- 対象会話を青い背景で区別。
- 「ラベルを管理」が選択肢の下。
- 375は右端近くまで候補が広がり、1024・1440は一括ツールバーの下。

### 098　menu-status-spam-48e45b08-choice-menu-0

担当者が隔離された1件の表示状態を絞り込むために開く。

[375px](screens/menu-status-spam-48e45b08-choice-menu-0-375.png)　[1024px](screens/menu-status-spam-48e45b08-choice-menu-0-1024.png)　[1440px](screens/menu-status-spam-48e45b08-choice-menu-0-1440.png)

1. いまの状態は？ 迷惑メール。
2. 候補は？ 未対応・返信待ち・完了・迷惑メール・すべて。
3. どの集合にかかるか？ 迷惑メール1件。

観察

- 現在値にチェック、先頭の未対応にフォーカス。
- 状態名に対応する識別アイコン。
- 375は検索下の絞り込み、1024・1440は検索右側から展開。

### 099　menu-status-spam-48e45b08-choice-menu-1

担当者が隔離された1件の製品フィルターを選ぶために開く。

[375px](screens/menu-status-spam-48e45b08-choice-menu-1-375.png)　[1024px](screens/menu-status-spam-48e45b08-choice-menu-1-1024.png)　[1440px](screens/menu-status-spam-48e45b08-choice-menu-1-1440.png)

1. いまの製品は？ すべて。
2. 個別製品は？ DeskとSlide。
3. 表示中は？ 迷惑メール1件。

観察

- 現在製品にチェック。
- 製品固有のマークが名称の隣。
- 3幅とも絞り込みの上に候補が重なり、入力列から起点を特定できる。

### 100　menu-status-spam-48e45b08-choice-menu-2

担当者が隔離された1件のラベル条件を切り替えるために開く。

[375px](screens/menu-status-spam-48e45b08-choice-menu-2-375.png)　[1024px](screens/menu-status-spam-48e45b08-choice-menu-2-1024.png)　[1440px](screens/menu-status-spam-48e45b08-choice-menu-2-1440.png)

1. いまの条件は？ すべてのラベル。
2. 候補はいくつか？ 全件と6種のラベル。
3. 管理に進むには？ 最下部の「ラベルを管理」。

観察

- 現値にチェックがある。
- 先頭のすべてに青いフォーカス枠。
- 375で一覧は起点の上、1024・1440は下に開く。

### 101　menu-status-spam-48e45b08-choice-menu-3

担当者が隔離された1件の表示順を確かめるために開く。

[375px](screens/menu-status-spam-48e45b08-choice-menu-3-375.png)　[1024px](screens/menu-status-spam-48e45b08-choice-menu-3-1024.png)　[1440px](screens/menu-status-spam-48e45b08-choice-menu-3-1440.png)

1. 対象は？ 迷惑メール1件。
2. 現在の順序は？ 待たせている順。
3. ほかには？ 新しい順。

観察

- 選択条件を示すチップが検索の下。
- 待たせている順にチェック。
- 375は検索下のボタン、1024・1440は検索右端のボタンから2択。

### 102　menu-status-spam-48e45b08-filter-assignee

担当者が隔離された1件の担当者条件を切り替えるために開く。

[375px](screens/menu-status-spam-48e45b08-filter-assignee-375.png)　[1024px](screens/menu-status-spam-48e45b08-filter-assignee-1024.png)　[1440px](screens/menu-status-spam-48e45b08-filter-assignee-1440.png)

1. 現在の条件は？ すべて。
2. 候補者は？ 佐藤優と森直子。
3. 条件を外すには？ すべてを選ぶ。

観察

- 候補の頭文字と氏名を併記。
- 現在値にチェック。
- 375は絞り込み枠の左側、1024・1440は検索右下に同じ親子メニュー。

### 103　menu-tokens-choice-menu-0

管理者が発行済みのAPIトークンを並べ替えるために開く。

[375px](screens/menu-tokens-choice-menu-0-375.png)　[1024px](screens/menu-tokens-choice-menu-0-1024.png)　[1440px](screens/menu-tokens-choice-menu-0-1440.png)

1. 現在の順序は？ 標準の順序。
2. ほかには？ 名前順。
3. 何が登録済みか？ 運営用CLI、閲覧。

観察

- 現値にチェックとフォーカス。
- 失効させる操作は発行済み行。
- 375では検索の下で2条件、広い2幅は検索と同じ段。

### 104　menu-view-feedback-834dd78f-bulk-label

運営者がフィードバックに分類を付けるために開く。

[375px](screens/menu-view-feedback-834dd78f-bulk-label-375.png)　[1024px](screens/menu-view-feedback-834dd78f-bulk-label-1024.png)　[1440px](screens/menu-view-feedback-834dd78f-bulk-label-1440.png)

1. 何件か？ 選択中1件。
2. どの声か？ #10、運営画面をキーボードで使っているという声。
3. 何を選べるか？ 6ラベルと管理への入口。

観察

- 選択を解除が件数のすぐ横。
- ラベル起点の下に候補が並ぶ。
- 375は一括操作が複数段、広い2幅は「確認済みにする」が行右端に残る。

### 105　operators

管理者が運営者と権限を調べるために開く。

[375px](screens/operators-375.png)　[1024px](screens/operators-1024.png)　[1440px](screens/operators-1440.png)

1. 人数は？ 2人。
2. 権限は？ 佐藤優が管理者、森直子が担当者。
3. どう変更するか？ それぞれの「編集」を開く。

観察

- 表示名とアドレスが組になる。
- 検索・権限・順序で探せる。
- 375は編集が次の段、1024・1440は権限の横に編集。

### 106　product-emoji

利用者が絵文字を目印にSlideの問い合わせ窓口を確認して書くために開く。

[375px](screens/product-emoji-375.png)　[1024px](screens/product-emoji-1024.png)　[1440px](screens/product-emoji-1440.png)

1. どの窓口か？ 絵文字を添えたSlide。
2. 入力は？ 件名、本文、連絡先。
3. 次は？ 送信。

観察

- 製品名は絵文字の右に残る。
- 全項目を入力する案内。
- 375は画面余白内、1024・1440では同じフォーム幅に収まる。

### 107　product-icon-settings

管理者がSlideの識別アイコンを設定するために開く。

[375px](screens/product-icon-settings-375.png)　[1024px](screens/product-icon-settings-1024.png)　[1440px](screens/product-icon-settings-1440.png)

1. 現状は？ 茶色のSマーク。
2. 現在の種類は？ 名前の頭文字。
3. どう確定するか？ アイコンを保存。

観察

- アイコン変更の詳細が展開中。
- 差出人保存は別の操作。
- 3幅とも保存が各欄のすぐ下、窓口の追加は次のカードで閉じている。

### 108　product-image

利用者が画像を目印にSlideの問い合わせ窓口を確認して書くために開く。

[375px](screens/product-image-375.png)　[1024px](screens/product-image-1024.png)　[1440px](screens/product-image-1440.png)

1. どの窓口か？ 紺色の画像付きSlide。
2. 何を記すか？ 件名、問い合わせ内容、連絡先メール。
3. どう送るか？ 黒い送信。

観察

- 画像と製品名を併記。
- 本文欄だけ複数行。
- 375・1024・1440で3欄は同じ順序・左揃え。

### 109　product-switcher

担当者が現在対象の製品を確かめるために開く。

[375px](screens/product-switcher-375.png)　[1024px](screens/product-switcher-1024.png)　[1440px](screens/product-switcher-1440.png)

1. 現在は？ Slideにチェック。
2. 他の範囲は？ 全製品またはDesk。
3. 何件あるか？ Slideの未対応6件。

観察

- 選択中の製品とマークを起点にも示す。
- 広幅では検索下にSlideチップ。
- 375はドロワーを開いた状態、1024・1440は受信箱と並列。

### 110　route-extensions-chat-preview-slide

管理者が埋め込みチャットの起動前の見え方を確かめるために開く。

[375px](screens/route-extensions-chat-preview-slide-375.png)　[1024px](screens/route-extensions-chat-preview-slide-1024.png)　[1440px](screens/route-extensions-chat-preview-slide-1440.png)

1. 対象は？ Slide。
2. どう試すか？ 下部のヘルプボタン。
3. 何が分かるか？ ボタンを押してチャットの見え方を確認できるという説明。

観察

- 見本の背景と上の説明領域を分ける。
- 暗色の動作入口が一つ。
- 3幅とも右下に入口があり内容が少なくても位置が同じ。

### 111　settings-home

管理者が設定項目と現在の値を確認するために開く。

[375px](screens/settings-home-375.png)　[1024px](screens/settings-home-1024.png)　[1440px](screens/settings-home-1440.png)

1. 窓口と運営者は？ 2件と2人。
2. 他の現値は？ ラベル6件、保存無期限、トークン0件。
3. 危険な操作はどこか？ 最後のデータ管理カード。

観察

- 設定は名前・説明・値・矢印の行。
- 削除行には取り消し不可とある。
- 375では値を右に保って説明を折り返し、広い2幅では規則的な1行群。

### 112　suggest-settings

管理者が記事推薦の候補条件を調整するために開く。

[375px](screens/suggest-settings-375.png)　[1024px](screens/suggest-settings-1024.png)　[1440px](screens/suggest-settings-1440.png)

1. しきい値は？ 60%。
2. 候補の出し方は？ 最高3件、確率の高い順。
3. 自動返信に添えるか？ チェックは空。

観察

- チャット・フォームと受付返信・運営画面のモデルは別選択。
- 次に設定の保存と取り消し。
- 375で展開パネルが1列、1024・1440では埋め込みコードと複数の折り畳みの下に設定。

### 113　tokens

管理者が初めてAPIトークンを発行するために開く。

[375px](screens/tokens-375.png)　[1024px](screens/tokens-1024.png)　[1440px](screens/tokens-1440.png)

1. 既存は？ 0件。
2. 決めるものは？ トークン名と発行する権限。
3. 初期権限は？ 閲覧。

観察

- 鍵記号と空の理由。
- すぐ下に黒い発行ボタンを持つフォーム。
- 375は空状態と発行が同じ初画面にあり、1024・1440でも両方が見える。
