# 第4周　拡張機能の目視記録

第4周で撮影した39状態について、1440px・1024px・375pxの原画像を計117枚開き、操作の対象、表示内容、各幅での読みやすさを確認しました。高0件、中0件、低3件です。

## 軽微な指摘

- **迷惑メールの本文抜粋**　375pxの一覧では抜粋の末尾が省略されます。件名は読め、どの会話を開くかは判断できます。本文で複数のメールを見分ける場合は個別確認が必要です。
- **埋め込みコードの高さ**　375pxでは製品向けコードが折り返され、欄の末尾まで一度に見えません。コピーする操作は欄のすぐ下にありますが、貼り付け前に全文を目で照合する手間が増えます。記事・フォーム・チャットのガイドとウィジェットの同種の欄は1件にまとめました。
- **書き出し件数の折り返し**　375pxでは「操作履歴」の途中で行が変わり、件数との対応を追いにくくなります。書き出し画面とガイドはいずれも件数を最後まで読めるため、同じ指摘として数えました。

## 状態別の確認

| 状態 | 1440px | 1024px | 375px |
| --- | --- | --- | --- |
| extension-articles | 領収書の記事1件と候補0件の個数を取り違えず、右端に新規執筆がある。 [画像](screens/extension-articles-1440.png) | 記事名の右に公開中、次段にSlide・日付・評価、その下に提示数が並ぶ。 [画像](screens/extension-articles-1024.png) | 主操作は2段目に移る。検索・公開状態・並び順と、記事の解決率まで収まる。 [画像](screens/extension-articles-375.png) |
| extension-auto-ack | 有効4件の構成で、受付返信の有効状態と設定への入口を同じカードに表示。 [画像](screens/extension-auto-ack-1440.png) | 初めて届いた問い合わせが対象である旨が、設定ボタンより先に読める。 [画像](screens/extension-auto-ack-1024.png) | 受付返信の有効、フィードバックの無効が文字と色の両方で見分けられる。 [画像](screens/extension-auto-ack-375.png) |
| extension-canned | 選択印は「お問い合わせの受付」の横にあり、元の問い合わせ本文を上に残している。 [画像](screens/extension-canned-1440.png) | 下書きを作成する操作と、返信タブ・内部メモタブの位置が分かれる。 [画像](screens/extension-canned-1024.png) | 名前と製品を差し込む英語の見本は2行で完結し、下書き作成の下から返信欄が始まる。 [画像](screens/extension-canned-375.png) |
| extension-chat | 中央にSlideの名前と質問欄があり、問い合わせとして送ると担当者が読むと説明。 [画像](screens/extension-chat-1440.png) | 記事検索の質問と、人へのメールの窓口が上下の領域に分かれる。 [画像](screens/extension-chat-1024.png) | 質問欄の下のボタン、記事一覧、メールリンクのすべてをスクロール前に確認できる。 [画像](screens/extension-chat-375.png) |
| extension-export | 伏せる情報と原文が残る自由記述を操作前に確認できる。 [画像](screens/extension-export-1440.png) | 現在の対象が会話11、メッセージ17、履歴12件で、書き出しの種類が明示される。 [画像](screens/extension-export-1024.png) | 件数の「操作履歴」が2行にまたがる。個人情報の選択値と書き出しボタンは同時に見える。 [画像](screens/extension-export-375.png) |
| extension-feedback | #10の内容と投稿者の下に、相手に送信しない内部メモ欄を配置。 [画像](screens/extension-feedback-1440.png) | 黒い確認済みボタンと白い問い合わせへの変更の右に、関連情報が並ぶ。 [画像](screens/extension-feedback-1024.png) | 見出しの改行と操作の2段化で、件名、受付済み、メモ保存まで読める。 [画像](screens/extension-feedback-375.png) |
| extension-form | すべての項目を入力する案内が、製品名と件名入力の間にある。 [画像](screens/extension-form-1440.png) | 本文にだけ複数行の領域があり、メールのラベルはその下の欄に対応。 [画像](screens/extension-form-1024.png) | 左右の余白を確保し、送信ボタンまで全体が一画面に収まる。 [画像](screens/extension-form-375.png) |
| extension-issues | 元の問い合わせと投稿リポジトリが表示され、公開する要約の欄は空で開く。 [画像](screens/extension-issues-1440.png) | 関連情報を開いても、ダイアログ内の件名と背景の会話を突き合わせられる。 [画像](screens/extension-issues-1024.png) | 閉じる操作を上に残し、タイトル入力から起票内容確認までが画面幅に収まる。 [画像](screens/extension-issues-375.png) |
| extension-merge | 現在の会話番号・件名が右の選択パネルにも記載されている。 [画像](screens/extension-merge-1440.png) | 統合可能な候補1件と選択済みの#2を、暗転した背景に戻らず照合できる。 [画像](screens/extension-merge-1024.png) | 候補の件名全文・選択矢印・内容確認の文言がすべてパネル内に見える。 [画像](screens/extension-merge-375.png) |
| extension-metrics | 4日・100%・データなしが個別の指標に対応し、解決1件と完了1件の定義も別にある。 [画像](screens/extension-metrics-1440.png) | 補助の割合では、母数10件の0%と母数0件の未算出を読み分けられる。 [画像](screens/extension-metrics-1024.png) | 製品と期間が縦に並ぶ。少数の注意、平均時間、初回解決の対象1件まで順に見える。 [画像](screens/extension-metrics-375.png) |
| extension-notify | 通知先Slackの上に「新着と担当者の変更を運営者に通知」の説明がある。 [画像](screens/extension-notify-1440.png) | 並列の新着通知・対応状況の集計のどちらに属する設定か、カードの枠で分かる。 [画像](screens/extension-notify-1024.png) | 新着通知の有効状態と通知先を1枚のカード内で読み、設定に進める。 [画像](screens/extension-notify-375.png) |
| extension-presence | 会話本文の右に「ほかに閲覧中の担当者はいません」と表示。 [画像](screens/extension-presence-1440.png) | 関連情報では閲覧者と相手の他の問い合わせを別々のカードに置いている。 [画像](screens/extension-presence-1024.png) | 全幅パネルの左に見出し、右に閉じる、下に操作履歴があり文字の重なりがない。 [画像](screens/extension-presence-375.png) |
| extension-rules | 振り分けルールの有効状態と実際の登録件数0を示している。 [画像](screens/extension-rules-1440.png) | 隣の無効の書き出しカードとは別に、ルールを設定するボタンがある。 [画像](screens/extension-rules-1024.png) | 振り分け対象となる件名・製品と、振り分け後の担当者・ラベルまで説明に収まる。 [画像](screens/extension-rules-375.png) |
| extension-snooze | 右の操作パネルで今は保留されていないことを確認できる。 [画像](screens/extension-snooze-1440.png) | 日時の日本時間指定と24時間表記の例が、ボタンより先に読める。 [画像](screens/extension-snooze-1024.png) | 指定日時まで保留と迷惑メールにするの間に余白があり、本文や返信操作が前に重ならない。 [画像](screens/extension-snooze-375.png) |
| extension-spam | 左の迷惑メール件数、見出し1件、検索条件の迷惑メールが一致。 [画像](screens/extension-spam-1440.png) | 件名と本文見本の左にチェック、右に製品名と受信時刻が収まる。 [画像](screens/extension-spam-1024.png) | 検索は全幅。件名、#9、山田花、9時間前が残り、本文見本の末尾が省略される。 [画像](screens/extension-spam-375.png) |
| extension-survey | Slide、解決したかを尋ねる見出し、問い合わせ番号#8が上から並ぶ。 [画像](screens/extension-survey-1440.png) | 回答の送信タイミングを「選んだ回答を送信します」で事前に伝える。 [画像](screens/extension-survey-1024.png) | 両方の回答が画面内に隣り合い、白い枠と間隔で押し分けられる。 [画像](screens/extension-survey-375.png) |
| extensions | 受付5種と回答のグループを見出しで区切り、有効16件を上部に表示。 [画像](screens/extensions-1440.png) | 3列のままカード名が2行になっても、状態の黒いボタンは右側に残る。 [画像](screens/extensions-1024.png) | 状態フィルターの下から1列になり、迷惑メールと自動受付返信それぞれに設定がある。 [画像](screens/extensions-375.png) |
| guide-articles | 公開用の2製品のカードとは別に管理用の「記事の管理を開く」が上にある。 [画像](screens/guide-articles-1440.png) | 表示URLとコードのsrcの製品別パスが一致し、コピー先を確認できる。 [画像](screens/guide-articles-1024.png) | 長いURLは途中で改行し、固定高のコード欄で後半が隠れてもコピーの操作が露出する。 [画像](screens/guide-articles-375.png) |
| guide-auto-ack | 全製品を対象とした承認とsatoの有効化日時を確認できる。 [画像](screens/guide-auto-ack-1440.png) | Deskのプレビューの表示例番号#123と、文面編集の案内の言語「英語」が整合。 [画像](screens/guide-auto-ack-1024.png) | 承認者のメールは次行に収まり、Deskの件名・受付通知と返信で追記できる説明も読める。 [画像](screens/guide-auto-ack-375.png) |
| guide-canned | 表示名、本文、新規作成ボタンが同一の新規枠にあり、保存済み1件を上に残す。 [画像](screens/guide-canned-1440.png) | 見本の名前と本文が別段になり、右側で対象名付きの編集を開ける。 [画像](screens/guide-canned-1024.png) | 既存の本文は横幅を使って2行で完結し、その下に編集、区切り線の下に新規入力が並ぶ。 [画像](screens/guide-canned-375.png) |
| guide-chat | HTMLにコードを貼る手順と、記事推薦に使う公開記事・Workers AIの条件が明記される。 [画像](screens/guide-chat-1440.png) | Slideの埋め込み先の登録と返信目安の保存に、それぞれ対応した取り消しがある。 [画像](screens/guide-chat-1024.png) | Deskの受付開始、記事のおすすめ設定、その次の製品の設定をカードで区切っている。 [画像](screens/guide-chat-375.png) |
| guide-export | 出力対象は全期間・全製品で、件数は会話11・メッセージ17・履歴12と読めます。 [画像](screens/guide-export-1440.png) | メール・名前を隠す設定と、本文中の連絡先が残る説明を同じ枠で確認できます。 [画像](screens/guide-export-1024.png) | 「操作履歴」の途中で改行します。件数、出力ボタン、必要な権限は読み取れます。 [画像](screens/guide-export-375.png) |
| guide-feedback | 窓口の確認方法に続いて Desk のローカル公開先と利用開始が見えます。 [画像](screens/guide-feedback-1440.png) | Slide の公開フォームと埋め込み用 iframe を製品別に照合できます。 [画像](screens/guide-feedback-1024.png) | URL は途中から折り返しますが、製品名と操作は同じ枠内に収まります。 [画像](screens/guide-feedback-375.png) |
| guide-form | 公開フォームでテスト送信し、受信箱を確認する順序が示されています。 [画像](screens/guide-form-1440.png) | Desk の利用開始、Slide の公開先と受信箱のリンクを区別できます。 [画像](screens/guide-form-1024.png) | 公開URLを一行で読めます。埋め込みコードと送信後に示す返信目安も判別できます。 [画像](screens/guide-form-375.png) |
| guide-issues | GitHub トークン設定済みの表示と、Issues の読み書きが必要という説明を確認できます。 [画像](screens/guide-issues-1440.png) | Desk の owner/repository 入力例と、Slide の登録済み example/helpdesk が別枠です。 [画像](screens/guide-issues-1024.png) | 登録、更新、解除を各製品の下で確認でき、GitHub への投稿前に確認する案内も読めます。 [画像](screens/guide-issues-375.png) |
| guide-merge | 同じ相手・同じ窓口が統合先の条件と読めます。 [画像](screens/guide-merge-1440.png) | 開いている会話から選んだ会話へメッセージが移る方向を説明しています。 [画像](screens/guide-merge-1024.png) | 受信箱へ進むボタンと追加権限の説明を一画面で確認できます。 [画像](screens/guide-merge-375.png) |
| guide-metrics | 集計の対象としてプロダクトと期間を選ぶ案内があります。 [画像](screens/guide-metrics-1440.png) | 「集計画面を開く」がサイドバーの「声の集計」と分かれて表示されます。 [画像](screens/guide-metrics-1024.png) | 完了前後の指標を確認する案内、ボタン、権限枠の順で読めます。 [画像](screens/guide-metrics-375.png) |
| guide-notify | Discord には settings.format の discord を指定する説明を確認できます。 [画像](screens/guide-notify-1440.png) | 現在の Slack 通知先とメール設定例を別の段落で判別できます。 [画像](screens/guide-notify-1024.png) | Webhook のシークレット名やメール設定例が画面に収まり、末尾の外部接続・閲覧・メール送信権限まで確認できます。 [画像](screens/guide-notify-375.png) |
| guide-presence | 返信欄で担当者名・閲覧中・入力中が見える案内があります。 [画像](screens/guide-presence-1440.png) | 「関連情報」で人数、自分だけの場合は他に閲覧者がいない表示になると読めます。 [画像](screens/guide-presence-1024.png) | 説明が折り返されても、受信箱で会話を選ぶボタンと権限表示を隠しません。 [画像](screens/guide-presence-375.png) |
| guide-rules | 保存済み0件と、初期状態の全製品・空の件名欄を確認できます。 [画像](screens/guide-rules-1440.png) | 「空欄の場合、すべての件名に適用します。」が入力欄の直下にあります。 [画像](screens/guide-rules-1024.png) | ラベル・担当者の選択条件を読んでから、画面下部の保存と取り消しを識別できます。 [画像](screens/guide-rules-375.png) |
| guide-snooze | 「その他の操作」から設定する手順に時刻基準の日本時間が併記されています。 [画像](screens/guide-snooze-1440.png) | 再表示の期限と期限前に「保留を解除」で戻す操作の両方が読めます。 [画像](screens/guide-snooze-1024.png) | 「受信箱で会話を選ぶ」が折り返しの説明と権限枠の間に独立しています。 [画像](screens/guide-snooze-375.png) |
| guide-spam | 隔離した会話の内容を確認し、誤判定なら会話の操作から解除できる案内があります。 [画像](screens/guide-spam-1440.png) | 「迷惑メールを開く」とサイドバーの迷惑メール1件を照合できます。 [画像](screens/guide-spam-1024.png) | 戻る、内容を確認するボタン、追加権限の有無を画面上部で確認できます。 [画像](screens/guide-spam-375.png) |
| guide-survey | 全製品への自動送信を承認した運営者と日本時間の日時が見えます。 [画像](screens/guide-survey-1440.png) | Desk の例示件名・英語本文・回答先がまとまり、下に編集枠の言語も見えます。 [画像](screens/guide-survey-1024.png) | 承認者のメールと回答用URLは折り返して枠内に表示され、それぞれの対象を追えます。 [画像](screens/guide-survey-375.png) |
| loop-disable | ダイアログの見出しと決定ボタンに対象の振り分けルールが明記されています。 [画像](screens/loop-disable-1440.png) | 設定は保持し、再度有効にするまで新しい処理が止まることを読めます。 [画像](screens/loop-disable-1024.png) | キャンセルと無効化は別行に収まり、背後の有効表示より手前で読めます。 [画像](screens/loop-disable-375.png) |
| loop-enable | フォーム機能の全製品での有効化と製品ごとの受付開始を個別に説明しています。 [画像](screens/loop-enable-1440.png) | 追加権限を必要としない旨を決定前の確認文で読めます。 [画像](screens/loop-enable-1024.png) | 機能名入りの決定ボタンが全幅に収まり、上のキャンセルとも間隔があります。 [画像](screens/loop-enable-375.png) |
| suggest-settings | Slide のおすすめ設定には下限60%と、超えた記事を高い順に3件まで提示する説明があります。 [画像](screens/suggest-settings-1440.png) | チャット・フォーム用の Clef Flash と、受付返信・運営画面用の Clef を各ラベルで識別できます。 [画像](screens/suggest-settings-1024.png) | 自動受付返信に記事を添える設定は未チェックです。保存・取り消しがその下の一行に収まります。 [画像](screens/suggest-settings-375.png) |
| widget-csp | 実際の埋め込み先に設定する CSP と、コードを貼るための枠を区別できます。 [画像](screens/widget-csp-1440.png) | script-src と frame-src の両方に追加するヘルプデスクのオリジンをポートまで読めます。 [画像](screens/widget-csp-1024.png) | CSP の全文とコピーボタンは表示されます。折り返した埋め込みコードの末尾は欄の下に隠れます。 [画像](screens/widget-csp-375.png) |
| widget-options | 配置の右下、ボタンの文言「ヘルプ」、最初の説明文の入力欄を個別に確認できます。 [画像](screens/widget-options-1440.png) | 公開先の Slide と埋め込みコードの data-product が対応します。 [画像](screens/widget-options-1024.png) | 最初の説明文と文言の入力枠は画面幅に収まり、上のコード欄は末尾を一度に表示できません。 [画像](screens/widget-options-375.png) |
| widget-preview | Slide の見本内に質問欄とフォーカス枠が出ており、編集画面のコード欄と区別できます。 [画像](screens/widget-preview-1440.png) | 記事の一覧・返信不要の意見と問い合わせフォームのリンクが質問ボタンの下にあります。 [画像](screens/widget-preview-1024.png) | ヘルプのパネルは見本の幅に収まり、閉じるボタン・質問ボタン・3つのリンクは重なりません。 [画像](screens/widget-preview-375.png) |
