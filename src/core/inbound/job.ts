import { z } from 'zod'
import { addressSchema, instantSchema } from '../conversations/state'

export const inboundJob = z.object({
  kind: z.literal('inbound'),
  rawKey: z.string().regex(/^raw\/[a-f0-9-]{36}$/),
  from: z.string(),
  to: addressSchema,
  receivedAt: instantSchema,
})
export type InboundJob = z.infer<typeof inboundJob>
