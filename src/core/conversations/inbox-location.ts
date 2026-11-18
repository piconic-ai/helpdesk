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
export function inboxSearch(entries: URLSearchParams | Record<string, string>) {
  const params = new URLSearchParams(entries)
  for (const key of Array.from(params.keys()))
    if (!inboxFilters.has(key) || !params.get(key)) params.delete(key)
  return params.toString()
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
