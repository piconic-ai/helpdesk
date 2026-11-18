#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { verifySendingDomains } from './doctor.mjs'

function connection(variables) {
  if (!variables.HELPDESK_URL || !variables.HELPDESK_TOKEN)
    throw new Error('Set HELPDESK_URL and HELPDESK_TOKEN')
  const url = new URL(variables.HELPDESK_URL)
  const local =
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if (url.protocol !== 'https:' && !local)
    throw new Error('Use HTTPS for remote helpdesk instances')
  return { url, token: variables.HELPDESK_TOKEN }
}

async function request({ url, token }, path, body) {
  const response = await fetch(new URL(path, url), {
    method: body === undefined ? 'GET' : 'POST',
    redirect: 'error',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text()
    let message = text
    try {
      message = JSON.parse(text).error ?? text
    } catch {}
    throw new Error('HTTP ' + response.status + ' ' + message)
  }
  return response.json()
}

async function runOperation(host, name, input, options) {
  const response = await request(
    host,
    '/api/operations/' + encodeURIComponent(name),
    input,
  )
  if (name === 'doctor') {
    if (options.live)
      response.result = await verifySendingDomains(response.result, process.env)
    if (!response.result.ready) process.exitCode = 1
  }
  console.log(JSON.stringify(response, null, options.json ? undefined : 2))
}

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      live: { type: 'boolean' },
      json: { type: 'boolean' },
      help: { type: 'boolean' },
    },
    allowPositionals: true,
  })
  const [name = 'operations', argument = '{}'] = positionals
  if (values.help) {
    console.log(
      'helpdesk [--json] operations | doctor [--live] | <operation> [JSON object]\nSet HELPDESK_URL and HELPDESK_TOKEN. Run operations to discover available commands.',
    )
    return
  }
  if (values.live && name !== 'doctor')
    throw new Error('--live requires doctor')
  if (positionals.length > 2)
    throw new Error('Expected one operation and an optional JSON object')
  const host = connection(process.env)
  const { operations } = await request(host, '/api/operations')
  if (name === 'operations') {
    console.log(
      values.json
        ? JSON.stringify(operations)
        : operations.map((op) => op.name + '  ' + op.description).join('\n'),
    )
    return
  }
  if (!operations.some((op) => op.name === name))
    throw new Error('Operation unavailable: ' + name)
  await runOperation(host, name, JSON.parse(argument), values)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
