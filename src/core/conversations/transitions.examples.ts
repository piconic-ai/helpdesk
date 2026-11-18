export const outcomes = [
  ['open', ['open', 'pending', 'closed', 'reject', 'spam', 'reject']],
  ['pending', ['open', 'pending', 'closed', 'open', 'spam', 'reject']],
  ['closed', ['open', 'reject', 'reject', 'open', 'spam', 'reject']],
  ['spam', ['spam', 'reject', 'reject', 'reject', 'reject', 'open']],
] as const
export const events = [
  'customer_replied',
  'operator_replied',
  'closed',
  'reopened',
  'marked_spam',
  'unmarked_spam',
] as const
