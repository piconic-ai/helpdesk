# 第3周 会話と受信箱

40状態を375・1024・1440pxで撮影した120枚を1枚ずつ開きました。重さ別では **高0件、中0件、低2件** です。低2件は前周からの継続です。

## 前周の修正

- 返信結果を取得できなかった場合は「送信結果を確認できませんでした」と表示します。保持した返信本文と「別のタブで送信結果を確認」が3幅で読めます。配送拒否が確定した会話には実際の拒否理由が付き、「再送」はその返信の枠内にあります。対象の2状態を見比べても結果を取り違える表示はありませんでした。[結果不明](screens/composer-failed-375.png)・[配送拒否](screens/thread-failed-1024.png)
- 空欄の送信・送信して完了は淡い灰色の背景と濃い文字、入力後の送信は黒、送信中は「送信中…」です。3幅とも操作の並びが安定し、灰色の状態でもボタン名を読めました。[空欄](screens/composer-empty-375.png)・[入力後](screens/composer-typing-375.png)・[処理中](screens/composer-sending-375.png)
- 第1周で修正した課題番号の先頭表示、返信欄のフォーカス、検索対象の全文表示、選択中だけに付くチェックを再確認しました。削除とキャンセルの間隔はギャラリーでも3幅とも12pxでした。[課題](screens/link-issue-1440.png)・[フォーカス](screens/composer-note-1024.png)・[削除確認](screens/confirmation-375.png)

## 継続する指摘

| 重さ | 対象と再現条件 | 運営者への影響と期待 |
| --- | --- | --- |
| 低 | 375pxの一覧で警告・請求ラベル・担当印が並ぶ#4は差出人が「渡…」になります。 | 同姓の相手を一覧だけで識別しにくくなります。警告・番号・担当を保ちつつ、氏名を確認できる表示が望まれます。会話内では氏名とアドレスを読めます。[請求の絞り込み](screens/inbox-failed-375.png)・[会話](screens/thread-failed-375.png) |
| 低 | 1440pxの候補なしの会話で、返信欄と右側のヘルプ記事に「記事の候補に追加」が同時に表示されます。 | 初見ではどちらから登録すべきか迷います。同じ会話を登録する操作だと分かる配置が望まれます。375pxでは返信欄だけに見え、記事を手動で添える操作も区別できます。[1440px](screens/suggest-composer-empty-1440.png)・[375px](screens/suggest-composer-empty-375.png) |

## 状態別の観察

目的と主操作、情報のまとまりと揃え、余白、名称と番号の読みやすさ、状態の手がかり、幅による変化を各画像で確認しました。一覧同士は選択・担当・状態の位置を、会話同士は本文・関連情報・返信欄の順序を比較しました。表は各状態で確かめた具体例です。上の2原因以外に、新たな指摘はありませんでした。

| 状態 | 375・1024・1440pxの観察 | 第3周の画像（px） |
| --- | --- | --- |
| all-inbox | 375では先頭の#11から時間順に追え、#4の警告が残る。1024では#8の完了と#9の迷惑メールまで10件が収まる。1440では時刻と状態が揃い、長い会社名だけが省略される。 | [375](screens/all-inbox-375.png)・[1024](screens/all-inbox-1024.png)・[1440](screens/all-inbox-1440.png) |
| approval-confirm | 375ではcustomer5の宛先と人数変更の回答全文を、確定操作の直前に読める。1024では元の下書きを背景にし、キャンセル・承認を前面に置く。1440で確定側の黒ボタンが元のボタンより明瞭になる。 | [375](screens/approval-confirm-375.png)・[1024](screens/approval-confirm-1024.png)・[1440](screens/approval-confirm-1440.png) |
| approval-list | 375では件名が省略されても番号・山田 花・5時間待ちが残る。1024の左ナビと見出しはいずれも1件。1440では返信の承認待ちと会話の未対応を別の印と文字で示す。 | [375](screens/approval-list-375.png)・[1024](screens/approval-list-1024.png)・[1440](screens/approval-list-1440.png) |
| candidates | 375で佐藤 優の行だけにチェック。1024の森と未割り当ては別の行で各候補の文字が読める。1440でも右端のチェックと氏名が重ならない。 | [375](screens/candidates-375.png)・[1024](screens/candidates-1024.png)・[1440](screens/candidates-1440.png) |
| composer-empty | 375で宛先が2行に折れ、下の送信2操作は灰色・濃い文字。1024でも空白の本文に入力案内が残る。1440の「プレビュー」は白地で、入力後の黒い「送信」と区別できる。 | [375](screens/composer-empty-375.png)・[1024](screens/composer-empty-1024.png)・[1440](screens/composer-empty-1440.png) |
| composer-failed | 375で赤枠に結果不明・本文保持・再送前の確認を明記し、直下の別タブリンクも見える。1024では実際の返信本文と宛先が残る。1440でも右パネルを移動せず確認リンクを選べる。 | [375](screens/composer-failed-375.png)・[1024](screens/composer-failed-1024.png)・[1440](screens/composer-failed-1440.png) |
| composer-note | 375で内部メモのタブと「相手には送られません」が同時に読める。1024の青いフォーカスは入力欄1つ。1440では下に「メモを残す」があり、外部への宛先は表示されない。 | [375](screens/composer-note-375.png)・[1024](screens/composer-note-1024.png)・[1440](screens/composer-note-1440.png) |
| composer-sending | 375で「送信中…」が右下に残り、3操作が1段に収まる。1024では本文・宛先を読める。1440で灰色の送信操作と「送信中…」の文字が処理中を示す。 | [375](screens/composer-sending-375.png)・[1024](screens/composer-sending-1024.png)・[1440](screens/composer-sending-1440.png) |
| composer-typing | 375は3行の下書きの下に宛先・プレビュー・送信が収まる。1024では入力欄にだけ青い枠が付く。1440では送信が黒、送信して完了が白枠で優先度が分かる。 | [375](screens/composer-typing-375.png)・[1024](screens/composer-typing-1024.png)・[1440](screens/composer-typing-1440.png) |
| confirmation | 375で削除する対象を含む質問全文と両方の操作が見える。1024で削除とキャンセルの間に余白がある。1440でも赤は削除に限られる。 | [375](screens/confirmation-375.png)・[1024](screens/confirmation-1024.png)・[1440](screens/confirmation-1440.png) |
| feedback-list | 375は「確認済みにする」を独立した行へ送る。1024ではフィードバックの受付済みと10時間前が同じ行に収まる。1440で意見の要約を読みながら対象の確認操作を選べる。 | [375](screens/feedback-list-375.png)・[1024](screens/feedback-list-1024.png)・[1440](screens/feedback-list-1440.png) |
| inbox | 375で検索対象の件名・差出人・本文を読める。1024では#7のクリップを#4の配送失敗と見分けられる。1440の左に件名・右に製品・待ち時間が揃う。 | [375](screens/inbox-375.png)・[1024](screens/inbox-1024.png)・[1440](screens/inbox-1440.png) |
| inbox-empty | 375で未対応0件・トレー・説明がひと続きに見える。1024では未対応0と返信待ち1が分かれる。1440でも空状態を検索欄の下に表示する。 | [375](screens/inbox-empty-375.png)・[1024](screens/inbox-empty-1024.png)・[1440](screens/inbox-empty-1440.png) |
| inbox-failed | 375で請求条件の2件を表示するが、#4の氏名は「渡…」まで。1024の同じ行では渡辺 葵と送信失敗を同時に読める。1440で上部の条件解除と失敗の赤表示を混同しない。 | [375](screens/inbox-failed-375.png)・[1024](screens/inbox-failed-1024.png)・[1440](screens/inbox-failed-1440.png) |
| inbox-filter | 375でDeskとsatoの条件、結果の森 海斗を読める。1024で担当ナビと見出しがともに1件。1440で時間と未対応、担当の印を同じ行で確認できる。 | [375](screens/inbox-filter-375.png)・[1024](screens/inbox-filter-1024.png)・[1440](screens/inbox-filter-1440.png) |
| inbox-loading | 375で検索語「領収書」とクリアの印、待機中の3本線が見える。1024では検索条件・並び順を保つ。1440で文字入力箇所と待機表示を同じ列で追える。 | [375](screens/inbox-loading-375.png)・[1024](screens/inbox-loading-1024.png)・[1440](screens/inbox-loading-1440.png) |
| link-issue | 375の関連情報で検索、課題番号#42、候補2件、紐づけの順に進む。1024は右上に閉じる操作。1440の常設右欄でも#42と選択中の題名が最後まで読める。 | [375](screens/link-issue-375.png)・[1024](screens/link-issue-1024.png)・[1440](screens/link-issue-1440.png) |
| loop-actions | 375でスヌーズと迷惑メールの両方がボタンの下に収まる。1024では三角印でスヌーズに続きがあると分かる。1440では前後の矢印が隠れず、受信本文も読める。 | [375](screens/loop-actions-375.png)・[1024](screens/loop-actions-1024.png)・[1440](screens/loop-actions-1440.png) |
| loop-assignee | 375は担当なしにチェック、moriとsatoは頭文字付き。1024で現在の行のみ薄灰色。1440ではメニューが「担当者を選ぶ」の直下に付き、未対応の操作と区別できる。 | [375](screens/loop-assignee-375.png)・[1024](screens/loop-assignee-1024.png)・[1440](screens/loop-assignee-1440.png) |
| loop-bulk | 375で操作帯に2件、下の対象2行に黒いチェックを表示。1024では完了と迷惑メールと選択解除を1段で比較できる。1440では未選択の#6以降に青い選択背景が付かない。 | [375](screens/loop-bulk-375.png)・[1024](screens/loop-bulk-1024.png)・[1440](screens/loop-bulk-1440.png) |
| loop-bulk-assignee | 375で「2件を選択」を残したまま担当の2候補が表示される。1024で水色のM、紫色のSと各名を確認できる。1440では個別の行に候補がかかるが、左端の選択チェックは隠れない。 | [375](screens/loop-bulk-assignee-375.png)・[1024](screens/loop-bulk-assignee-1024.png)・[1440](screens/loop-bulk-assignee-1440.png) |
| loop-bulk-label | 375は「長期契約の更新手続きについて」が1行で収まる。1024では対象2件のチェックを見たまま6候補を読める。1440では各行中央揃えで色印の位置がずれるものの、色と名称の対は識別できる。 | [375](screens/loop-bulk-label-375.png)・[1024](screens/loop-bulk-label-1024.png)・[1440](screens/loop-bulk-label-1440.png) |
| loop-convert | 375の説明で、変更後はこの意見に返信できると分かる。1024で対象の件名は背景、実行・キャンセルは前面。1440では「確認済みにする」と「問い合わせに変更」が別の操作であることを読み分けられる。 | [375](screens/loop-convert-375.png)・[1024](screens/loop-convert-1024.png)・[1440](screens/loop-convert-1440.png) |
| loop-discard | 375はこの会話の下書き1件を削除すると説明。1024ではキャンセルの隣に対象を含む「下書きを破棄」がある。1440で背景の「承認して送信」は暗く、破棄は前面になる。 | [375](screens/loop-discard-375.png)・[1024](screens/loop-discard-1024.png)・[1440](screens/loop-discard-1440.png) |
| loop-filter-assignee | 375ではすべてにチェック、mori・satoの全候補が収まる。1024では親の状態と製品を見たまま選べる。1440で子メニューの下端が親を越えてもsatoは切れない。 | [375](screens/loop-filter-assignee-375.png)・[1024](screens/loop-filter-assignee-1024.png)・[1440](screens/loop-filter-assignee-1440.png) |
| loop-filter-empty | 375で検索語・解除チップ・0件の説明がそろう。1024の虫眼鏡と説明は一覧幅の中央。1440では左の未対応7と現在の検索結果0が見出しで区別できる。 | [375](screens/loop-filter-empty-375.png)・[1024](screens/loop-filter-empty-1024.png)・[1440](screens/loop-filter-empty-1440.png) |
| loop-filters | 375で状態、プロダクト、担当者、ラベルの全条件が見え、選択欄の矢印は各1個。1024は右起点のメニューが左へ開く。1440ではメニューが右端を越えず並び順も読める。 | [375](screens/loop-filters-375.png)・[1024](screens/loop-filters-1024.png)・[1440](screens/loop-filters-1440.png) |
| loop-labels | 375で長いラベルを1行に収め、選択中の3行だけにチェック。1024で6色と「新しいラベルを作成」が収まる。1440では上段の3つの表示と選択済みの名前が一致する。 | [375](screens/loop-labels-375.png)・[1024](screens/loop-labels-1024.png)・[1440](screens/loop-labels-1440.png) |
| loop-status | 375で現在の「未対応」が最上段、変更先2件が下に並ぶ。1024では変更先に「にする」とあり現状と区別できる。1440では現在の状態の直下に開き、担当とラベルの操作は残る。 | [375](screens/loop-status-375.png)・[1024](screens/loop-status-1024.png)・[1440](screens/loop-status-1440.png) |
| my-inbox | 375でsatoの選択条件と3件のS印を照合できるが、#4の氏名は省略。1024の3件は未対応2件と返信待ち1件。1440では送信失敗・メモ・送信済みがそれぞれの行に残る。 | [375](screens/my-inbox-375.png)・[1024](screens/my-inbox-1024.png)・[1440](screens/my-inbox-1440.png) |
| suggest-composer | 375では記事名検索と候補「領収書を発行する」が画面幅内に収まる。1024では検索中も宛先と送信操作が見える。1440では中央の添付用検索と右欄の候補追加を判別できる。 | [375](screens/suggest-composer-375.png)・[1024](screens/suggest-composer-1024.png)・[1440](screens/suggest-composer-1440.png) |
| suggest-composer-empty | 375は候補追加を返信欄内に置き、次段に「記事を添える」を置く。1024では本文下まで操作が続く。1440は返信欄と右欄に同名の「記事の候補に追加」が並ぶ。 | [375](screens/suggest-composer-empty-375.png)・[1024](screens/suggest-composer-empty-1024.png)・[1440](screens/suggest-composer-empty-1440.png) |
| thread-approval | 375で代理作成者と承認待ちが下書き本文の前にある。1024で承認と破棄が本文の直下。1440の通常返信欄は下書きの灰色枠の外にある。 | [375](screens/thread-approval-375.png)・[1024](screens/thread-approval-1024.png)・[1440](screens/thread-approval-1440.png) |
| thread-attachment | 375で添付名「利用明細.txt」と43 Bを森の本文の下で読める。1024で43 Bの隣に余白を残す。1440で返信先が添付の枠外にあり、どのメッセージの添付かを識別できる。 | [375](screens/thread-attachment-375.png)・[1024](screens/thread-attachment-1024.png)・[1440](screens/thread-attachment-1440.png) |
| thread-context | 375でヘルプ記事・GitHub Issue #43・会話#6・件数比較が全面パネル内に収まる。1024でパネル右上の「閉じる」と背後の下書きを読める。1440では中央に下書きの承認、右に課題の操作が分かれる。 | [375](screens/thread-context-375.png)・[1024](screens/thread-context-1024.png)・[1440](screens/thread-context-1440.png) |
| thread-failed | 375でsatoの返信と受信拒否の理由を同時に読める。1024でその直下の「再送」が当該メッセージに属する。1440でも赤い配送失敗と問い合わせの黒い未対応を見分けられる。 | [375](screens/thread-failed-375.png)・[1024](screens/thread-failed-1024.png)・[1440](screens/thread-failed-1440.png) |
| thread-html | 375は購入メールの見出しが2行になり、注文番号SL-2026-128は1行。1024で「外部の画像は非表示です。」が本文に沿って表示される。1440でも引用された注文と新規返信が別枠になる。 | [375](screens/thread-html-375.png)・[1024](screens/thread-html-1024.png)・[1440](screens/thread-html-1440.png) |
| thread-inbound | 375はラベル3つと山田の本文を読んでから返信欄へ進む。1024では送り主・受信時刻・返信先が見える。1440で関連情報の右欄は本文に重ならない。 | [375](screens/thread-inbound-375.png)・[1024](screens/thread-inbound-1024.png)・[1440](screens/thread-inbound-1440.png) |
| thread-note | 375で黄色のメモの著者と時刻、外部には送られない説明を読める。1024で森の問い合わせとメモが分かれる。1440ではDeskの返信先をメモの外に見る。 | [375](screens/thread-note-375.png)・[1024](screens/thread-note-1024.png)・[1440](screens/thread-note-1440.png) |
| thread-replied | 375で受信に続くsatoの送信済み返信が見える。1024では2時間前の受信と1時間前の送信を照合できる。1440では紙飛行機・送信済みの文字・会話の返信待ちを識別できる。 | [375](screens/thread-replied-375.png)・[1024](screens/thread-replied-1024.png)・[1440](screens/thread-replied-1440.png) |
