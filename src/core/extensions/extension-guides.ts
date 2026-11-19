import type { Permission } from './extension'
const permissionLabels: Record<Permission, string> = {
  read_body: '問い合わせ本文の閲覧',
  send: 'メール送信',
  external_fetch: '外部サービスへの接続',
}
export function permissionText(permissions: Permission[]) {
  return (
    permissions.map((p) => permissionLabels[p]).join('、') ||
    '追加の権限はありません'
  )
}

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
      '公開フォームから感想を送り、フィードバックの受信箱で受付を確認してください。',
  },
  chat: {
    description:
      '質問に合う記事を探し、該当記事がない場合は担当者に引き継ぎます。',
    start:
      '埋め込み先のサイトを登録し、そのページの HTML に埋め込みコードを貼り付けてください。関連記事の案内には、公開したヘルプ記事と Workers AI の AI バインディングを使用します。',
  },
  metrics: {
    description: '期間とプロダクトごとの対応件数や解決時間を表示します。',
    start:
      '集計画面でプロダクトと期間を選び、問い合わせを完了した前後の指標を確認してください。',
  },
  export: {
    description: '会話、メッセージ、操作履歴を JSON Lines で書き出します。',
    start:
      '全期間・全プロダクトの会話・メッセージ・操作履歴を書き出します。伏せる設定では、本文中も含めて、メールアドレスと登録された相手の名前を置き換えます。住所など、その他の自由記述は残ります。',
  },
  snooze: {
    description: '指定した日時まで会話を受信箱から保留します。',
    start:
      '会話の「その他の操作」からスヌーズを選び、日本時間で再表示日時を設定します。期限に受信箱へ戻ります。期限前は同じ会話の「保留を解除」で戻せます。',
  },
  merge: {
    description: '同じ相手・窓口の問い合わせを一つにまとめます。',
    start:
      'まとめたい会話を開き、「関連情報」で同じ相手・同じ窓口の統合先を選びます。今開いている会話のメッセージが選んだ会話にまとまります。',
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
      '会話を開くと、ほかに対応している担当者の名前と「閲覧中」「入力中」が返信欄に表示されます。「関連情報」では同じ会話を開いている人数を確認できます。自分だけのときは、ほかに閲覧中の担当者はいないと表示されます。',
  },
  survey: {
    description: '問い合わせの完了時に、解決したか尋ねる専用リンクを送ります。',
    start:
      'helpdesk.config.ts の survey.helpdeskOrigin に公開先を設定し、テストの問い合わせを完了して返信のアンケートリンクを確認してください。',
  },
  notify: {
    description: '新着と担当者の変更を運営者に通知します。',
    start:
      'メール通知先は helpdesk.config.ts の extensions 配列で、notify の settings.email に指定します。Slack・Discord には Worker のシークレット NOTIFY_WEBHOOK_URL に通知先の Webhook を設定します。Slack は既定の形式です。Discord には同じ notify の settings.format に「discord」を指定してください。窓口にテストメールを送って、指定先で通知を確認してください。',
  },
  'auto-ack': {
    description:
      '初めて届いた問い合わせメールの差出人に受付のお知らせを自動送信します。設定から送信文面を確認・編集できます。',
    start:
      'テスト用の窓口へメールを送り、受付返信と問い合わせ番号を確認してください。',
  },
  spam: {
    description: '迷惑メールと判定した問い合わせを隔離します。',
    start:
      '隔離された会話を開いて内容を確認します。誤って隔離された場合は会話の操作から迷惑メールを解除できます。',
  },
}
export const publicGuides: Record<string, string> = {
  form: '公開フォームを開く',
  feedback: 'フィードバックを開く',
  chat: 'ヘルプチャットを開く',
  articles: 'ヘルプページを開く',
}
