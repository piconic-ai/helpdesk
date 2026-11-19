# 第5周の会話と受信箱

高0件、中0件、低2件。375pxの承認待ちとフィードバックの正式画像では、検索欄に「件名・差出人・本文を検索」の全文が入る。絞り込みと並び順はその下に収まり、第4周の中1件の解消を確認した。 [承認待ち](screens/approval-list-375.png)・[フィードバック](screens/feedback-list-375.png)

## 継続して見える点

- **低・375pxの失敗行の差出人名。** #4のように状態・警告・担当が並ぶと、差出人の表示は「渡…」になる。氏名で照合するには会話詳細を開く必要がある。そこでは「渡辺 葵」とアドレスが読める。 [請求の2件](screens/inbox-failed-375.png)・[会話#4](screens/thread-failed-375.png)
- **低・1440pxの記事候補追加。** 空の候補を示すときに「記事の候補に追加」が返信欄と右のヘルプ記事欄の2箇所にあり、同じ会話を候補化する操作の違いが画面から伝わらない。375pxでは返信欄の横幅に1個が入る。 [1440px](screens/suggest-composer-empty-1440.png)・[375px](screens/suggest-composer-empty-375.png)

第5周の40状態120枚を3幅で開いた。各状態で本文・番号・選択値の省略、現在の状態と操作結果の区別、余白・折り返し・ポップアップの範囲を確認した。返信の結果不明には本文の保持と確認先、配信失敗には受信拒否が示される。空の返信欄では灰色の2ボタンの濃い文字が読め、入力時の主操作を黒いボタンで識別できる。

## 状態別の観察

| 状態 | 375px | 1024px | 1440px |
| --- | --- | --- | --- |
| all-inbox | すべて10件から件名別に追え、#4に警告、#5に砂時計、#2に返信待ちが残る。 [375px](screens/all-inbox-375.png) | 一覧の下端までに#8完了・#9迷惑メールが入り、状態の違いが読める。 [1024px](screens/all-inbox-1024.png) | 未対応、返信待ち、完了、迷惑メールの行が同じ時刻の列を持つ。 [1440px](screens/all-inbox-1440.png) |
| approval-confirm | 送信先customer5@example.netと希望人数を尋ねる本文が両方入る。 [375px](screens/approval-confirm-375.png) | キャンセルは白、承認して送信は黒で、暗い背後の同じ操作と区別できる。 [1024px](screens/approval-confirm-1024.png) | 本文と確定操作が1枚の白いダイアログで完結する。 [1440px](screens/approval-confirm-1440.png) |
| approval-list | 「件名・差出人・本文を検索」が1行で読める。下に絞り込みと待たせている順。 [375px](screens/approval-list-375.png) | #5の件名と山田 花は1行、橙の承認待ちと黒い未対応は下に並ぶ。 [1024px](screens/approval-list-1024.png) | 左メニューも見出しも1件、一覧に対象メールの本文が見える。 [1440px](screens/approval-list-1440.png) |
| candidates | 3候補は佐・森・未の印を含めて読める。 [375px](screens/candidates-375.png) | 佐藤 優だけにチェックが付く。 [1024px](screens/candidates-1024.png) | 森 直子と未割り当ての末尾まで見える。 [1440px](screens/candidates-1440.png) |
| composer-empty | 空欄には「返信を入力」。2つの送信操作は薄い背景と濃い文字で読める。 [375px](screens/composer-empty-375.png) | プレビューと2つの送信の文字を読み分けられる。 [1024px](screens/composer-empty-1024.png) | 返信タブと空の入力欄、宛先がまとまり、右の別件情報と重ならない。 [1440px](screens/composer-empty-1440.png) |
| composer-failed | 本文の下に結果不明・本文保持・確認先があり、再送前に順に読める。 [375px](screens/composer-failed-375.png) | 「別のタブで送信結果を確認」が警告の中でリンクとして見える。 [1024px](screens/composer-failed-1024.png) | 最新の会話を確認する案内は送信ボタンより先に位置し、下書きも現存する。 [1440px](screens/composer-failed-1440.png) |
| composer-note | 内部メモの橙の注意と「メモを残す」で、書き込み先が明確。 [375px](screens/composer-note-375.png) | 経理担当への確認予定だけが青いメモ欄にあり、宛先表示はない。 [1024px](screens/composer-note-1024.png) | 記入中のメモを明示し、通常の返信と別の黒い操作名を使う。 [1440px](screens/composer-note-1440.png) |
| composer-sending | 本文は同じ位置に残り、灰色の「送信中…」で進行が分かる。 [375px](screens/composer-sending-375.png) | 返信タブの外観と送信中の文言、宛先を確認できる。 [1024px](screens/composer-sending-1024.png) | 送信後も元の問い合わせが残り、本文や下部操作の位置がほぼ動かない。 [1440px](screens/composer-sending-1440.png) |
| composer-typing | 領収書の再発行を案内する文が3行に折り返され、青枠が見える。 [375px](screens/composer-typing-375.png) | 送信は黒、送信して完了は白で、入力前からの変化が分かる。 [1024px](screens/composer-typing-1024.png) | 問い合わせ本文と編集中の返信が別れており、入力先の枠は1つ。 [1440px](screens/composer-typing-1440.png) |
| confirmation | 削除対象「見本の会話」が見出しにあり、赤い実行ボタンが右にある。 [375px](screens/confirmation-375.png) | キャンセルの輪郭と削除の色面が白い隙間で分かれる。 [1024px](screens/confirmation-1024.png) | 「見本の表示を閉じます」の次に2つの操作が並ぶ。 [1440px](screens/confirmation-1440.png) |
| feedback-list | 全幅の検索に「を検索」まで表示。下段は絞り込みと新しい順で、#10の確認ボタンは行の下にある。 [375px](screens/feedback-list-375.png) | 佐々木 葵・受付済み・10時間前が並び、確定操作まで1画面に収まる。 [1024px](screens/feedback-list-1024.png) | 本文「検索結果から会話を開きやすくなりました。」と確認操作が離れている。 [1440px](screens/feedback-list-1440.png) |
| inbox | 未対応7件。検索は丸ごと1段、絞り込みと待たせている順はその下で隣り合う。 [375px](screens/inbox-375.png) | #7に添付、#5に橙の承認待ちが残り、件名と離れて見える。 [1024px](screens/inbox-1024.png) | 右に時刻と状態が並び、SlideとDeskの区別も読める。 [1440px](screens/inbox-1440.png) |
| inbox-empty | 0件の下に受信トレイの印と未対応がない旨が出る。 [375px](screens/inbox-empty-375.png) | 左の未対応0とメイン見出しが一致する。 [1024px](screens/inbox-empty-1024.png) | 操作が上、空状態が中央で余白を挟んでいる。 [1440px](screens/inbox-empty-1440.png) |
| inbox-failed | 請求の条件を表示した2件のうち、失敗した#4では差出人が「渡…」になる。 [375px](screens/inbox-failed-375.png) | 失敗は三角と文字で示され、山田 花の行は通常表示。 [1024px](screens/inbox-failed-1024.png) | 4時間と1時間が右揃えで、失敗した送信にSと請求のタグが付く。 [1440px](screens/inbox-failed-1440.png) |
| inbox-filter | Deskとsatoの条件が個別の×付きで並び、#3を1件表示する。 [375px](screens/inbox-filter-375.png) | 製品選択・現在のメニュー・適用済みのDeskが一致する。 [1024px](screens/inbox-filter-1024.png) | 森 海斗の行で未対応、担当S、3時間待ちが読める。 [1440px](screens/inbox-filter-1440.png) |
| inbox-loading | 領収書の語と×を青枠で囲み、読み込みの灰色3本と分かれる。 [375px](screens/inbox-loading-375.png) | 操作列を残して、結果領域のみ読み込みを示す。 [1024px](screens/inbox-loading-1024.png) | 入力幅に合わせた青枠の右にも並び順が残る。 [1440px](screens/inbox-loading-1440.png) |
| link-issue | 全幅の関連情報に#42 領収書の一括ダウンロード、2件の課題、閉じるが見える。 [375px](screens/link-issue-375.png) | 暗い会話の上に右パネルが開き、検索に青い枠が付く。 [1024px](screens/link-issue-1024.png) | 右欄の幅でも番号と題が完全に読め、起票と既存との紐付けを区別できる。 [1440px](screens/link-issue-1440.png) |
| loop-actions | その他の操作の直下にスヌーズと迷惑メールにするが収まる。 [375px](screens/loop-actions-375.png) | 2つの操作を開いても宛先と問い合わせ本文が読める。 [1024px](screens/loop-actions-1024.png) | 上部右側にメニューが出て、行き先の異なる前後の矢印はその横に残る。 [1440px](screens/loop-actions-1440.png) |
| loop-assignee | 担当なしに印が付き、mori・satoは各1行、氏名と候補が重ならない。 [375px](screens/loop-assignee-375.png) | 状態の隣の担当者を選ぶ操作の直下に3行が見える。 [1024px](screens/loop-assignee-1024.png) | M、Sの丸と候補名の対応が明確で、担当なしの行だけが灰色。 [1440px](screens/loop-assignee-1440.png) |
| loop-bulk | #11と#7のチェックと「2件を選択」が一致し、解除まで操作名が折り返して収まる。 [375px](screens/loop-bulk-375.png) | 担当、ラベル、完了、迷惑メール、解除が1列の帯に並ぶ。 [1024px](screens/loop-bulk-1024.png) | 1件ごとの操作は行の右、選択中2件の操作は一覧上部で区別できる。 [1440px](screens/loop-bulk-1440.png) |
| loop-bulk-assignee | ツールバーからmoriとsatoを選べ、選択中の2つのチェックも見える。 [375px](screens/loop-bulk-assignee-375.png) | 「2件を選択」を残し、担当候補がボタンの下に開く。 [1024px](screens/loop-bulk-assignee-1024.png) | MとSの色に加え記名があり、一括付け替え先を同定できる。 [1440px](screens/loop-bulk-assignee-1440.png) |
| loop-bulk-label | 候補6行で「長期契約の更新手続きについて」も1行で読める。 [375px](screens/loop-bulk-label-375.png) | ツールバーと選択行が残り、各候補の色点は該当の名前に付く。 [1024px](screens/loop-bulk-label-1024.png) | 一番下の領収書まで枠内にあり、他の一括操作と分離される。 [1440px](screens/loop-bulk-label-1440.png) |
| loop-convert | ダイアログ内に変更後は返信できる旨があり、2ボタンは画面幅に入る。 [375px](screens/loop-convert-375.png) | 元のフィードバックの件名と佐々木 葵を背景に残す。 [1024px](screens/loop-convert-1024.png) | 問い合わせに変更するボタンが黒く、これから作用する操作を示す。 [1440px](screens/loop-convert-1440.png) |
| loop-discard | 破棄されるのは会話の下書き1件だと読め、キャンセルが残る。 [375px](screens/loop-discard-375.png) | 背景に元の会話名、手前に実行対象と破棄操作がある。 [1024px](screens/loop-discard-1024.png) | 破棄のダイアログと背後の承認して送信は明暗差が明らか。 [1440px](screens/loop-discard-1440.png) |
| loop-filter-assignee | 製品条件の下の「担当者 すべて」から、3行の候補が画面内に開く。 [375px](screens/loop-filter-assignee-375.png) | すべてにチェック、moriとsatoには頭文字の丸が付く。 [1024px](screens/loop-filter-assignee-1024.png) | 子のメニューが親より前面にあり、名前と選択印が隠れない。 [1440px](screens/loop-filter-assignee-1440.png) |
| loop-filter-empty | 検索語のチップ・解除の×・一致する問い合わせなしの案内を一緒に読める。 [375px](screens/loop-filter-empty-375.png) | 検索結果0件が見出し、検索条件、中央の説明と対応する。 [1024px](screens/loop-filter-empty-1024.png) | 左の未対応7件と右の検索結果0件が離れ、集計対象が判別できる。 [1440px](screens/loop-filter-empty-1440.png) |
| loop-filters | 状態・製品・担当・ラベルの4条件がボタン下に縦に並び、値まで読める。 [375px](screens/loop-filters-375.png) | 絞り込み自体の薄い背景と、その直下の白いパネルを識別できる。 [1024px](screens/loop-filters-1024.png) | 右側に条件が出ても、検索欄と並び順に重ならない。 [1440px](screens/loop-filters-1440.png) |
| loop-labels | 経理・請求・領収書に印、長いラベル名と新しいラベルを作成も収まる。 [375px](screens/loop-labels-375.png) | 上部に付与済みの3ラベルが残り、候補側のチェックと照合できる。 [1024px](screens/loop-labels-1024.png) | 新規作成は6候補の下にあり、横にある関連情報と重複しない。 [1440px](screens/loop-labels-1440.png) |
| loop-status | 現在の状態「未対応」、変更先の完了と迷惑メールを分けて読める。 [375px](screens/loop-status-375.png) | ポップアップは状態のピルの下で、担当者やラベルとは別の操作に見える。 [1024px](screens/loop-status-1024.png) | 現在値に黒い印が付き、変えられる2値の下に本文が続く。 [1440px](screens/loop-status-1440.png) |
| my-inbox | satoと「すべて」の条件に3件。#4の差出人が「渡…」までに省略される。 [375px](screens/my-inbox-375.png) | Slide2件とDesk1件、いずれも右端にSの担当印。 [1024px](screens/my-inbox-1024.png) | #4の送信失敗と#2の返信待ちが同じ配色・記号になっていない。 [1440px](screens/my-inbox-1440.png) |
| suggest-composer | フォーカス付きの記事検索と領収書の記事名、下の宛先まで見える。 [375px](screens/suggest-composer-375.png) | 「記事を添える」に隣接して、検索と添付対象の記事名が出る。 [1024px](screens/suggest-composer-1024.png) | 領収書の候補を選ぶ場所と、ヘルプ記事管理へのボタンが左右に分かれる。 [1440px](screens/suggest-composer-1440.png) |
| suggest-composer-empty | 送信済み返信の下に、候補に追加→記事を添えるの順に1つずつある。 [375px](screens/suggest-composer-empty-375.png) | 空の返信欄に記事の候補に追加が1つあり、前の返信と区別できる。 [1024px](screens/suggest-composer-empty-1024.png) | 返信欄と右のヘルプ記事に同名の「記事の候補に追加」がある。 [1440px](screens/suggest-composer-empty-1440.png) |
| thread-approval | 代理作成の表示、承認待ちの印を経て編集可能な文面が続く。 [375px](screens/thread-approval-375.png) | 承認して送信と下書きを破棄が横並びで読める。 [1024px](screens/thread-approval-1024.png) | 山田 花の依頼と代理作成の下書きが、独立した入力欄の上に並ぶ。 [1440px](screens/thread-approval-1440.png) |
| thread-attachment | 利用明細.txtは下線付きで43 Bのサイズまで見える。 [375px](screens/thread-attachment-375.png) | 森 海斗の本文の直後に添付があり、空の返信欄と区別できる。 [1024px](screens/thread-attachment-1024.png) | 未対応の状態と関連情報を残し、ファイルのリンクが本文中に見える。 [1440px](screens/thread-attachment-1440.png) |
| thread-context | 閉じる、example/helpdesk#43、会話#6、件数比較が全画面で読める。 [375px](screens/thread-context-375.png) | 右のパネルが明るく、元の下書きは暗い背景に残る。 [1024px](screens/thread-context-1024.png) | 右に関連課題・件数比較、左にGitHub Issueの下書きと送信承認が並ぶ。 [1440px](screens/thread-context-1440.png) |
| thread-failed | 一覧で省略された渡辺 葵と完全なアドレスを確認でき、受信拒否の理由が下に出る。 [375px](screens/thread-failed-375.png) | 赤い送信失敗の印と拒否理由の下に再送がある。 [1024px](screens/thread-failed-1024.png) | 新規返信とはカードが別で、失敗した返信にだけ再送操作が付く。 [1440px](screens/thread-failed-1440.png) |
| thread-html | 外部画像を非表示にした説明の下に注文番号SL-2026-128が読める。 [375px](screens/thread-html-375.png) | HTML本文と注文番号は同じ受信カードに収まる。 [1024px](screens/thread-html-1024.png) | 外部画像の案内は本文内、関連情報は別欄で、読みにくい重なりはない。 [1440px](screens/thread-html-1440.png) |
| thread-inbound | 山田 花からの受信本文と2段落目の質問が切れず、返信切替へ続く。 [375px](screens/thread-inbound-375.png) | 差出人と宛先を入力欄の下で照合できる。 [1024px](screens/thread-inbound-1024.png) | 相手のほかの問い合わせは右、本文と返信は左にある。 [1440px](screens/thread-inbound-1440.png) |
| thread-note | 黄色のメモに非送信の注意・作成者sato・2時間前が明示される。 [375px](screens/thread-note-375.png) | 受信と共有メモでは面の色が異なり、入力は次の白い枠にある。 [1024px](screens/thread-note-1024.png) | メールの差出人はdesk、受信者はcustomer3で、黄色い内部メモと分かれる。 [1440px](screens/thread-note-1440.png) |
| thread-replied | 2時間前の佐々木 葵の受信と1時間前のsatoの返信を縦に読める。 [375px](screens/thread-replied-375.png) | 返信待ちの会話に送信済みの印が付き、メッセージ状態との違いが分かる。 [1024px](screens/thread-replied-1024.png) | 更新案内の返信後に空の返信欄があり、送信済み本文を誤って編集しない構成。 [1440px](screens/thread-replied-1440.png) |
