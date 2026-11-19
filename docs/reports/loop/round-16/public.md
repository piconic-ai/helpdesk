# 画像レビュー　公開窓口・運営画面

指定された public ディレクトリの110状態330枚を、各状態について375・1024・1440pxの順に横に並べて確認した。全330枚の縮小一覧で共通の余白や配置も比較し、操作の読み取りに影響する箇所は原寸に戻って確認した。実際の画像には公開窓口に加え、担当者の受信箱、管理者の設定、開発用見本も含まれる。評価対象は各画像が切り取った表示時点である。

## 改善点

| 重さ | 現在の見え方と利用者への影響 | あるべき姿・確認する変更 | 画像例 |
|---|---|---|---|
| 高 | 問い合わせ送信前に「この記事で解決しませんか」と尋ねるが、記事を新しいタブで読んで戻った人に示すのは入力修正と「このまま送る」の2択。3幅とも自力で解決した人が未送信のままこの作業を完了したと確認できる操作がない。チャットには同じ目的の「解決した」がある。 | 提案記事の近くで「解決したので送らず終了」を選べるようにし、問い合わせを送信していないことを結果で伝える。未解決の人には現在の内容で送る選択を残す。重さは送らずに終了する経路に対する評価であり、誤送信の発生は未確認。 | [送信前の提案](screens/suggest-form-375.png)・[広い画面](screens/suggest-form-1440.png)・[チャットの解決記録](screens/loop-chat-solved-375.png) |
| 中 | 375の会話画面では下端の返信欄が直前の受信文の途中に被さり、保存した内部メモは保存通知と同時に読めない。広い2幅は受信文・黄色いメモ・返信欄を順に見渡せる。 | スマートフォンでは未入力時の返信欄を小さくし、編集を始めると展開する等、保存直後のメモと通知を一緒に確認できる高さにする。実際にスクロールで全文を読めるかは未検証。 | [375の保存時](screens/behavior-confirmed-notice-375.png)・[1024の保存時](screens/behavior-confirmed-notice-1024.png) |
| 中 | 1024の細いナビは多くの項目をアイコンだけにする一方、集計2項目だけ「声の集計」「対応状況」の文字が残る。後者の正式名は1440で「対応状況の集計」。一部だけ省略形式が異なる。 | 細いナビの類似アイコンに、短く完結する名前を揃える。フォーカス時には正式名で区別できることも操作確認する。 | [1024のナビ](screens/menu-home-choice-menu-0-1024.png)・[1440のナビ](screens/menu-home-choice-menu-0-1440.png) |
| 中 | 絞り込みパネルでさらにラベルメニューを開くと、375では8行の候補が上に開いて検索語・親パネルの見出し・ほかの条件を覆う。広い幅は下に開く。親・子のトリガーとフォーカス中の項目に似た青枠が並ぶ。 | 375ではフィルタの見出しと選択中の条件を維持し、同じパネル内で候補を切り替えられる幅と高さを確保する。開いた状態と単一のキーボードフォーカスを見分けられるようにする。 | [未対応のラベル](screens/menu-home-choice-menu-2-375.png)・[検索のラベル](screens/menu-query-999c3485-choice-menu-2-375.png)・[意見のラベル](screens/menu-view-feedback-834dd78f-choice-menu-2-375.png) |
| 中 | チャットの失敗理由はカード外の下端だけに出る。特に1024・1440は画面上方の質問欄と下端の赤い通知の間に大きな空白。問い合わせフォームでも入力内容と再試行案内が離れる。 | 下端の結果通知を保ちつつ、失敗後の入力・送信操作の近くにも「下書きは保持されています」「再試行」など次の行動を残す。通知が何秒表示されるかや読み上げは未確認。 | [チャット失敗](screens/loop-chat-failed-1440.png)・[フォームの未確認](screens/loop-public-retry-1024.png) |
| 中 | アンケート受付画面は問い合わせ番号・回答記録の緑帯で終わり、記事評価の受付にあるような帰路、または「閉じてよい」という案内が見当たらない。 | 完了後の行動を一つ案内する。別タブで終える設計なら閉じてよい旨、サービス内なら製品ヘルプへの入口を置く。 | [アンケート受付](screens/survey-thanks-375.png)・[記事評価の受付](screens/article-vote-375.png) |
| 中 | 記事未提案の質問が0件のとき、375では空表示の最後が「ん。」だけの行になる。虫眼鏡の周囲の余白は大きく、一覧へ戻る操作との距離も大きい。同じ系列で公開の0件には製品の問い合わせカードが続く。 | 空文を「該当する質問はまだありません」等に短くし、製品条件または記事一覧に戻る選択を近づける。 | [空の質問一覧](screens/suggest-questions-empty-375.png)・[公開検索0件](screens/loop-help-no-results-375.png) |
| 中 | チャット設定で製品カードが一列に長く続き、375の「返信の目安を編集」では対象の入力欄が画面より下。「埋め込み先を編集」はラベルに達したところで画像が終わる。CSPやボタン説明の編集時には長いコード欄も共通で上にある。 | 製品の要約と編集項目を短い一覧にし、開いた項目名・入力・保存を続けて表示する。375でもどの製品を編集しているかを保つ。 | [返信の目安](screens/widget-edit-response-375.png)・[サイト登録](screens/widget-edit-sites-375.png)・[CSP説明](screens/widget-csp-375.png) |
| 中 | 指標定義の黒いツールチップは長文のため細い列で多数行に折れ、3幅で次の指標カードの数値や見出しを覆う。指標と隣の値を読み比べにくい。 | 長い算出条件や除外条件は定義を開く操作に対応した読みやすい幅の説明領域に収める。ツールチップは短い補足に限る。 | [375の定義](screens/loop-metric-definition-375.png)・[1440の定義](screens/loop-metric-definition-1440.png) |
| 低 | 会話統合の確認だけ、広い2幅でもキャンセルと統合ボタンがダイアログの全幅で上下に並ぶ。破棄・トークン失効の確認はラベル幅で横に並ぶ。 | 広い画面ではダイアログの操作配置を揃え、ラベル幅で表示する。375の縦積みは維持できる。 | [統合](screens/loop-merge-confirm-1440.png)・[下書き破棄](screens/loop-discard-1440.png) |
| 低 | 375の埋め込みチャットでフッターの青リンク3個が一行に詰まり、隣のリンクの境目は短い空白だけ。カードが実際より狭くなる広い2幅では同じリンクが2段に分かれる。 | 端末幅に合わせてリンク間の視認できる間隔を確保し、自然に折り返す。実際のタップ領域は画像だけでは測れない。 | [375の質問](screens/widget-open-375.png)・[375の受付](screens/widget-receipt-375.png)・[1440の質問](screens/widget-open-1440.png) |

## 判定の範囲

- 送信、承認、削除、取り消しの成功、データ保持、公開先への配信、日付集計の正確性は画像で確定できない。受付画面は「受付済みと表示された」ことを表す。撮影幅ごとに番号・サンプルデータが違う例を、レスポンシブの不具合とは数えない。
- キーボードによる全行程、初期／復帰フォーカス、IME入力、44pxの実効タップ領域、スクロール、遅延、メニューや通知を開く瞬間のレイアウト移動は操作確認が必要。青枠や背景が写る場合はその見た目のみを評価した。
- URLの公開可否や権限は判定していない。ディレクトリ名を理由に、運営画面または原文表示が顧客に公開されているとは判断できない。

## 状態別の横比較

各項目の3問に対応する回答は、画像に写る文言・配置・件数から読み取った。別途、3幅の違いと、同種類の画面との比較で残る課題を記した。

### article

利用者が領収書の発行方法を調べる。 [375px](screens/article-375.png) / [1024px](screens/article-1024.png) / [1440px](screens/article-1440.png)

- どこから発行？　購入履歴を開くのが手順1。
- 再取得は？　同じ手順で可能と末尾にある。
- 困ったら？　評価の下の区切り線を越えると問い合わせがある。

375では本文だけが自然に折り返す。広い2幅でも番号付き手順はひと続き。

### article-candidates

編集者が会話由来の候補を選ぶ。 [375px](screens/article-candidates-375.png) / [1024px](screens/article-candidates-1024.png) / [1440px](screens/article-candidates-1440.png)

- 何件？　見出し直下に1件。
- 何を書く？　領収書の宛名変更の候補にSlideの印。
- 材料は？　「元の会話 #1」と「記事を書き始める」が同じ行にある。

375では操作が題の次行、広い2幅では右端。件数1でも並び順が目立つ。

### article-edit

編集者が公開記事を更新する。 [375px](screens/article-edit-375.png) / [1024px](screens/article-edit-1024.png) / [1440px](screens/article-edit-1440.png)

- 対象は？　Slideの領収書記事。
- 何を編集？　題名、任意の要約、手順を含む本文。
- 確認・反映は？　公開記事を読む入口が見出し横、プレビューと更新がフォーム下。

375の初期表示では更新操作が本文の下に隠れる。広い2幅では編集から公開まで一望できる。

### article-index

利用者が製品別の記事を探す。 [375px](screens/article-index-375.png) / [1024px](screens/article-index-1024.png) / [1440px](screens/article-index-1440.png)

- どの製品？　上部にSlide。
- 何がある？　1件で領収書を発行する記事。
- 見当たらなければ？　一覧下の「お問い合わせ」。

3幅とも入力欄に検索実行ボタンは見えず、入力時に何が起きるかは静止画では判断できない。

### article-new

編集者が記事を新規作成する。 [375px](screens/article-new-375.png) / [1024px](screens/article-new-1024.png) / [1440px](screens/article-new-1440.png)

- 掲載先は？　フォーム先頭でDesk。
- 何が必要？　題名と本文、要約だけ任意の表記。
- いつ公開？　下に公開、プレビュー、下書き保存、取り消しが並ぶ。

375は白い入力欄が縦に続き本文の途中まで。広い2幅は公開操作まで収まる。

### article-preview

編集者が記事の読まれ方を確認する。 [375px](screens/article-preview-375.png) / [1024px](screens/article-preview-1024.png) / [1440px](screens/article-preview-1440.png)

- どの状態？　「記事のプレビュー」。
- 手順は読める？　番号と改行、末尾の再取得説明が残る。
- 修正先は？　記事の直後に同じ題名を含む編集カード。

3幅ともプレビューと編集が縦に続き、375では編集の大半が下。戻る・再編集の短い導線は冒頭に見えない。

### article-vote

読者が記事評価の受付を確かめる。 [375px](screens/article-vote-375.png) / [1024px](screens/article-vote-1024.png) / [1440px](screens/article-vote-1440.png)

- 結果は？　淡緑の帯に評価受付。
- 何の記事？　「領収書を発行する」リンク。
- まだ助けが必要？　下のメール問い合わせ。

3幅で同順、375でも両方の出口が見える。見出しは一般的で帯を読んでから評価と分かる。

### behavior-confirmed-notice

担当者が内部メモ保存後に会話を続ける。 [375px](screens/behavior-confirmed-notice-375.png) / [1024px](screens/behavior-confirmed-notice-1024.png) / [1440px](screens/behavior-confirmed-notice-1440.png)

- 保存された？　緑の「内部メモを保存しました」。
- 何を保存？　広い2幅では黄色の「相手には送信されません」とメモ本文。
- 次は？　下に返信・内部メモ切替と送信操作。

375では返信欄が受信文の途中を覆い、保存したメモは初期表示で照合できない。

### behavior-issue-demo

担当者が模擬課題の通知と優先順位を決める。 [375px](screens/behavior-issue-demo-375.png) / [1024px](screens/behavior-issue-demo-1024.png) / [1440px](screens/behavior-issue-demo-1440.png)

- 何を先に？　知らせる待ち1件の下書き作成。
- 次の修正は？　「開いている」の一括ダウンロード。
- 成果は？　「直した」に通知済み件数と修正後の声。

375は行ごとに列名を繰り返し、広い2幅は共通の表頭。「知らせる待ち」と「直した」に同じ課題が載る理由は件数を読んで分かる。

### behavior-issue-demo-all-sent

担当者が模擬課題の通知完了を確認する。 [375px](screens/behavior-issue-demo-all-sent-375.png) / [1024px](screens/behavior-issue-demo-all-sent-1024.png) / [1440px](screens/behavior-issue-demo-all-sent-1440.png)

- 対象は？　請求明細ダウンロード。
- 全員に届いた？　紐づく声2件の各行に「知らせた」。
- 修正の前後は？　前30日1件と後8日ぶん1件、割合も併記。

3幅で比較列を保つ。375では2件の完了を行単位で照合するため、題の近くに2/2の要約があると速い。

### behavior-issue-demo-open

担当者が未解決の模擬課題の根拠を確認する。 [375px](screens/behavior-issue-demo-open-375.png) / [1024px](screens/behavior-issue-demo-open-1024.png) / [1440px](screens/behavior-issue-demo-open-1440.png)

- 状況は？　「開いている」と模擬GitHub表記。
- 根拠は？　紐づく声3件と各行の未通知。
- 次は？　「課題を閉じる（デモ用）」。

375では長い部署名と長い件名が最初の行を何行にも伸ばす。広い2幅は3件の比較が容易。

### behavior-reply-controls-open

担当者が返信作成時に使う補助操作を選ぶ。 [375px](screens/behavior-reply-controls-open-375.png) / [1024px](screens/behavior-reply-controls-open-1024.png) / [1440px](screens/behavior-reply-controls-open-1440.png)

- 何への返信？　利用明細、添付リンクと43 B。
- 使える材料は？　記事と定型文、候補がない旨と候補化操作。
- 誰に届く？　送信前に差出人と宛先。

375は本文入力に青枠、画面下部に送信。広い2幅は受信・入力欄の境界を一望できる。

### behavior-sort-menu

担当者が未対応会話の順を選ぶ。 [375px](screens/behavior-sort-menu-375.png) / [1024px](screens/behavior-sort-menu-1024.png) / [1440px](screens/behavior-sort-menu-1440.png)

- どの一覧？　未対応7件。
- 現在の順は？　待たせている順にチェック。
- 他の順は？　新しい順が直下。

375は長い送信者と複数の記号が詰まる。1024・1440は右側に待ち時間の列を保つ。

### candidate-editor

編集者が候補から元会話を読んで記事を書く。 [375px](screens/candidate-editor-375.png) / [1024px](screens/candidate-editor-1024.png) / [1440px](screens/candidate-editor-1440.png)

- 出典は？　「元の会話」と#1。
- 何が必要？　宛名再発行を希望する文がカード内に引用。
- どこへ書く？　次のカードにSlideと題名の初期値。

375では出典が最初の大半を占める。広い2幅は出典と本文欄を同時に見られる。

### chat-articles

顧客がチャットの提案記事を試す。 [375px](screens/chat-articles-375.png) / [1024px](screens/chat-articles-1024.png) / [1440px](screens/chat-articles-1440.png)

- 何への答え？　質問の吹き出しに領収書。
- どの記事？　「領収書を発行する」。
- 役立たなければ？　「解決しなかった」とメール問い合わせ。

3幅で同じ狭い列を保ち、追加質問と評価が近い。フッターの青リンク二つは375でも間隔が小さい。

### chat-input

顧客がチャットで最初の質問を書く。 [375px](screens/chat-input-375.png) / [1024px](screens/chat-input-1024.png) / [1440px](screens/chat-input-1440.png)

- 自動か人か？　記事を自動検索し送信後に担当者が読む説明。
- 何を入力？　「質問」欄。
- 他の方法は？　ヘルプ記事一覧とメール問い合わせ。

375は横幅いっぱいに近いカード、1024・1440は中央の狭いカード。質問するボタンが右端で一つ。

### chat-receipt

顧客がチャット問い合わせの到着を確かめる。 [375px](screens/chat-receipt-375.png) / [1024px](screens/chat-receipt-1024.png) / [1440px](screens/chat-receipt-1440.png)

- 受け付けられた？　問い合わせ#12。
- どこへ返事？　返信先アドレスを明記。
- 何を送った？　契約名変更の質問と記事無しの履歴。

全幅で受付の下に履歴とメール問い合わせ。すでに受付済みなのに同じ窓口を再度選べるため役割を区別したい。

### console-404

担当者が見つからない対象から復帰する。 [375px](screens/console-404-375.png) / [1024px](screens/console-404-1024.png) / [1440px](screens/console-404-1440.png)

- 何が起きた？　「対象が見つかりません」。
- 次は？　受信箱から選び直す説明。
- 戻れる？　同じ列に「受信箱に戻る」。

375は単独の回復操作、1024・1440は通常のナビも見える。どの対象を探したのかは見出しから特定できない。

### deletion

管理者が相手のデータ削除対象を指定する。 [375px](screens/deletion-375.png) / [1024px](screens/deletion-1024.png) / [1440px](screens/deletion-1440.png)

- 何を消す？　会話・メール原文・添付ファイル。
- 誰が対象？　未選択の相手選択欄。
- すぐ消える？　操作は「削除内容を確認」。

3幅とも狭いカード内で説明・相手・確認の順。未選択でも確認ボタンの見た目は通常の白ボタン。

### feedback-input

顧客が返信不要の意見を届ける。 [375px](screens/feedback-input-375.png) / [1024px](screens/feedback-input-1024.png) / [1440px](screens/feedback-input-1440.png)

- 返事は来る？　個別返信はないと冒頭で説明。
- 何を書けば？　「ご意見・ご要望」の大きい欄。
- 連絡先は必要？　メールは任意、別のメール問い合わせ入口あり。

375ではフォームも出口も初期表示内、広い2幅では本文列に揃う。送信前確認の有無は画像外。

### feedback-list

担当者が届いた意見を確認する。 [375px](screens/feedback-list-375.png) / [1024px](screens/feedback-list-1024.png) / [1440px](screens/feedback-list-1440.png)

- 何件？　フィードバック1件。
- どんな声？　キーボード操作についての件名と抜粋。
- 何ができる？　受付済みラベルの近くに「確認済みにする」。

375はボタンが件名の下、広い2幅では右。「すべて選択」も1件の近くにあり操作密度が高い。

### feedback-receipt

顧客が意見の受付結果を確かめる。 [375px](screens/feedback-receipt-375.png) / [1024px](screens/feedback-receipt-1024.png) / [1440px](screens/feedback-receipt-1440.png)

- 届いた？　緑の受付文と番号。
- 連絡先は？　登録なし。
- 返事が要る場合は？　「返信はありません」の下にメール問い合わせ。

3幅で番号が#14、#13、#12と異なる。別の受付例として扱い、表示幅による番号変更とは判定しない。

### forget

管理者が削除を確定する。 [375px](screens/forget-375.png) / [1024px](screens/forget-1024.png) / [1440px](screens/forget-1440.png)

- 誰のデータ？　渡辺葵とメールアドレス。
- 影響は？　会話1件と原文・添付、取り消せない旨。
- 止められる？　キャンセルと赤枠「すべて削除」。

3幅とも中央のダイアログに対象名と件数が収まる。開閉時の位置・フォーカス復帰は未確認。

### help-home

顧客が製品と相談経路を選ぶ。 [375px](screens/help-home-375.png) / [1024px](screens/help-home-1024.png) / [1440px](screens/help-home-1440.png)

- 対象製品は？　製品1件、Slide。
- 自分で調べるには？　全記事の検索と製品カードのヘルプ記事。
- 返信が欲しければ？　担当者からの返信を希望する方向けの問い合わせ。

375で説明が各行の下に回り、広い2幅では項目名と隣接する。意味の異なる二つの入口が読める。

### help-results

顧客が全製品で領収書記事を探す。 [375px](screens/help-results-375.png) / [1024px](screens/help-results-1024.png) / [1440px](screens/help-results-1440.png)

- 何を探した？　検索欄と解除可能な条件に「領収書」。
- 何件？　1件のSlide記事。
- 別の経路は？　下に製品別記事と問い合わせのカード。

375でカードの説明が縦になり、広い2幅は横。単一製品では結果とカード双方に同じ製品名が続く。

### invalid

管理者が窓口アドレスの誤りを直す。 [375px](screens/invalid-375.png) / [1024px](screens/invalid-1024.png) / [1440px](screens/invalid-1440.png)

- どの欄？　アドレス先頭に赤枠と青いフォーカス。
- 何が違う？　空白と@を除いて入力する赤い説明。
- 何が残る？　製品Slide、invalid address、送信ドメインが見える。

375ではエラー説明が2行、広い2幅は1行。設定後の自動送信は下部に説明が続く。

### issue-detail

担当者が修正済み課題の通知進捗を確認する。 [375px](screens/issue-detail-375.png) / [1024px](screens/issue-detail-1024.png) / [1440px](screens/issue-detail-1440.png)

- どの課題？　領収書の宛名変更、Slide・直した。
- 誰に通知した？　#1承認待ちと#6知らせた。
- 効果は？　修正前後とも1件、12.5%と100%の母数付き。

375でも比較2列を保持。1024・1440はGitHubへ開く操作が題の右、375では下。

### issue-new

担当者が会話から新しい課題を下書きする。 [375px](screens/issue-new-375.png) / [1024px](screens/issue-new-1024.png) / [1440px](screens/issue-new-1440.png)

- 何が元？　#1 Slideと元の件名。
- 何を書く？　タイトルと公開する要約。
- 何を避ける？　氏名やメールアドレスを含めない指示、次は起票内容確認。

3幅共通で説明が公開要約の下。外部に出る説明は入力前にも読みやすい位置が望ましい。

### issue-preview

担当者が外部起票の内容と宛先を確かめる。 [375px](screens/issue-preview-375.png) / [1024px](screens/issue-preview-1024.png) / [1440px](screens/issue-preview-1440.png)

- どこへ？　投稿先example/helpdesk。
- 公開するものは？　題名、確認画面が開かない旨、会話#1のリンクとホスト。
- 修正できる？　黒い起票操作の直下の「入力内容を修正する」。

375ではホスト名のみ次行、広い2幅はリンクの横。3幅で確定前の情報が一か所にある。

### issue-setup

担当者が課題起票に必要な設定を調べる。 [375px](screens/issue-setup-375.png) / [1024px](screens/issue-setup-1024.png) / [1440px](screens/issue-setup-1440.png)

- なぜ進めない？　リポジトリの設定が必要と表示。
- 誰が直す？　管理者が設定を確認できる。
- どこから？　GitHub Issueの設定を開くリンク。

375は全幅パネル、1024は背景付き右パネル、1440は会話と並ぶ補助列。375で会話の題名は消え番号と製品だけになる。

### issues-board

担当者が解決通知と進行中の課題を把握する。 [375px](screens/issues-board-375.png) / [1024px](screens/issues-board-1024.png) / [1440px](screens/issues-board-1440.png)

- 最優先は？　「知らせる待ち」1件に黒い下書き作成。
- 未修正は？　「開いている」に一括ダウンロード。
- 修正済みは？　「直した」に声2件・通知1/2。

375は列名付きの縦並び、広い2幅は表。修正済みと通知待ちに同じ題が表示される。

### link-issue

担当者が既存課題と会話を関連付ける。 [375px](screens/link-issue-375.png) / [1024px](screens/link-issue-1024.png) / [1440px](screens/link-issue-1440.png)

- 対象の会話は？　#1 Slide。
- 選ぶ候補は？　題検索、候補2件、選択#42。
- 新規と既存の違いは？　起票ボタンと既存課題を紐づけるボタン。

375はパネルのみ、1024は背景の会話を薄暗くし、1440は会話横。375で会話の件名も持ち運びたい。

### loop-canned-edit

担当者が保存済みの定型文を編集する。 [375px](screens/loop-canned-edit-375.png) / [1024px](screens/loop-canned-edit-1024.png) / [1440px](screens/loop-canned-edit-1440.png)

- どの定型文？　「お問い合わせの受付」。
- 置換は？　本文の{{name}}・{{product}}と説明。
- 何を確定？　変更を保存・取り消し、下に新しい定型文。

375では検索・順序が編集より上、広い2幅では編集と新規の二組が同時に見える。「編集」見出しに表示名を含めると特定しやすい。

### loop-chat-failed

顧客が失敗した質問の送信を再試行する。 [375px](screens/loop-chat-failed-375.png) / [1024px](screens/loop-chat-failed-1024.png) / [1440px](screens/loop-chat-failed-1440.png)

- どうなった？　赤い通知に送信できなかったと表示。
- 消えた？　「領収書を発行したい」が欄に残る。
- 次は？　接続確認の指示、元の「質問する」が利用可能に見える。

375と広い2幅ともエラーはカード外の画面最下部。余白を挟むため入力と失敗理由が離れる。

### loop-chat-solved

顧客が記事での自己解決を記録する。 [375px](screens/loop-chat-solved-375.png) / [1024px](screens/loop-chat-solved-1024.png) / [1440px](screens/loop-chat-solved-1440.png)

- 何を解決？　領収書発行の質問と該当記事。
- 記録された？　「記事で解決したことを記録しました」。
- 続けられる？　新たな質問欄と記事一覧・メール。

3幅で評価ボタンが完了文に変わる。元の記事リンクと完了文が隣り合う。

### loop-convert

担当者が意見を返信可能な問い合わせに変える。 [375px](screens/loop-convert-375.png) / [1024px](screens/loop-convert-1024.png) / [1440px](screens/loop-convert-1440.png)

- どの意見？　#10とキーボード操作の件名。
- 何が変わる？　返信できる問い合わせ。
- 選択は？　キャンセルと「問い合わせに変更」。

全幅で背景を暗くしダイアログ内で対象を読める。戻した際の状態・通知の有無は不明。

### loop-dates

担当者が分析対象の日付範囲を入力する。 [375px](screens/loop-dates-375.png) / [1024px](screens/loop-dates-1024.png) / [1440px](screens/loop-dates-1440.png)

- 期間は？　日付を指定、11/01と11/18。
- どの時間基準？　両欄に日本時間。
- どこを編集中？　開始日の年が選択され青枠。

375では「日付の範囲」の下のポップオーバーが説明文を覆う。広い2幅もカードの手前に開く。反映タイミングは見た目で不明。

### loop-disable

管理者が振り分けルールを無効にする。 [375px](screens/loop-disable-375.png) / [1024px](screens/loop-disable-1024.png) / [1440px](screens/loop-disable-1440.png)

- 何を止める？　振り分けルール。
- 設定はどうなる？　保持し、再有効化まで新規処理停止。
- 確定は？　名前を含む黒ボタンとキャンセル。

3幅ですべての効果説明がダイアログ内。狭幅・広幅とも長いボタン名で操作が上下に分かれる。

### loop-discard

担当者が承認前の返信下書きを破棄する。 [375px](screens/loop-discard-375.png) / [1024px](screens/loop-discard-1024.png) / [1440px](screens/loop-discard-1440.png)

- 何を消す？　会話#5の下書き1件。
- 内容を確認できる？　メンバー数変更の返信案を表示。
- 誤操作を避けられる？　キャンセルの横に赤枠「下書きを破棄」。

375は背後で下書きと返信欄が縦に重なるが、対象文は確認内に再掲。広い2幅も同じ対象と文面。

### loop-enable

管理者が問い合わせフォーム拡張を有効にする。 [375px](screens/loop-enable-375.png) / [1024px](screens/loop-enable-1024.png) / [1440px](screens/loop-enable-1440.png)

- 影響範囲は？　全プロダクトで機能を使用可能。
- 受付は始まる？　プロダクトごとに開始。
- 権限は？　追加権限なしと明記したうえで確認。

3幅で確定操作に対象名が入る。375の背景に他の無効スイッチが見えるが、確認の焦点は一つ。

### loop-feedback-undo

担当者が意見の確認を取り消す。 [375px](screens/loop-feedback-undo-375.png) / [1024px](screens/loop-feedback-undo-1024.png) / [1440px](screens/loop-feedback-undo-1440.png)

- 何を変更した？　#10を確認済みにした緑の通知。
- 現在の行は？　確認済みバッジ。
- 戻し方は？　通知の「元に戻す」と行の「未確認に戻す」。

375は行ボタンが下、広い2幅は右。3幅とも行の件数1と未確認数0（広い幅のナビ）を別の意味として読む必要がある。

### loop-help-no-results

顧客が記事検索0件から次の窓口へ進む。 [375px](screens/loop-help-no-results-375.png) / [1024px](screens/loop-help-no-results-1024.png) / [1440px](screens/loop-help-no-results-1440.png)

- 何を検索？　未掲載の振込口座。
- 該当は？　0件と「該当する記事はありません」。
- 次は？　下にSlideの記事・返信のある問い合わせ。

375では空の虫眼鏡を挟んで次のカードが下がる。広い2幅も空メッセージから問い合わせが離れる。

### loop-history

担当者が会話の操作履歴の出所を調べる。 [375px](screens/loop-history-375.png) / [1024px](screens/loop-history-1024.png) / [1440px](screens/loop-history-1440.png)

- 対象は？　#2 Slide。
- 何が起きた？　会話の表示、メール受信。
- 誰が？　担当者名とシステムを各行に記載。

375は「たった今 会話を表示」が同じ担当者で2行、広い幅の画像では件数が異なる。再表示の理由は画像で確定不可。

### loop-link-confirm

担当者が外部課題へのリンク投稿を確定する。 [375px](screens/loop-link-confirm-375.png) / [1024px](screens/loop-link-confirm-1024.png) / [1440px](screens/loop-link-confirm-1440.png)

- 宛先は？　example/helpdeskの#42と課題名。
- 何を公開？　会話#1へのリンクをコメント投稿。
- 実行・中止は？　紐づけ操作とキャンセル。

375・1024は会話の関連情報パネル上に確認、1440は常設の関連列の上に確認。フォーカス順と実際の投稿は未確認。

### loop-merge-confirm

担当者が統合する会話の方向を確認する。 [375px](screens/loop-merge-confirm-375.png) / [1024px](screens/loop-merge-confirm-1024.png) / [1440px](screens/loop-merge-confirm-1440.png)

- 何を何に？　#1の領収書を#2の招待メールへ統合。
- 返信先は？　共通の返信先メール。
- 中止は？　キャンセルと統合する。

全幅で白黒ボタンがダイアログの横いっぱいに縦積み。1024・1440も同じで、同種の破棄・起票確認と配置が違う。

### loop-metric-definition

担当者が「声が改善に届いた割合」の意味を調べる。 [375px](screens/loop-metric-definition-375.png) / [1024px](screens/loop-metric-definition-1024.png) / [1440px](screens/loop-metric-definition-1440.png)

- どの指標？　定義アイコンに青枠。
- 何を数える？　修正して解決済みの知らせを送った会話の割合。
- 対象外は？　迷惑メール除外、前期データ無しも黒い説明内。

375の説明は折返しが密で下のカードに重なる。広い2幅も長文の細い枠が次の行へ張り出す。

### loop-navigation

担当者が受信箱の別の区分へ移る。 [375px](screens/loop-navigation-375.png) / [1024px](screens/loop-navigation-1024.png) / [1440px](screens/loop-navigation-1440.png)

- 現在地は？　未対応が選択色、7件。
- 移動先は？　返信待ち、担当、完了ほかの件数。
- 閉じられる？　375に×、広い幅はナビが常設。

1024はアイコン中心の細い帯なのに集計名の文字片が残る。1440は名称を全表示、375はドロワー内に名称が収まる。

### loop-public-retry

顧客が未確認の送信結果から復帰する。 [375px](screens/loop-public-retry-375.png) / [1024px](screens/loop-public-retry-1024.png) / [1440px](screens/loop-public-retry-1440.png)

- 届いた？　「送信を確認できませんでした」。
- 入力は？　件名・本文・返信先が残る。
- 次は？　時間をおいて再試行、元の送信とメール問い合わせ。

全幅で入力と下端の通知が離れる。失敗と未確認は区別されているが、重複受付を防げるかは画像で不明。

### loop-publish

編集者が記事公開を確定する。 [375px](screens/loop-publish-375.png) / [1024px](screens/loop-publish-1024.png) / [1440px](screens/loop-publish-1440.png)

- どれを？　「契約を更新する」。
- 公開先は？　Deskの公開ヘルプ。
- まだ止められる？　キャンセルと公開する。

375は背後のフォームが途中までスクロール済み。広い2幅はページ先頭も見える。開閉による移動は単独画像で判定不可。

### loop-revoke

管理者がAPIトークンを失効させる。 [375px](screens/loop-revoke-375.png) / [1024px](screens/loop-revoke-1024.png) / [1440px](screens/loop-revoke-1440.png)

- どれを？　運営用CLI。
- 影響は？　これを使うCLIやMCPクライアントは接続不可。
- 操作は？　キャンセルと赤枠の失効。

3幅でトークン値そのものを出さず識別名を提示。発行フォームとの混同は背景暗転で抑えられる。

### menu-articles-candidates-choice-menu-0

編集者が候補の並び順を選ぶ。 [375px](screens/menu-articles-candidates-choice-menu-0-375.png) / [1024px](screens/menu-articles-candidates-choice-menu-0-1024.png) / [1440px](screens/menu-articles-candidates-choice-menu-0-1440.png)

- 今は何順？　会話番号の新しい順にチェック。
- 別の基準は？　名前順。
- 何に作用？　背景は記事の候補1件。

375はポップオーバーが候補名・操作の一部を覆う。広い2幅では一覧の横に余白。選択と青枠が併存する。

### menu-articles-choice-menu-0

編集者がヘルプ記事の並び順を選ぶ。 [375px](screens/menu-articles-choice-menu-0-375.png) / [1024px](screens/menu-articles-choice-menu-0-1024.png) / [1440px](screens/menu-articles-choice-menu-0-1440.png)

- どの一覧？　ヘルプ記事1件。
- 何が選択中？　更新が新しい順。
- 選べる順は？　名前順。

375で公開状態と並び順が同じ段、メニューで行の状態が隠れる。広い2幅ではフィルタが横1列に収まる。

### menu-articles-new-choice-menu-0

編集者が新しい記事の掲載先を選ぶ。 [375px](screens/menu-articles-new-choice-menu-0-375.png) / [1024px](screens/menu-articles-new-choice-menu-0-1024.png) / [1440px](screens/menu-articles-new-choice-menu-0-1440.png)

- どの操作？　記事を書く画面のプロダクト。
- 現在は？　Deskにチェックと製品印。
- ほかは？　Slideも製品印付き。

3幅ともトリガー直下。375は選択肢の枠が題名ラベルを覆うが、製品選択と分かる。

### menu-articles-questions-choice-menu-0

編集者が未解決の質問を製品別に探す。 [375px](screens/menu-articles-questions-choice-menu-0-375.png) / [1024px](screens/menu-articles-questions-choice-menu-0-1024.png) / [1440px](screens/menu-articles-questions-choice-menu-0-1440.png)

- 全体件数は？　0件。
- 対象は？　すべてのプロダクトにチェック。
- 個別は？　DeskとSlideが選択肢。

375は候補が空メッセージにかかる。広い2幅は中央の空表示が読める。

### menu-dev-ui-choice-menu-0

開発者が見本の一覧ソートを確認する。 [375px](screens/menu-dev-ui-choice-menu-0-375.png) / [1024px](screens/menu-dev-ui-choice-menu-0-1024.png) / [1440px](screens/menu-dev-ui-choice-menu-0-1440.png)

- どの見本？　UI部品見本の一覧・受信箱2件。
- 現在は？　新着順にチェック。
- 代替は？　古い順。

375は検索・状態・順序が同じ段で右端に密集、広い2幅では余裕がある。実画面の「新しい順」と用語が違う。

### menu-dev-ui-sample-assignee

開発者が担当者選択の見本を確認する。 [375px](screens/menu-dev-ui-sample-assignee-375.png) / [1024px](screens/menu-dev-ui-sample-assignee-1024.png) / [1440px](screens/menu-dev-ui-sample-assignee-1440.png)

- どの会話？　領収書の宛名について。
- 担当は？　佐藤優にチェックと色付きアバター。
- 他の選択は？　森直子と未割り当て。

375ではトリガー下、1024・1440では上に候補が開く。見本と実画面で担当者名に付く色が一致しない例がある。

### menu-dev-ui-sample-menu

開発者が会話の追加操作の見本を確認する。 [375px](screens/menu-dev-ui-sample-menu-375.png) / [1024px](screens/menu-dev-ui-sample-menu-1024.png) / [1440px](screens/menu-dev-ui-sample-menu-1440.png)

- 対象は？　詳細見出しに領収書の宛名。
- 開いた箇所は？　その他の操作の青い枠。
- 中身は？　削除する1項目。

375は件名下、広い2幅は右端にアンカー。削除の文字は通常色で、最終確認の有無はここから不明。

### menu-home-bulk-assignee

担当者が選択した会話に一括で担当者を付ける。 [375px](screens/menu-home-bulk-assignee-375.png) / [1024px](screens/menu-home-bulk-assignee-1024.png) / [1440px](screens/menu-home-bulk-assignee-1440.png)

- 何件？　7件を選択中、背景の行は淡青。
- 誰を？　写真の代わりに頭文字と佐藤優・森直子。
- 今の割当は？　佐藤優の前は横棒、単独選択のチェックと異なる。

375は選択解除と各操作が複数段、広い2幅は一列。横棒が一部割当を意味するか説明は見えない。

### menu-home-choice-menu-0

担当者が未対応一覧の状態フィルタを切り替える。 [375px](screens/menu-home-choice-menu-0-375.png) / [1024px](screens/menu-home-choice-menu-0-1024.png) / [1440px](screens/menu-home-choice-menu-0-1440.png)

- 何を選択？　未対応にチェック。
- 他の状態は？　返信待ち・完了・迷惑メール・すべて。
- どこで変更？　絞り込みと「状態」の二層。

375は親パネルが一覧を覆う。1024・1440では右寄せ。開いた親・子・候補の三つの青枠が競う。

### menu-home-choice-menu-1

担当者が未対応一覧を製品別にする。 [375px](screens/menu-home-choice-menu-1-375.png) / [1024px](screens/menu-home-choice-menu-1-1024.png) / [1440px](screens/menu-home-choice-menu-1-1440.png)

- どの状態？　親パネルに未対応。
- 全製品か？　すべてにチェック。
- どれを選べる？　Desk・Slide。

375は製品メニューが担当者欄の上に重なり、広い2幅は右側に収まる。親と子どちらを閉じるかは静止画で検証不能。

### menu-home-choice-menu-2

担当者が未対応会話のラベルを選ぶ。 [375px](screens/menu-home-choice-menu-2-375.png) / [1024px](screens/menu-home-choice-menu-2-1024.png) / [1440px](screens/menu-home-choice-menu-2-1440.png)

- 今の条件は？　すべてのラベルにチェック。
- どんな区分？　再発行・社内確認・経理・請求ほかに色点。
- ラベルを編集？　候補の末尾に管理。

375では上向きの8項目が親の見出しと他の条件を覆う。広い2幅では下向きで親の条件が読める。

### menu-home-choice-menu-3

担当者が未対応会話で並び順を変更する。 [375px](screens/menu-home-choice-menu-3-375.png) / [1024px](screens/menu-home-choice-menu-3-1024.png) / [1440px](screens/menu-home-choice-menu-3-1440.png)

- どちらが有効？　待たせている順にチェック。
- どちらを選べる？　新しい順。
- 順の意味は？　背景の会話には11時間待ち、7時間待ち等。

375は検索の次段、広い2幅は検索の右。チェックと青枠を見れば現在値を区別できる。

### menu-home-filter-assignee

担当者が未対応会話を担当者別に絞る。 [375px](screens/menu-home-filter-assignee-375.png) / [1024px](screens/menu-home-filter-assignee-1024.png) / [1440px](screens/menu-home-filter-assignee-1440.png)

- 今の絞り込みは？　すべてにチェック。
- 誰を選べる？　色印と佐藤優・森直子。
- 他条件は？　状態とプロダクトが上に残る。

375では親の下に担当者リストが突き出て一覧の行を覆う。広い2幅は右端で選択できる。「未割当」はこのリストに見えない。

### menu-issues-new-choice-menu-0

担当者が模擬課題のもとになる会話を選ぶ。 [375px](screens/menu-issues-new-choice-menu-0-375.png) / [1024px](screens/menu-issues-new-choice-menu-0-1024.png) / [1440px](screens/menu-issues-new-choice-menu-0-1440.png)

- 現在は？　#1 Slide・領収書の宛名。
- 候補の識別は？　番号、製品と件名。
- 探すには？　開いた先頭の「候補を絞り込む」。

375は#7の件名がポップオーバーの底で途中、広い2幅は7件の題が見える。続きの存在を示す手掛かりが弱い。

### menu-metrics-choice-menu-0

担当者が集計を製品別に切り替える。 [375px](screens/menu-metrics-choice-menu-0-375.png) / [1024px](screens/menu-metrics-choice-menu-0-1024.png) / [1440px](screens/menu-metrics-choice-menu-0-1440.png)

- 期間は？　過去30日。
- 対象は？　すべてのプロダクトにチェック。
- 個別は？　Desk・Slide。

375では製品選択が期間や説明の一部を覆う。広い2幅は見出し下の同じ列で期間も確認しやすい。

### menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0

担当者が指定期間を維持しつつ製品を選ぶ。 [375px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0-375.png) / [1024px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0-1024.png) / [1440px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-choice-menu-0-1440.png)

- 期間は？　日付指定、範囲のチップ。
- 何を選択？　全プロダクトにチェック。
- 他の対象は？　DeskとSlide。

375はメニューが日付指定の開始側を覆う。広い2幅は日付の右側と条件の一部が残る。

### menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates

担当者が集計の開始日と終了日を編集する。 [375px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates-375.png) / [1024px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates-1024.png) / [1440px](screens/menu-metrics-period-custom-start-2026-11-01-end-2026-11-18-a679f59e-metric-dates-1440.png)

- 何年何月？　2026年11月。
- どの区間？　1日〜18日、両方に日本時間。
- 編集中は？　開始日の年部分が選択。

375は2入力が縦に浮き説明と重なる。広い2幅も縦並びで日付の範囲の真下。明示的適用・取消は見えない。

### menu-query-999c3485-choice-menu-0

担当者が検索0件の状態条件を見直す。 [375px](screens/menu-query-999c3485-choice-menu-0-375.png) / [1024px](screens/menu-query-999c3485-choice-menu-0-1024.png) / [1440px](screens/menu-query-999c3485-choice-menu-0-1440.png)

- 何を検索？　未回答の調査番号。
- 選択中は？　状態はすべてにチェック。
- フォーカスは？　候補「未対応」の青枠はチェックと別。

375では状態メニューが空表示を覆う。広い2幅は検索チップと空を示す虫眼鏡が左に残る。

### menu-query-999c3485-choice-menu-1

担当者が検索結果を製品で絞り直す。 [375px](screens/menu-query-999c3485-choice-menu-1-375.png) / [1024px](screens/menu-query-999c3485-choice-menu-1-1024.png) / [1440px](screens/menu-query-999c3485-choice-menu-1-1440.png)

- 結果は？　0件。
- 今は？　親のプロダクトが「すべて」、選択にチェック。
- 候補は？　Desk・Slide。

375は親・子の枠で理由と解除が隠れる。広い2幅は右側だけが覆われる。0件で範囲を狭める意味は結果を見て判断する。

### menu-query-999c3485-choice-menu-2

担当者が検索結果のラベル条件を見直す。 [375px](screens/menu-query-999c3485-choice-menu-2-375.png) / [1024px](screens/menu-query-999c3485-choice-menu-2-1024.png) / [1440px](screens/menu-query-999c3485-choice-menu-2-1440.png)

- 何を対象に？　検索結果0件。
- どれが有効？　すべてのラベルにチェック。
- 何が選べる？　再発行から領収書までと管理入口。

375では上向きに開いて検索語が隠れる。広い2幅は条件を出したまま横の空表示を確認できる。

### menu-query-999c3485-choice-menu-3

担当者が検索結果の並び順を指定する。 [375px](screens/menu-query-999c3485-choice-menu-3-375.png) / [1024px](screens/menu-query-999c3485-choice-menu-3-1024.png) / [1440px](screens/menu-query-999c3485-choice-menu-3-1440.png)

- 何件？　0件。
- どの順？　待たせている順。
- 別の行動は？　新しい順、空表示の「絞り込みを解除」。

375も広い2幅も選択メニューの外に空表示が残る。0件で順位を変えても行が増えないことは見出しから読める。

### menu-query-999c3485-filter-assignee

担当者が担当者条件を見直す。 [375px](screens/menu-query-999c3485-filter-assignee-375.png) / [1024px](screens/menu-query-999c3485-filter-assignee-1024.png) / [1440px](screens/menu-query-999c3485-filter-assignee-1440.png)

- 何を検索？　未回答の調査番号、0件。
- 担当範囲は？　すべてにチェック。
- 別の人は？　佐藤優・森直子。

375ではメニューが空状態文と解除を覆い、広い2幅は検索欄が残る。候補に未割当は見当たらない。

### menu-view-feedback-834dd78f-choice-menu-0

担当者が意見一覧の確認状態を選ぶ。 [375px](screens/menu-view-feedback-834dd78f-choice-menu-0-375.png) / [1024px](screens/menu-view-feedback-834dd78f-choice-menu-0-1024.png) / [1440px](screens/menu-view-feedback-834dd78f-choice-menu-0-1440.png)

- 対象は？　フィードバック1件。
- 現在は？　すべてにチェック。
- 選べる状態は？　受付済み、確認済み、迷惑メール。

375はポップオーバーがほぼ唯一の行を覆う。広い2幅は行の先頭が見える。チェックは選択と確認済みアイコンの両方に似る。

### menu-view-feedback-834dd78f-choice-menu-1

担当者が意見を製品で絞る。 [375px](screens/menu-view-feedback-834dd78f-choice-menu-1-375.png) / [1024px](screens/menu-view-feedback-834dd78f-choice-menu-1-1024.png) / [1440px](screens/menu-view-feedback-834dd78f-choice-menu-1-1440.png)

- どの種類？　フィードバック1件。
- 今の製品？　すべて。
- 候補は？　Desk・Slideのマーク。

375はメニューの背後に行の一部だけ、広い2幅は件名と送信者を維持。製品と状態のラベルは区別できる。

### menu-view-feedback-834dd78f-choice-menu-2

担当者が意見をラベルから探す。 [375px](screens/menu-view-feedback-834dd78f-choice-menu-2-375.png) / [1024px](screens/menu-view-feedback-834dd78f-choice-menu-2-1024.png) / [1440px](screens/menu-view-feedback-834dd78f-choice-menu-2-1440.png)

- 選択中は？　すべてのラベル。
- どの候補？　長期契約の更新手続きについて等、名前と点。
- 編集へは？　リスト末尾のラベルを管理。

375は上向きの選択肢が画面上部を覆い、下のトリガーで親を推測する。広い2幅は親の条件の下に展開。

### menu-view-feedback-834dd78f-choice-menu-3

担当者が未確認の意見を優先して読む。 [375px](screens/menu-view-feedback-834dd78f-choice-menu-3-375.png) / [1024px](screens/menu-view-feedback-834dd78f-choice-menu-3-1024.png) / [1440px](screens/menu-view-feedback-834dd78f-choice-menu-3-1440.png)

- 今は？　新しい順がチェック。
- 優先順位の選択は？　未確認を先に。
- どの一覧？　1件、背景は受付済みの意見。

375は1件の行の上部とメニューが重なる。広い2幅は右端に置かれ、題を見ながら選べる。

### menu-voices-choice-menu-0

担当者が声の集計の対象製品を決める。 [375px](screens/menu-voices-choice-menu-0-375.png) / [1024px](screens/menu-voices-choice-menu-0-1024.png) / [1440px](screens/menu-voices-choice-menu-0-1440.png)

- 対象件数は？　問い合わせとフィードバック10件。
- どの製品？　すべてが選択、Desk・Slideも可。
- 何と組み合わせる？　開始日、終了日、集計する。

375では候補が左の日付欄を覆う。広い2幅はフィルタが横並び。ラベル別の件数は右端で揃う。

### metrics-trends

担当者が直近7日の対応の傾向を比較する。 [375px](screens/metrics-trends-375.png) / [1024px](screens/metrics-trends-1024.png) / [1440px](screens/metrics-trends-1440.png)

- 期間は？　過去7日とチップ。
- どのくらい？　平均53分、一度で解決50%、平均作業10分。
- 信頼できる母数？　5件未満は目安、対象4件など。

375では先頭の指標2枚が主に見え、広い2幅は3・2・3枚構成。細い線のどの期間を表すかは説明の再読が必要。

### operation-result

担当者が集計処理の数値結果を読む。 [375px](screens/operation-result-375.png) / [1024px](screens/operation-result-1024.png) / [1440px](screens/operation-result-1440.png)

- どの対象期間？　Slideと2026年10月18日〜11月18日。
- 主要値は？　平均4日・一度で解決100%。
- 数えられない値は？　待たずに解決の割合や平均作業時間がデータなし。

3幅で指標名と値は左右に整列。広い画面でも他の集計ページと違って受信箱への戻りだけが目立つ。

### public-404

顧客が公開ページの404から復帰する。 [375px](screens/public-404-375.png) / [1024px](screens/public-404-1024.png) / [1440px](screens/public-404-1440.png)

- 何が起きた？　ページが見つかりません。
- どこにいる？　上のSlide。
- 回復は？　アドレス確認の説明とヘルプに戻る。

375・1024・1440で説明と戻る操作は同じ順。製品の対象と回復先が短い領域内に収まる。

### public-query

顧客が製品に限定して記事を探す。 [375px](screens/public-query-375.png) / [1024px](screens/public-query-1024.png) / [1440px](screens/public-query-1440.png)

- 製品は？　Slideのヘッダー。
- 検索条件は？　領収書と解除印、1件。
- 結果以外は？　領収書の記事の下にメール問い合わせ。

3幅とも同じ狭い読み幅、375では入力と結果の間に条件が独立。全製品の検索より出口が簡素。

### result

担当者が過去30日の対応結果を俯瞰する。 [375px](screens/result-375.png) / [1024px](screens/result-1024.png) / [1440px](screens/result-1440.png)

- 対象は？　全製品・過去30日。
- 主な値は？　平均4日、1回で解決100%。
- 未計測は？　平均作業時間等がデータなしと文字表示。

375は説明の後に指標が1枚ずつ、1024・1440は3・2・3枚。サンプル少数の注記が指標群から離れる。

### retention

管理者が完了会話の保持期間を変える。 [375px](screens/retention-375.png) / [1024px](screens/retention-1024.png) / [1440px](screens/retention-1440.png)

- 何の期間？　完了した会話。
- 今は？　無期限のラジオが選択。
- ほかは？　日数を指定、保存期間を変更と取り消し。

3幅で選択肢は縦に近接。設定を短くした場合に既存会話がいつ消えるかはこの状態の説明に見えない。

### route-dev-ui

開発者が共通部品の一覧・詳細の構成を比較する。 [375px](screens/route-dev-ui-375.png) / [1024px](screens/route-dev-ui-1024.png) / [1440px](screens/route-dev-ui-1440.png)

- 何のページ？　UI部品見本。
- どう探す？　一覧・詳細・編集・概要・状態への上部リンク。
- 例は？　受信箱2行と記事行の後に詳細。

375は詳細の冒頭まで、1024・1440は詳細見出しと操作まで。実製品と違う「新着順」「記事を書く」が受信箱内の見本に並ぶ。

### route-help

顧客が全公開窓口から目的に合うものを選ぶ。 [375px](screens/route-help-375.png) / [1024px](screens/route-help-1024.png) / [1440px](screens/route-help-1440.png)

- 何の製品？　Slideが1件。
- 自己解決は？　ヘルプ記事と自動で記事を探すチャット。
- 人に届ける場合は？　返信を希望する問い合わせ、返信不要の意見。

375は項目名・説明が2行、広い2幅は1行。4入口の違いは読めるが区切り線だけで行の移動操作を示す。

### route-help-absent-slide

顧客が利用できないSlideのURLから復帰する。 [375px](screens/route-help-absent-slide-375.png) / [1024px](screens/route-help-absent-slide-1024.png) / [1440px](screens/route-help-absent-slide-1440.png)

- どの製品？　上にSlide。
- 何が起きた？　ページが見つからない。
- 次は？　ヘルプに戻る、またはアドレス確認。

3幅で公開404と同じ構成。機能停止・非公開・URL誤りのどれかまでは画像から区別できない。

### route-mail-in-6

担当者が受信メール原文の表示内容を読む。 [375px](screens/route-mail-in-6-375.png) / [1024px](screens/route-mail-in-6-1024.png) / [1440px](screens/route-mail-in-6-1440.png)

- 何の内容？　購入のお礼。
- 照合できる番号は？　SL-2026-128。
- どの会話へ戻る？　本文2行のみで送信者・会話名・戻る操作は写らない。

3幅で左上の同じ2行と大きな白地。別タブや埋め込みの原文断片なら許容でき、実際の開き方は未確認。

### suggest-editor

編集者が記事の無かった質問を元に執筆する。 [375px](screens/suggest-editor-375.png) / [1024px](screens/suggest-editor-1024.png) / [1440px](screens/suggest-editor-1440.png)

- 製品は？　Slide。
- 何を書く？　月別の利用履歴集計の質問が題名に入る。
- 次は？　空の本文と任意要約、広い2幅の下に公開・下書き等。

375では題名欄が一行で末尾が端に近い。候補編集と違い元質問を並べる独立カードは見えない。

### suggest-form

顧客が問い合わせ提出前に提案記事を試す。 [375px](screens/suggest-form-375.png) / [1024px](screens/suggest-form-1024.png) / [1440px](screens/suggest-form-1440.png)

- 何を試す？　領収書発行の記事を新しいタブで開く。
- 提出する中身は？　件名・問い合わせ内容・返信先を再表示。
- 記事で解決したら？　元の画面にある選択は入力修正と「このまま送る」だけ。

3幅すべてで二つの操作の下に余白。自己解決して送らず終了する入口を置き、未送信を伝えたい。

### suggest-human

顧客が二重請求の相談を人へ引き継ぐ。 [375px](screens/suggest-human-375.png) / [1024px](screens/suggest-human-1024.png) / [1440px](screens/suggest-human-1440.png)

- どの質問？　領収書の金額相違・二重請求を調査したい。
- 誰に頼める？　黒い「担当者に問い合わせる」。
- 記事も読める？　領収書記事と解決の2択。

375では人への操作が全幅、広い2幅はラベル幅。人に依頼することと通常の記事評価が視覚的に分かれる。

### suggest-library

編集者が記事の利用状況を見て改善対象を選ぶ。 [375px](screens/suggest-library-375.png) / [1024px](screens/suggest-library-1024.png) / [1440px](screens/suggest-library-1440.png)

- 何件？　1件・公開中の領収書記事。
- 反響は？　提示4回、閲覧1回、解決率0%、見直し候補。
- 別の材料は？　記事が無かった質問と候補0件。

375は題の下に数値が密集、広い2幅は更新日や評価の位置が横に離れる。「見直し候補」は件名と近いほど判断しやすい。

### suggest-metric

担当者が記事提案で自己解決した割合を読む。 [375px](screens/suggest-metric-375.png) / [1024px](screens/suggest-metric-1024.png) / [1440px](screens/suggest-metric-1440.png)

- 何の割合？　待たずに解決できた割合。
- 母数は？　1件/4件で25%。
- 比較できる？　前期の比較データなし。

375は目的指標までスクロールした画像で期間が見えず、広い2幅は過去30日・全製品も見える。手元で期間を照合できる工夫に余地。

### suggest-questions

編集者が回答記事のない質問から新記事を起こす。 [375px](screens/suggest-questions-375.png) / [1024px](screens/suggest-questions-1024.png) / [1440px](screens/suggest-questions-1440.png)

- 何件？　1件。
- どの質問？　チームの利用履歴を月別集計できるか、Slide。
- 次は？　同じ行の「記事を書く」。

375は件名が2行、製品印がその下。広い2幅は件名の横に印、行の右端に作成操作。

### suggest-questions-empty

編集者が回答記事のない質問があるか確かめる。 [375px](screens/suggest-questions-empty-375.png) / [1024px](screens/suggest-questions-empty-1024.png) / [1440px](screens/suggest-questions-empty-1440.png)

- 件数は？　0件。
- 範囲は？　すべてのプロダクト。
- 次に何をする？　該当する質問がまだないとの説明、上部に記事一覧へ戻る。

375では空文の最後の「ん。」だけが次行。広い2幅は1行、空の状態から製品変更や戻る入口まで離れる。

### survey-thanks

顧客がアンケートの回答完了を確認する。 [375px](screens/survey-thanks-375.png) / [1024px](screens/survey-thanks-1024.png) / [1440px](screens/survey-thanks-1440.png)

- どの案件？　問い合わせ#8。
- 届いた？　「回答を記録しました」。
- 次の行動は？　ヘルプへ戻る・ページを閉じてよい等の案内が見えない。

3幅で見出しと緑の受付帯だけが上部にあり下は空白。他の受付画面のような帰路がない。

### voices

担当者が問い合わせ・意見の内訳を確認する。 [375px](screens/voices-375.png) / [1024px](screens/voices-1024.png) / [1440px](screens/voices-1440.png)

- 何を集計？　10件、迷惑メール除外。
- 一番多いラベル？　ラベルなし7件、経理・請求各2件。
- 元の声は？　該当する声を見る。

375は日付欄が横2列で集計操作は次段。広い2幅はフィルタが1列。全期間表示中でも日付欄は英語形式の空欄。

### voices-filtered

担当者が製品で絞った元の声を確かめる。 [375px](screens/voices-filtered-375.png) / [1024px](screens/voices-filtered-1024.png) / [1440px](screens/voices-filtered-1440.png)

- 条件は？　Slide・全期間・9件。
- どの種類？　問い合わせ／フィードバックの区分。
- 戻れる？　声の集計に戻る。

375では製品と日付が件名の下、種類が右。広い2幅では列に揃う。既にSlideに絞った後も全行に同じ製品印を繰り返す。

### voices-trends

担当者が特定期間の声の推移を比較する。 [375px](screens/voices-trends-375.png) / [1024px](screens/voices-trends-1024.png) / [1440px](screens/voices-trends-1440.png)

- どの期間？　10/01〜11/18。
- 何件？　27件、請求8件等。
- 傾向は？　ラベル別・製品別の横棒、右端に折線と件数。

375はラベル上位だけで画面下に続く。広い2幅は製品別も見える。線の横には各区間の日付は記されていない。

### widget-article

顧客が埋め込みのまま記事を読む。 [375px](screens/widget-article-375.png) / [1024px](screens/widget-article-1024.png) / [1440px](screens/widget-article-1440.png)

- 内容は？　領収書発行の3段階。
- 戻るには？　上部の「やりとりに戻る」。
- 広く読める？　新しいタブで開く、下に問い合わせ入口。

375は全画面、1024・1440は請求画面右下に記事。広い幅は背後の明細列に重なるが×で閉じる入口あり。

### widget-closed

顧客が請求履歴からヘルプを呼び出す。 [375px](screens/widget-closed-375.png) / [1024px](screens/widget-closed-1024.png) / [1440px](screens/widget-closed-1440.png)

- どの画面？　請求・領収書と支払い履歴。
- 対象データは？　11月・10月の金額とCSV。
- 相談はどこ？　右下のヘルプ。

3幅でボタンは表から離れ、履歴を覆わない。375でも2行の履歴とボタンが見える。

### widget-csp

管理者が埋め込みに必要なCSP設定を調べる。 [375px](screens/widget-csp-375.png) / [1024px](screens/widget-csp-1024.png) / [1440px](screens/widget-csp-1440.png)

- どこに設定？　埋め込み先サイト。
- 何を許可？　script-srcとframe-srcにヘルプデスクのオリジン。
- どの環境？　127.0.0.1とこの端末用のコード。

375では説明とコードの折り返しが多い。広い2幅は同じ設定カード内、公開に必要な値と端末用の値を取り違えない説明は上部。

### widget-edit-response

管理者がチャット返信の目安を設定する。 [375px](screens/widget-edit-response-375.png) / [1024px](screens/widget-edit-response-1024.png) / [1440px](screens/widget-edit-response-1440.png)

- 対象は？　Desk受付開始前、Slide受付中。
- 何を入力？　返信の目安、例は2営業日以内。
- どこに出る？　問い合わせ受付後に利用者へ表示する説明。

375は上部のDeskとSlideの受付・URLが先で、開いた入力欄は画面下。広い2幅は編集と保存を確認できる。

### widget-edit-sites

管理者がチャット埋め込み先を登録する。 [375px](screens/widget-edit-sites-375.png) / [1024px](screens/widget-edit-sites-1024.png) / [1440px](screens/widget-edit-sites-1440.png)

- どの製品？　受付中のSlide。
- 現在いくつ？　埋め込み先0件。
- 次は？　埋め込み先のサイト欄と登録、取り消し。

375の画面末尾にはラベルまで、広い2幅は例URLと操作まで見える。製品ごとの長いカードで編集対象が遠い。

### widget-handoff

顧客がチャットの内容を担当者に送る。 [375px](screens/widget-handoff-375.png) / [1024px](screens/widget-handoff-1024.png) / [1440px](screens/widget-handoff-1440.png)

- 何が届く？　これまでの質問を送るとの説明。
- 必要な入力は？　メール、名前は任意。
- 引き返せる？　送信の横に質問に戻る。

375は全画面、広い2幅は右下パネル。3幅でメール欄に青枠、関連する質問と記事が上に残る。

### widget-no-match

顧客が該当記事のない質問を引き継ぐ。 [375px](screens/widget-no-match-375.png) / [1024px](screens/widget-no-match-1024.png) / [1440px](screens/widget-no-match-1440.png)

- 何の質問？　チームの名前を変更したい。
- なぜ引き継ぐ？　記事が見つからなかったと説明。
- 次は？　返信先メール、任意の名前、送信か質問に戻る。

375は全幅、広い2幅は請求画面の上。人に届くタイミングを自動検索結果の下で読める。

### widget-open

顧客が埋め込みチャットで質問を始める。 [375px](screens/widget-open-375.png) / [1024px](screens/widget-open-1024.png) / [1440px](screens/widget-open-1440.png)

- どこに相談？　「Slideのヘルプ」。
- 何が起きる？　まず関連する記事を自動で検索。
- 他の入口は？　記事一覧、返信不要の意見、問い合わせフォーム。

375では3リンクがほぼ横幅いっぱいの1行、広い2幅はカード下で折り返す。質問欄に明瞭な青枠。

### widget-options

管理者がチャットボタンと案内文を調整する。 [375px](screens/widget-options-375.png) / [1024px](screens/widget-options-1024.png) / [1440px](screens/widget-options-1440.png)

- 位置は？　右下が選択。
- 表示は？　ボタン文言ヘルプ、最初の説明文欄。
- 変更をどう確認？　変更したボタンを見本で確認。

375ではコードとコピーが編集より上、広い2幅にも端末用コードと設定項目が連続。実際に反映される時点は画像から未確認。

### widget-preview

管理者が埋め込みの見本を確認する。 [375px](screens/widget-preview-375.png) / [1024px](screens/widget-preview-1024.png) / [1440px](screens/widget-preview-1440.png)

- 何の見本？　「埋め込みの見本を開く」内のSlide。
- 質問可能？　青枠の欄と質問するボタン。
- 閉じ方は？　パネル右上に×。

375では設定カードの中にさらにフル幅風の枠、広い2幅は見本の右下。実際の公開先からの送信可否は判断不可。

### widget-receipt

顧客が埋め込み問い合わせの受付を確認する。 [375px](screens/widget-receipt-375.png) / [1024px](screens/widget-receipt-1024.png) / [1440px](screens/widget-receipt-1440.png)

- 届いた？　受付番号付きの文。
- どこに返信？　reader@example.com。
- 何を送った？　領収書の質問、記事のリンクが履歴に残る。

375・1024・1440で番号は#14・#13・#12、各画像の違いとして扱う。375はパネル全画面、広い2幅は右下。

### widget-suggestions

顧客が埋め込みの提案を評価する。 [375px](screens/widget-suggestions-375.png) / [1024px](screens/widget-suggestions-1024.png) / [1440px](screens/widget-suggestions-1440.png)

- どの記事？　領収書を発行する。
- 結果をどう伝える？　解決した／解決しなかった。
- 続けるには？　質問欄、フォーム等のフッター。

375は3つの出口が近接、広い2幅は右下カード内で2行に分かれる。評価と追加の質問は別の組として縦に並ぶ。
