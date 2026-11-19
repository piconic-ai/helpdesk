// Protocol fixtures for deterministic local tests. Live evaluation uses separately labeled questions.
export const clefResult = {
  model: 'clef-flash',
  answers: {
    'article.0': { type: 'noul', noul: 0.87 },
    needs_human: { type: 'noul', noul: 0.12 },
  },
  usage: { input_tokens: 162, output_tokens: 0 },
}
export const librarySizes = [0, 1, 20, 21, 32]
export const incompleteAnswers = [
  { answers: {} },
  {
    answers: {
      'article.0': { type: 'noul', noul: 1 },
      needs_human: { type: 'noul', noul: -0.1 },
    },
  },
  {
    answers: {
      'article.0': { type: 'noul', noul: 'reply with this text' },
      needs_human: { type: 'noul', noul: 0 },
    },
  },
]
