import { z } from 'zod'
import type {
  Extension,
  ExtensionContext,
  ExtensionEvent,
} from '../../core/extensions/extension'
const destination = z
  .object({
    format: z.enum(['slack', 'discord']).default('slack'),
    webhookLabel: z.string().trim().min(1).max(100).optional(),
    includeBody: z.boolean().default(false),
    email: z.email().optional(),
  })
  .strict()
const settings = destination.extend({
  projects: z.record(z.string(), destination).optional(),
})

function projectWebhooks(ctx: ExtensionContext): Record<string, string> {
  const secret = ctx.secret('NOTIFY_PROJECT_WEBHOOKS')
  if (!secret) return {}
  try {
    return z
      .record(z.string(), z.url({ protocol: /^https$/ }))
      .parse(JSON.parse(secret))
  } catch {
    throw new Error(
      'NOTIFY_PROJECT_WEBHOOKS must map project IDs to HTTPS webhook URLs',
    )
  }
}

function deliveryTarget(
  ctx: ExtensionContext,
  conf: z.output<typeof settings>,
  product: string,
) {
  if (!conf.projects)
    return { options: conf, webhook: ctx.secret('NOTIFY_WEBHOOK_URL') }
  const options = Object.hasOwn(conf.projects, product)
    ? conf.projects[product]
    : undefined
  if (!options) return undefined
  const urls = projectWebhooks(ctx)
  return {
    options,
    webhook: Object.hasOwn(urls, product) ? urls[product] : undefined,
  }
}

async function notifyEvent(ctx: ExtensionContext, e: ExtensionEvent) {
  if (!e.number) return
  if (e.kind === 'assigned' && !e.payload.to) return
  const conf = settings.parse(ctx.config)
  const contact = await ctx.contact(e.number)
  const target = deliveryTarget(ctx, conf, contact.product)
  if (!target || (!target.webhook && !target.options.email)) return
  const { options, webhook } = target
  const headline = contact.reference + ' ' + contact.subject
  const body = options.includeBody
    ? await ctx.inboundBody(
        e.number,
        typeof e.payload.message === 'string' ? e.payload.message : undefined,
      )
    : ''
  const message = body ? headline + '\n' + body : headline
  if (options.email && ctx.enabledBy)
    await ctx.notifyEmail(e.number, options.email, message, 'notify/' + e.id)
  if (webhook) await postWebhook(ctx, webhook, options.format, message)
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
  icon: 'notify',
  secrets: ['NOTIFY_WEBHOOK_URL', 'NOTIFY_PROJECT_WEBHOOKS'],
  requiredSecrets: [],
  config: settings,
  async settingsSummary(ctx) {
    const conf = settings.parse(ctx.config)
    if (conf.projects && ctx.visibleProducts?.length !== 1) {
      const urls = projectWebhooks(ctx)
      const visible = ctx.visibleProducts
      const count = Object.entries(conf.projects).filter(
        ([id, value]) =>
          (!visible || visible.includes(id)) &&
          (value.email || Object.hasOwn(urls, id)),
      ).length
      return '通知先を設定したプロジェクト：' + count + '件'
    }
    const target = deliveryTarget(ctx, conf, ctx.visibleProducts?.[0] ?? '')
    const destinations = [
      ...(target?.options.email ? [target?.options.email] : []),
      ...(target?.webhook
        ? [
            (target.options.format === 'discord' ? 'Discord' : 'Slack') +
              '（' +
              (target.options.webhookLabel ??
                'チャンネルは接続先の Webhook 設定で確認') +
              '）',
          ]
        : []),
    ]
    return destinations.length
      ? '通知先：' + destinations.join('、')
      : '通知先は未設定です。配信するには通知先を設定してください。'
  },
  permissions: ['external_fetch', 'read_body', 'send'],
  subscribers: [
    { kind: 'message_received', run: notifyEvent },
    { kind: 'assigned', run: notifyEvent },
  ],
}
