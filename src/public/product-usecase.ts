import { readPublicProduct } from './product-store'
import type { Bindings } from '../core/settings/bindings'
export const publicProduct = (env: Bindings, id: string) =>
  readPublicProduct(env.DB, id)
