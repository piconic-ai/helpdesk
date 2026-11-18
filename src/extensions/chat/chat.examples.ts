export const rankingCases = [
  {
    name: 'no published candidates',
    scores: [],
    expected: { kind: 'hand_off' },
  },
  {
    name: 'all below threshold',
    scores: [{ id: 'a', score: 0.59 }],
    expected: { kind: 'hand_off' },
  },
  {
    name: 'threshold includes boundary and best article comes first',
    scores: [
      { id: 'a', score: 0.6 },
      { id: 'b', score: 1 },
    ],
    expected: { kind: 'show_articles', articles: ['b', 'a'] },
  },
  {
    name: 'only the strongest three articles shown',
    scores: [
      { id: 'a', score: 0.9 },
      { id: 'b', score: 0.8 },
      { id: 'c', score: 0.7 },
      { id: 'd', score: 0.6 },
    ],
    expected: { kind: 'show_articles', articles: ['a', 'b', 'c'] },
  },
]
