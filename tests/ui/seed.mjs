import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Miniflare, convertV4MiniflareOptions } from 'miniflare'
import { createGithub } from '../ux/github.mjs'
import { applyMigrations } from '../platform.ts'

export const fixedTime = Date.UTC(2026, 10, 18, 5)
export const operator = 'sato@example.com'
export const surveyId = 'c10343ce-b6ab-41e9-9588-18afe4ddbf27'
const customer = ['山田 花', '佐々木 葵', '森 海斗', '渡辺 葵']
const subjects = [
  '領収書の宛名を変更できますか',
  'ワークスペースの招待メールについて',
  '更新前に請求書の送付先を確認したい',
  '月額プランの明細を確認したいです',
  'チームプランの契約更新について',
  '購入手続き後に届いたメールのご確認',
  '添付した利用明細について',
  '注文履歴から再発行できました',
  '未承諾の営業案内',
  '運営画面をキーボードで使っています',
  '部門ごとに宛名の異なる領収書をまとめてダウンロードする場合の操作手順と表示内容について教えてください',
]
const bodies = [
  'お世話になっております。今月の領収書を経理に提出するため、宛名を会社名に変更して再発行したいです。\n\n注文履歴の画面から変更できますか？',
  'メンバーを追加しましたが、招待メールが届いていないようです。確認する方法を教えていただけますか。',
  '次回更新分から新しいメールアドレスで請求書を受け取りたいです。変更のタイミングを確認させてください。',
  '明細に表示されている金額の内訳を確認したいです。',
  'チームが増える予定です。次の更新時に契約内容を変更できますか？',
  '購入したプランと発行された領収書の内容を確認したく、ご連絡しました。',
  'ご確認をお願いします。対象の利用明細を添付します。',
  'ダウンロードできました。ありがとうございました。',
  '営業のお知らせです。',
  '検索結果から会話を開きやすくなりました。',
  '複数部門で同じワークスペースを利用しています。部門ごとに支払いを整理する手順について、画面に表示される情報を含めて教えてください。\n\n'.repeat(
    5,
  ),
]
const statuses = [
  'open',
  'pending',
  'open',
  'open',
  'open',
  'open',
  'open',
  'closed',
  'spam',
  'received',
  'open',
]
const json = JSON.stringify

function conversationRows(query, i, subject) {
  const statements = []
  const n = i + 1
  const when = fixedTime - n * 3600000
  const isDesk = n === 3
  statements.push(
    query(
      `INSERT INTO conversations(number,product,mailbox,contact,contact_name,subject,kind,status,closed_at,assignee,origin,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
      n,
      isDesk ? 'desk' : 'slide',
      isDesk ? 'desk@example.com' : 'support@example.com',
      'customer' + n + '@example.net',
      n === 11
        ? '株式会社サンプル経理部門 カスタマーサポート窓口担当 山田 花'
        : customer[i % customer.length],
      subject,
      n === 10 ? 'feedback' : 'inquiry',
      statuses[i],
      n === 8 ? when : null,
      [2, 3, 4].includes(n) ? operator : null,
      n === 10 ? 'form' : 'email',
      when,
    ),
  )
  statements.push(
    query(
      'INSERT INTO messages(id,number,kind,body,html,created_at,message_id) VALUES(?,?,?,?,?,?,?)',
      'in-' + n,
      n,
      'inbound',
      bodies[i],
      n === 6
        ? '<p>ご購入ありがとうございます。</p><p>ご注文番号 <strong>SL-2026-128</strong></p>'
        : null,
      when,
      '<in-' + n + '@example.net>',
    ),
  )
  statements.push(
    query(
      'INSERT INTO events(number,kind,actor,payload,at) VALUES(?,?,?,?,?)',
      n,
      'message_received',
      json({ kind: 'system' }),
      json({ message: 'in-' + n }),
      when,
    ),
  )
  return statements
}

const replyExamples = [
  [
    2,
    'sent',
    'ご連絡ありがとうございます。招待メールを再送しました。受信箱をご確認いただけますか。',
  ],
  [
    4,
    'failed',
    'お問い合わせありがとうございます。明細を確認してご案内いたします。',
  ],
  [
    5,
    'awaiting_approval',
    '更新時にメンバー数を変更できます。ご希望の人数をお知らせください。',
  ],
]
function replyRow(query, number, state, body) {
  const at = fixedTime - number * 3600000 + 60000
  return query(
    `INSERT INTO messages(id,number,kind,body,delivery,approval,actor,reason,provider_id,sent_at,created_at)
      VALUES(?,?,'outbound',?,?,?,?,?,?,?,?)`,
    'reply-' + number,
    number,
    body,
    state,
    state === 'awaiting_approval'
      ? null
      : json({ kind: 'operator', by: operator }),
    json(
      state === 'awaiting_approval'
        ? { kind: 'agent', id: '下書き担当', onBehalfOf: operator }
        : { kind: 'operator', id: operator },
    ),
    state === 'failed' ? '宛先のメールサーバーが受信を拒否しました。' : null,
    state === 'sent' ? 'receipt-2@example.com' : null,
    state === 'sent' ? at : null,
    at,
  )
}

async function seed(db, raw, extensions) {
  const query = (sql, ...values) => db.prepare(sql).bind(...values)
  const statements = [
    query('INSERT INTO operators VALUES (?,?)', operator, 'admin'),
    query('INSERT INTO operators VALUES (?,?)', 'mori@example.com', 'agent'),
    query(
      'INSERT INTO operator_profiles(email,display_name) VALUES(?,?)',
      operator,
      '佐藤 優',
    ),
    query(
      'INSERT INTO operator_profiles(email,display_name) VALUES(?,?)',
      'mori@example.com',
      '森 直子',
    ),
    query('INSERT INTO products VALUES (?,?)', 'slide', 'Slide'),
    query('INSERT INTO products VALUES (?,?)', 'desk', 'Desk'),
    query('INSERT INTO mailboxes VALUES (?,?)', 'support@example.com', 'slide'),
    query('INSERT INTO mailboxes VALUES (?,?)', 'desk@example.com', 'desk'),
    ...extensions.flatMap((id) => [
      query('INSERT INTO extension_settings VALUES (?,1,?)', id, operator),
      query(
        "INSERT INTO events(kind,actor,payload,at) VALUES('extension_configured',?,?,?)",
        json({ kind: 'operator', id: operator }),
        json({ id, enabled: true }),
        fixedTime - 14 * 86400000,
      ),
    ]),
  ]
  for (const [i, subject] of subjects.entries())
    statements.push(...conversationRows(query, i, subject))
  for (const row of replyExamples) statements.push(replyRow(query, ...row))
  statements.push(
    query(
      "INSERT INTO messages(id,number,kind,body,actor,created_at) VALUES('note-3',3,'note',?,?,?)",
      '経理チームに確認中。次回請求日の前日までに変更手続きを案内する。',
      json({ kind: 'operator', id: operator }),
      fixedTime - 2 * 3600000,
    ),
  )
  statements.push(
    query(
      'INSERT INTO attachments VALUES (?,?,?,?)',
      'attachments/ui/statement',
      'in-7',
      '利用明細.txt',
      'text/plain',
    ),
  )
  statements.push(
    query(
      "INSERT INTO messages(id,number,kind,body,actor,created_at) VALUES('note-11-a',11,'note','再発行の方法を確認中です。',?,?)",
      json({ kind: 'operator', id: operator }),
      fixedTime - 4 * 3600000,
    ),
    query(
      "INSERT INTO messages(id,number,kind,body,actor,created_at) VALUES('note-11-b',11,'note','経理窓口へ確認しました。',?,?)",
      json({ kind: 'operator', id: operator }),
      fixedTime - 3 * 3600000,
    ),
  )
  for (const label of [
    '経理',
    '長期契約の更新手続きについて',
    '社内確認',
    '再発行',
  ])
    statements.push(query('INSERT INTO labels VALUES(?,?)', 11, label))
  for (const label of ['領収書', '請求', '経理'])
    statements.push(query('INSERT INTO labels VALUES(?,?)', 1, label))
  statements.push(query('INSERT INTO labels VALUES(?,?)', 4, '請求'))
  // Two example labels hash to the same default; show a saved color choice as well.
  statements.push(
    query('INSERT INTO label_colors(name,color) VALUES(?,?)', '社内確認', 3),
  )
  await db.batch(statements)
  await raw.put(
    'attachments/ui/statement',
    '対象月　2026年11月\n合計　12,000円',
  )
}

async function extensionData(db, extensions, origin) {
  if (extensions.includes('metrics')) {
    const event = db.prepare(
      'INSERT INTO events(number,kind,actor,payload,at) VALUES(8,?,?,?,?)',
    )
    const day = 86400000
    await db.batch([
      db
        .prepare(
          'UPDATE conversations SET created_at=?,closed_at=? WHERE number=8',
        )
        .bind(fixedTime - 12 * day, fixedTime - 8 * day),
      db
        .prepare('UPDATE messages SET created_at=? WHERE number=8')
        .bind(fixedTime - 12 * day),
      db
        .prepare('UPDATE events SET at=? WHERE number=8')
        .bind(fixedTime - 12 * day),
      event.bind(
        'conversation_opened',
        json({ kind: 'system' }),
        '{}',
        fixedTime - 12 * day,
      ),
      event.bind(
        'status_changed',
        json({ kind: 'operator', id: operator }),
        json({ from: 'open', to: 'closed' }),
        fixedTime - 8 * day,
      ),
    ])
  }
  if (extensions.includes('merge'))
    await db
      .prepare(
        "UPDATE conversations SET contact='customer1@example.net', contact_name='山田 花' WHERE number=2",
      )
      .run()
  if (extensions.includes('issues'))
    await db
      .prepare('INSERT INTO issues_data VALUES(?,?)')
      .bind('repository/slide', json({ repo: 'example/helpdesk', origin }))
      .run()
  if (extensions.includes('articles')) {
    const article = {
      updatedAt: fixedTime - 86400000,
      id: 'receipt',
      product: 'slide',
      title: '領収書を発行する',
      status: 'published',
      body: '購入履歴から、支払いごとに領収書を発行できます。\n\n## 発行の手順\n\n1. 設定から「購入履歴」を開きます。\n2. 対象の支払いを選び、宛名を確認します。\n3. 「領収書をダウンロード」を選びます。\n\n発行済みの領収書も同じ手順で再取得できます。',
    }
    await db
      .prepare('INSERT INTO articles_data VALUES(?,?)')
      .bind('article/slide/receipt', json(article))
      .run()
  }
  if (extensions.includes('survey'))
    await db
      .prepare('INSERT INTO survey_data VALUES(?,?)')
      .bind(
        'token/' + surveyId,
        json({ product: 'slide', number: 8, event: 8 }),
      )
      .run()
}

export async function startScene(
  extensions = [],
  source = '.',
  {
    port = 0,
    emptyInbox = false,
    tickingClock = false,
    embedOrigin,
    secondAdmin = false,
    githubToken = true,
    demoIssues = false,
  } = {},
) {
  const simulationKey = crypto.randomUUID()
  const peerCookie = secondAdmin ? crypto.randomUUID() : undefined
  const github = createGithub(demoIssues)
  const notifications = []
  const runtime = new Miniflare(
    convertV4MiniflareOptions({
      modules: [
        {
          type: 'ESModule',
          path: 'visual.mjs',
          contents: await readFile(
            new URL('./worker.mjs', import.meta.url),
            'utf8',
          ),
        },
        {
          type: 'ESModule',
          path: 'worker.js',
          contents: await readFile(
            resolve(source, 'dist/worker/worker.js'),
            'utf8',
          ),
        },
      ],
      compatibilityDate: '2026-11-03',
      compatibilityFlags: ['nodejs_compat'],
      assets: {
        binding: 'ASSETS',
        directory: resolve(source, 'public'),
        run_worker_first: true,
        routerConfig: { has_user_worker: true },
      },
      d1Databases: ['DB'],
      r2Buckets: ['RAW'],
      email: { send_email: [{ name: 'EMAIL' }] },
      queueProducers: { JOBS: 'ui-jobs' },
      queueConsumers: { 'ui-jobs': { maxBatchSize: 10, maxBatchTimeout: 0 } },
      outboundService: async (request) => {
        if (request.url === 'https://notify.example.test/webhook') {
          notifications.push(await request.json())
          return new Response(null, { status: 204 })
        }
        return github.fetch(request)
      },
      serviceBindings: demoIssues ? { DEMO_GITHUB: github.fetch } : {},
      host: '127.0.0.1',
      port,
      bindings: {
        ENVIRONMENT: 'local',
        LOCAL_OPERATOR: operator,
        SENDING_DOMAINS: 'example.com',
        SIMULATION_KEY: simulationKey,
        ...(peerCookie && { TEST_ADMIN_COOKIE: peerCookie }),
        ...(embedOrigin && { TEST_EMBED_ORIGIN: embedOrigin }),
        ...(githubToken && { GITHUB_TOKEN: 'local-test-only' }),
        ...(extensions.includes('notify') && {
          NOTIFY_WEBHOOK_URL: 'https://notify.example.test/webhook',
        }),
        FIXED_NOW: fixedTime,
        TICKING_CLOCK: tickingClock,
      },
    }),
  )
  try {
    const { DB, RAW } = await runtime.getBindings()
    await applyMigrations(DB)
    await seed(DB, RAW, extensions)
    if (secondAdmin)
      await DB.prepare(
        "UPDATE operators SET role='admin' WHERE email='mori@example.com'",
      ).run()
    if (emptyInbox)
      await DB.prepare(
        "UPDATE conversations SET status = 'closed', closed_at = ? WHERE status = 'open'",
      )
        .bind(fixedTime)
        .run()
    const origin = (await runtime.ready).origin
    const bootstrap = await fetch(origin + '/extensions')
    if (!bootstrap.ok) throw new Error(await bootstrap.text())
    await extensionData(
      DB,
      extensions,
      demoIssues ? origin : 'https://helpdesk.example.test',
    )
    async function receive({
      subject,
      body,
      messageId,
      inReplyTo,
      authentication,
      from = 'customer@example.net',
      to = 'support@example.com',
    }) {
      const headers = [
        'From: ' + from,
        'To: ' + to,
        'Subject: =?UTF-8?B?' + Buffer.from(subject).toString('base64') + '?=',
        'Message-ID: ' + messageId,
        'Content-Type: text/plain; charset=UTF-8',
      ]
      if (authentication)
        headers.push('Authentication-Results: ' + authentication)
      if (inReplyTo) headers.push('In-Reply-To: ' + inReplyTo)
      const response = await fetch(
        origin + '/__simulation/mail?' + new URLSearchParams({ from, to }),
        {
          method: 'POST',
          headers: { 'X-Simulation-Key': simulationKey },
          body: headers.join('\r\n') + '\r\n\r\n' + body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const deadline = Date.now() + 12000
      while (Date.now() < deadline) {
        if (
          await DB.prepare('SELECT 1 FROM messages WHERE message_id=?')
            .bind(messageId)
            .first()
        )
          return
        await new Promise((resolve) => setTimeout(resolve, 60))
      }
      throw new Error('Local mail was not delivered: ' + messageId)
    }
    async function scheduled() {
      const response = await fetch(origin + '/__simulation/scheduled', {
        method: 'POST',
        headers: { 'X-Simulation-Key': simulationKey },
      })
      if (!response.ok) throw new Error(await response.text())
    }
    return {
      origin,
      db: DB,
      peerCookie,
      receive,
      github,
      notifications,
      scheduled,
      closeIssue: async () => {
        github.close()
        await scheduled()
      },
      stop: () => runtime.dispose(),
    }
  } catch (error) {
    await runtime.dispose()
    throw error
  }
}
