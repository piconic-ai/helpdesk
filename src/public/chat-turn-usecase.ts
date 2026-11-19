import { z } from 'zod'
import { question } from '../extensions/chat/chat'
import { handOffQuestion } from '../extensions/chat/extension'
import {
  presentArticles,
  suggestionIds,
} from '../extensions/article-suggestions-usecase'
import type { ExtensionContext } from '../core/extensions/extension'

export async function chatTurn(
  ctx: ExtensionContext,
  product: string,
  form: FormData,
  responseTime: string | null,
) {
  const intent = z
    .enum(['ask', 'handoff', 'resolve', 'unresolved'])
    .parse(form.get('intent'))
  if (intent === 'ask') {
    const text = question.shape.question.parse(form.get('question'))
    const result = await presentArticles(ctx, {
      product,
      question: text,
      surface: 'chat',
      key: z
        .uuid()
        .optional()
        .parse(form.get('requestId') ?? undefined),
    })
    return { kind: 'articles', articles: [], ...result }
  }
  if (intent !== 'handoff') {
    const article = z.string().min(1).max(200).parse(form.get('article'))
    const turn = z.uuid().parse(form.get('turn'))
    const resolved = intent === 'resolve'
    const accepted = await ctx.reactToSuggestion({
      product,
      surface: 'chat',
      presentation: turn,
      action: resolved ? 'resolved' : 'unresolved',
      article,
    })
    if (!accepted) throw new Error('Suggestion is unavailable')
    if (resolved) await ctx.emit('resolved', null, { product, article }, turn)
    return { kind: resolved ? 'resolved' : 'unresolved' }
  }
  const data = question.parse(
    Object.fromEntries([...form].filter(([, v]) => v !== '')),
  )
  const result = await handOffQuestion(ctx, product, {
    ...data,
    suggestionIds: suggestionIds(form.get('presentations')),
  })
  return {
    kind: 'receipt',
    number: result.number,
    email: data.email,
    responseTime,
  }
}
