import { html, raw } from 'hono/html'
import { marked } from 'marked'
import sanitize from 'sanitize-html'
import { publicPath, type Article } from './article'
export function articleIndex(product: string, articles: Article[], q: string) {
  const query = q.toLocaleLowerCase()
  const results = articles.filter((a) =>
    (a.title + ' ' + a.body).toLocaleLowerCase().includes(query),
  )
  return {
    title: product + ' Help',
    html: String(
      html`<h1>${product} Help</h1>
        <form method="get">
          <label>Search articles <input name="q" value="${q}" /></label
          ><button>Search</button>
        </form>
        <ul>
          ${results.map((a) => html`<li><a href="${publicPath(product, a.id)}">${a.title}</a></li>`)}
        </ul>
        ${!results.length ? 'No matching articles.' : ''}`,
    ),
  }
}
export function articleDetail(a: Article, token: string) {
  const content = sanitize(marked.parse(a.body, { async: false }), {
    allowedTags: [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'strong',
      'em',
      'a',
      'hr',
      'br',
      'table',
      'tr',
      'thead',
      'tbody',
      'th',
      'td',
    ],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
  return {
    title: a.title,
    html: String(
      html`<a href="${publicPath(a.product)}">All help articles</a>
        <h1>${a.title}</h1>
        <article>${raw(content)}</article>
        <form method="post" action="${publicPath(a.product, a.id)}">
          <input type="hidden" name="visit" value="${token}" />
          <fieldset>
            <legend>Was this article helpful?</legend>
            <button name="helpful" value="yes">Yes</button
            ><button name="helpful" value="no">No</button>
          </fieldset>
        </form>`,
    ),
  }
}
