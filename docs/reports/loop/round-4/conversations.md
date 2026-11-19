# 第4周の会話と受信箱

受信箱、会話、返信、承認、一括操作、記事候補の40状態について、第4周の375、1024、1440pxの画像120枚を開いた。各状態で、現在の対象・状態と次にできる操作、本文や名前・番号の読みやすさ、操作間の余白・重なりを確認した。一覧では情報の優先順位、会話では返信と内部メモの区別、ポップアップでは親の操作との位置関係と選択中の印も確認した。

## 指摘

高0件、中1件、低2件。低2件は第3周から継続している。

- **中・375pxの承認待ちとフィードバックの検索欄。** 左半分に検索、右半分に絞り込みが並び、「件名・差出人・本文を検索」の末尾が切れる。未対応一覧と同じく検索対象と動詞が読める幅が必要。隠し入力と製品ポップアップを持つ受付種別のフォームにも集計画面のグリッドが適用された。フィードバック確認の取り消し画面も同じ原因。正式撮影後、検索を含む受信箱と、直下に製品選択を表示する集計フォームをCSSで区別した。375pxで2画面を実際に開き、検索欄の幅とフィルターの縦位置を検査するテストは修正前に承認待ちで失敗し、修正後に両画面で成功した。集計画面での製品名・期間の表示も含む関連テスト12件が成功。 [承認待ち](screens/approval-list-375.png)・[フィードバック](screens/feedback-list-375.png)
- **低・375pxの送信失敗行の差出人名。** 番号、警告、請求ラベル、担当者が並ぶ#4で「渡…」までしか読めず、同姓の利用者の照合に詳細を開く必要がある。詳細には氏名とメールアドレスがある。 [自分の担当](screens/my-inbox-375.png)・[送信失敗の会話](screens/thread-failed-375.png)
- **低・1440pxの記事候補がない会話。** 「記事の候補に追加」が返信欄と右のヘルプ記事欄に同時に現れる。登録目的が同じ操作の選択に一瞬迷う。375・1024pxで開いている範囲では返信欄の1個から候補を追加できる。 [記事の候補なし](screens/suggest-composer-empty-1440.png)

配信先の受信拒否は理由と再送操作を、返信の結果不明は本文の保持と別タブでの確認を示している。空の返信、入力中、送信中も文字とボタンの背景から区別できた。

## 各状態の観察

| 状態 | 375px | 1024px | 1440px |
| --- | --- | --- | --- |
| all-inbox | 全10件の先頭に#11、#4の送信失敗と#5の承認待ちが携帯幅でも残る。 [375px](screens/all-inbox-375.png) | #8の完了と#9の迷惑メールが未対応の行と区別できる。 [1024px](screens/all-inbox-1024.png) | 時刻が右に揃い、#11の省略したラベル数も確認できる。 [1440px](screens/all-inbox-1440.png) |
| approval-confirm | 宛先customer5とメンバー数を変えられる旨の本文を送信前に読める。 [375px](screens/approval-confirm-375.png) | 背景が暗くなり、確認とキャンセルを並べて選べる。 [1024px](screens/approval-confirm-1024.png) | ダイアログ内に宛先・返信内容・確定操作の順で収まる。 [1440px](screens/approval-confirm-1440.png) |
| approval-list | #5の承認待ちは読めるが、検索欄が半幅になり「を検索」が切れる。 [375px](screens/approval-list-375.png) | 山田 花と橙の承認待ちを読め、検索の説明も最後まで見える。 [1024px](screens/approval-list-1024.png) | 未対応の黒い表示と、承認待ちの橙の表示を区別できる。 [1440px](screens/approval-list-1440.png) |
| candidates | 佐藤 優・森 直子・未割り当ての3行が読める。 [375px](screens/candidates-375.png) | 現在の佐藤だけにチェック。 [1024px](screens/candidates-1024.png) | 頭文字と名前、右端のチェックが重ならない。 [1440px](screens/candidates-1440.png) |
| composer-empty | 差出人と宛先が折り返し、送信2操作は灰色で名が読める。 [375px](screens/composer-empty-375.png) | 「返信を入力」があり、プレビューと灰色の送信を区別できる。 [1024px](screens/composer-empty-1024.png) | 返信のタブ・入力欄・送信先が左の同一枠に入る。 [1440px](screens/composer-empty-1440.png) |
| composer-failed | 結果不明・本文保持・再送前の確認が3行。その下に別タブのリンク。 [375px](screens/composer-failed-375.png) | 下書きと宛先の間に説明があり、本文を読み直せる。 [1024px](screens/composer-failed-1024.png) | 赤い案内と青いリンクが一つの枠に収まり、送信ボタンと分かれる。 [1440px](screens/composer-failed-1440.png) |
| composer-note | 内部メモの選択・相手に送らない注意書き・保存ボタンが同時に見える。 [375px](screens/composer-note-375.png) | 青枠が「次回の請求日までに…」と入力したメモだけを囲む。 [1024px](screens/composer-note-1024.png) | 操作は「メモを残す」1つ。宛先の表示が消える。 [1440px](screens/composer-note-1440.png) |
| composer-sending | ボタン名が「送信中…」になり、本文3行と宛先は残る。 [375px](screens/composer-sending-375.png) | 「送信して完了」と処理中ボタンが灰色、本文は黒で読める。 [1024px](screens/composer-sending-1024.png) | 返信タブ・入力領域の高さ、送信操作の並びは入力時と一致する。 [1440px](screens/composer-sending-1440.png) |
| composer-typing | 返信本文の青枠が画面に収まり、黒の送信と白枠の送信して完了が並ぶ。 [375px](screens/composer-typing-375.png) | 入力済み本文が1行、直下に送信先と3操作がある。 [1024px](screens/composer-typing-1024.png) | 青枠は入力箇所だけで右欄に重ならず、黒い主ボタンは1つ。 [1440px](screens/composer-typing-1440.png) |
| confirmation | 対象の「見本の会話」と削除・キャンセルが一緒に見える。 [375px](screens/confirmation-375.png) | 確定側だけが赤く、白い余白でキャンセルと分かれる。 [1024px](screens/confirmation-1024.png) | 説明がボタンの上に収まり、選ぶ前に読める。 [1440px](screens/confirmation-1440.png) |
| feedback-list | #10「受付済み」の下に確認操作が収まる一方、検索欄から「を検索」が切れる。 [375px](screens/feedback-list-375.png) | 佐々木 葵の行と確認済みにする操作が同時に見える。 [1024px](screens/feedback-list-1024.png) | 受付済みと確認操作の間に余白があり、検索の説明も全文読める。 [1440px](screens/feedback-list-1440.png) |
| inbox | 絞り込みが左、待たせている順が右。検索の説明は1行。 [375px](screens/inbox-375.png) | 7件のうち承認待ち・送信失敗・添付を別々の行で見分けられる。 [1024px](screens/inbox-1024.png) | 11時間待ちから1時間待ちへ並び、件名は左、時刻は右に揃う。 [1440px](screens/inbox-1440.png) |
| inbox-empty | 0件と「未対応の問い合わせはありません」が一致する。 [375px](screens/inbox-empty-375.png) | 左ナビにも未対応0、完了8と出る。 [1024px](screens/inbox-empty-1024.png) | 中央のトレー・説明文は検索と並び順の下に収まる。 [1440px](screens/inbox-empty-1440.png) |
| inbox-failed | #4の「送信失敗」は全文表示だが、差出人は「渡…」。 [375px](screens/inbox-failed-375.png) | 請求の絞り込みを示すチップと、#4の請求ラベルが別位置にある。 [1024px](screens/inbox-failed-1024.png) | 渡辺 葵と山田 花の2件で、警告が付くのは渡辺だけ。 [1440px](screens/inbox-failed-1440.png) |
| inbox-filter | Deskとsatoの解除チップが同じ段。森 海斗、#3を読める。 [375px](screens/inbox-filter-375.png) | Deskで自分の担当1件。見出し・ナビ・実際の行数が一致する。 [1024px](screens/inbox-filter-1024.png) | メモの印、未対応、担当のSが本文を遮らず右に並ぶ。 [1440px](screens/inbox-filter-1440.png) |
| inbox-loading | 「領収書」の消去印と青い入力枠が見え、待機線が下に出る。 [375px](screens/inbox-loading-375.png) | 待機中も現在の未対応7件と並び順が見える。 [1024px](screens/inbox-loading-1024.png) | 3本の灰色線には文字がなく、完了後の一覧と見分けられる。 [1440px](screens/inbox-loading-1440.png) |
| link-issue | 会話の関連情報内で題の検索、#42の選択、候補2件、紐づけボタンを順に読める。 [375px](screens/link-issue-375.png) | パネルの手前で青い入力枠が1つ、右上の閉じるが見える。 [1024px](screens/link-issue-1024.png) | 右欄に「#42 領収書の一括ダウンロード」が全文入り、現在の紐づけ0件と区別できる。 [1440px](screens/link-issue-1440.png) |
| loop-actions | その他の操作からスヌーズと迷惑メールの操作名を確認できる。 [375px](screens/loop-actions-375.png) | 会話の上部にメニューが開き、操作項目は相互に重ならない。 [1024px](screens/loop-actions-1024.png) | 左右に分かれた会話・関連情報のうち会話側にメニューが出る。 [1440px](screens/loop-actions-1440.png) |
| loop-assignee | 未割り当ての印と、丸いM・Sの担当候補を読める。 [375px](screens/loop-assignee-375.png) | 現在の選択に印が付き、候補2人は別々の行に並ぶ。 [1024px](screens/loop-assignee-1024.png) | 担当者名と頭文字が対応し、返信の送信操作から距離がある。 [1440px](screens/loop-assignee-1440.png) |
| loop-bulk | 2件選択が明示され、#11と#7は背景とチェックの両方で区別できる。 [375px](screens/loop-bulk-375.png) | 5つの一括操作が水平方向に収まる。 [1024px](screens/loop-bulk-1024.png) | ホバー中の#7の行操作と、上部にある複数件の操作を区別できる。 [1440px](screens/loop-bulk-1440.png) |
| loop-bulk-assignee | 2件を選択したままmori・satoの頭文字と名前を確認できる。 [375px](screens/loop-bulk-assignee-375.png) | 候補が一括担当ボタンの位置に開き、選択範囲を見失わない。 [1024px](screens/loop-bulk-assignee-1024.png) | M・Sの色に加え名前でも付け替え先を識別できる。 [1440px](screens/loop-bulk-assignee-1440.png) |
| loop-bulk-label | 6候補の長い「長期契約の更新手続きについて」も読める。 [375px](screens/loop-bulk-label-375.png) | 選択中の行と前面のラベル候補の背景を区別できる。 [1024px](screens/loop-bulk-label-1024.png) | 左の色点とラベル名の間に余白があり、各選択肢に対応づけられる。 [1440px](screens/loop-bulk-label-1440.png) |
| loop-convert | 「返信できる問い合わせに変更」と2行で説明し、実行とキャンセルが1列に入る。 [375px](screens/loop-convert-375.png) | 確認する間も背景に元の声と内部メモを見分けられる。 [1024px](screens/loop-convert-1024.png) | 明るいダイアログで変更の効果を読んでから黒いボタンを選べる。 [1440px](screens/loop-convert-1440.png) |
| loop-discard | 「この会話から下書き1件を削除」と対象を明示する。 [375px](screens/loop-discard-375.png) | キャンセルと破棄が区別でき、背後に承認待ちの本文が残る。 [1024px](screens/loop-discard-1024.png) | 画面中央の確認と背後の承認して送信が明暗で分かれる。 [1440px](screens/loop-discard-1440.png) |
| loop-filter-assignee | 入れ子の候補に「すべて」の印、mori、satoが収まる。 [375px](screens/loop-filter-assignee-375.png) | 親の状態と製品を残して担当者の候補が前面に出る。 [1024px](screens/loop-filter-assignee-1024.png) | 親の右端も子の3項目も画面内に見える。 [1440px](screens/loop-filter-assignee-1440.png) |
| loop-filter-empty | 検索語と外すための×が残り、0件の理由が下に出る。 [375px](screens/loop-filter-empty-375.png) | 見出しの0件、検索語、該当なしの本文が一致する。 [1024px](screens/loop-filter-empty-1024.png) | 左メニューの7件と中央の検索結果0件の所属が分かる。 [1440px](screens/loop-filter-empty-1440.png) |
| loop-filters | 状態・プロダクト・担当者・ラベルの4条件が箱の中に収まる。 [375px](screens/loop-filters-375.png) | 絞り込みボタンに接し、状態の未対応と製品のすべてが読める。 [1024px](screens/loop-filters-1024.png) | ポップアップが並び順の値を隠さず、適用範囲を見分けられる。 [1440px](screens/loop-filters-1440.png) |
| loop-labels | 選択済み3件にチェックが付き、長い候補と新規作成まで表示される。 [375px](screens/loop-labels-375.png) | 経理・請求・領収書が上部のラベル表示とも一致する。 [1024px](screens/loop-labels-1024.png) | チェック列が揃い、会話本文・返信欄の面から候補が浮いて見える。 [1440px](screens/loop-labels-1440.png) |
| loop-status | 現在の未対応と変更先の完了・迷惑メールが3行で区別できる。 [375px](screens/loop-status-375.png) | 状態を示す黒い印の直下に候補が開き、担当者の選択とは混ざらない。 [1024px](screens/loop-status-1024.png) | 状態変更を選ぶ間も件名と右の関連情報が残る。 [1440px](screens/loop-status-1440.png) |
| my-inbox | 3件中#4は失敗と請求タグを優先し、差出人は「渡…」となる。 [375px](screens/my-inbox-375.png) | 担当のSが揃い、未対応2件と返信待ち1件を見分けられる。 [1024px](screens/my-inbox-1024.png) | 製品のSlide・Deskと待ち時間が行の右で比較できる。 [1440px](screens/my-inbox-1440.png) |
| suggest-composer | 青枠の検索と「領収書を発行する」が画面内に収まる。 [375px](screens/suggest-composer-375.png) | 返信欄の「記事を添える」の直上に候補になった記事名が見える。 [1024px](screens/suggest-composer-1024.png) | 前面の記事検索と右にある候補追加は文言も場所も異なる。 [1440px](screens/suggest-composer-1440.png) |
| suggest-composer-empty | 候補に追加するボタンが返信欄に1つあり、送信先が次の行にも続く。 [375px](screens/suggest-composer-empty-375.png) | 添える操作の上に候補追加が1つあり、本文入力と区別できる。 [1024px](screens/suggest-composer-empty-1024.png) | 同じ「記事の候補に追加」が右のヘルプ記事欄と返信欄に並存する。 [1440px](screens/suggest-composer-empty-1440.png) |
| thread-approval | 山田の問い合わせの次に、satoの代理作成・承認待ち・下書き本文が続く。 [375px](screens/thread-approval-375.png) | 「承認して送信」と「下書きを破棄」は下書きの直下に並ぶ。 [1024px](screens/thread-approval-1024.png) | 灰色の下書きと新しい返信欄が別枠。依頼者の本文も参照できる。 [1440px](screens/thread-approval-1440.png) |
| thread-attachment | 「利用明細.txt」全文、ファイルの印、43 Bを問い合わせ本文内に表示。 [375px](screens/thread-attachment-375.png) | 青いリンクと灰色のサイズが接せず、7時間前の受信と結び付く。 [1024px](screens/thread-attachment-1024.png) | 添付・返信は中央の列で、右の操作履歴と混在しない。 [1440px](screens/thread-attachment-1440.png) |
| thread-context | 関連情報に課題#43と会話#6が入り、比較・閉じるを選べる。 [375px](screens/thread-context-375.png) | 背景の会話は暗く、前面の関連情報を先に読める。 [1024px](screens/thread-context-1024.png) | 返信欄のGitHub Issueと右側の関連会話の比較は異なる場所にある。 [1440px](screens/thread-context-1440.png) |
| thread-failed | 失敗の印と拒否理由がある。差出人は「渡辺 葵」と全文読める。 [375px](screens/thread-failed-375.png) | 受信拒否の説明の直下に再送。対象の返信だけが灰色枠。 [1024px](screens/thread-failed-1024.png) | 担当satoと3時間前の返信、顧客からの4時間前の問い合わせを照合できる。 [1440px](screens/thread-failed-1440.png) |
| thread-html | 2行の件名、外部画像の非表示、注文番号SL-2026-128を表示。 [375px](screens/thread-html-375.png) | 外部画像についての一文はメール本文に沿い、注文番号を隠さない。 [1024px](screens/thread-html-1024.png) | HTMLメールの内容と空欄の返信が別枠に収まる。 [1440px](screens/thread-html-1440.png) |
| thread-inbound | #1の状態・担当の次に経理、請求、領収書の3つが1段で収まる。 [375px](screens/thread-inbound-375.png) | 送り主と顧客アドレス、本文の後に空の返信欄が続く。 [1024px](screens/thread-inbound-1024.png) | ほかの問い合わせ・操作履歴が右にまとまり、本文を読む列が保たれる。 [1440px](screens/thread-inbound-1440.png) |
| thread-note | 「相手には送られません」、sato、2時間前が黄色のメモに入る。 [375px](screens/thread-note-375.png) | 白い受信と黄色いメモに間隔があり、Deskの送信元は下の返信欄に出る。 [1024px](screens/thread-note-1024.png) | 一番下で差出人・宛先・灰色の送信が1段に収まり、非公開メモはその上の別枠。 [1440px](screens/thread-note-1440.png) |
| thread-replied | #2、返信待ち、satoを見ながら、相手の質問と返信を読める。 [375px](screens/thread-replied-375.png) | 2時間前の質問と1時間前の送信、両方の時刻が右端に出る。 [1024px](screens/thread-replied-1024.png) | 送信済み返信に紙飛行機と文字があり、下の空欄の新規返信と区別できる。 [1440px](screens/thread-replied-1440.png) |
