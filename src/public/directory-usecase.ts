import { acceptsHostedSubmissions, contactDestination } from './contact'
import { hostedProducts } from './product-store'
import { hostedPolicy } from '../core/intakes/hosted-policy-usecase'
import { extensionContext } from '../core/extensions/context-usecase'
import { published } from '../extensions/articles/articles-usecase'
import { publicPath, searchArticles } from '../extensions/articles/article'
import type { Bindings } from '../core/settings/bindings'
const fronts = [
  ['articles', 'ヘルプ記事', '手順やよくある質問を調べる'],
  ['form', 'お問い合わせ', '担当者からの返信を希望する方はこちら'],
  ['chat', 'ヘルプチャット', '質問に合う記事を自動で探す'],
  ['feedback', 'フィードバック', '返信不要のご意見・ご要望を送る'],
]
function directoryLinks(
  product: string,
  mailbox: string | null,
  ready: boolean,
  enabled: Set<string>,
) {
  return fronts.flatMap(([kind, label, description]) => {
    if (kind === 'form') {
      const path = contactDestination(
        product,
        mailbox,
        ready && enabled.has(kind),
      )
      return path ? [{ label, path, description }] : []
    }
    if (!enabled.has(kind) || (kind !== 'articles' && !ready)) return []
    const path =
      kind === 'articles'
        ? publicPath(product)
        : '/help/' + kind + '/' + encodeURIComponent(product)
    return [{ label, path, description }]
  })
}
export async function helpDestinations(
  env: Bindings,
  origin: string,
  query = '',
) {
  const candidates = await hostedProducts(
    env.DB,
    origin,
    Object.keys(env.PUBLIC_INTAKES ?? {}),
  )
  const checks = await Promise.all(
    candidates.map((p) => hostedPolicy(env, p.id, origin)),
  )
  const products = candidates
    .map((p, i) => ({ ...p, policy: checks[i] }))
    .filter((p) => p.policy && p.mailbox)
  const enabled = new Set(env.EXTENSIONS?.active.map((e) => e.extension.id))
  if (!fronts.some(([id]) => enabled.has(id))) return []
  const articles = env.EXTENSIONS?.active.find(
    (e) => e.extension.id === 'articles',
  )
  const ctx =
    articles &&
    query &&
    extensionContext(
      {
        env,
        operator: { email: '', role: 'agent' },
        actor: { kind: 'extension', id: 'articles' },
        now: Date.now(),
        uuid: () => crypto.randomUUID(),
      },
      articles,
    )
  const results = await Promise.all(
    products.map(async (p) => ({
      matches: ctx
        ? searchArticles(await published(ctx, p.id), query).map((a) => ({
            label: a.title,
            path: publicPath(a.product, a.id),
          }))
        : [],
      id: p.id,
      name: p.name,
      links: directoryLinks(
        p.id,
        p.mailbox,
        acceptsHostedSubmissions(p.policy),
        enabled,
      ),
    })),
  )
  return results.filter((p) => p.links.length)
}
