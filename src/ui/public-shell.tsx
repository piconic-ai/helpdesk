import { ProductMark, productIconUrl } from './product-mark'
import { raw } from 'hono/html'

export function PublicShell(props: {
  product: { id?: string; name: string }
  title: string
  content: string
  chat?: boolean
  contact?: string
  article?: boolean
  search?: boolean
  turnstile?: boolean
}) {
  const routed = props.search || props.article
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
        {routed && (
          <>
            <script src="/ui/page-lifecycle.js"></script>
            <script src="/ui/live-filters.js" defer></script>
            <script type="module" src="/components/navigation.js"></script>
          </>
        )}
        {props.turnstile && (
          <script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
          />
        )}
      </head>
      <body
        className="public-surface"
        data-router-shell={routed ? (props.product.id ?? '') : undefined}
      >
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
        <main
          bf-region={routed ? 'content' : undefined}
          className={props.chat ? 'chat-widget' : 'help-article'}
        >
          {raw(props.content)}
        </main>
        {props.contact && (
          <footer
            bf-region={routed ? 'footer' : undefined}
            className="public-footer"
          >
            {props.article && <span>解決しませんでしたか？ </span>}
            <a href={props.contact}>
              {props.contact.startsWith('mailto:')
                ? 'メールでお問い合わせ'
                : 'お問い合わせ'}
            </a>
          </footer>
        )}
      </body>
    </html>
  )
}
