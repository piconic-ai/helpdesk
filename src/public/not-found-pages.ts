import { html } from 'hono/html'
import { publicDocument } from './layout-pages'

export function missingPublicPage(
  product: { name: string; mailbox: string | null },
  back: string,
) {
  return publicDocument(product, {
    title: 'ページが見つかりません',
    html: String(
      html`<h1>ページが見つかりません</h1>
        <p>アドレスを確認するか、ヘルプからお探しください。</p>
        <a href="${back}">ヘルプに戻る</a>`,
    ),
  })
}
export const helpLanding = (
  products: {
    name: string
    links: { label: string; path: string }[]
    matches: { label: string; path: string }[]
  }[],
  query: string,
) =>
  publicDocument(
    { name: 'ヘルプ', mailbox: null },
    {
      title: 'ヘルプ',
      html: String(
        html`<h1>ヘルプ</h1>
          ${
            products.some((p) =>
              p.links.some((link) => link.path.startsWith('/help/articles/')),
            )
              ? html`<form method="get" class="article-search">
                  <label
                    >すべてのヘルプ記事を検索<input
                      type="search"
                      name="q"
                      value="${query}"
                      maxlength="200" /></label
                  ><button>検索</button>
                </form>`
              : ''
          }
          ${query && !products.some((p) => p.matches.length) ? html`<p class="empty-state">該当する記事はありません。</p>` : ''}
          ${
            products.length
              ? products.map(
                  (p) =>
                    html`<section>
                      <h2>${p.name}</h2>
                      <ul>
                        ${[...p.matches, ...p.links].map((link) => html`<li><a href="${link.path}">${link.label}</a></li>`)}
                      </ul>
                    </section>`,
                )
              : html`<p>
                  ご利用のプロダクトの「お問い合わせ」または「ヘルプ」を開いてください。
                </p>`
          }`,
      ),
    },
  )
