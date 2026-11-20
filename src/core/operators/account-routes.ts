import { replyDelayInput } from '../settings/reply-delay'
import { timeZone } from './time-zone'
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { mailLanguage } from '../settings/mail-language'
import { z } from 'zod'
import type { AppEnv } from './middleware'
import { consoleFrame } from '../conversations/console-usecase'
import {
  accountImage,
  displayName,
  updateAccount,
  updateSender,
} from './account-usecase'
import { accountPage } from './account-page'
import { InvalidAvatar, maxAvatarBytes } from './avatar'

export const accountRoutes = new Hono<AppEnv>()
accountRoutes.get('/account', async (c) =>
  c.render(
    accountPage(
      await consoleFrame(c.env, c.get('operator'), '/account', c.req.query()),
    ),
  ),
)
accountRoutes.post(
  '/account',
  bodyLimit({
    maxSize: maxAvatarBytes + 16_384,
    onError: (c) => c.text('2 MB 以下の画像を選んでください。', 413),
  }),
  async (c) => {
    const form = await c.req.parseBody()
    const operator = c.get('operator')
    const name = displayName.safeParse(form.displayName)
    const file =
      form.avatar instanceof File && form.avatar.name ? form.avatar : null
    const frame = () => consoleFrame(c.env, operator, '/account')
    if (!name.success)
      return c.html(
        accountPage(
          await frame(),
          String(form.displayName ?? ''),
          '表示名は1〜100文字で、改行を含めずに入力してください。',
        ),
        400,
      )
    const zone = timeZone.optional().safeParse(form.timeZone)
    if (!zone.success)
      return c.html(
        accountPage(
          await frame(),
          name.data,
          '有効な時間帯を入力してください（例：Asia/Tokyo）。',
        ),
        400,
      )
    const delay = replyDelayInput.optional().safeParse(form.replyDelay)
    if (!delay.success)
      return c.html(
        accountPage(await frame(), name.data, '取り消し時間を選んでください。'),
        400,
      )
    try {
      await updateAccount(
        c.env,
        operator.email,
        name.data,
        file,
        zone.data,
        delay.data,
      )
    } catch (error) {
      if (error instanceof InvalidAvatar)
        return c.html(accountPage(await frame(), name.data, error.message), 400)
      throw error
    }
    return c.redirect('/account?saved=yes', 303)
  },
)
accountRoutes.get('/account/avatar/:key', async (c) => {
  const key = z.uuid().safeParse(c.req.param('key'))
  const image = key.success && (await accountImage(c.env, key.data))
  if (!image) return c.notFound()
  return new Response(image.body, {
    headers: {
      'Content-Type': 'image/png',
      'X-Content-Type-Options': 'nosniff',
    },
  })
})
accountRoutes.post('/settings/senders/:product', async (c) => {
  if (c.get('operator').role !== 'admin')
    return c.text('管理者の権限が必要です。', 403)
  const form = await c.req.parseBody()
  const name = displayName.parse(form.senderName)
  const language = mailLanguage.optional().safeParse(form.language)
  if (!language.success) return c.text('窓口の言語を確認してください。', 400)
  const minimum = replyDelayInput.optional().safeParse(form.minimumReplyDelay)
  if (!minimum.success)
    return c.text('取り消し時間の下限を選んでください。', 400)
  const saved = await updateSender(
    c.env,
    c.req.param('product'),
    name,
    form.showOperator === 'on',
    language.data,
    minimum.data,
  )
  return saved
    ? c.redirect(
        '/settings/mailboxes?saved=sender&edit=' +
          encodeURIComponent(c.req.param('product')),
        303,
      )
    : c.notFound()
})
