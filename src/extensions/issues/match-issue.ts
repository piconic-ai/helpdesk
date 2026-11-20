type Choice = { number: number; title: string }
const segmenter = new Intl.Segmenter('ja', { granularity: 'word' })
const stopWords = new Set([
  'ます',
  'です',
  'する',
  'した',
  'できる',
  'いる',
  'こと',
  'よう',
  'について',
  'ください',
  'お願い',
  'the',
  'with',
  'from',
  'that',
  'this',
  'and',
  'for',
  'how',
  'can',
  'to',
  'of',
])
function words(text: string) {
  return new Set(
    [...segmenter.segment(text.normalize('NFKC').toLowerCase())]
      .filter(
        ({ segment, isWordLike }) =>
          isWordLike && segment.length > 1 && !stopWords.has(segment),
      )
      .map(({ segment }) => segment),
  )
}
export function matchingIssue(
  choices: readonly Choice[],
  subject: string,
  body: string,
  linked: ReadonlySet<number>,
) {
  const headline = words(subject)
  const description = words(body.slice(0, 4000))
  let best: Choice | undefined
  let high = 0
  for (const issue of choices) {
    if (linked.has(issue.number)) continue
    const terms = words(issue.title)
    let score = 0
    for (const term of terms)
      score += 2 * Number(headline.has(term)) + Number(description.has(term))
    score /= Math.sqrt(terms.size || 1)
    if (
      score > high ||
      (score > 0 && score === high && best && issue.number < best.number)
    ) {
      high = score
      best = issue
    }
  }
  return best
}
