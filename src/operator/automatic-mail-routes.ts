import { Hono, type Context } from 'hono'
import { z } from 'zod'
import { consoleFrame } from '../core/conversations/console-usecase'
import {
  editExtensionSetting,
  readPolicyMessage,
} from '../core/extensions/admin-settings-usecase'
import { authorize } from '../core/operations/catalog'
import { context, scopes } from '../core/operations/operations-routes'
import type { AppEnv } from '../core/operators/middleware'
import { replySubject } from '../core/outbound/compose'
import {
  acknowledgmentText,
  automaticPolicy,
  messageKey,
  messageWording,
  surveyText,
  wordingFor,
} from '../extensions/automatic-message'
import { surveyConfig } from '../extensions/survey/extension-routes'
import { automaticMailPage } from './automatic-mail-page'

const app = new Hono<AppEnv>()
const formSchema = z.object({
  product: z.string().min(1),
  intent: z.enum(['preview', 'save']),
  body: messageWording,
  revision: z.uuid().or(z.literal('')),
})
const path = '/extensions/:id{auto-ack|survey}'

function mailNotice(conflict: boolean, preview: boolean, saved: boolean) {
  if (conflict)
    return 'ほかの運営者が文面を更新しました。現在の内容を確認してください。'
  if (preview) return '保存前のプレビューです。'
  if (saved) return '文面を保存しました。'
}

async function settings(c: Context<AppEnv>, form?: z.infer<typeof formSchema>) {
  const ctx = context(c)
  authorize(ctx, 'admin', scopes)
  const id = automaticPolicy.parse(c.req.param('id'))
  const installed = c.env.EXTENSIONS?.active.find(
    (entry) => entry.extension.id === id,
  )
  if (!installed) return c.notFound()
  const frame = await consoleFrame(c.env, ctx.operator, '/extensions/' + id)
  const selection =
    form?.product ?? c.req.query('product') ?? frame.products[0]?.id
  const product = frame.products.find((p) => p.id === selection)
  if (selection && !product) return c.notFound()
  const key = messageKey(selection ?? '')
  let conflict = false
  if (form?.intent === 'save') {
    const result = await editExtensionSetting(
      ctx,
      id,
      key,
      form.body,
      form.revision,
    )
    if (result !== null)
      return c.redirect(
        '/extensions/' +
          id +
          '?' +
          new URLSearchParams({
            product: form.product,
            notice: 'saved',
          }),
        303,
      )
    conflict = true
    c.status(409)
  }
  const current = await readPolicyMessage(
    c.env.DB,
    id,
    key,
    installed.enabledBy,
  )
  const approval = { by: installed.enabledBy, at: current.enabledAt }
  if (!product) return c.render(automaticMailPage(id, frame, approval))
  const draft = form?.intent === 'preview' ? form : undefined
  const wording = draft?.body ?? wordingFor(id, current.wording)
  const number = 123
  const preview =
    id === 'auto-ack'
      ? acknowledgmentText(product.name, number, wording)
      : surveyText(
          surveyConfig.parse(installed.settings).helpdeskOrigin,
          product.id,
          number,
          'example',
          wording,
        )
  return c.render(
    automaticMailPage(
      id,
      frame,
      approval,
      {
        product: product.id,
        wording,
        revision: draft?.revision ?? current.revision,
        subject: replySubject('お問い合わせの例', number),
        preview,
      },
      mailNotice(conflict, !!draft, c.req.query('notice') === 'saved'),
      conflict,
    ),
  )
}

app.get(path, (c) => settings(c))
app.post(path + '/message', async (c) => {
  const form = formSchema.safeParse(await c.req.parseBody())
  if (!form.success)
    return c.text(
      'プロダクトと文面を確認してください。本文は1～8000文字で入力してください。',
      400,
    )
  return settings(c, form.data)
})
export { app as automaticMailRoutes }
