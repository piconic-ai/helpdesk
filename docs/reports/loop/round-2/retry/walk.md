# ブラウザー操作の記録

見本データを入れ直したブラウザーで実行した。表にはクリック、入力、選択、キー操作、画面遷移を1操作ずつ記録した。複数章をひと続きに通す H06/H07 は共同記録で、操作数の内訳は算出しない。秒数はテスト環境でブラウザー操作が完了するまでの実測値。1秒以上かかった表示待ちは別の行に記録する。

## W1

### H01 1. 受信箱を読む(3分)

13操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('button', { name: 'すべてのプロダクト', exact: true }) | 0.08 |
| 2 | Click getByRole('link', { name: 'Desk', exact: true }) | 0.10 |
| 3 | Click getByRole('button', { name: 'Desk', exact: true }) | 0.04 |
| 4 | Click getByRole('link', { name: 'すべてのプロダクト', exact: true }) | 0.07 |
| 5 | Fill "領収書" getByRole('searchbox', { name: '問い合わせを検索' }) | 0.02 |
| 6 | Fill "" getByRole('searchbox', { name: '問い合わせを検索' }) | 0.01 |
| 7 | Click getByRole('button', { name: '絞り込み', exact: true }) | 0.12 |
| 8 | Click getByRole('button', { name: '担当者 すべて', exact: true }) | 0.05 |
| 9 | Click getByRole('button', { name: '佐藤 優', exact: true }) | 0.10 |
| 10 | Click getByRole('link', { name: '佐藤 優を外す' }) | 0.09 |
| 11 | Click getByRole('button', { name: '絞り込み', exact: true }) | 0.16 |
| 12 | Select option getByRole('combobox', { name: 'ラベル' }) | 0.01 |
| 13 | Click getByRole('link', { name: '請求を外す' }) | 0.12 |

### H02 2. 問い合わせに答える(7分)

12操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click locator('a.conversation-row').filter({ has: getByText('#6', { exact: true }) }) | 0.19 |
| 2 | Click getByRole('button', { name: '担当者を選ぶ', exact: true }) | 0.18 |
| 3 | Click getByRole('button', { name: '佐藤 優', exact: true }) | 0.05 |
| 4 | Click getByRole('button', { name: 'ラベルを選ぶ', exact: true }) | 0.06 |
| 5 | Click getByRole('button', { name: '請求を付ける', exact: true }) | 0.10 |
| 6 | Fill "こちらの記事で、領収書を発行する手順をご確認ください。" getByRole('textbox', { name: '返信', exact: true }) | 0.01 |
| 7 | Click getByRole('button', { name: '記事を添える', exact: true }) | 0.04 |
| 8 | Fill "領収書" getByLabel('記事の題名で検索') | 0.00 |
| 9 | Click getByRole('button', { name: '領収書を発行する', exact: true }) | 0.03 |
| 10 | Click getByRole('button', { name: 'プレビュー', exact: true }) | 0.05 |
| 11 | Click getByRole('button', { name: '送信して完了', exact: true }) | 0.04 |
| 12 | Click getByRole('link', { name: '次の未対応へ' }) | 0.15 |

### H03 3. 内部メモを残す(2分) / H04 4. 送信の失敗に気づいて直す(2分)

6操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('tab', { name: '内部メモ' }) | 0.04 |
| 2 | Fill "次回の案内は経理チームに確認済みです。" getByRole('textbox', { name: '内部メモ' }) | 0.01 |
| 3 | Click getByRole('button', { name: 'メモを残す', exact: true }) | 0.04 |
| 4 | Click getByRole('navigation', { name: '受信箱', exact: true }).getByRole('link', { name: /未対応/ }) | 0.07 |
| 5 | Click locator('a.conversation-row').filter({ has: getByText('#4', { exact: true }) }) | 0.09 |
| 6 | Click getByRole('button', { name: '再送', exact: true }) | 0.11 |

### H05 5. AI の下書きを承認する(4分)

10操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('navigation', { name: '受信箱', exact: true }).getByRole('link', { name: /承認待ち/ }) | 0.11 |
| 2 | Click locator('a.conversation-row').filter({ has: getByText('#5', { exact: true }) }) | 0.29 |
| 3 | Fill "更新日の前日まで、メンバー数を変更できます。" locator('article').filter({ has: getByRole('textbox', { name: '下書きの本文' }) }).getByRole('textbox', { name: '下書きの本文' }) | 0.00 |
| 4 | Click locator('article').filter({ has: getByRole('textbox', { name: '下書きの本文' }) }).getByRole('button', { name: '承認して送信', exact: true }) | 0.05 |
| 5 | Click getByRole('dialog').getByRole('button', { name: 'キャンセル', exact: true }) | 0.04 |
| 6 | Click locator('article').filter({ has: getByRole('textbox', { name: '下書きの本文' }) }).getByRole('button', { name: '下書きを破棄', exact: true }) | 0.04 |
| 7 | Click getByRole('dialog').getByRole('button', { name: 'キャンセル', exact: true }) | 0.05 |
| 8 | Click locator('article').filter({ has: getByRole('textbox', { name: '下書きの本文' }) }).getByRole('button', { name: '承認して送信', exact: true }) | 0.03 |
| 9 | Click locator('#action-confirmation').locator('[data-commit]') | 0.11 |
| 10 | Reload  | 0.12 |

## W2

### H06 6. ユーザーの立場で、自分で解決する(5分) / H07 7. 返信不要の声を受け止める(3分)

18操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/help/chat/slide | 0.05 |
| 2 | Fill "領収書を発行したい" getByLabel('質問') | 0.02 |
| 3 | Click getByRole('button', { name: '質問する', exact: true }) | 0.04 |
| 4 | Click getByRole('link', { name: /領収書を発行する/ }) | 0.09 |
| 5 | Click getByRole('link', { name: '新しいタブで開く' }) | 0.07 |
| 6 | Click getByRole('button', { name: 'いいえ', exact: true }) | 0.08 |
| 7 | Click getByRole('button', { name: 'やりとりに戻る', exact: true }) | 0.03 |
| 8 | Click getByRole('button', { name: '解決しなかった', exact: true }) | 0.03 |
| 9 | Click getByLabel('連絡先メールアドレス') | 0.06 |
| 10 | Click getByRole('button', { name: '送信', exact: true }) | 0.04 |
| 11 | Navigate 127.0.0.1/ | 0.09 |
| 12 | Navigate 127.0.0.1/help/feedback/slide | 0.07 |
| 13 | Fill "領収書を探しやすくしてほしいです" getByLabel('ご意見・ご要望') | 0.02 |
| 14 | Click getByLabel('連絡先メールアドレス') | 0.03 |
| 15 | Click getByRole('button', { name: '送信', exact: true }) | 0.07 |
| 16 | Click getByRole('link', { name: /^フィードバック/ }).first() | 0.07 |
| 17 | Click getByRole('link', { name: /領収書を探しやすくしてほしいです/ }) | 0.12 |
| 18 | Click getByRole('button', { name: '確認済みにする', exact: true }) | 0.13 |

## W3

### H06 6. ユーザーの立場で、自分で解決する(5分) / H07 7. 返信不要の声を受け止める(3分)

18操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Navigate 127.0.0.1/help/chat/slide | 0.05 |
| 2 | Fill "領収書を発行したい" getByLabel('質問') | 0.02 |
| 3 | Click getByRole('button', { name: '質問する', exact: true }) | 0.04 |
| 4 | Click getByRole('link', { name: /領収書を発行する/ }) | 0.09 |
| 5 | Click getByRole('link', { name: '新しいタブで開く' }) | 0.07 |
| 6 | Click getByRole('button', { name: 'いいえ', exact: true }) | 0.08 |
| 7 | Click getByRole('button', { name: 'やりとりに戻る', exact: true }) | 0.03 |
| 8 | Click getByRole('button', { name: '解決しなかった', exact: true }) | 0.03 |
| 9 | Click getByLabel('連絡先メールアドレス') | 0.06 |
| 10 | Click getByRole('button', { name: '送信', exact: true }) | 0.04 |
| 11 | Navigate 127.0.0.1/ | 0.09 |
| 12 | Navigate 127.0.0.1/help/feedback/slide | 0.07 |
| 13 | Fill "領収書を探しやすくしてほしいです" getByLabel('ご意見・ご要望') | 0.02 |
| 14 | Click getByLabel('連絡先メールアドレス') | 0.03 |
| 15 | Click getByRole('button', { name: '送信', exact: true }) | 0.07 |
| 16 | Click getByRole('link', { name: /^フィードバック/ }).first() | 0.07 |
| 17 | Click getByRole('link', { name: /領収書を探しやすくしてほしいです/ }) | 0.12 |
| 18 | Click getByRole('button', { name: '確認済みにする', exact: true }) | 0.13 |

## W4

### H08 8. 答えるだけで終わらせず、直す(4分) / H09 9. 数値を見る(2分)

24操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('link', { name: '拡張の管理', exact: true }) | 0.06 |
| 2 | Click locator('[data-extension=issues]').getByRole('link', { name: '設定' }) | 0.10 |
| 3 | Fill "example/helpdesk" locator('[data-ui=form-section]').filter({ has: getByRole('heading', { name: 'Slide', exact: true }) }).getByLabel('GitHub リポジトリ') | 0.05 |
| 4 | Click locator('[data-ui=form-section]').filter({ has: getByRole('heading', { name: 'Slide', exact: true }) }).getByRole('button', { name: 'リポジトリを更新', exact: true }) | 0.06 |
| 5 | Click getByRole('navigation', { name: '受信箱', exact: true }).getByRole('link', { name: /未対応/ }) | 0.04 |
| 6 | Click locator('a.conversation-row').filter({ has: getByText('#12', { exact: true }) }) | 0.12 |
| 7 | Click locator('[data-extension=issues]').getByRole('button', { name: 'Issue を起票する', exact: true }) | 0.14 |
| 8 | Fill "領収書を見つけやすくする" locator('[data-extension=issues]').getByLabel('タイトル') | 0.01 |
| 9 | Fill "領収書の発行手順を見つけやすくします。" locator('[data-extension=issues]').getByLabel('公開する要約') | 0.00 |
| 10 | Click locator('[data-extension=issues]').getByRole('button', { name: '起票内容を確認', exact: true }) | 0.03 |
| 11 | Click getByRole('dialog').getByRole('button', { name: '確認した内容で起票', exact: true }) | 0.10 |
| 12 | Click getByRole('navigation', { name: '受信箱', exact: true }).getByRole('link', { name: /未対応/ }) | 0.15 |
| 13 | Click locator('a.conversation-row').filter({ has: getByText('#1', { exact: true }) }) | 0.17 |
| 14 | Click getByText('既存の Issue を選ぶ', { exact: true }) | 0.07 |
| 15 | Click getByRole('button', { name: '既存の Issue と紐づける', exact: true }) | 0.07 |
| 16 | Click locator('#action-confirmation').locator('[data-commit]') | 0.08 |
| 17 | Click locator('[data-extension=articles]').getByRole('button', { name: '記事の候補に追加', exact: true }) | 0.07 |
| 18 | Fill "領収書発行の案内" locator('[data-extension=articles]').getByLabel('記事にする内容') | 0.00 |
| 19 | Click locator('[data-extension=articles]').locator('form').getByRole('button', { name: '記事の候補に追加', exact: true }) | 0.08 |
| 20 | Click getByRole('link', { name: '課題', exact: true }) | 0.16 |
| 21 | Click getByRole('link', { name: '領収書を見つけやすくする', exact: true }) | 0.10 |
| 22 | Click getByRole('link', { name: '対応状況の集計' }) | 0.07 |
| 23 | Select option getByRole('combobox', { name: 'プロダクト', exact: true }) | 0.00 |
| 24 | Select option getByRole('combobox', { name: '期間', exact: true }) | 0.02 |

## W5

### H10 10. 場を整える(3分)

9操作。実行結果 passed。

| 順 | 操作・表示待ち | 秒 |
| ---: | --- | ---: |
| 1 | Click getByRole('link', { name: /佐藤 優 のアカウント/ }) | 0.11 |
| 2 | Click getByRole('link', { name: '設定', exact: true }) | 0.05 |
| 3 | Click getByRole('link', { name: /^プロダクトと窓口/ }) | 0.10 |
| 4 | Click getByRole('link', { name: '設定に戻る' }) | 0.06 |
| 5 | Click getByRole('link', { name: /^保存期間/ }) | 0.10 |
| 6 | Click getByRole('link', { name: '設定に戻る' }) | 0.06 |
| 7 | Click getByRole('link', { name: /^連絡先のデータ削除/ }) | 0.10 |
| 8 | Click getByRole('link', { name: '設定に戻る' }) | 0.07 |
| 9 | Click getByRole('link', { name: /^API トークンの管理/ }) | 0.10 |
