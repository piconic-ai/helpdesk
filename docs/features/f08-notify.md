# F08 運営者への通知

## 利用場面

新着や担当者変更を外部で知りたい。

## 得られる結果

設定した Slack または Discord の Webhook に番号と件名が届く。

## 体験の流れ

運営者が通知先を設定し、新着または担当者変更を通知先で確認する。

## 作る範囲

運営者への通知の設定、実行、結果の記録。

## 作らないこと

複数の組織にまたがるデータの集計・配送。

## 受け入れ条件

- **F08-AC1** 新着と担当者変更の通知は既定で番号と件名だけを送る。
- **F08-AC2** 本文を含める設定を選んだときのみ通知に受信本文が加わる。
- **F08-AC3** メール通知を設定した場合、登録済み運営者に通知できる。

## 未決事項

実サービスとの疎通と文面の評価は導入時に確認する。


## プロジェクトごとの送り先

`helpdesk.config.ts` で、運営者への通知を送るプロジェクトと配送方法を指定します。メールの宛先には、そのプロジェクトを読める運営者を指定します。

```ts
{ extension: notify, enabled: true, settings: { projects: {
  slide: { format: 'slack', webhookLabel: '#slide-support' },
  desk: { format: 'discord', webhookLabel: 'Desk の問い合わせ', email: 'desk-operator@example.org' }
} } }
```

Webhook URL は Worker シークレット `NOTIFY_PROJECT_WEBHOOKS` に、プロジェクトIDをキー、URLを値にした JSON オブジェクトで登録します。画面にはチャンネルの表示名だけが出ます。`settings.projects` に無いプロジェクトは送信をスキップします。既存環境でこの項目を省いた場合は、従来の `settings.email` と `NOTIFY_WEBHOOK_URL` を共通の送り先として使います。
