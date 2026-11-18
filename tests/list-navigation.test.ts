import { describe, expect, it } from 'vitest'
import { ListFilters, listRows, PageLinks } from '../src/ui/listing'
import { paginateRows } from '../src/ui/pagination'

function destinations(fragment: unknown) {
  return Array.from(
    String(fragment).matchAll(/ href="([^"]+)"/g),
    (match) =>
      new URL(match[1].replaceAll('&amp;', '&'), 'https://example.test'),
  )
}

describe('list navigation', () => {
  const rows = Array.from({ length: 44 }, (_, i) => ({
    text: 'Desk ' + String(i + 1).padStart(2, '0'),
    filter: i % 2 ? 'closed' : 'open',
  })).reverse()
  it('searches, filters and sorts before splitting pages, without mutating the original ordering', () => {
    const first = listRows(
      rows,
      { q: '  dESk ', filter: 'open', sort: 'name' },
      (row) => row,
    )
    const last = listRows(
      rows,
      { q: 'dESk', filter: 'open', sort: 'name', page: '2' },
      (row) => row,
    )
    expect(first.total).toBe(22)
    expect(first.rows).toHaveLength(20)
    expect(last.rows.map((row) => row.text)).toEqual(['Desk 41', 'Desk 43'])
    expect(new Set([...first.rows, ...last.rows]).size).toBe(22)
    expect(rows[0].text).toBe('Desk 44')
    expect(listRows(rows, { q: 'missing' }, (row) => row)).toMatchObject({
      total: 0,
      page: 1,
      pages: 1,
      rows: [],
    })
  })

  it.each([
    ['-1', 1],
    ['oops', 1],
    ['2oops', 1],
    ['99', 3],
    ['2', 2],
  ])(
    'resolves the page in a shared or stale URL (%s)',
    (requested, expected) => {
      expect(paginateRows(rows, String(requested)).page).toBe(expected)
    },
  )

  it('keeps each remaining condition when clearing one, and resets the page', () => {
    const q = 'R&D + 日本語'
    const markup = ListFilters({
      path: '/articles',
      title: '記事',
      options: [{ value: 'draft', label: '下書き' }],
      query: {
        q,
        filter: 'draft',
        sort: 'name',
        page: '3',
        unknown: 'ignored',
      },
    })
    const urls = destinations(markup)
    expect(urls.map((u) => Object.fromEntries(u.searchParams))).toEqual([
      { filter: 'draft', sort: 'name' },
      { q, sort: 'name' },
      { q, filter: 'draft' },
    ])
    expect(urls.every((u) => u.pathname === '/articles')).toBe(true)
    expect(String(markup)).toContain('下書き を解除')
    const last = ListFilters({
      path: '/articles',
      title: '記事',
      query: { q },
      sortable: false,
    })
    expect(destinations(last)[0].href).toBe('https://example.test/articles')
    expect(String(last)).not.toContain('name="sort"')
  })

  it('offers only reachable pages and preserves a public search term across both directions', () => {
    const query = { q: '共有 & 日本語' }
    function links(page: number, pages: number) {
      return destinations(
        PageLinks({ path: '/help/', query, page, pages, total: 41 }),
      ).map((u) => Object.fromEntries(u.searchParams))
    }
    expect(links(1, 1)).toEqual([])
    expect(links(1, 3)).toEqual([{ ...query, page: '2' }])
    expect(links(2, 3)).toEqual([query, { ...query, page: '3' }])
    expect(links(3, 3)).toEqual([{ ...query, page: '2' }])
  })
})
