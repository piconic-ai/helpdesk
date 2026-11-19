# 第1周　運営画面・公開ヘルプの目視レビュー

指定された58状態について、同じ周の375・1024・1440pxのPNGを3枚ずつ開き、操作対象・文字の折り返し・前景と背景の区別を確認した。合計174枚。確認対象は設定、記事、課題、指標と操作中の画面を含む。

## 原因別の指摘

| 優先度 | 対象 | 観察と影響 | 期待する表示 |
| --- | --- | --- | --- |
| 高 | 振り分けルール・定型返信・運営者の行を展開 | 375pxのルール編集で元の条件が1文字ずつ縦に並ぶ。削除確認の背景でも、何を削除するのか読み取りにくい。定型返信と運営者も、幅の半分ずつで編集と元の情報を表示する。 | 狭い画面では元の設定に続いて編集フォームが幅いっぱいに開き、内容を照合できる。 |
| 中 | 集計操作の結果 | 3幅とも、提示数と解決数の項目名だけが `shownSuggestions`、`solvedSuggestions` となり、何の件数か分からない。 | 他の指標と同じ日本語で、記事の提示件数と記事で解決した件数を識別できる。 |
| 中 | プロダクトと窓口・メール差出人 | 3幅とも「返信した運営者の表示名を差出人に含める」のチェックボックスがフォーム中央、説明は下の行の左端に離れる。 | チェックと説明がひとまとまりになり、説明を押して切り替えられる。 |
| 中 | 運営者・APIトークンの検索と並び順 | 375pxで検索欄と2つの選択欄が1行を奪い合い、現在の並び順や検索対象が途中までしか見えない。 | 狭い画面では条件行を折り返し、検索対象と選択中の条件を読める。 |
| 中 | 運営者の編集見出し | 開いた行で運営者名が2度続く。3幅すべてでaxeもH1直後のH3を指摘した。 | 開いた編集フォームの対象を、見出しナビゲーションでも階層を飛ばさず把握できる。 |
| 低 | ラベルの色・振り分けルールでのラベル選択 | 色名のすぐ右の黒い▼と枠右端の灰色の矢印が重なる意味の印として表示される。375pxの原寸でも二重に見え、文字が上に寄る。 | 選択を開く印は一つ、色名は欄の高さの中央に揃う。 |
| 低 | 会話の操作履歴 | 3幅とも、時刻の左にブラウザー標準の黒い箇条書き記号が現れる。デザイン検査でも同じ箇所を検出。 | 時刻から各イベントを揃えて読み進められる。 |

## 状態別の確認

各行の状態名は同じ周のPNGに対応する。幅の見出しから下のセルは、それぞれの画像で確認した内容である。

| 状態 | 375px | 1024px | 1440px |
| --- | --- | --- | --- |
| account | プロフィールから保存まで見える。ファイル選択の操作だけ英語で表示される。 [画像](screens/account-375.png) | アイコン形式の説明が画像選択の直下にある。 [画像](screens/account-1024.png) | 表示名、画像選択、保存が同じカード内で読める。 [画像](screens/account-1440.png) |
| article-candidates | 題名が狭い左列で3行に割れ、右に記事化と元会話の操作が並ぶ。 [画像](screens/article-candidates-375.png) | 検索と2条件を1行に表示し、候補の題名と元会話を同じ行に出す。 [画像](screens/article-candidates-1024.png) | 1件の候補について記事を書き始める操作と元の会話を区別できる。 [画像](screens/article-candidates-1440.png) |
| article-edit | 題名の右に公開記事を読む操作があり、本文が画面下に続く。 [画像](screens/article-edit-375.png) | 要約説明・Markdown本文・公開操作が一画面に揃う。 [画像](screens/article-edit-1024.png) | 編集カードの端に沿って公開記事を読むボタンが置かれる。 [画像](screens/article-edit-1440.png) |
| article-index | Slide、検索、記事1件、問い合わせリンクが一列。 [画像](screens/article-index-375.png) | 中央の読書幅内で記事とフッターを線で区切る。 [画像](screens/article-index-1024.png) | 広い余白の中でも同じ順番と左端を保つ。 [画像](screens/article-index-1440.png) |
| article-new | 題名・任意要約・本文が1列に並び、本文途中で初期表示が終わる。 [画像](screens/article-new-375.png) | プロダクト名から公開・プレビュー・下書き保存まで一画面に収まる。 [画像](screens/article-new-1024.png) | カードの幅が維持され、各操作が1列に並ぶ。 [画像](screens/article-new-1440.png) |
| article-preview | 整形済みの番号付き手順が、再編集用の題名・要約の上に出る。 [画像](screens/article-preview-375.png) | プレビューと下の編集カードの境界が見える。 [画像](screens/article-preview-1024.png) | 番号付きの完成形とMarkdownの編集欄を同じ画面で照合できる。 [画像](screens/article-preview-1440.png) |
| candidate-editor | 元の会話と記事内容が縦に連なり、元の会話を開く操作が先にある。 [画像](screens/candidate-editor-375.png) | 元会話の短文と初期題名を続けて読める。 [画像](screens/candidate-editor-1024.png) | 要約と本文の入力を、元の会話と同じ幅で表示する。 [画像](screens/candidate-editor-1440.png) |
| console-404 | 見出し、赤い案内、受信箱へ戻るボタンが分離して読める。 [画像](screens/console-404-375.png) | 戻るボタンが本文幅いっぱいに出る。 [画像](screens/console-404-1024.png) | 受信箱ナビゲーションを残しながら、本文にも復帰操作がある。 [画像](screens/console-404-1440.png) |
| deletion | 対象者の選択と「削除内容を確認」が同じカードに収まる。 [画像](screens/deletion-375.png) | 削除範囲の説明が選択欄の前にある。 [画像](screens/deletion-1024.png) | データ削除の見出しと確認ボタンが同じ左端に並ぶ。 [画像](screens/deletion-1440.png) |
| forget | 対象の名前・アドレスと取り消せない操作の説明が折り返され、赤い確定ボタンが収まる。 [画像](screens/forget-375.png) | 背景を覆った中央に対象と削除件数を表示。 [画像](screens/forget-1024.png) | キャンセルと赤い確定が並び、背景の削除画面と区別できる。 [画像](screens/forget-1440.png) |
| gallery | 指標カードは1列、会話本文の下に連絡先が続く。 [画像](screens/gallery-375.png) | 指標は3列、連絡先は会話の下に出る。 [画像](screens/gallery-1024.png) | 連絡先が右側に移り、返信・内部メモ・記事編集の作例を順に読める。 [画像](screens/gallery-1440.png) |
| issue-detail | 直した課題の見出しが折り返され、2件の声と修正前後の件数が続く。 [画像](screens/issue-detail-375.png) | 2件の通知状態は行末に、修正前後は2列に表示する。 [画像](screens/issue-detail-1024.png) | 右上のGitHubリンク、声の一覧、前後比較が同時に見える。 [画像](screens/issue-detail-1440.png) |
| issue-new | 元の会話、タイトル、公開要約と個人情報に関する注意が一画面に収まる。 [画像](screens/issue-new-375.png) | 確認操作が要約の注意の直下にある。 [画像](screens/issue-new-1024.png) | 入力を広げ過ぎず、順番に確認できる。 [画像](screens/issue-new-1440.png) |
| issue-preview | 会話へのMarkdownリンクを生のURLと括弧のまま3行に折り返す。 [画像](screens/issue-preview-375.png) | 起票先と本文の下に1行のMarkdownリンク、その下に確定ボタンがある。 [画像](screens/issue-preview-1024.png) | 同じカードでリポジトリと起票操作を確認できる。 [画像](screens/issue-preview-1440.png) |
| issue-setup | 関連情報が全面を使い、リポジトリ設定が必要な理由と設定を開く操作がある。 [画像](screens/issue-setup-375.png) | 右の引き出しの背後に元の会話が見える。 [画像](screens/issue-setup-1024.png) | 会話に並ぶ右側の常設カードとして同じ設定案内が出る。 [画像](screens/issue-setup-1440.png) |
| issues-board | 知らせる待ちの下書きボタンが先頭、開いている課題と直した課題が縦に続く。 [画像](screens/issues-board-375.png) | 各課題のプロダクトと件数を列で比較できる。 [画像](screens/issues-board-1024.png) | 直した課題には通知人数1/2を独立した列で表示する。 [画像](screens/issues-board-1440.png) |
| label-colors | 色名の右に黒い▼と灰色の下向き印が2つ出て、値が選択欄の上に寄る。 [画像](screens/label-colors-375.png) | 各色を保存するフォームに同じ二重の矢印が出る。 [画像](screens/label-colors-1024.png) | 再発行・社内確認・経理など、画面にある色欄すべてで重複を確認。 [画像](screens/label-colors-1440.png) |
| loop-account-menu | 引き出し下端のアカウントから右上に「キーボード操作」が開く。 [画像](screens/loop-account-menu-375.png) | 常設サイドバーと本文の境にメニューがある。 [画像](screens/loop-account-menu-1024.png) | 開いた項目が画面下に切れず、操作対象と近い。 [画像](screens/loop-account-menu-1440.png) |
| loop-canned-edit | 開いた編集フォームと元の定型文が並び、元本文は数語ごとに改行する。 [画像](screens/loop-canned-edit-375.png) | 編集欄が右の狭い列に押し込まれ、本文の一部だけが見える。 [画像](screens/loop-canned-edit-1024.png) | 広くても編集フォームは行末の小領域で、左側に余白が残る。 [画像](screens/loop-canned-edit-1440.png) |
| loop-chat-failed | 入力文を残したまま、質問ボタンの下に赤い再試行案内が出る。 [画像](screens/loop-chat-failed-375.png) | 中央のカード内に記事一覧への別経路がある。 [画像](screens/loop-chat-failed-1024.png) | 質問文とエラーが離れず、余白の中でも一緒に見える。 [画像](screens/loop-chat-failed-1440.png) |
| loop-chat-solved | 質問と記事リンクの下に解決記録、次の質問欄がある。 [画像](screens/loop-chat-solved-375.png) | 同じカードで記事と解決済みの文を照合できる。 [画像](screens/loop-chat-solved-1024.png) | 続けて質問するボタンと一覧リンクが残る。 [画像](screens/loop-chat-solved-1440.png) |
| loop-dates | 日付範囲の操作を開くと、2日付を収めたポップアップが右端に揃う。 [画像](screens/loop-dates-375.png) | 期間チップの隣から開始・終了を設定できる。 [画像](screens/loop-dates-1024.png) | 開始と終了に日本時間を明示し、背景に指標を残す。 [画像](screens/loop-dates-1440.png) |
| loop-feedback-undo | 確認済みを伝える緑の枠内に「元に戻す」があり、対象行はその下に残る。 [画像](screens/loop-feedback-undo-375.png) | 件名と確認済みバッジ、対象番号付きの通知を同時に読める。 [画像](screens/loop-feedback-undo-1024.png) | 一覧に対象行、サイドバーに未確認件数0が出る。 [画像](screens/loop-feedback-undo-1440.png) |
| loop-help-no-results | 検索語・チップ・該当記事なしの表示と、Slideの問い合わせ先が並ぶ。 [画像](screens/loop-help-no-results-375.png) | 空表示の下にプロダクト別の切り替え先が残る。 [画像](screens/loop-help-no-results-1024.png) | 広い画面でも検索結果と代替経路は同じ読書幅に収まる。 [画像](screens/loop-help-no-results-1440.png) |
| loop-history | 関連情報の操作履歴に既定の箇条書き記号が出て、時刻の列が左に揃わない。 [画像](screens/loop-history-375.png) | 引き出しに同じ記号、履歴の横にシステムと運営者が出る。 [画像](screens/loop-history-1024.png) | 常設の右側パネルにも黒いリスト記号が残る。 [画像](screens/loop-history-1440.png) |
| loop-keyboard | 受信箱・会話・共通の3群と閉じる操作がすべて収まる。 [画像](screens/loop-keyboard-375.png) | 中央のダイアログの閉じるボタンに青いフォーカスが出る。 [画像](screens/loop-keyboard-1024.png) | 背景の受信箱を暗く保ち、同じショートカットを確認できる。 [画像](screens/loop-keyboard-1440.png) |
| loop-label-new | 色付き候補の下で新しい名前にフォーカスし、作成操作まで表示する。 [画像](screens/loop-label-new-375.png) | 入力の青枠とチェック済み候補をメニュー内で識別できる。 [画像](screens/loop-label-new-1024.png) | 会話の上に候補が開き、操作履歴や返信欄には影響しない。 [画像](screens/loop-label-new-1440.png) |
| loop-link-confirm | 公開するリポジトリ・課題番号・会話URLが並び、長い主操作は2段目に収まる。 [画像](screens/loop-link-confirm-375.png) | キャンセルと紐付け操作が1列に並ぶ。 [画像](screens/loop-link-confirm-1024.png) | 右側に課題選択、中央にコメント送信先を示す確認が出る。 [画像](screens/loop-link-confirm-1440.png) |
| loop-mailbox-add | 開閉行が最下部にあり、展開しても追加先欄は画面下に続く。 [画像](screens/loop-mailbox-add-375.png) | 新プロダクトの登録と既存プロダクトの追加が別々に並ぶ。 [画像](screens/loop-mailbox-add-1024.png) | 差出人のチェック欄が説明から離れ、下方に既存プロダクトの追加を表示する。 [画像](screens/loop-mailbox-add-1440.png) |
| loop-merge-confirm | 統合先の件名と番号が白いダイアログに収まる。 [画像](screens/loop-merge-confirm-375.png) | 元の会話を背景に残し、キャンセルと統合が横に並ぶ。 [画像](screens/loop-merge-confirm-1024.png) | 背景の右側の関連情報と前景の確定操作を区別できる。 [画像](screens/loop-merge-confirm-1440.png) |
| loop-metric-definition | 説明が細長い吹き出しになり、対象カードのほぼ全面を覆う。 [画像](screens/loop-metric-definition-375.png) | 前期比較の説明は表示でき、隣のカードを隠さない。 [画像](screens/loop-metric-definition-1024.png) | 吹き出しはカード幅程度に留まり、他の指標を引き続き読める。 [画像](screens/loop-metric-definition-1440.png) |
| loop-navigation | 背面を暗くした引き出しに拡張と管理メニューが並ぶ。 [画像](screens/loop-navigation-375.png) | Helpdeskのフォーカス枠と常設のナビが見える。 [画像](screens/loop-navigation-1024.png) | 左右を分離して現在の受信箱とナビを同時に読める。 [画像](screens/loop-navigation-1440.png) |
| loop-operator-edit | 開いた担当者編集が行右に残り、左で名前とアドレスが窮屈になる。 [画像](screens/loop-operator-edit-375.png) | 同じ名前が開閉見出しと編集見出しで連続し、見出し順の検査で段飛びを検出。 [画像](screens/loop-operator-edit-1024.png) | 一覧のほかの運営者を残して編集できるが、同じ見出し順の問題がある。 [画像](screens/loop-operator-edit-1440.png) |
| loop-publish | 記事名と公開先の案内の下にキャンセル・公開が収まる。 [画像](screens/loop-publish-375.png) | 背景に入力内容を残し、中央に確認が出る。 [画像](screens/loop-publish-1024.png) | 背景の公開ボタンと手前の確定を暗幕で区別できる。 [画像](screens/loop-publish-1440.png) |
| loop-quick-actions | 青い枠の行末に担当と完了のアイコンが出て、件名は省略表示される。 [画像](screens/loop-quick-actions-375.png) | 先頭の行だけに青枠と2操作が出る。 [画像](screens/loop-quick-actions-1024.png) | フォーカスされた行と次の行の境界を追える。 [画像](screens/loop-quick-actions-1440.png) |
| loop-reply-preview | 入力した返信の下にプレビューが出て、差出人と宛先が縦に続く。 [画像](screens/loop-reply-preview-375.png) | 返信本文の外枠とプレビューのカードを識別できる。 [画像](screens/loop-reply-preview-1024.png) | 入力した返信と、宛先・件名を含む送信内容を照合できる。 [画像](screens/loop-reply-preview-1440.png) |
| loop-reply-undo | 「送信後に会話を完了します」のすぐ右に取り消しがある。 [画像](screens/loop-reply-undo-375.png) | 取り消しの下に元メッセージと送信待ちの返信が並ぶ。 [画像](screens/loop-reply-undo-1024.png) | 緑の受付通知と取り消し、タイムラインの送信待ちが見える。 [画像](screens/loop-reply-undo-1440.png) |
| loop-revoke | 失効対象とCLI・MCPへの影響を説明し、赤い確定が右にある。 [画像](screens/loop-revoke-375.png) | 背景に運営用CLIの行を残したまま確認できる。 [画像](screens/loop-revoke-1024.png) | 本文の失効操作と前景の確認が分かれている。 [画像](screens/loop-revoke-1440.png) |
| loop-rule-delete | 背景では左のルール名が1文字ずつ縦に並び、手前には赤系以外の黒い削除確定が出る。 [画像](screens/loop-rule-delete-375.png) | キャンセルとルール削除を中央に示す。 [画像](screens/loop-rule-delete-1024.png) | 編集フォームと削除ダイアログの境界は暗幕で明瞭。 [画像](screens/loop-rule-delete-1440.png) |
| loop-rule-edit | 元のルール名が1文字ずつ改行され、表示順・ラベルと編集欄が横に詰まる。 [画像](screens/loop-rule-edit-375.png) | 左のルールと一番右のフォームの間に大きな空白がある。 [画像](screens/loop-rule-edit-1024.png) | カード幅が増えても編集欄は右の狭い領域だけを使う。 [画像](screens/loop-rule-edit-1440.png) |
| mailboxes | 差出人と新しい窓口のフォームが縦に続く。 [画像](screens/mailboxes-375.png) | Slideの差出人名の下でチェックボックスだけが中央に浮く。 [画像](screens/mailboxes-1024.png) | 同じずれがあり、次のカードの先頭は揃う。 [画像](screens/mailboxes-1440.png) |
| metrics-trends | 主要指標が1列になり、53分・50%・10分の順に続く。 [画像](screens/metrics-trends-375.png) | 主要3指標は横並び、下段には4枚の補助指標が並ぶ。 [画像](screens/metrics-trends-1024.png) | 前期差・定義・短い折れ線が同じカードに入る。 [画像](screens/metrics-trends-1440.png) |
| operation-result | 日本語の集計項目の間にshownSuggestions・solvedSuggestionsが並ぶ。 [画像](screens/operation-result-375.png) | 各キーの次行に0が表示され、説明や単位がない。 [画像](screens/operation-result-1024.png) | 解決時間・割合・件数の中で同じ2項目だけ英語の内部キーで表示される。 [画像](screens/operation-result-1440.png) |
| operators | 検索・権限・並び順を同じ行に詰め、並び順の選択値が途中で切れる。 [画像](screens/operators-375.png) | 2人の名前とアドレス、権限、編集操作を1行ずつ読める。 [画像](screens/operators-1024.png) | 検索行の下に、右端の編集操作まで同じ列で揃う。 [画像](screens/operators-1440.png) |
| product-icon-settings | 窓口2件→Deskのアイコン変更→メール差出人の順で、チェック欄だけが中央に出る。 [画像](screens/product-icon-settings-375.png) | 開いたアイコン設定の直下に別の保存操作があり、差出人のチェック欄と文が2行に割れる。 [画像](screens/product-icon-settings-1024.png) | 各プロダクトカードが同じ幅で揃い、Deskに同じチェック欄のずれが出る。 [画像](screens/product-icon-settings-1440.png) |
| product-switcher | ナビゲーション引き出しの上で全プロダクト、Desk、Slideを選べる。 [画像](screens/product-switcher-375.png) | 常設ナビ上にメニューが展開し、一覧のSlide絞り込みが残る。 [画像](screens/product-switcher-1024.png) | メニューが本文の問い合わせ一覧にかぶらない。 [画像](screens/product-switcher-1440.png) |
| retention | 日数欄に0、すぐ下に無期限の説明がある。 [画像](screens/retention-375.png) | 設定変更と取り消しが横に並ぶ。 [画像](screens/retention-1024.png) | 説明や操作が横長に伸びず一つのカードで完結する。 [画像](screens/retention-1440.png) |
| settings-home | 検索の下に件数と遷移印を添えた各設定が続く。 [画像](screens/settings-home-375.png) | 通常設定とデータ削除が別のグループになっている。 [画像](screens/settings-home-1024.png) | 件数、無期限、取り消し不可がそれぞれの行の右に揃う。 [画像](screens/settings-home-1440.png) |
| states | エラー入力、成功・失敗通知、空表示、読込表示の順に並ぶ。 [画像](screens/states-375.png) | ヒントの吹き出しがフォーカス中のボタンのすぐ上に出る。 [画像](screens/states-1024.png) | 通知は全幅、候補の選択印はリストの右端にある。 [画像](screens/states-1440.png) |
| suggest-editor | 元の質問が題名に埋まり、Slideと任意要約が上から続く。 [画像](screens/suggest-editor-375.png) | 本文を含むカード内に公開・プレビュー・下書き保存・取り消しが揃う。 [画像](screens/suggest-editor-1024.png) | 既入力の題名と空の本文を一画面で識別できる。 [画像](screens/suggest-editor-1440.png) |
| suggest-library | 質問・候補への導線と記事を書く操作は2段、検索はその下にある。 [画像](screens/suggest-library-375.png) | 公開状態、更新日、評価に加え、提示・閲覧・解決の数値を表示する。 [画像](screens/suggest-library-1024.png) | 行の下段で提示4回・閲覧1回・解決率0%の見直し候補だと分かる。 [画像](screens/suggest-library-1440.png) |
| suggest-metric | 補助指標2列の左に改善、右に待たずに解決25%・1件/4件が見える。 [画像](screens/suggest-metric-375.png) | 主要3指標と補助指標群を上下に分ける。 [画像](screens/suggest-metric-1024.png) | 25%のカード内に分母・分子と定義が併記されている。 [画像](screens/suggest-metric-1440.png) |
| suggest-questions | 長い質問を2行に折り返し、Slideと記事を書く操作が見える。 [画像](screens/suggest-questions-375.png) | 1件の質問とプロダクトを左、記事を書く操作を右に置く。 [画像](screens/suggest-questions-1024.png) | 質問と新規記事への導線が同じ行の中で対応する。 [画像](screens/suggest-questions-1440.png) |
| suggest-questions-empty | 0件とプロダクト選択の下に虫眼鏡と空状態の説明が出る。 [画像](screens/suggest-questions-empty-375.png) | 空状態を主領域の中央に置き、記事一覧への戻り先を残す。 [画像](screens/suggest-questions-empty-1024.png) | 0件と「まだありません」が同一画面内で一致する。 [画像](screens/suggest-questions-empty-1440.png) |
| tokens | 検索のプレースホルダーと並び順の選択値が途中までしか見えない。 [画像](screens/tokens-375.png) | 発行済み0件の案内の下に発行フォームが見える。 [画像](screens/tokens-1024.png) | 「新しいトークン」と発行フォームが同じ画面内にある。 [画像](screens/tokens-1440.png) |
| voices | 開始日と終了日が横に並び、ラベルごとの件数と折れ線が右端に残る。 [画像](screens/voices-375.png) | 条件行の下にラベル別とプロダクト別の表が続く。 [画像](screens/voices-1024.png) | 件数の背景バーと、傾向を表す線が同じ行で見える。 [画像](screens/voices-1440.png) |
| voices-filtered | 件名を複数行に折り返し、プロダクトと受付日を別行に表示する。 [画像](screens/voices-filtered-375.png) | 対象9件を読め、長い件名だけが2行になる。 [画像](screens/voices-filtered-1024.png) | 問い合わせとフィードバックの種別が右端に揃う。 [画像](screens/voices-filtered-1440.png) |
| voices-trends | 期間を2欄に表示し、長いラベルは折り返して件数を残す。 [画像](screens/voices-trends-375.png) | ラベルごとの短い折れ線と件数が右端に揃う。 [画像](screens/voices-trends-1024.png) | プロダクト別に20件・7件の差がバーと数字で比較できる。 [画像](screens/voices-trends-1440.png) |

## 同周で修正した項目

- 運営者・定型返信・振り分けルールを編集すると、対象行の下に編集フォームが開く。モバイルの検索欄は独立した行を使い、権限と並び順を次の行に並べた。
- 記事を提示した件数と記事で解決した件数を集計結果に明記した。チェックと説明を横に揃え、リッチな選択欄には矢印を一つ表示する。
- 重複する運営者名の見出しと操作履歴のリスト記号を取り除いた。11状態・33画面の再検証で、配置・axe・操作に合格した。

[拡張機能の指摘](extensions.md)のうち、次の操作も同じ周で修正した。

| 対象 | 変更 |
| --- | --- |
| 定型返信・設定ガイド | 返信欄の上に本文付きの候補を展開し、元の下書きを隠さずにテンプレートを選べる。モバイルの設定一覧では、保存した文の下に編集欄を展開する。 |
| スヌーズ・設定ガイド | その他の操作の中で再表示時刻の欄を展開し、年・月・日の順・24時間表記・日本時間であることを示した。保留の設定・解除と、その取り消しを操作テストで確認した。 |
| ウィジェットの表示設定・見本 | 設定欄から変更後のボタンを見本で直接確認できる。見本の高さを調整し、チャット内の最後のリンクまで3幅ともスクロールなしに表示されることを検証した。 |
| フィードバックの確認 | 「確認済みにする」を主操作、内部メモの保存を副操作にした。変換ボタンの前にあった余分な罫線も取り除いた。 |
