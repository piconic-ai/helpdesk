# ブラウザー操作の記録

見本データを入れ直したブラウザーで実行した。表にはクリック、入力、選択、キー操作、画面遷移を1操作ずつ記録した。複数章をひと続きに通す H06/H07 は共同記録で、操作数の内訳は算出しない。秒数はテスト環境でブラウザー操作が完了するまでの実測値。1秒以上かかった表示待ちは別の行に記録する。

## W1

### H01 1. 受信箱を読む(3分)

13操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('button', { name: 'すべてのプロダクト', exact: true }) | 0.07 |
| 2 | Click getByRole('link', { name: 'Desk', exact: true }) | 0.15 |
| 3 | Click getByRole('button', { name: 'Desk', exact: true }) | 0.03 |
| 4 | Click getByRole('link', { name: 'すべてのプロダクト', exact: true }) | 0.10 |
| 5 | Fill "領収書" getByRole('searchbox', { name: '問い合わせを検索' }) | 0.03 |
| 6 | Fill "" getByRole('searchbox', { name: '問い合わせを検索' }) | 0.03 |
| 7 | Click getByRole('button', { name: '絞り込み', exact: true }) | 0.14 |
| 8 | Click getByRole('button', { name: '担当者 すべて', exact: true }) | 0.04 |
| 9 | Click getByRole('button', { name: '佐藤 優', exact: true }) | 0.17 |
| 10 | Click getByRole('link', { name: '佐藤 優を外す' }) | 0.14 |
| 11 | Click getByRole('button', { name: '絞り込み', exact: true }) | 0.20 |
| 12 | Select option getByRole('combobox', { name: 'ラベル' }) | 0.03 |
| 13 | Click getByRole('link', { name: '請求を外す' }) | 0.09 |

### H02 2. 問い合わせに答える(7分)

12操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click locator('a.conversation-row').filter({ has: getByText('#6', { exact: true }) }) | 0.20 |
| 2 | Click getByRole('button', { name: '担当者を選ぶ', exact: true }) | 0.15 |
| 3 | Click getByRole('button', { name: '佐藤 優', exact: true }) | 0.09 |
| 4 | Click getByRole('button', { name: 'ラベルを選ぶ', exact: true }) | 0.06 |
| 5 | Click getByRole('button', { name: '請求を付ける', exact: true }) | 0.12 |
| 6 | Fill "こちらの記事で、領収書を発行する手順をご確認ください。" getByRole('textbox', { name: '返信', exact: true }) | 0.02 |
| 7 | Click getByRole('button', { name: '記事を添える', exact: true }) | 0.06 |
| 8 | Fill "領収書" getByLabel('記事の題名で検索') | 0.02 |
| 9 | Click getByRole('button', { name: '領収書を発行する', exact: true }) | 0.06 |
| 10 | Click getByRole('button', { name: 'プレビュー', exact: true }) | 0.03 |
| 11 | Click getByRole('button', { name: '送信して完了', exact: true }) | 0.07 |
| 12 | Click getByRole('link', { name: '次の未対応へ' }) | 0.18 |

### H03 3. 内部メモを残す(2分) / H04 4. 送信の失敗に気づいて直す(2分)

6操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('tab', { name: '内部メモ' }) | 0.05 |
| 2 | Fill "次回の案内は経理チームに確認済みです。" getByRole('textbox', { name: '内部メモ' }) | 0.06 |
| 3 | Click getByRole('button', { name: 'メモを残す', exact: true }) | 0.08 |
| 4 | Click getByRole('navigation', { name: '受信箱', exact: true }).getByRole('link', { name: /未対応/ }) | 0.10 |
| 5 | Click locator('a.conversation-row').filter({ has: getByText('#4', { exact: true }) }) | 0.13 |
| 6 | Click getByRole('button', { name: '再送', exact: true }) | 0.22 |

### H05 5. AI の下書きを承認する(4分)

10操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('navigation', { name: '受信箱', exact: true }).getByRole('link', { name: /承認待ち/ }) | 0.15 |
| 2 | Click locator('a.conversation-row').filter({ has: getByText('#5', { exact: true }) }) | 0.17 |
| 3 | Fill "更新日の前日まで、メンバー数を変更できます。" locator('article').filter({ has: getByRole('textbox', { name: '下書きの本文' }) }).getByRole('textbox', { name: '下書きの本文' }) | 0.03 |
| 4 | Click locator('article').filter({ has: getByRole('textbox', { name: '下書きの本文' }) }).getByRole('button', { name: '承認して送信', exact: true }) | 0.06 |
| 5 | Click getByRole('dialog').getByRole('button', { name: 'キャンセル', exact: true }) | 0.04 |
| 6 | Click locator('article').filter({ has: getByRole('textbox', { name: '下書きの本文' }) }).getByRole('button', { name: '下書きを破棄', exact: true }) | 0.04 |
| 7 | Click getByRole('dialog').getByRole('button', { name: 'キャンセル', exact: true }) | 0.04 |
| 8 | Click locator('article').filter({ has: getByRole('textbox', { name: '下書きの本文' }) }).getByRole('button', { name: '承認して送信', exact: true }) | 0.06 |
| 9 | Click locator('#action-confirmation').locator('[data-commit]') | 0.19 |
| 10 | Reload  | 0.27 |

### J1 新着メールを担当し、ラベルとプレビューを確認して返信する

10操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/ | 0.18 |
| 2 | Click getByRole('link', { name: /希望日に納品できますか/ }) | 0.08 |
| 3 | Click getByRole('button', { name: '担当者を選ぶ' }) | 0.11 |
| 4 | Click getByRole('button', { name: 'sato', exact: true }) | 0.03 |
| 5 | Click getByText('ラベルを選ぶ', { exact: true }) | 0.02 |
| 6 | Click getByRole('button', { name: '請求を付ける' }) | 0.08 |
| 7 | Fill "ご希望の日にお届けします。" getByRole('textbox', { name: '返信', exact: true }) | 0.01 |
| 8 | Click getByRole('button', { name: 'プレビュー', exact: true }) | 0.04 |
| 9 | Click getByRole('button', { name: '送信', exact: true }) | 0.03 |
| 待ち | Expect "toPass"  | 5.44 |
| 10 | Click getByRole('link', { name: '次の未対応へ' }) | 0.07 |

### J2 受信で再開し、返信して完了した後も相手の返信が届く

7操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/ | 0.17 |
| 2 | Click getByRole('link', { name: /ワークスペースの招待メールについて/ }) | 0.10 |
| 3 | Fill "招待メールをもう一度お送りしました。" getByRole('textbox', { name: '返信', exact: true }) | 0.01 |
| 4 | Click getByRole('button', { name: '送信して完了' }) | 0.04 |
| 待ち | Expect "toPass"  | 5.19 |
| 5 | Reload  | 0.14 |
| 6 | Click getByRole('button', { name: '完了にする', exact: true }) | 0.05 |
| 7 | Fill "追加でご案内します。" getByRole('textbox', { name: '返信', exact: true }) | 0.01 |

### J3 失敗の理由を読んで再送する

3操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/ | 0.11 |
| 2 | Click getByRole('link', { name: /月額プランの明細/ }) | 0.09 |
| 3 | Click getByRole('button', { name: '再送', exact: true }) | 0.11 |

### J4 エージェントの下書きを直して承認し、別の下書きを破棄する

8操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/ | 0.10 |
| 2 | Click getByRole('link', { name: /承認待ち/ }).first() | 0.07 |
| 3 | Click getByRole('link', { name: /チームプランの契約更新/ }) | 0.11 |
| 4 | Fill "更新日の前日まで人数を変更できます。" locator('article').filter({ hasText: '更新時にメンバー数を変更できます。' }).getByRole('textbox', { name: '下書きの本文' }) | 0.10 |
| 5 | Click locator('article').filter({ hasText: '更新時にメンバー数を変更できます。' }).getByRole('button', { name: '承認して送信' }) | 0.04 |
| 6 | Click locator('#action-confirmation').locator('[data-commit]') | 0.11 |
| 7 | Click locator('article').filter({ hasText: '破棄する予定の下書き' }).getByRole('button', { name: '下書きを破棄' }) | 0.04 |
| 8 | Click locator('#action-confirmation').locator('[data-commit]') | 0.09 |

### J5 記事をプレビューし公開してから返信に添える

18操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/ | 0.16 |
| 2 | Click getByRole('link', { name: 'ヘルプ記事', exact: true }) | 0.10 |
| 3 | Click getByRole('link', { name: '記事を書く' }) | 0.15 |
| 4 | Select option getByRole('combobox', { name: 'プロダクト', exact: true }) | 0.09 |
| 5 | Fill "請求書の受け取り方" getByLabel('題名') | 0.01 |
| 6 | Fill "設定の「請求」から請求書をダウンロードできます。" getByLabel('本文') | 0.00 |
| 7 | Click getByRole('button', { name: 'プレビュー' }) | 0.24 |
| 8 | Click getByRole('button', { name: '公開する' }) | 0.04 |
| 9 | Click locator('#action-confirmation').locator('[data-commit]') | 0.08 |
| 10 | Click getByRole('link', { name: '公開記事を読む' }) | 0.24 |
| 11 | Navigate 127.0.0.1/ | 0.12 |
| 12 | Click getByRole('link', { name: /領収書の宛名を変更できますか/ }) | 0.13 |
| 13 | Fill "こちらをご参照ください。" getByLabel('返信', { exact: true }) | 0.10 |
| 14 | Click getByRole('button', { name: '記事を添える' }) | 0.04 |
| 15 | Fill "請求書" getByLabel('記事の題名で検索') | 0.01 |
| 16 | Click getByRole('button', { name: '請求書の受け取り方', exact: true }) | 0.04 |
| 17 | Click getByRole('button', { name: 'プレビュー' }) | 0.03 |
| 18 | Click getByRole('button', { name: '送信', exact: true }) | 0.04 |

### W1 送信して完了を取り消すと本文と状態を復元し、相手への配送も発生しない

5操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/conversation/1 | 0.12 |
| 2 | Fill "取り消してから宛先を確認します。" getByRole('textbox', { name: '返信', exact: true }) | 0.03 |
| 3 | Click getByRole('button', { name: '送信して完了' }) | 0.04 |
| 4 | Reload  | 0.13 |
| 5 | Click getByRole('button', { name: '取り消す' }) | 0.05 |

### W1 長い差出人でも製品名が読め、最後の担当変更と拡張の表示名が分かる

2操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/conversation/1 | 0.11 |
| 2 | Click getByText('操作履歴', { exact: true }) | 0.04 |

## W2

### H06 6. ユーザーの立場で、自分で解決する(5分) / H07 7. 返信不要の声を受け止める(3分)

18操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/help/chat/slide | 0.06 |
| 2 | Fill "領収書を発行したい" getByLabel('質問') | 0.04 |
| 3 | Click getByRole('button', { name: '質問する', exact: true }) | 0.06 |
| 4 | Click getByRole('link', { name: /領収書を発行する/ }) | 0.13 |
| 5 | Click getByRole('link', { name: '新しいタブで開く' }) | 0.18 |
| 6 | Click getByRole('button', { name: 'いいえ', exact: true }) | 0.14 |
| 7 | Click getByRole('button', { name: 'やりとりに戻る', exact: true }) | 0.11 |
| 8 | Click getByRole('button', { name: '解決しなかった', exact: true }) | 0.06 |
| 9 | Click getByLabel('連絡先メールアドレス') | 0.05 |
| 10 | Click getByRole('button', { name: '送信', exact: true }) | 0.03 |
| 11 | Navigate 127.0.0.1/ | 0.15 |
| 12 | Navigate 127.0.0.1/help/feedback/slide | 0.11 |
| 13 | Fill "領収書を探しやすくしてほしいです" getByLabel('ご意見・ご要望') | 0.05 |
| 14 | Click getByLabel('連絡先メールアドレス') | 0.08 |
| 15 | Click getByRole('button', { name: '送信', exact: true }) | 0.08 |
| 16 | Click getByRole('link', { name: /^フィードバック/ }).first() | 0.17 |
| 17 | Click getByRole('link', { name: /領収書を探しやすくしてほしいです/ }) | 0.20 |
| 18 | Click getByRole('button', { name: '確認済みにする', exact: true }) | 0.32 |

### J7 フィードバックを確認し、別の意見は問い合わせに変えて返信する

18操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/help/feedback/slide | 0.09 |
| 2 | Fill "表示倍率の切り替えが便利です" getByLabel('ご意見・ご要望') | 0.08 |
| 3 | Click getByLabel('連絡先メールアドレス') | 0.04 |
| 4 | Click getByRole('button', { name: '送信', exact: true }) | 0.07 |
| 5 | Navigate 127.0.0.1/help/feedback/slide | 0.08 |
| 6 | Fill "印刷用の画面について相談したいです" getByLabel('ご意見・ご要望') | 0.03 |
| 7 | Click getByLabel('連絡先メールアドレス') | 0.05 |
| 8 | Click getByRole('button', { name: '送信', exact: true }) | 0.11 |
| 9 | Navigate 127.0.0.1/ | 0.14 |
| 10 | Click getByRole('link', { name: /^フィードバック/ }).first() | 0.11 |
| 11 | Click getByRole('link', { name: /表示倍率の切り替えが便利です/ }) | 0.11 |
| 12 | Click getByRole('button', { name: '確認済みにする' }) | 0.23 |
| 13 | Click getByRole('link', { name: /^フィードバック/ }).first() | 0.09 |
| 14 | Click getByRole('link', { name: /印刷用の画面について相談したいです/ }) | 0.16 |
| 15 | Click getByRole('button', { name: '問い合わせに変更' }) | 0.09 |
| 16 | Click locator('#action-confirmation').locator('[data-commit]') | 0.11 |
| 17 | Fill "詳しい状況を教えていただけますか。" getByRole('textbox', { name: '返信', exact: true }) | 0.14 |
| 18 | Click getByRole('button', { name: '送信', exact: true }) | 0.10 |
| 待ち | Expect "toPass"  | 6.52 |

### W2 連絡先を空にして意見を送り、一覧で確認・取り消し・並べ替えができる

12操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/help/feedback/slide | 0.05 |
| 2 | Fill "匿名で送った表示についての提案" getByLabel('ご意見・ご要望') | 0.02 |
| 3 | Click getByRole('button', { name: '送信', exact: true }) | 0.06 |
| 4 | Navigate 127.0.0.1/?view=feedback | 0.10 |
| 5 | Click getByRole('listitem').filter({ has: getByRole('link', { name: /匿名で送った表示についての提案/ }) }).getByRole('button', { name: '確認済みにする' }) | 0.09 |
| 6 | Select option getByRole('combobox', { name: '並び順' }) | 0.01 |
| 7 | Select option getByRole('combobox', { name: '並び順' }) | 0.01 |
| 8 | Click getByRole('listitem').filter({ has: getByRole('link', { name: /匿名で送った表示についての提案/ }) }).getByRole('link') | 0.07 |
| 9 | Navigate 127.0.0.1/?view=feedback | 0.13 |
| 10 | Click locator('li[data-number="10"]').getByRole('button', { name: '確認済みにする' }) | 0.09 |
| 11 | Click getByRole('button', { name: '元に戻す' }) | 0.17 |
| 12 | Click locator('li[data-number="10"]').getByRole('link') | 0.08 |

## W3

### H06 6. ユーザーの立場で、自分で解決する(5分) / H07 7. 返信不要の声を受け止める(3分)

18操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/help/chat/slide | 0.06 |
| 2 | Fill "領収書を発行したい" getByLabel('質問') | 0.04 |
| 3 | Click getByRole('button', { name: '質問する', exact: true }) | 0.06 |
| 4 | Click getByRole('link', { name: /領収書を発行する/ }) | 0.13 |
| 5 | Click getByRole('link', { name: '新しいタブで開く' }) | 0.18 |
| 6 | Click getByRole('button', { name: 'いいえ', exact: true }) | 0.14 |
| 7 | Click getByRole('button', { name: 'やりとりに戻る', exact: true }) | 0.11 |
| 8 | Click getByRole('button', { name: '解決しなかった', exact: true }) | 0.06 |
| 9 | Click getByLabel('連絡先メールアドレス') | 0.05 |
| 10 | Click getByRole('button', { name: '送信', exact: true }) | 0.03 |
| 11 | Navigate 127.0.0.1/ | 0.15 |
| 12 | Navigate 127.0.0.1/help/feedback/slide | 0.11 |
| 13 | Fill "領収書を探しやすくしてほしいです" getByLabel('ご意見・ご要望') | 0.05 |
| 14 | Click getByLabel('連絡先メールアドレス') | 0.08 |
| 15 | Click getByRole('button', { name: '送信', exact: true }) | 0.08 |
| 16 | Click getByRole('link', { name: /^フィードバック/ }).first() | 0.17 |
| 17 | Click getByRole('link', { name: /領収書を探しやすくしてほしいです/ }) | 0.20 |
| 18 | Click getByRole('button', { name: '確認済みにする', exact: true }) | 0.32 |

### H11 11. プロダクトの画面から問い合わせる（3分）

24操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/billing/receipts?account=private-query-marker | 0.02 |
| 2 | Press "Tab"  | 0.01 |
| 3 | Press "Tab"  | 0.00 |
| 4 | Press "Tab"  | 0.00 |
| 5 | Press "Enter"  | 0.01 |
| 6 | Press "Tab"  | 0.00 |
| 7 | Press "Enter"  | 0.01 |
| 8 | Press "Tab"  | 0.00 |
| 9 | Press "Enter"  | 0.00 |
| 10 | Press "Tab"  | 0.00 |
| 11 | Press "Tab"  | 0.00 |
| 12 | Press "Tab"  | 0.00 |
| 13 | Press "Tab"  | 0.00 |
| 14 | Press "Tab"  | 0.00 |
| 15 | Press "Tab"  | 0.00 |
| 16 | Press "Enter"  | 0.00 |
| 17 | Press "Tab"  | 0.00 |
| 18 | Press "Tab"  | 0.00 |
| 19 | Press "Enter"  | 0.00 |
| 20 | Press "Tab"  | 0.00 |
| 21 | Press "Tab"  | 0.00 |
| 22 | Press "Enter"  | 0.00 |
| 23 | Navigate 127.0.0.1/ | 0.08 |
| 24 | Click locator('a.conversation-row').filter({ hasText: '領収書を発行したい' }) | 0.08 |

### H12 12. 記事を書き、問い合わせの前に解決できたかを見る（4分）

15操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/articles | 0.13 |
| 2 | Click getByRole('link', { name: '記事を書く' }) | 0.06 |
| 3 | Select option getByRole('combobox', { name: 'プロダクト' }) | 0.09 |
| 4 | Fill "共有リンクを作成する" getByLabel('題名') | 0.01 |
| 5 | Fill "編集画面から閲覧用の共有リンクを発行できます。" getByLabel(/要約/) | 0.01 |
| 6 | Fill "編集画面で「共有」を選び、「閲覧用リンクをコピー」を押します。" getByLabel('本文') | 0.00 |
| 7 | Click getByRole('button', { name: '公開する' }) | 0.03 |
| 8 | Click locator('#action-confirmation').locator('[data-commit]') | 0.10 |
| 9 | Navigate 127.0.0.1/help/chat/slide | 0.07 |
| 10 | Fill "共有リンクを発行したい" getByLabel('質問', { exact: true }) | 0.02 |
| 11 | Click getByRole('button', { name: '質問する' }) | 0.03 |
| 12 | Click getByRole('link', { name: '共有リンクを作成する', exact: true }) | 0.07 |
| 13 | Click getByRole('button', { name: 'やりとりに戻る' }) | 0.03 |
| 14 | Click getByRole('button', { name: '解決した', exact: true }) | 0.04 |
| 15 | Navigate 127.0.0.1/metrics | 0.12 |

### J6 記事を読んで、別の質問を問い合わせとして受け付ける

12操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/help/chat/slide | 0.09 |
| 2 | Fill "領収書を発行できますか？" getByLabel('質問') | 0.03 |
| 3 | Click getByRole('button', { name: '質問する' }) | 0.06 |
| 4 | Click getByRole('link', { name: '領収書を発行する' }) | 0.12 |
| 5 | Click getByRole('link', { name: '新しいタブで開く' }) | 0.09 |
| 6 | Click getByRole('button', { name: 'やりとりに戻る' }) | 0.03 |
| 7 | Fill "カタログの印刷について相談したいです" getByLabel('質問') | 0.01 |
| 8 | Click getByRole('button', { name: '質問する' }) | 0.04 |
| 9 | Click getByLabel('連絡先メールアドレス') | 0.04 |
| 10 | Click getByRole('button', { name: '送信', exact: true }) | 0.06 |
| 11 | Navigate 127.0.0.1/ | 0.20 |
| 12 | Click getByRole('link', { name: /カタログの印刷について相談したいです/ }) | 0.22 |

### J12 チャットで読んだ記事で解決できない質問をそのまま運営へ送る

10操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/help/chat/slide | 0.08 |
| 2 | Fill "領収書はどこから発行できますか？" getByLabel('質問') | 0.07 |
| 3 | Click getByRole('button', { name: '質問する' }) | 0.08 |
| 4 | Click getByRole('link', { name: '領収書を発行する' }) | 0.12 |
| 5 | Click getByRole('button', { name: 'やりとりに戻る' }) | 0.03 |
| 6 | Click getByRole('button', { name: '解決しなかった' }) | 0.08 |
| 7 | Click getByLabel('連絡先メールアドレス') | 0.07 |
| 8 | Click getByRole('button', { name: '送信', exact: true }) | 0.10 |
| 9 | Navigate 127.0.0.1/ | 0.12 |
| 10 | Click getByRole('link', { name: /領収書はどこから発行できますか？/ }) | 0.14 |

### W3 公開ヘルプで探した記事を読み、評価後に同じ製品の窓口へ進む

5操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/help/articles/slide/ | 0.10 |
| 2 | Fill "領収書" getByLabel('記事を検索') | 0.02 |
| 3 | Click getByRole('link', { name: '領収書を発行する' }) | 0.09 |
| 4 | Click getByRole('button', { name: 'いいえ' }) | 0.07 |
| 5 | Click getByRole('link', { name: 'お問い合わせ' }) | 0.05 |

### W3 製品内で記事を読んで解決を伝え、受信箱に問い合わせが増えていないことを確かめる

8操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/billing/receipts | 0.02 |
| 2 | Click getByRole('button', { name: 'ヘルプ', exact: true }) | 0.05 |
| 3 | Fill "領収書を発行したい" locator('iframe').contentFrame().getByRole('textbox', { name: '質問', exact: true }) | 0.07 |
| 4 | Click locator('iframe').contentFrame().getByRole('button', { name: '質問する' }) | 0.05 |
| 5 | Click locator('iframe').contentFrame().getByRole('link', { name: '領収書を発行する' }) | 0.07 |
| 6 | Click locator('iframe').contentFrame().getByRole('button', { name: 'やりとりに戻る' }) | 0.03 |
| 7 | Click locator('iframe').contentFrame().getByRole('button', { name: '解決した', exact: true }) | 0.04 |
| 8 | Reload  | 0.11 |

## W4

### A3 声を受付期間・プロダクト・ラベル別に集計し、同じ条件の問い合わせとフィードバックを開く

13操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/voices | 0.12 |
| 2 | Select option getByRole('combobox', { name: 'プロダクト', exact: true }) | 0.02 |
| 3 | Fill "2026-11-01" getByLabel('開始日') | 0.01 |
| 4 | Fill "2026-11-01" getByLabel('終了日') | 0.01 |
| 5 | Click getByRole('button', { name: '集計する' }) | 0.09 |
| 6 | Click getByRole('main').getByRole('link', { name: '新しい受付', exact: true }) | 0.06 |
| 7 | Go back  | 0.07 |
| 8 | Click getByRole('main').getByRole('link', { name: 'Slide', exact: true }) | 0.06 |
| 9 | Go back  | 0.08 |
| 10 | Click getByRole('main').getByRole('link', { name: '2026-11', exact: true }) | 0.06 |
| 11 | Go back  | 0.09 |
| 12 | Click getByRole('main').getByRole('link', { name: '新しい受付', exact: true }) | 0.08 |
| 13 | Click getByRole('main').getByRole('link', { name: /^#10 / }) | 0.17 |

### A4 元の会話を見ながら候補を記事にし、候補一覧から保存した下書きを再開する

13操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/conversation/1 | 0.20 |
| 2 | Click locator('[data-extension="articles"]').getByRole('button', { name: '記事の候補に追加', exact: true }) | 0.06 |
| 3 | Fill "領収書の宛名変更の手順" locator('[data-extension="articles"]').getByLabel('記事にする内容') | 0.01 |
| 4 | Click locator('[data-extension="articles"]').locator('form').getByRole('button', { name: '記事の候補に追加', exact: true }) | 0.13 |
| 5 | Click getByRole('link', { name: 'ヘルプ記事', exact: true }) | 0.15 |
| 6 | Click getByRole('link', { name: /候補（1件）/ }) | 0.13 |
| 7 | Click getByRole('link', { name: /領収書の宛名変更の手順/ }) | 0.04 |
| 8 | Click getByRole('link', { name: '元の会話 #1 を開く' }) | 0.03 |
| 9 | Fill "注文履歴から変更できます。" getByLabel('本文') | 0.01 |
| 10 | Click getByRole('button', { name: 'プレビュー' }) | 0.07 |
| 11 | Click getByRole('button', { name: '下書きを保存' }) | 0.09 |
| 12 | Navigate 127.0.0.1/articles/candidates | 0.11 |
| 13 | Click getByRole('link', { name: /領収書の宛名変更の手順/ }) | 0.05 |

### H08 8. 答えるだけで終わらせず、直す(4分) / H09 9. 数値を見る(2分)

24操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('link', { name: '拡張の管理', exact: true }) | 0.09 |
| 2 | Click locator('[data-extension=issues]').getByRole('link', { name: '設定' }) | 0.28 |
| 3 | Fill "example/helpdesk" locator('[data-ui=form-section]').filter({ has: getByRole('heading', { name: 'Slide', exact: true }) }).getByLabel('GitHub リポジトリ') | 0.10 |
| 4 | Click locator('[data-ui=form-section]').filter({ has: getByRole('heading', { name: 'Slide', exact: true }) }).getByRole('button', { name: 'リポジトリを更新', exact: true }) | 0.10 |
| 5 | Click getByRole('navigation', { name: '受信箱', exact: true }).getByRole('link', { name: /未対応/ }) | 0.14 |
| 6 | Click locator('a.conversation-row').filter({ has: getByText('#12', { exact: true }) }) | 0.35 |
| 7 | Click locator('[data-extension=issues]').getByRole('button', { name: 'Issue を起票する', exact: true }) | 0.17 |
| 8 | Fill "領収書を見つけやすくする" locator('[data-extension=issues]').getByLabel('タイトル') | 0.01 |
| 9 | Fill "領収書の発行手順を見つけやすくします。" locator('[data-extension=issues]').getByLabel('公開する要約') | 0.01 |
| 10 | Click locator('[data-extension=issues]').getByRole('button', { name: '起票内容を確認', exact: true }) | 0.04 |
| 11 | Click getByRole('dialog').getByRole('button', { name: '確認した内容で起票', exact: true }) | 0.21 |
| 12 | Click getByRole('navigation', { name: '受信箱', exact: true }).getByRole('link', { name: /未対応/ }) | 0.27 |
| 13 | Click locator('a.conversation-row').filter({ has: getByText('#1', { exact: true }) }) | 0.42 |
| 14 | Click getByText('既存の Issue を選ぶ', { exact: true }) | 0.10 |
| 15 | Click getByRole('button', { name: '既存の Issue と紐づける', exact: true }) | 0.06 |
| 16 | Click locator('#action-confirmation').locator('[data-commit]') | 0.14 |
| 17 | Click locator('[data-extension=articles]').getByRole('button', { name: '記事の候補に追加', exact: true }) | 0.22 |
| 18 | Fill "領収書発行の案内" locator('[data-extension=articles]').getByLabel('記事にする内容') | 0.01 |
| 19 | Click locator('[data-extension=articles]').locator('form').getByRole('button', { name: '記事の候補に追加', exact: true }) | 0.12 |
| 20 | Click getByRole('link', { name: '課題', exact: true }) | 0.18 |
| 21 | Click getByRole('link', { name: '領収書を見つけやすくする', exact: true }) | 0.16 |
| 22 | Click getByRole('link', { name: '対応状況の集計' }) | 0.22 |
| 23 | Select option getByRole('combobox', { name: 'プロダクト', exact: true }) | 0.02 |
| 24 | Select option getByRole('combobox', { name: '期間', exact: true }) | 0.02 |

### H12 12. 記事を書き、問い合わせの前に解決できたかを見る（4分）

15操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/articles | 0.13 |
| 2 | Click getByRole('link', { name: '記事を書く' }) | 0.06 |
| 3 | Select option getByRole('combobox', { name: 'プロダクト' }) | 0.09 |
| 4 | Fill "共有リンクを作成する" getByLabel('題名') | 0.01 |
| 5 | Fill "編集画面から閲覧用の共有リンクを発行できます。" getByLabel(/要約/) | 0.01 |
| 6 | Fill "編集画面で「共有」を選び、「閲覧用リンクをコピー」を押します。" getByLabel('本文') | 0.00 |
| 7 | Click getByRole('button', { name: '公開する' }) | 0.03 |
| 8 | Click locator('#action-confirmation').locator('[data-commit]') | 0.10 |
| 9 | Navigate 127.0.0.1/help/chat/slide | 0.07 |
| 10 | Fill "共有リンクを発行したい" getByLabel('質問', { exact: true }) | 0.02 |
| 11 | Click getByRole('button', { name: '質問する' }) | 0.03 |
| 12 | Click getByRole('link', { name: '共有リンクを作成する', exact: true }) | 0.07 |
| 13 | Click getByRole('button', { name: 'やりとりに戻る' }) | 0.03 |
| 14 | Click getByRole('button', { name: '解決した', exact: true }) | 0.04 |
| 15 | Navigate 127.0.0.1/metrics | 0.12 |

### J8 起票内容を確認し、Issue が閉じた通知案を承認する

9操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/ | 0.17 |
| 2 | Click getByRole('link', { name: /領収書の宛名を変更できますか/ }) | 0.10 |
| 3 | Click locator('[data-extension="issues"]').getByText('Issue を起票する', { exact: true }) | 0.12 |
| 4 | Fill "領収書を見つけやすくする" locator('[data-extension="issues"]').getByLabel('タイトル') | 0.01 |
| 5 | Fill "請求書を表示するボタンが画面外に出ます。" locator('[data-extension="issues"]').getByLabel('公開する要約') | 0.01 |
| 6 | Click locator('[data-extension="issues"]').getByRole('button', { name: '起票内容を確認' }) | 0.06 |
| 7 | Click getByRole('button', { name: '確認した内容で起票' }) | 0.15 |
| 待ち | Expect "toPass"  | 1.70 |
| 8 | Click getByRole('button', { name: '承認して送信' }) | 0.04 |
| 9 | Click locator('#action-confirmation').locator('[data-commit]') | 0.18 |

### J10 直近30日の指標を確認しプロダクトと期間を切り替える

9操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/ | 0.12 |
| 2 | Click getByRole('link', { name: '対応状況の集計' }) | 0.09 |
| 3 | Select option getByRole('combobox', { name: 'プロダクト', exact: true }) | 0.00 |
| 4 | Select option getByRole('combobox', { name: '期間', exact: true }) | 0.11 |
| 5 | Select option getByRole('combobox', { name: '期間', exact: true }) | 0.00 |
| 6 | Select option getByRole('combobox', { name: 'プロダクト', exact: true }) | 0.12 |
| 7 | Click getByRole('button', { name: '日付の範囲' }) | 0.24 |
| 8 | Fill "2026-11-01" getByLabel('開始日') | 0.04 |
| 9 | Fill "2026-11-15" getByLabel('終了日') | 0.23 |

### W4 課題の優先順位・詳細・検索の境界と既存の題の同期

6操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/issues | 0.18 |
| 2 | Click getByRole('main').getByRole('table', { name: '直した' }).getByRole('link', { name: '領収書の宛名を変更できるようにする' }) | 0.06 |
| 3 | Click getByRole('link', { name: '課題の一覧に戻る' }) | 0.08 |
| 4 | Reload  | 0.11 |
| 5 | Reload  | 0.12 |
| 6 | Fill "追加課題19" getByRole('main').getByRole('searchbox') | 0.02 |

### W4 声の内訳から開いた会話を記事候補にして、同じ声の本文を編集画面で確かめる

9操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('link', { name: '声の集計', exact: true }) | 0.07 |
| 2 | Click getByRole('main').getByRole('link', { name: 'Slide', exact: true }) | 0.12 |
| 3 | Click getByRole('link', { name: /^#1 / }) | 0.22 |
| 4 | Click locator('[data-extension="articles"]').getByRole('button', { name: '記事の候補に追加', exact: true }) | 0.04 |
| 5 | Fill "発行済みの領収書の宛名を変える手順" locator('[data-extension="articles"]').getByLabel('記事にする内容') | 0.01 |
| 6 | Click locator('[data-extension="articles"]').locator('form').getByRole('button', { name: '記事の候補に追加', exact: true }) | 0.13 |
| 7 | Click getByRole('link', { name: 'ヘルプ記事', exact: true }) | 0.15 |
| 8 | Click getByRole('link', { name: /候補（1件）/ }) | 0.17 |
| 9 | Click getByRole('link', { name: '発行済みの領収書の宛名を変える手順' }) | 0.14 |

### W4 起票・題で紐づけ・修正の下書き・承認したお知らせを数える

34操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/issues | 0.14 |
| 2 | Click getByRole('link', { name: '課題を追加' }) | 0.06 |
| 3 | Select option getByLabel('もとになる会話') | 0.09 |
| 4 | Fill "領収書の検索を改善する" getByLabel('タイトル') | 0.01 |
| 5 | Fill "検索条件の保存に対応する" getByLabel('公開する要約') | 0.01 |
| 6 | Click getByRole('button', { name: '起票内容を確認' }) | 0.06 |
| 7 | Click locator('#action-confirmation').locator('[data-commit]') | 0.12 |
| 8 | Navigate 127.0.0.1/conversation/6 | 0.32 |
| 9 | Click getByText('既存の Issue を選ぶ', { exact: true }) | 0.07 |
| 10 | Fill "存在しない題" getByLabel('題で探す') | 0.01 |
| 11 | Fill "検索を改善" getByLabel('題で探す') | 0.01 |
| 12 | Click getByRole('button', { name: '既存の Issue と紐づける' }) | 0.03 |
| 13 | Click locator('#action-confirmation').locator('[data-commit]') | 0.10 |
| 14 | Click locator('nav a[href="/issues"]') | 0.07 |
| 15 | Click getByRole('main').getByRole('link', { name: '領収書の検索を改善する' }) | 0.06 |
| 16 | Click getByRole('main').getByRole('link', { name: /#1 / }) | 0.09 |
| 17 | Click getByRole('button', { name: '完了にする', exact: true }) | 0.22 |
| 18 | Click locator('nav a[href="/issues"]') | 0.28 |
| 待ち | Expect "toPass"  | 1.65 |
| 19 | Click getByRole('main').getByRole('region', { name: /知らせる待ち/ }).getByRole('link', { name: '領収書の検索を改善する' }) | 0.08 |
| 20 | Click getByRole('main').getByRole('link', { name: /#1 .*再開して承認/ }) | 0.07 |
| 21 | Click locator('article').filter({ hasText: '問題の修正が完了しました' }).getByRole('button', { name: '下書きを破棄' }) | 0.14 |
| 22 | Click locator('#action-confirmation').locator('[data-commit]') | 0.11 |
| 23 | Click locator('nav a[href="/issues"]') | 0.14 |
| 24 | Click getByRole('main').getByRole('region', { name: /知らせる待ち/ }).getByRole('link', { name: '領収書の検索を改善する' }) | 0.17 |
| 25 | Click getByRole('main').getByRole('link', { name: '課題の一覧に戻る' }) | 0.06 |
| 26 | Click getByRole('main').getByRole('region', { name: /知らせる待ち/ }).getByRole('button', { name: '下書きを作る' }) | 0.27 |
| 27 | Click getByRole('main').getByRole('link', { name: /#1 / }) | 0.10 |
| 28 | Click getByRole('button', { name: '再開する', exact: true }) | 0.11 |
| 29 | Click locator('article').filter({ hasText: '問題の修正が完了しました' }).getByRole('button', { name: '承認して送信' }) | 0.28 |
| 30 | Click locator('#action-confirmation').locator('[data-commit]') | 0.31 |
| 31 | Click locator('nav a[href="/issues"]') | 0.07 |
| 32 | Click getByRole('link', { name: '対応状況の集計' }) | 0.07 |
| 33 | Select option getByRole('combobox', { name: 'プロダクト', exact: true }) | 0.01 |
| 34 | Select option getByRole('combobox', { name: 'プロダクト', exact: true }) | 0.01 |

## W5

### H10 10. 場を整える(3分)

9操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('link', { name: /佐藤 優 のアカウント/ }) | 0.06 |
| 2 | Click getByRole('link', { name: '設定', exact: true }) | 0.07 |
| 3 | Click getByRole('link', { name: /^プロダクトと窓口/ }) | 0.16 |
| 4 | Click getByRole('link', { name: '設定に戻る' }) | 0.14 |
| 5 | Click getByRole('link', { name: /^保存期間/ }) | 0.18 |
| 6 | Click getByRole('link', { name: '設定に戻る' }) | 0.06 |
| 7 | Click getByRole('link', { name: /^連絡先のデータ削除/ }) | 0.20 |
| 8 | Click getByRole('link', { name: '設定に戻る' }) | 0.06 |
| 9 | Click getByRole('link', { name: /^API トークンの管理/ }) | 0.13 |

### J9 窓口を作成し、拡張の案内から新プロダクトの公開受付を開始する

19操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/ | 0.21 |
| 2 | Click getByRole('link', { name: '設定', exact: true }) | 0.18 |
| 3 | Click getByRole('link', { name: /^プロダクトと窓口/ }) | 0.18 |
| 4 | Fill "Catalog" getByLabel('プロダクト名', { exact: true }) | 0.10 |
| 5 | Fill "catalog" getByLabel('窓口アドレスの先頭').first() | 0.01 |
| 6 | Select option getByLabel('送信ドメイン').first() | 0.03 |
| 7 | Click getByRole('button', { name: '窓口を登録' }) | 0.12 |
| 8 | Click getByRole('link', { name: '拡張の管理', exact: true }) | 0.08 |
| 9 | Click locator('[data-extension=form]').getByRole('switch', { name: /有効にする/ }) | 0.17 |
| 10 | Click locator('#action-confirmation').locator('[data-commit]') | 0.09 |
| 11 | Click locator('[data-extension=form]').getByRole('link', { name: '設定' }) | 0.18 |
| 12 | Click locator('section').filter({ has: getByRole('heading', { name: 'Catalog', exact: true }) }).last().getByRole('button', { name: 'このサイトで受付を開始' }) | 0.18 |
| 13 | Click locator('section').filter({ has: getByRole('heading', { name: 'Catalog', exact: true }) }).last().getByRole('link', { name: '公開フォームを開く' }) | 0.12 |
| 14 | Fill "新しい窓口への相談" getByLabel('件名') | 0.03 |
| 15 | Fill "届いているか確認してください。" getByLabel('お問い合わせ内容') | 0.01 |
| 16 | Click getByLabel('連絡先メールアドレス') | 0.04 |
| 17 | Click getByRole('button', { name: '送信', exact: true }) | 0.08 |
| 18 | Navigate 127.0.0.1/ | 0.10 |
| 19 | Click getByRole('link', { name: /新しい窓口への相談/ }) | 0.12 |

### J11 候補から相手を選び、確認して会話を削除する

8操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/ | 0.15 |
| 2 | Click getByRole('link', { name: '設定', exact: true }) | 0.27 |
| 3 | Click getByRole('link', { name: /^連絡先のデータ削除/ }) | 0.18 |
| 4 | Select option getByRole('combobox', { name: '削除する相手' }) | 0.02 |
| 5 | Click getByRole('button', { name: '削除内容を確認' }) | 0.06 |
| 6 | Click getByRole('dialog').getByRole('button', { name: 'キャンセル' }) | 0.03 |
| 7 | Click getByRole('button', { name: '削除内容を確認' }) | 0.04 |
| 8 | Click getByRole('dialog').getByRole('button', { name: 'すべて削除' }) | 0.14 |

### J14 表示名とアイコンを保存し、担当・メモ・記録から同じ運営者を見分ける

15操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('link', { name: /アカウント/ }) | 0.10 |
| 2 | Fill "青木 ゆり" getByLabel('表示名', { exact: true }) | 0.10 |
| 3 | Set input files getByLabel('アイコン画像') | 0.01 |
| 4 | Click getByRole('button', { name: 'アカウントを保存' }) | 0.14 |
| 5 | Navigate 127.0.0.1/conversation/1 | 0.13 |
| 6 | Click getByRole('button', { name: '担当者を選ぶ' }) | 0.05 |
| 7 | Click getByRole('button', { name: '青木 ゆり', exact: true }) | 0.04 |
| 8 | Click getByRole('tab', { name: '内部メモ', exact: true }) | 0.03 |
| 9 | Fill "確認中です。" getByRole('textbox', { name: '内部メモ' }) | 0.01 |
| 10 | Click getByRole('button', { name: 'メモを残す' }) | 0.03 |
| 11 | Navigate 127.0.0.1/ | 0.15 |
| 12 | Click getByRole('button', { name: '絞り込み', exact: true }) | 0.05 |
| 13 | Click getByRole('button', { name: /^担当者 すべて$/ }) | 0.03 |
| 14 | Click locator('#filter-assignee').getByRole('button', { name: /青木 ゆり/ }) | 0.05 |
| 15 | Navigate 127.0.0.1/conversation/5 | 0.20 |

### W5 管理者が窓口・運営者の権限・保存期間を設定し、選んだ相手のデータだけを削除する

21操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('link', { name: '設定', exact: true }) | 0.10 |
| 2 | Click getByRole('link', { name: /^プロダクトと窓口/ }) | 0.14 |
| 3 | Fill "Atlas" getByLabel('プロダクト名', { exact: true }) | 0.09 |
| 4 | Fill "atlas" getByLabel('窓口アドレスの先頭').first() | 0.00 |
| 5 | Select option getByLabel('送信ドメイン').first() | 0.00 |
| 6 | Click getByRole('button', { name: '窓口を登録' }) | 0.10 |
| 7 | Click getByRole('link', { name: '設定に戻る' }) | 0.06 |
| 8 | Click getByRole('link', { name: /^運営者/ }) | 0.22 |
| 9 | Click locator('details').filter({ has: getByRole('region', { name: 'mori@example.com', includeHidden: true }) }).locator('summary') | 0.12 |
| 10 | Select option locator('details').filter({ has: getByRole('region', { name: 'mori@example.com', includeHidden: true }) }).getByLabel('権限') | 0.00 |
| 11 | Click locator('details').filter({ has: getByRole('region', { name: 'mori@example.com', includeHidden: true }) }).getByRole('button', { name: '運営者を保存' }) | 0.06 |
| 12 | Click locator('details').filter({ has: getByRole('region', { name: 'mori@example.com', includeHidden: true }) }).locator('summary') | 0.08 |
| 13 | Click getByRole('link', { name: '設定に戻る' }) | 0.05 |
| 14 | Click getByRole('link', { name: /^保存期間/ }) | 0.13 |
| 15 | Fill "30" getByRole('spinbutton') | 0.09 |
| 16 | Click getByRole('button', { name: '保存期間を変更' }) | 0.08 |
| 17 | Click getByRole('link', { name: '設定に戻る' }) | 0.14 |
| 18 | Click getByRole('link', { name: /^連絡先のデータ削除/ }) | 0.05 |
| 19 | Select option getByRole('combobox', { name: '削除する相手' }) | 0.09 |
| 20 | Click getByRole('button', { name: '削除内容を確認' }) | 0.03 |
| 21 | Click getByRole('dialog').getByRole('button', { name: 'すべて削除' }) | 0.07 |
