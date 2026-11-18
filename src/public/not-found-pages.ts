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
  products: { name: string; links: { label: string; path: string }[] }[],
) =>
  publicDocument(
    { name: 'ヘルプ', mailbox: null },
    {
      title: 'ヘルプ',
      html: String(
        html`<h1>ヘルプ</h1>
          ${
            products.length
              ? products.map(
                  (p) =>
                    html`<section>
                      <h2>${p.name}</h2>
                      <ul>
                        ${p.links.map((link) => html`<li><a href="${link.path}">${link.label}</a></li>`)}
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
