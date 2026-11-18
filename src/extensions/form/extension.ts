import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { submissionSchema } from '../../core/intakes/intake'

export const form = {
  id: 'form',
  permissions: [],
  config: z.object({}).strict(),
  intakes: [
    {
      path: 'submit',
      async run(ctx, product, input) {
        return ctx.open({
          ...submissionSchema.parse(input),
          product,
          origin: 'form',
        })
      },
    },
  ],
} satisfies Extension
