import { html } from 'hono/html'
import { ActionLink, Button, Field, Textarea } from './controls'
import { EditPage } from './patterns'
import { Challenge } from './public-forms'
import { ProductMark, productIconUrl } from './product-mark'
import { chatCopy } from './chat-copy'

type Options = {
  product: { id: string; name: string }
  parent: string
  lang: 'ja' | 'en'
  introduction: string
  publicKey: string
  siteKey?: string
  articles: boolean
  feedback: boolean
  contact?: string
}
export function chatDocument(options: Options) {
  const { product, parent, lang } = options
  const copy = chatCopy[lang]
  const base = encodeURIComponent(product.id)
  return html`<!doctype html>${(
      <html lang={lang}>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          {parent && <meta name="referrer" content="no-referrer" />}
          <title>
            {product.name}
            {copy.help}
          </title>
          <link rel="icon" href={productIconUrl(product.id)} />
          <link rel="stylesheet" href="/styles.css" />
          <link rel="stylesheet" href="/ui/layout.css" />
          <link rel="stylesheet" href="/ui/public-chat.css" />
          <script type="module" src="/ui/public-chat.js"></script>
          {options.siteKey && (
            <script
              defer
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            ></script>
          )}
        </head>
        <body
          className={
            'public-surface customer-chat' + (parent ? ' chat-embedded' : '')
          }
          data-chat-parent={parent}
          data-chat-copy={JSON.stringify(copy)}
        >
          <div className="chat-window">
            <main>
              <EditPage
                title={
                  <span className="public-header">
                    <ProductMark product={product} size="public" />
                    {copy.help}
                  </span>
                }
              >
                <div id="chat-history">
                  {options.introduction && <p>{options.introduction}</p>}
                  <p>{copy.intro}</p>
                  <div
                    id="chat-turns"
                    aria-label={copy.conversation}
                    role="region"
                  ></div>
                </div>
                <section
                  id="chat-reading"
                  hidden
                  aria-labelledby="chat-article-title"
                >
                  <Button type="button" id="chat-back" variant="ghost">
                    {copy.back}
                  </Button>
                  <h2 id="chat-article-title" tabindex={-1}></h2>
                  <article></article>
                  <ActionLink
                    id="chat-external"
                    variant="ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.external}
                  </ActionLink>
                </section>
                <form method="post" id="chat-ask">
                  <input
                    type="hidden"
                    name="publicKey"
                    value={options.publicKey}
                  />
                  <Field label={copy.question}>
                    <Textarea
                      name="question"
                      rows={2}
                      maxlength={30000}
                      required
                    />
                  </Field>
                  <Button variant="default" type="submit">
                    {copy.ask}
                  </Button>
                </form>
                <div id="chat-verification">
                  <Challenge siteKey={options.siteKey} />
                </div>
                <div role="alert" id="chat-error" data-toast="" hidden>
                  <span></span>
                  <Button type="button" variant="ghost">
                    {lang === 'en' ? 'Close' : '閉じる'}
                  </Button>
                </div>
              </EditPage>
            </main>
            <footer>
              {options.articles && (
                <a
                  href={'/help/articles/' + base + '/'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.directory}
                </a>
              )}
              {options.feedback && (
                <a
                  href={'/help/feedback/' + base}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.feedback}
                </a>
              )}
              {options.contact && (
                <a
                  href={options.contact}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {options.contact.startsWith('mailto:')
                    ? copy.mail
                    : copy.form}
                </a>
              )}
            </footer>
          </div>
        </body>
      </html>
    )}`
}
