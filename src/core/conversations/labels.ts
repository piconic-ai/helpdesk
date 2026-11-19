import { z } from 'zod'
export const labelName = z.string().trim().min(1).max(20)
const existing = z.string().min(1).max(200)
const count = z.coerce.number().int().nonnegative()
export const labelEdit = z
  .discriminatedUnion('action', [
    z.object({
      action: z.literal('color'),
      label: existing,
      color: z.coerce.number().int().min(0).max(7),
    }),
    z.object({ action: z.literal('add'), name: labelName }),
    z.object({ action: z.literal('rename'), label: existing, name: labelName }),
    z.object({ action: z.literal('delete'), label: existing, count }),
    z.object({
      action: z.literal('merge'),
      label: existing,
      target: existing,
      count,
    }),
  ])
  .refine((edit) => edit.action !== 'merge' || edit.target !== edit.label)
export type LabelEdit = z.infer<typeof labelEdit>
