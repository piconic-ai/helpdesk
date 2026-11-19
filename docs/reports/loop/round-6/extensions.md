# 第6周　拡張機能の目視記録

当周に撮影した39状態を1440px・1024px・375pxで開き、117枚を確認しました。各状態で表示対象と状態の対応、操作に必要な案内、文字やボタンの欠け・重なりを点検しました。

**高0件・中0件・低3件**。375pxで継続した3件は次のとおりです。

- 迷惑メール一覧では、件名に続く本文の抜粋が途中で省略されます。番号や件名は残り、本文を確かめるには会話を開きます。
- 記事・公開フォーム・ウィジェット等の埋め込みコードは、折り返すと欄の高さを超えます。末尾まで目で照合するには欄内をスクロールします。コピー操作は別に表示されます。
- データの書き出しでは対象件数の「操作履歴」が2行に分かれ、項目と件数を一目で対応づけにくくなります。値と出力操作は画面内に収まります。

| 状態 | 1440px | 1024px | 375px |
| --- | --- | --- | --- |
| extension-articles | 領収書の記事1件が公開中。 [画像](screens/extension-articles-1440.png) | 更新日と製品が次行に移り、提示数・閲覧数は直下に並ぶ。 [画像](screens/extension-articles-1024.png) | 公開状態と順序を横に配置。記事作成は独立した行にある。 [画像](screens/extension-articles-375.png) |
| extension-auto-ack | 有効4件の構成で、自動受付返信に有効表示がある。 [画像](screens/extension-auto-ack-1440.png) | 文面の編集場所と対象が初めて届いた問い合わせであることを説明。 [画像](screens/extension-auto-ack-1024.png) | 受付返信とフィードバックが別のカードで、有効状態を区別できる。 [画像](screens/extension-auto-ack-375.png) |
| extension-canned | カードの下に受付定型文を選んだ状態が見える。 [画像](screens/extension-canned-1440.png) | 英語のひな形、下書き作成、空の返信欄の順に続く。 [画像](screens/extension-canned-1024.png) | ひな形の製品変数が2行目に回るが全文読め、返信タブに重ならない。 [画像](screens/extension-canned-375.png) |
| extension-chat | Slideのヘルプに自動記事検索の説明を表示。 [画像](screens/extension-chat-1440.png) | 質問入力と送信ボタンがまとまり、他の窓口は下にある。 [画像](screens/extension-chat-1024.png) | メール問い合わせと記事一覧は折り返さず同時に読める。 [画像](screens/extension-chat-375.png) |
| extension-export | 全期間・全製品の会話11、メッセージ17、操作履歴12件。 [画像](screens/extension-export-1440.png) | 伏せる個人情報と残る自由記述について、書き出し前に説明がある。 [画像](screens/extension-export-1024.png) | 操作履歴の「操」だけが前の行末に来る。件数とボタンは切れない。 [画像](screens/extension-export-375.png) |
| extension-feedback | 受付済み#10には、確認済みへの変更と問い合わせへの変更がある。 [画像](screens/extension-feedback-1440.png) | 関連情報の操作は本文や内部メモから独立。 [画像](screens/extension-feedback-1024.png) | 相手には送られない注記とメモ保存が同じ枠内に収まる。 [画像](screens/extension-feedback-375.png) |
| extension-form | 全項目の入力を求めるSlideの窓口。 [画像](screens/extension-form-1440.png) | 件名・内容・連絡先アドレスを別々のラベルで示す。 [画像](screens/extension-form-1024.png) | 本文欄の下にメール欄と送信が収まり、初期表示で全項目が分かる。 [画像](screens/extension-form-375.png) |
| extension-issues | 関連Issueなしの会話で、投稿先は example/helpdesk。 [画像](screens/extension-issues-1440.png) | 元の問い合わせと公開する要約、タイトルを右のパネル内で確認。 [画像](screens/extension-issues-1024.png) | 閉じると「起票内容を確認」を同時に識別でき、欄の右端も見える。 [画像](screens/extension-issues-375.png) |
| extension-merge | 右側の統合元#1に対して候補は1件。 [画像](screens/extension-merge-1440.png) | 統合先#2の招待メールの件名も確認操作もサイドパネルに収まる。 [画像](screens/extension-merge-1024.png) | 元と先の両方を番号・件名で判別でき、確定前に確認する旨が読める。 [画像](screens/extension-merge-375.png) |
| extension-metrics | 解決件数1、完了件数1が別の定義で示される。 [画像](screens/extension-metrics-1440.png) | 回答済み1件の100%と平均作業時間のデータなしを見分けられる。 [画像](screens/extension-metrics-1024.png) | 全製品と過去30日の操作を縦に分け、平均4日の注記まで読める。 [画像](screens/extension-metrics-375.png) |
| extension-notify | 「整える」の中に新着通知があり、新着・担当変更のいずれも対象。 [画像](screens/extension-notify-1440.png) | 通知先Slackを有効表示と別の行に示す。 [画像](screens/extension-notify-1024.png) | 設定ボタンが新着通知の枠に収まり、下の集計用設定から離れている。 [画像](screens/extension-notify-375.png) |
| extension-presence | 会話横にほかに閲覧している担当者がいない旨を示す。 [画像](screens/extension-presence-1440.png) | 関連情報のパネル上部に担当者、下に同じ相手のほかの問い合わせ。 [画像](screens/extension-presence-1024.png) | 2件の空状態が独立したカードにあり、履歴の見出しと重ならない。 [画像](screens/extension-presence-375.png) |
| extension-rules | 有効と登録0件をカードで確認でき、設定へ進める。 [画像](screens/extension-rules-1440.png) | 2行のカード名を最後まで読め、件数が次行に独立する。 [画像](screens/extension-rules-1024.png) | 無効の書き出しに続くカードで、自動化ルールの状態と設定ボタンをひとまとまりで読める。 [画像](screens/extension-rules-375.png) |
| extension-snooze | 保留していない状態、日時入力、保留操作の順に読める。 [画像](screens/extension-snooze-1440.png) | 日本時間の指定と24時間表記の入力例が入力欄の近くにある。 [画像](screens/extension-snooze-1024.png) | 保留操作と迷惑メールへの移動が別の区画にあり、誤認しにくい。 [画像](screens/extension-snooze-375.png) |
| extension-spam | 迷惑メール1件、#9、Slide、受信時刻を一覧で照合できる。 [画像](screens/extension-spam-1440.png) | 絞り込みと並び替えの下に、未読の営業のお知らせが1行で見える。 [画像](screens/extension-spam-1024.png) | 件名と番号は判別できる。本文の抜粋が「営業のお知らせで…」で切れる。 [画像](screens/extension-spam-375.png) |
| extension-survey | Slideの問い合わせ#8への回答であると分かり、選択すると送信する説明が先に出る。 [画像](screens/extension-survey-1440.png) | はい・いいえを同じ強さで表示し、それぞれ選択できる。 [画像](screens/extension-survey-1024.png) | 見出しを1行で読め、説明の下に2つの回答操作が収まる。 [画像](screens/extension-survey-375.png) |
| extensions | 有効16件とグループの見出しを起点に受付・返信の機能を探せる。 [画像](screens/extensions-1440.png) | 3列で機能名が折り返し、説明や設定へのリンクと重ならない。 [画像](screens/extensions-1024.png) | 検索欄が画面幅を使い、各カードが縦に並ぶ。対象と設定ボタンを対応づけられる。 [画像](screens/extensions-375.png) |
| guide-articles | 記事の管理ボタンと製品別の公開ページが分かれ、Desk・SlideのURLを読める。 [画像](screens/guide-articles-1440.png) | DeskのURL、コード2行とコピー操作が枠内に収まる。 [画像](screens/guide-articles-1024.png) | DeskのURLが折り返す。埋め込みコードの末尾は欄外に続き、直下にコピー操作がある。 [画像](screens/guide-articles-375.png) |
| guide-auto-ack | 承認対象、運営者、日時の後に製品選択があり、Deskの例文と編集欄を区別できる。 [画像](screens/guide-auto-ack-1440.png) | 英語の件名・本文が編集欄の言語「英語」と一致する。 [画像](screens/guide-auto-ack-1024.png) | 運営者のメールは次行に続く。承認範囲、日時、Deskの英語例文末尾まで読める。 [画像](screens/guide-auto-ack-375.png) |
| guide-canned | 保存済み1件の名前、本文、編集と、新しい定型文の入力欄を別々に確認できる。 [画像](screens/guide-canned-1440.png) | 幅が狭まると表示名と本文が縦に並ぶ。右の編集操作と重ならない。 [画像](screens/guide-canned-1024.png) | 本文の変数が見え、対象名付き編集の下に別枠で新規作成欄が始まる。 [画像](screens/guide-canned-375.png) |
| guide-chat | Deskの受付開始とSlideの埋め込み先登録・返信目安の保存を区別できる。 [画像](screens/guide-chat-1440.png) | 製品ごとに囲みがあり、Slideの公開URLとチャットを開く操作が並ぶ。 [画像](screens/guide-chat-1024.png) | 受付開始と記事設定の間に間隔があり、SlideでURLの入力例と登録ボタンを読める。 [画像](screens/guide-chat-375.png) |
| guide-export | 対象11会話・17メッセージ・12操作履歴を1行で読み、出力範囲と伏せる項目を確認できる。 [画像](screens/guide-export-1440.png) | 伏せて書き出す選択値とJSON Linesの操作が続き、閲覧権限を別枠に示す。 [画像](screens/guide-export-1024.png) | 「操作履歴」の途中で改行する。12件は次行で読め、伏せ方や出力操作を隠さない。 [画像](screens/guide-export-375.png) |
| guide-feedback | 受信箱を開くボタンの下で、Deskの受付開始とSlideの公開フォームを区別できる。 [画像](screens/guide-feedback-1440.png) | SlideにURLとコードを表示し、その下にコピー、権限案内が続く。 [画像](screens/guide-feedback-1024.png) | 受信箱と公開フォームが別の場所にある。長い公開URLは折り返して末尾まで読める。 [画像](screens/guide-feedback-375.png) |
| guide-form | 受付開始→テスト送信→受信箱を確認する順序を冒頭に示し、DeskとSlideが別枠にある。 [画像](screens/guide-form-1440.png) | Slideの公開フォームと受信箱を別の行に表示し、コピーと目安の保存も区別できる。 [画像](screens/guide-form-1024.png) | 公開URLが1行で表示される。コード欄はURLとタイトルまで見え、続きは欄の下にある。 [画像](screens/guide-form-375.png) |
| guide-issues | トークン設定済み、公開する要約の注意、起票前の確認が製品設定の上にある。 [画像](screens/guide-issues-1440.png) | Deskには入力例と登録、Slideにはexample/helpdeskと更新が表示される。 [画像](screens/guide-issues-1024.png) | 各製品の入力欄と取り消しがカード内に収まり、両方の操作が初期画面で読める。 [画像](screens/guide-issues-375.png) |
| guide-merge | 同じ相手・窓口という条件と、選択した会話へメッセージが移る向きが書かれる。 [画像](screens/guide-merge-1440.png) | 説明に続く受信箱ボタンから始める手順、追加権限の有無を見分けられる。 [画像](screens/guide-merge-1024.png) | 説明は3行に収まり、会話を選ぶボタンと権限のカードを同時に確認できる。 [画像](screens/guide-merge-375.png) |
| guide-metrics | 製品と期間を選んで完了前後を比較する案内の直下に集計画面へのボタンがある。 [画像](screens/guide-metrics-1440.png) | サイドバーの声の集計と対応状況の集計を見分けられ、権限欄まで視野に入る。 [画像](screens/guide-metrics-1024.png) | 見出し1行、案内2行で収まり、集計画面を開く操作が折り返さない。 [画像](screens/guide-metrics-375.png) |
| guide-notify | SlackとDiscordの設定の違いに続き、現在の通知先Slackとメールの設定例が別々に出る。 [画像](screens/guide-notify-1440.png) | Workerのシークレット名、メール設定例、外部接続・閲覧・送信の権限を最後まで読める。 [画像](screens/guide-notify-1024.png) | 設定例が3行に折り返し、メールアドレスと閉じ括弧が欠けない。 [画像](screens/guide-notify-375.png) |
| guide-presence | 返信欄の「閲覧中」「入力中」と関連情報の人数表示の違いが説明される。 [画像](screens/guide-presence-1440.png) | 1人のときの表示例まで説明が続き、会話を選ぶ入口は案内の直下にある。 [画像](screens/guide-presence-1024.png) | 5行の本文の次に受信箱ボタン、追加権限の案内が続いて同時に見える。 [画像](screens/guide-presence-375.png) |
| guide-rules | 0件と保存済みルールの空状態が一致し、件名が空欄の場合の対象範囲が明記される。 [画像](screens/guide-rules-1440.png) | 製品・条件・実行内容の順に並び、ラベルか担当を選ぶ案内が保存の前にある。 [画像](screens/guide-rules-1024.png) | すべてのプロダクトという選択値が収まり、保存・取り消しまで縦にたどれる。 [画像](screens/guide-rules-375.png) |
| guide-snooze | 会話の「その他の操作」から日本時間の再表示日時を指定する手順がある。 [画像](screens/guide-snooze-1440.png) | 期限前の解除方法まで2行に収まり、受信箱で会話を選ぶ入口が見える。 [画像](screens/guide-snooze-1024.png) | 期限到来で受信箱に戻る説明と解除方法がひと続きに読め、権限欄まで収まる。 [画像](screens/guide-snooze-375.png) |
| guide-spam | 隔離した会話を開いて確認し、誤隔離なら解除できることがボタンの前に書かれる。 [画像](screens/guide-spam-1440.png) | 左の迷惑メール1件と本文の「迷惑メールを開く」が同じ名称で対応する。 [画像](screens/guide-spam-1024.png) | 見出し・3行の解除案内・開く操作・追加権限の有無が縦に収まる。 [画像](screens/guide-spam-375.png) |
| guide-survey | 完了時にリンクを送る説明、承認者と日時、Deskの文面例を別々に確認できる。 [画像](screens/guide-survey-1440.png) | 例の件名#123と送信ごとに専用リンクを作る注記があり、編集側にも英語の選択値が見える。 [画像](screens/guide-survey-1024.png) | メールアドレスと例示URLが折り返し、承認者・日本時間と回答用URLの末尾まで読める。 [画像](screens/guide-survey-375.png) |
| loop-disable | 中央の確認で対象が振り分けルールと分かり、設定保持と新しい処理の停止が書かれる。 [画像](screens/loop-disable-1440.png) | 背景を暗くし、キャンセルと無効化が別行にある。 [画像](screens/loop-disable-1024.png) | 左右に余白があり、対象名を含む無効化ボタンが1行に収まる。 [画像](screens/loop-disable-375.png) |
| loop-enable | 問い合わせフォームの有効化と製品別の受付開始を確認文で区別している。 [画像](screens/loop-enable-1440.png) | 追加権限の有無が操作より先に表示され、キャンセルは確定の上にある。 [画像](screens/loop-enable-1024.png) | 説明と対象名付き操作をすべて中央の枠内で読める。背後の拡張カードと混ざらない。 [画像](screens/loop-enable-375.png) |
| suggest-settings | 60%の条件と最大3件の説明を照合でき、チャット・フォームと受付返信・運営用にモデルが分かれる。 [画像](screens/suggest-settings-1440.png) | Clef FlashとClefが異なる欄に表示され、自動受付返信の記事添付は未選択。 [画像](screens/suggest-settings-1024.png) | ラベルとチェックが並び、設定の保存・取り消しが同じ段に収まる。 [画像](screens/suggest-settings-375.png) |
| widget-csp | CSP案内が展開され、埋め込み先でscript-srcとframe-srcの両方に追加するオリジンが読める。 [画像](screens/widget-csp-1440.png) | 公開URLと埋め込みコードと設定先のオリジンを同一画面で照合できる。 [画像](screens/widget-csp-1024.png) | frame-srcは改行を挟むが文字は残り、指定先のホストとポートが連続して読める。 [画像](screens/widget-csp-375.png) |
| widget-options | コピー操作の下にボタン位置「右下」、文言「ヘルプ」、最初の説明文が別項目に並ぶ。 [画像](screens/widget-options-1440.png) | 2行のコード例、位置の選択、文言入力、説明文欄の役割がラベルで分かる。 [画像](screens/widget-options-1024.png) | 説明文の入力例まで枠に収まる。コード欄の続きを見るには欄内を送る必要がある。 [画像](screens/widget-options-375.png) |
| widget-preview | 見本の枠内にSlideのヘルプが開き、青枠の質問欄と質問するボタンが見える。 [画像](screens/widget-preview-1440.png) | 閉じる操作は右上にあり、記事・意見と問い合わせフォームのリンクが下に分かれる。 [画像](screens/widget-preview-1024.png) | 見本が1列の幅を使う。質問欄、送信、問い合わせフォームまでが重ならずに見える。 [画像](screens/widget-preview-375.png) |
