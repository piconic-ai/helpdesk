# 製品サイトから問い合わせる

[ハンズオン第11章](../../hands-on.md)は、製品画面の「ヘルプ」を開き、記事を読んでから問い合わせを送り、運営側で同じ番号を照合する手順です。[埋め込みの設定と起動方法](../../dev/embedding.md)にローカルで動かすコマンドがあります。

| 製品画面 | 375px | 1024px | 1440px |
| --- | --- | --- | --- |
| ヘルプを開く前 | [画像](after/widget-closed-375.png) | [画像](after/widget-closed-1024.png) | [画像](after/widget-closed-1440.png) |
| 質問を入力する | [画像](after/widget-open-375.png) | [画像](after/widget-open-1024.png) | [画像](after/widget-open-1440.png) |
| 関連記事を選ぶ | [画像](after/widget-suggestions-375.png) | [画像](after/widget-suggestions-1024.png) | [画像](after/widget-suggestions-1440.png) |
| 記事を枠内で読む | [画像](after/widget-article-375.png) | [画像](after/widget-article-1024.png) | [画像](after/widget-article-1440.png) |
| 連絡先を入力する | [画像](after/widget-handoff-375.png) | [画像](after/widget-handoff-1024.png) | [画像](after/widget-handoff-1440.png) |
| 受付番号と返信先を確認する | [画像](after/widget-receipt-375.png) | [画像](after/widget-receipt-1024.png) | [画像](after/widget-receipt-1440.png) |
| 合う記事が無い場合 | [画像](after/widget-no-match-375.png) | [画像](after/widget-no-match-1024.png) | [画像](after/widget-no-match-1440.png) |
| ボタンと文言を設定する | [画像](after/widget-options-375.png) | [画像](after/widget-options-1024.png) | [画像](after/widget-options-1440.png) |
| 運営画面で見本を開く | [画像](after/widget-preview-375.png) | [画像](after/widget-preview-1024.png) | [画像](after/widget-preview-1440.png) |
| CSP の案内を確認する | [画像](after/widget-csp-375.png) | [画像](after/widget-csp-1024.png) | [画像](after/widget-csp-1440.png) |

[キーボードで問い合わせるテスト](../../../tests/ux/widget-journey.pw.mjs)は、375px 幅で別オリジンの製品サイトから問い合わせを送信します。受信箱の受付番号と元ページを照合し、クエリ文字列とフラグメントが helpdesk への通信に含まれないことも調べます。
