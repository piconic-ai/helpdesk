import { html, raw } from 'hono/html'
// The caller passes HTML sanitized by the inbound mail reader.
export function mailDocument(body: string, nonce: string) {
  return html`<!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>HTML メール</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/ui/layout.css" />
      </head>
      <body class="mail-document">
        <main>
          <article data-ui-page="detail">
            <header class="sr-only" data-ui="heading">
              <h1>HTML メールの本文</h1>
            </header>
            ${body.includes('data-remote-image=') ? html`<p>外部の画像は非表示です。表示すると画像の提供元に接続します。 <button type="button" data-load-images>外部の画像を表示</button></p>` : ''}
            <div data-ui="body">${raw(body)}</div>
          </article>
        </main>
        <script nonce="${nonce}">
          const content = document.querySelector('main')
          document.querySelector('[data-load-images]')?.addEventListener(
            'click',
            (event) => {
              for (const image of content.querySelectorAll(
                'img[data-remote-image]',
              )) {
                image.referrerPolicy = 'no-referrer'
                image.src = image.dataset.remoteImage
              }
              event.currentTarget.parentElement.hidden = true
            },
            { once: true },
          )
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
