import { paginateRows } from './pagination'
import { ActionLink, Field, Input, NativeSelect } from './controls'
import { FilterBar } from './patterns'

type Search = Record<string, string>
type Option = { value: string; label: string }
type Item = { text: string; filter?: string }
type Filters = {
  title: string
  path: string
  query: Search
  options?: Option[]
  filterLabel?: string
  defaultOrder?: string
  sortable?: boolean
}
export type ListWindow = { total: number; page: number; pages: number }

export function matchesSearch(text: string, term = '') {
  return text.toLocaleLowerCase().includes(term.trim().toLocaleLowerCase())
}

export function listRows<T>(
  rows: T[],
  query: Search,
  describe: (row: T) => Item,
) {
  const candidates = rows
    .map((row) => ({ row, ...describe(row) }))
    .filter(
      (item) =>
        matchesSearch(item.text, query.q) &&
        (!query.filter || item.filter === query.filter),
    )
  if (query.sort === 'name')
    candidates.sort((a, b) => a.text.localeCompare(b.text, 'ja'))
  return paginateRows(
    candidates.map((item) => item.row),
    query.page,
  )
}
function location(path: string, query: Search, change: Search) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...query, ...change }))
    if (['q', 'filter', 'sort', 'page'].includes(key) && value)
      params.set(key, value)
  return params.size ? path + '?' + params : path
}
export function ListFilters({
  title,
  path,
  query,
  options,
  filterLabel,
  defaultOrder = '標準の順序',
  sortable = true,
}: Filters) {
  const chip = (key: string, label: string) => (
    <ActionLink
      variant="ghost"
      href={location(path, query, { [key]: '', page: '' })}
      aria-label={label + ' を解除'}
    >
      {label} <span aria-hidden="true">×</span>
    </ActionLink>
  )
  return (
    <FilterBar
      chips={
        Boolean(query.q || query.filter || query.sort) && (
          <>
            {query.q && chip('q', '検索：' + query.q)}
            {query.filter &&
              chip(
                'filter',
                options?.find((o) => o.value === query.filter)?.label ??
                  query.filter,
              )}
            {query.sort === 'name' && chip('sort', '名前順')}
          </>
        )
      }
    >
      <form
        action={path}
        method="get"
        data-live-filters=""
        data-list-filters=""
      >
        <Field label="検索">
          <Input
            type="search"
            name="q"
            value={query.q ?? ''}
            aria-label={title + 'を検索'}
            placeholder={title + 'を検索'}
          />
        </Field>
        {options && (
          <Field label={filterLabel ?? '絞り込み'}>
            <NativeSelect name="filter" aria-label={filterLabel ?? '絞り込み'}>
              <option value="">すべて</option>
              {options.map((o) => (
                <option value={o.value} selected={query.filter === o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
        )}
        {sortable && (
          <Field label="並び順">
            <NativeSelect name="sort" aria-label="並び順">
              <option value="">{defaultOrder}</option>
              <option value="name" selected={query.sort === 'name'}>
                名前順
              </option>
            </NativeSelect>
          </Field>
        )}
      </form>
    </FilterBar>
  )
}
export function PageLinks({
  path,
  query,
  page,
  pages,
}: Pick<Filters, 'path' | 'query'> & ListWindow) {
  if (pages <= 1) return null
  const link = (index: number) =>
    location(path, query, { page: index === 1 ? '' : String(index) })
  return (
    <nav data-ui="actions" aria-label="ページ送り">
      {page > 1 && <ActionLink href={link(page - 1)}>前のページ</ActionLink>}
      <span>
        {page} / {pages}
      </span>
      {page < pages && (
        <ActionLink href={link(page + 1)}>次のページ</ActionLink>
      )}
    </nav>
  )
}
