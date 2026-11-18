import { BfScripts } from '@barefootjs/hono/scripts'
import { ReplyComposer } from '@/components/ReplyComposer'
import type { coreOperations } from '../operations/catalog-usecase'
import type { Child } from 'hono/jsx'
type Result<K extends keyof typeof coreOperations> = Awaited<
  ReturnType<(typeof coreOperations)[K]['execute']>
>
export function shell(title: string, content: Child) {
  return (
    <html lang="en">
      <head>
        <title>{title} · Helpdesk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/uno.css" />
      </head>
      <body>
        <header>
          <a href="/">Helpdesk</a>
          <nav>
            <a href="/">Inbox</a>
            <a href="/settings">Settings</a>{' '}
            <a href="/extensions">Extensions</a>{' '}
            <a href="/tokens">API tokens</a>
          </nav>
        </header>
        <main>{content}</main>
        <BfScripts />
      </body>
    </html>
  )
}
function field(name: string, title: string, value = '', type = 'text') {
  return (
    <label>
      {title}
      <input type={type} name={name} value={value} />
    </label>
  )
}
function select(name: string, items: string[], value: string) {
  return (
    <label>
      {name}
      <select name={name}>
        {items.map((item) => (
          <option value={item} selected={value === item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  )
}
function action(name: string, label: string, children: Child, number?: number) {
  return (
    <form action={'/actions/' + name} method="post">
      {number && <input type="hidden" name="number" value={number} />}
      {children}
      <button>{label}</button>
    </form>
  )
}
export function inboxPage(
  rows: Result<'list'>,
  failures: Result<'failures'>,
  q: Record<string, string>,
  panels?: Child,
) {
  return shell(
    'Inbox',
    <>
      <h1>Inbox</h1>
      {panels}
      <form method="get" className="filters">
        {field('query', 'Search', q.query)}
        {select(
          'status',
          ['open', 'pending', 'closed', 'spam', 'received', 'reviewed', 'all'],
          q.status ?? 'open',
        )}
        {field('product', 'Product', q.product)}
        {field('assignee', 'Assignee', q.assignee)}
        {field('label', 'Label', q.label)}
        <button>Filter</button>
      </form>
      <ul className="conversations">
        {rows.map((r) => (
          <li>
            <a href={'/conversation/' + r.number}>
              <strong>
                #{r.number} {r.subject}
              </strong>
              <small>
                {r.contact} · {r.product} · {r.status.kind}
              </small>
            </a>
          </li>
        ))}
      </ul>
      {!rows.length && <p>No matching conversations.</p>}
      {failures.length > 0 && (
        <section>
          <h2>Inbound failures</h2>
          {failures.map((f) => (
            <p>
              {f.mailbox} · {f.reason}
            </p>
          ))}
        </section>
      )}
    </>,
  )
}
function messages(data: Result<'get'>) {
  return data.messages.map((m) => (
    <article>
      <h3>
        {m.kind === 'inbound'
          ? data.conversation.contact
          : m.kind === 'note'
            ? 'Internal note'
            : 'Reply'}
      </h3>
      <p className="body">{m.body}</p>
      {m.html && (
        <iframe sandbox="" title="HTML message" src={'/mail/' + m.id} />
      )}
      {m.delivery && (
        <small>
          {m.delivery} {m.reason}
        </small>
      )}
      {m.delivery === 'failed' &&
        !data.uncertain.includes(m.id) &&
        action(
          'retry',
          'Retry reply',
          <input type="hidden" name="id" value={m.id} />,
          m.number,
        )}
      {(m.delivery === 'awaiting_approval' || m.delivery === 'draft') &&
        action(
          'approve',
          'Approve and send',
          <input type="hidden" name="id" value={m.id} />,
          m.number,
        )}
    </article>
  ))
}
export function conversationPage(data: Result<'get'>, panels?: Child) {
  const c = data.conversation
  return shell(
    c.subject,
    <>
      <p>
        <a href="/">Inbox</a> / #{c.number}
      </p>
      <h1>{c.subject}</h1>
      <p>
        {c.product} · {c.mailbox} · {c.status.kind}
      </p>
      {messages(data)}
      {panels}
      {data.attachments.map((a) => (
        <p>
          <a
            href={'/attachment?key=' + encodeURIComponent(a.key)}
            download={a.filename}
          >
            {a.filename}
          </a>
        </p>
      ))}
      {c.kind === 'inquiry' && ['open', 'pending'].includes(c.status.kind) && (
        <ReplyComposer
          number={c.number}
          mailbox={c.mailbox}
          contact={c.contact}
        />
      )}
      <section>
        <h2>Manage conversation</h2>
        {action(
          'note',
          'Add internal note',
          <label>
            Internal note
            <textarea name="body" required />
          </label>,
          c.number,
        )}
        {c.kind === 'inquiry' &&
          action(
            'status',
            'Update status',
            select(
              'event',
              ['closed', 'reopened', 'marked_spam', 'unmarked_spam'],
              'closed',
            ),
            c.number,
          )}
        {c.kind === 'inquiry' &&
          action(
            'assign',
            'Save assignee',
            field(
              'email',
              'Assignee',
              c.assignment.kind === 'assigned' ? c.assignment.to : '',
              'email',
            ),
            c.number,
          )}
        <p>{data.labels.map((l) => l.name).join(', ')}</p>
        {action(
          'label',
          'Save label',
          <>
            {field('label', 'Label')}
            {select('action', ['add', 'remove'], 'add')}
          </>,
          c.number,
        )}
      </section>
      <section>
        <h2>Other conversations from {c.contact}</h2>
        {data.history.map((r) => (
          <p>
            <a href={'/conversation/' + r.number}>
              #{r.number} {r.subject}
            </a>
          </p>
        ))}
      </section>
      <details>
        <summary>Activity</summary>
        {data.events.map((e) => (
          <p>
            {new Date(e.at).toISOString()} · {e.kind} · {e.actor}
          </p>
        ))}
      </details>
    </>,
  )
}
export function settingsPage(data: Result<'settings'>, panels?: Child) {
  return shell(
    'Settings',
    <>
      <h1>Settings</h1>
      {panels}
      <section>
        <h2>Mailboxes</h2>
        {data.mailboxes.map((m) => (
          <p>
            {m.name} · {m.address}
          </p>
        ))}
        {action(
          'mailbox',
          'Register mailbox',
          <>
            {field('product', 'Product ID')}
            {field('name', 'Product name')}
            {field('address', 'Mailbox address', '', 'email')}
            <small>
              Registering a mailbox authorizes the sending policies currently
              enabled in Extensions.
            </small>
          </>,
        )}
      </section>
      <section>
        <h2>Operators</h2>
        {data.operators.map((o) =>
          action(
            'role',
            'Update role',
            <>
              <input type="hidden" name="email" value={o.email} />
              {o.email}
              {select('role', ['admin', 'agent'], o.role)}
            </>,
          ),
        )}
      </section>
      <section>
        <h2>Retention</h2>
        {action(
          'retention',
          'Save retention',
          field(
            'days',
            'Days after closure (0 keeps content)',
            String(data.retentionDays),
            'number',
          ),
        )}
        {action(
          'forget',
          'Delete contact and all conversations',
          field('contact', 'Contact to delete', '', 'email'),
        )}
      </section>
    </>,
  )
}
