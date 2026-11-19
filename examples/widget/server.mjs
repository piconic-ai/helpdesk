import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'

export async function serveProduct(helpdesk, port = 0) {
  const template = await readFile(
    new URL('./index.html', import.meta.url),
    'utf8',
  )
  const origin = new URL(helpdesk).origin
  const page = template.replace('__HELPDESK_ORIGIN__', origin)
  const server = createServer((request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname
    const receipt = /^\/receipts\/(2026-1[01])\.csv$/.exec(path)
    if (receipt) {
      response.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8' })
      return response.end('month,total_jpy\n' + receipt[1] + ',3000\n')
    }
    if (!['/', '/billing', '/billing/receipts'].includes(path)) {
      response.writeHead(404)
      return response.end()
    }
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    response.end(page)
  })
  await new Promise((resolve, reject) =>
    server.once('error', reject).listen(port, '127.0.0.1', resolve),
  )
  return {
    origin: 'http://127.0.0.1:' + server.address().port,
    stop: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  }
}

export async function registerProduct(helpdesk, site) {
  const response = await fetch(helpdesk + '/extensions/chat/embed-sites', {
    method: 'POST',
    redirect: 'manual',
    headers: { Origin: helpdesk },
    body: new URLSearchParams({ product: 'slide', site, intent: 'add' }),
  })
  if (response.status !== 303)
    throw new Error('Could not register example site (' + response.status + ')')
}
