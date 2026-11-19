export const rankingCases = [
  {
    name: 'no published candidates',
    scores: [],
    expected: { kind: 'hand_off', needsHuman: false },
  },
  {
    name: 'all below threshold',
    scores: [{ id: 'a', score: 0.59 }],
    expected: { kind: 'hand_off', needsHuman: false },
  },
  {
    name: 'threshold excludes boundary and best article comes first',
    scores: [
      { id: 'a', score: 0.6 },
      { id: 'b', score: 1 },
    ],
    expected: { kind: 'show_articles', needsHuman: false, articles: ['b'] },
  },
  {
    name: 'only the strongest three articles shown',
    scores: [
      { id: 'a', score: 0.9 },
      { id: 'b', score: 0.8 },
      { id: 'c', score: 0.7 },
      { id: 'd', score: 0.65 },
    ],
    expected: {
      kind: 'show_articles',
      needsHuman: false,
      articles: ['a', 'b', 'c'],
    },
  },
  {
    name: 'personal account needs a human with relevant articles',
    scores: [{ id: 'a', score: 0.95 }],
    human: 0.94,
    expected: { kind: 'show_articles', needsHuman: true, articles: ['a'] },
  },
  {
    name: 'exact threshold has no article or human match',
    scores: [{ id: 'a', score: 0.6 }],
    human: 0.6,
    expected: { kind: 'hand_off', needsHuman: false },
  },
]
