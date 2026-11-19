export const resolvedExample = {
  number: 43,
  title: '領収書の宛名を変更できるようにする',
  state: 'closed',
  closed_at: '2026-11-18T04:00:00Z',
}

export const finishedExample = {
  number: 44,
  title: '請求明細のダウンロードを改善する',
  state: 'closed',
  closed_at: '2026-11-11T05:00:00Z',
}

export async function seedReviewIssues(db, demo = false) {
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
  const links = demo
    ? [
        [4, 42],
        [7, 42],
        [11, 42],
        [2, 43],
        [5, 43],
        [8, 44],
        [4, 44],
      ]
    : [
        [11, 42],
        [1, 43],
        [6, 43],
      ]
  if (demo) {
    const closedAt = Date.parse(finishedExample.closed_at)
    statements.push(
      write('issue/' + repo + '/44', {
        title: finishedExample.title,
        state: 'closed',
        closedAt,
      }),
      log(
        null,
        'issues.closed',
        { repository: repo, issue: 44, closedAt },
        closedAt,
      ),
    )
  }
  for (const [number, issue] of links) {
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
  const notices = demo
    ? [
        [2, 43, false],
        [5, 43, true],
        [8, 44, true],
        [4, 44, true],
      ]
    : [
        [1, 43, false],
        [6, 43, true],
      ]
  for (const [number, issue, sent] of notices) {
    addNotice(number, issue, sent)
  }
  await db.batch(statements)

  function addNotice(number, issue, sent) {
    const closedAt = issue === 44 ? Date.parse(finishedExample.closed_at) : at
    const link = 'link/' + repo + '/' + issue + '/' + number
    const id = 'draft/' + JSON.stringify([number, 'issues:' + link])
    statements.push(
      write('notified/' + link, closedAt),
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
          sent ? 'simulation-receipt-' + number + '@example.test' : null,
          sent ? at + 2000 : null,
          at + 1000,
        ),
      log(
        number,
        'issues.notice_drafted',
        { repository: repo, issue, message: id },
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
}
