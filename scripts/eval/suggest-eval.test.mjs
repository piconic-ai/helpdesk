import { expect, it } from 'vitest'
import { articles, cases } from './japanese.examples.mjs'
import { measure } from './suggest-eval.mjs'

it('covers distinct Japanese questions, multiple intents, no answers and private account matters', () => {
  expect(new Set(cases.map((s) => s.question)).size).toBeGreaterThanOrEqual(30)
  expect(cases.some((s) => s.expected.length > 1)).toBe(true)
  expect(cases.some((s) => s.expected.length === 0 && !s.human)).toBe(true)
  expect(cases.some((s) => s.human && s.expected.length > 0)).toBe(true)
  expect(new Set(cases.map((s) => s.category))).toEqual(
    new Set(['標準', '言い換え', '口語', '誤字', '複数', '無関係', '要調査']),
  )
  for (const s of cases)
    for (const id of s.expected)
      expect(articles.some((a) => a.id === id)).toBe(true)
})
it('counts mixed suggestions as wrong and an exact threshold as a missed suggestion', () => {
  const samples = [
    {
      expected: ['receipt'],
      scores: [{ id: 'receipt', score: 0.8 }],
      human: false,
      needsHuman: 0.1,
    },
    {
      expected: ['card'],
      scores: [{ id: 'card', score: 0.6 }],
      human: true,
      needsHuman: 0.9,
    },
    {
      expected: ['invite'],
      scores: [
        { id: 'invite', score: 0.8 },
        { id: 'receipt', score: 0.9 },
      ],
      human: false,
      needsHuman: 0.8,
    },
    { expected: [], scores: [], human: false, needsHuman: 0.6 },
  ]
  expect(measure(samples, 0.6)).toEqual([
    0.6,
    '33.3% (1/3)',
    '50.0% (1/2)',
    '33.3% (1/3)',
    '75.0% (3/4)',
  ])
})
