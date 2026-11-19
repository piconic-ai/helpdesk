# 設定・拡張・メニューのスクリーンショットレビュー

対象は113状態・339枚。375×812、1024×900、1440×900の各画像を状態ごとに横に並べて比較した。所見を重複する状態・幅で数え直さず、異なる問題として **高1件・中17件・低11件** を記録した。

高の1件は、現在の端末だけで動く埋め込みコードを、公開サイトへ貼るコードと読み違える案内である。公開後の訪問者への影響から高とした。公開環境の実際の生成コードはこの資料から判断できない。

静止画では、押せそうに見えることと実際に実行できることを区別した。保存・送信の成功、タップ領域、フォーカスの移動、画面のずれ、入力保持、反応速度は、対応する前後の画像または操作結果が必要になる。ページ途中の画像では、画面上端に見出しがないこと自体を欠陥に数えていない。

全状態の縮小一覧でも、見出し・カード・浮いた操作の位置を比べた。設定の編集は広い画面でも短い1列に収まり、受信箱は左右に列を使う。違いが目立つ箇所はラベルとルールの削除確認のボタン幅、製品ごとの公開設定の縦の長さ、携帯で長い選択メニューを開いた時の視界だった。

## 所見と改善後の姿

### 高（1件）

- **S01　公開用の埋め込みと端末用の試用を取り違える。** 記事・フィードバック・フォームで「公開先のヘルプデスクでコピー」と「登録済みのサイトに次のコードを貼り付けてください」が続く。チャットも「プロダクトへの埋め込み」と表示。提示コードの参照先はいずれも 127.0.0.1 で、別の端末の訪問者から同じ窓口へ到達できない。 改善後は、この環境では「この端末で試す」に見出しとコピーの用途を統一する。公開手順では公開先の画面で取得する操作を示す。 関連する状態は025、028、030、031。代表画像 [1024px](screens/guide-articles-1024.png)。

### 中（17件）

- **S02　保存の入口を見つけにくい内部メモ。** 375pxで黄色の入力欄は見えるが、その下は余白で、広い2幅にある「メモを残す」が見えない。 改善後は、入力欄と同じ枠に操作を置き、空なら理由の分かる無効状態にする。 関連する状態は013。代表画像 [375px](screens/extension-feedback-375.png)。
- **S03　配色を文字で選べない。** 色メニューは8個の濃い色の丸で、チェックで現在値を示すが色名は表示しない。特に茶・灰・青は小さい点にすると近い。 改善後は、選択時は色名を併記し、一覧の小さな点は補助情報にする。 関連する状態は006、041、083、084、085、086、087、088。代表画像 [375px](screens/behavior-label-swatches-375.png)。
- **S04　長いラベルに使える幅が狭い。** 375pxの「長期契約の更新手続きについて」は2行で「…」になる。会話数の左には空きが見える。 改善後は、件数・操作を固定してラベル名に残幅を配分する。必要な場合は行の高さを増やす。 関連する状態は041、081、087、093。代表画像 [375px](screens/label-colors-375.png)。
- **S07　出力される情報の範囲に比べて選択肢が曖昧。** 「伏せて書き出す」が住所なども隠すように読める。実際に置換する範囲と残る情報は上段の説明にだけ出ている。 改善後は、選択名を「名前とメールアドレスを伏せる」にし、残る自由記述の注意を実行ボタンの近くに置く。 関連する状態は012、029。代表画像 [375px](screens/extension-export-375.png)。
- **S08　埋め込み用設定の一覧が長い。** 同じ製品カードにURL、試用の注意、コード、コピーなどが次々に並ぶ。375pxの記事設定では最初の製品だけで画面が埋まる。 改善後は、製品ごとに受付状態と公開先を1行で示し、埋め込み手順は必要時に展開する。 関連する状態は025、028、030、031。代表画像 [375px](screens/guide-articles-375.png)。
- **S09　GitHubの登録先を英語の空欄見本から推測する。** Desk の欄の手掛かりが owner/repository。Slide では登録済みの値と編集欄が常に同時に並ぶ。 改善後は、現在の連携先を一覧で読み、変更時に選ぶか、所有者名とリポジトリ名を日本語の例で入力できるようにする。 関連する状態は032。代表画像 [375px](screens/guide-issues-375.png)。
- **S10　通知の配信先を運営画面で識別できない。** 新着通知は「Slack」とだけ表示し、チャンネルの確認を接続先の Webhook 設定に委ねる。 改善後は、承認時に選んだ人が読めるチャンネル名か管理者が付けた接続先名を表示する。 関連する状態は018、035。代表画像 [375px](screens/extension-notify-375.png)。
- **S11　受信箱の並び順に判断材料のない選択肢がある。** 迷惑メールには「待たせている順」が選ばれているが、行の時間は「9時間前」。返信を待っている相手を示す表示はない。 改善後は、この一覧では受信時刻など、行の値と対応する名前で並び順を示す。 関連する状態は022、101。代表画像 [375px](screens/extension-spam-375.png)。
- **S13　一括担当の候補に部分選択が表れない。** 「請求」の2件では1行に佐藤の印、もう1行に空の輪があるが、担当候補のどちらにも一部選択の印がない。ラベル操作は同じ件数で一部付与の記号を表示する。 改善後は、一部が該当する担当者も候補内で識別できるようにする。 関連する状態は062。代表画像 [375px](screens/menu-label-fd3f5651-bulk-assignee-375.png)。
- **S14　長いラベル選択で対象や末尾が隠れる。** 375pxの絞り込みでラベル候補が上へ開き、背後の絞り込み項目と一覧を覆う。会話内の新規作成では末尾の「ラベルを管理」が途中で切れる。 改善後は、対象名のあるヘッダーを残し、メニューの内側でスクロールできることを見た目でも示す。 関連する状態は043、066、073、100。代表画像 [375px](screens/loop-label-new-375.png)。
- **S15　ルール編集の対象が埋もれる。** 375pxで既存ルールを開くと検索と説明が先行し、画面下端で条件入力がやっと始まる。ページには新規入力も続き、削除確認の背景では条件欄が二組見える。 改善後は、編集対象の条件・付与結果・保存をひとまとまりにし、新規追加は明示的に開く。 関連する状態は046、047。代表画像 [375px](screens/loop-rule-delete-375.png)。
- **S17　モデル設定が利用結果より実装名を前面に出す。** おすすめ設定に「Clef Flash」「Clef」、確率の下限「60」が並ぶ。どの問い合わせで何が変わるかの具体例は見えない。 改善後は、用途と結果の違いを先に示し、数値変更後の提示例を確認できるようにする。 関連する状態は112。代表画像 [375px](screens/suggest-settings-375.png)。
- **S19　登録操作が三種類の自動送信承認を兼ねる。** 窓口の登録で新着通知・自動受付返信・解決アンケートがひとまとまりになり、375pxでは説明が続いて登録ボタンが最初の画面外になる。 改善後は、登録する窓口と承認する配信の要約を一か所で確認でき、各通知先・文面と見比べられるようにする。 関連する状態は007。代表画像 [375px](screens/behavior-product-add-375.png)。
- **S20　ラベル行から改名の操作を見つけにくい。** 通常時、ラベル名は文字に見え、「操作」を開いても統合・削除だけが並ぶ。実際の改名入口は名前自体にある。 改善後は、「操作」にも「名前を変更」を出すか、名前が編集できることを一覧で示す。 関連する状態は005、041、077、078、079、080、081、082、089、090、091、092、093、094。代表画像 [375px](screens/behavior-label-rename-375.png)。
- **S21　記事案・統合の関連操作が重なって残る。** 複数拡張がある会話で、開いた入力のすぐ下に別の拡張の「既存の課題を選ぶ」と課題番号が見える。特に統合先 #2 の下の #42 が別作業と読み分けにくい。 改善後は、開いている作業の対象・候補・確定を独立した領域にし、他の拡張名と操作のつながりを保つ。 関連する状態は052、054。代表画像 [375px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-375.png)。
- **S22　未設定の通知先でも「有効」が前面に出る。** 振り分けルールを表示した一覧の「新着通知」はスイッチが有効なのに「通知先は未設定です」とだけ示す。 改善後は、有効化の状態に加え「通知先の設定が必要」など配信可能性を同じ位置に示し、設定に導く。 関連する状態は020。代表画像 [375px](screens/extension-rules-375.png)。
- **S25　新規統合先が既に指定済みに見える。** ラベル操作を開くと、対象以外の具体的な別ラベルが初期選択され「別のラベルにまとめる」がすぐ並ぶ。 改善後は、自分で統合先を選んでから確認へ進む流れとし、元と先を対にして示す。 関連する状態は077、078、079、080、081、082。代表画像 [375px](screens/menu-settings-labels-label-actions-0-375.png)。

### 低（11件）

- **S05　未入力・変更前も実行可能に見える。** 空の新規ラベル名で「追加する」が黒い。改名でも旧値と同じ状態で「名前を変更」が通常表示。 改善後は、入力または変更後に実行できる見た目にする。押下時に検証する設計なら要件を先に伝える。 関連する状態は002、005、076、089、090、091、092、093、094。代表画像 [375px](screens/behavior-label-add-375.png)。
- **S06　確認ダイアログの操作が広すぎる。** ラベル削除・統合では1024・1440pxでもキャンセルと実行がそれぞれダイアログいっぱいに伸びる。ルール削除確認は同じ幅で文字幅に収まる。 改善後は、広い画面では同じ確認操作の配置と幅を揃える。 関連する状態は003、004。代表画像 [1440px](screens/behavior-label-delete-1440.png)。
- **S12　「標準の順序」の中身が分からない。** 定型返信・運営者・トークンなどで「標準の順序」と「名前順」が並び、標準の基準が見えない。 改善後は、並べ替えの実際の基準名をボタンと候補に表示する。 関連する状態は027、047、051、095、103、105。代表画像 [375px](screens/guide-canned-375.png)。
- **S16　件数が少ない一覧で情報の両端が離れる。** 広い画面では左の短い名前から右の状態・編集・行末まで大きく空き、行を横断して対応を追う必要がある。 改善後は、一覧の最大幅か列幅を調整し、同じ行を目で追える距離にする。 関連する状態は008、048、105。代表画像 [1440px](screens/extension-articles-1440.png)。
- **S18　短い主操作が携帯で一律に横いっぱいになる。** 会話選択・迷惑メール・集計を開くなどの短いボタンが375pxではカード幅まで伸び、同じ画面の操作以外の行と似る。 改善後は、ラベルとタップ領域に合わせて幅を決める。幅いっぱいを許す設計でも用途別に使い分ける。 関連する状態は033、034、036、038、039。代表画像 [375px](screens/guide-merge-375.png)。
- **S23　ログイン名の真下から無関係な操作説明を開く。** ナビ最下部の「…」に唯一あるのは「キーボード操作」。運営者の名前とプロフィールの隣にあり、個人設定を連想させる。 改善後は、キーボード操作の入口をヘルプとして識別できる表示にする。 関連する状態は042、059。代表画像 [375px](screens/loop-account-menu-375.png)。
- **S24　発行済みトークンが空のとき余白が大きい。** 0件、発行済みの見出し、中央の空表示、発行フォームの順で、1つ目のトークンを作るまでの視線移動が大きい。 改善後は、初回発行では短い空表示とフォームを同じ領域に寄せる。 関連する状態は113。代表画像 [375px](screens/tokens-375.png)。
- **S26　問い合わせの節目が番号のみ。** 解決アンケートの問いの下に「問い合わせ #8」だけがあり、どの相談を評価するのか件名は見えない。 改善後は、利用者が識別できる範囲で件名などの短い手掛かりを添える。 関連する状態は023。代表画像 [375px](screens/extension-survey-375.png)。
- **S27　返答テンプレートの候補と実行を見分けにくい。** 候補の先頭にラジオ印、その下に展開済み本文と「定型文から下書きを作成」が続く。1件だけのときも選択と作成の2段になっている。 改善後は、候補の選択と下書きへの適用の関係を明示し、1件時には操作を短くする。 関連する状態は010、055。代表画像 [375px](screens/extension-canned-375.png)。
- **S28　拡張カードの見出しが1文字だけ折れる。** 1024pxの受付グループでは「問い合わせフォーム」の最後の「ム」だけ次行になる。1440pxと375pxのカードでは同じ名称が1行に収まる。 改善後は、スイッチの幅を残したままラベル幅を確保するか、「問い合わせ／フォーム」のように意味のある単位で折り返す。 関連する状態は009、024。代表画像 [1024px](screens/extension-auto-ack-1024.png)。
- **S29　「すべて」の隣に空の人物マークが出る。** 担当者フィルターの「すべて」の前に薄い点線の空丸があり、未割当の印にも見える。実名の候補にはイニシャル入りの丸がある。 改善後は、「すべて」は人物のアバターを省き、現在値のチェックと文字で示す。 関連する状態は068、075、102。代表画像 [375px](screens/menu-label-fd3f5651-filter-assignee-375.png)。

## 状態別の記録

各状態の3つの問いで、対象・判断・次の操作を確かめた。「見比べた点」には追加で確認した観点を示す。所見番号の改善後の姿と重さは上の一覧を参照。

### 状態001　account

運営者が自分の表示名と画像を変更する。

1. 誰の設定か？ 佐藤 優の印とメールアドレス。
2. 何を変更できるか？ 表示名とアイコン画像。
3. 確定と中止は？ 「アカウントを保存」と「取り消し」が並ぶ。

見比べた点　375は1列、広い2幅でもフォームは適度な幅。 識別・入力条件・主操作を確認。画像形式、容量、切り抜き方まで読める。

画像から判断できないこと　画像選択後のプレビューと失敗時の入力保持。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/account-375.png)・[1024px](screens/account-1024.png)・[1440px](screens/account-1440.png)

### 状態002　behavior-label-add

管理者が分類用ラベルを追加する。

1. どこで作るか？ 一覧右上から開いた小窓。
2. 入力条件は？ 名前は20字まで。
3. 次は？ 空欄の下に「追加する」。

見比べた点　3幅とも追加の起点と入力欄が画面内。 位置・制限・空欄時の強さを確認。既存ラベルと比較できる。

画像から判断できないこと　空で押した後のエラー。

該当所見　S05。 [375px](screens/behavior-label-add-375.png)・[1024px](screens/behavior-label-add-1024.png)・[1440px](screens/behavior-label-add-1440.png)

### 状態003　behavior-label-delete

管理者が「経理」の削除範囲を確認する。

1. 何を消すか？ 経理ラベル。
2. 影響は？ 使用中の会話2件から外す。
3. 中止できるか？ 赤い削除の前にキャンセル。

見比べた点　3幅中央に確認。広い2幅でもボタンが全幅。 対象・影響・安全な出口を確認。背景の操作メニューも暗く残る。

画像から判断できないこと　実行後の結果と初期フォーカス。

該当所見　S06。 [375px](screens/behavior-label-delete-375.png)・[1024px](screens/behavior-label-delete-1024.png)・[1440px](screens/behavior-label-delete-1440.png)

### 状態004　behavior-label-merge

管理者が経理を再発行へ統合する前に確かめる。

1. 元は？ 経理。
2. 先と件数は？ 再発行へ、元に2件。
3. 次は？ キャンセルか別のラベルにまとめる。

見比べた点　3幅で対象説明は全文。幅広でもボタンが縦に伸びる。 名前の方向・件数・確定階層を確認。

画像から判断できないこと　戻った際のフォーカスと統合後の表示。

該当所見　S06。 [375px](screens/behavior-label-merge-375.png)・[1024px](screens/behavior-label-merge-1024.png)・[1440px](screens/behavior-label-merge-1440.png)

### 状態005　behavior-label-rename

管理者が経理ラベルを改名する。

1. 対象は？ 現在の名前は経理。
2. 何を入力する？ 20字までの新しい名前。
3. キャンセルは？ 入力直下に取り消し。

見比べた点　375は一覧上に幅広い小窓、広い2幅は対象名の直下。 対象・入力・確定を確認。旧名のまま変更が通常表示。

画像から判断できないこと　同名・重複名の検証。

該当所見　S05、S20。 [375px](screens/behavior-label-rename-375.png)・[1024px](screens/behavior-label-rename-1024.png)・[1440px](screens/behavior-label-rename-1440.png)

### 状態006　behavior-label-swatches

管理者が経理ラベルの識別色を変える。

1. 対象は？ 経理の色ボタン。
2. 現在色は？ 右下の濃い色にチェック。
3. 候補は？ 4列2段で8色。

見比べた点　3幅とも画面内、操作の近くに展開。 対象・選択マーク・色以外の識別手掛かりを確認。

画像から判断できないこと　フォーカス時の色名や読み上げ。

該当所見　S03。 [375px](screens/behavior-label-swatches-375.png)・[1024px](screens/behavior-label-swatches-1024.png)・[1440px](screens/behavior-label-swatches-1440.png)

### 状態007　behavior-product-add

管理者が新製品の窓口と自動送信を登録する。

1. 何を登録する？ 製品名と窓口アドレスの先頭、送信ドメイン。
2. 何が送られる？ 新着通知、受付返信、解決アンケート。
3. どう確認する？ 通知先と送信文面を新しいタブで開ける。

見比べた点　375で承認ボタンは最初の画像外、広い2幅ではフォーム全体が見える。 入力・外部送信範囲・登録の位置を確認。

画像から判断できないこと　登録前の最終確認と個別設定の可否。

該当所見　S19。 [375px](screens/behavior-product-add-375.png)・[1024px](screens/behavior-product-add-1024.png)・[1440px](screens/behavior-product-add-1440.png)

### 状態008　extension-articles

記事担当者が公開中のヘルプ記事を見つけて管理する。

1. 何件ある？ 1件。
2. どの記事？ 「領収書を発行する」、Slide、公開中。
3. 書くには？ 「記事を書く」。候補・記事が無かった質問も別入口。

見比べた点　375は操作が2段、広い2幅は見出し横にまとまる。 件数・公開状態・記事作成の順位を確認。広幅では情報が横に長い。

画像から判断できないこと　選択後の編集と空検索。

該当所見　S16。 [375px](screens/extension-articles-375.png)・[1024px](screens/extension-articles-1024.png)・[1440px](screens/extension-articles-1440.png)

### 状態009　extension-auto-ack

管理者が自動受付返信の有効状態と設定入口を探す。

1. 使えるか？ 自動受付返信は有効。
2. 何をする？ 初回メールの差出人に自動で受付を通知。
3. どこで文面を確認する？ 同カードの「設定」。

見比べた点　375はカード1列。1024・1440は3列で分類を同時比較できる。 分類・状態・設定ボタンの縦位置を確認。

画像から判断できないこと　切替後の承認と通知の反映。

該当所見　S28。 [375px](screens/extension-auto-ack-375.png)・[1024px](screens/extension-auto-ack-1024.png)・[1440px](screens/extension-auto-ack-1440.png)

### 状態010　extension-canned

担当者が返信に定型文を利用する。

1. 誰へ？ 山田 花、Slideの #1。
2. 何を入れる？ 「お問い合わせの受付」、名前と製品が入った英文。
3. 即送信か？ 「定型文から下書きを作成」と表示。

見比べた点　375は返信欄上、広い2幅では起点の下。 宛先・文面・適用後の意味を確認。

画像から判断できないこと　実際に下書きが残るか。

該当所見　S27。 [375px](screens/extension-canned-375.png)・[1024px](screens/extension-canned-1024.png)・[1440px](screens/extension-canned-1440.png)

### 状態011　extension-chat

Slideの利用者が質問に合う記事を探す。

1. 相手は？ 説明は記事を自動で探すと明記。
2. どこに書く？ 「質問」欄と「質問する」。
3. 別の相談方法は？ 記事一覧とメールのリンク。

見比べた点　3幅とも小さいウィジェット幅で読める。 自動応答の明示・入力・出口を確認。

画像から判断できないこと　検索結果、該当なし、受付結果。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/extension-chat-375.png)・[1024px](screens/extension-chat-1024.png)・[1440px](screens/extension-chat-1440.png)

### 状態012　extension-export

管理者が履歴を書き出す前に対象と個人情報を確認する。

1. どこまで出す？ 全期間・全製品、会話11、メッセージ17、操作履歴12。
2. 何を伏せる？ 名前・アドレス、自由記述は残る。
3. 何を得る？ 「JSON Lines を書き出す」。

見比べた点　3幅で注意と選択と書き出しが1画面内。 対象・秘匿範囲・実行位置を確認。

画像から判断できないこと　実ファイルの置換結果。

該当所見　S07。 [375px](screens/extension-export-375.png)・[1024px](screens/extension-export-1024.png)・[1440px](screens/extension-export-1440.png)

### 状態013　extension-feedback

運営者がフィードバックを確認し内部メモを残す。

1. 誰から？ 佐々木 葵の #10、受付済み。
2. 返信が必要なら？ 「問い合わせに変更」。
3. メモは届く？ 黄色い欄に「相手には送られません」。

見比べた点　375では入力欄だけ、1024・1440に「メモを残す」が見える。 案件識別・内部と外部の区別・記録の入口を確認。

画像から判断できないこと　入力またはフォーカスで操作が現れるか。

該当所見　S02。 [375px](screens/extension-feedback-375.png)・[1024px](screens/extension-feedback-1024.png)・[1440px](screens/extension-feedback-1440.png)

### 状態014　extension-form

Slideの利用者が問い合わせを送る。

1. どこ宛て？ Slideの印と名称。
2. 何が必要？ 件名、問い合わせ内容、連絡先メールアドレス。
3. 送るには？ 一番下に黒い「送信」。

見比べた点　375で全項目とボタンが収まり、広い2幅でも入力行が伸びすぎない。 製品識別・入力順・実行の区別を確認。

画像から判断できないこと　空送信のエラー、送信確認・受付結果。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/extension-form-375.png)・[1024px](screens/extension-form-1024.png)・[1440px](screens/extension-form-1440.png)

### 状態015　extension-issues

担当者が会話を基にGitHub課題の公開案を準備する。

1. 元の会話は？ #1 領収書の宛名を変更できますか。
2. どこへ公開する？ example/helpdesk。
3. 何を書く？ タイトル・公開する要約を入れて起票内容を確認。

見比べた点　375は関連情報内、1024はオーバーレイのパネル、1440は右列に公開案。 投稿先・公開範囲・確認入口を確認。

画像から判断できないこと　最終確認、公開前の修正やキャンセル。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/extension-issues-375.png)・[1024px](screens/extension-issues-1024.png)・[1440px](screens/extension-issues-1440.png)

### 状態016　extension-merge

担当者が同じ相手の会話をひとつにする。

1. 統合元は？ 領収書の #1。
2. 先は？ #2 ワークスペースの招待メール、候補1件。
3. 押すと？ 「この会話を統合する内容を確認」。

見比べた点　375は関連情報の全面、1024は右からの領域、1440は常設右列。 方向・識別・即時実行と確認の区別を確認。

画像から判断できないこと　実行時の確認内容と元会話の遷移。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/extension-merge-375.png)・[1024px](screens/extension-merge-1024.png)・[1440px](screens/extension-merge-1440.png)

### 状態017　extension-metrics

運営責任者が過去30日の対応成績を読む。

1. 期間と対象は？ 過去30日、すべてのプロダクト。
2. 解決速度は？ 平均4日。
3. 割合は信頼できるか？ 一度で解決100%は対象1件、少数の注意がある。

見比べた点　375はカード1列、1024・1440は3・2・3の並び。 母数・欠測・カード間の優先度を確認。

画像から判断できないこと　期間変更後の更新と推移の点ごとの詳細。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/extension-metrics-375.png)・[1024px](screens/extension-metrics-1024.png)・[1440px](screens/extension-metrics-1440.png)

### 状態018　extension-notify

管理者が新着通知の接続状態を調べる。

1. 有効か？ 新着通知は有効。
2. どこに届く？ Slack。チャンネルは外部設定で確認と記す。
3. 次は？ カードの「設定」。

見比べた点　375は1列、広い2幅は整えるグループの左のカード。 有効状態・送信先・確認までの手順を確認。

画像から判断できないこと　実際の配信先、設定を開いて見える範囲。

該当所見　S10。 [375px](screens/extension-notify-375.png)・[1024px](screens/extension-notify-1024.png)・[1440px](screens/extension-notify-1440.png)

### 状態019　extension-presence

担当者が他の担当者と同時対応していないか調べる。

1. 対象は？ Slideの #1。
2. 誰か見ているか？ 「ほかに閲覧中の担当者はいません」。
3. その他の手掛かりは？ 他の問い合わせなしと操作履歴。

見比べた点　375は全面、1024は引き出し、1440は本文横で見られる。 対象・空状態・作業へ戻る入口を確認。

画像から判断できないこと　閲覧者が現れたときの更新間隔。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/extension-presence-375.png)・[1024px](screens/extension-presence-1024.png)・[1440px](screens/extension-presence-1440.png)

### 状態020　extension-rules

管理者が振り分けルールの利用可否を確認する。

1. 有効か？ 振り分けルールは有効。
2. 何が登録済み？ 0件。
3. 次は？ 「設定」。隣の新着通知は有効かつ通知先未設定。

見比べた点　375では下方にルール、広い2幅では整えるグループの2段目。 有効・設定済み・配信可能の違いを確認。

画像から判断できないこと　未設定通知の実配信とルール追加後の表示。

該当所見　S22。 [375px](screens/extension-rules-375.png)・[1024px](screens/extension-rules-1024.png)・[1440px](screens/extension-rules-1440.png)

### 状態021　extension-snooze

担当者が問い合わせを指定日時まで保留する。

1. 今の状態は？ 保留されていない。
2. 何を指定する？ 再表示日時（日本時間）。
3. どう実行する？ 「指定日時まで保留」。

見比べた点　375は本文の手前、広い2幅はツールバー下に展開。 状態・時間帯・再表示の意味を確認。

画像から判断できないこと　過去日時・空欄のエラー、期限の再表示。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/extension-snooze-375.png)・[1024px](screens/extension-snooze-1024.png)・[1440px](screens/extension-snooze-1440.png)

### 状態022　extension-spam

担当者が隔離された会話を見つける。

1. どの箱？ 迷惑メール1件。
2. 何が該当？ Slideの #9「未承諾の営業案内」。
3. 並び順は？ 「待たせている順」、行は「9時間前」。

見比べた点　375は検索の下に並び順、広い2幅は同じ行。 件数・状態条件・時刻の意味を確認。

画像から判断できないこと　解除後の遷移と件数変化。

該当所見　S11。 [375px](screens/extension-spam-375.png)・[1024px](screens/extension-spam-1024.png)・[1440px](screens/extension-spam-1440.png)

### 状態023　extension-survey

利用者が問い合わせが解決したか回答する。

1. 何について？ Slideの問い合わせ #8。
2. 何を問う？ 解決しましたか。
3. 何が送られる？ 選んだ「はい」「いいえ」を送信。

見比べた点　3幅とも2択が近接し、広い画面でも読み幅は限定。 案件識別・質問文・送信の予告を確認。

画像から判断できないこと　回答の確認・送信済みの表示。

該当所見　S26。 [375px](screens/extension-survey-375.png)・[1024px](screens/extension-survey-1024.png)・[1440px](screens/extension-survey-1440.png)

### 状態024　extensions

管理者が拡張を探して有効状態を管理する。

1. 何件有効？ 16件。
2. どう探す？ 検索・有効状態の絞り込みと目的別見出し。
3. 設定入口は？ カードごとの「設定」とスイッチ。

見比べた点　375は1列、広い2幅は受付が3列。 分類・スイッチの文字・カード配置を確認。

画像から判断できないこと　絞り込み結果と無効化時の確認。

該当所見　S28。 [375px](screens/extensions-375.png)・[1024px](screens/extensions-1024.png)・[1440px](screens/extensions-1440.png)

### 状態025　guide-articles

運営者が記事を管理し、製品の公開ページを設置する。

1. 記事を作るには？ 「記事の管理を開く」。
2. どの製品？ Desk と Slide が別カード。
3. 配布先は？ 画面には端末用127.0.0.1と、登録サイトへ貼る指示が混在。

見比べた点　375の初期表示はDesk中心、広い2幅はSlideの見出しも見える。 製品・公開先・コピーの意味を確認。

画像から判断できないこと　本番の公開URLや実際のクリップボード内容。

該当所見　S01、S08。 [375px](screens/guide-articles-375.png)・[1024px](screens/guide-articles-1024.png)・[1440px](screens/guide-articles-1440.png)

### 状態026　guide-auto-ack

管理者が自動受付返信の承認と文面を確認する。

1. 誰が承認した？ 佐藤 優、全製品が対象。
2. いつ送る？ 初めての問い合わせメールを受け付けた時。
3. 文面は？ Deskの英語見本に自動受付である旨と番号。

見比べた点　375は承認・見本まで。広い2幅では下の編集欄も始まる。 承認者・適用範囲・自動である旨を確認。

画像から判断できないこと　保存後にどの承認が有効になるか。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/guide-auto-ack-375.png)・[1024px](screens/guide-auto-ack-1024.png)・[1440px](screens/guide-auto-ack-1440.png)

### 状態027　guide-canned

管理者が定型返信を探して作成または編集する。

1. 何件ある？ 「お問い合わせの受付」1件。
2. 何を差し込む？ 名前と製品用の差し込み記号。
3. どこで編集する？ 保存済みの行に「編集」、その下に新規入力。

見比べた点　375では新規フォームが画面下へ、広い2幅では一覧と作成を同時に見られる。 一覧と新規の区別・入力説明・順序名を確認。

画像から判断できないこと　変数入力の誤りと作成後の結果。

該当所見　S12。 [375px](screens/guide-canned-375.png)・[1024px](screens/guide-canned-1024.png)・[1440px](screens/guide-canned-1440.png)

### 状態028　guide-chat

管理者が製品別チャットの受付・設置先を確認する。

1. どの製品が受付中？ Slide。Deskは受付開始前。
2. 何を試せる？ Slide の「ヘルプチャットを開く」。
3. どこに置く？ プロダクトへの埋め込み用として端末限定URLのscriptが示される。

見比べた点　375はDeskの後にSlideが続き、1024・1440ではコード欄に達する。 受付状態・配布先・コードの用途を確認。

画像から判断できないこと　本番URL、公開先での動作。

該当所見　S01、S08。 [375px](screens/guide-chat-375.png)・[1024px](screens/guide-chat-1024.png)・[1440px](screens/guide-chat-1440.png)

### 状態029　guide-export

管理者が書き出し方法と閲覧権限を確かめる。

1. 何件が対象？ 会話11・メッセージ17・履歴12。
2. 何を残す？ 住所等の自由記述は残ると説明。
3. 必要な権限は？ 問い合わせ本文の閲覧。

見比べた点　3幅ともフォームと権限を1画面で比較できる。 対象件数・出力範囲・権限表示を確認。

画像から判断できないこと　実データの置換と書き出し失敗時の表示。

該当所見　S07。 [375px](screens/guide-export-375.png)・[1024px](screens/guide-export-1024.png)・[1440px](screens/guide-export-1440.png)

### 状態030　guide-feedback

管理者がフィードバックの受付とサイトへの設置を行う。

1. どこに届く？ フィードバックの受信箱。
2. どこで受付中？ Slide。Deskは開始前。
3. どう設置する？ ローカルのiframeと「登録済みのサイト」に貼る指示。

見比べた点　375はSlideの説明が初期画面末尾、広い2幅ではコード・コピーまで見える。 受付状態・受信箱・埋め込み先を確認。

画像から判断できないこと　実際の受付結果と公開環境のコード。

該当所見　S01、S08。 [375px](screens/guide-feedback-375.png)・[1024px](screens/guide-feedback-1024.png)・[1440px](screens/guide-feedback-1440.png)

### 状態031　guide-form

管理者がフォームを公開し、送った問い合わせを確認する。

1. どこを開く？ Slide の「公開フォームを開く」。
2. どこで確認する？ 「Slideの受信箱を開く」。
3. コードの行き先は？ ローカルURLと登録サイトへの貼り付け指示が続く。

見比べた点　375ではDeskとSlideの入口、広い2幅はコードまで同時に見える。 受付・確認経路・コードの用途を確認。

画像から判断できないこと　本番の公開先と試験投稿後の到着。

該当所見　S01、S08。 [375px](screens/guide-form-375.png)・[1024px](screens/guide-form-1024.png)・[1440px](screens/guide-form-1440.png)

### 状態032　guide-issues

管理者が製品ごとのGitHub連携先を登録する。

1. 接続準備は？ 接続用トークンは設定済み。
2. 登録済みの製品は？ Slideにexample/helpdesk、Deskは空。
3. 保存するには？ Deskは登録、Slideはリポジトリを更新。

見比べた点　3幅とも2製品を縦に配置し、375では下に手順が続く。 接続状態・登録先入力・保存単位を確認。

画像から判断できないこと　アクセス不能・非公開リポジトリの検証。

該当所見　S09。 [375px](screens/guide-issues-375.png)・[1024px](screens/guide-issues-1024.png)・[1440px](screens/guide-issues-1440.png)

### 状態033　guide-merge

担当者が統合手順を知り、対象の会話へ進む。

1. 何をまとめる？ 同じ相手・窓口の会話。
2. どちらに移る？ 開いている会話のメッセージが選んだ会話に集まる。
3. 入口は？ 「受信箱で会話を選ぶ」。

見比べた点　375では短い入口が横幅いっぱい。広い2幅は短いボタン。 対象条件・方向・作業入口を確認。

画像から判断できないこと　統合後に戻せるか。

該当所見　S18。 [375px](screens/guide-merge-375.png)・[1024px](screens/guide-merge-1024.png)・[1440px](screens/guide-merge-1440.png)

### 状態034　guide-metrics

責任者が集計機能の入口を探す。

1. 何を見る？ 問い合わせ完了前後の指標。
2. 絞り方は？ 集計画面で製品と期間を選ぶ。
3. 権限と入口は？ 追加権限なし、「集計画面を開く」。

見比べた点　375で入口が全幅、広い2幅ではラベル幅。 対象・権限・入口の強さを確認。

画像から判断できないこと　期間変更後の結果。

該当所見　S18。 [375px](screens/guide-metrics-375.png)・[1024px](screens/guide-metrics-1024.png)・[1440px](screens/guide-metrics-1440.png)

### 状態035　guide-notify

管理者が新着通知の接続先と権限を確認する。

1. 行き先は？ Slack。
2. どのチャンネル？ 接続先のWebhook設定で確認と表示。
3. 使う権限は？ 外部接続・本文閲覧・メール送信。

見比べた点　3幅とも接続手順は折り畳まれ、送信先と権限が見える。 送信先・設定手順・権限を確認。

画像から判断できないこと　外部側での実際のチャンネル。

該当所見　S10。 [375px](screens/guide-notify-375.png)・[1024px](screens/guide-notify-1024.png)・[1440px](screens/guide-notify-1440.png)

### 状態036　guide-presence

担当者が同時閲覧機能の読み方を知る。

1. 何が分かる？ 他の担当者の閲覧中・入力中。
2. どこに出る？ 返信欄と関連情報。
3. 次は？ 「受信箱で会話を選ぶ」。

見比べた点　375では説明が長い段落、入口は全幅。広い2幅では短い入口。 状態・表示場所・会話の入口を確認。

画像から判断できないこと　状態の更新速度。

該当所見　S18。 [375px](screens/guide-presence-375.png)・[1024px](screens/guide-presence-1024.png)・[1440px](screens/guide-presence-1440.png)

### 状態037　guide-rules

管理者が最初の振り分けルールを設定する。

1. 今いくつ？ 0件。
2. 条件は？ 製品と件名、件名空欄なら全件。
3. なぜ保存できない？ ラベルまたは担当者を選ぶ必要がある。

見比べた点　375はフォームが1列、広い2幅にはその下の使用権限も見える。 空状態・条件の適用範囲・無効の理由を確認。

画像から判断できないこと　条件が競合したときの実行結果。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/guide-rules-375.png)・[1024px](screens/guide-rules-1024.png)・[1440px](screens/guide-rules-1440.png)

### 状態038　guide-snooze

担当者がスヌーズの使い方を確認する。

1. どこから？ 会話の「その他の操作」。
2. いつ戻る？ 日本時間の再表示日時で受信箱へ。
3. 途中で戻せる？ 同じ会話の「保留を解除」。

見比べた点　375のみ「受信箱で会話を選ぶ」が全幅。 開始・期限・解除の説明を確認。

画像から判断できないこと　実際の再表示時刻。

該当所見　S18。 [375px](screens/guide-snooze-375.png)・[1024px](screens/guide-snooze-1024.png)・[1440px](screens/guide-snooze-1440.png)

### 状態039　guide-spam

担当者が隔離された問い合わせを確認し復旧する。

1. どこを見る？ 「迷惑メールを開く」。
2. 誤判定なら？ 会話の操作から解除。
3. 権限は？ 追加権限なし。

見比べた点　375は入口が全幅、広い2幅は短い。 対象・復旧方法・次の入口を確認。

画像から判断できないこと　解除後の戻り先。

該当所見　S18。 [375px](screens/guide-spam-375.png)・[1024px](screens/guide-spam-1024.png)・[1440px](screens/guide-spam-1440.png)

### 状態040　guide-survey

管理者が解決アンケートの自動送信と文面を確認する。

1. いつ送る？ 問い合わせ完了時。
2. 誰が承認？ 全製品に対し佐藤 優、日時も表示。
3. 何が届く？ Deskの英語文面と回答用の専用リンク例。

見比べた点　375は見本まで、広い2幅では編集欄の冒頭も見える。 発火条件・承認範囲・送信文面を確認。

画像から判断できないこと　送信ごとに異なるリンクの発行と編集後の承認。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/guide-survey-375.png)・[1024px](screens/guide-survey-1024.png)・[1440px](screens/guide-survey-1440.png)

### 状態041　label-colors

管理者がラベルの名前・色・使用件数を一覧する。

1. どんな分類？ 再発行・社内確認・経理など6行。
2. 何件が対象？ 経理・請求は各2件。
3. 何ができる？ 色ボタンと「操作」、右上に追加。

見比べた点　長い名称が375で2行省略、他2幅では全文。 色・使用数・改名の発見性を確認。

画像から判断できないこと　タッチで省略部分を読む方法。

該当所見　S03、S04、S20。 [375px](screens/label-colors-375.png)・[1024px](screens/label-colors-1024.png)・[1440px](screens/label-colors-1440.png)

### 状態042　loop-account-menu

運営者がアカウント横の追加メニューを調べる。

1. どの場所？ 佐藤 優の横の「…」。
2. 何がある？ キーボード操作。
3. 手掛かりは？ 右端に「?」。

見比べた点　375はドロワー最下部、広い2幅はナビ下端。 起点・唯一の候補・現在の文脈を確認。

画像から判断できないこと　開いた後のショートカット説明。

該当所見　S23。 [375px](screens/loop-account-menu-375.png)・[1024px](screens/loop-account-menu-1024.png)・[1440px](screens/loop-account-menu-1440.png)

### 状態043　loop-label-new

担当者が会話でラベルを新規作成して付ける。

1. どの会話？ Slide #1、領収書の宛名。
2. 現在は？ 経理、請求、領収書の3つにチェック。
3. 追加する内容は？ 「契約更新」を入力し「作成して付ける」。

見比べた点　375では末尾の「ラベルを管理」が画面下で切れ、広い2幅は全体。 選択済み・新規名・次の操作の収まりを確認。

画像から判断できないこと　スクロール・ソフトキーボード表示時の到達性。

該当所見　S14。 [375px](screens/loop-label-new-375.png)・[1024px](screens/loop-label-new-1024.png)・[1440px](screens/loop-label-new-1440.png)

### 状態044　loop-mailbox-add

管理者がSlideに別の問い合わせ窓口を追加する。

1. 既存窓口は？ support@example.com。
2. 新規には何を書く？ 窓口アドレスの先頭、送信ドメイン。
3. どう確定？ 「窓口を追加」、直後に「取り消し」。

見比べた点　3幅とも既存の差出人設定と窓口追加を別カードに配置。 既存・追加の区分、入力単位、保存範囲を確認。

画像から判断できないこと　重複時のエラーと追加後の表示。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/loop-mailbox-add-375.png)・[1024px](screens/loop-mailbox-add-1024.png)・[1440px](screens/loop-mailbox-add-1440.png)

### 状態045　loop-operator-edit

管理者が運営者の表示名と権限を編集する。

1. 対象は？ 佐藤 優、管理者。
2. 権限を変えられる？ 最後の管理者なので先にほかの人を管理者にする旨。
3. どう保存？ 「運営者を保存」。

見比べた点　375は編集欄が縦長、広い2幅は一方を開いて他方の行も見える。 識別・権限制約・保存対象を確認。

画像から判断できないこと　最後の管理者を変更する場合の実際の検証。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/loop-operator-edit-375.png)・[1024px](screens/loop-operator-edit-1024.png)・[1440px](screens/loop-operator-edit-1440.png)

### 状態046　loop-rule-delete

管理者が振り分けルールの削除を最終確認する。

1. どのルール？ 1番目、全製品、領収書→請求。
2. 何をする？ 振り分けルールを削除。
3. 中止は？ 赤い実行に並ぶキャンセル。

見比べた点　375の背景は編集・新規欄、広い2幅は見出しと編集欄。 対象・削除操作・背景の識別を確認。

画像から判断できないこと　直前のスクロール位置が同一か、閉じて元の位置に戻るか。

該当所見　S15。 [375px](screens/loop-rule-delete-375.png)・[1024px](screens/loop-rule-delete-1024.png)・[1440px](screens/loop-rule-delete-1440.png)

### 状態047　loop-rule-edit

管理者が既存の「領収書」ルールを編集する。

1. 順番は？ 1番目。
2. 内容は？ 全製品、件名「領収書」にラベル「請求」。
3. どう処理する？ 変更を保存、取り消し、削除。

見比べた点　375の最初の画面は件名欄まで、広い2幅では変更操作まで見える。 対象条件・適用順序・保存の位置を確認。

画像から判断できないこと　保存結果と取り消し後の値。

該当所見　S15、S12。 [375px](screens/loop-rule-edit-375.png)・[1024px](screens/loop-rule-edit-1024.png)・[1440px](screens/loop-rule-edit-1440.png)

### 状態048　mailboxes

管理者が製品と受信窓口の対応を探す。

1. 何がある？ Desk と Slide の2行。
2. 宛先は？ desk@example.com と support@example.com。
3. 次は？ 行末の矢印と「プロダクトを追加」。

見比べた点　375は名前から矢印まで近く、1440では行末が遠い。 識別・対応関係・行の導線を確認。

画像から判断できないこと　行全体の押下範囲。

該当所見　S16。 [375px](screens/mailboxes-375.png)・[1024px](screens/mailboxes-1024.png)・[1440px](screens/mailboxes-1440.png)

### 状態049　menu-dev-ui-gallery-list-menu

UIを検証する人が一覧の状態見本を探す。

1. 何の画面？ UI部品見本。
2. どこを開いた？ 「一覧の操作」。
3. 候補は？ 「読み込み中・空の一覧を確認」。

見比べた点　375は検索・状態の一部に重なり、広い2幅では右端で展開。 現在地・開いた起点・状態見本への導線を確認。

画像から判断できないこと　遷移後の実際の状態。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-dev-ui-gallery-list-menu-375.png)・[1024px](screens/menu-dev-ui-gallery-list-menu-1024.png)・[1440px](screens/menu-dev-ui-gallery-list-menu-1440.png)

### 状態050　menu-extensions-auto-ack-choice-menu-0

管理者が製品別の自動受付返信を切り替える。

1. 現在の製品は？ Deskにチェック。
2. ほかに選べる？ Slide。
3. 何を比較する？ 下にDeskの文面、承認は上で全製品。

見比べた点　3幅ともトリガー直下、文面見出しに一部重なる。 対象と承認範囲の違い・選択印・位置を確認。

画像から判断できないこと　切替後の文面と未保存状態の扱い。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-extensions-auto-ack-choice-menu-0-375.png)・[1024px](screens/menu-extensions-auto-ack-choice-menu-0-1024.png)・[1440px](screens/menu-extensions-auto-ack-choice-menu-0-1440.png)

### 状態051　menu-extensions-canned-choice-menu-0

管理者が登録済み定型文の並びを選ぶ。

1. 何を並べる？ 保存済み定型文1件。
2. 現在は？ 「標準の順序」にチェック。
3. 代わりは？ 名前順。

見比べた点　375は説明文の上に重なるが、広い2幅では操作列下に収まる。 基準名・選択状態・文字の揃いを確認。

画像から判断できないこと　標準の具体的な規則。

該当所見　S12。 [375px](screens/menu-extensions-canned-choice-menu-0-375.png)・[1024px](screens/menu-extensions-canned-choice-menu-0-1024.png)・[1440px](screens/menu-extensions-canned-choice-menu-0-1440.png)

### 状態052　menu-extensions-issues-link-1-operation-articles-articles.suggest

担当者が会話から記事候補を作る。

1. 元は？ Slide #1 領収書の宛名。
2. 何を書く？ 記事にする内容。
3. 次は？ 「記事の候補に追加」、下に別作業のGitHub Issue。

見比べた点　375・1024は関連情報内、1440は本文横。 元の会話・公開段階・他作業との区切りを確認。

画像から判断できないこと　候補作成後のレビューや公開操作。

該当所見　S21。 [375px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-375.png)・[1024px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-1024.png)・[1440px](screens/menu-extensions-issues-link-1-operation-articles-articles.suggest-1440.png)

### 状態053　menu-extensions-issues-link-1-operation-issues-issues.preview

担当者が複数の拡張を開いた会話からGitHub課題を起票する。

1. 元の問い合わせは？ #1 領収書の宛名。
2. 投稿先は？ example/helpdesk。
3. 次の段階は？ 公開する要約を入力し「起票内容を確認」。

見比べた点　375では入力窓が起点より上、1024は下側、1440は右列内。 対象・投稿先・確認への導線を確認。

画像から判断できないこと　入力後の確認、投稿時の権限。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-375.png)・[1024px](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-1024.png)・[1440px](screens/menu-extensions-issues-link-1-operation-issues-issues.preview-1440.png)

### 状態054　menu-extensions-issues-link-1-operation-merge-merge.combine

担当者が別の拡張と並ぶ関連情報内で会話を統合する。

1. 元は？ #1 領収書の宛名。
2. 先は？ #2 ワークスペースの招待メール。
3. 次の操作は？ 統合内容を確認、下に別の対象 #42 を選ぶ欄。

見比べた点　375・1024は右パネル、1440は常設右列。どの幅でも別件の課題選択が直下に残る。 対象の方向・確定手順・近くの別作業との関係を確認。

画像から判断できないこと　統合確認画面の内容。

該当所見　S21。 [375px](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-375.png)・[1024px](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-1024.png)・[1440px](screens/menu-extensions-issues-link-1-operation-merge-merge.combine-1440.png)

### 状態055　menu-extensions-issues-link-1-reply-templates

担当者が複数拡張のある会話で定型文の下書きを作る。

1. 誰の会話？ Slide #1 山田 花。
2. 何を差し込む？ 山田 花とSlideを含む受付英文。
3. どう適用？ 「定型文から下書きを作成」。

見比べた点　375は返信欄の上、広い2幅ではボタンの下。 宛先・差し込み済みの見本・実行段階を確認。

画像から判断できないこと　適用後の編集可否。

該当所見　S27。 [375px](screens/menu-extensions-issues-link-1-reply-templates-375.png)・[1024px](screens/menu-extensions-issues-link-1-reply-templates-1024.png)・[1440px](screens/menu-extensions-issues-link-1-reply-templates-1440.png)

### 状態056　menu-extensions-rules-choice-menu-0

管理者が振り分けルールの対象製品を選ぶ。

1. 現在は？ 「すべてのプロダクトに適用」にチェック。
2. 候補は？ DeskとSlide。
3. いつ保存できる？ ラベルまたは担当者を選ぶと説明。

見比べた点　3幅とも製品トリガー直下、件名入力に重なる。 範囲・選択印・保存要件を確認。

画像から判断できないこと　製品の切替後の保持項目。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-extensions-rules-choice-menu-0-375.png)・[1024px](screens/menu-extensions-rules-choice-menu-0-1024.png)・[1440px](screens/menu-extensions-rules-choice-menu-0-1440.png)

### 状態057　menu-extensions-rules-choice-menu-1

管理者がルールで付けるラベルを選ぶ。

1. 現在は？ 「付けない」にチェック。
2. 候補は？ 再発行から領収書まで6種。
3. 管理するには？ 候補末尾の「ラベルを管理」。

見比べた点　375は起点より上、広い2幅は下に展開。全候補が画像内。 未設定・候補名の全文・追加管理への導線を確認。

画像から判断できないこと　管理画面から戻った際の入力保持。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-extensions-rules-choice-menu-1-375.png)・[1024px](screens/menu-extensions-rules-choice-menu-1-1024.png)・[1440px](screens/menu-extensions-rules-choice-menu-1-1440.png)

### 状態058　menu-extensions-survey-choice-menu-0

管理者が製品別アンケートの送信文面を選ぶ。

1. 今見ているのは？ Deskにチェック。
2. 代わりは？ Slide。
3. 承認と結果の範囲は？ 上は全製品、下はDeskの例文。

見比べた点　3幅とも短い選択肢が起点の直下で開く。 対象・選択印・プレビューとの関係を確認。

画像から判断できないこと　製品切替時のプレビュー更新。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-extensions-survey-choice-menu-0-375.png)・[1024px](screens/menu-extensions-survey-choice-menu-0-1024.png)・[1440px](screens/menu-extensions-survey-choice-menu-0-1440.png)

### 状態059　menu-home-account-menu

運営者が受信箱からキーボード操作の案内を探す。

1. 入口は？ アカウント横の「…」。
2. 開いた項目は？ 「キーボード操作 ?」。
3. どこにいる？ 背後は未対応7件。

見比べた点　375はドロワー端から浮き、1024は小型ナビ端、1440は名前の横。 位置・文脈・候補のフォーカスを確認。

画像から判断できないこと　再度閉じたときのフォーカス。

該当所見　S23。 [375px](screens/menu-home-account-menu-375.png)・[1024px](screens/menu-home-account-menu-1024.png)・[1440px](screens/menu-home-account-menu-1440.png)

### 状態060　menu-home-bulk-label

担当者が未対応7件に一括でラベルを付ける。

1. 何件？ 「7件を選択中」。
2. 現在は？ 各候補の「−」は一部の会話に付与済み。
3. 選ぶと？ 選択中のすべてにつけると脚注に明記。

見比べた点　375はボタン列・会話を大きく覆い、広い2幅は右側の一部を残す。 対象件数・部分選択・適用範囲を確認。

画像から判断できないこと　実行後の知らせと取り消し。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-home-bulk-label-375.png)・[1024px](screens/menu-home-bulk-label-1024.png)・[1440px](screens/menu-home-bulk-label-1440.png)

### 状態061　menu-home-product-switcher

担当者が未対応一覧の対象製品を切り替える。

1. 現在は？ すべてのプロダクトにチェック。
2. 選択肢は？ Desk・Slide。
3. どの一覧？ 未対応7件。

見比べた点　375はドロワー内、1024は小型ナビ、1440は製品名を見せるナビ。 範囲・選択印・一覧との対応を確認。

画像から判断できないこと　切替後の件数とURL。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-home-product-switcher-375.png)・[1024px](screens/menu-home-product-switcher-1024.png)・[1440px](screens/menu-home-product-switcher-1440.png)

### 状態062　menu-label-fd3f5651-bulk-assignee

担当者が「請求で絞った未対応」の会話を担当者を一括指定する。

1. 対象は？ 請求で絞った未対応の2件。月額プラン明細と領収書の宛名。
2. 今の表示は？ 1件には佐藤の印、もう1件は空の輪。候補には部分選択の記号が見えない。
3. 選べる対象は？ 佐藤 優と森 直子の2人。

見比べた点　375では操作が数行、1024・1440では候補と対象行が横に見える。 選択件数・行の担当印・候補のチェックを照合。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

該当所見　S13。 [375px](screens/menu-label-fd3f5651-bulk-assignee-375.png)・[1024px](screens/menu-label-fd3f5651-bulk-assignee-1024.png)・[1440px](screens/menu-label-fd3f5651-bulk-assignee-1440.png)

### 状態063　menu-label-fd3f5651-bulk-label

担当者が「請求で絞った未対応」の会話をラベルを一括指定する。

1. 対象は？ 請求で絞った未対応の2件。月額プラン明細と領収書の宛名。
2. 付与状況は？ 請求はチェック、経理・領収書など一部の会話だけに付くものは「−」。
3. 選べる対象は？ 再発行・社内確認・経理・請求など6種と管理入口。

見比べた点　375では候補が対象行を覆い、広い2幅では行の一部も読める。 対象件数・ラベル名・付与済みの記号を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-label-fd3f5651-bulk-label-375.png)・[1024px](screens/menu-label-fd3f5651-bulk-label-1024.png)・[1440px](screens/menu-label-fd3f5651-bulk-label-1440.png)

### 状態064　menu-label-fd3f5651-choice-menu-0

担当者が「請求で絞った未対応」の会話を状態で絞り込みする。

1. 対象は？ 請求で絞った未対応の2件。月額プラン明細と領収書の宛名。
2. 今の表示は？ 未対応。
3. 選べる対象は？ 未対応・返信待ち・完了・迷惑メール・すべて。

見比べた点　375は一覧左、広い2幅は右端で絞り込みの中に状態候補が展開。 状態名・選択印・検索への重なりを確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-label-fd3f5651-choice-menu-0-375.png)・[1024px](screens/menu-label-fd3f5651-choice-menu-0-1024.png)・[1440px](screens/menu-label-fd3f5651-choice-menu-0-1440.png)

### 状態065　menu-label-fd3f5651-choice-menu-1

担当者が「請求で絞った未対応」の会話を製品で絞り込みする。

1. 対象は？ 請求で絞った未対応の2件。月額プラン明細と領収書の宛名。
2. 今の表示は？ すべて。
3. 選べる対象は？ すべて・Desk・Slide。

見比べた点　375は左側、広い2幅は右側。いずれも製品欄の直下。 製品印・現在値・親メニューの位置を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-label-fd3f5651-choice-menu-1-375.png)・[1024px](screens/menu-label-fd3f5651-choice-menu-1-1024.png)・[1440px](screens/menu-label-fd3f5651-choice-menu-1-1440.png)

### 状態066　menu-label-fd3f5651-choice-menu-2

担当者が「請求で絞った未対応」の会話をラベルで絞り込みする。

1. 対象は？ 請求で絞った未対応の2件。月額プラン明細と領収書の宛名。
2. 今の表示は？ 請求。
3. 選べる対象は？ すべてのラベル、各ラベルと管理入口。

見比べた点　375はラベル欄より上に開き他の絞り込みがほぼ隠れる。広い2幅では下に展開。 条件の意味・選択印・対象を見ながら選べるかを確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

該当所見　S14。 [375px](screens/menu-label-fd3f5651-choice-menu-2-375.png)・[1024px](screens/menu-label-fd3f5651-choice-menu-2-1024.png)・[1440px](screens/menu-label-fd3f5651-choice-menu-2-1440.png)

### 状態067　menu-label-fd3f5651-choice-menu-3

担当者が「請求で絞った未対応」の会話を並び順を変更する。

1. 対象は？ 請求で絞った未対応の2件。月額プラン明細と領収書の宛名。
2. 今の表示は？ 待たせている順。
3. 選べる対象は？ 新しい順も選べる。

見比べた点　375は検索の下、広い2幅は検索の右。メニューが2案に収まる。 基準名・現在値・行の時刻表現を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-label-fd3f5651-choice-menu-3-375.png)・[1024px](screens/menu-label-fd3f5651-choice-menu-3-1024.png)・[1440px](screens/menu-label-fd3f5651-choice-menu-3-1440.png)

### 状態068　menu-label-fd3f5651-filter-assignee

担当者が「請求で絞った未対応」の会話を担当者で絞り込みする。

1. 対象は？ 請求で絞った未対応の2件。月額プラン明細と領収書の宛名。
2. 今の表示は？ すべて。
3. 選べる対象は？ すべて・佐藤 優・森 直子。

見比べた点　375は左側、広い2幅は右側に開き、3候補を読める。 担当名・選択印・人以外の候補の外観を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

該当所見　S29。 [375px](screens/menu-label-fd3f5651-filter-assignee-375.png)・[1024px](screens/menu-label-fd3f5651-filter-assignee-1024.png)・[1440px](screens/menu-label-fd3f5651-filter-assignee-1440.png)

### 状態069　menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee

担当者が「Desk・自分の担当」の会話を担当者を一括指定する。

1. 対象は？ Desk・自分の担当の1件。請求書の送付先を確認する #3。
2. 今の表示は？ 佐藤 優にチェック。
3. 選べる対象は？ 佐藤 優と森 直子の2人。

見比べた点　375では操作が数行、1024・1440では候補と対象行が横に見える。 選択件数・行の担当印・候補のチェックを照合。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-375.png)・[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-1024.png)・[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-assignee-1440.png)

### 状態070　menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label

担当者が「Desk・自分の担当」の会話をラベルを一括指定する。

1. 対象は？ Desk・自分の担当の1件。請求書の送付先を確認する #3。
2. 付与状況は？ 各候補に付与済みのチェックは見えない。
3. 選べる対象は？ 再発行・社内確認・経理・請求など6種と管理入口。

見比べた点　375では候補が対象行を覆い、広い2幅では行の一部も読める。 対象件数・ラベル名・付与済みの記号を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-375.png)・[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-1024.png)・[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-bulk-label-1440.png)

### 状態071　menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0

担当者が「Desk・自分の担当」の会話を状態で絞り込みする。

1. 対象は？ Desk・自分の担当の1件。請求書の送付先を確認する #3。
2. 今の表示は？ すべて。
3. 選べる対象は？ 未対応・返信待ち・完了・迷惑メール・すべて。

見比べた点　375は一覧左、広い2幅は右端で絞り込みの中に状態候補が展開。 状態名・選択印・検索への重なりを確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-375.png)・[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-1024.png)・[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-0-1440.png)

### 状態072　menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1

担当者が「Desk・自分の担当」の会話を製品で絞り込みする。

1. 対象は？ Desk・自分の担当の1件。請求書の送付先を確認する #3。
2. 今の表示は？ Desk。
3. 選べる対象は？ すべて・Desk・Slide。

見比べた点　375は左側、広い2幅は右側。いずれも製品欄の直下。 製品印・現在値・親メニューの位置を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-375.png)・[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-1024.png)・[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-1-1440.png)

### 状態073　menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2

担当者が「Desk・自分の担当」の会話をラベルで絞り込みする。

1. 対象は？ Desk・自分の担当の1件。請求書の送付先を確認する #3。
2. 今の表示は？ すべてのラベル。
3. 選べる対象は？ すべてのラベル、各ラベルと管理入口。

見比べた点　375はラベル欄より上に開き他の絞り込みがほぼ隠れる。広い2幅では下に展開。 条件の意味・選択印・対象を見ながら選べるかを確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

該当所見　S14。 [375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-375.png)・[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-1024.png)・[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-2-1440.png)

### 状態074　menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3

担当者が「Desk・自分の担当」の会話を並び順を変更する。

1. 対象は？ Desk・自分の担当の1件。請求書の送付先を確認する #3。
2. 今の表示は？ 待たせている順。
3. 選べる対象は？ 新しい順も選べる。

見比べた点　375は検索の下、広い2幅は検索の右。メニューが2案に収まる。 基準名・現在値・行の時刻表現を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-375.png)・[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-1024.png)・[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-choice-menu-3-1440.png)

### 状態075　menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee

担当者が「Desk・自分の担当」の会話を担当者で絞り込みする。

1. 対象は？ Desk・自分の担当の1件。請求書の送付先を確認する #3。
2. 今の表示は？ 佐藤 優。
3. 選べる対象は？ すべて・佐藤 優・森 直子。

見比べた点　375は左側、広い2幅は右側に開き、3候補を読める。 担当名・選択印・人以外の候補の外観を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

該当所見　S29。 [375px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-375.png)・[1024px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-1024.png)・[1440px](screens/menu-product-desk-assignee-sato-40example-com-00affaac-filter-assignee-1440.png)

### 状態076　menu-settings-labels-add-label

管理者が分類用ラベルを追加する。

1. どこで作るか？ 一覧右上から開いた小窓。
2. 入力条件は？ 名前は20字まで。
3. 次は？ 空欄の下に「追加する」。

見比べた点　3幅とも追加の起点と入力欄が画面内。 位置・制限・空欄時の強さを確認。既存ラベルと比較できる。

画像から判断できないこと　作成後の反映と重複名エラー。

該当所見　S05。 [375px](screens/menu-settings-labels-add-label-375.png)・[1024px](screens/menu-settings-labels-add-label-1024.png)・[1440px](screens/menu-settings-labels-add-label-1440.png)

### 状態077　menu-settings-labels-label-actions-0

管理者が「再発行」ラベルの整理方法を選ぶ。

1. 対象は？ 再発行、1件が利用。
2. 現在の統合先は？ 社内確認と表示。
3. ほかの操作は？ 別のラベルにまとめる、または削除。

見比べた点　3幅とも対象行の「操作」に青い縁が付き、行の近くにメニューが開く。 対象名・初期の統合先・改名の入口を確認。

画像から判断できないこと　候補変更後の確認と取消の結果。

該当所見　S25、S20。 [375px](screens/menu-settings-labels-label-actions-0-375.png)・[1024px](screens/menu-settings-labels-label-actions-0-1024.png)・[1440px](screens/menu-settings-labels-label-actions-0-1440.png)

### 状態078　menu-settings-labels-label-actions-1

管理者が「社内確認」ラベルの整理方法を選ぶ。

1. 対象は？ 社内確認、1件が利用。
2. 現在の統合先は？ 再発行と表示。
3. ほかの操作は？ 別のラベルにまとめる、または削除。

見比べた点　3幅とも対象行の「操作」に青い縁が付き、行の近くにメニューが開く。 対象名・初期の統合先・改名の入口を確認。

画像から判断できないこと　候補変更後の確認と取消の結果。

該当所見　S25、S20。 [375px](screens/menu-settings-labels-label-actions-1-375.png)・[1024px](screens/menu-settings-labels-label-actions-1-1024.png)・[1440px](screens/menu-settings-labels-label-actions-1-1440.png)

### 状態079　menu-settings-labels-label-actions-2

管理者が「経理」ラベルの整理方法を選ぶ。

1. 対象は？ 経理、2件が利用。
2. 現在の統合先は？ 再発行と表示。
3. ほかの操作は？ 別のラベルにまとめる、または削除。

見比べた点　3幅とも対象行の「操作」に青い縁が付き、行の近くにメニューが開く。 対象名・初期の統合先・改名の入口を確認。

画像から判断できないこと　候補変更後の確認と取消の結果。

該当所見　S25、S20。 [375px](screens/menu-settings-labels-label-actions-2-375.png)・[1024px](screens/menu-settings-labels-label-actions-2-1024.png)・[1440px](screens/menu-settings-labels-label-actions-2-1440.png)

### 状態080　menu-settings-labels-label-actions-3

管理者が「請求」ラベルの整理方法を選ぶ。

1. 対象は？ 請求、2件が利用。
2. 現在の統合先は？ 再発行と表示。
3. ほかの操作は？ 別のラベルにまとめる、または削除。

見比べた点　3幅とも対象行の「操作」に青い縁が付き、行の近くにメニューが開く。 対象名・初期の統合先・改名の入口を確認。

画像から判断できないこと　候補変更後の確認と取消の結果。

該当所見　S25、S20。 [375px](screens/menu-settings-labels-label-actions-3-375.png)・[1024px](screens/menu-settings-labels-label-actions-3-1024.png)・[1440px](screens/menu-settings-labels-label-actions-3-1440.png)

### 状態081　menu-settings-labels-label-actions-4

管理者が「長期契約の更新手続きについて」ラベルの整理方法を選ぶ。

1. 対象は？ 長期契約の更新手続きについて、1件が利用。
2. 現在の統合先は？ 再発行と表示。
3. ほかの操作は？ 別のラベルにまとめる、または削除。

見比べた点　375では行名が途中省略、小窓の見出しは全文。広い2幅は一覧でも全文。 対象名・初期の統合先・改名の入口を確認。

画像から判断できないこと　候補変更後の確認と取消の結果。

該当所見　S25、S20、S04。 [375px](screens/menu-settings-labels-label-actions-4-375.png)・[1024px](screens/menu-settings-labels-label-actions-4-1024.png)・[1440px](screens/menu-settings-labels-label-actions-4-1440.png)

### 状態082　menu-settings-labels-label-actions-5

管理者が「領収書」ラベルの整理方法を選ぶ。

1. 対象は？ 領収書、1件が利用。
2. 現在の統合先は？ 再発行と表示。
3. ほかの操作は？ 別のラベルにまとめる、または削除。

見比べた点　3幅とも対象行の「操作」に青い縁が付き、行の近くにメニューが開く。 対象名・初期の統合先・改名の入口を確認。

画像から判断できないこと　候補変更後の確認と取消の結果。

該当所見　S25、S20。 [375px](screens/menu-settings-labels-label-actions-5-375.png)・[1024px](screens/menu-settings-labels-label-actions-5-1024.png)・[1440px](screens/menu-settings-labels-label-actions-5-1440.png)

### 状態083　menu-settings-labels-label-color-0

管理者が「再発行」の識別色を変更する。

1. どの行？ 再発行、使用中1件。
2. 現在色は？ 下段3番目の茶にチェック。
3. 何色から選べる？ 4列2段に8色。左上の枠と選択チェックを見分ける。

見比べた点　3幅とも対象行の左の色ボタン下に展開し、最後の行でも下端に収まる。 対象行・現色とフォーカス・色名の有無を確認。

画像から判断できないこと　音声読み上げ・色変更後の通知。

該当所見　S03。 [375px](screens/menu-settings-labels-label-color-0-375.png)・[1024px](screens/menu-settings-labels-label-color-0-1024.png)・[1440px](screens/menu-settings-labels-label-color-0-1440.png)

### 状態084　menu-settings-labels-label-color-1

管理者が「社内確認」の識別色を変更する。

1. どの行？ 社内確認、使用中1件。
2. 現在色は？ 上段右端の桃にチェック。
3. 何色から選べる？ 4列2段に8色。左上の枠と選択チェックを見分ける。

見比べた点　3幅とも対象行の左の色ボタン下に展開し、最後の行でも下端に収まる。 対象行・現色とフォーカス・色名の有無を確認。

画像から判断できないこと　音声読み上げ・色変更後の通知。

該当所見　S03。 [375px](screens/menu-settings-labels-label-color-1-375.png)・[1024px](screens/menu-settings-labels-label-color-1-1024.png)・[1440px](screens/menu-settings-labels-label-color-1-1440.png)

### 状態085　menu-settings-labels-label-color-2

管理者が「経理」の識別色を変更する。

1. どの行？ 経理、使用中2件。
2. 現在色は？ 下段右端の灰にチェック。
3. 何色から選べる？ 4列2段に8色。左上の枠と選択チェックを見分ける。

見比べた点　3幅とも対象行の左の色ボタン下に展開し、最後の行でも下端に収まる。 対象行・現色とフォーカス・色名の有無を確認。

画像から判断できないこと　音声読み上げ・色変更後の通知。

該当所見　S03。 [375px](screens/menu-settings-labels-label-color-2-375.png)・[1024px](screens/menu-settings-labels-label-color-2-1024.png)・[1440px](screens/menu-settings-labels-label-color-2-1440.png)

### 状態086　menu-settings-labels-label-color-3

管理者が「請求」の識別色を変更する。

1. どの行？ 請求、使用中2件。
2. 現在色は？ 上段左端の青にチェック。
3. 何色から選べる？ 4列2段に8色。左上の枠と選択チェックを見分ける。

見比べた点　3幅とも対象行の左の色ボタン下に展開し、最後の行でも下端に収まる。 対象行・現色とフォーカス・色名の有無を確認。

画像から判断できないこと　音声読み上げ・色変更後の通知。

該当所見　S03。 [375px](screens/menu-settings-labels-label-color-3-375.png)・[1024px](screens/menu-settings-labels-label-color-3-1024.png)・[1440px](screens/menu-settings-labels-label-color-3-1440.png)

### 状態087　menu-settings-labels-label-color-4

管理者が「長期契約の更新手続きについて」の識別色を変更する。

1. どの行？ 長期契約の更新手続きについて、使用中1件。
2. 現在色は？ 下段2番目の黄緑にチェック。
3. 何色から選べる？ 4列2段に8色。左上の枠と選択チェックを見分ける。

見比べた点　375では対象名が2行省略。広い2幅は名前が全文。 対象行・現色とフォーカス・色名の有無を確認。

画像から判断できないこと　音声読み上げ・色変更後の通知。

該当所見　S03、S04。 [375px](screens/menu-settings-labels-label-color-4-375.png)・[1024px](screens/menu-settings-labels-label-color-4-1024.png)・[1440px](screens/menu-settings-labels-label-color-4-1440.png)

### 状態088　menu-settings-labels-label-color-5

管理者が「領収書」の識別色を変更する。

1. どの行？ 領収書、使用中1件。
2. 現在色は？ 上段2番目の水色にチェック。
3. 何色から選べる？ 4列2段に8色。左上の枠と選択チェックを見分ける。

見比べた点　3幅とも対象行の左の色ボタン下に展開し、最後の行でも下端に収まる。 対象行・現色とフォーカス・色名の有無を確認。

画像から判断できないこと　音声読み上げ・色変更後の通知。

該当所見　S03。 [375px](screens/menu-settings-labels-label-color-5-375.png)・[1024px](screens/menu-settings-labels-label-color-5-1024.png)・[1440px](screens/menu-settings-labels-label-color-5-1440.png)

### 状態089　menu-settings-labels-label-rename-0

管理者が「再発行」の名前を変更する。

1. どれを変える？ 「現在の名前」に再発行。
2. 何を入れる？ 新しい名前は20字まで。欄の初期値は再発行。
3. どう進む？ 「名前を変更」「取り消し」。

見比べた点　375では小窓が幅の大半を使う。1024・1440では対象名の下に収まる。 名前の再確認・字数制限・変更前の実行状態を確認。

画像から判断できないこと　同じ名前を確定した結果と重複名の検証。

該当所見　S05、S20。 [375px](screens/menu-settings-labels-label-rename-0-375.png)・[1024px](screens/menu-settings-labels-label-rename-0-1024.png)・[1440px](screens/menu-settings-labels-label-rename-0-1440.png)

### 状態090　menu-settings-labels-label-rename-1

管理者が「社内確認」の名前を変更する。

1. どれを変える？ 「現在の名前」に社内確認。
2. 何を入れる？ 新しい名前は20字まで。欄の初期値は社内確認。
3. どう進む？ 「名前を変更」「取り消し」。

見比べた点　375では小窓が幅の大半を使う。1024・1440では対象名の下に収まる。 名前の再確認・字数制限・変更前の実行状態を確認。

画像から判断できないこと　同じ名前を確定した結果と重複名の検証。

該当所見　S05、S20。 [375px](screens/menu-settings-labels-label-rename-1-375.png)・[1024px](screens/menu-settings-labels-label-rename-1-1024.png)・[1440px](screens/menu-settings-labels-label-rename-1-1440.png)

### 状態091　menu-settings-labels-label-rename-2

管理者が「経理」の名前を変更する。

1. どれを変える？ 「現在の名前」に経理。
2. 何を入れる？ 新しい名前は20字まで。欄の初期値は経理。
3. どう進む？ 「名前を変更」「取り消し」。

見比べた点　375では小窓が幅の大半を使う。1024・1440では対象名の下に収まる。 名前の再確認・字数制限・変更前の実行状態を確認。

画像から判断できないこと　同じ名前を確定した結果と重複名の検証。

該当所見　S05、S20。 [375px](screens/menu-settings-labels-label-rename-2-375.png)・[1024px](screens/menu-settings-labels-label-rename-2-1024.png)・[1440px](screens/menu-settings-labels-label-rename-2-1440.png)

### 状態092　menu-settings-labels-label-rename-3

管理者が「請求」の名前を変更する。

1. どれを変える？ 「現在の名前」に請求。
2. 何を入れる？ 新しい名前は20字まで。欄の初期値は請求。
3. どう進む？ 「名前を変更」「取り消し」。

見比べた点　375では小窓が幅の大半を使う。1024・1440では対象名の下に収まる。 名前の再確認・字数制限・変更前の実行状態を確認。

画像から判断できないこと　同じ名前を確定した結果と重複名の検証。

該当所見　S05、S20。 [375px](screens/menu-settings-labels-label-rename-3-375.png)・[1024px](screens/menu-settings-labels-label-rename-3-1024.png)・[1440px](screens/menu-settings-labels-label-rename-3-1440.png)

### 状態093　menu-settings-labels-label-rename-4

管理者が「長期契約の更新手続きについて」の名前を変更する。

1. どれを変える？ 「現在の名前」に長期契約の更新手続きについて。
2. 何を入れる？ 新しい名前は20字まで。欄の初期値は長期契約の更新手続きについて。
3. どう進む？ 「名前を変更」「取り消し」。

見比べた点　375で元の行は省略だが小窓は名前が全文。両デスクトップは元の行も全文。 名前の再確認・字数制限・変更前の実行状態を確認。

画像から判断できないこと　同じ名前を確定した結果と重複名の検証。

該当所見　S05、S20、S04。 [375px](screens/menu-settings-labels-label-rename-4-375.png)・[1024px](screens/menu-settings-labels-label-rename-4-1024.png)・[1440px](screens/menu-settings-labels-label-rename-4-1440.png)

### 状態094　menu-settings-labels-label-rename-5

管理者が「領収書」の名前を変更する。

1. どれを変える？ 「現在の名前」に領収書。
2. 何を入れる？ 新しい名前は20字まで。欄の初期値は領収書。
3. どう進む？ 「名前を変更」「取り消し」。

見比べた点　375では小窓が幅の大半を使う。1024・1440では対象名の下に収まる。 名前の再確認・字数制限・変更前の実行状態を確認。

画像から判断できないこと　同じ名前を確定した結果と重複名の検証。

該当所見　S05、S20。 [375px](screens/menu-settings-labels-label-rename-5-375.png)・[1024px](screens/menu-settings-labels-label-rename-5-1024.png)・[1440px](screens/menu-settings-labels-label-rename-5-1440.png)

### 状態095　menu-settings-operators-choice-menu-0

管理者が運営者一覧の表示順を選ぶ。

1. 何人いる？ 佐藤 優と森 直子の2人。
2. 今の並びは？ 「標準の順序」にチェック。
3. 何に切替可能？ 名前順。権限絞り込みは「すべて」。

見比べた点　375はメニューが1行目の一部と重なる、広い2幅は短いリスト上に展開。 対象人数・選択印・基準名を確認。

画像から判断できないこと　標準の規則、名前順の読み。

該当所見　S12。 [375px](screens/menu-settings-operators-choice-menu-0-375.png)・[1024px](screens/menu-settings-operators-choice-menu-0-1024.png)・[1440px](screens/menu-settings-operators-choice-menu-0-1440.png)

### 状態096　menu-status-spam-48e45b08-bulk-assignee

担当者が「迷惑メール」の会話を担当者を一括指定する。

1. 対象は？ 迷惑メールの1件。未承諾の営業案内 #9。
2. 今の表示は？ どちらにもチェックなし。
3. 選べる対象は？ 佐藤 優と森 直子の2人。

見比べた点　375では操作が数行、1024・1440では候補と対象行が横に見える。 選択件数・行の担当印・候補のチェックを照合。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-status-spam-48e45b08-bulk-assignee-375.png)・[1024px](screens/menu-status-spam-48e45b08-bulk-assignee-1024.png)・[1440px](screens/menu-status-spam-48e45b08-bulk-assignee-1440.png)

### 状態097　menu-status-spam-48e45b08-bulk-label

担当者が「迷惑メール」の会話をラベルを一括指定する。

1. 対象は？ 迷惑メールの1件。未承諾の営業案内 #9。
2. 付与状況は？ 各候補に付与済みのチェックは見えない。
3. 選べる対象は？ 再発行・社内確認・経理・請求など6種と管理入口。

見比べた点　375では候補が対象行を覆い、広い2幅では行の一部も読める。 対象件数・ラベル名・付与済みの記号を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-status-spam-48e45b08-bulk-label-375.png)・[1024px](screens/menu-status-spam-48e45b08-bulk-label-1024.png)・[1440px](screens/menu-status-spam-48e45b08-bulk-label-1440.png)

### 状態098　menu-status-spam-48e45b08-choice-menu-0

担当者が「迷惑メール」の会話を状態で絞り込みする。

1. 対象は？ 迷惑メールの1件。未承諾の営業案内 #9。
2. 今の表示は？ 迷惑メール。
3. 選べる対象は？ 未対応・返信待ち・完了・迷惑メール・すべて。

見比べた点　375は一覧左、広い2幅は右端で絞り込みの中に状態候補が展開。 状態名・選択印・検索への重なりを確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-status-spam-48e45b08-choice-menu-0-375.png)・[1024px](screens/menu-status-spam-48e45b08-choice-menu-0-1024.png)・[1440px](screens/menu-status-spam-48e45b08-choice-menu-0-1440.png)

### 状態099　menu-status-spam-48e45b08-choice-menu-1

担当者が「迷惑メール」の会話を製品で絞り込みする。

1. 対象は？ 迷惑メールの1件。未承諾の営業案内 #9。
2. 今の表示は？ すべて。
3. 選べる対象は？ すべて・Desk・Slide。

見比べた点　375は左側、広い2幅は右側。いずれも製品欄の直下。 製品印・現在値・親メニューの位置を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-status-spam-48e45b08-choice-menu-1-375.png)・[1024px](screens/menu-status-spam-48e45b08-choice-menu-1-1024.png)・[1440px](screens/menu-status-spam-48e45b08-choice-menu-1-1440.png)

### 状態100　menu-status-spam-48e45b08-choice-menu-2

担当者が「迷惑メール」の会話をラベルで絞り込みする。

1. 対象は？ 迷惑メールの1件。未承諾の営業案内 #9。
2. 今の表示は？ すべてのラベル。
3. 選べる対象は？ すべてのラベル、各ラベルと管理入口。

見比べた点　375はラベル欄より上に開き他の絞り込みがほぼ隠れる。広い2幅では下に展開。 条件の意味・選択印・対象を見ながら選べるかを確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

該当所見　S14。 [375px](screens/menu-status-spam-48e45b08-choice-menu-2-375.png)・[1024px](screens/menu-status-spam-48e45b08-choice-menu-2-1024.png)・[1440px](screens/menu-status-spam-48e45b08-choice-menu-2-1440.png)

### 状態101　menu-status-spam-48e45b08-choice-menu-3

担当者が「迷惑メール」の会話を並び順を変更する。

1. 対象は？ 迷惑メールの1件。未承諾の営業案内 #9。
2. 今の表示は？ 待たせている順。
3. 選べる対象は？ 新しい順も選べる。

見比べた点　375は検索の下、広い2幅は検索の右。メニューが2案に収まる。 基準名・現在値・行の時刻表現を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

該当所見　S11。 [375px](screens/menu-status-spam-48e45b08-choice-menu-3-375.png)・[1024px](screens/menu-status-spam-48e45b08-choice-menu-3-1024.png)・[1440px](screens/menu-status-spam-48e45b08-choice-menu-3-1440.png)

### 状態102　menu-status-spam-48e45b08-filter-assignee

担当者が「迷惑メール」の会話を担当者で絞り込みする。

1. 対象は？ 迷惑メールの1件。未承諾の営業案内 #9。
2. 今の表示は？ すべて。
3. 選べる対象は？ すべて・佐藤 優・森 直子。

見比べた点　375は左側、広い2幅は右側に開き、3候補を読める。 担当名・選択印・人以外の候補の外観を確認。

画像から判断できないこと　適用後の件数、選択状態、URLとフォーカスの復帰。

該当所見　S29。 [375px](screens/menu-status-spam-48e45b08-filter-assignee-375.png)・[1024px](screens/menu-status-spam-48e45b08-filter-assignee-1024.png)・[1440px](screens/menu-status-spam-48e45b08-filter-assignee-1440.png)

### 状態103　menu-tokens-choice-menu-0

担当者が発行済みAPIトークンの並び順を変える。

1. 何が発行済み？ 閲覧権限の「運営用CLI」1件。
2. 今の並びは？ 標準の順序。
3. どんな選択？ 名前順。下には新規発行フォーム。

見比べた点　375では小窓が発行済み行の右側に重なる。広い2幅では対象行の上。 既存と新規・選択印・基準名を確認。

画像から判断できないこと　実際の並び替え順、失効確認。

該当所見　S12。 [375px](screens/menu-tokens-choice-menu-0-375.png)・[1024px](screens/menu-tokens-choice-menu-0-1024.png)・[1440px](screens/menu-tokens-choice-menu-0-1440.png)

### 状態104　menu-view-feedback-834dd78f-bulk-label

担当者がフィードバックにラベルを付ける。

1. 何件？ フィードバックの1件を選択中。
2. 何を選べる？ 再発行から領収書までの分類。
3. 別の操作は？ 管理入口と、ツールバーに迷惑メールにする操作。

見比べた点　375は候補が対象行をほぼ覆う。広い2幅は受付済み表示が右に残る。 対象・分類候補・選択時の業務文脈を確認。

画像から判断できないこと　付与後の表示と取り消し。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/menu-view-feedback-834dd78f-bulk-label-375.png)・[1024px](screens/menu-view-feedback-834dd78f-bulk-label-1024.png)・[1440px](screens/menu-view-feedback-834dd78f-bulk-label-1440.png)

### 状態105　operators

管理者が運営者の権限を一覧して編集対象を探す。

1. 誰がいる？ 佐藤 優と森 直子。
2. 役割は？ 管理者と担当者。
3. 次は？ 行の編集、または検索・絞り込み。

見比べた点　375は編集が次行。広い2幅では名前と編集が左右端。 識別・役割・名前と操作の距離を確認。

画像から判断できないこと　編集後の保存と権限制約。

該当所見　S16、S12。 [375px](screens/operators-375.png)・[1024px](screens/operators-1024.png)・[1440px](screens/operators-1440.png)

### 状態106　product-emoji

利用者が絵文字の印でSlideを確認して問い合わせる。

1. 製品は？ 絵文字とSlide名。
2. 必要な情報は？ 件名・内容・連絡先メール。
3. 送れる場所は？ 入力欄直下に黒い送信。

見比べた点　3幅で製品名と印、入力順が保たれる。 製品の識別・全項目必須の説明・送信の強さを確認。

画像から判断できないこと　タブのfaviconと送信時エラー。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/product-emoji-375.png)・[1024px](screens/product-emoji-1024.png)・[1440px](screens/product-emoji-1440.png)

### 状態107　product-icon-settings

管理者がSlideの製品アイコンを設定する。

1. 現在の種類は？ 名前の頭文字。
2. 何を保存？ 「アイコンを保存」。下の「差出人を保存」と区別。
3. 窓口は？ 登録済みはsupport@example.com。

見比べた点　3幅とも縦1列。広い2幅でもフォームの幅は抑えられている。 種類・独立した保存対象・現在の製品を確認。

画像から判断できないこと　他の種類選択時のプレビュー。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/product-icon-settings-375.png)・[1024px](screens/product-icon-settings-1024.png)・[1440px](screens/product-icon-settings-1440.png)

### 状態108　product-image

利用者が画像マークのSlideに問い合わせる。

1. どこの窓口？ 四角い画像の隣にSlide。
2. 何を書く？ 件名・内容・連絡先メールアドレス。
3. 次は？ 送信ボタン。

見比べた点　375も他2幅も画像と名称が接して並び、フォーム内に収まる。 製品識別・文字ラベル・送信までの順を確認。

画像から判断できないこと　画像取得失敗の代替表示、送信確認。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/product-image-375.png)・[1024px](screens/product-image-1024.png)・[1440px](screens/product-image-1440.png)

### 状態109　product-switcher

担当者がSlideだけの受信箱から製品範囲を切り替える。

1. 現在は？ Slideにチェック。
2. 候補は？ 全製品・Desk・Slide。
3. 一覧は？ 未対応6件。

見比べた点　375はドロワー内、1024は縮小ナビ、1440は常設ナビで起点と候補を併読できる。 選択状態・範囲・開いたトリガーを確認。

画像から判断できないこと　切替後の選択保持と件数。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/product-switcher-375.png)・[1024px](screens/product-switcher-1024.png)・[1440px](screens/product-switcher-1440.png)

### 状態110　route-extensions-chat-preview-slide

サイト管理者がSlideに埋め込んだチャットの起動ボタンを試す。

1. どの見本？ Slide。
2. 何をすればよい？ 「ヘルプボタンを押して、チャットの見え方を確認」。
3. 入口は？ 右下の黒い「ヘルプ」。

見比べた点　3幅とも説明は上、ボタンは右下。背景には試用対象以外の操作が少ない。 製品・説明・入口の視認性を確認。

画像から判断できないこと　起動後の位置、閉じる・キーボード復帰。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/route-extensions-chat-preview-slide-375.png)・[1024px](screens/route-extensions-chat-preview-slide-1024.png)・[1440px](screens/route-extensions-chat-preview-slide-1440.png)

### 状態111　settings-home

管理者が設定項目と現状を一覧して目的の設定へ進む。

1. 何を探せる？ 製品・運営者・ラベル・保存期間・APIトークン。
2. 件数・期間は？ 窓口2件、運営者2人、ラベル6件、保存無期限。
3. データ削除は？ 「データ管理」に分けて注意文あり。

見比べた点　375の下端は削除の詳細が続く。広い2幅では全項目と現在値を併読。 目的別の並び・現在値・破壊的操作の区別を確認。

画像から判断できないこと　検索結果の空表示と削除確認。

この状態の上記観点では、画像で確認できる修正事項を特定しなかった。 [375px](screens/settings-home-375.png)・[1024px](screens/settings-home-1024.png)・[1440px](screens/settings-home-1440.png)

### 状態112　suggest-settings

管理者がヘルプ記事の提案条件と利用モデルを調整する。

1. 提案条件は？ 下限60%、高い順に最大3件。
2. どの場面？ チャット・フォームと、受付返信・運営画面で別モデル。
3. 自動返信への添付は？ 未選択のチェックと「設定を保存」。

見比べた点　375ではおすすめ設定が中心、広い2幅には埋め込みコードも上に見える。 単位・利用場面・保存対象を確認。

画像から判断できないこと　変更時のサンプル結果と設定の検証。

該当所見　S17。 [375px](screens/suggest-settings-375.png)・[1024px](screens/suggest-settings-1024.png)・[1440px](screens/suggest-settings-1440.png)

### 状態113　tokens

運営者が初めてAPIトークンを発行する。

1. 既存は？ 0件、鍵の印と空状態。
2. 必要な入力は？ トークン名と権限、初期は閲覧。
3. 何を押す？ 「発行する」。

見比べた点　3幅ともフォームが画像内。空状態と次の操作の間に目立つ余白。 空状態・初期権限・発行導線を確認。

画像から判断できないこと　発行後の秘密値表示と空欄時のエラー。

該当所見　S24。 [375px](screens/tokens-375.png)・[1024px](screens/tokens-1024.png)・[1440px](screens/tokens-1440.png)
