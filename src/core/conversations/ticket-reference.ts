import { z } from 'zod'

export const ticketPrefixSchema = z
  .string()
  .regex(/^[A-Z]{2,5}$/)
  .brand<'TicketPrefix'>()

export type TicketPrefix = z.infer<typeof ticketPrefixSchema>

export function ticketReference(prefix: TicketPrefix, number: number) {
  return prefix + '-' + number
}

export const ticketSubjectTag = /\[(?:#|[A-Z]{2,5}-)([1-9]\d*)\]/

export function displayReference(
  frame: { products: { id: string; ticketPrefix: TicketPrefix }[] },
  conversation: { product: string; number: number },
) {
  const product = frame.products.find(
    (item) => item.id === conversation.product,
  )
  if (!product)
    throw new Error('Missing project for conversation ' + conversation.number)
  return ticketReference(product.ticketPrefix, conversation.number)
}
