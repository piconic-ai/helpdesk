export function paginateRows<T>(rows: T[], requested?: string) {
  const pageSize = 20
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const page = Math.min(
    pages,
    Math.max(1, /^\d+$/.test(requested ?? '') ? Number(requested) : 1),
  )
  return {
    total: rows.length,
    page,
    pages,
    rows: rows.slice((page - 1) * pageSize, page * pageSize),
  }
}
