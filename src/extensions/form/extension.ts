import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { submissionSchema } from '../../core/intakes/intake'

const formInput = submissionSchema.extend({
  submissionId: z.uuid().optional(),
  suggestionIds: z.array(z.uuid()).optional(),
})

export const form = {
  id: 'form',
  icon: 'form',
  permissions: [],
  config: z.object({}).strict(),
  intakes: [
    {
      path: 'submit',
      async run(ctx, product, input) {
        return ctx.open({
          ...formInput.parse(input),
          product,
          origin: 'form',
        })
      },
    },
  ],
} satisfies Extension
