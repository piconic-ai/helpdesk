import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const handbook = readFileSync(
  new URL('../../docs/hands-on.md', import.meta.url),
  'utf8',
)
const sections = handbook.split(/^## /m).slice(1)

export function chapter(id, ...controls) {
  const section = sections.find((text) =>
    text.includes('通しのテスト ' + id + '、'),
  )
  assert.ok(section, 'Missing handbook chapter ' + id)
  for (const label of controls)
    assert.ok(
      section.includes('「' + label + '」'),
      id + ' must document ' + label,
    )
  return id + ' ' + section.split('\n', 1)[0]
}
