import { startScene } from './seed.mjs'
import { seedReviewExamples } from './review-screens.mjs'

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
  { port: Number(process.env.HELPDESK_DEMO_PORT ?? 8788) },
)
await seedReviewExamples(demo.db, ['issues', 'articles'])
await demo.db.batch([
  demo.db
    .prepare('INSERT INTO operator_profiles(email,display_name) VALUES(?,?)')
    .bind('sato@example.com', '佐藤 優'),
  demo.db
    .prepare('INSERT INTO operator_profiles(email,display_name) VALUES(?,?)')
    .bind('mori@example.com', '森 直子'),
])
console.log('Helpdesk local demo: ' + demo.origin)
console.log('Sample data is reset when this process stops.')
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => demo.stop())
