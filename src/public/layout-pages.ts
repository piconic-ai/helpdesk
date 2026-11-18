import { html, raw } from 'hono/html'

type Product = { name: string; mailbox: string | null }
const policy =
  "default-src 'none'; style-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors "
export function publicPolicy(origins?: string[]) {
  if (!origins) return policy + "'none'"
  // Only exact HTTP(S) hosts may become CSP source expressions.
  const sources = origins.filter((s) =>
    /^https?:\/\/(?:[a-z0-9.-]+|\[[0-9a-f:]+\])(?::[0-9]+)?$/i.test(s),
  )
  return policy + ["'self'", ...sources].join(' ')
}
export function publicDocument(
  product: Product,
  page: { title: string; html: string },
  options: { contact?: boolean; chat?: boolean; turnstile?: boolean } = {},
) {
  return html`<!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${page.title} · ${product.name}</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/ui/public.css" />
        ${options.turnstile ? html`<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` : ''}
      </head>
      <body class="public-surface">
        <header class="public-header">${product.name}</header>
        <main class="${options.chat ? 'chat-widget' : 'help-article'}">
          ${raw(page.html)}
        </main>
        ${options.contact && product.mailbox ? html`<footer class="public-footer">解決しませんでしたか？ <a href="mailto:${product.mailbox}">お問い合わせ</a></footer>` : ''}
      </body>
    </html>`
}
