const inboxFilters = new Set([
  'view',
  'status',
  'product',
  'assignee',
  'label',
  'query',
  'sort',
  'page',
])
export function inboxStatus(query: Record<string, string>) {
  if (query.status) return query.status
  if (query.view === 'approval' || query.query || query.assignee) return 'all'
  return query.view === 'feedback' ? 'all' : 'open'
}

export function inboxSort(query: Record<string, string>) {
  if (query.view === 'feedback')
    return query.sort === 'unreviewed' ? 'unreviewed' : 'newest'
  return query.sort === 'newest' ? 'newest' : 'waiting'
}

export function adjacentOpen(numbers: number[], current: number) {
  const index = numbers.indexOf(current)
  const next = numbers[index + 1] ?? numbers.at(0)
  const previous = numbers[index - 1] ?? numbers.at(-1)
  return {
    next: next === current ? undefined : next,
    previous: previous === current ? undefined : previous,
  }
}

export function inboxSearch(entries: URLSearchParams | Record<string, string>) {
  const params = new URLSearchParams(entries)
  for (const key of Array.from(params.keys()))
    if (!inboxFilters.has(key) || !params.get(key)) params.delete(key)
  return params.toString()
}
export function feedbackReceipt(name: string, inbox: unknown, number?: number) {
  if (
    !number ||
    typeof inbox !== 'string' ||
    !['feedback.review', 'feedback.unreview'].includes(name)
  )
    return
  const params = new URLSearchParams(inboxSearch(new URLSearchParams(inbox)))
  params.set('view', 'feedback')
  params.set('notice', name)
  params.set('changed', String(number))
  return '/?' + params
}
export function threadUrl(number: number, search: string) {
  const path = '/conversation/' + number
  return search ? path + '?' + new URLSearchParams({ inbox: search }) : path
}
export function returnInbox(url: string, referer?: string) {
  const current = new URL(url)
  let value = current.searchParams.get('inbox')
  if (value === null && referer) {
    const previous = URL.parse(referer)
    if (
      previous?.origin === current.origin &&
      /^\/conversation\/\d+$/.test(previous.pathname)
    )
      value = previous.searchParams.get('inbox')
  }
  return inboxSearch(new URLSearchParams(value ?? ''))
}
