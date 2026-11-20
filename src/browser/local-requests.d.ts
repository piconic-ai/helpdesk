export function jsonMutation(
  url: string | URL,
  body: FormData | URLSearchParams | Record<string, unknown>,
  options?: { accept?: string },
): Promise<unknown>
export function jsonQuery(
  url: string | URL,
  signal?: AbortSignal,
): Promise<unknown>
export function pageQuery(
  url: string | URL,
  signal?: AbortSignal,
): Promise<Document>
export function syncPageCounts(doc: Document): void
