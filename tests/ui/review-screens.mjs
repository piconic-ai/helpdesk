import { seedReviewIssues } from './review-issue-seed.mjs'

export const reviewScreens = [
  {
    id: 'issues-board',
    label: '課題と修正の前後',
    url: '/issues',
    extensions: ['issues'],
    heading: '課題',
  },
  {
    id: 'voices',
    label: 'ラベル・プロダクト・期間別の声',
    url: '/voices',
    extensions: ['metrics'],
    heading: '声の集計',
  },
  {
    id: 'voices-filtered',
    label: 'Slide に届いた声',
    url: '/voices/conversations?product=slide',
    extensions: ['metrics'],
  },
  {
    id: 'article-candidates',
    label: '記事の候補',
    url: '/articles/candidates',
    extensions: ['articles'],
  },
  {
    id: 'candidate-editor',
    label: '元の会話を見ながら記事を編集',
    url: '/articles/new?candidate=1',
    extensions: ['articles'],
  },
  {
    id: 'approval-confirm',
    label: '承認する宛先と本文',
    url: '/conversation/5',
    action: 'approve-dialog',
  },
  {
    id: 'thread-context',
    label: '会話の関連情報パネル',
    url: '/conversation/1',
    extensions: ['issues', 'canned', 'articles', 'snooze'],
    action: 'context',
  },
  {
    id: 'issue-setup',
    label: '起票先の設定案内',
    url: '/conversation/3',
    extensions: ['issues'],
    action: 'context',
  },
].map((scene) => ({ ...scene, group: '指針のレビュー' }))

export async function seedReviewExamples(db, extensions) {
  const candidate = {
    number: 1,
    topic: '領収書の宛名を変更するには',
    product: 'slide',
  }
  if (extensions.includes('articles'))
    await db
      .prepare('INSERT INTO articles_data(key,value) VALUES(?,?)')
      .bind('candidate/1', JSON.stringify(candidate))
      .run()
  if (extensions.includes('issues')) await seedReviewIssues(db)
}
