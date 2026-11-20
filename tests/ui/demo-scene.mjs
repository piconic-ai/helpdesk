import { startScene } from './seed.mjs'
import { seedReviewExamples } from './review-screens.mjs'
import { seedReviewIssues } from './review-issue-seed.mjs'

export async function startDemo(port = 0, { tickingClock = true } = {}) {
  const demo = await startScene(
    [
      'articles',
      'auto-ack',
      'chat',
      'form',
      'feedback',
      'survey',
      'issues',
      'canned',
      'snooze',
      'merge',
      'rules',
      'notify',
      'spam',
      'metrics',
    ],
    '.',
    { tickingClock, port, demoIssues: true },
  )
  try {
    await seedReviewExamples(demo.db, ['articles'])
    await seedReviewIssues(demo.db, true)
    await demo.db.batch([
      demo.db
        .prepare('INSERT INTO issues_data(key,value) VALUES(?,?)')
        .bind(
          'repository/desk',
          JSON.stringify({ repo: 'example/desk', origin: demo.origin }),
        ),
    ])
    return demo
  } catch (error) {
    await demo.stop()
    throw error
  }
}
