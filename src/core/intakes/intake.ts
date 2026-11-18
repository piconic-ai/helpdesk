import { z } from 'zod'
import { addressSchema } from '../conversations/state'

export const submissionSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    email: addressSchema,
    subject: z.string().trim().min(1).max(500),
    body: z
      .string()
      .min(1)
      .max(100000)
      .refine((v) => v.trim().length > 0),
  })
  .strict()
export const intakeSchema = submissionSchema.extend({
  product: z.string().min(1),
  origin: z.enum(['form', 'chat']),
  kind: z.enum(['inquiry', 'feedback']).default('inquiry'),
})
const exactOrigin = z
  .url({ protocol: /^https?$/ })
  .refine(
    (v) => new URL(v).origin === v,
    'Expected a complete origin without a path',
  )
export const intakePolicySchema = z.object({
  publicKey: z.string().min(1),
  origins: z.array(exactOrigin).min(1),
  limitPerMinute: z.int().min(1).max(10000).default(10),
  turnstileSecretBinding: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]*$/)
    .optional(),
})
export type IntakePolicy = z.output<typeof intakePolicySchema>
export type Intake = z.output<typeof intakeSchema>
