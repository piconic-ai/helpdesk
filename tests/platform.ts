import { readFile, readdir } from 'node:fs/promises'
import { Miniflare, convertV4MiniflareOptions } from 'miniflare'

export async function testPlatform() {
  const runtime = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script: "export default {fetch(){return new Response('OK')}}",
      assets: {
        binding: 'ASSETS',
        directory: './public',
        run_worker_first: true,
        routerConfig: { has_user_worker: true },
      },
      email: { send_email: [{ name: 'EMAIL' }] },
      d1Databases: ['DB'],
      r2Buckets: ['RAW'],
      queueProducers: { JOBS: 'jobs' },
      compatibilityDate: '2026-11-03',
    }),
  )
  const env = await runtime.getBindings<{
    DB: D1Database
    RAW: R2Bucket
    EMAIL: SendEmail
    ASSETS: Fetcher
    JOBS: Queue
  }>()
  await applyMigrations(env.DB)
  return {
    ...env,
    AI: {
      run: async () => {
        throw new Error('No test AI response configured')
      },
    },
    dispose: () => runtime.dispose(),
  }
}

export async function applyMigrations(db: D1Database) {
  const migrations = (await readdir('migrations'))
    .filter((name) => name.endsWith('.sql'))
    .sort()
  for (const file of migrations) {
    const sql = await readFile('migrations/' + file, 'utf8')
    const statements = splitMigration(sql)
    await db.batch(statements.map((s) => db.prepare(s)))
  }
}

function splitMigration(sql: string) {
  const statements: string[] = []
  let pending = ''
  for (const part of sql.split(';')) {
    pending = pending ? `${pending};${part}` : part
    const code = pending.replace(/--.*$/gm, '').trim()
    if (/^CREATE\s+TRIGGER\b/i.test(code) && !/\bEND$/i.test(code)) continue
    if (code) statements.push(pending)
    pending = ''
  }
  return statements
}
