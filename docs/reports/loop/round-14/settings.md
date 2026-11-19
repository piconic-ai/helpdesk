# 設定・拡張機能の独立視覚レビュー

設定グループの113状態339枚を、同じ状態の375・1024・1440pxを横に並べて比較しました。参照した基準は同梱のDESIGN.mdとcriteria.mdです。状態名は資料の照合に使い、判断は描画された見出し・値・配置に基づきます。画像は各幅のビューポートです。スクロール位置の異なる画像で、画面外の操作の有無を判定していません。

## 指摘

**高0件、中5件、低3件、計8件。** 件数は同じ原因を複数の幅・状態で確認した場合も1件としています。各行の順序は、起きていること、対象と幅、あるべき姿です。

| 重さ | 起きていること | 対象と幅 | あるべき姿 |
| --- | --- | --- | --- |
| 中 | GitHubに公開する課題の入力面は背景全体を暗くするが、手前には「起票内容を確認」しかない。375の関連情報の「閉じる」も暗転した背景側にある。画面上から入力を中断する方法が分からない。 | 課題起票の2状態、375・1024・1440。[375](screens/extension-issues-375.png)・[1440](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-1440.png) | 公開案の入力面に「キャンセル」または「閉じる」を置き、確認に進まず元の会話へ戻る手段を示す。 |
| 中 | 付けるラベルに「請求」が入っているのに「ラベルまたは担当者を選択してください」と案内する。保存前にさらに担当者を選ぶ必要があるように読める。 | 振り分けルールの既存行編集、文言まで確認できる1024・1440。[1024](screens/loop-rule-edit-1024.png)・[1440](screens/loop-rule-edit-1440.png) | どちらも未指定の時にだけ選択を促す。すでに選んだ行では保存可能かどうかが選択内容と一致して見えるようにする。 |
| 中 | 請求で絞った一覧では、通常は「請求」チップがあるが、一括選択すると件数・操作だけになり、どの条件の2件であるかを一括操作直前に確認できない。未対応一覧自体の件数と選択件数は見える。 | 請求絞り込みの一括担当・ラベル、3幅。[通常の375](screens/menu-label-fd3f5651-choice-menu-3-375.png)・[選択中の375](screens/menu-label-fd3f5651-bulk-assignee-375.png)・[選択中の1440](screens/menu-label-fd3f5651-bulk-assignee-1440.png) | 選択件数のそばに「請求」など有効な絞り込み条件を残し、「どの集合を変更するか」を読み直せるようにする。 |
| 中 | ラベル色の8候補には色名がなく、青・灰・茶など明度が近い暗色は丸の見え方だけで区別する。チェックで現在位置は分かるが、次に選ぶ色を文字で照合できない。 | ラベルの色選択6行と色見本、3幅。[375](screens/menu-settings-labels-label-color-2-375.png)・[1440](screens/behavior-label-swatches-1440.png) | 色名を候補に添えるか、フォーカス・タッチ選択時に色名を読めるようにする。既存のチェックと色点は併用できる。 |
| 中 | Slackへの通知が有効でも、通知先欄は「チャンネルは接続先の Webhook 設定で確認」とだけ示す。開いた状態では、どのチームに新着が届くかを確認できず、別サービスの設定を探すことになる。 | 新着通知カードと設定、3幅。[1440のカード](screens/extension-notify-1440.png)・[375の設定](screens/guide-notify-375.png) | 接続時に登録した通知先の表示名、またはチャンネルを確認できる具体的な導線を、通知先のそばに示す。 |
| 低 | ラベルの確認ダイアログではキャンセルと確定の両方が、短い文言でも入力面の幅一杯に伸びる。同じ管理画面のルール削除では文言幅のボタンが横並びである。 | ラベル削除・統合の1024・1440。[削除](screens/behavior-label-delete-1024.png)・[統合](screens/behavior-label-merge-1440.png)・[ルール削除](screens/loop-rule-delete-1440.png) | 広い幅でボタンを文言幅に合わせ、同種の確認操作の並びをそろえる。 |
| 低 | 「長期契約の更新手続きについて」は一覧で2行に折れてなお「長期契約の更新手続きに…」まで。操作メニューでは全文が読める。 | ラベル一覧の375。[一覧](screens/label-colors-375.png)・[操作](screens/menu-settings-labels-label-actions-4-375.png) | 375の行では末尾の操作・件数を保ちつつ名前に幅を戻すか、全文確認ができることを示す。 |
| 低 | 定型返信・運営者・トークンの並び順は「標準の順序」「名前順」の2択。標準が登録順・更新順など、何を意味するかラベルから判別できない。 | 3一覧の並び順メニュー、3幅。[定型返信](screens/menu-extensions-canned-choice-menu-0-1440.png)・[運営者](screens/menu-settings-operators-choice-menu-0-375.png)・[トークン](screens/menu-tokens-choice-menu-0-1024.png) | 各一覧が実際に使っている基準を「登録が古い順」などの具体的な名前で示す。 |

## 操作して確かめる項目

- 課題起票の外側タップ・Escapeでの終了、入力中断時の内容保持、元の起点へのフォーカス復帰。候補・メニュー同士のTab移動、実際のタップ領域、色名の読み上げも実機で確認する。
- ラベル削除・統合、ルール変更、プロダクト登録、トークン発行・失効後の保存結果、トースト、再読み込み後の反映。ダイアログを開く瞬間に背景が動くかは、同一条件で連続して観察する。
- 自動送信の承認前後、外部公開直前の確認、Webhookの実際の宛先、書き出しファイルの置換結果。画像にある説明と、実際に外部に出る内容を照合する。
- 公開フォームの必須・メール形式エラーと入力保持、チャットの起動・引き継ぎ、キーボードとタッチでの速さ、複数人閲覧・入力中の更新。今回の件数にこれらの動作上の不具合は含めていない。

## 3幅の構成比較

375は多くの設定でヘッダー＋1列、1024は細いナビ、1440は名前付きナビになる。ラベル一覧は3幅とも色・名前・件数・操作の順を保つ。会話の関連情報は375では画面全体、1024では右側からのパネル、1440では本文の隣になる。請求の2件を選択する前後の375画像では会話行の縦位置はそろっている。公開フォームは3幅とも縦1列で、デスクトップで入力欄を画面一杯に引き伸ばしていない。

## 状態別の観察

各状態に、開く人と目的、その人の3つの問いと画像の答えを記載します。各状態の末尾から、左から順に3幅の原画像を参照できます。

### 1. account

運営者が自分のプロフィールを更新する。

- 誰の設定か？ 「佐」印と sato@example.com の組み合わせで分かる。
- 何を変えられるか？ 表示名「佐藤 優」とアイコン画像を別の欄で扱う。
- どう反映するか？ 画像の形式・容量・中央切り抜きの説明に続いて「アカウントを保存」と「取り消し」が並ぶ。

[375px](screens/account-375.png)　[1024px](screens/account-1024.png)　[1440px](screens/account-1440.png)

### 2. behavior-label-add

管理者がラベル一覧に分類名を追加する。

- どこから始めたか？ 「ラベルを追加」に青い枠が残る。
- 何を入れるか？ 吹き出しに空の「ラベル名（20字まで）」がある。
- どう確定するか？ 直下の黒い「追加する」が操作で、元のラベル行も背景に見える。

[375px](screens/behavior-label-add-375.png)　[1024px](screens/behavior-label-add-1024.png)　[1440px](screens/behavior-label-add-1440.png)

### 3. behavior-label-delete

管理者が使用中のラベルを削除する前に影響を確認する。

- 対象は？ ダイアログの本文に「経理」とある。
- 影響は？ 2件の会話すべてから外すと明記している。
- 戻るには？ 「キャンセル」が先、赤い「削除」が後で、背面には暗くなった操作メニューが残る。

[375px](screens/behavior-label-delete-375.png)　[1024px](screens/behavior-label-delete-1024.png)　[1440px](screens/behavior-label-delete-1440.png)

### 4. behavior-label-merge

管理者が重複する分類をまとめる前に変更内容を確認する。

- 元は？ 確認文が「経理」を示す。
- 行き先と影響は？ 2件を「再発行」にまとめると1文にある。
- 確定方法は？ 「キャンセル」の下に黒い「別のラベルにまとめる」がある。

[375px](screens/behavior-label-merge-375.png)　[1024px](screens/behavior-label-merge-1024.png)　[1440px](screens/behavior-label-merge-1440.png)

### 5. behavior-label-rename

管理者が「経理」の分類名を直す。

- 編集対象は？ 表の「経理」が青枠で、吹き出しにも現在名がある。
- 何を入力するか？ 20字までの新しい名前欄に「経理」が入っている。
- どう終了するか？ 「名前を変更」と「取り消し」を同じ吹き出しで選べる。

[375px](screens/behavior-label-rename-375.png)　[1024px](screens/behavior-label-rename-1024.png)　[1440px](screens/behavior-label-rename-1440.png)

### 6. behavior-label-swatches

管理者が「経理」の識別色を選ぶ。

- どの行か？ 2件の「経理」の色ボタンが青い。
- 色はいくつか？ 4列×2行に丸が8個ある。
- 今の色は？ 右下の色だけ白いチェック、候補に読める色名は出ていない。

[375px](screens/behavior-label-swatches-375.png)　[1024px](screens/behavior-label-swatches-1024.png)　[1440px](screens/behavior-label-swatches-1440.png)

### 7. behavior-product-add

管理者が製品と初めの受付窓口を登録する。

- 登録するものは？ 製品名と窓口アドレスの先頭を別々に入力する。
- どのドメインか？ example.com が選択欄に出る。
- 自動送信の扱いは？ 新着通知・自動受付返信・解決アンケートを列挙し、確認用の新しいタブと登録ボタンに続く。375では登録操作までスクロールが要る。

[375px](screens/behavior-product-add-375.png)　[1024px](screens/behavior-product-add-1024.png)　[1440px](screens/behavior-product-add-1440.png)

### 8. extension-articles

担当者が公開済みの記事と新しい記事の入口を探す。

- 何件あるか？ 見出し直下が1件で、行は「領収書を発行する」。
- 公開されているか？ Slide、公開中、更新2026/11/17を同じ行で読める。
- どう増やすか？ 「記事を書く」が黒く、「記事が無かった質問」と「候補（0件）」は白い。

[375px](screens/extension-articles-375.png)　[1024px](screens/extension-articles-1024.png)　[1440px](screens/extension-articles-1440.png)

### 9. extension-auto-ack

管理者が自動受付返信の有効状態と設定入口を確かめる。

- どの分類か？ 「受け付ける」にある。
- 動作中か？ 自動受付返信に黒いスイッチと「有効」がある。
- 何を設定するか？ 最初の問い合わせに受付を知らせる説明と「設定」がある。375では縦並び、広い幅では同種の機能を横に比べられる。

[375px](screens/extension-auto-ack-375.png)　[1024px](screens/extension-auto-ack-1024.png)　[1440px](screens/extension-auto-ack-1440.png)

### 10. extension-canned

担当者が会話に定型返信の下書きを用意する。

- 誰に使うか？ 「山田 花」の会話に相手の領収書の相談が見える。
- どんな文か？ 「お問い合わせの受付」に相手名と Slide が入った英文の予告がある。
- そのまま送られるか？ 操作は「定型文から下書きを作成」で、下の送信は灰色。

[375px](screens/extension-canned-375.png)　[1024px](screens/extension-canned-1024.png)　[1440px](screens/extension-canned-1440.png)

### 11. extension-chat

Slideの利用者が質問して解決手段を探す。

- どこの窓口か？ S印と「Slide のヘルプ」が先頭にある。
- 誰が回答するか？ 関連記事は自動検索、問い合わせを送った後に担当者が読むと説明する。
- どう進むか？ 質問欄と黒い「質問する」に加え、記事一覧とメール問い合わせのリンクがある。

[375px](screens/extension-chat-375.png)　[1024px](screens/extension-chat-1024.png)　[1440px](screens/extension-chat-1440.png)

### 12. extension-export

管理者が取り出すデータと個人情報の扱いを確認する。

- どこまでか？ 全期間・全製品の会話11件、メッセージ17件、操作履歴12件。
- 何が残るか？ アドレス・登録名の置換と、住所等の自由記述が残る旨がある。
- どう取得するか？ 「伏せて書き出す」が選ばれ、「JSON Lines を書き出す」が続く。

[375px](screens/extension-export-375.png)　[1024px](screens/extension-export-1024.png)　[1440px](screens/extension-export-1440.png)

### 13. extension-feedback

担当者が届いたフィードバックを処理する。

- 何が届いたか？ #10、Slide、受付済み、佐々木 葵の感想を表示。
- 次の処理は？ 「確認済みにする」が黒く、その隣に「問い合わせに変更」がある。
- メモは相手に届くか？ 黄色い領域に「内部メモ（相手には送られません）」とある。

[375px](screens/extension-feedback-375.png)　[1024px](screens/extension-feedback-1024.png)　[1440px](screens/extension-feedback-1440.png)

### 14. extension-form

Slideの利用者がサポートに新しい相談を送る。

- どこの窓口か？ S印とSlideの下に「お問い合わせ」がある。
- 何が必要か？ 全項目入力の案内と、件名・内容・連絡先メールアドレスの3欄が並ぶ。
- どこから送るか？ 末尾に黒い「送信」が1つある。

[375px](screens/extension-form-375.png)　[1024px](screens/extension-form-1024.png)　[1440px](screens/extension-form-1440.png)

### 15. extension-issues

担当者が問い合わせを基にGitHub課題の公開案を書く。

- 出典は？ 元の問い合わせ #1 と件名を併記する。
- どこに何を書くか？ 投稿先 example/helpdesk と、タイトル、公開する要約を示す。
- 次は？ 「起票内容を確認」がある。暗転した背景の手前にある入力面には中止・閉じるが見えない。

[375px](screens/extension-issues-375.png)　[1024px](screens/extension-issues-1024.png)　[1440px](screens/extension-issues-1440.png)

### 16. extension-merge

担当者が関連する会話の統合先を選ぶ。

- 元は？ #1「領収書の宛名を変更できますか」とある。
- 行き先は？ 候補1件で #2「ワークスペースの招待メールについて」が選ばれている。
- 何が次か？ 「この会話を統合する内容を確認」の後で確認する構成。狭い2幅は関連情報のパネル、1440では会話右側にある。

[375px](screens/extension-merge-375.png)　[1024px](screens/extension-merge-1024.png)　[1440px](screens/extension-merge-1440.png)

### 17. extension-metrics

運営者が期間を指定してサポートの対応状況を読む。

- 集計条件は？ 全製品・過去30日、直前の同じ日数と比較、解決5件未満の注意がある。
- 代表値は？ 平均4日、一度で解決100%、平均作業時間はデータなし。
- 根拠は？ 割合カードに分子・分母、下段に解決件数1と完了件数1などを載せる。375では順に縦に並ぶ。

[375px](screens/extension-metrics-375.png)　[1024px](screens/extension-metrics-1024.png)　[1440px](screens/extension-metrics-1440.png)

### 18. extension-notify

管理者が新着通知の稼働状況と送信先を確認する。

- 稼働中か？ 新着通知のカードは「有効」。
- 何を知らせるか？ 新着と担当者の変更を運営者に通知すると書かれる。
- どこへ届くか？ Slackと表示するが、チャンネルは接続先のWebhook設定で確認するという案内まで。

[375px](screens/extension-notify-375.png)　[1024px](screens/extension-notify-1024.png)　[1440px](screens/extension-notify-1440.png)

### 19. extension-presence

担当者が同じ問い合わせをほかの人が見ているか確かめる。

- ほかに誰が見ているか？ 「ほかに閲覧中の担当者はいません」。
- 過去の相談は？ 「この相手の問い合わせ」も該当なしと別枠で示す。
- 本体に戻れるか？ 375・1024の関連情報に「閉じる」があり、1440は会話の右に併置する。

[375px](screens/extension-presence-375.png)　[1024px](screens/extension-presence-1024.png)　[1440px](screens/extension-presence-1440.png)

### 20. extension-rules

管理者が振り分けルールの準備状況を確かめる。

- 機能は動く設定か？ 「振り分けルール」は有効。
- 条件は用意済みか？ 「登録済みのルール 0件」がある。
- 次は？ 同じカードに「設定」があり、説明は件名やプロダクトに応じた担当・ラベル設定。

[375px](screens/extension-rules-375.png)　[1024px](screens/extension-rules-1024.png)　[1440px](screens/extension-rules-1440.png)

### 21. extension-snooze

担当者が特定の会話を指定日時まで保留にする。

- 現在は？ 「この会話は保留されていません」と出る。
- いつ戻るか？ 「再表示日時（日本時間）」に日付と時刻を指定する。
- どの操作か？ 「指定日時まで保留」の下に別操作「迷惑メールにする」が並ぶ。

[375px](screens/extension-snooze-375.png)　[1024px](screens/extension-snooze-1024.png)　[1440px](screens/extension-snooze-1440.png)

### 22. extension-spam

担当者が隔離されたメールを点検する。

- 何件か？ 「迷惑メール 1件」。
- どのメールか？ Slide・山田 花・「未承諾の営業案内」と #9 がある。
- どう探し直すか？ 件名・差出人・本文の検索、絞り込み、並び順が一覧上にある。

[375px](screens/extension-spam-375.png)　[1024px](screens/extension-spam-1024.png)　[1440px](screens/extension-spam-1440.png)

### 23. extension-survey

問い合わせをした人が解決したか回答する。

- どの相談か？ Slide印と「問い合わせ #8」が見える。
- 何を聞くか？ 「問い合わせは解決しましたか？」を見出しにしている。
- 回答の扱いは？ 「選んだ回答を送信します」の直下に「はい」「いいえ」が同じ重さである。

[375px](screens/extension-survey-375.png)　[1024px](screens/extension-survey-1024.png)　[1440px](screens/extension-survey-1440.png)

### 24. extensions

管理者が拡張機能の稼働状況を一覧で探す。

- いくつ有効か？ 見出しに「有効 16件」。
- どう探すか？ 検索と有効状態の絞り込みがある。
- どこを変えるか？ 機能ごとに名前、説明、有効表示付きスイッチ、設定入口が並び、375は1列、広幅は複数列。

[375px](screens/extensions-375.png)　[1024px](screens/extensions-1024.png)　[1440px](screens/extensions-1440.png)

### 25. guide-articles

管理者が製品別のヘルプ記事を公開サイトに載せる。

- どこで記事を作るか？ 冒頭に「記事の管理を開く」。
- 対象は？ DeskとSlideに分け、各々に「ヘルプページを開く」がある。
- どう設置するか？ 端末で試せるURLと公開先でのコピーを案内し、埋め込みコードとコピーボタンを置く。

[375px](screens/guide-articles-375.png)　[1024px](screens/guide-articles-1024.png)　[1440px](screens/guide-articles-1440.png)

### 26. guide-auto-ack

管理者が自動受付返信の承認範囲と実際の文面を調べる。

- 何がトリガーか？ 初めて受け付けた問い合わせメール。
- 誰が何を有効にしたか？ 全製品対象、佐藤 優、11/04 14:00日本時間とある。
- 相手に何が届くか？ Desk選択の下にサンプル件名と、自動返信であることを記した英文がある。

[375px](screens/guide-auto-ack-375.png)　[1024px](screens/guide-auto-ack-1024.png)　[1440px](screens/guide-auto-ack-1440.png)

### 27. guide-canned

担当者がチームで使う定型返信を管理する。

- 何があるか？ 1件、保存済みの「お問い合わせの受付」。
- どう置き換えるか？ 本文例に {{name}} と {{product}} が見え、会話では下書きを確認するよう案内する。
- どう変更・追加するか？ 保存済み行には「編集」、区切りの下には「新しい定型文」の表示名と本文がある。

[375px](screens/guide-canned-375.png)　[1024px](screens/guide-canned-1024.png)　[1440px](screens/guide-canned-1440.png)

### 28. guide-chat

管理者が製品別にヘルプチャットを公開・確認する。

- どの窓口が開いているか？ Deskは受付開始前、Slideは受付中。
- 試せるか？ 前者は「このサイトで受付を開始」、後者は「ヘルプチャットを開く」。
- どの設定か？ 記事のおすすめ、SlideのURL、埋め込み先0件などが各製品に属する。

[375px](screens/guide-chat-375.png)　[1024px](screens/guide-chat-1024.png)　[1440px](screens/guide-chat-1440.png)

### 29. guide-export

管理者が書き出しの範囲と権限を調べる。

- 何を取り出すか？ 全製品の会話・メッセージ・操作履歴。
- 伏せられるのは？ 登録名とアドレスは本文中も置換し、住所などは残ると説明する。
- 権限と実行は？ 「問い合わせ本文の閲覧」と明記、個人情報の扱いを選んで書き出せる。

[375px](screens/guide-export-375.png)　[1024px](screens/guide-export-1024.png)　[1440px](screens/guide-export-1440.png)

### 30. guide-feedback

管理者が製品ごとのフィードバック受付を用意する。

- どこで到着を確認するか？ 最上部に「フィードバックの受信箱を開く」。
- どの製品が未開始か？ Deskに「受付開始前」と開始操作がある。
- どの製品を試せるか？ Slideは「受付中」、フォームの入口と試験用URLがある。

[375px](screens/guide-feedback-375.png)　[1024px](screens/guide-feedback-1024.png)　[1440px](screens/guide-feedback-1440.png)

### 31. guide-form

管理者が問い合わせフォームの受付を開始して試す。

- 確認の手順は？ 公開フォームからテスト送信して受信箱を見ると冒頭にある。
- どこが未開始か？ Deskが受付開始前で開始ボタンがある。
- どこで試せるか？ Slideが受付中で「公開フォームを開く」「Slide の受信箱を開く」が同じ枠内にある。

[375px](screens/guide-form-375.png)　[1024px](screens/guide-form-1024.png)　[1440px](screens/guide-form-1440.png)

### 32. guide-issues

管理者が各製品のGitHub起票先を設定する。

- 連携の前提は？ GitHub接続用トークン設定済みとある。
- どこが未登録か？ Deskの欄は owner/repository の例のみ、操作は「登録する」。
- 既存の行き先は？ Slideに example/helpdesk があり「リポジトリを更新」を選べる。

[375px](screens/guide-issues-375.png)　[1024px](screens/guide-issues-1024.png)　[1440px](screens/guide-issues-1440.png)

### 33. guide-merge

担当者が会話を統合する手順を知る。

- どの会話が対象か？ 同じ相手・同じ窓口と明記する。
- 何が移るか？ 今開いている会話のメッセージが選んだ会話にまとまる。
- どこから行うか？ 「受信箱で会話を選ぶ」があり、追加の権限は不要と示す。

[375px](screens/guide-merge-375.png)　[1024px](screens/guide-merge-1024.png)　[1440px](screens/guide-merge-1440.png)

### 34. guide-metrics

管理者が対応指標を見る場所を知る。

- 何を見るか？ 見出しが「対応状況の集計」。
- 対象の指定は？ 集計画面で製品と期間を選ぶと説明する。
- どの入口か？ 「集計画面を開く」の下は使用する権限の案内で、追加権限なし。

[375px](screens/guide-metrics-375.png)　[1024px](screens/guide-metrics-1024.png)　[1440px](screens/guide-metrics-1440.png)

### 35. guide-notify

管理者が新着通知の接続内容と権限を調べる。

- どこへ送るか？ 通知先はSlack、チャンネルはWebhook設定で確認するとの表示。
- どう設定するか？ 「接続の設定手順」が閉じた状態である。
- 何にアクセスするか？ 外部サービスへの接続、問い合わせ本文の閲覧、メール送信を列挙する。

[375px](screens/guide-notify-375.png)　[1024px](screens/guide-notify-1024.png)　[1440px](screens/guide-notify-1440.png)

### 36. guide-presence

運営者が同時閲覧表示の意味を知る。

- 何が見えるか？ 返信欄に他の担当者名と「閲覧中」「入力中」。
- 一人の場合は？ 他に閲覧中の担当者はいないと表示する旨が書かれる。
- どこで試すか？ 「受信箱で会話を選ぶ」と追加権限なしの表示がある。

[375px](screens/guide-presence-375.png)　[1024px](screens/guide-presence-1024.png)　[1440px](screens/guide-presence-1440.png)

### 37. guide-rules

管理者が初めて振り分けルールを作る。

- 現在は？ 0件と保存済みルールなしの案内。
- 何に適用するか？ 全製品が初期値で、空の件名条件はすべての件名に適用する。
- なぜ保存できないか？ ラベル「付けない」・担当者「変更しない」、どちらかを選ぶ案内と灰色の保存が並ぶ。

[375px](screens/guide-rules-375.png)　[1024px](screens/guide-rules-1024.png)　[1440px](screens/guide-rules-1440.png)

### 38. guide-snooze

担当者がスヌーズの期限と解除手順を知る。

- どこで設定するか？ 会話の「その他の操作」と日本時間の再表示日時を案内する。
- いつ戻るか？ 期限に受信箱へ戻ると書く。
- 早く戻せるか？ 同じ会話の「保留を解除」を案内し、会話選択への入口もある。

[375px](screens/guide-snooze-375.png)　[1024px](screens/guide-snooze-1024.png)　[1440px](screens/guide-snooze-1440.png)

### 39. guide-spam

担当者が誤って隔離された会話を戻す方法を知る。

- 何を確認するか？ 隔離された会話を開いて内容を確認する説明。
- 誤判定なら？ 会話の操作から迷惑メールを解除するとある。
- どこへ進むか？ 「迷惑メールを開く」と追加権限なしの表示がある。

[375px](screens/guide-spam-375.png)　[1024px](screens/guide-spam-1024.png)　[1440px](screens/guide-spam-1440.png)

### 40. guide-survey

管理者が解決アンケートの自動送信と文面を確認する。

- いつ送るか？ 問い合わせ完了後に回答リンクを自動送信。
- 承認範囲は？ 全製品、佐藤 優、有効化日時の表示がある。
- どんなメールか？ Deskの例に自動フォローである英文と問い合わせごとの回答リンクがある。

[375px](screens/guide-survey-375.png)　[1024px](screens/guide-survey-1024.png)　[1440px](screens/guide-survey-1440.png)

### 41. label-colors

管理者がラベル別の件数と色を見渡す。

- 何が使われるか？ 経理と請求が各2件、再発行・社内確認などが各1件。
- 色はどこか？ 行頭に点と矢印、その右に名前がある。
- 操作は？ 各行の右に「操作」、上に追加ボタン。375では長い名前が2行の末尾で省略される。

[375px](screens/label-colors-375.png)　[1024px](screens/label-colors-1024.png)　[1440px](screens/label-colors-1440.png)

### 42. loop-account-menu

運営者が受信箱からキーボード操作の入口を探す。

- 誰の操作か？ ナビ下端の「佐藤 優」またはその丸印に隣接する。
- どれを開いたか？ 三点ボタンが青枠になっている。
- 何を選べるか？ 「キーボード操作 ？」が浮き、375ではドロワーの上に重なる。

[375px](screens/loop-account-menu-375.png)　[1024px](screens/loop-account-menu-1024.png)　[1440px](screens/loop-account-menu-1440.png)

### 43. loop-label-new

担当者が会話に新しいラベルを作って付ける。

- すでに何が付くか？ 経理・請求・領収書の3候補にチェック。
- 新しい名前は？ 展開した入力欄に「契約更新」。
- どこまで行うか？ 操作は「作成して付ける」で、ラベル管理への別入口もある。

[375px](screens/loop-label-new-375.png)　[1024px](screens/loop-label-new-1024.png)　[1440px](screens/loop-label-new-1440.png)

### 44. loop-mailbox-add

管理者が既存製品にメール窓口を追加する。

- どの製品か？ S印のSlideと既存の support@example.com がある。
- 何を入力するか？ 「窓口アドレスの先頭」の空欄と送信ドメイン example.com。
- どう戻せるか？ 窓口側の「窓口を追加」「取り消し」が、別の差出人保存の下にある。

[375px](screens/loop-mailbox-add-375.png)　[1024px](screens/loop-mailbox-add-1024.png)　[1440px](screens/loop-mailbox-add-1440.png)

### 45. loop-operator-edit

管理者が運営者の名前と権限を編集する。

- 誰の編集か？ 佐藤 優・sato@example.com・管理者の行を展開中。
- 権限を変更できるか？ 最後の管理者なので先に別の人を管理者にする説明がある。
- どう終了するか？ 「運営者を保存」があり下に森 直子の行が続く。編集内に取り消しの文言は見えない。

[375px](screens/loop-operator-edit-375.png)　[1024px](screens/loop-operator-edit-1024.png)　[1440px](screens/loop-operator-edit-1440.png)

### 46. loop-rule-delete

管理者が不要な振り分けルールの削除範囲を確かめる。

- どの規則か？ 1番目、全プロダクト、件名「領収書」、ラベル「請求」を読み上げる。
- 危険な操作は？ 右の赤い「このルールを削除」。
- 戻るには？ 左に「キャンセル」が並び、背景の編集欄が暗くなる。

[375px](screens/loop-rule-delete-375.png)　[1024px](screens/loop-rule-delete-1024.png)　[1440px](screens/loop-rule-delete-1440.png)

### 47. loop-rule-edit

管理者が保存済みの自動振り分け条件を直す。

- 適用順は？ 1件中1番目、複数の担当者指定が一致すると最後が優先とある。
- 何が設定済みか？ 全製品、件名「領収書」、付けるラベル「請求」。
- どう保存するか？ 広幅では「変更を保存」と「取り消し」があるが、選択済みでもラベルまたは担当者を選ぶよう案内が残る。

[375px](screens/loop-rule-edit-375.png)　[1024px](screens/loop-rule-edit-1024.png)　[1440px](screens/loop-rule-edit-1440.png)

### 48. mailboxes

管理者が製品から対象の窓口を選ぶ。

- 何があるか？ DeskとSlideが印・名称・アドレスで2行に分かれる。
- 窓口は？ desk@example.com と support@example.com が各行にある。
- 次は？ 行末の矢印で詳細、見出し横の「プロダクトを追加」で新規登録へ進める。

[375px](screens/mailboxes-375.png)　[1024px](screens/mailboxes-1024.png)　[1440px](screens/mailboxes-1440.png)

### 49. menu-dev-ui-gallery-list-menu

開発担当者が部品見本の一覧操作を確認する。

- 何の画面か？ 「UI 部品見本」と一覧・詳細などのナビがある。
- 何が開いたか？ 受信箱例の「一覧の操作」に枠がある。
- 何を試せるか？ 「読み込み中・空の一覧を確認」を選べる。見本には2件の会話がある。

[375px](screens/menu-dev-ui-gallery-list-menu-375.png)　[1024px](screens/menu-dev-ui-gallery-list-menu-1024.png)　[1440px](screens/menu-dev-ui-gallery-list-menu-1440.png)

### 50. menu-extensions-auto-ack-choice-menu-0

管理者が自動受付返信の表示対象製品を選ぶ。

- 何の範囲か？ 全製品への自動送信承認が上段にある。
- どの製品を表示中か？ Deskにチェック、同名の起点が青枠。
- 別の候補は？ Slideが下にあり、背後にはDeskの送信文面が見える。

[375px](screens/menu-extensions-auto-ack-choice-menu-0-375.png)　[1024px](screens/menu-extensions-auto-ack-choice-menu-0-1024.png)　[1440px](screens/menu-extensions-auto-ack-choice-menu-0-1440.png)

### 51. menu-extensions-canned-choice-menu-0

担当者が定型返信一覧の並べ方を選ぶ。

- 何を並べるか？ 「定型返信」1件と保存済みの受付文。
- 現在は？ 「標準の順序」にチェック。
- 他には？ 「名前順」が同じメニューにあり、検索欄と順番の操作が分かれている。

[375px](screens/menu-extensions-canned-choice-menu-0-375.png)　[1024px](screens/menu-extensions-canned-choice-menu-0-1024.png)　[1440px](screens/menu-extensions-canned-choice-menu-0-1440.png)

### 52. menu-extensions-issues-link-1-operation-articles-articles.suggest

担当者が会話から記事の候補を書く。

- 元は？ #1の領収書の宛名についての問い合わせ。
- 何を入れるか？ 「記事にする内容」の欄に青いフォーカス枠がある。
- 何ができるか？ 「記事の候補に追加」で、同じ関連情報にあるGitHub起票と区別できる。

[375px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-375.png)　[1024px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-1024.png)　[1440px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-1440.png)

### 53. menu-extensions-issues-link-1-operation-issues-issues.preview

担当者が会話からGitHubに出す情報を作成する。

- 何に由来するか？ #1と件名を表示する。
- 何を公開するか？ 投稿先example/helpdeskに続きタイトルと「公開する要約」が空欄。
- どう確認・中断するか？ 起票内容の確認は見えるが、暗転より手前の入力面には中止の操作がない。

[375px](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-375.png)　[1024px](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-1024.png)　[1440px](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-1440.png)

### 54. menu-extensions-issues-link-1-operation-merge-merge.combine

担当者が関連情報の複数機能から会話統合を選ぶ。

- どこにいるか？ 「会話を統合」の起点が開き、記事やGitHubの操作は別にある。
- 統合する組は？ #1が元、#2のワークスペース招待の相談が先。
- 次は？ 「この会話を統合する内容を確認」で選択後の確認へ進む。

[375px](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-375.png)　[1024px](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-1024.png)　[1440px](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-1440.png)

### 55. menu-extensions-issues-link-1-reply-templates

担当者が記事添付と定型文のうち定型文を選ぶ。

- 何を選んだか？ 返信欄の「定型文を選ぶ」に青い枠がある。
- どの内容か？ 「お問い合わせの受付」と山田 花・Slideを含む英文を示す。
- いつ送るか？ 今の操作は下書き作成。返信欄にはプレビューと別の送信ボタンがある。

[375px](screens/menu-extensions-issues-link-1-reply-templates-375.png)　[1024px](screens/menu-extensions-issues-link-1-reply-templates-1024.png)　[1440px](screens/menu-extensions-issues-link-1-reply-templates-1440.png)

### 56. menu-extensions-rules-choice-menu-0

管理者が新規振り分けルールの適用製品を選ぶ。

- 対象機能は？ 0件の振り分けルール内の「新しいルール」。
- 現在の範囲は？ 「すべてのプロダクトに適用」にチェック。
- 何に絞れるか？ D印Desk・S印Slideの候補が別の行で並ぶ。

[375px](screens/menu-extensions-rules-choice-menu-0-375.png)　[1024px](screens/menu-extensions-rules-choice-menu-0-1024.png)　[1440px](screens/menu-extensions-rules-choice-menu-0-1440.png)

### 57. menu-extensions-rules-choice-menu-1

管理者がルールで付与するラベルを選ぶ。

- 現在は？ 「付けない」がチェックされている。
- 候補は？ 名前と色付きの点で再発行から領収書まで6種。
- 不足時は？ 末尾に「ラベルを管理」がある。375ではメニューが起点の上に開く。

[375px](screens/menu-extensions-rules-choice-menu-1-375.png)　[1024px](screens/menu-extensions-rules-choice-menu-1-1024.png)　[1440px](screens/menu-extensions-rules-choice-menu-1-1440.png)

### 58. menu-extensions-survey-choice-menu-0

管理者が解決アンケートの製品別文面を切り替える。

- 何の承認か？ 上に問い合わせ完了時の自動送信の承認。
- 今は？ 製品一覧でDeskにチェックがある。
- 切替先は？ Slideを選べ、背後の文例には解決確認の英文と専用リンクがある。

[375px](screens/menu-extensions-survey-choice-menu-0-375.png)　[1024px](screens/menu-extensions-survey-choice-menu-0-1024.png)　[1440px](screens/menu-extensions-survey-choice-menu-0-1440.png)

### 59. menu-home-account-menu

運営者が受信箱ナビからショートカット一覧を開こうとする。

- どこが起点か？ ナビ下端の三点ボタン。
- 何が選ばれているか？ 「キーボード操作 ？」に青いフォーカス枠がある。
- 作業場所はどこか？ 広幅は未対応7件の一覧を保持し、375はドロワーが前面にある。

[375px](screens/menu-home-account-menu-375.png)　[1024px](screens/menu-home-account-menu-1024.png)　[1440px](screens/menu-home-account-menu-1440.png)

### 60. menu-home-bulk-label

担当者が未対応の7件にまとめてラベルを付ける。

- 何件に作用するか？ 「7件を選択中」とチェック済みの行。
- 横棒の意味は？ 一部の会話に付いており、選ぶとすべてに付くとメニュー内で説明。
- 何を選べるか？ 再発行等6つの色点付き候補とラベル管理がある。

[375px](screens/menu-home-bulk-label-375.png)　[1024px](screens/menu-home-bulk-label-1024.png)　[1440px](screens/menu-home-bulk-label-1440.png)

### 61. menu-home-product-switcher

担当者が受信箱の対象製品を切り替える。

- 今の範囲は？ 「すべてのプロダクト」にチェック。
- 他には？ D印Desk、S印Slideから選ぶ。
- どこで開くか？ ナビの製品表示に青枠、375ではナビのドロワーを出した状態。

[375px](screens/menu-home-product-switcher-375.png)　[1024px](screens/menu-home-product-switcher-1024.png)　[1440px](screens/menu-home-product-switcher-1440.png)

### 62. menu-label-fd3f5651-bulk-assignee

担当者が請求で絞った未対応の2件の担当をまとめて決める。

- どの選択か？ 「未対応」と「2件を選択中」が上にあり、2行のうち一方に「別の返信で送信失敗」がある。
- 誰に渡せるか？ 佐藤 優・森 直子が別々の印と名前で並ぶ。
- 誰が選ばれているか？ 最初の佐藤 優は青いフォーカス枠で、氏名の左に選択チェックは見えない。

[375px](screens/menu-label-fd3f5651-bulk-assignee-375.png)　[1024px](screens/menu-label-fd3f5651-bulk-assignee-1024.png)　[1440px](screens/menu-label-fd3f5651-bulk-assignee-1440.png)

### 63. menu-label-fd3f5651-bulk-label

担当者が請求で絞った未対応の選択行に分類を付ける。

- 何件に作用するか？ 「2件を選択中」と「選択を解除」が同居する。
- 候補は？ 再発行・社内確認・経理・請求など6つに色点と名前がある。
- 適用状況は？ 請求にチェック、経理・領収書に一部を表す横棒がある。

[375px](screens/menu-label-fd3f5651-bulk-label-375.png)　[1024px](screens/menu-label-fd3f5651-bulk-label-1024.png)　[1440px](screens/menu-label-fd3f5651-bulk-label-1440.png)

### 64. menu-label-fd3f5651-choice-menu-0

担当者が請求で絞った未対応一覧の状態条件を確認する。

- 対象は？ 「未対応」2件の一覧で「絞り込み」が開いている。
- 現在の状態条件は？ 「未対応」にチェックが付く。
- 候補は？ 未対応・返信待ち・完了・迷惑メール・すべてが並び、最初の候補に青枠がある。

[375px](screens/menu-label-fd3f5651-choice-menu-0-375.png)　[1024px](screens/menu-label-fd3f5651-choice-menu-0-1024.png)　[1440px](screens/menu-label-fd3f5651-choice-menu-0-1440.png)

### 65. menu-label-fd3f5651-choice-menu-1

担当者が請求で絞った未対応一覧の製品範囲を変える。

- どの一覧か？ 「未対応」2件を保ったまま製品の選択肢が出る。
- 現在は？ 製品「すべて」にチェック。
- 他をどう見分けるか？ DeskとSlideには異なる製品印、全件の「すべて」には印がない。状態条件欄は「未対応」。

[375px](screens/menu-label-fd3f5651-choice-menu-1-375.png)　[1024px](screens/menu-label-fd3f5651-choice-menu-1-1024.png)　[1440px](screens/menu-label-fd3f5651-choice-menu-1-1440.png)

### 66. menu-label-fd3f5651-choice-menu-2

担当者が請求で絞った未対応のラベル条件を変える。

- 現在の絞り込みは？ 「請求」にチェックがある。
- 何を選べるか？ ラベル6種を色点と名前で並べ、末尾に管理への入口がある。
- どこに開くか？ 375では起点ラベルの上に展開、1024・1440では絞り込みパネルの下に展開する。

[375px](screens/menu-label-fd3f5651-choice-menu-2-375.png)　[1024px](screens/menu-label-fd3f5651-choice-menu-2-1024.png)　[1440px](screens/menu-label-fd3f5651-choice-menu-2-1440.png)

### 67. menu-label-fd3f5651-choice-menu-3

担当者が請求で絞った未対応一覧の順番を確認する。

- 対象は？ 「未対応」2件で、並び順は検索・絞り込みの隣。
- 今の順は？ 「待たせている順」にチェックと青い枠がある。
- 別の順は？ 「新しい順」がすぐ下にあり、会話を開かず選べる。

[375px](screens/menu-label-fd3f5651-choice-menu-3-375.png)　[1024px](screens/menu-label-fd3f5651-choice-menu-3-1024.png)　[1440px](screens/menu-label-fd3f5651-choice-menu-3-1440.png)

### 68. menu-label-fd3f5651-filter-assignee

担当者が請求で絞った未対応を運営者名で絞る。

- 何の選択か？ 絞り込みの「担当者」の下に一覧が出て、「未対応」2件のまま。
- 現在は？ 「すべて」にチェックがある。
- 誰が候補か？ すべて・緑の佐藤 優・青緑の森 直子が名前付きで並ぶ。

[375px](screens/menu-label-fd3f5651-filter-assignee-375.png)　[1024px](screens/menu-label-fd3f5651-filter-assignee-1024.png)　[1440px](screens/menu-label-fd3f5651-filter-assignee-1440.png)

### 69. menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee

担当者がDeskの自分の担当の1件の担当をまとめて決める。

- どの選択か？ 「自分の担当」と「1件を選択中」が上にあり、Desk・森 海斗の #3 に「未対応」が付く。
- 誰に渡せるか？ 佐藤 優・森 直子が別々の印と名前で並ぶ。
- 現在の担当は？ 佐藤 優にチェックがある。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-1440.png)

### 70. menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label

担当者がDeskの自分の担当の選択行に分類を付ける。

- 何件に作用するか？ 「1件を選択中」と「選択を解除」が同居する。
- 候補は？ 再発行・社内確認・経理・請求など6つに色点と名前がある。
- 次の行き先は？ 6候補のすぐ下に「ラベルを管理」があり、一覧の選択は背面に残る。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-1440.png)

### 71. menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0

担当者がDeskの自分の担当一覧の状態条件を確認する。

- 対象は？ 「自分の担当」1件の一覧で「絞り込み」が開いている。
- 現在の状態条件は？ 「すべて」にチェックが付く。
- 候補は？ 未対応・返信待ち・完了・迷惑メール・すべてが並び、最初の候補に青枠がある。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-1440.png)

### 72. menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1

担当者がDeskの自分の担当一覧の製品範囲を変える。

- どの一覧か？ 「自分の担当」1件を保ったまま製品の選択肢が出る。
- 現在は？ 製品「Desk」にチェック。
- 他をどう見分けるか？ DeskとSlideには異なる製品印、全件の「すべて」には印がない。状態条件欄は「すべて」。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-1440.png)

### 73. menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2

担当者がDeskの自分の担当のラベル条件を変える。

- 現在の絞り込みは？ 「すべてのラベル」にチェックがある。
- 何を選べるか？ ラベル6種を色点と名前で並べ、末尾に管理への入口がある。
- どこに開くか？ 375では起点ラベルの上に展開、1024・1440では絞り込みパネルの下に展開する。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-1440.png)

### 74. menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3

担当者がDeskの自分の担当一覧の順番を確認する。

- 対象は？ 「自分の担当」1件で、並び順は検索・絞り込みの隣。
- 今の順は？ 「待たせている順」にチェックと青い枠がある。
- 別の順は？ 「新しい順」がすぐ下にあり、会話を開かず選べる。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-1440.png)

### 75. menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee

担当者がDeskの自分の担当を運営者名で絞る。

- 何の選択か？ 絞り込みの「担当者」の下に一覧が出て、「自分の担当」1件のまま。
- 現在は？ 「佐藤 優」にチェックがある。
- 誰が候補か？ すべて・緑の佐藤 優・青緑の森 直子が名前付きで並ぶ。

[375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-375.png)　[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-1024.png)　[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-1440.png)

### 76. menu-settings-labels-add-label

管理者が新しいラベル名を入力する。

- どこが起点か？ 一覧右上の「ラベルを追加」に青枠。
- どこに入力するか？ 「ラベル名（20字まで）」の空欄に青いフォーカス枠。
- 確定は？ 黒い「追加する」が同じ小窓内にあり、表のラベルが下に続く。

[375px](screens/menu-settings-labels-add-label-375.png)　[1024px](screens/menu-settings-labels-add-label-1024.png)　[1440px](screens/menu-settings-labels-add-label-1440.png)

### 77. menu-settings-labels-label-actions-0

管理者が「再発行」の統合または削除を選ぶ。

- 対象は？ 1件の行の「操作」が青枠で、開いた面に「再発行」が出る。
- 統合先は？ 「まとめる先」に「社内確認」を表示する。
- ほかの操作は？ まとめる操作の下に「削除」が分かれて並ぶ。

[375px](screens/menu-settings-labels-label-actions-0-375.png)　[1024px](screens/menu-settings-labels-label-actions-0-1024.png)　[1440px](screens/menu-settings-labels-label-actions-0-1440.png)

### 78. menu-settings-labels-label-actions-1

管理者が「社内確認」の統合または削除を選ぶ。

- 対象は？ 1件の行の「操作」が青枠で、開いた面に「社内確認」が出る。
- 統合先は？ 「まとめる先」に「再発行」を表示する。
- ほかの操作は？ まとめる操作の下に「削除」が分かれて並ぶ。

[375px](screens/menu-settings-labels-label-actions-1-375.png)　[1024px](screens/menu-settings-labels-label-actions-1-1024.png)　[1440px](screens/menu-settings-labels-label-actions-1-1440.png)

### 79. menu-settings-labels-label-actions-2

管理者が「経理」の統合または削除を選ぶ。

- 対象は？ 2件の行の「操作」が青枠で、開いた面に「経理」が出る。
- 統合先は？ 「まとめる先」に「再発行」を表示する。
- ほかの操作は？ まとめる操作の下に「削除」が分かれて並ぶ。

[375px](screens/menu-settings-labels-label-actions-2-375.png)　[1024px](screens/menu-settings-labels-label-actions-2-1024.png)　[1440px](screens/menu-settings-labels-label-actions-2-1440.png)

### 80. menu-settings-labels-label-actions-3

管理者が「請求」の統合または削除を選ぶ。

- 対象は？ 2件の行の「操作」が青枠で、開いた面に「請求」が出る。
- 統合先は？ 「まとめる先」に「再発行」を表示する。
- ほかの操作は？ まとめる操作の下に「削除」が分かれて並ぶ。

[375px](screens/menu-settings-labels-label-actions-3-375.png)　[1024px](screens/menu-settings-labels-label-actions-3-1024.png)　[1440px](screens/menu-settings-labels-label-actions-3-1440.png)

### 81. menu-settings-labels-label-actions-4

管理者が「長期契約の更新手続きについて」の統合または削除を選ぶ。

- 対象は？ 1件の行の「操作」が青枠で、開いた面に「長期契約の更新手続きについて」が出る。
- 統合先は？ 「まとめる先」に「再発行」を表示する。
- ほかの操作は？ まとめる操作の下に「削除」が分かれて並ぶ。

[375px](screens/menu-settings-labels-label-actions-4-375.png)　[1024px](screens/menu-settings-labels-label-actions-4-1024.png)　[1440px](screens/menu-settings-labels-label-actions-4-1440.png)

### 82. menu-settings-labels-label-actions-5

管理者が「領収書」の統合または削除を選ぶ。

- 対象は？ 1件の行の「操作」が青枠で、開いた面に「領収書」が出る。
- 統合先は？ 「まとめる先」に「再発行」を表示する。
- ほかの操作は？ まとめる操作の下に「削除」が分かれて並ぶ。

[375px](screens/menu-settings-labels-label-actions-5-375.png)　[1024px](screens/menu-settings-labels-label-actions-5-1024.png)　[1440px](screens/menu-settings-labels-label-actions-5-1440.png)

### 83. menu-settings-labels-label-color-0

管理者が「再発行」の色を変える。

- どの行か？ 1件の「再発行」の色点と矢印に開いた枠がある。
- 現在の色は？ 下段左から3番目の茶系の丸にチェックが付く。
- 何を選ぶか？ 8つの丸が2行に並び、最初の候補に青いフォーカス枠。色名の文字は表示されない。

[375px](screens/menu-settings-labels-label-color-0-375.png)　[1024px](screens/menu-settings-labels-label-color-0-1024.png)　[1440px](screens/menu-settings-labels-label-color-0-1440.png)

### 84. menu-settings-labels-label-color-1

管理者が「社内確認」の色を変える。

- どの行か？ 1件の「社内確認」の色点と矢印に開いた枠がある。
- 現在の色は？ 上段右端の桃系の丸にチェックが付く。
- 何を選ぶか？ 8つの丸が2行に並び、最初の候補に青いフォーカス枠。色名の文字は表示されない。

[375px](screens/menu-settings-labels-label-color-1-375.png)　[1024px](screens/menu-settings-labels-label-color-1-1024.png)　[1440px](screens/menu-settings-labels-label-color-1-1440.png)

### 85. menu-settings-labels-label-color-2

管理者が「経理」の色を変える。

- どの行か？ 2件の「経理」の色点と矢印に開いた枠がある。
- 現在の色は？ 下段右端の灰系の丸にチェックが付く。
- 何を選ぶか？ 8つの丸が2行に並び、最初の候補に青いフォーカス枠。色名の文字は表示されない。

[375px](screens/menu-settings-labels-label-color-2-375.png)　[1024px](screens/menu-settings-labels-label-color-2-1024.png)　[1440px](screens/menu-settings-labels-label-color-2-1440.png)

### 86. menu-settings-labels-label-color-3

管理者が「請求」の色を変える。

- どの行か？ 2件の「請求」の色点と矢印に開いた枠がある。
- 現在の色は？ 上段左端の青系の丸にチェックが付く。
- 何を選ぶか？ 8つの丸が2行に並び、最初の候補に青いフォーカス枠。色名の文字は表示されない。

[375px](screens/menu-settings-labels-label-color-3-375.png)　[1024px](screens/menu-settings-labels-label-color-3-1024.png)　[1440px](screens/menu-settings-labels-label-color-3-1440.png)

### 87. menu-settings-labels-label-color-4

管理者が「長期契約の更新手続きについて」の色を変える。

- どの行か？ 1件の「長期契約の更新手続きについて」の色点と矢印に開いた枠がある。
- 現在の色は？ 下段左から2番目の黄緑系の丸にチェックが付く。
- 何を選ぶか？ 8つの丸が2行に並び、最初の候補に青いフォーカス枠。色名の文字は表示されない。

[375px](screens/menu-settings-labels-label-color-4-375.png)　[1024px](screens/menu-settings-labels-label-color-4-1024.png)　[1440px](screens/menu-settings-labels-label-color-4-1440.png)

### 88. menu-settings-labels-label-color-5

管理者が「領収書」の色を変える。

- どの行か？ 1件の「領収書」の色点と矢印に開いた枠がある。
- 現在の色は？ 上段左から2番目の水色系の丸にチェックが付く。
- 何を選ぶか？ 8つの丸が2行に並び、最初の候補に青いフォーカス枠。色名の文字は表示されない。

[375px](screens/menu-settings-labels-label-color-5-375.png)　[1024px](screens/menu-settings-labels-label-color-5-1024.png)　[1440px](screens/menu-settings-labels-label-color-5-1440.png)

### 89. menu-settings-labels-label-rename-0

管理者が「再発行」を改名する。

- 現在名は？ 吹き出しに「現在の名前：再発行」がある。
- 何を編集するか？ 20字までの入力欄に「再発行」が入っていてフォーカス枠が付く。
- どう終えるか？ フォームに「名前を変更」「取り消し」の2操作がある。

[375px](screens/menu-settings-labels-label-rename-0-375.png)　[1024px](screens/menu-settings-labels-label-rename-0-1024.png)　[1440px](screens/menu-settings-labels-label-rename-0-1440.png)

### 90. menu-settings-labels-label-rename-1

管理者が「社内確認」を改名する。

- 現在名は？ 吹き出しに「現在の名前：社内確認」がある。
- 何を編集するか？ 20字までの入力欄に「社内確認」が入っていてフォーカス枠が付く。
- どう終えるか？ フォームに「名前を変更」「取り消し」の2操作がある。

[375px](screens/menu-settings-labels-label-rename-1-375.png)　[1024px](screens/menu-settings-labels-label-rename-1-1024.png)　[1440px](screens/menu-settings-labels-label-rename-1-1440.png)

### 91. menu-settings-labels-label-rename-2

管理者が「経理」を改名する。

- 現在名は？ 吹き出しに「現在の名前：経理」がある。
- 何を編集するか？ 20字までの入力欄に「経理」が入っていてフォーカス枠が付く。
- どう終えるか？ フォームに「名前を変更」「取り消し」の2操作がある。

[375px](screens/menu-settings-labels-label-rename-2-375.png)　[1024px](screens/menu-settings-labels-label-rename-2-1024.png)　[1440px](screens/menu-settings-labels-label-rename-2-1440.png)

### 92. menu-settings-labels-label-rename-3

管理者が「請求」を改名する。

- 現在名は？ 吹き出しに「現在の名前：請求」がある。
- 何を編集するか？ 20字までの入力欄に「請求」が入っていてフォーカス枠が付く。
- どう終えるか？ フォームに「名前を変更」「取り消し」の2操作がある。

[375px](screens/menu-settings-labels-label-rename-3-375.png)　[1024px](screens/menu-settings-labels-label-rename-3-1024.png)　[1440px](screens/menu-settings-labels-label-rename-3-1440.png)

### 93. menu-settings-labels-label-rename-4

管理者が「長期契約の更新手続きについて」を改名する。

- 現在名は？ 吹き出しに「現在の名前：長期契約の更新手続きについて」がある。
- 何を編集するか？ 20字までの入力欄に「長期契約の更新手続きについて」が入っていてフォーカス枠が付く。
- 長い名前を確認できるか？ 375の起点は2行で末尾を省くが、吹き出しの見出しと入力には全文があり、変更・取り消しを選べる。

[375px](screens/menu-settings-labels-label-rename-4-375.png)　[1024px](screens/menu-settings-labels-label-rename-4-1024.png)　[1440px](screens/menu-settings-labels-label-rename-4-1440.png)

### 94. menu-settings-labels-label-rename-5

管理者が「領収書」を改名する。

- 現在名は？ 吹き出しに「現在の名前：領収書」がある。
- 何を編集するか？ 20字までの入力欄に「領収書」が入っていてフォーカス枠が付く。
- どう終えるか？ フォームに「名前を変更」「取り消し」の2操作がある。

[375px](screens/menu-settings-labels-label-rename-5-375.png)　[1024px](screens/menu-settings-labels-label-rename-5-1024.png)　[1440px](screens/menu-settings-labels-label-rename-5-1440.png)

### 95. menu-settings-operators-choice-menu-0

管理者が運営者一覧の並び順を選ぶ。

- 何を並べるか？ 運営者2人で、氏名・メール・権限が行ごとに見える。
- どの順か？ 「標準の順序」にチェックが付くが、基準はメニューに書かれていない。
- ほかの順は？ 「名前順」があり、権限の絞り込みは別の操作。

[375px](screens/menu-settings-operators-choice-menu-0-375.png)　[1024px](screens/menu-settings-operators-choice-menu-0-1024.png)　[1440px](screens/menu-settings-operators-choice-menu-0-1440.png)

### 96. menu-status-spam-48e45b08-bulk-assignee

担当者が迷惑メールの1件の担当をまとめて決める。

- どの選択か？ 「迷惑メール」と「1件を選択中」が上にあり、Slideの #9「未承諾の営業案内」が見える。
- 誰に渡せるか？ 佐藤 優・森 直子が別々の印と名前で並ぶ。
- 誰が選ばれているか？ 最初の佐藤 優は青いフォーカス枠で、氏名の左に選択チェックは見えない。

[375px](screens/menu-status-spam-48e45b08-bulk-assignee-375.png)　[1024px](screens/menu-status-spam-48e45b08-bulk-assignee-1024.png)　[1440px](screens/menu-status-spam-48e45b08-bulk-assignee-1440.png)

### 97. menu-status-spam-48e45b08-bulk-label

担当者が迷惑メールの選択行に分類を付ける。

- 何件に作用するか？ 「1件を選択中」と「選択を解除」が同居する。
- 候補は？ 再発行・社内確認・経理・請求など6つに色点と名前がある。
- 次の行き先は？ 6候補のすぐ下に「ラベルを管理」があり、一覧の選択は背面に残る。

[375px](screens/menu-status-spam-48e45b08-bulk-label-375.png)　[1024px](screens/menu-status-spam-48e45b08-bulk-label-1024.png)　[1440px](screens/menu-status-spam-48e45b08-bulk-label-1440.png)

### 98. menu-status-spam-48e45b08-choice-menu-0

担当者が迷惑メール一覧の状態条件を確認する。

- 対象は？ 「迷惑メール」1件の一覧で「絞り込み」が開いている。
- 現在の状態条件は？ 「迷惑メール」にチェックが付く。
- 候補は？ 未対応・返信待ち・完了・迷惑メール・すべてが並び、最初の候補に青枠がある。

[375px](screens/menu-status-spam-48e45b08-choice-menu-0-375.png)　[1024px](screens/menu-status-spam-48e45b08-choice-menu-0-1024.png)　[1440px](screens/menu-status-spam-48e45b08-choice-menu-0-1440.png)

### 99. menu-status-spam-48e45b08-choice-menu-1

担当者が迷惑メール一覧の製品範囲を変える。

- どの一覧か？ 「迷惑メール」1件を保ったまま製品の選択肢が出る。
- 現在は？ 製品「すべて」にチェック。
- 他をどう見分けるか？ DeskとSlideには異なる製品印、全件の「すべて」には印がない。状態条件欄は「迷惑メール」。

[375px](screens/menu-status-spam-48e45b08-choice-menu-1-375.png)　[1024px](screens/menu-status-spam-48e45b08-choice-menu-1-1024.png)　[1440px](screens/menu-status-spam-48e45b08-choice-menu-1-1440.png)

### 100. menu-status-spam-48e45b08-choice-menu-2

担当者が迷惑メールのラベル条件を変える。

- 現在の絞り込みは？ 「すべてのラベル」にチェックがある。
- 何を選べるか？ ラベル6種を色点と名前で並べ、末尾に管理への入口がある。
- どこに開くか？ 375では起点ラベルの上に展開、1024・1440では絞り込みパネルの下に展開する。

[375px](screens/menu-status-spam-48e45b08-choice-menu-2-375.png)　[1024px](screens/menu-status-spam-48e45b08-choice-menu-2-1024.png)　[1440px](screens/menu-status-spam-48e45b08-choice-menu-2-1440.png)

### 101. menu-status-spam-48e45b08-choice-menu-3

担当者が迷惑メール一覧の順番を確認する。

- 対象は？ 「迷惑メール」1件で、並び順は検索・絞り込みの隣。
- 今の順は？ 「待たせている順」にチェックと青い枠がある。
- 別の順は？ 「新しい順」がすぐ下にあり、会話を開かず選べる。

[375px](screens/menu-status-spam-48e45b08-choice-menu-3-375.png)　[1024px](screens/menu-status-spam-48e45b08-choice-menu-3-1024.png)　[1440px](screens/menu-status-spam-48e45b08-choice-menu-3-1440.png)

### 102. menu-status-spam-48e45b08-filter-assignee

担当者が迷惑メールを運営者名で絞る。

- 何の選択か？ 絞り込みの「担当者」の下に一覧が出て、「迷惑メール」1件のまま。
- 現在は？ 「すべて」にチェックがある。
- 誰が候補か？ すべて・緑の佐藤 優・青緑の森 直子が名前付きで並ぶ。

[375px](screens/menu-status-spam-48e45b08-filter-assignee-375.png)　[1024px](screens/menu-status-spam-48e45b08-filter-assignee-1024.png)　[1440px](screens/menu-status-spam-48e45b08-filter-assignee-1440.png)

### 103. menu-tokens-choice-menu-0

管理者が発行済みAPIトークンの並び順を確かめる。

- 対象は？ 発行済み1件、「運営用CLI」が閲覧権限を持つ。
- 何順か？ 「標準の順序」がチェックされ、次の候補は「名前順」。
- 他の操作は？ 権限の絞り込み、失効操作、新規発行の入力欄がそれぞれ別にある。

[375px](screens/menu-tokens-choice-menu-0-375.png)　[1024px](screens/menu-tokens-choice-menu-0-1024.png)　[1440px](screens/menu-tokens-choice-menu-0-1440.png)

### 104. menu-view-feedback-834dd78f-bulk-label

担当者がフィードバックの選択行にラベルを付ける。

- 対象は？ フィードバック1件、1件を選択中とある。
- 何を選べるか？ 再発行から領収書まで6種と「ラベルを管理」。
- 別の作用は？ 選択バーに別操作「迷惑メールにする」があり、ラベルの起点は青枠。

[375px](screens/menu-view-feedback-834dd78f-bulk-label-375.png)　[1024px](screens/menu-view-feedback-834dd78f-bulk-label-1024.png)　[1440px](screens/menu-view-feedback-834dd78f-bulk-label-1440.png)

### 105. operators

管理者が所属運営者と権限を一覧する。

- 誰がいるか？ 佐藤 優と森 直子が氏名・メール付きで並ぶ。
- 権限は？ 佐藤が管理者、森が担当者。
- どう絞る・変更するか？ 検索・権限フィルター・並び順を上に置き、編集は個々の行にある。

[375px](screens/operators-375.png)　[1024px](screens/operators-1024.png)　[1440px](screens/operators-1440.png)

### 106. product-emoji

Slideの利用者が絵文字印の窓口を識別して問い合わせる。

- どの製品か？ 見出しの前にフォルダの絵文字とSlide。
- 何が必要か？ 「すべての項目を入力」と件名・内容・連絡先メール。
- どこから送るか？ 入力列の下に黒い「送信」が単独である。

[375px](screens/product-emoji-375.png)　[1024px](screens/product-emoji-1024.png)　[1440px](screens/product-emoji-1440.png)

### 107. product-icon-settings

管理者が製品印の種類と送信者表示を設定する。

- どの製品か？ 茶色のSとSlide。
- 現在の印は？ 「プロダクトのアイコンを変更」が展開され「名前の頭文字」を表示、保存は印の直下。
- メールへの反映は？ 差出人名Slideと運営者名を含めるチェック欄、別の「差出人を保存」がある。

[375px](screens/product-icon-settings-375.png)　[1024px](screens/product-icon-settings-1024.png)　[1440px](screens/product-icon-settings-1440.png)

### 108. product-image

Slideの利用者が画像印の窓口から問い合わせる。

- どの製品か？ 濃色の四角に白い図柄の画像とSlideが並ぶ。
- どれを入力するか？ 件名、広いお問い合わせ内容、連絡先メールの順。
- 送信は？ 3欄の下に「送信」、広い幅でもフォーム幅は抑えている。

[375px](screens/product-image-375.png)　[1024px](screens/product-image-1024.png)　[1440px](screens/product-image-1440.png)

### 109. product-switcher

運営者がSlideに絞った受信箱の範囲を変える。

- 現在は？ 製品起点はS印、メニューでSlideにチェック。
- ほかの範囲は？ 全製品とDeskが同じメニューにある。
- 影響の見当は？ 広幅の背景は「未対応」6件、375ではドロワー内に対象の件数が見える。

[375px](screens/product-switcher-375.png)　[1024px](screens/product-switcher-1024.png)　[1440px](screens/product-switcher-1440.png)

### 110. route-extensions-chat-preview-slide

設置担当者がSlideの埋め込みチャットの起動前表示を確認する。

- どの製品か？ 上部にSlideとある。
- 何を試すか？ 「ヘルプボタンを押して、チャットの見え方を確認できます」とある。
- どこを押すか？ 3幅とも右下に黒い「ヘルプ」があり、本文中央は空いている。

[375px](screens/route-extensions-chat-preview-slide-375.png)　[1024px](screens/route-extensions-chat-preview-slide-1024.png)　[1440px](screens/route-extensions-chat-preview-slide-1440.png)

### 111. settings-home

管理者が設定したい項目を探す。

- 何があるか？ 製品と窓口、運営者、ラベル、保存期間、APIトークンが行で並ぶ。
- 現状は？ 窓口2件、運営者2人、ラベル6件、保存無期限、トークン0件。
- どう進むか？ 検索欄と各行の右矢印、下には連絡先削除を扱う別のデータ管理枠がある。

[375px](screens/settings-home-375.png)　[1024px](screens/settings-home-1024.png)　[1440px](screens/settings-home-1440.png)

### 112. suggest-settings

管理者が記事のおすすめ条件と使用モデルを調整する。

- 基準は？ 提示確率の下限60%と、高い順に3件までの説明。
- 何を使い分けるか？ チャット・フォームはClef Flash、受付返信・運営画面はClefと別々に選ぶ。
- どう反映するか？ 自動受付返信に関連記事を添えるチェックは空、保存・取り消しが並ぶ。

[375px](screens/suggest-settings-375.png)　[1024px](screens/suggest-settings-1024.png)　[1440px](screens/suggest-settings-1440.png)

### 113. tokens

管理者が初めてAPIトークンを発行する。

- もう発行済みか？ 0件、鍵の印と「発行済みのトークンはありません」。
- 何を指定するか？ トークン名と権限の欄、権限は閲覧。
- どう始めるか？ 新規発行枠に黒い「発行する」が1つある。

[375px](screens/tokens-375.png)　[1024px](screens/tokens-1024.png)　[1440px](screens/tokens-1440.png)
