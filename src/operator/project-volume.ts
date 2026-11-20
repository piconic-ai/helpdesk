type ProjectCount = { value: string; title: string; count: number }

export function projectBreakdown<T extends ProjectCount>(rows: T[]) {
  const sorted = rows.toSorted(
    (a, b) =>
      b.count - a.count ||
      a.title.localeCompare(b.title, 'ja') ||
      a.value.localeCompare(b.value),
  )
  return {
    leading: sorted.slice(0, 8),
    remaining: sorted.slice(8),
  }
}
