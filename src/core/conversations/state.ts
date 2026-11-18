import { z } from 'zod'

export const addressSchema = z
  .string()
  .trim()
  .email()
  .toLowerCase()
  .brand<'Address'>()
export const numberSchema = z
  .number()
  .int()
  .positive()
  .brand<'ConversationNumber'>()
export const instantSchema = z.number().int().nonnegative().brand<'Instant'>()
export const operatorIdSchema = z.string().min(1).brand<'OperatorId'>()
const productSchema = z.string().min(1).brand<'ProductId'>()
const agentSchema = z.string().min(1).brand<'AgentId'>()
const extensionSchema = z.string().min(1).brand<'ExtensionId'>()
const policySchema = z.string().min(1).brand<'PolicyId'>()
const rawKeySchema = z.string().min(1).brand<'RawKey'>()
export const actorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('operator'), id: operatorIdSchema }),
  z.object({
    kind: z.literal('agent'),
    id: agentSchema,
    onBehalfOf: operatorIdSchema,
  }),
  z.object({ kind: z.literal('extension'), id: extensionSchema }),
  z.object({ kind: z.literal('system') }),
])
export const approvalSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('operator'), by: operatorIdSchema }),
  z.object({
    kind: z.literal('standing'),
    policy: policySchema,
    enabledBy: operatorIdSchema,
  }),
])
export const inquiryStatusSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('open') }),
  z.object({ kind: z.literal('pending') }),
  z.object({ kind: z.literal('closed'), closedAt: instantSchema }),
  z.object({ kind: z.literal('spam') }),
])
export const feedbackStatusSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('received') }),
  z.object({ kind: z.literal('reviewed'), by: operatorIdSchema }),
  z.object({ kind: z.literal('spam') }),
])
const assignmentSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('unassigned') }),
  z.object({ kind: z.literal('assigned'), to: operatorIdSchema }),
])
const commonSchema = z.object({
  number: numberSchema,
  product: productSchema,
  mailbox: addressSchema,
  contact: addressSchema,
  origin: z.enum(['email', 'form', 'chat']),
})
export const conversationSchema = z.discriminatedUnion('kind', [
  commonSchema.extend({
    kind: z.literal('inquiry'),
    status: inquiryStatusSchema,
    assignment: assignmentSchema,
  }),
  commonSchema.extend({
    kind: z.literal('feedback'),
    status: feedbackStatusSchema,
  }),
])
export const deliverySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('draft') }),
  z.object({ kind: z.literal('awaiting_approval') }),
  z.object({ kind: z.literal('queued'), approval: approvalSchema }),
  z.object({
    kind: z.literal('sent'),
    approval: approvalSchema,
    sentAt: instantSchema,
    providerId: z.string().min(1),
  }),
  z.object({
    kind: z.literal('failed'),
    approval: approvalSchema,
    reason: z.string().min(1),
  }),
])
export const messageSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('inbound'),
    from: addressSchema,
    receivedAt: instantSchema,
    raw: rawKeySchema,
  }),
  z.object({ kind: z.literal('note'), author: actorSchema, body: z.string() }),
  z.object({
    kind: z.literal('outbound'),
    author: actorSchema,
    body: z.string(),
    delivery: deliverySchema,
  }),
])
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>
export type Instant = z.infer<typeof instantSchema>
export type Actor = z.infer<typeof actorSchema>
export type Conversation = z.infer<typeof conversationSchema>
export type Message = z.infer<typeof messageSchema>
export type Delivery = z.infer<typeof deliverySchema>
export type Approval = z.infer<typeof approvalSchema>
