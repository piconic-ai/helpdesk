import { can } from '../operators/project-access'
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { InvalidAvatar, maxAvatarBytes } from '../operators/avatar'
import type { AppEnv } from '../operators/middleware'
import { consoleFrame } from '../conversations/console-usecase'
import { changeProductIcon, InvalidProductIcon } from './product-icon-usecase'
import { productIconErrorPage } from './product-icon-page'

export const productIconRoutes = new Hono<AppEnv>()
productIconRoutes.post(
  '/settings/product-icon/:product',
  bodyLimit({
    maxSize: maxAvatarBytes + 16_384,
    onError: (c) => c.text('2 MB 以下の画像を選んでください。', 413),
  }),
  async (c) => {
    const operator = c.get('operator')
    if (!can(operator, 'manage', c.req.param('product')).allowed)
      return c.text('管理者の権限が必要です。', 403)
    const product = c.req.param('product')
    const form = await c.req.parseBody()
    const file =
      form.image instanceof File && form.image.name ? form.image : null
    try {
      if (
        !(await changeProductIcon(c.env, product, form.mode, form.emoji, file))
      )
        return c.notFound()
    } catch (error) {
      if (
        !(error instanceof InvalidProductIcon || error instanceof InvalidAvatar)
      )
        throw error
      const frame = await consoleFrame(c.env, operator, '/settings/mailboxes')
      const item = frame.products.find((p) => p.id === product)
      if (!item) return c.notFound()
      return c.html(
        productIconErrorPage(
          frame,
          item,
          String(form.mode),
          String(form.emoji ?? ''),
          error.message,
        ),
        400,
      )
    }
    return c.redirect(
      '/settings/mailboxes?saved=icon&edit=' + encodeURIComponent(product),
      303,
    )
  },
)
