export async function externalRequest(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, redirect: 'manual' })
  // Workers supports manual redirects. Never forward credentials to another URL.
  if (response.status >= 300 && response.status < 400)
    throw new Error('External service returned a redirect')
  return response
}
