import { expect, it } from 'vitest'
import { jsonLines } from './extension'

it('F15-AC2 masks contacts inside encoded event, actor and approval fields', () => {
  const name = 'Aki "Q" \\ Reader'
  const address = 'aki@example.org'
  const payload = { [name]: { contact: address.toUpperCase(), name } }
  const actor = { kind: 'agent', id: name, onBehalfOf: address }
  const approval = { kind: 'operator', by: name }
  const data = {
    conversations: [{ contact: address, contact_name: name }],
    events: [
      {
        payload: JSON.stringify(payload),
        actor: JSON.stringify(actor),
        dedup_key: JSON.stringify([name]),
      },
    ],
    messages: [{ body: name, approval: JSON.stringify(approval) }],
  }
  const rows = jsonLines(data, false)
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line).data)
  expect(JSON.parse(rows[1].payload)).toEqual({
    '[name]': { contact: '[address]', name: '[name]' },
  })
  expect(JSON.parse(rows[1].actor)).toEqual({
    kind: 'agent',
    id: '[name]',
    onBehalfOf: '[address]',
  })
  expect(JSON.parse(rows[1].dedup_key)).toEqual(['[name]'])
  expect(JSON.parse(rows[2].approval)).toEqual({
    kind: 'operator',
    by: '[name]',
  })
  expect(JSON.parse(jsonLines(data, true).trim().split('\n')[1]).data).toEqual(
    data.events[0],
  )
})
