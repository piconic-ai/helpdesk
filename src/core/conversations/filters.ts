import { z } from 'zod'
export const filterSchema = z.object({
  status: z
    .enum(['open', 'pending', 'closed', 'spam', 'received', 'reviewed', 'all'])
    .default('open'),
  product: z.string().default(''),
  assignee: z.string().default(''),
  label: z.string().default(''),
  query: z.string().default(''),
})
