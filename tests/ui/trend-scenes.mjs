import { fixedTime, operator } from './seed.mjs'

export const trendScenes = [
  {
    id: 'metrics-trends',
    label: '7日ごとの解決時間と未計測の期間',
    url: '/metrics?period=7',
    heading: '対応状況の集計',
  },
  {
    id: 'voices-trends',
    label: 'ラベル・プロジェクト・月ごとの受付推移',
    url: '/voices?start=2026-10-01&end=2026-11-18',
    heading: '声の集計',
  },
].map((scene) => ({
  ...scene,
  group: '期間ごとの推移',
  extensions: ['feedback', 'metrics'],
}))

export async function seedTrendExamples(db) {
  // Each tuple is an inquiry with an actual intake, work interval and closure.
  const samples = [
    [46, 'slide', '領収書', 45],
    [44, 'desk', '請求', 60],
    [39, 'slide', '領収書', 95],
    [37, 'slide', '経理', 25],
    [36, 'desk', '請求', 65],
    [25, 'slide', '経理', 75],
    [23, 'desk', '請求', 55],
    [19, 'slide', '請求', 40],
    [17, 'desk', '経理', 30],
    [16, 'slide', '領収書', 35],
    [12, 'slide', '領収書', 20],
    [11, 'slide', '経理', 28],
    [10, 'desk', '経理', 22],
    [5, 'slide', '領収書', 30],
    [4, 'slide', '請求', 55],
    [3, 'desk', '請求', 75],
    [2, 'slide', '領収書', 50],
  ]
  const insert =
    db.prepare(`INSERT INTO conversations(number,product,mailbox,contact,subject,status,created_at,closed_at)
    VALUES(?,?,?,?,?,'closed',?,?)`)
  const tag = db.prepare('INSERT INTO labels(number,name) VALUES(?,?)')
  const event = db.prepare(
    'INSERT INTO events(number,kind,actor,payload,at) VALUES(?,?,?,?,?)',
  )
  const human = JSON.stringify({ kind: 'operator', id: operator })
  const statements = []
  samples.forEach(([days, product, label, minutes], i) => {
    const number = 100 + i,
      start = fixedTime - days * 86400000,
      end = start + minutes * 60000
    statements.push(
      insert.bind(
        number,
        product,
        product === 'slide' ? 'support@example.com' : 'desk@example.com',
        'billing' + number + '@example.net',
        label + 'についての問い合わせ',
        start,
        end,
      ),
      tag.bind(number, label),
      event.bind(
        number,
        'conversation_opened',
        '{"kind":"system"}',
        '{}',
        start,
      ),
      event.bind(
        number,
        'conversation_viewed',
        human,
        '{}',
        start + (minutes - 8 - (i % 6)) * 60000,
      ),
      event.bind(number, 'reply_queued', human, '{}', end - 60000),
      event.bind(
        number,
        'reply_sent',
        human,
        JSON.stringify({ approval: { kind: 'operator' } }),
        end - 30000,
      ),
      event.bind(
        number,
        'status_changed',
        human,
        JSON.stringify({ from: 'open', to: 'closed' }),
        end,
      ),
    )
    if (i % 3 === 1)
      statements.push(
        event.bind(
          number,
          'survey.answered',
          '{"kind":"system"}',
          '{"resolved":false}',
          end + 60000,
        ),
      )
  })
  await db.batch(statements)
}
