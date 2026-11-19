import { startScene } from '../../tests/ui/seed.mjs'
import { registerProduct, serveProduct } from './server.mjs'

const desk = await startScene(
  ['articles', 'chat', 'form', 'feedback', 'metrics'],
  '.',
  {
    port: Number(process.env.HELPDESK_DEMO_PORT ?? 8788),
    tickingClock: true,
  },
)
let product
try {
  product = await serveProduct(
    desk.origin,
    Number(process.env.HELPDESK_PRODUCT_PORT ?? 4173),
  )
  await registerProduct(desk.origin, product.origin)
  console.log('Example product: ' + product.origin + '/billing/receipts')
  console.log('Operator inbox: ' + desk.origin + '/')
  console.log('Sample data resets when this process stops.')
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, stop)
} catch (error) {
  await stop()
  throw error
}

async function stop() {
  await Promise.all([product?.stop(), desk.stop()])
}
