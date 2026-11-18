import { html, raw } from 'hono/html'
// The caller passes HTML sanitized by the inbound mail reader.
export function mailDocument(body: string) {
  return html`<!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <title>HTML メール</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="mail-document">
        <main>${raw(body)}</main>
      </body>
    </html>`
}
