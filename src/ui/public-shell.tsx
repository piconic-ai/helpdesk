import { ProductMark, productIconUrl } from './product-mark'
import { raw } from 'hono/html'

export function PublicShell(props: {
  product: { id?: string; name: string }
  title: string
  content: string
  chat?: boolean
  contact?: string
  search?: boolean
  turnstile?: boolean
}) {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>
          {props.title} · {props.product.name}
        </title>
        {props.product.id && (
          <link rel="icon" href={productIconUrl(props.product.id)} />
        )}
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/ui/public.css" />
        <link rel="stylesheet" href="/ui/layout.css" />
        {props.search && <script src="/ui/live-filters.js" defer />}
        {props.turnstile && (
          <script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
          />
        )}
      </head>
      <body className="public-surface">
        <header className="public-header">
          {props.product.id ? (
            <ProductMark
              product={{ id: props.product.id, name: props.product.name }}
              size="public"
            />
          ) : (
            props.product.name
          )}
        </header>
        <main className={props.chat ? 'chat-widget' : 'help-article'}>
          {raw(props.content)}
        </main>
        {props.contact && (
          <footer className="public-footer">
            解決しませんでしたか？ <a href={props.contact}>お問い合わせ</a>
          </footer>
        )}
      </body>
    </html>
  )
}
