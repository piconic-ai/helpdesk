import { z } from 'zod'
import type { composeReply } from './compose'

export type EmailPayload = ReturnType<typeof composeReply>
export type EmailBinding = { send(message: EmailPayload): Promise<unknown> }
export type SendResult =
  | { kind: 'accepted'; providerId: string }
  | { kind: 'rejected'; reason: string }
  | { kind: 'unknown'; reason: string }

const responseSchema = z.object({ messageId: z.string().min(1) })
const providerError = z.object({ code: z.string().regex(/^E_[A-Z_]+$/) })
export async function sendReply(
  binding: EmailBinding,
  message: EmailPayload,
): Promise<SendResult> {
  try {
    const result = await binding.send(message)
    const parsed = responseSchema.safeParse(result)
    if (!parsed.success)
      return { kind: 'unknown', reason: 'Email Service returned no message ID' }
    return { kind: 'accepted', providerId: parsed.data.messageId }
  } catch (error) {
    const parsed = providerError.safeParse(error)
    if (parsed.success && parsed.data.code !== 'E_INTERNAL_SERVER_ERROR')
      return { kind: 'rejected', reason: parsed.data.code }
    return { kind: 'unknown', reason: 'Email Service delivery outcome unknown' }
  }
}
