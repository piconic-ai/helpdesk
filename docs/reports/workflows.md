# ワークフローの操作と検証

ローカルのデモで、運営者は佐藤 優、利用者は別タブの公開窓口を操作する。下表の H は[ハンズオン](../hands-on.md)の章、J は独立した Playwright のシナリオを指す。ブラウザーで確認する結果を手順ごとに記す。

| 作業 | 手順 | 画面に出る結果 | 通しのテスト |
| --- | --- | --- | --- |
| W1 問い合わせに答える | 窓口で受信し、待ち時間・製品・担当・ラベルで絞る | 受信箱に番号と差出人が出る | [J1・J2](../../tests/ux/thread.pw.mjs)、[H01](../../tests/ux/hands-on.pw.mjs) |
| W1 | 会話を開き、担当とラベルを設定して記事を添え、プレビューする | 窓口から相手宛ての件名と本文を読める | [H02](../../tests/ux/hands-on.pw.mjs) |
| W1 | 通常の返信または「送信して完了」を押す。猶予中に取り消すか、配送を待つ | 取り消した本文を編集できる。配送すると返信待ちまたは完了になる | [W1](../../tests/ux/operator-reply.pw.mjs)、[J1・J2](../../tests/ux/thread.pw.mjs) |
| W1 | 完了した会話に相手が返信する | 同じ番号の会話に着信し未対応に戻る | [J2](../../tests/ux/thread.pw.mjs) |
| W1 | 次の未対応に移り内部メモを残す | 運営者のメモとして記録される | [H03](../../tests/ux/hands-on.pw.mjs) |
| W1 | 失敗の理由を読んで再送し、承認待ちの別の下書きを編集する | 再送結果が出る。下書きは運営者が承認した文面だけが配送される | [J3・J4](../../tests/ux/thread.pw.mjs)、[H04・H05](../../tests/ux/hands-on.pw.mjs) |
| W2 声を受け止める | 公開フォームに連絡先を入れずに意見を送る | 返信不要の受付として完了する | [W2](../../tests/ux/feedback-workflow.pw.mjs) |
| W2 | 運営の一覧で並び替え、行から確認済みにする | 新しい順・未確認を先に、確認済みへの変更と取り消しを試せる | [W2](../../tests/ux/feedback-workflow.pw.mjs) |
| W2 | 連絡先のある意見を開き問い合わせへ変更する | 見出しから変更し、問い合わせとして返信できる | [J7](../../tests/ux/settings.pw.mjs) |
| W3 自分で解決する | 公開ヘルプで検索し、記事を読んで評価する | 記事本文と評価の受付結果を読める | [W3 記事の評価から窓口へ](../../tests/ux/loop-walk.pw.mjs)、[J6](../../tests/ux/settings.pw.mjs)、[H06](../../tests/ux/hands-on.pw.mjs) |
| W3 | チャットで質問し、記事を読んでも解決しない場合は連絡先を入れて送る | 入力した質問を引き継ぎ、受付番号が返る | [J12](../../tests/ux/public-handoff.pw.mjs) |
| W3 | 運営の受信箱で新しい番号を開く | 利用者の質問と受付番号が一致する | [J12](../../tests/ux/public-handoff.pw.mjs) |
| W3 | 製品内でヘルプを開き、記事を読み、解決を記録するか担当者に送る | 解決を選ぶと問い合わせは作られない。送った場合は同じ番号の会話に元ページが表示される | [H11](../../tests/ux/widget-journey.pw.mjs)、[記事で解決](../../tests/ux/chat-transcript.pw.mjs) |
| W3・W4 | 記事を公開し、別タブのチャットで読んで解決を伝える | 対応状況に、記事で解決できた割合が表示される | [H12](../../tests/ux/suggestion-handbook.pw.mjs) |
| W4 改善につなげる | 課題の起票先を設定し、題と公開する要約を確認して起票する | 投稿先と内容を確認でき、会話に課題が紐づく | [J8](../../tests/ux/extensions.pw.mjs)、[H08](../../tests/ux/hands-on.pw.mjs) |
| W4 | 別の会話から題を探して同じ課題を選ぶ | 会話を離れずに紐づき、課題詳細に両方の声が並ぶ | [H08](../../tests/ux/hands-on.pw.mjs)、[W4](../../tests/ux/issue-board.pw.mjs) |
| W4 | 修正した課題のお知らせを下書きし、会話で承認して送る | 知らせる待ちが減り、通知した相手と修正前後の件数を確認できる | [課題と通知](../../tests/ux/review-4-issues.pw.mjs) |
| W4 | ラベル・製品・月ごとの声を開き、元の会話から記事候補を保存する | 内訳から会話・下書きの編集へ移れる | [声から元の会話へ](../../tests/ux/loop-walk.pw.mjs)、[声と記事](../../tests/ux/voices-articles.pw.mjs) |
| W4 | 対応状況の期間とプロダクトを選ぶ | 期間内に受け付け、改善の知らせが届いた声の割合が出る | [J10](../../tests/ux/extensions.pw.mjs)、[H09](../../tests/ux/hands-on.pw.mjs) |
| W5 場を整える | 製品と窓口を登録して受付を試す | 登録した製品の番号が返り、窓口の設定が残る | [J9](../../tests/ux/settings.pw.mjs) |
| W5 | 運営者の権限・表示名・画像を設定する | 再表示して役割が残り、受信箱の表示名と画像が変わる | [権限](../../tests/ux/settings.pw.mjs)、[J14](../../tests/ux/account.pw.mjs) |
| W5 | 保存期間を更新し、対象の連絡先を選んで削除する | 期間が保存され、削除した相手だけが消える | [W5 通し操作](../../tests/ux/workspace-workflow.pw.mjs)、[J11](../../tests/ux/settings.pw.mjs) |
| W5 | 自分の API トークンに付与する権限を確認する | 閲覧・下書き・会話管理の範囲を選べる | [H10](../../tests/ux/hands-on.pw.mjs) |

実際のメール受信箱への配送、実在する GitHub リポジトリへの投稿、本番の認証と課金は、ローカルの模擬サービスを通す検証と別に確認する。

## 周ごとのブラウザー記録

クリック・入力・移動の回数と表示待ちは各周の手順別の表に記録した。複数の業務で同じシナリオを使う場合は、各業務に含めている。

[第1周](loop/round-1/walk.md)・[第2周](loop/round-2/walk.md)・[第3周](loop/round-3/walk.md)・[第4周](loop/round-4/walk.md)・[第5周](loop/round-5/walk.md)・[第6周](loop/round-6/walk.md)・[第6周の全手順の再検証](loop/round-6/retry/walk.md)・[指摘と修正のまとめ](loop/summary.md)
