export const feedbackCases = [
  ['received', 'review', 'reviewed'],
  ['received', 'convert', 'open'],
  ['received', 'unreview', 'rejected'],
  ['reviewed', 'unreview', 'received'],
  ['spam', 'unreview', 'rejected'],
  ['reviewed', 'review', 'rejected'],
  ['reviewed', 'convert', 'open'],
  ['spam', 'review', 'rejected'],
  ['spam', 'convert', 'rejected'],
] as const
