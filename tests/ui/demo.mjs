import { startDemo } from './demo-scene.mjs'

const demo = await startDemo(Number(process.env.HELPDESK_DEMO_PORT ?? 8788))
console.log('Helpdesk local demo: ' + demo.origin)
console.log('Sample data is reset when this process stops.')
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => demo.stop())
