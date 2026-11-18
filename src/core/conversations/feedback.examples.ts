export const feedbackCases = [
  ['received', 'review', 'reviewed'],
  ['received', 'convert', 'open'],
  ['reviewed', 'review', 'rejected'],
  ['reviewed', 'convert', 'open'],
  ['spam', 'review', 'rejected'],
  ['spam', 'convert', 'rejected'],
] as const
