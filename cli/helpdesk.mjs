#!/usr/bin/env node
import { parseArgs } from 'node:util'

async function main() {
  const { values, positionals } = parseArgs({
    options: { json: { type: 'boolean' }, help: { type: 'boolean' } },
    allowPositionals: true,
  })
  const [name, argument] = positionals
  if (values.help) {
    console.log(
      'helpdesk [--json] operations | <operation> [JSON object]\nSet HELPDESK_URL and HELPDESK_TOKEN. Run operations to discover available commands.',
    )
    return
  }
  if (positionals.length > 2)
    throw new Error('Expected one operation and an optional JSON object')
  if (!process.env.HELPDESK_URL || !process.env.HELPDESK_TOKEN)
    throw new Error('Set HELPDESK_URL and HELPDESK_TOKEN')
  const url = new URL(process.env.HELPDESK_URL)
  if (
    url.protocol !== 'https:' &&
    !(
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    )
  )
    throw new Error('Use HTTPS for remote helpdesk instances')
  async function request(path, body) {
    const response = await fetch(new URL(path, url), {
      method: body === undefined ? 'GET' : 'POST',
      redirect: 'error',
      headers: {
        Authorization: 'Bearer ' + process.env.HELPDESK_TOKEN,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (!response.ok)
      throw new Error(
        'HTTP ' +
          response.status +
          ' ' +
          (await response.json().catch(() => ({}))).error,
      )
    return response.json()
  }
  const { operations } = await request('/api/operations')
  if (!name || name === 'operations') {
    console.log(
      values.json
        ? JSON.stringify(operations)
        : operations.map((op) => op.name + '  ' + op.description).join('\n'),
    )
    return
  }
  if (!operations.some((op) => op.name === name))
    throw new Error('Operation unavailable: ' + name)
  const input = JSON.parse(argument ?? '{}')
  const result = await request(
    '/api/operations/' + encodeURIComponent(name),
    input,
  )
  console.log(JSON.stringify(result, null, values.json ? undefined : 2))
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
