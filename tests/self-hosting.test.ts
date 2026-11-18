import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { expect, test } from 'vitest'

test('F20-AC1 F20-AC3: run the published commands from a blank local checkout', async () => {
  const { stdout } = await promisify(execFile)('python3', [
    'scripts/test-self-host.py',
  ])
  expect(stdout).toContain(
    'Verified first mailbox, doctor, inbound mail and masked JSONL export.',
  )
}, 480_000)
