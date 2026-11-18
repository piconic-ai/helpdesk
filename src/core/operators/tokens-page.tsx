import type { z } from 'zod'
import type { tokenSummary } from './tokens'

export function tokensPage(
  tokens: z.infer<typeof tokenSummary>[],
  secret?: string,
) {
  return (
    <html lang="en">
      <head>
        <title>API tokens · Helpdesk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header>
          <a href="/">Helpdesk</a>
          <a href="/">Inbox</a>
        </header>
        <main>
          <h1>API tokens</h1>
          {secret && (
            <section>
              <p>
                Copy this token now. Set HELPDESK_TOKEN in your CLI environment
                or use it as the MCP Bearer token.
              </p>
              <code>{secret}</code>
            </section>
          )}
          <form method="post" action="/tokens">
            <label>
              Token name
              <input name="label" required maxlength={100} />
            </label>
            <label>
              Permissions
              <select name="access">
                <option value="read">Read conversations</option>
                <option value="draft">Read and draft replies</option>
                <option value="write">
                  Read, draft and manage conversations
                </option>
              </select>
            </label>
            <button>Issue token</button>
          </form>
          <ul>
            {tokens.map((t) => (
              <li>
                {t.label} · {t.access}
                <form method="post" action={'/tokens/' + t.id + '/revoke'}>
                  <button>Revoke {t.label}</button>
                </form>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  )
}
