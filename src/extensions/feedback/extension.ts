import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
const numberInput = z.object({ number: z.coerce.number().int().positive() })
const submission = z.object({
  email: z
    .union([z.email(), z.literal('').transform(() => undefined)])
    .optional(),
  name: z.string().min(1).max(200).optional(),
  body: z.string().trim().min(1).max(100000),
})
export const feedback: Extension = {
  id: 'feedback',
  icon: 'feedback',
  permissions: [],
  config: z.object({}).strict(),
  intakes: [
    {
      path: 'submit',
      async run(ctx, product, input) {
        const data = submission.parse(input)
        const receipt = await ctx.open({
          ...data,
          subject: data.body.slice(0, 96),
          product,
          origin: 'form',
          kind: 'feedback',
        })
        return { ...receipt, acknowledgement: 'Feedback received.' }
      },
    },
  ],
  operations: [
    {
      name: 'unreview',
      description: 'Mark feedback as unreviewed',
      humanOnly: true,
      permission: 'write',
      input: numberInput,
      output: numberInput,
      run: (ctx, input) =>
        ctx.unreviewFeedback(numberInput.parse(input).number),
    },
    {
      name: 'review',
      description: 'Mark feedback as reviewed',
      humanOnly: true,
      permission: 'write',
      input: numberInput,
      output: numberInput,
      run: (ctx, input) => ctx.reviewFeedback(numberInput.parse(input).number),
    },
    {
      name: 'convert',
      description: 'Convert feedback to an inquiry',
      humanOnly: true,
      permission: 'write',
      input: numberInput,
      output: numberInput,
      run: (ctx, input) => ctx.convertFeedback(numberInput.parse(input).number),
    },
  ],
  panels: [
    {
      slot: 'conversation',
      title: 'Feedback',
      operations: ['review', 'convert'],
    },
  ],
}
