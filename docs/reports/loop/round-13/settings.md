# 設定・拡張・メニューの画像レビュー

同じ状態の375×812、1024×900、1440×900を横に並べ、113状態、計339枚を比較した。画面名にはPNGの接頭辞を使う。全状態の目的・問い・観察を下に記録した。

## 判定

この339枚で、操作が停止したことや誤った送信が行われたことを確認した高の指摘は0件。中10件、低2件。最も繰り返し影響するのは375pxの受信箱の行、1024pxの集計ナビ、製品別の公開設定。一覧・一括操作が混ざる領域のため、他領域との集計時は同じ現象を重複計上しない。

画像から読めるのは撮影時の表示と位置である。クリック・送信・削除・承認・フォーカス復帰・待ち時間・取り消し・ヒット領域・スクロールの成否は未検証。特にルールの削除確認は直前のスクロール位置が不明で、背景の移動を断定できない。入力のない公開フォーム画像から、空送信後の振る舞いも判定できない。

## 問題と期待

### 1. 中　受信箱の行で担当・選択・配達状態を探し直す

対象幅　375px。対象状態　`extension-spam`、`menu-home-bulk-label`、`menu-label-fd3f5651-bulk-assignee`、`menu-label-fd3f5651-bulk-label`、`menu-label-fd3f5651-choice-menu-3`、`menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee`、`menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3`、`menu-status-spam-48e45b08-bulk-assignee`、`menu-status-spam-48e45b08-choice-menu-3`。

実際　#4では件名、抜粋、送信失敗、ラベルが4段に散り、選択欄は送信者マークの下にある。#9でも選択欄・時刻・空の点線丸が別の高さにある。1024・1440では選択欄の次に人物があり時刻が右に揃う。

期待　375でも選択欄と人物・製品の読み始めを固定し、2行の中で失敗などの重要な状態を見分けられる。

### 2. 中　細いサイドバーで2種類の集計が区別しにくい

対象幅　1024px。対象状態　`extension-spam`、`menu-home-account-menu`、`menu-label-fd3f5651-bulk-assignee`。

実際　同じ折れ線アイコンに「声」「対応」だけを添えている。1440では「声の集計」「対応状況の集計」を読める。

期待　細いナビでも各移動先を判別できる表示にする。ツールチップとアクセシブル名の有無は未検証。

### 3. 中　GitHub起票フォームが別カードを空枠に見せる

対象幅　375・1440px。対象状態　`menu-extensions-issues-link-1-operation-issues-issues.preview`。

実際　起票元・投稿先・2つの入力欄の小窓が「課題を起票する」起点より上に出て、背後には切れた空のカード枠だけが重なる。1024では「GitHub Issue」の直下から書き始められる。

期待　起票元と投稿先、入力欄、確認操作を一つのフォームとして読め、別の拡張の空枠と混同しない。

### 4. 中　ローカル端末の受付と公開受付の表現が同じ

対象幅　375・1024・1440px。対象状態　`guide-chat`、`guide-feedback`、`guide-form`。

実際　Deskに「公開窓口を http://127.0.0.1:… で利用できるようにします」「このサイトで受付を開始」と表示。端末で試すためのURLであるという説明は別製品SlideのURL付近にある。

期待　ローカル環境ではDeskの開始操作の隣でも利用範囲が読め、外部の顧客がアクセスできる公開窓口と混同しない。本番でのURLや公開成功は未検証。

### 5. 中　公開設定で何をどこまで済ませたか一覧できない

対象幅　375・1024・1440px。対象状態　`guide-chat`、`guide-form`。

実際　Deskの開始ボタンとSlideの入力・保存・公開画面・埋め込みの操作が製品カードに縦積み。各製品の有効状態や設定済みの項目を示す共通の要約行が無い。375でチャットのSlide側にスクロールすると製品と目的の組を見失いやすい。

期待　製品、受付の現在値、次の設定を同じ位置で読め、個別の編集は必要なときに開ける。

### 6. 中　アカウントの画像欄だけが英語のまま

対象幅　375・1024・1440px。対象状態　`account`。

実際　表示名・アイコン画像・保存は日本語だが、ファイルの選択と未選択状態は「Choose File」「No file chosen」。

期待　日本語の画面で、ファイルを選ぶ操作と選択の有無も日本語で読める。撮影ブラウザー以外での表示は未検証。

### 7. 中　設定前の配信先がサービス名までしか読めない

対象幅　375・1024・1440px。対象状態　`extension-notify`、`guide-notify`。

実際　新着通知の有効カードと設定ページに「通知先：Slack」。通知を受けるワークスペース・チャンネル等を特定できる表示がない。接続手順は閉じている。

期待　有効な通知先を担当者が確認できる表示にする。手順展開後の情報、送信実績は未検証。

### 8. 中　受付用の振り分けルールで初期値と保存の強さが矛盾する

対象幅　375・1024・1440px。対象状態　`guide-rules`、`menu-extensions-rules-choice-menu-0`、`menu-extensions-rules-choice-menu-1`。

実際　ラベルは「付けない」、担当者は「変更しない」で選択が必要との説明がある一方、「ルールを保存」は入力済みと同じ強さの黒い主操作。

期待　必要な選択が残っている状態を、次に選ぶべき欄および保存の見た目で伝える。空のまま押した結果は未検証。

### 9. 中　色を変える起点と候補の意味が小さな丸だけで示される

対象幅　375・1024・1440px。対象状態　`behavior-label-swatches`、`label-colors`、`menu-settings-labels-label-color-0`、`menu-settings-labels-label-color-1`、`menu-settings-labels-label-color-2`、`menu-settings-labels-label-color-3`、`menu-settings-labels-label-color-4`、`menu-settings-labels-label-color-5`。

実際　一覧のラベル左には小さい色点だけがあり、開いたパレットにも色名が出ない。灰・茶・青など暗い円を見比べる必要がある。選択済みの色にはチェックがある。

期待　色を変える入口と選択中・候補の色名を、色の違いだけに頼らず把握できる。ホバー名・読み上げは未検証。

### 10. 中　公開前のおすすめ設定に技術名が集中している

対象幅　375・1024・1440px。対象状態　`suggest-settings`。

実際　「CSP の設定」「記事を提示する確率の下限（%）」「Clef」「Clef Flash」が近接する。60の意味は書かれているが、2モデルの違いは見えない。

期待　運営者がチャット・返信に何が変わるかを読んで選べ、技術的な詳細はその後に確認できる。

### 11. 低　部品見本の担当者表示が一文字で途切れる

対象幅　375px。対象状態　`menu-dev-ui-gallery-list-menu`。

実際　2行の右端でラベル「請求」の隣に「佐」のみが残る。

期待　見本の狭幅行でも担当の意味を識別できる。

### 12. 低　公開ヘルプの2つの出口が隣接する

対象幅　375・1024・1440px。対象状態　`extension-chat`。

実際　「ヘルプ記事の一覧」「メールで問い合わせる」が同じ下線の色でほぼ続けて並ぶ。

期待　自己解決を続ける先と問い合わせる先を、行間やスペースでひと目で区別できる。クリック領域は未検証。

## 状態ごとの比較

各項目の対象幅は375・1024・1440px。「観察」は3幅を比較した結果で、幅を指定しない記述は共通の内容、または指定した表示の存在を示す。

### account

担当者が自分のプロフィールを更新する。　[375](screens/account-375.png) / [1024](screens/account-1024.png) / [1440](screens/account-1440.png)

- 誰のアカウントか → sato@example.com。
- 何を変更できるか → 表示名の佐藤 優とアイコン画像。
- どう反映するか →「アカウントを保存」。

観察　丸い「佐」をアドレスに添える。画像の形式・容量・切り抜きの説明がファイル選択欄の下にある。黒い保存と取り消しが横に並ぶ。3幅ともファイル欄だけ英語。

### behavior-label-add

管理者が一覧にラベルを追加する。　[375](screens/behavior-label-add-375.png) / [1024](screens/behavior-label-add-1024.png) / [1440](screens/behavior-label-add-1440.png)

- 何を入力するか → ラベル名。
- 制約は何か → 20字まで。
- どこで確定するか → 小窓の「追加する」。

観察　起点は表の右上。小窓は白地で表に重なり、ラベル一覧の罫線が左右に残る。375では確定ボタンが小窓の幅を使い、広幅では文言幅。

### behavior-label-delete

管理者が既存ラベルの削除範囲を確かめる。　[375](screens/behavior-label-delete-375.png) / [1024](screens/behavior-label-delete-1024.png) / [1440](screens/behavior-label-delete-1440.png)

- 何を消すか → 経理。
- 何件変わるか → 2件の会話から外す。
- 実行・中止はどれか → 赤枠の削除とキャンセル。

観察　中央の確認面だけ白い。名前と会話数が文章に入る。下端で安全側のキャンセルが左、削除が右。背景との水平位置は一覧像と整合する。

### behavior-label-merge

管理者がラベルを別のラベルに統合する。　[375](screens/behavior-label-merge-375.png) / [1024](screens/behavior-label-merge-1024.png) / [1440](screens/behavior-label-merge-1440.png)

- どのラベルか → 経理。
- どこへ何件か → 再発行へ2件。
- 確定はどれか →「別のラベルにまとめる」。

観察　白いダイアログを中央に出す。操作名は見出しとボタンで一致。キャンセルと黒い確定が並び、各幅でどちらも読める。

### behavior-label-rename

管理者が一覧で経理ラベルを改名する。　[375](screens/behavior-label-rename-375.png) / [1024](screens/behavior-label-rename-1024.png) / [1440](screens/behavior-label-rename-1440.png)

- 元の名は何か → 経理。
- 新しい名の制約は → 20字まで。
- 保存方法は →「名前を変更」。

観察　対象名のボタンに青枠。小窓の入力欄に元名が入り、入力前の状態が読める。変更と取り消しが縦に配置される。

### behavior-label-swatches

管理者が経理ラベルの色を確認する。　[375](screens/behavior-label-swatches-375.png) / [1024](screens/behavior-label-swatches-1024.png) / [1440](screens/behavior-label-swatches-1440.png)

- どの行か → 経理。
- 何色から選べるか → 2行4列の8色。
- 現在はどれか → 下段右の灰色にチェック。

観察　行の小さな色点を青枠で示す。色は大きい円、選択印は円の内側。小窓は名称・件数を一部覆い、文字での色名は見えない。

### behavior-product-add

管理者が新しい窓口を登録し自動送信の内容を確認する。　[375](screens/behavior-product-add-375.png) / [1024](screens/behavior-product-add-1024.png) / [1440](screens/behavior-product-add-1440.png)

- 何を登録するか → 名称、窓口アドレスの先頭、送信ドメイン。
- 何を承認するか → 新着通知、自動受付返信、解決アンケート。
- 確定はどれか →「自動送信を承認して窓口を登録」。

観察　通知先と文面の確認先に新しいタブを明記。ドメインは選択欄。375では説明が折り返し、確定は画像下端より下、広幅では承認文言と同時に見える。

### extension-articles

編集者がヘルプ記事の公開状況を調べる。　[375](screens/extension-articles-375.png) / [1024](screens/extension-articles-1024.png) / [1440](screens/extension-articles-1440.png)

- 何件か → 1件。
- 公開したのは何か → Slideの「領収書を発行する」、公開中。
- 次の操作は → 記事を書く／記事が無かった質問／候補0件。

観察　黒い執筆ボタンが1つ。検索と公開状態を記事より上に置く。375では1行分の記事を3段にして更新日・ゼロの指標も読める。

### extension-auto-ack

管理者が自動受付返信の稼働状態を確認する。　[375](screens/extension-auto-ack-375.png) / [1024](screens/extension-auto-ack-1024.png) / [1440](screens/extension-auto-ack-1440.png)

- 使えるか → 有効。
- 何を送るか → 初めて届いた問い合わせメールへの受付のお知らせ。
- どこで文面を見るか → カードの設定。

観察　展開中の設定フォームは無い。スイッチの隣に「有効」。375では隔離カードに続く2番目のカードに自動返信がある。

### extension-canned

担当者が定型返信の内容を確認して下書きを作る。　[375](screens/extension-canned-375.png) / [1024](screens/extension-canned-1024.png) / [1440](screens/extension-canned-1440.png)

- 何を使うか → お問い合わせの受付。
- 宛名と製品は → 山田 花、Slide。
- 今送るか → 項目は「定型文から下書きを作成」。

観察　定型文を選ぶ起点に青枠。英文の本文例と日本語の宛名が見える。作成先は返信欄で、送信系ボタンはグレー。

### extension-chat

顧客がSlideのヘルプで質問する。　[375](screens/extension-chat-375.png) / [1024](screens/extension-chat-1024.png) / [1440](screens/extension-chat-1440.png)

- 誰が答えるか → 関連記事を自動で探し、問い合わせ後に担当者が読む。
- どこに書くか →「質問」の入力欄。
- 別の経路は → 記事の一覧とメール問い合わせ。

観察　製品マークとSlide名がヘッダーにある。質問するだけ黒い。2つのリンクはフッターの罫線の下、3幅とも表示される。

### extension-export

管理者が全期間のデータを個人情報の扱いと併せて書き出す。　[375](screens/extension-export-375.png) / [1024](screens/extension-export-1024.png) / [1440](screens/extension-export-1440.png)

- 範囲は → 全期間・全製品の会話11件、メッセージ17件、操作履歴12件。
- 何を伏せるか → メールアドレスと登録名、住所等の自由記述は残る。
- 形式と実行は → JSON Linesを書き出す。

観察　範囲の説明が操作より先。選択値は「伏せて書き出す」。権限のカードを分離し、本文閲覧の権限を示す。

### extension-feedback

担当者が受け取った意見を確認しチームに残す。　[375](screens/extension-feedback-375.png) / [1024](screens/extension-feedback-1024.png) / [1440](screens/extension-feedback-1440.png)

- 何の声か → #10「運営画面をキーボードで使っています」。
- 処理できることは → 確認済みにする／問い合わせに変更。
- メモは誰に届くか →「相手には送られません」。

観察　黒い確認済みと白い変更を分ける。「受付済み」を文字で示す。メモ欄が淡い黄で、375ではツールバーが3段。

### extension-form

顧客がSlideへ問い合わせを送る。　[375](screens/extension-form-375.png) / [1024](screens/extension-form-1024.png) / [1440](screens/extension-form-1440.png)

- どの製品か → SマークのSlide。
- 何が必要か → 件名・問い合わせ内容・連絡先メールアドレス、すべて必須。
- どこで提出するか → 黒い「送信」。

観察　製品名の下に罫線。本文だけ複数行。375では各欄を一列に積み、送信は左端。

### extension-issues

担当者が問い合わせからGitHub課題の公開情報を準備する。　[375](screens/extension-issues-375.png) / [1024](screens/extension-issues-1024.png) / [1440](screens/extension-issues-1440.png)

- 元の対象は → #1 領収書の宛名を変更できますか。
- 投稿先は → example/helpdesk。
- どこまで進むか → タイトルと公開要約を記入し、起票内容を確認。

観察　関連付けた課題が0件。青枠はタイトル入力。375は全面の関連情報、1024は暗い背景と右シート、1440は本文右のパネル。

### extension-merge

担当者が2つの問い合わせをまとめる。　[375](screens/extension-merge-375.png) / [1024](screens/extension-merge-1024.png) / [1440](screens/extension-merge-1440.png)

- 元は → #1 領収書の宛名を変更できますか。
- 候補は → 1件、#2 ワークスペースの招待メールについて。
- 押すとどう進む表示か → 統合する内容を確認。

観察　統合元と統合先を文字で区別。選択欄の枠は青。375では閉じるが上端にあり、1440では本文横で比較できる。

### extension-metrics

管理者が期間内の解決状況を見る。　[375](screens/extension-metrics-375.png) / [1024](screens/extension-metrics-1024.png) / [1440](screens/extension-metrics-1440.png)

- 対象は → すべてのプロダクト、過去30日。
- 平均と一度で解決した割合は → 4日、100%（対象1件）。
- 未計測はどう読むか → 平均作業時間はデータなし、少数の注意文あり。

観察　主要値に太い左線。割合と分母を近接させる。広幅は3・2・3枚の行、375では1列で主要値から始まる。

### extension-notify

管理者が新着通知の接続状態を調べる。　[375](screens/extension-notify-375.png) / [1024](screens/extension-notify-1024.png) / [1440](screens/extension-notify-1440.png)

- 使えるか → 新着通知は有効。
- 宛先は → Slack。
- どこを開くか → 新着通知カードの設定。

観察　「整える」の下にベルを配置。有効と無効を文字とスイッチで区別。375では通知の前後に別機能が1枚ずつ見える。

### extension-presence

担当者が二重対応を避けるため閲覧中の人を確認する。　[375](screens/extension-presence-375.png) / [1024](screens/extension-presence-1024.png) / [1440](screens/extension-presence-1440.png)

- 誰かいるか → ほかに閲覧中の担当者はいません。
- 同じ相手のほかの会話は → ありません。
- 経緯はどこか → 操作履歴。

観察　人物の輪郭アイコンと見出しを併記。空の状態を短文で説明。375・1024は閉じる付き、1440は開いた本文横に並ぶ。

### extension-rules

管理者が受信時の割り当てルールの稼働と登録数を見る。　[375](screens/extension-rules-375.png) / [1024](screens/extension-rules-1024.png) / [1440](screens/extension-rules-1440.png)

- 有効か → 有効。
- 何件か → 登録済み0件。
- どこで作るか → 振り分けルールの設定。

観察　有効でも登録が0件と区別できる。説明は条件と結果の順。「書き出し」「アンケート」の無効スイッチと同じ配置。

### extension-snooze

担当者が未対応の会話を日時指定で保留する。　[375](screens/extension-snooze-375.png) / [1024](screens/extension-snooze-1024.png) / [1440](screens/extension-snooze-1440.png)

- 現在は → 保留されていない。
- どの時刻系か → 日本時間。
- 実行は → 指定日時まで保留。

観察　「その他の操作」に青枠。日時欄はネイティブ風の英字プレースホルダー。迷惑メールにするが同じ小窓に続く。

### extension-spam

担当者が隔離された会話を探す。　[375](screens/extension-spam-375.png) / [1024](screens/extension-spam-1024.png) / [1440](screens/extension-spam-1440.png)

- 何件か → 1件。
- どれか → #9 Slide、山田 花さん「未承諾の営業案内」。
- どう探すか → 検索、絞り込み、待たせている順。

観察　迷惑メールの解除可能な条件チップ。375でチェック欄が人物の下、1024・1440で行の左。9時間前とメールの抜粋がある。

### extension-survey

顧客が解決したかを回答する。　[375](screens/extension-survey-375.png) / [1024](screens/extension-survey-1024.png) / [1440](screens/extension-survey-1440.png)

- 対象は → Slide、問い合わせ #8。
- 何を問うか → 問い合わせは解決しましたか。
- どう送るか → 選んだ回答を送信、はい／いいえ。

観察　製品マークと罫線。両方の回答が同じ白枠。3幅とも1行で、送信される旨が直前にある。

### extensions

管理者が利用中の拡張を探して設定する。　[375](screens/extensions-375.png) / [1024](screens/extensions-1024.png) / [1440](screens/extensions-1440.png)

- いくつ有効か → 16件。
- どこで探すか → 検索と有効状態。
- どこを設定するか → 各カードのスイッチと「設定」。

観察　「受け付ける」「答える」で分類。広幅は最初の5枚を上3・下2で配置。375は一列で各カードに有効という文字。

### guide-articles

管理者が記事管理と製品別公開ページを確認する。　[375](screens/guide-articles-375.png) / [1024](screens/guide-articles-1024.png) / [1440](screens/guide-articles-1440.png)

- どこで編集するか → 記事の管理を開く。
- 何が公開先か → Desk・Slideごとのヘルプページ。
- どう埋め込むか → コードをコピー。

観察　製品ごとに独立したカード。URLとiframe例が近い。375ではDeskのURLが「de」「sk/」で折れる。

### guide-auto-ack

管理者が自動受付メールの承認と送信例を照合する。　[375](screens/guide-auto-ack-375.png) / [1024](screens/guide-auto-ack-1024.png) / [1440](screens/guide-auto-ack-1440.png)

- いつ送るか → 初回受付時。
- 誰の承認でどの範囲か → 佐藤 優、全製品。
- 何を送るか → Deskの件名と自動受付の英文例。

観察　承認日時に日本時間を付記。Deskの印が製品選択にある。375は本文例まで、広幅は下の編集欄も見える。

### guide-canned

管理者が保存済み定型文を調べて追加する。　[375](screens/guide-canned-375.png) / [1024](screens/guide-canned-1024.png) / [1440](screens/guide-canned-1440.png)

- 登録数は → 1件。
- 何を再利用するか →「お問い合わせの受付」の本文。
- 新規作成に必要なものは → 表示名と本文。

観察　検索と順序を上部に配置。保存済み行の右に編集。広幅では新規入力の560px幅と権限カードの長さが異なる。

### guide-chat

管理者が製品別にヘルプチャットを設定する。　[375](screens/guide-chat-375.png) / [1024](screens/guide-chat-1024.png) / [1440](screens/guide-chat-1440.png)

- Deskの状態は → このサイトで受付を開始する状態。
- Slideで何を変えるか → 埋め込み先と返信の目安。
- 顧客画面を確認できるか → 広幅にヘルプチャットを開く。

観察　製品マークがカードの先頭。2件の保存操作が同じSlideカードに並ぶ。375ではSlideの後続の確認・埋め込み情報が下へ続く。

### guide-export

管理者が書き出しの範囲を確かめる。　[375](screens/guide-export-375.png) / [1024](screens/guide-export-1024.png) / [1440](screens/guide-export-1440.png)

- 対象は → 全製品、会話11件ほか。
- 現在の個人情報設定は → 伏せて書き出す。
- 必要な権限は → 問い合わせ本文の閲覧。

観察　説明は処理前に読める。実行ボタンは選択欄の下。権限は独立した最終カード。

### guide-feedback

管理者がフィードバックの受付と掲出方法を確認する。　[375](screens/guide-feedback-375.png) / [1024](screens/guide-feedback-1024.png) / [1440](screens/guide-feedback-1440.png)

- 受信側は → フィードバックの受信箱。
- どの製品を開始できるか → Desk。
- Slideの公開面は → フィードバックを開く、URLとiframe。

観察　製品名・マークで二面を分離。ローカルURLに注意書きが付くのはSlide側。375ではDeskとSlideカードの冒頭を表示。

### guide-form

管理者が製品別の問い合わせフォームを用意する。　[375](screens/guide-form-375.png) / [1024](screens/guide-form-1024.png) / [1440](screens/guide-form-1440.png)

- 何を試すか → 公開フォームから送って受信箱で確認。
- Deskの受付先は → このサイト、127.0.0.1とポートを表示。
- Slideで確認できることは → 公開フォームと受信箱。

観察　フォーム・受信箱が隣接。埋め込み情報はその下。375では上部にDeskの受付開始、下部にSlideのURLと注意書き。

### guide-issues

管理者がGitHub連携に使うリポジトリを設定する。　[375](screens/guide-issues-375.png) / [1024](screens/guide-issues-1024.png) / [1440](screens/guide-issues-1440.png)

- トークンは → 設定済み。
- どの製品に設定済みか → Slideはexample/helpdesk、Deskは空欄。
- 次の操作は → Deskは登録、Slideは更新。

観察　製品マークと名前の組。接続の設定手順は折りたたみ。英語の形式例owner/repositoryが空欄の中にある。

### guide-merge

管理者が統合条件を知って対象の会話を探す。　[375](screens/guide-merge-375.png) / [1024](screens/guide-merge-1024.png) / [1440](screens/guide-merge-1440.png)

- 何をまとめられるか → 同じ相手・同じ窓口。
- どちらに残るか → 開いている会話のメッセージが選んだ会話にまとまる。
- どこで始めるか → 受信箱で会話を選ぶ。

観察　冒頭の説明は1段落。操作入口は一つ。追加権限なしが独立カードで、375では入口が本文幅いっぱい。

### guide-metrics

管理者が集計の使い方を確認する。　[375](screens/guide-metrics-375.png) / [1024](screens/guide-metrics-1024.png) / [1440](screens/guide-metrics-1440.png)

- 何を選ぶか → プロダクトと期間。
- 何が見られるか → 問い合わせを完了した前後の指標。
- 次は → 集計画面を開く。

観察　短い説明の直下に遷移ボタン。権限カードは下。375はボタンが本文幅、広幅は文字幅。

### guide-notify

管理者が通知先と接続方法を調べる。　[375](screens/guide-notify-375.png) / [1024](screens/guide-notify-1024.png) / [1440](screens/guide-notify-1440.png)

- サービスは → Slack。
- 具体的なワークスペース／チャンネルは → この画像には出ていない。
- 必要な権限は → 外部接続・本文閲覧・メール送信。

観察　通知先は1行。設定手順は折りたたみ。権限カードが下にあり、指示のない大きな余白が残る。

### guide-presence

管理者が同時閲覧表示の意味を調べる。　[375](screens/guide-presence-375.png) / [1024](screens/guide-presence-1024.png) / [1440](screens/guide-presence-1440.png)

- 誰を表示するか → 他に対応中の担当者。
- 何が違うか → 閲覧中・入力中。
- 自分だけのときは → 該当担当者がいない旨、受信箱で会話を選べる。

観察　本文で返信欄と関連情報の違いを説明。入口は一つ。追加権限なしのカードはほかの案内と同位置。

### guide-rules

管理者が初めて受信ルールを作る。　[375](screens/guide-rules-375.png) / [1024](screens/guide-rules-1024.png) / [1440](screens/guide-rules-1440.png)

- 登録済みは → 0件。
- 条件は → 製品と件名、空欄ならすべての件名。
- 実行内容は → ラベルまたは担当者を選んで保存。

観察　初期値は「付けない」「変更しない」。入力順とラベルは上から読める。375の画像下端にも黒い保存が見える。

### guide-snooze

管理者が保留の設定・解除手順を知る。　[375](screens/guide-snooze-375.png) / [1024](screens/guide-snooze-1024.png) / [1440](screens/guide-snooze-1440.png)

- どこで設定するか → 会話のその他の操作。
- 基準時刻は → 日本時間。
- どう戻るか → 期限に受信箱、または同じ会話で保留を解除。

観察　説明の次に受信箱への入口。追加権限なしが独立。375ではボタンを1行に収める。

### guide-spam

管理者が隔離された会話を調べる。　[375](screens/guide-spam-375.png) / [1024](screens/guide-spam-1024.png) / [1440](screens/guide-spam-1440.png)

- どこにあるか → 迷惑メール。
- 誤っていたら → 会話の操作から解除。
- 追加権限は → なし。

観察　段落と入口を近付ける。権限を別カードに。戻る入口が上端にあり、三幅で同じ順序。

### guide-survey

管理者が解決アンケートの自動送信を確認する。　[375](screens/guide-survey-375.png) / [1024](screens/guide-survey-1024.png) / [1440](screens/guide-survey-1440.png)

- いつか → 問い合わせ完了時。
- 誰が有効にしたか → 佐藤 優、全製品。
- 何を送るか → Deskの英文質問と送信ごとの専用リンク。

観察　件名は表示例と明記。承認日付に日本時間。375では折り返した回答例のURLが本文に残る。

### label-colors

管理者が登録ラベルと使われている会話数を一覧する。　[375](screens/label-colors-375.png) / [1024](screens/label-colors-1024.png) / [1440](screens/label-colors-1440.png)

- 何種類か → 6行。
- 多いのは → 経理と請求が各2件。
- どこから変更するか → 色点・名前・各行の操作、上端に追加。

観察　ラベル・会話数・操作が列を形成。長い名称は375で2行省略、広幅で全文。社内確認と長期契約の色点が同じ。

### loop-account-menu

担当者が自分の補助操作を確認する。　[375](screens/loop-account-menu-375.png) / [1024](screens/loop-account-menu-1024.png) / [1440](screens/loop-account-menu-1440.png)

- 対象は誰か → 佐藤 優のアカウント行。
- 開いた先は → キーボード操作「?」。
- どこへ戻るか → 背面は未対応7件。

観察　三点の起点に青枠。375はドロワーを開いたまま小窓を表示。1024は細い左ナビ、1440は氏名付きの下端。

### loop-label-new

担当者が会話上で新しいラベルを作って付ける。　[375](screens/loop-label-new-375.png) / [1024](screens/loop-label-new-1024.png) / [1440](screens/loop-label-new-1440.png)

- 付いているものは → 経理・請求・領収書。
- 追加予定は → 契約更新。
- どう確定するか → 作成して付ける。

観察　選択済みの行はチェックと灰色。入力欄に青枠。375では小窓にも送信欄にも余白が少なく、件名の上側が一部隠れる。

### loop-mailbox-add

管理者がSlideに受信窓口を追加する。　[375](screens/loop-mailbox-add-375.png) / [1024](screens/loop-mailbox-add-1024.png) / [1440](screens/loop-mailbox-add-1440.png)

- 登録済みは → support@example.com。
- 新規情報は → 窓口アドレスの先頭と送信ドメイン。
- どう追加するか → 開いたフォームの窓口を追加。

観察　差出人保存は上の別カード。追加は既存アドレスの直下。375の画像では上部ナビが写らず、Slideの名称から始まる。

### loop-operator-edit

管理者が運営者の名前または役割を編集する。　[375](screens/loop-operator-edit-375.png) / [1024](screens/loop-operator-edit-1024.png) / [1440](screens/loop-operator-edit-1440.png)

- 対象は → 佐藤 優。
- 権限を変えられるか → 最後の管理者なので先に別の管理者が必要。
- 何を保存するか → 表示名を含む運営者情報。

観察　一覧行の下にフォームを展開。権限の理由が近い。森 直子の編集は閉じていて境目に罫線がある。

### loop-rule-delete

管理者が振り分けルールを削除前に確認する。　[375](screens/loop-rule-delete-375.png) / [1024](screens/loop-rule-delete-1024.png) / [1440](screens/loop-rule-delete-1440.png)

- どの順番か → 1番目。
- どんな条件か → 全プロダクト、件名に領収書、ラベル請求。
- 確定か中止か → このルールを削除／キャンセル。

観察　暗い背景の中央に白い確認面。対象条件を1文にまとめる。375の背面はスクロール済みで、クリック直前の位置は不明。

### loop-rule-edit

管理者が既存ルールの条件と順番を見直す。　[375](screens/loop-rule-edit-375.png) / [1024](screens/loop-rule-edit-1024.png) / [1440](screens/loop-rule-edit-1440.png)

- 何件か → 1件。
- どの条件か → 全プロダクト・領収書・請求。
- 優先順位は → 上から順に適用、複数担当は最後が優先。

観察　保存済み見出しの下に優先条件を説明。1番目が行の右端。375は既存フォームの途中、広幅は保存・移動・削除まで見える。

### mailboxes

管理者が製品と窓口の対応を把握する。　[375](screens/mailboxes-375.png) / [1024](screens/mailboxes-1024.png) / [1440](screens/mailboxes-1440.png)

- 何製品か → DeskとSlide。
- それぞれの窓口は → desk@example.com、support@example.com。
- 追加は → プロダクトを追加。

観察　2行とも製品マークと名前、メールの並び。右端に方向記号。375でも情報が横一列に収まる。

### menu-dev-ui-gallery-list-menu

開発者が部品見本の一覧メニューを確認する。　[375](screens/menu-dev-ui-gallery-list-menu-375.png) / [1024](screens/menu-dev-ui-gallery-list-menu-1024.png) / [1440](screens/menu-dev-ui-gallery-list-menu-1440.png)

- 対象は → 受信箱のサンプル2件。
- 何を開いているか → 一覧の操作。
- どんな例が続くか → 読み込み中・空の一覧を確認。

観察　小窓の項目に青いフォーカス。上部に一覧・詳細・編集などの目次。375で各行の担当者名が「佐」の先で切れる。

### menu-extensions-auto-ack-choice-menu-0

管理者が自動受付返信の文面を製品別に切り替える。　[375](screens/menu-extensions-auto-ack-choice-menu-0-375.png) / [1024](screens/menu-extensions-auto-ack-choice-menu-0-1024.png) / [1440](screens/menu-extensions-auto-ack-choice-menu-0-1440.png)

- どれが表示中か → Desk。
- ほかに選べるか → Slide。
- 選択の根拠は → Desk行のチェック。

観察　製品の頭文字を併記。開いた起点と最初の項目に青枠。3幅とも下の送信例の見出しに小窓が重なる。

### menu-extensions-canned-choice-menu-0

管理者が定型文の並び方を選ぶ。　[375](screens/menu-extensions-canned-choice-menu-0-375.png) / [1024](screens/menu-extensions-canned-choice-menu-0-1024.png) / [1440](screens/menu-extensions-canned-choice-menu-0-1440.png)

- 現在は → 標準の順序。
- 別の順序は → 名前順。
- 何件を並べるか → 定型返信1件。

観察　チェックで現在値を示す。起点直下に2項目。375は検索の次の段に並び順がある。

### menu-extensions-issues-link-1-operation-articles-articles.suggest

担当者が会話から記事候補を残す。　[375](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-375.png) / [1024](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-1024.png) / [1440](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-1440.png)

- 元は → #1 領収書の宛名を変更できますか。
- 何を入力するか → 記事にする内容。
- 公開されるか → ボタンは「記事の候補に追加」。

観察　入力欄が青枠。375では別のGitHub Issueカードを一部覆う。1440は本文と関連情報、1024は右シートを同時表示。

### menu-extensions-issues-link-1-operation-issues-issues.preview

担当者が外部に起票する前に記載内容を用意する。　[375](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-375.png) / [1024](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-1024.png) / [1440](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-1440.png)

- 元は → #1 領収書の宛名を変更できますか。
- どこへ → example/helpdesk。
- 何を確認するか → タイトルと公開する要約。

観察　375と1440で小窓が起点より上、背後に複数の空枠が露出。1024ではGitHub Issue見出し・起点・フォームが上から同じ順。タイトル欄が青枠。

### menu-extensions-issues-link-1-operation-merge-merge.combine

担当者が会話の統合先を選ぶ。　[375](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-375.png) / [1024](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-1024.png) / [1440](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-1440.png)

- 統合元は → #1領収書の宛名。
- 統合先は → #2ワークスペースの招待メールについて。
- 実行前の操作は → この会話を統合する内容を確認。

観察　対象番号は先頭。統合先は青い選択欄。375は前後の記事・GitHub課題カードが連続し、確認フォームは浮いて見える。

### menu-extensions-issues-link-1-reply-templates

担当者が返信に使う定型文を選ぶ。　[375](screens/menu-extensions-issues-link-1-reply-templates-375.png) / [1024](screens/menu-extensions-issues-link-1-reply-templates-1024.png) / [1440](screens/menu-extensions-issues-link-1-reply-templates-1440.png)

- 候補は → お問い合わせの受付。
- 本文例は → Hello 山田 花, thank you for contacting Slide.。
- 次の動作は → 定型文から下書きを作成。

観察　ラジオに青いフォーカス。375では起点の上、広幅では下に展開。作成ボタンと送信ボタンは区別できる。

### menu-extensions-rules-choice-menu-0

管理者が新しいルールの製品範囲を選ぶ。　[375](screens/menu-extensions-rules-choice-menu-0-375.png) / [1024](screens/menu-extensions-rules-choice-menu-0-1024.png) / [1440](screens/menu-extensions-rules-choice-menu-0-1440.png)

- 現在の対象は → すべてのプロダクト。
- 個別の候補は → Desk、Slide。
- 現在値の目印は → 全製品行にチェック。

観察　選択肢は名と製品マーク。白い小窓を起点の下に置く。チェックと青枠が同じ行。

### menu-extensions-rules-choice-menu-1

管理者が振り分けルールで付けるラベルを選ぶ。　[375](screens/menu-extensions-rules-choice-menu-1-375.png) / [1024](screens/menu-extensions-rules-choice-menu-1-1024.png) / [1440](screens/menu-extensions-rules-choice-menu-1-1440.png)

- 初期値は → 付けない。
- どの候補があるか → 再発行から領収書まで6件。
- 名称を直す入口は → ラベルを管理。

観察　各候補に色点。375は起点の上に開き、広幅は下。長い名称もそのまま読める。

### menu-extensions-survey-choice-menu-0

管理者が製品別にアンケート送信文を確認する。　[375](screens/menu-extensions-survey-choice-menu-0-375.png) / [1024](screens/menu-extensions-survey-choice-menu-0-1024.png) / [1440](screens/menu-extensions-survey-choice-menu-0-1440.png)

- 現在は → Desk。
- ほかの候補は → Slide。
- 何を切り替えるか → 下の製品の送信文面。

観察　起点とチェック済みDeskの両方に青枠。承認カードは上に残る。375では小窓が下の送信例の上部を覆う。

### menu-home-account-menu

担当者がナビゲーション下端の補助メニューを開く。　[375](screens/menu-home-account-menu-375.png) / [1024](screens/menu-home-account-menu-1024.png) / [1440](screens/menu-home-account-menu-1440.png)

- 開いたのは → アカウントの三点。
- 項目は → キーボード操作「?」。
- 選択中の画面は → 未対応7件。

観察　項目と起点に青枠。375ではドロワーの外側へ小窓が伸びる。1024の集計2項目は左の細いナビに「声」「対応」のみ残る。

### menu-home-bulk-label

担当者が未対応7件のラベルを一括変更する。　[375](screens/menu-home-bulk-label-375.png) / [1024](screens/menu-home-bulk-label-1024.png) / [1440](screens/menu-home-bulk-label-1440.png)

- 何件か → 7件を選択中。
- 横線の意味は → 一部の会話に付く。
- 選ぶとどうなるか → 選択中のすべての会話に付ける。

観察　チェック付きの青い行。6ラベルに色点と横線。375はツールバーが折り返し、小窓がほぼ画面幅。

### menu-home-product-switcher

担当者が全製品の受信箱から製品を選ぶ。　[375](screens/menu-home-product-switcher-375.png) / [1024](screens/menu-home-product-switcher-1024.png) / [1440](screens/menu-home-product-switcher-1440.png)

- 現在は → すべてのプロダクト。
- 個別の候補は → Desk、Slide。
- 切り替えの入口は → ナビ上部の製品選択。

観察　現在の行にチェック。375はドロワーとその上の選択窓。1024はアイコン起点、1440は文言付き起点。

### menu-label-fd3f5651-bulk-assignee

担当者が請求で絞った未対応の選択行に担当者を割り当てる。　[375](screens/menu-label-fd3f5651-bulk-assignee-375.png) / [1024](screens/menu-label-fd3f5651-bulk-assignee-1024.png) / [1440](screens/menu-label-fd3f5651-bulk-assignee-1440.png)

- 対象は → Slideの#4・#1。
- 件数は → 2件を選択中。
- 候補は → 佐藤 優、森 直子。

観察　チェックと淡青塗りで対象行を示す。担当者は丸いマークと氏名。375は行チェックが人物の下、広幅では人物の左。先頭の佐藤に青枠がある。

### menu-label-fd3f5651-bulk-label

担当者が請求で絞った未対応の選択行のラベルを変更する。　[375](screens/menu-label-fd3f5651-bulk-label-375.png) / [1024](screens/menu-label-fd3f5651-bulk-label-1024.png) / [1440](screens/menu-label-fd3f5651-bulk-label-1440.png)

- 対象は → Slideの#4・#1。
- 件数は → 2件。
- 何を付けられるか → 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。

観察　対象行は淡青。色点と名前を1行に組む。請求にチェック、部分選択の横線と凡例も見える。

### menu-label-fd3f5651-choice-menu-0

担当者が請求で絞った未対応の状態条件を変更する。　[375](screens/menu-label-fd3f5651-choice-menu-0-375.png) / [1024](screens/menu-label-fd3f5651-choice-menu-0-1024.png) / [1440](screens/menu-label-fd3f5651-choice-menu-0-1440.png)

- 何を絞るか → 状態。
- 現在は → 未対応。
- 別の条件は → 未対応・返信待ち・完了・迷惑メール・すべて。

観察　親の絞り込み窓に子の選択窓が重なる。現在値をチェックで示す。375は検索の下、広幅は検索の右で開く。

### menu-label-fd3f5651-choice-menu-1

担当者が請求で絞った未対応の製品条件を変える。　[375](screens/menu-label-fd3f5651-choice-menu-1-375.png) / [1024](screens/menu-label-fd3f5651-choice-menu-1-1024.png) / [1440](screens/menu-label-fd3f5651-choice-menu-1-1440.png)

- 現在は → すべて。
- 候補は → すべて、Desk、Slide。
- 対象一覧は → Slideの#4・#1。

観察　製品マークと名称が並ぶ。すべてに青枠とチェック。375は検索の下の2段目、広幅は右端近くで開く。

### menu-label-fd3f5651-choice-menu-2

担当者が請求で絞った未対応のラベル条件を選ぶ。　[375](screens/menu-label-fd3f5651-choice-menu-2-375.png) / [1024](screens/menu-label-fd3f5651-choice-menu-2-1024.png) / [1440](screens/menu-label-fd3f5651-choice-menu-2-1440.png)

- 現在は → 請求。
- 選択肢は → 全ラベルと6種類の名称。
- 新しい分類が必要なら → ラベルを管理。

観察　375では長い選択窓が起点の上に出て親のフィールド名を覆う。広幅では下に開く。青いフォーカスと選択済みチェックは別に読める。

### menu-label-fd3f5651-choice-menu-3

担当者が請求で絞った未対応の並び順を見直す。　[375](screens/menu-label-fd3f5651-choice-menu-3-375.png) / [1024](screens/menu-label-fd3f5651-choice-menu-3-1024.png) / [1440](screens/menu-label-fd3f5651-choice-menu-3-1440.png)

- 対象は → Slideの#4・#1。
- 現在の順序は → 待たせている順。
- 切り替え先は → 新しい順。

観察　選択はチェックで明示。起点の直下に2項目。375では行の状態・待ち時間が複数段に分散する。

### menu-label-fd3f5651-filter-assignee

担当者が請求で絞った未対応の担当者条件を選ぶ。　[375](screens/menu-label-fd3f5651-filter-assignee-375.png) / [1024](screens/menu-label-fd3f5651-filter-assignee-1024.png) / [1440](screens/menu-label-fd3f5651-filter-assignee-1440.png)

- 現在は → すべて。
- 候補は → すべて、佐藤 優、森 直子。
- 変更対象は → Slideの#4・#1の一覧の表示条件。

観察　親の「担当者」の欄に青枠。人物を丸いマークで示す。すべてにチェックと青枠。

### menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee

担当者がDeskの自分の担当の選択行に担当者を割り当てる。　[375](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-375.png) / [1024](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-1024.png) / [1440](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-1440.png)

- 対象は → Deskの#3。
- 件数は → 1件を選択中。
- 候補は → 佐藤 優、森 直子。

観察　チェックと淡青塗りで対象行を示す。担当者は丸いマークと氏名。375は行チェックが人物の下、広幅では人物の左。現在の佐藤にチェックがある。

### menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label

担当者がDeskの自分の担当の選択行のラベルを変更する。　[375](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-375.png) / [1024](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-1024.png) / [1440](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-1440.png)

- 対象は → Deskの#3。
- 件数は → 1件。
- 何を付けられるか → 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。

観察　対象行は淡青。色点と名前を1行に組む。再発行に青枠、末尾にラベルを管理。

### menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0

担当者がDeskの自分の担当の状態条件を変更する。　[375](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-375.png) / [1024](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-1024.png) / [1440](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-1440.png)

- 何を絞るか → 状態。
- 現在は → すべて。
- 別の条件は → 未対応・返信待ち・完了・迷惑メール・すべて。

観察　親の絞り込み窓に子の選択窓が重なる。現在値をチェックで示す。375は検索の下、広幅は検索の右で開く。

### menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1

担当者がDeskの自分の担当の製品条件を変える。　[375](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-375.png) / [1024](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-1024.png) / [1440](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-1440.png)

- 現在は → Desk。
- 候補は → すべて、Desk、Slide。
- 対象一覧は → Deskの#3。

観察　製品マークと名称が並ぶ。青枠はすべて、チェックはDesk。375は検索の下の2段目、広幅は右端近くで開く。

### menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2

担当者がDeskの自分の担当のラベル条件を選ぶ。　[375](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-375.png) / [1024](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-1024.png) / [1440](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-1440.png)

- 現在は → すべてのラベル。
- 選択肢は → 全ラベルと6種類の名称。
- 新しい分類が必要なら → ラベルを管理。

観察　375では長い選択窓が起点の上に出て親のフィールド名を覆う。広幅では下に開く。青いフォーカスと選択済みチェックは別に読める。

### menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3

担当者がDeskの自分の担当の並び順を見直す。　[375](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-375.png) / [1024](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-1024.png) / [1440](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-1440.png)

- 対象は → Deskの#3。
- 現在の順序は → 待たせている順。
- 切り替え先は → 新しい順。

観察　選択はチェックで明示。起点の直下に2項目。375では行の状態・待ち時間が複数段に分散する。

### menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee

担当者がDeskの自分の担当の担当者条件を選ぶ。　[375](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-375.png) / [1024](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-1024.png) / [1440](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-1440.png)

- 現在は → 佐藤 優。
- 候補は → すべて、佐藤 優、森 直子。
- 変更対象は → Deskの#3の一覧の表示条件。

観察　親の「担当者」の欄に青枠。人物を丸いマークで示す。チェックは佐藤、青いフォーカスはすべて。

### menu-settings-labels-add-label

管理者がラベルの追加名を入力し始める。　[375](screens/menu-settings-labels-add-label-375.png) / [1024](screens/menu-settings-labels-add-label-1024.png) / [1440](screens/menu-settings-labels-add-label-1440.png)

- 何を追加するか → 受信箱のラベル。
- 制限は → 20字まで。
- 確定は → 追加する。

観察　右上の起点に青枠。空の名称欄にも青いフォーカス。375は小窓の幅に合わせて黒い確定ボタンが伸びる。

### menu-settings-labels-label-actions-0

管理者が「再発行」行の整理方法を選ぶ。　[375](screens/menu-settings-labels-label-actions-0-375.png) / [1024](screens/menu-settings-labels-label-actions-0-1024.png) / [1440](screens/menu-settings-labels-label-actions-0-1440.png)

- どのラベルか → 再発行。
- 現在のまとめる先は → 社内確認。
- ほかの操作は → 削除。

観察　対象行の操作に青枠。対象名が小窓上部にも入る。1件は背面の会話数列にあり、375でも操作列と分かれている。

### menu-settings-labels-label-actions-1

管理者が「社内確認」行の整理方法を選ぶ。　[375](screens/menu-settings-labels-label-actions-1-375.png) / [1024](screens/menu-settings-labels-label-actions-1-1024.png) / [1440](screens/menu-settings-labels-label-actions-1-1440.png)

- どのラベルか → 社内確認。
- 現在のまとめる先は → 再発行。
- ほかの操作は → 削除。

観察　対象行の操作に青枠。対象名が小窓上部にも入る。1件は背面の会話数列にあり、375でも操作列と分かれている。

### menu-settings-labels-label-actions-2

管理者が「経理」行の整理方法を選ぶ。　[375](screens/menu-settings-labels-label-actions-2-375.png) / [1024](screens/menu-settings-labels-label-actions-2-1024.png) / [1440](screens/menu-settings-labels-label-actions-2-1440.png)

- どのラベルか → 経理。
- 現在のまとめる先は → 再発行。
- ほかの操作は → 削除。

観察　対象行の操作に青枠。対象名が小窓上部にも入る。2件は背面の会話数列にあり、375でも操作列と分かれている。

### menu-settings-labels-label-actions-3

管理者が「請求」行の整理方法を選ぶ。　[375](screens/menu-settings-labels-label-actions-3-375.png) / [1024](screens/menu-settings-labels-label-actions-3-1024.png) / [1440](screens/menu-settings-labels-label-actions-3-1440.png)

- どのラベルか → 請求。
- 現在のまとめる先は → 再発行。
- ほかの操作は → 削除。

観察　対象行の操作に青枠。対象名が小窓上部にも入る。2件は背面の会話数列にあり、375でも操作列と分かれている。

### menu-settings-labels-label-actions-4

管理者が「長期契約の更新手続きについて」行の整理方法を選ぶ。　[375](screens/menu-settings-labels-label-actions-4-375.png) / [1024](screens/menu-settings-labels-label-actions-4-1024.png) / [1440](screens/menu-settings-labels-label-actions-4-1440.png)

- どのラベルか → 長期契約の更新手続きについて。
- 現在のまとめる先は → 再発行。
- ほかの操作は → 削除。

観察　対象行の操作に青枠。対象名が小窓上部にも入る。1件は背面の会話数列にあり、375でも操作列と分かれている。

### menu-settings-labels-label-actions-5

管理者が「領収書」行の整理方法を選ぶ。　[375](screens/menu-settings-labels-label-actions-5-375.png) / [1024](screens/menu-settings-labels-label-actions-5-1024.png) / [1440](screens/menu-settings-labels-label-actions-5-1440.png)

- どのラベルか → 領収書。
- 現在のまとめる先は → 再発行。
- ほかの操作は → 削除。

観察　対象行の操作に青枠。対象名が小窓上部にも入る。1件は背面の会話数列にあり、375でも操作列と分かれている。

### menu-settings-labels-label-color-0

管理者が「再発行」の表示色を選ぶ。　[375](screens/menu-settings-labels-label-color-0-375.png) / [1024](screens/menu-settings-labels-label-color-0-1024.png) / [1440](screens/menu-settings-labels-label-color-0-1440.png)

- 対象は → 再発行。
- 現在色は → 茶の円にチェック。
- 選べる数は → 8色。

観察　2行4列で固定。起点は分類名の左の色点。先頭の青にフォーカスがあり、現在色に別のチェック。色名の文字は見えない。

### menu-settings-labels-label-color-1

管理者が「社内確認」の表示色を選ぶ。　[375](screens/menu-settings-labels-label-color-1-375.png) / [1024](screens/menu-settings-labels-label-color-1-1024.png) / [1440](screens/menu-settings-labels-label-color-1-1440.png)

- 対象は → 社内確認。
- 現在色は → 黄緑の円にチェック。
- 選べる数は → 8色。

観察　2行4列で固定。起点は分類名の左の色点。先頭の青にフォーカスがあり、現在色に別のチェック。色名の文字は見えない。

### menu-settings-labels-label-color-2

管理者が「経理」の表示色を選ぶ。　[375](screens/menu-settings-labels-label-color-2-375.png) / [1024](screens/menu-settings-labels-label-color-2-1024.png) / [1440](screens/menu-settings-labels-label-color-2-1440.png)

- 対象は → 経理。
- 現在色は → 灰の円にチェック。
- 選べる数は → 8色。

観察　2行4列で固定。起点は分類名の左の色点。先頭の青にフォーカスがあり、現在色に別のチェック。色名の文字は見えない。

### menu-settings-labels-label-color-3

管理者が「請求」の表示色を選ぶ。　[375](screens/menu-settings-labels-label-color-3-375.png) / [1024](screens/menu-settings-labels-label-color-3-1024.png) / [1440](screens/menu-settings-labels-label-color-3-1440.png)

- 対象は → 請求。
- 現在色は → 青の円にチェック。
- 選べる数は → 8色。

観察　2行4列で固定。起点は分類名の左の色点。現在色と青枠が同じ左上の円。色名の文字は見えない。

### menu-settings-labels-label-color-4

管理者が「長期契約の更新手続きについて」の表示色を選ぶ。　[375](screens/menu-settings-labels-label-color-4-375.png) / [1024](screens/menu-settings-labels-label-color-4-1024.png) / [1440](screens/menu-settings-labels-label-color-4-1440.png)

- 対象は → 長期契約の更新手続きについて。
- 現在色は → 黄緑の円にチェック。
- 選べる数は → 8色。

観察　2行4列で固定。起点は分類名の左の色点。先頭の青にフォーカスがあり、現在色に別のチェック。色名の文字は見えない。

### menu-settings-labels-label-color-5

管理者が「領収書」の表示色を選ぶ。　[375](screens/menu-settings-labels-label-color-5-375.png) / [1024](screens/menu-settings-labels-label-color-5-1024.png) / [1440](screens/menu-settings-labels-label-color-5-1440.png)

- 対象は → 領収書。
- 現在色は → 水色の円にチェック。
- 選べる数は → 8色。

観察　2行4列で固定。起点は分類名の左の色点。先頭の青にフォーカスがあり、現在色に別のチェック。色名の文字は見えない。

### menu-settings-labels-label-rename-0

管理者が「再発行」を改名する。　[375](screens/menu-settings-labels-label-rename-0-375.png) / [1024](screens/menu-settings-labels-label-rename-0-1024.png) / [1440](screens/menu-settings-labels-label-rename-0-1440.png)

- 現在名は → 再発行。
- 制限は → 新しい名前は20字まで。
- 操作は → 名前を変更／取り消し。

観察　名前を起点に小窓が開く。新名欄には現在名が入力済みで青枠。対象の件数は一覧の別列に残る。

### menu-settings-labels-label-rename-1

管理者が「社内確認」を改名する。　[375](screens/menu-settings-labels-label-rename-1-375.png) / [1024](screens/menu-settings-labels-label-rename-1-1024.png) / [1440](screens/menu-settings-labels-label-rename-1-1440.png)

- 現在名は → 社内確認。
- 制限は → 新しい名前は20字まで。
- 操作は → 名前を変更／取り消し。

観察　名前を起点に小窓が開く。新名欄には現在名が入力済みで青枠。対象の件数は一覧の別列に残る。

### menu-settings-labels-label-rename-2

管理者が「経理」を改名する。　[375](screens/menu-settings-labels-label-rename-2-375.png) / [1024](screens/menu-settings-labels-label-rename-2-1024.png) / [1440](screens/menu-settings-labels-label-rename-2-1440.png)

- 現在名は → 経理。
- 制限は → 新しい名前は20字まで。
- 操作は → 名前を変更／取り消し。

観察　名前を起点に小窓が開く。新名欄には現在名が入力済みで青枠。対象の件数は一覧の別列に残る。

### menu-settings-labels-label-rename-3

管理者が「請求」を改名する。　[375](screens/menu-settings-labels-label-rename-3-375.png) / [1024](screens/menu-settings-labels-label-rename-3-1024.png) / [1440](screens/menu-settings-labels-label-rename-3-1440.png)

- 現在名は → 請求。
- 制限は → 新しい名前は20字まで。
- 操作は → 名前を変更／取り消し。

観察　名前を起点に小窓が開く。新名欄には現在名が入力済みで青枠。対象の件数は一覧の別列に残る。

### menu-settings-labels-label-rename-4

管理者が「長期契約の更新手続きについて」を改名する。　[375](screens/menu-settings-labels-label-rename-4-375.png) / [1024](screens/menu-settings-labels-label-rename-4-1024.png) / [1440](screens/menu-settings-labels-label-rename-4-1440.png)

- 現在名は → 長期契約の更新手続きについて。
- 制限は → 新しい名前は20字まで。
- 操作は → 名前を変更／取り消し。

観察　名前を起点に小窓が開く。新名欄には現在名が入力済みで青枠。375の起点では末尾省略だが小窓では全文を読める。

### menu-settings-labels-label-rename-5

管理者が「領収書」を改名する。　[375](screens/menu-settings-labels-label-rename-5-375.png) / [1024](screens/menu-settings-labels-label-rename-5-1024.png) / [1440](screens/menu-settings-labels-label-rename-5-1440.png)

- 現在名は → 領収書。
- 制限は → 新しい名前は20字まで。
- 操作は → 名前を変更／取り消し。

観察　名前を起点に小窓が開く。新名欄には現在名が入力済みで青枠。対象の件数は一覧の別列に残る。

### menu-settings-operators-choice-menu-0

管理者が運営者の並び順を選ぶ。　[375](screens/menu-settings-operators-choice-menu-0-375.png) / [1024](screens/menu-settings-operators-choice-menu-0-1024.png) / [1440](screens/menu-settings-operators-choice-menu-0-1440.png)

- 人数は → 2人。
- 現在は → 標準の順序。
- もう一方は → 名前順。

観察　起点と現在値に青枠。375で権限と並び順が横一組。広幅では検索も同じ行に収まる。

### menu-status-spam-48e45b08-bulk-assignee

担当者が迷惑メールの選択行に担当者を割り当てる。　[375](screens/menu-status-spam-48e45b08-bulk-assignee-375.png) / [1024](screens/menu-status-spam-48e45b08-bulk-assignee-1024.png) / [1440](screens/menu-status-spam-48e45b08-bulk-assignee-1440.png)

- 対象は → Slideの#9。
- 件数は → 1件を選択中。
- 候補は → 佐藤 優、森 直子。

観察　チェックと淡青塗りで対象行を示す。担当者は丸いマークと氏名。375は行チェックが人物の下、広幅では人物の左。先頭の佐藤に青枠がある。

### menu-status-spam-48e45b08-bulk-label

担当者が迷惑メールの選択行のラベルを変更する。　[375](screens/menu-status-spam-48e45b08-bulk-label-375.png) / [1024](screens/menu-status-spam-48e45b08-bulk-label-1024.png) / [1440](screens/menu-status-spam-48e45b08-bulk-label-1440.png)

- 対象は → Slideの#9。
- 件数は → 1件。
- 何を付けられるか → 再発行・社内確認・経理・請求・長期契約の更新手続きについて・領収書。

観察　対象行は淡青。色点と名前を1行に組む。再発行に青枠、末尾にラベルを管理。

### menu-status-spam-48e45b08-choice-menu-0

担当者が迷惑メールの状態条件を変更する。　[375](screens/menu-status-spam-48e45b08-choice-menu-0-375.png) / [1024](screens/menu-status-spam-48e45b08-choice-menu-0-1024.png) / [1440](screens/menu-status-spam-48e45b08-choice-menu-0-1440.png)

- 何を絞るか → 状態。
- 現在は → 迷惑メール。
- 別の条件は → 未対応・返信待ち・完了・迷惑メール・すべて。

観察　親の絞り込み窓に子の選択窓が重なる。現在値をチェックで示す。375は検索の下、広幅は検索の右で開く。

### menu-status-spam-48e45b08-choice-menu-1

担当者が迷惑メールの製品条件を変える。　[375](screens/menu-status-spam-48e45b08-choice-menu-1-375.png) / [1024](screens/menu-status-spam-48e45b08-choice-menu-1-1024.png) / [1440](screens/menu-status-spam-48e45b08-choice-menu-1-1440.png)

- 現在は → すべて。
- 候補は → すべて、Desk、Slide。
- 対象一覧は → Slideの#9。

観察　製品マークと名称が並ぶ。すべてに青枠とチェック。375は検索の下の2段目、広幅は右端近くで開く。

### menu-status-spam-48e45b08-choice-menu-2

担当者が迷惑メールのラベル条件を選ぶ。　[375](screens/menu-status-spam-48e45b08-choice-menu-2-375.png) / [1024](screens/menu-status-spam-48e45b08-choice-menu-2-1024.png) / [1440](screens/menu-status-spam-48e45b08-choice-menu-2-1440.png)

- 現在は → すべてのラベル。
- 選択肢は → 全ラベルと6種類の名称。
- 新しい分類が必要なら → ラベルを管理。

観察　375では長い選択窓が起点の上に出て親のフィールド名を覆う。広幅では下に開く。青いフォーカスと選択済みチェックは別に読める。

### menu-status-spam-48e45b08-choice-menu-3

担当者が迷惑メールの並び順を見直す。　[375](screens/menu-status-spam-48e45b08-choice-menu-3-375.png) / [1024](screens/menu-status-spam-48e45b08-choice-menu-3-1024.png) / [1440](screens/menu-status-spam-48e45b08-choice-menu-3-1440.png)

- 対象は → Slideの#9。
- 現在の順序は → 待たせている順。
- 切り替え先は → 新しい順。

観察　選択はチェックで明示。起点の直下に2項目。375では行の状態・待ち時間が複数段に分散する。

### menu-status-spam-48e45b08-filter-assignee

担当者が迷惑メールの担当者条件を選ぶ。　[375](screens/menu-status-spam-48e45b08-filter-assignee-375.png) / [1024](screens/menu-status-spam-48e45b08-filter-assignee-1024.png) / [1440](screens/menu-status-spam-48e45b08-filter-assignee-1440.png)

- 現在は → すべて。
- 候補は → すべて、佐藤 優、森 直子。
- 変更対象は → Slideの#9の一覧の表示条件。

観察　親の「担当者」の欄に青枠。人物を丸いマークで示す。すべてにチェックと青枠。

### menu-tokens-choice-menu-0

管理者が発行したトークンを並べ替える。　[375](screens/menu-tokens-choice-menu-0-375.png) / [1024](screens/menu-tokens-choice-menu-0-1024.png) / [1440](screens/menu-tokens-choice-menu-0-1440.png)

- 対象は → 閲覧権限の「運営用CLI」1件。
- 現在は → 標準の順序。
- 選択できる別の順序は → 名前順。

観察　選択窓にチェック。発行済みと発行用フォームを分離。375では小窓が既存行の失効ボタンに一部重なる。

### menu-view-feedback-834dd78f-bulk-label

担当者が選択中の意見を分類する。　[375](screens/menu-view-feedback-834dd78f-bulk-label-375.png) / [1024](screens/menu-view-feedback-834dd78f-bulk-label-1024.png) / [1440](screens/menu-view-feedback-834dd78f-bulk-label-1440.png)

- 対象は → フィードバック1件。
- 候補は → 色点付き6ラベル。
- ほかの一括操作は → 迷惑メールにする。

観察　上の行に対象件数と解除。青枠は最初の再発行。375では小窓が行の大部分を覆い、広幅には反対側の受け付け状態と操作が残る。

### operators

管理者が運営メンバーと権限を照合する。　[375](screens/operators-375.png) / [1024](screens/operators-1024.png) / [1440](screens/operators-1440.png)

- 人数は → 2人。
- 誰が管理者か → 佐藤 優、森 直子は担当者。
- どこで変更するか → 各行の編集。

観察　名前の横にメールを添える。検索・権限・順序を一覧上に置く。375では編集が次段、広幅では権限の右。

### product-emoji

顧客が絵文字マークのSlide窓口に連絡する。　[375](screens/product-emoji-375.png) / [1024](screens/product-emoji-1024.png) / [1440](screens/product-emoji-1440.png)

- 宛先は → 絵文字の隣にSlide。
- 必要項目は → 件名・問い合わせ内容・連絡先メールアドレス。
- 送信は → 黒い送信ボタン。

観察　ヘッダーだけに絵文字。問い合わせ内容は他欄より高い。3幅で欄の順番が共通し、標準マークのフォームと比較できる。

### product-icon-settings

管理者がSlideのアイコンとメール差出人を編集する。　[375](screens/product-icon-settings-375.png) / [1024](screens/product-icon-settings-1024.png) / [1440](screens/product-icon-settings-1440.png)

- 現在の印は → S、種類は名前の頭文字。
- 差出人名は → Slide。
- 登録済み窓口は → support@example.com。

観察　アイコンの編集を展開。画像の保存と差出人の保存が別のボタン。登録済み窓口は別カードの中でアドレスを示す。

### product-image

顧客が画像マークのSlide窓口に連絡する。　[375](screens/product-image-375.png) / [1024](screens/product-image-1024.png) / [1440](screens/product-image-1440.png)

- 窓口は → 独自画像の隣にSlide。
- 何を書くか → 件名、問い合わせ内容、連絡先。
- 確定は → 送信。

観察　青系の画像をヘッダー左に置く。標準・絵文字版と同じ罫線。入力欄と送信ボタンの順も3幅で揃う。

### product-switcher

担当者がSlideに絞った状態から別の製品へ切り替える。　[375](screens/product-switcher-375.png) / [1024](screens/product-switcher-1024.png) / [1440](screens/product-switcher-1440.png)

- 今の範囲は → Slide、未対応6件。
- 切り替え候補は → すべてのプロダクト、Desk、Slide。
- 選択済みはどれか → Slideにチェック。

観察　375は暗い背景の上にドロワー。1024は製品アイコン起点。1440では選択中の製品名を左上と一覧の条件に表示。

### route-extensions-chat-preview-slide

管理者がSlideに埋め込んだチャットの入り口を見る。　[375](screens/route-extensions-chat-preview-slide-375.png) / [1024](screens/route-extensions-chat-preview-slide-1024.png) / [1440](screens/route-extensions-chat-preview-slide-1440.png)

- どの製品か → Slide。
- 見本の使い方は → ヘルプボタンで見え方を確認。
- 入口はどこか → 右下の黒いヘルプ。

観察　案内は上の淡い帯。ページ中央に本文はなく、起点の位置が目立つ。375でもボタンの外周に余白が残る。

### settings-home

管理者が設定項目と現在値を見渡す。　[375](screens/settings-home-375.png) / [1024](screens/settings-home-1024.png) / [1440](screens/settings-home-1440.png)

- 窓口・人・ラベルは → 窓口2件、2人、6件。
- 保持と認証は → 無期限、APIトークン0件。
- 削除はどこか → データ管理の連絡先のデータ削除。

観察　検索は見出し下。5行は名称・説明・現在値・矢印の組。削除だけ別カードで、375の画像ではカード冒頭まで。

### suggest-settings

管理者が記事をおすすめする条件を設定する。　[375](screens/suggest-settings-375.png) / [1024](screens/suggest-settings-1024.png) / [1440](screens/suggest-settings-1440.png)

- しきい値は → 確率60%以上、上位3件。
- モデルは → チャット・フォームはClef Flash、受付返信・運営画面はClef。
- 自動受付返信に添えるか → チェックなし、保存操作あり。

観察　設定は折りたたみ内。技術的なCSPやモデル名が同じエリアにある。375では製品名や見出しより下から撮影され、対象製品はこの1枚では判別しにくい。

### tokens

担当者が初めてAPIトークンを発行する。　[375](screens/tokens-375.png) / [1024](screens/tokens-1024.png) / [1440](screens/tokens-1440.png)

- 現在何件か → 0件。
- 発行に必要な入力は → トークン名と権限。
- 初期値と確定は → 閲覧、「発行する」。

観察　鍵の絵と空状態の説明。次の操作はその下の独立フォーム。黒い発行ボタンに対し、空状態の説明が中央で控えめ。
