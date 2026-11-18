import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { config, article, articleKey, slug, publicPath } from './article'
import {
  edit,
  attach,
  candidate,
  published,
  saveArticle,
  attachArticle,
  suggestArticle,
  settingsContent,
  startVisit,
  recordVote,
  expireVisits,
} from './articles-usecase'
import { articleDetail, articleIndex, retryArticleVote } from './articles-pages'
export const articles: Extension = {
  id: 'articles',
  permissions: [],
  config,
  async replyLinks(ctx, product) {
    return (await published(ctx, product)).map((a) => ({
      title: a.title,
      path: publicPath(product, a.id),
    }))
  },
  resources: [{ name: 'published', run: published }],
  operations: [
    {
      name: 'read',
      description: 'Open article source',
      permission: 'read',
      input: article.pick({ product: true, id: true }),
      output: article,
      async run(ctx, input) {
        const { id, product } = article
          .pick({ product: true, id: true })
          .parse(input)
        return article.parse(await ctx.get(articleKey(product, id)))
      },
    },
    {
      name: 'save',
      description: 'Save article',
      permission: 'write',
      input: edit,
      output: article.pick({ id: true, status: true }),
      run: saveArticle,
    },
    {
      name: 'attach',
      description: 'Add article to reply draft',
      permission: 'draft',
      input: attach,
      output: z.object({ id: z.string() }),
      run: attachArticle,
    },
    {
      name: 'suggest',
      description: 'Record article candidate',
      permission: 'write',
      input: candidate,
      output: candidate,
      run: suggestArticle,
    },
  ],
  panels: [
    {
      title: 'Help articles',
      slot: 'settings',
      operations: ['read', 'save'],
      content: settingsContent,
      choices: async () => ({ status: ['draft', 'published'] }),
    },
    {
      title: 'Help articles',
      slot: 'conversation',
      operations: ['attach', 'suggest'],
    },
  ],
  subscribers: [{ kind: 'scheduled', run: expireVisits }],
  async publicPage(ctx, product, path, query) {
    const id = path.replace(/^\/+|\/+$/g, '')
    if (!id)
      return articleIndex(
        product,
        await published(ctx, product),
        query.get('q') ?? '',
      )
    if (!slug.safeParse(id).success) return null
    const data = article.safeParse(await ctx.get(articleKey(product, id)))
    if (!data.success || data.data.status !== 'published') return null
    return articleDetail(data.data, await startVisit(ctx, product, id))
  },
  async publicAction(ctx, product, path, req) {
    const id = path.replace(/^\/+|\/+$/g, '')
    if (!slug.safeParse(id).success) return null
    const data = article.safeParse(await ctx.get(articleKey(product, id)))
    if (!data.success || data.data.status !== 'published') return null
    const form = await req.formData()
    const helpful = z.enum(['yes', 'no']).safeParse(form.get('helpful'))
    if (!helpful.success || !z.uuid().safeParse(form.get('visit')).success)
      return null
    if (!(await recordVote(ctx, product, id, form))) {
      return retryArticleVote(
        data.data,
        await startVisit(ctx, product, id),
        helpful.data,
      )
    }
    return {
      title: 'ご回答ありがとうございます',
      html:
        '<h1>ご回答ありがとうございます</h1><p class="banner-success" role="status">記事への評価を受け付けました。</p>' +
        (form.get('helpful') === 'no'
          ? '<p>記事で解決できなかった内容を、担当者にご相談いただけます。</p>'
          : ''),
    }
  },
}
