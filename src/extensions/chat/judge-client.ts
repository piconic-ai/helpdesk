import { z } from 'zod'
import type {
  CandidateSummary,
  Judgment,
  JudgmentModel,
} from '../../core/extensions/article-judgment'

const answer = z.object({
  type: z.literal('noul'),
  noul: z.number().min(0).max(1),
})
const response = z.object({ answers: z.record(z.string(), answer) })
const bytes = new TextEncoder()

function privateText(text: string, name: string) {
  let clean = text.replace(
    /(?<![\p{L}\d._%+-])[\p{L}\d._%+-]+@[\p{L}\d.-]+\.[\p{L}]{2,}/gu,
    '[contact]',
  )
  for (const part of [name, ...name.split(/\s+/u)].filter(Boolean)) {
    const literal = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    clean = clean.replace(new RegExp(literal, 'giu'), '[contact]')
  }
  return clean
    .replace(
      /(?:私の名前は|氏名[：:]\s*|名前[：:]\s*|my name is\s+|name:\s*)[\p{L}・\p{M}]+(?:[ \u3000][\p{L}・\p{M}]+)?/giu,
      '[contact]',
    )
    .replace(
      /(?:私は|わたしは)?[\p{Script=Han}\p{Script=Katakana}・]{1,12}(?:[ \u3000][\p{Script=Han}\p{Script=Katakana}・]{1,12})?(?:と申します|といいます)/gu,
      '[contact]',
    )
}

function clip(text: string, length: number) {
  return text.slice(0, length).replace(/[\uD800-\uDBFF]$/u, '')
}

const articleSlot = (i: number) => 'article.' + i
const contextLimits = { clef: 65536, 'clef-flash': 24576 }
export function buildClefRequest(
  model: JudgmentModel,
  question: string,
  articles: CandidateSummary[],
  name = '',
) {
  if (articles.length > 20) throw new Error('At most 20 article candidates')
  const questions: Record<string, { type: 'noul'; instructions: string }> = {
    needs_human: {
      type: 'noul',
      instructions:
        "Does this request need a person to inspect or change the customer's own account or data?",
    },
  }
  const candidates = articles.map((article, i) => {
    questions[articleSlot(i)] = {
      type: 'noul',
      instructions: `Does article ${i} help answer the customer's question?`,
    }
    return {
      id: String(i),
      title: clip(privateText(article.title, name), 200),
      summary: clip(privateText(article.summary, name), 200),
    }
  })
  const request = {
    model,
    state: {
      question: clip(privateText(question, name), 2000),
      articles: candidates,
    },
    questions,
  }
  // UTF-8 bytes conservatively bound tokens. Keep the full question schema and shorten content together.
  const budget = contextLimits[model] / 2 - 512
  while (bytes.encode(JSON.stringify(request)).length > budget) {
    request.state.question = clip(
      request.state.question,
      Math.ceil(request.state.question.length * 0.8),
    )
    for (const doc of candidates) {
      doc.title = clip(doc.title, Math.ceil(doc.title.length * 0.8))
      doc.summary = clip(doc.summary, Math.ceil(doc.summary.length * 0.8))
    }
  }
  return request
}
export function readClefAnswer(
  raw: unknown,
  articles: Pick<CandidateSummary, 'id'>[],
): Judgment {
  const { answers } = response.parse(raw)
  const scores = articles.map(({ id }, i) => ({
    id,
    score: answer.parse(answers[articleSlot(i)]).noul,
  }))
  return { scores, needsHuman: answer.parse(answers.needs_human).noul }
}

export async function judgeArticles(
  binding: Ai,
  model: JudgmentModel,
  question: string,
  articles: CandidateSummary[],
  name?: string,
): Promise<Judgment> {
  if (!articles.length) return { scores: [], needsHuman: 0 }
  const input = buildClefRequest(model, question, articles, name)
  const timeout = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        timeout.abort()
        reject(new Error('Article judgment timed out'))
      }, 1500)
    })
    const result = await Promise.race([
      binding.run(`@cf/cloudflare/${model}`, input, { signal: timeout.signal }),
      deadline,
    ])
    return readClefAnswer(result, articles)
  } finally {
    clearTimeout(timer)
  }
}
