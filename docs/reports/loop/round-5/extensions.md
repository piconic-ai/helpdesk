# 第5周　拡張機能の目視記録

第5周で撮影した39状態を1440px・1024px・375pxの3幅で確認しました。対象は117枚です。各状態について操作対象、案内の内容、画面幅による読みやすさを確認しました。高0件、中0件、低3件です。

## 375pxで残った軽微な指摘

- **迷惑メール一覧**　問い合わせ#9の件名「未承諾の営業案内」と差出人は読めます。幅の制約で本文抜粋の末尾が省略され、続きは会話を開いて確認する必要があります。
- **埋め込みコード**　記事・フォームの iframe やチャットの script が折り返して、閉じタグまで一度に表示できません。コピー操作は残っていますが、全文を目で照合するには欄内を動かす必要があります。
- **書き出し件数**　書き出しとガイドの両画像で、会話11件・メッセージ17件に続く「操作履歴12件」が「操」と「作履歴12件」に分かれます。対象名と件数をまとめて読み取りづらいため、同じ原因の1件として記録しました。

## 状態ごとの観察

| 状態 | 1440px | 1024px | 375px |
| --- | --- | --- | --- |
| extension-articles | 「領収書を発行する」の公開状態・製品・更新日が横一列に並ぶ。 [画像](screens/extension-articles-1440.png) | 製品と更新日が次行に移り、提示0回と閲覧0回はさらに下に並ぶ。 [画像](screens/extension-articles-1024.png) | 「記事を書く」が単独の行になり、記事のない質問と候補0件の操作から見分けられる。 [画像](screens/extension-articles-375.png) |
| extension-auto-ack | 受付の中央に自動受付返信があり、「有効」と初回メールに送る説明がある。 [画像](screens/extension-auto-ack-1440.png) | 文面を確認・編集できる説明の直下に設定ボタンがある。 [画像](screens/extension-auto-ack-1024.png) | 1列表示で迷惑メール、自動受付返信、フィードバックが別枠になり有効・無効を読める。 [画像](screens/extension-auto-ack-375.png) |
| extension-canned | 会話本文の下に選択済みの受付定型文と置換前の英語本文を表示。 [画像](screens/extension-canned-1440.png) | 「定型文から下書きを作成」の下に返信・内部メモの選択欄があり、操作の順を追える。 [画像](screens/extension-canned-1024.png) | 本文が折り返されても {{product}} と下書き作成は表示され、返信欄と重ならない。 [画像](screens/extension-canned-375.png) |
| extension-chat | Slide のヘルプという窓口名と、先に記事を探す説明が質問欄の上にある。 [画像](screens/extension-chat-1440.png) | 質問するボタンとヘルプ記事・メール問い合わせの入口は水平線で区切られる。 [画像](screens/extension-chat-1024.png) | 質問欄が画面幅に収まり、メールで問い合わせるリンクも初期表示で全文が読める。 [画像](screens/extension-chat-375.png) |
| extension-export | 全期間・全製品で会話11件、メッセージ17件、操作履歴12件。 [画像](screens/extension-export-1440.png) | 「伏せて書き出す」が選択され、JSON Lines と出力形式も分かる。 [画像](screens/extension-export-1024.png) | 「操作履歴」は「操」と「作履歴」に分かれる。12件と下の本文閲覧権限は読める。 [画像](screens/extension-export-375.png) |
| extension-feedback | Slide の受付済み#10に、確認済みと問い合わせへの変更が並ぶ。 [画像](screens/extension-feedback-1440.png) | 折り畳んだ関連情報への入口と状態表示が本文から離れている。 [画像](screens/extension-feedback-1024.png) | 利用者からの本文とチームのメモは別枠で、メモは相手に送られない説明が見える。 [画像](screens/extension-feedback-375.png) |
| extension-form | Slide 名義の窓口に全項目の入力が必要と表示される。 [画像](screens/extension-form-1440.png) | 件名・複数行の内容・連絡先メールアドレスの順に独立したラベルがある。 [画像](screens/extension-form-1024.png) | 3つの入力欄と送信ボタンが一画面に入り、両側に余白が残る。 [画像](screens/extension-form-375.png) |
| extension-issues | 元の会話#1と投稿先 example/helpdesk が起票フォーム上部に並ぶ。 [画像](screens/extension-issues-1440.png) | サイドパネル内にタイトル、公開する要約と「起票内容を確認」が収まる。 [画像](screens/extension-issues-1024.png) | 上部の閉じるボタンと開いた入力フォームが重ならず、投稿前に確認する操作を読める。 [画像](screens/extension-issues-375.png) |
| extension-merge | 候補1件。統合元#1と選択済みの#2を番号・件名で区別できる。 [画像](screens/extension-merge-1440.png) | 開いた関連情報で統合先の選択欄と内容確認ボタンが右端からはみ出さない。 [画像](screens/extension-merge-1024.png) | 招待メールについての件名が末尾まで表示され、元の領収書の件名と混同しない。 [画像](screens/extension-merge-375.png) |
| extension-metrics | 全製品・過去30日で、4日の平均と対象1件の100%が別々のカードに載る。 [画像](screens/extension-metrics-1440.png) | 0%とデータなしの扱いは、それぞれ0件/10件、0件/0件の母数で判別できる。 [画像](screens/extension-metrics-1024.png) | 製品、期間は上下に並び、解決5件未満の注意と最初の2枚の数値まで読める。 [画像](screens/extension-metrics-375.png) |
| extension-notify | 新着と担当者変更が運営者への通知対象と読める。 [画像](screens/extension-notify-1440.png) | 有効の表示と「通知先：Slack」を両方確認できる。 [画像](screens/extension-notify-1024.png) | 縦一列の通知カード内で設定ボタンが通知先の直下にあり、次の集計設定と区別できる。 [画像](screens/extension-notify-375.png) |
| extension-presence | 右側に「ほかに閲覧中の担当者はいません。」と表示される。 [画像](screens/extension-presence-1440.png) | 会話の関連情報内で、別の問い合わせがない表示と別枠になっている。 [画像](screens/extension-presence-1024.png) | パネルの閉じる、閲覧者、同じ相手の問い合わせ、操作履歴が上から順に現れる。 [画像](screens/extension-presence-375.png) |
| extension-rules | 振り分けルールの機能は有効で、登録済みは0件と表示。 [画像](screens/extension-rules-1440.png) | ルール名の折り返しは右の有効ボタンにかからず、何を適用するか説明がある。 [画像](screens/extension-rules-1024.png) | 書き出しの無効カードの下にルール設定が一枠にまとまる。 [画像](screens/extension-rules-375.png) |
| extension-snooze | 現在は保留されていない表示の下に再表示日時の入力欄。 [画像](screens/extension-snooze-1440.png) | 日本時間・24時間表記であることと入力例の14:30が読める。 [画像](screens/extension-snooze-1024.png) | 「指定日時まで保留」と「迷惑メールにする」の枠に間隔があり、横切れもない。 [画像](screens/extension-snooze-375.png) |
| extension-spam | 隔離1件に検索、絞り込み、待たせている順が揃う。 [画像](screens/extension-spam-1440.png) | Slide、9時間前、#9と送信者名が未承諾の営業案内に対応する。 [画像](screens/extension-spam-1024.png) | 件名は全文読める。本文「営業のお知らせで…」は省略され、続きの確認には会話を開く必要がある。 [画像](screens/extension-spam-375.png) |
| extension-survey | Slide の問い合わせ#8が質問の直下に出る。 [画像](screens/extension-survey-1440.png) | 選択すると回答が送信される旨を、はい・いいえの前に表示。 [画像](screens/extension-survey-1024.png) | 2ボタンは同じ強調で独立し、質問文も一行で読める。 [画像](screens/extension-survey-375.png) |
| extensions | 有効16件の合計、検索と有効状態の絞り込みが上部にある。 [画像](screens/extensions-1440.png) | 受付のカード名が2行になっても、各有効状態・設定操作と重ならない。 [画像](screens/extensions-1024.png) | 検索・有効状態の後にカードが縦に並び、それぞれの設定先が分かる。 [画像](screens/extensions-375.png) |
| guide-articles | 「記事の管理を開く」の下に Desk と Slide の公開資料が製品別にある。 [画像](screens/guide-articles-1440.png) | URL末尾の /desk/ と /slide/ がそれぞれの埋め込み例と一致する。 [画像](screens/guide-articles-1024.png) | Desk のURLは次行まで読めるが、iframe の末尾はコード欄に隠れる。コピー操作は見える。 [画像](screens/guide-articles-375.png) |
| guide-auto-ack | 承認の対象は全製品。初回受付への返信であることと有効化した運営者を表示。 [画像](screens/guide-auto-ack-1440.png) | 製品選択は Desk、送信文面も Desk。英語設定と例示件名#123が照合できる。 [画像](screens/guide-auto-ack-1024.png) | 有効化日時の日本時間、運営者メール、英語の返信例が折り返し後も読める。 [画像](screens/guide-auto-ack-375.png) |
| guide-canned | 登録済み1件の名称・サンプル本文・個別編集が新規作成の上にある。 [画像](screens/guide-canned-1440.png) | 行の右で編集対象名を確認でき、本文と {{name}}、{{product}} の説明も表示される。 [画像](screens/guide-canned-1024.png) | 一覧を閉じたまま改行された本文を末尾まで読み、その下で編集対象を確認できる。 [画像](screens/guide-canned-375.png) |
| guide-chat | 設置手順に公開ヘルプ記事と Workers AI のバインディングが示される。 [画像](screens/guide-chat-1440.png) | Desk の受付開始と Slide の埋め込み先登録・返信目安保存を区別できる。 [画像](screens/guide-chat-1024.png) | Desk のローカル公開先とボタンが同じ枠内に収まり、Slide のURL欄は別枠で始まる。 [画像](screens/guide-chat-375.png) |
| guide-export | 本文中もメールアドレスと登録名を置換し、住所など自由記述は残る説明が読める。 [画像](screens/guide-export-1440.png) | 書き出す内容の選択・実行と閲覧権限の枠が分かれている。 [画像](screens/guide-export-1024.png) | 実行前に件数が見えるが、「操作履歴」は語の途中で2行になる。 [画像](screens/guide-export-375.png) |
| guide-feedback | 公開フォームから送信し、フィードバック受信箱で確認する順を示す。 [画像](screens/guide-feedback-1440.png) | Slide のフォームと iframe の title がフィードバックで一致する。 [画像](screens/guide-feedback-1024.png) | Desk の開始と Slide の公開フォームを個別に識別でき、長いURLの末尾は次の行に表示される。 [画像](screens/guide-feedback-375.png) |
| guide-form | 受付開始後に公開フォームからテスト送信し、受信箱を見る手順がある。 [画像](screens/guide-form-1440.png) | Slide 枠には公開フォーム、製品別受信箱、埋め込みコード、返信目安が並ぶ。 [画像](screens/guide-form-1024.png) | Slide の公開URLが一行に収まる。下のコードは狭い欄内で折り返される。 [画像](screens/guide-form-375.png) |
| guide-issues | 公開してよい要約を入力し、投稿前に確認する案内が先に示される。 [画像](screens/guide-issues-1440.png) | トークンの値を出さず設定済みと示し、必要な対象リポジトリの権限を説明。 [画像](screens/guide-issues-1024.png) | Desk には登録、Slide には example/helpdesk の更新と、それぞれに取り消しがまとまる。 [画像](screens/guide-issues-375.png) |
| guide-merge | 統合先の条件が同じ相手・同じ窓口と特定されている。 [画像](screens/guide-merge-1440.png) | 現在の会話のメッセージが選んだ会話にまとまるという方向を確認。 [画像](screens/guide-merge-1024.png) | 受信箱で会話を選ぶ操作と追加権限なしの表示を画面上半分で読める。 [画像](screens/guide-merge-375.png) |
| guide-metrics | 説明に製品と期間の2種類の選択条件が登場する。 [画像](screens/guide-metrics-1440.png) | 本文の下に「集計画面を開く」と明示される。 [画像](screens/guide-metrics-1024.png) | 完了前後の指標を確認する案内が2行で収まり、ボタンや権限枠を押し出さない。 [画像](screens/guide-metrics-375.png) |
| guide-notify | メール用設定、Webhook シークレット名、Discord の format 指定が明記されている。 [画像](screens/guide-notify-1440.png) | 現在の通知先 Slack が設定例のメールアドレスとは別行。 [画像](screens/guide-notify-1024.png) | support@example.com までコードを読め、外部接続・本文閲覧・メール送信の権限も確認できる。 [画像](screens/guide-notify-375.png) |
| guide-presence | 担当者名と閲覧中・入力中が返信欄に出ると書かれている。 [画像](screens/guide-presence-1440.png) | 関連情報で人数を確認する案内と、自分だけの場合の表示を照合できる。 [画像](screens/guide-presence-1024.png) | 長めの説明が5行に収まり、直後の受信箱ボタンと追加権限の説明まで読める。 [画像](screens/guide-presence-375.png) |
| guide-rules | 保存済み0件の状態で、全製品を対象にした新規ルール欄が表示される。 [画像](screens/guide-rules-1440.png) | 空欄の件名はすべてに適用される旨が件名欄の真下に出る。 [画像](screens/guide-rules-1024.png) | ラベルまたは担当者を選択する案内に続いて保存と取り消しが見える。 [画像](screens/guide-rules-375.png) |
| guide-snooze | 会話の「その他の操作」からの設定方法と日本時間の指定について読める。 [画像](screens/guide-snooze-1440.png) | 期限時の受信箱への復帰と、それ以前の「保留を解除」の双方が明記される。 [画像](screens/guide-snooze-1024.png) | 説明に続いて受信箱へ進むボタンが画面内に収まり、権限の説明とも重ならない。 [画像](screens/guide-snooze-375.png) |
| guide-spam | 隔離された会話を開き内容を確認する説明がある。 [画像](screens/guide-spam-1440.png) | 会話の操作から迷惑メールを解除できることと、迷惑メールを開くボタンが対応する。 [画像](screens/guide-spam-1024.png) | 誤判定の解除案内が3行で読め、一覧へ進む操作をすぐ選べる。 [画像](screens/guide-spam-375.png) |
| guide-survey | 承認の対象が全製品で、回答用リンクは問い合わせ完了時に送ると表示。 [画像](screens/guide-survey-1440.png) | Desk の英語の文面にサンプル番号#123が入り、メールごとの回答先の注記がある。 [画像](screens/guide-survey-1024.png) | 運営者名と日時は承認枠に収まり、下の本文はURL末尾の /desk/example まで追える。 [画像](screens/guide-survey-375.png) |
| loop-disable | 見出しと決定ボタンがどちらも振り分けルールの無効化を指す。 [画像](screens/loop-disable-1440.png) | 無効化後も設定は保持され、新しい処理が止まることを事前に読める。 [画像](screens/loop-disable-1024.png) | キャンセルと確定が独立した行に表示され、背景の有効カードと区別できる。 [画像](screens/loop-disable-375.png) |
| loop-enable | フォーム機能を全製品で利用可能にする影響が確認文の先頭にある。 [画像](screens/loop-enable-1440.png) | 受付は製品ごとに開始する説明と追加権限なしの表示が続く。 [画像](screens/loop-enable-1024.png) | 「問い合わせフォームを有効にする」のラベルが一行で収まり、キャンセルも見える。 [画像](screens/loop-enable-375.png) |
| suggest-settings | 確率下限60%、その値を超えた記事を最大3件という基準が一緒に見える。 [画像](screens/suggest-settings-1440.png) | 対話用の Clef Flash と受付返信・運営用の Clef が用途のラベルで分かれる。 [画像](screens/suggest-settings-1024.png) | 受付返信への添付は未選択で、設定の保存と取り消しが画面内に収まる。 [画像](screens/suggest-settings-375.png) |
| widget-csp | コード欄と CSP の説明を同じパネル内で照合できる。 [画像](screens/widget-csp-1440.png) | script-src と frame-src の双方に設定するローカルオリジンを識別できる。 [画像](screens/widget-csp-1024.png) | CSP 本文は折り返して全文が読める。上の script タグは欄が低く、閉じタグが見えない。 [画像](screens/widget-csp-375.png) |
| widget-options | 配置「右下」、ボタンの文言「ヘルプ」、最初の説明文が異なる欄に表示される。 [画像](screens/widget-options-1440.png) | 公開用 URL の /slide とスクリプトの data-product が一致している。 [画像](screens/widget-options-1024.png) | コードのコピーが編集欄の前にあり、文言と最初の説明文は左右にはみ出さない。 [画像](screens/widget-options-375.png) |
| widget-preview | Slide の見本内にチャットが開き、質問欄を青いフォーカス枠で示す。 [画像](screens/widget-preview-1440.png) | 質問する操作に続いて記事の一覧、返信不要の意見、問い合わせフォームを案内する。 [画像](screens/widget-preview-1024.png) | パネルが見本の横幅に収まり、閉じる、質問する、下部の問い合わせフォームも読める。 [画像](screens/widget-preview-375.png) |
