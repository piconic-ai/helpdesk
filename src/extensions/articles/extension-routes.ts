import { z } from 'zod'
import { acknowledgmentLinks } from './acknowledgment-usecase'
import { replyArticleChoices } from './reply-suggestions-usecase'
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
import {
  articleDetail,
  articleIndex,
  articleVoteReceipt,
  retryArticleVote,
} from './articles-pages'
export const articles: Extension = {
  id: 'articles',
  icon: 'articles',
  permissions: ['read_body'],
  config,
  replyLinks: replyArticleChoices,
  resources: [
    { name: 'acknowledgmentLinks', run: acknowledgmentLinks },
    { name: 'published', run: published },
    {
      name: 'candidates',
      async run(ctx, input) {
        const { product, question } = z
          .object({ product: z.string().min(1), question: z.string().min(1) })
          .parse(input)
        return ctx.articleCandidates(product, question)
      },
    },
  ],
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
        query.get('page') ?? undefined,
      )
    if (!slug.safeParse(id).success) return null
    const data = article.safeParse(await ctx.get(articleKey(product, id)))
    if (!data.success || data.data.status !== 'published') return null
    const claim = z.uuid().safeParse(query.get('suggestion'))
    const presentation =
      claim.success &&
      (await ctx.reactToSuggestion({
        product,
        presentation: claim.data,
        article: id,
        action: 'opened',
      }))
        ? claim.data
        : undefined
    return articleDetail(
      data.data,
      await startVisit(ctx, product, id, presentation),
      presentation,
    )
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
      const suggestion = z.uuid().safeParse(form.get('suggestion')).data
      return retryArticleVote(
        data.data,
        await startVisit(ctx, product, id, suggestion),
        helpful.data,
        suggestion,
      )
    }
    return articleVoteReceipt(data.data, helpful.data === 'yes')
  },
}
