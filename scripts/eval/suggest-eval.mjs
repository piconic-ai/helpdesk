import { access, writeFile } from 'node:fs/promises'
import { decideChat } from '../../src/extensions/chat/chat.ts'
import {
  buildClefRequest,
  readClefAnswer,
} from '../../src/extensions/chat/judge-client.ts'
import { articles, cases } from './japanese.examples.mjs'

function percentage(count, total) {
  return total
    ? `${((100 * count) / total).toFixed(1)}% (${count}/${total})`
    : '—'
}

function classify({ expected, human, scores, needsHuman }, threshold) {
  const selected = decideChat(scores, threshold, needsHuman)
  const shown = selected.kind === 'show_articles' ? selected.articles : []
  const relevant = shown.filter((id) => expected.includes(id)).length
  return {
    answerable: expected.length > 0,
    offered: shown.length > 0,
    correct: relevant > 0 && relevant === shown.length,
    unrelated: shown.length > relevant,
    missed: expected.length > 0 && relevant === 0,
    routed: selected.needsHuman === human,
  }
}

export function measure(samples, threshold) {
  const outcomes = samples.map((sample) => classify(sample, threshold))
  const count = (key) => outcomes.filter((outcome) => outcome[key]).length
  const answerable = count('answerable')
  return [
    threshold,
    percentage(count('correct'), answerable),
    percentage(count('unrelated'), count('offered')),
    percentage(count('missed'), answerable),
    percentage(count('routed'), samples.length),
  ]
}

async function run() {
  const output = process.argv[2]
  if (
    !output ||
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.CLOUDFLARE_API_TOKEN
  )
    throw new Error(
      'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN, then pass a new Markdown report path.',
    )
  const model = process.env.HELPDESK_EVAL_MODEL || 'clef-flash'
  if (!['clef', 'clef-flash'].includes(model))
    throw new Error('Choose clef or clef-flash.')
  if (!/^[a-fA-F0-9]{32}$/.test(process.env.CLOUDFLARE_ACCOUNT_ID))
    throw new Error('Expected a Cloudflare account ID.')
  await access(output).then(
    () => {
      throw new Error('Choose a new report path before running the evaluation.')
    },
    (error) => {
      if (error.code !== 'ENOENT') throw error
    },
  )
  const measured = []
  for (const sample of cases) {
    const input = buildClefRequest(model, sample.question, articles)
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/cloudflare/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(30000),
      },
    )
    if (!response.ok)
      throw new Error(
        `Workers AI returned HTTP ${response.status} on sample ${measured.length + 1}`,
      )
    const envelope = await response.json()
    if (!envelope.success)
      throw new Error(`Workers AI failed on sample ${measured.length + 1}`)
    const result = readClefAnswer(envelope.result, articles)
    measured.push({ ...sample, ...result })
  }
  const lines = [
    `# Japanese article suggestion evaluation`,
    ``,
    `Measured ${new Date().toISOString()} using ${model}, ${articles.length} published articles and ${measured.length} Japanese questions.`,
    ``,
    '| Threshold | Correct suggestions / questions with an answer | Any irrelevant suggestion / questions shown suggestions | No relevant suggestion / questions with an answer | Correct human routing / all questions |',
    '| --- | --- | --- | --- | --- |',
    ...[0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(
      (t) => '| ' + measure(measured, t).join(' | ') + ' |',
    ),
    '',
    '## Responses',
    '',
    '```json',
    JSON.stringify(measured, null, 2),
    '```',
    '',
  ]
  await writeFile(output, lines.join('\n'), { flag: 'wx' })
  console.log(output)
}
if (import.meta.main) await run()
