import { z } from 'zod'
import { addressSchema } from '../conversations/state'

export function keyedDraftId(number: number, key: string) {
  return (
    'draft/' + JSON.stringify([number, z.string().min(1).max(1024).parse(key)])
  )
}

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
const intakeFields = submissionSchema.extend({
  product: z.string().min(1),
  origin: z.enum(['form', 'chat']),
})
export const intakeSchema = z.union([
  intakeFields.extend({ kind: z.literal('inquiry').default('inquiry') }),
  intakeFields.extend({
    kind: z.literal('feedback'),
    email: addressSchema.optional(),
  }),
])
export const exactOrigin = z
  .url({ protocol: /^https?$/ })
  .refine(
    (v) =>
      URL.canParse(v) &&
      new URL(v).origin === v &&
      /^https?:\/\/(?:[a-z0-9.-]+|\[[0-9a-f:]+\])(?::[0-9]+)?$/i.test(v),
    'Expected a complete origin without a path',
  )
export const intakePolicySchema = z.object({
  publicKey: z.string().min(1),
  origins: z.array(exactOrigin).min(1),
  limitPerMinute: z.int().min(1).max(10000).default(10),
  turnstileSiteKey: z.string().min(1).optional(),
  turnstileSecretBinding: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]*$/)
    .optional(),
})
export type IntakePolicy = z.output<typeof intakePolicySchema>
export type Intake = z.output<typeof intakeSchema>
