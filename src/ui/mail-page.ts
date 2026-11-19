import { html, raw } from 'hono/html'
// The caller passes HTML sanitized by the inbound mail reader.
export function mailDocument(body: string, nonce: string) {
  return html`<!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <title>HTML メール</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/ui/layout.css" />
      </head>
      <body class="mail-document">
        <main>${raw(body)}</main>
        <script nonce="${nonce}">
          const content = document.querySelector('main')
          const report = () =>
            parent.postMessage(
              {
                type: 'helpdesk:mail-height',
                height: Math.ceil(content.getBoundingClientRect().height),
              },
              new URL(location.href).origin,
            )
          new ResizeObserver(report).observe(content)
          window.addEventListener('load', report)
          window.addEventListener('message', (event) => {
            if (
              event.source === parent &&
              event.origin === new URL(location.href).origin &&
              event.data === 'helpdesk:measure-mail'
            )
              report()
          })
        </script>
      </body>
    </html>`
}
