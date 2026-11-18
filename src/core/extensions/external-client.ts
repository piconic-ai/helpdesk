export async function externalRequest(url: string, init?: RequestInit) {
  return fetch(url, { ...init, redirect: 'error' })
}
