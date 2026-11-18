import { spawnSync } from 'node:child_process'
const files = [
  'src/core/conversations/transitions.test.ts',
  'src/core/inbound/inbound.test.ts',
  'src/core/inbound/parse.test.ts',
  'src/core/outbound/reply.test.ts',
  'tests/operator.test.ts',
  'tests/access.test.ts',
  'tests/message-storage.test.ts',
  'tests/mail-flow.test.ts',
]
for (const mode of ['on', 'off']) {
  console.log('Stage 1 acceptance criteria, all extensions ' + mode)
  const result = spawnSync('pnpm', ['exec', 'vitest', 'run', ...files], {
    stdio: 'inherit',
    env: { ...process.env, HELPDESK_TEST_EXTENSIONS: mode },
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
