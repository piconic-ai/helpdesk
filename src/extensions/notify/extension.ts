import { z } from 'zod'
import type {
  Extension,
  ExtensionContext,
  ExtensionEvent,
} from '../../core/extensions/extension'
const settings = z
  .object({
    format: z.enum(['slack', 'discord']).default('slack'),
    includeBody: z.boolean().default(false),
    email: z.email().optional(),
  })
  .strict()
async function notifyEvent(ctx: ExtensionContext, e: ExtensionEvent) {
  if (!e.number) return
  if (e.kind === 'assigned' && !e.payload.to) return
  const conf = settings.parse(ctx.config)
  const url = ctx.secret('NOTIFY_WEBHOOK_URL')
  if (!url && !conf.email) return
  const contact = await ctx.contact(e.number)
  const headline = '#' + e.number + ' ' + contact.subject
  const body = conf.includeBody
    ? await ctx.inboundBody(
        e.number,
        typeof e.payload.message === 'string' ? e.payload.message : undefined,
      )
    : ''
  const message = body ? headline + '\n' + body : headline
  if (conf.email && ctx.enabledBy)
    await ctx.notifyEmail(e.number, conf.email, message, 'notify/' + e.id)
  if (url) await postWebhook(ctx, url, conf.format, message)
}
async function postWebhook(
  ctx: ExtensionContext,
  url: string,
  format: 'slack' | 'discord',
  message: string,
) {
  const endpoint = z.url({ protocol: /^https$/ }).parse(url)
  const payload =
    format === 'discord'
      ? { content: message.slice(0, 2000), allowed_mentions: { parse: [] } }
      : {
          text: message.slice(0, 30000),
          mrkdwn: false,
          unfurl_links: false,
          unfurl_media: false,
        }
  const response = await ctx.request(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok)
    throw new Error('Notification endpoint returned ' + response.status)
}
export const notify: Extension = {
  id: 'notify',
  secrets: ['NOTIFY_WEBHOOK_URL'],
  config: settings,
  permissions: ['external_fetch', 'read_body', 'send'],
  subscribers: [
    { kind: 'message_received', run: notifyEvent },
    { kind: 'assigned', run: notifyEvent },
  ],
}
