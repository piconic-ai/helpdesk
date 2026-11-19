import { z } from 'zod'

export const widgetPosition = z.enum(['bottom-right', 'bottom-left'])
export const widgetLabel = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[^\p{Cc}\u2028\u2029]+$/u)
export const chatWidgetSchema = z.object({
  position: widgetPosition,
  label: widgetLabel,
  introduction: z.string().trim().max(500),
})
export type ChatWidget = z.infer<typeof chatWidgetSchema>
export const defaultChatWidget: ChatWidget = {
  position: 'bottom-right',
  label: 'ヘルプ',
  introduction: '',
}
