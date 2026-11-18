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
    title: 'ヘルプ記事',
    html: String(
      html`<h1>ヘルプ記事</h1>
        <form method="get" class="article-search">
          <label>記事を検索<input type="search" name="q" value="${q}" /></label
          ><button class="button-secondary">検索</button>
        </form>
        ${
          results.length
            ? html`<ul class="article-list">
                ${results.map((a) => html`<li><a href="${publicPath(product, a.id)}">${a.title}</a></li>`)}
              </ul>`
            : html`<p class="empty-state">該当する記事はありません。</p>`
        }`,
    ),
  }
}
export function articleMarkup(body: string) {
  return sanitize(marked.parse(body, { async: false }), {
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
    transformTags: { h1: 'h2' },
  })
}
export function articleDetail(a: Article, token: string) {
  const content = articleMarkup(a.body)
  return {
    title: a.title,
    html: String(
      html`<nav class="article-back" aria-label="記事ナビゲーション">
          <a href="${publicPath(a.product)}">ヘルプ記事一覧</a>
        </nav>
        <h1>${a.title}</h1>
        <article>${raw(content)}</article>
        <form
          method="post"
          action="${publicPath(a.product, a.id)}"
          class="article-vote"
        >
          <input type="hidden" name="visit" value="${token}" />
          <fieldset>
            <legend>この記事は役に立ちましたか？</legend>
            <div class="public-actions">
              <button class="button-secondary" name="helpful" value="yes">
                はい</button
              ><button class="button-secondary" name="helpful" value="no">
                いいえ
              </button>
            </div>
          </fieldset>
        </form>`,
    ),
  }
}
