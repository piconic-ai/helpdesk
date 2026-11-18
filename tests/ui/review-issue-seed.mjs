export const resolvedExample = {
  number: 43,
  title: '領収書の宛名を変更できるようにする',
  state: 'closed',
  closed_at: '2026-11-18T04:00:00Z',
}

export async function seedReviewIssues(db) {
  const repo = 'example/helpdesk'
  const at = Date.parse(resolvedExample.closed_at)
  const actor = JSON.stringify({ kind: 'extension', id: 'issues' })
  const approval = JSON.stringify({ kind: 'operator', by: 'sato@example.com' })
  const record = db.prepare('INSERT INTO issues_data(key,value) VALUES(?,?)')
  const event = db.prepare(
    'INSERT INTO events(number,kind,actor,payload,at) VALUES(?,?,?,?,?)',
  )
  const write = (key, value) => record.bind(key, JSON.stringify(value))
  const log = (n, kind, details, time) =>
    event.bind(n, kind, actor, JSON.stringify(details), time)
  const statements = [
    write('issue/' + repo + '/42', {
      title: 'Inquiry #1',
      state: 'open',
      closedAt: null,
    }),
    write('issue/' + repo + '/43', {
      title: resolvedExample.title,
      state: 'closed',
      closedAt: at,
    }),
  ]
  for (const [number, issue] of [
    [11, 42],
    [1, 43],
    [6, 43],
  ]) {
    statements.push(
      write('link/' + repo + '/' + issue + '/' + number, {
        repository: repo,
        issue,
        number,
      }),
      log(number, 'issues.linked', { repository: repo, issue }, at - 1000),
    )
  }
  statements.push(
    log(
      null,
      'issues.closed',
      { repository: repo, issue: 43, closedAt: at },
      at,
    ),
  )
  for (const [number, sent] of [
    [1, false],
    [6, true],
  ]) {
    const link = 'link/' + repo + '/43/' + number
    const id = 'draft/' + JSON.stringify([number, 'issues:' + link])
    statements.push(
      write('notified/' + link, at),
      db
        .prepare(
          "INSERT INTO messages(id,number,kind,body,delivery,actor,approval,provider_id,sent_at,created_at) VALUES(?,?,'outbound',?,?,?,?,?,?,?)",
        )
        .bind(
          id,
          number,
          'お知らせいただいた問題の修正が完了しました。ご報告いただき、ありがとうございます。',
          sent ? 'sent' : 'draft',
          actor,
          sent ? approval : null,
          sent ? 'simulation-receipt-6@example.test' : null,
          sent ? at + 2000 : null,
          at + 1000,
        ),
      log(
        number,
        'issues.notice_drafted',
        { repository: repo, issue: 43, message: id },
        at + 1000,
      ),
    )
    if (sent)
      statements.push(
        log(
          number,
          'reply_sent',
          { message: id, approval: JSON.parse(approval) },
          at + 2000,
        ),
      )
  }
  await db.batch(statements)
}
