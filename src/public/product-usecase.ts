import { readPublicProduct, hostedProducts } from './product-store'
import { hostedPolicy } from '../core/intakes/hosted-policy-usecase'
import type { Bindings } from '../core/settings/bindings'
export const publicProduct = (env: Bindings, id: string) =>
  readPublicProduct(env.DB, id)

export async function helpDestinations(env: Bindings, origin: string) {
  const candidates = await hostedProducts(
    env.DB,
    origin,
    Object.keys(env.PUBLIC_INTAKES ?? {}),
  )
  const checks = await Promise.all(
    candidates.map((p) => hostedPolicy(env, p.id, origin)),
  )
  const products = candidates.filter((_, i) => checks[i])
  const surfaces = [
    ['articles', 'ヘルプ記事'],
    ['form', 'お問い合わせ'],
    ['chat', 'ヘルプチャット'],
    ['feedback', 'フィードバック'],
  ].filter(([id]) => env.EXTENSIONS?.active.some((e) => e.extension.id === id))
  return products
    .map((p) => ({
      name: p.name,
      links: surfaces.map(([kind, label]) => ({
        label,
        path:
          '/help/' +
          kind +
          '/' +
          encodeURIComponent(p.id) +
          (kind === 'articles' ? '/' : ''),
      })),
    }))
    .filter((p) => p.links.length)
}
