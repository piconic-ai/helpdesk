export const guides: Record<string, { description: string; start: string }> = {
  articles: {
    description: '回答をヘルプ記事にまとめ、公開・検索できます。',
    start:
      '記事を書いて公開し、各プロダクトのヘルプページで内容を確認してください。',
  },
  form: {
    description: '問い合わせフォームの投稿を受信箱に取り込みます。',
    start:
      'プロダクトの受付を開始し、公開フォームからテストの問い合わせを送って受信箱を確認してください。',
  },
  feedback: {
    description: '製品への声を集め、確認済みや問い合わせに変更できます。',
    start:
      '公開フォームから感想を送り、サイドバーの「フィードバック」で受付を確認してください。',
  },
  chat: {
    description:
      '質問に合う記事を探し、該当記事がない場合は担当者に引き継ぎます。',
    start:
      'ヘルプ記事を有効にして記事を公開し、チャットでその内容を質問してください。Workers AI の AI バインディングが必要です。',
  },
  metrics: {
    description: '期間とプロダクトごとの対応件数や解決時間を表示します。',
    start:
      '集計画面でプロダクトと期間を選び、問い合わせを完了した前後の指標を確認してください。',
  },
  export: {
    description: '会話、メッセージ、操作履歴を JSON Lines で書き出します。',
    start: '相手の情報を伏せるか選び、書き出した内容を確認してください。',
  },
  snooze: {
    description: '指定した日時まで会話を受信箱から保留します。',
    start:
      '会話の関連情報で再表示日時を選び、期限が来ると受信箱に戻ることを確認してください。',
  },
  merge: {
    description: '同じ相手・窓口の問い合わせを一つにまとめます。',
    start:
      '対象の会話を開き、会話の関連情報で同じ相手からの問い合わせを選んでください。',
  },
  canned: {
    description: '保存した定型文から、相手や製品名を入れた返信案を作ります。',
    start:
      '表示名と本文を登録し、会話の定型返信から選んで下書きを確認してください。',
  },
  issues: {
    description:
      '問い合わせから GitHub Issue を起票し、修正後の連絡案を作ります。',
    start:
      '対象リポジトリを登録し、会話の関連情報で公開してよい要約を入力してください。起票の前に投稿内容を確認できます。',
  },
  rules: {
    description: '受信時に件名やプロダクトに応じて担当者やラベルを決めます。',
    start:
      '下のフォームで件名の条件と付けるラベルまたは担当者を選び、保存後に条件に合うメールを受信してください。',
  },
  presence: {
    description: '同じ会話を閲覧中の運営者を表示します。',
    start:
      '2人の運営者で同じ会話を開き、会話の関連情報の閲覧者を確認してください。',
  },
  survey: {
    description: '問い合わせの完了時に、解決したか尋ねる専用リンクを送ります。',
    start:
      'helpdesk.config.ts の survey.helpdeskOrigin に公開先を設定し、テストの問い合わせを完了して返信のアンケートリンクを確認してください。',
  },
  notify: {
    description: '新着と担当者の変更を運営者に通知します。',
    start:
      'helpdesk.config.ts の notify.settings で通知先を設定し、テストメールを受信して通知を確認してください。',
  },
  'auto-ack': {
    description: '窓口で受信した問い合わせに受付のお知らせを送ります。',
    start:
      'テスト用の窓口へメールを送り、受付返信と問い合わせ番号を確認してください。',
  },
  spam: {
    description: '迷惑メールと判定した問い合わせを隔離します。',
    start: '受信箱の「迷惑メール」を開き、隔離した会話を確認してください。',
  },
}
export const publicGuides: Record<string, string> = {
  form: '公開フォームを開く',
  feedback: 'フィードバックを開く',
  chat: 'ヘルプチャットを開く',
  articles: 'ヘルプページを開く',
}
