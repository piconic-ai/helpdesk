import { z } from 'zod'
import type { ExtensionContext } from '../core/extensions/extension'

import { recommendation } from './chat/chat'

type Request = {
  product: string
  question: string
  surface: 'form' | 'chat' | 'ack' | 'composer'
  name?: string
  contact?: string
  number?: number
  key?: string
}

export async function presentArticles(ctx: ExtensionContext, input: Request) {
  const { product, question, name, surface } = input
  const raw = await ctx.resource('chat', 'recommend', {
    product,
    question: question.slice(0, 30000),
    name,
    mode:
      surface === 'chat' || surface === 'form' ? 'interactive' : 'background',
  })
  if (raw == null) return
  const result = recommendation.parse(raw)
  const { contact, number, key } = input
  const presentation = await ctx.presentSuggestion({
    product,
    question: question.slice(0, 100000),
    surface,
    contact,
    number,
    key,
    articles: result.articles.map(({ id, score }) => ({ id, score })),
    highestScore: result.highestScore,
  })
  return {
    presentation,
    needsHuman: result.needsHuman,
    articles: result.articles.map(({ id, title, url }) => ({
      id,
      title,
      url: url + '?suggestion=' + encodeURIComponent(presentation),
    })),
  }
}

export function suggestionIds(value: unknown) {
  return typeof value === 'string'
    ? [
        ...new Set(
          value.split(',').filter((id) => z.uuid().safeParse(id).success),
        ),
      ]
    : []
}
export async function backgroundArticles(
  ctx: ExtensionContext,
  input: Request & { surface: 'ack' | 'composer'; number: number; key: string },
  published: { id: string; title: string }[],
) {
  const { product, surface, number, key } = input
  const byKey = { product, surface, number, key }
  let saved = await ctx.previousSuggestion(byKey)
  if (!saved) {
    if (!(await presentArticles(ctx, input))) return
    saved = await ctx.previousSuggestion(byKey)
  }
  if (!saved) return
  const presentation = saved.presentation
  return {
    presentation,
    articles: saved.articles.flatMap(({ id }) => {
      const article = published.find((a) => a.id === id)
      return article
        ? [
            {
              id,
              title: article.title,
              path: `/help/articles/${encodeURIComponent(product)}/${encodeURIComponent(id)}?suggestion=${encodeURIComponent(presentation)}`,
            },
          ]
        : []
    }),
  }
}
