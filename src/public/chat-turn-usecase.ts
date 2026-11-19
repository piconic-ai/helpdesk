import { z } from 'zod'
import { articleCandidate, question } from '../extensions/chat/chat'
import {
  handOffQuestion,
  recommendArticles,
} from '../extensions/chat/extension'
import type { ExtensionContext } from '../core/extensions/extension'

export async function chatTurn(
  ctx: ExtensionContext,
  product: string,
  form: FormData,
  responseTime: string | null,
) {
  const intent = z.enum(['ask', 'handoff', 'resolve']).parse(form.get('intent'))
  if (intent === 'ask') {
    const text = question.shape.question.parse(form.get('question'))
    return {
      kind: 'articles',
      articles: await recommendArticles(ctx, product, text),
    }
  }
  if (intent === 'resolve') {
    const id = z.string().min(1).max(200).parse(form.get('article'))
    const turn = z.uuid().parse(form.get('turn'))
    const published = articleCandidate
      .array()
      .parse((await ctx.resource('articles', 'published', product)) ?? [])
    if (!published.some((a) => a.id === id))
      throw new Error('Article is unavailable')
    await ctx.emit('resolved', null, { product, article: id }, turn)
    return { kind: 'resolved' }
  }
  const data = question.parse(
    Object.fromEntries([...form].filter(([, v]) => v !== '')),
  )
  const result = await handOffQuestion(ctx, product, data)
  return {
    kind: 'receipt',
    number: result.number,
    email: data.email,
    responseTime,
  }
}
