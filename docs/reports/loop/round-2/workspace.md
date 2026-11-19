# 第2周　運営画面・公開ヘルプの目視レビュー

この周で撮り直した58状態・174枚を確認した。各状態で、作業目的と主操作、間隔や文字の切れ、表示中の状態と次の入口の3点以上を調べ、同じ用途の画面を3幅で見比べた。表には各幅の確認内容を記した。以下に挙げたもの以外に、高・中の指摘はなかった。

| 重さ | 対象と観察 | 影響・期待する状態 |
| --- | --- | --- |
| 中 | 振り分けルールの削除確認。全幅で件数だけを示し、375pxでは背景のルール名も画面に残らない。 | 複数のルールがある場合、どれを削除するか判断できない。対象の適用順・プロダクト・条件・割り当てと、削除する旨を確認内で読めるようにする。 |
| 低 | 操作結果の平均解決時間は5,760分、指標カードは4日。 | 各画面の値は正しい。横断して比較する場合の換算を減らすには、長い時間の表記をそろえるとよい。 |

第1周の運営者編集・検索欄・メール差出人・色選択・操作履歴・日本語の集計項目の修正を新しい画像で確認した。

| 状態 | 375px | 1024px | 1440px |
| --- | --- | --- | --- |
| account | 本人のメール・表示名・画像の条件・保存まで1画面で、ファイル欄のみブラウザー標準の英語を表示。 [画像](screens/account-375.png) | 画像の条件が保存の直前にあり、エラーと紛らわしい表示はない。 [画像](screens/account-1024.png) | サイドバーの本人名とフォームの識別子が一致する。 [画像](screens/account-1440.png) |
| article-candidates | 候補名は数行に折り返すが、記事作成と元会話の操作名は欠けない。 [画像](screens/article-candidates-375.png) | 1件の題とSlide、執筆・元会話を1行にまとめる。 [画像](screens/article-candidates-1024.png) | 検索に続いて記事化状態・並び順を選べる。 [画像](screens/article-candidates-1440.png) |
| article-edit | 公開記事を読む操作と編集見出しが同じ行に収まる。本文は下に続く。 [画像](screens/article-edit-375.png) | 既存の題名・任意要約・手順本文・公開が1枚のカードにまとまる。 [画像](screens/article-edit-1024.png) | 主操作は更新の公開、プレビュー・非公開保存・取り消しを区別できる。 [画像](screens/article-edit-1440.png) |
| article-index | プロダクト名・記事1件・検索欄の下に領収書の記事と問い合わせリンクが見える。 [画像](screens/article-index-375.png) | 中央の同じ左端で検索から記事に移れる。 [画像](screens/article-index-1024.png) | 読書幅を広げすぎず、記事の一覧と問い合わせを区切る。 [画像](screens/article-index-1440.png) |
| article-new | 新規のDeskを選んだ状態で、空の題名と要約の200文字目安が読める。 [画像](screens/article-new-375.png) | 公開を黒、下書き保存を補助に置く。 [画像](screens/article-new-1024.png) | 広い画面でも入力欄はフォーム幅を保つ。 [画像](screens/article-new-1440.png) |
| article-preview | 整形した題と手順の下にもう一度編集欄がある。 [画像](screens/article-preview-375.png) | 番号リストと入力中のMarkdownを縦に比べられる。 [画像](screens/article-preview-1024.png) | 完成形・編集部分を区切り、公開前に戻って直せる。 [画像](screens/article-preview-1440.png) |
| candidate-editor | 元会話の件名・本文と、その内容を踏まえた新規題名を上下に置く。 [画像](screens/candidate-editor-375.png) | 元の会話を開く導線が、要約・本文の入力より先にある。 [画像](screens/candidate-editor-1024.png) | 左に編集カードをまとめ、参照元の長文は画面幅に引き延ばさない。 [画像](screens/candidate-editor-1440.png) |
| console-404 | 赤い案内から「受信箱に戻る」へ直接進める。 [画像](screens/console-404-375.png) | エラーの下に広い復帰操作があり、再検索先が明らか。 [画像](screens/console-404-1024.png) | 常設の受信箱ナビと画面本文の復帰先が一致する。 [画像](screens/console-404-1440.png) |
| deletion | 対象者を選んでから内容を確認する2段階の入口が見える。 [画像](screens/deletion-375.png) | 削除範囲の説明が選択欄より前に来る。 [画像](screens/deletion-1024.png) | 最初の画面には即時削除の赤いボタンを置かず、確認に進む。 [画像](screens/deletion-1440.png) |
| forget | 長い相手のアドレスを折り返し、会話1件の対象説明と赤い確定が切れない。 [画像](screens/forget-375.png) | 中央の確認に対象者・会話件数・取り消し不可を1か所に表示。 [画像](screens/forget-1024.png) | 確定とキャンセルを隣に置き、背景の内容確認を暗幕で区別する。 [画像](screens/forget-1440.png) |
| gallery | 4つのテンプレートと状態を順に読み、スマートフォンでは指標が縦1列。 [画像](screens/gallery-375.png) | 連絡先を本文の下へ移し、3指標は横並び。 [画像](screens/gallery-1024.png) | 会話横に連絡先を置き、一覧・詳細・編集・集計を作例の見出しで区切る。 [画像](screens/gallery-1440.png) |
| issue-detail | 関連する2件の番号と人、未通知／通知済みを横並びで識別できる。 [画像](screens/issue-detail-375.png) | 修正前30日と修正後1日の分母を表示する。 [画像](screens/issue-detail-1024.png) | GitHubへの導線が見出しの右、声の一覧と数値比較が下にある。 [画像](screens/issue-detail-1440.png) |
| issue-new | 会話を選択し、件名と公開要約を入力する順で狭い画面にも収まる。 [画像](screens/issue-new-375.png) | 入力欄と個人情報についての注意の間に別操作がない。 [画像](screens/issue-new-1024.png) | 確認ボタンがフォームの左下にあり、外部へ送る前に進める。 [画像](screens/issue-new-1440.png) |
| issue-preview | 投稿先と要約のあと、送信する会話リンクのURLが折り返されて全体を確認できる。 [画像](screens/issue-preview-375.png) | 会話に戻る操作と起票操作が別の位置にある。 [画像](screens/issue-preview-1024.png) | リポジトリ・本文・問い合わせ番号がそろい、公開先を確認して押せる。 [画像](screens/issue-preview-1440.png) |
| issue-setup | 全面の関連情報に設定不足とGitHub設定を開く操作を出す。 [画像](screens/issue-setup-375.png) | 右の引き出しに未設定の理由を表示し、読み終えたら閉じられる。 [画像](screens/issue-setup-1024.png) | 元会話の右側で必要な設定とほかの問い合わせを別カードで読む。 [画像](screens/issue-setup-1440.png) |
| issues-board | 「知らせる待ち」に1件の下書き作成をまとめ、ほかの課題は下段に続く。 [画像](screens/issues-board-375.png) | 開いている課題と直した課題で比較項目を変え、件数の単位が付く。 [画像](screens/issues-board-1024.png) | 通知済み1/2を別列で表示し、まだ知らせていない1件と対応する。 [画像](screens/issues-board-1440.png) |
| label-colors | 各カードの色名が中央に揃い、矢印は1つになった。 [画像](screens/label-colors-375.png) | 3色それぞれで同じ形の選択欄と保存が続く。 [画像](screens/label-colors-1024.png) | 見えている再発行・社内確認・経理・請求の各色欄に重複した矢印がない。 [画像](screens/label-colors-1440.png) |
| loop-account-menu | 引き出し下にアカウント、すぐ上にキーボード操作の入口が開く。 [画像](screens/loop-account-menu-375.png) | 下端のアカウントから開いた項目が切れずに表示される。 [画像](screens/loop-account-menu-1024.png) | サイドバー付近だけで項目を示し、本文の行を覆わない。 [画像](screens/loop-account-menu-1440.png) |
| loop-canned-edit | 展開後は左から本文を書け、英語が2行に収まり、題と見本の対応をたどれる。 [画像](screens/loop-canned-edit-375.png) | 元の文と編集欄を上下に並べ、差し込み変数の説明も見える。 [画像](screens/loop-canned-edit-1024.png) | 編集が行の右端に押し込まれず、保存と取り消しが本文の下にある。 [画像](screens/loop-canned-edit-1440.png) |
| loop-chat-failed | 送信エラー後も入力した質問が欄にあり、赤い再試行案内とメール窓口が見える。 [画像](screens/loop-chat-failed-375.png) | 質問するボタンの下で案内を読んでやり直せる。 [画像](screens/loop-chat-failed-1024.png) | メールで問い合わせるリンクと記事一覧を別経路として表示。 [画像](screens/loop-chat-failed-1440.png) |
| loop-chat-solved | 提示記事が解決に役立った記録と、続けて質問する欄が同時に見える。 [画像](screens/loop-chat-solved-375.png) | 質問→記事→解決の順を読み、下部の窓口も選べる。 [画像](screens/loop-chat-solved-1024.png) | 見出しの下に短い結果がまとまり、次の操作が残る。 [画像](screens/loop-chat-solved-1440.png) |
| loop-dates | 2日付を選ぶポップアップが右端に収まり、画面外に出ない。 [画像](screens/loop-dates-375.png) | 日本時間の開始・終了を縦に置く。 [画像](screens/loop-dates-1024.png) | 指定期間チップとピッカー内の11月1日～18日を照合できる。 [画像](screens/loop-dates-1440.png) |
| loop-feedback-undo | #10の完了通知に「元に戻す」、対象行には確認済みが残り、検索欄は全幅。 [画像](screens/loop-feedback-undo-375.png) | フィードバック1件とサイドバー未確認0件を照合できる。 [画像](screens/loop-feedback-undo-1024.png) | 成功の淡緑と行の確認済みを色だけでなく文でも判別できる。 [画像](screens/loop-feedback-undo-1440.png) |
| loop-help-no-results | 入力済み検索語と解除用チップを残し、0件でもSlideの問い合わせに進める。 [画像](screens/loop-help-no-results-375.png) | 空状態の文と候補の製品カードを上下に分ける。 [画像](screens/loop-help-no-results-1024.png) | 画面に余白を残し、検索・空結果・次の入口の順を維持する。 [画像](screens/loop-help-no-results-1440.png) |
| loop-history | 時刻の左に箇条書き記号がなくなり、3イベントの先頭が揃う。 [画像](screens/loop-history-375.png) | 引き出しの中の2イベントも記号なし。同時に元の会話が見える。 [画像](screens/loop-history-1024.png) | 常設右パネルにメール受信時刻とシステム名を並べる。 [画像](screens/loop-history-1440.png) |
| loop-keyboard | ショートカットを3群に分け、操作を閉じる青い枠も画面内に収める。 [画像](screens/loop-keyboard-375.png) | 閉じるボタンの位置が右下、元の受信箱は暗い。 [画像](screens/loop-keyboard-1024.png) | 受信箱・会話で違うキーを同時に照合できる。 [画像](screens/loop-keyboard-1440.png) |
| loop-label-new | 選択済みの色付き候補の下に入力が開き、フォーカス枠と作成操作が見える。 [画像](screens/loop-label-new-375.png) | ラベルの候補名、チェック、追加が同じパネル内にある。 [画像](screens/loop-label-new-1024.png) | 本文の上に小さく候補を展開し、ほかの操作と区別する。 [画像](screens/loop-label-new-1440.png) |
| loop-link-confirm | リポジトリ、#42の対象、コメントに投稿する会話URLが枠に収まる。 [画像](screens/loop-link-confirm-375.png) | 長い確認操作とキャンセルを1行に置く。 [画像](screens/loop-link-confirm-1024.png) | 背景側にも先頭に番号付きの課題候補があり、確認対象と一致する。 [画像](screens/loop-link-confirm-1440.png) |
| loop-mailbox-add | 開いた追加フォームのDesk、窓口アドレス先頭、ドメイン、追加まで見える。 [画像](screens/loop-mailbox-add-375.png) | 新しいプロダクトと既存のDeskへの窓口追加が上下に分かれる。 [画像](screens/loop-mailbox-add-1024.png) | 2つのフォームの異なる確定名と取り消しを同時に確認できる。 [画像](screens/loop-mailbox-add-1440.png) |
| loop-merge-confirm | 会話#1を#2にまとめる方向が短い画面の確認にも明記されている。 [画像](screens/loop-merge-confirm-375.png) | 2件の件名が揃い、先・元を読み分けて取り消せる。 [画像](screens/loop-merge-confirm-1024.png) | 背景にある候補と確認ダイアログの対象番号が一致する。 [画像](screens/loop-merge-confirm-1440.png) |
| loop-metric-definition | 長い説明が細めの黒い吹き出しに収まり、隣の自己解決カードは読める。 [画像](screens/loop-metric-definition-375.png) | 計算対象と比較期間の定義を表示し、情報アイコンがフォーカスされている。 [画像](screens/loop-metric-definition-1024.png) | 主要指標の下にある該当カード上で説明を読める。 [画像](screens/loop-metric-definition-1440.png) |
| loop-navigation | 引き出しに現在の受信箱、拡張、設定、右上の閉じるをまとめる。 [画像](screens/loop-navigation-375.png) | 常設ナビのブランドに青いフォーカスがあり、本文はその右側。 [画像](screens/loop-navigation-1024.png) | ナビ選択と受信箱の件数を同時に追える。 [画像](screens/loop-navigation-1440.png) |
| loop-operator-edit | 対象moriの名前と権限を示し、行の下に編集欄が丸ごと展開する。 [画像](screens/loop-operator-edit-375.png) | 開閉名に続く重複見出しがなくなり、表示名・権限・保存が続く。 [画像](screens/loop-operator-edit-1024.png) | 別運営者の行と編集フォームの境界が明らか。 [画像](screens/loop-operator-edit-1440.png) |
| loop-publish | 公開する記事名と公開先を確認し、2つの操作を枠内に収める。 [画像](screens/loop-publish-375.png) | 入力済み本文を背景に見ながら公開を確認できる。 [画像](screens/loop-publish-1024.png) | 背景の公開ボタンと実行待ちの公開ボタンを暗幕で分ける。 [画像](screens/loop-publish-1440.png) |
| loop-quick-actions | 青い枠の先頭行に担当・完了のアイコンが並び、長い件名は省略される。 [画像](screens/loop-quick-actions-375.png) | 先頭以外の行には同じアイコンが出ず、対象を識別できる。 [画像](screens/loop-quick-actions-1024.png) | 行末の操作と選択チェックが左右に分かれる。 [画像](screens/loop-quick-actions-1440.png) |
| loop-reply-preview | 差出人、宛先、件名、本文がひとつのプレビュー内に揃って見える。 [画像](screens/loop-reply-preview-375.png) | 入力した返信と相手に届く文面を縦に比較できる。 [画像](screens/loop-reply-preview-1024.png) | 右の文脈欄を残し、表示を切り替えたプレビューの末尾まで読める。 [画像](screens/loop-reply-preview-1440.png) |
| loop-reply-undo | 次の動作が会話の完了であることを明記し、取り消しを直後に置く。 [画像](screens/loop-reply-undo-375.png) | 送信待ちの返信の上に取り消しがある。 [画像](screens/loop-reply-undo-1024.png) | 受付通知・送信後完了・取り消し・送信待ちを順番に読める。 [画像](screens/loop-reply-undo-1440.png) |
| loop-revoke | 対象トークンとCLIへの影響が書かれ、赤の失効が枠内に収まる。 [画像](screens/loop-revoke-375.png) | 背景の発行行と確認文のトークン名が一致。 [画像](screens/loop-revoke-1024.png) | キャンセルと失効が区別され、開いた枠内に確定が一つだけ。 [画像](screens/loop-revoke-1440.png) |
| loop-rule-delete | 件名の条件は背景の上端に隠れ、確認自体は「選択した振り分けルール1件」とだけ表示する（中）。 [画像](screens/loop-rule-delete-375.png) | 複数のルールが並ぶ場合に確認内の情報から削除対象を識別できない。 [画像](screens/loop-rule-delete-1024.png) | 背景に編集欄が残るが、前景は件数だけ、確定名も「解除」となる。 [画像](screens/loop-rule-delete-1440.png) |
| loop-rule-edit | 元のルール名と件名条件を横書きで表示し、展開は下段に移った。 [画像](screens/loop-rule-edit-375.png) | 全プロダクトへの適用と件名・ラベルを左揃えで照合できる。 [画像](screens/loop-rule-edit-1024.png) | 表示順は行末、編集の保存・取り消しはフォームの下にある。 [画像](screens/loop-rule-edit-1440.png) |
| mailboxes | Slideの差出人名、名前を含めるチェック、保存操作が縦に繋がり、チェック文は隣に収まる。 [画像](screens/mailboxes-375.png) | 新プロダクトの登録を差出人編集からカードで分ける。 [画像](screens/mailboxes-1024.png) | チェックと説明が同じ行の左端に並び、以前の分離が解消している。 [画像](screens/mailboxes-1440.png) |
| metrics-trends | 53分・50%・10分を上から読み、50%には対象4件の注記が付く。 [画像](screens/metrics-trends-375.png) | 3つの主要指標を先に見せ、画面幅に応じて補助指標が改行する。 [画像](screens/metrics-trends-1024.png) | 件数・比較・傾向線の高さを各組内で揃える。 [画像](screens/metrics-trends-1440.png) |
| operation-result | 記事の提示件数と記事で解決した件数の2項目が日本語に変わり、0件を読める。 [画像](screens/operation-result-375.png) | 件数と「データなし」が別の値として並び、内部キーが消えた。 [画像](screens/operation-result-1024.png) | 平均解決時間は5,760分。指標の4日と比較する際には換算が生じる（低）。 [画像](screens/operation-result-1440.png) |
| operators | 検索が独立して「運営者を検索」を全文表示。下の権限と並び順も全文が読める。 [画像](screens/operators-375.png) | 検索・権限・並び順を横に置き、2人の役割と編集操作が行末で揃う。 [画像](screens/operators-1024.png) | 各行でアドレスと権限の間に余白があり、編集対象をたどれる。 [画像](screens/operators-1440.png) |
| product-icon-settings | アイコンの選択欄・保存・差出人設定の順で、チェックは説明と横に並んだ。 [画像](screens/product-icon-settings-375.png) | Deskの設定と下のSlideの設定が別カード。 [画像](screens/product-icon-settings-1024.png) | アイコン種類の矢印は1つ、差出人の保存は別操作として見える。 [画像](screens/product-icon-settings-1440.png) |
| product-switcher | ナビゲーション引き出しの上に3項目が開き、現在のSlideを表示する。 [画像](screens/product-switcher-375.png) | 常設の左ナビ側だけに候補が開く。 [画像](screens/product-switcher-1024.png) | 現在の製品チップと、絞り込み後の6件の一覧を同時に確認できる。 [画像](screens/product-switcher-1440.png) |
| retention | 0日の真下に無期限の説明、保存と取り消しがその下にある。 [画像](screens/retention-375.png) | コンパクトな数値欄の直後に設定結果が分かる。 [画像](screens/retention-1024.png) | 短いフォームが左側に収まり、変更操作が一つ目立つ。 [画像](screens/retention-1440.png) |
| settings-home | 検索の下に窓口2件・運営者2人・ラベル6件が揃い、データ管理を別枠にする。 [画像](screens/settings-home-375.png) | 件数と説明、次のページへの矢印の位置が一貫する。 [画像](screens/settings-home-1024.png) | 無期限・取り消し不可の状態と対象の設定を行単位で照合できる。 [画像](screens/settings-home-1440.png) |
| states | 青枠付きのヒント、赤枠入力、2種の通知を見分けられる。 [画像](screens/states-375.png) | 候補リストと空状態を縦に並べ、背景と通知色が混同しない。 [画像](screens/states-1024.png) | 説明吹き出し・無効選択・選択印・スケルトンがそれぞれ対応する部品に付く。 [画像](screens/states-1440.png) |
| suggest-editor | 対象Slideと質問入りの題名があり、任意要約は空のまま入力できる。 [画像](screens/suggest-editor-375.png) | 公開・プレビュー・下書きの操作を本文の後に置く。 [画像](screens/suggest-editor-1024.png) | フォーム幅が固定され、質問由来の題と入力すべき本文を区別できる。 [画像](screens/suggest-editor-1440.png) |
| suggest-library | 公開状態・並び順が検索の下に並び、記事行の提示4回・閲覧1回も読める。 [画像](screens/suggest-library-375.png) | 上に3操作、その下に検索と結果を1件表示。 [画像](screens/suggest-library-1024.png) | 黒い記事作成と補助の候補・質問を区別できる。 [画像](screens/suggest-library-1440.png) |
| suggest-metric | 補助カードの1件/4件と25%が同時に読め、データなしや0%と区別できる。 [画像](screens/suggest-metric-375.png) | 主指標3枚と補助指標の間に間隔があり、対象件数が各カードにある。 [画像](screens/suggest-metric-1024.png) | 主要と補助を同じ大きさにせず、定義・母数と値を対応付けできる。 [画像](screens/suggest-metric-1440.png) |
| suggest-questions | 質問は2行に折り返し、右に記事を書く操作、下に対象Slideを表示する。 [画像](screens/suggest-questions-375.png) | 質問と製品を同じ行に収め、1件の母数を見られる。 [画像](screens/suggest-questions-1024.png) | 一覧への戻り先と、質問から執筆する次の操作が両方ある。 [画像](screens/suggest-questions-1440.png) |
| suggest-questions-empty | 虫眼鏡と「まだありません」の文が検索対象の下にあり、0件と一致。 [画像](screens/suggest-questions-empty-375.png) | プロダクトを選び直せる状態で空案内を中央に置く。 [画像](screens/suggest-questions-empty-1024.png) | 上部の戻る操作、0件、空表示が同時に見える。 [画像](screens/suggest-questions-empty-1440.png) |
| tokens | 検索・権限・並び順の文字は読め、一覧0件の下に新規フォームが続く。 [画像](screens/tokens-375.png) | 発行済みなしを鍵の絵と文で示し、その下に権限「閲覧」を置く。 [画像](screens/tokens-1024.png) | 新しいトークンへの操作とフォームの黒い発行が上下に分かれる。 [画像](screens/tokens-1440.png) |
| voices | プロダクト→開始日・終了日→集計の順。長いラベルもグラフの左に収まる。 [画像](screens/voices-375.png) | ラベル別・プロダクト別の件数と折れ線を各行内に置く。 [画像](screens/voices-1024.png) | ラベルなし7件とDesk1件などの比較が数字とバーで可能。 [画像](screens/voices-1440.png) |
| voices-filtered | 長い件名は折り返され、日付・製品・声の種類は行単位で対応する。 [画像](screens/voices-filtered-375.png) | 取得した9件を縦に並べ、フィードバックだけ種別が変わる。 [画像](screens/voices-filtered-1024.png) | 期間内の声を確認後、元の集計へ戻れる。 [画像](screens/voices-filtered-1440.png) |
| voices-trends | 選択中の2日付の下に、8件と7件のラベルが順に並ぶ。 [画像](screens/voices-trends-375.png) | 2製品の20件・7件と受付月別見出しが同時に見える。 [画像](screens/voices-trends-1024.png) | 折れ線と数値は右端に固定され、長いラベルとも重ならない。 [画像](screens/voices-trends-1440.png) |

## 同周の修正と検証

振り分けルールの削除ダイアログに適用順・対象プロダクト・件名の条件・変更先を表示しました。修正後の3幅とも、ダイアログ内で「1番目」「全プロダクト」「領収書」「請求」を確認でき、キャンセルと赤い削除ボタンを区別できました。キャンセルして編集に戻る操作と、保存したルールの編集・並べ替え・削除を含むブラウザーテスト2件が通りました。

拡張グループで記録した中3件も同時に修正しました。375pxの定型返信一覧では見本文が行の幅を使い、会話で定型返信を選ぶと返信欄が見本と下書きボタンの下に続きます。スヌーズと迷惑メール操作の間に3幅とも8pxの余白を確保しました。振り分けルールの確認を含む5状態を3幅で再撮影し、画面構成・余白・アクセシビリティの検査が通りました。拡張グループの3件はこの表の件数に含めていません。
