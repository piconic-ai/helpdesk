import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
const templates = z.record(
  z.string().trim().min(1).max(100),
  z.string().trim().min(1).max(4000),
)
const config = z
  .object({
    templates: templates.default({
      acknowledge: 'Hello {{name}}, thank you for contacting {{product}}.',
    }),
  })
  .strict()
const input = z.object({
  number: z.coerce.number().int().positive(),
  template: z.string().min(1),
})
export const canned = {
  id: 'canned',
  permissions: [],
  config,
  operations: [
    {
      name: 'apply',
      description: 'Create a draft using a saved reply template.',
      permission: 'draft',
      input,
      output: z.object({ id: z.string() }),
      async run(ctx, value) {
        const { number, template } = input.parse(value)
        const { templates } = config.parse(ctx.config)
        if (!Object.hasOwn(templates, template))
          throw new Error('Unknown reply template')
        const contact = await ctx.contact(number)
        const body = templates[template].replace(
          /\{\{(name|product)\}\}/g,
          (_, field) => (field === 'name' ? contact.name : contact.productName),
        )
        return ctx.draft(number, body)
      },
    },
  ],
  panels: [
    {
      slot: 'conversation',
      title: 'Saved replies',
      operations: ['apply'],
      async choices(ctx) {
        return { template: Object.keys(config.parse(ctx.config).templates) }
      },
    },
  ],
} satisfies Extension
