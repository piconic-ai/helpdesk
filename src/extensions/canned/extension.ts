import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { savedTemplates, templateConfig } from './templates'
const input = z.object({
  number: z.coerce.number().int().positive(),
  template: z.string().min(1),
})
function fillTemplate(
  body: string,
  contact: { name: string; productName: string },
) {
  return body.replace(/\{\{(name|product)\}\}/g, (_, field) =>
    field === 'name' ? contact.name : contact.productName,
  )
}
export const canned = {
  id: 'canned',
  icon: 'canned',
  permissions: [],
  config: templateConfig,
  operations: [
    {
      name: 'apply',
      description: 'Create a draft using a saved reply template.',
      permission: 'draft',
      input,
      output: z.object({ id: z.string() }),
      async run(ctx, value) {
        const { number, template } = input.parse(value)
        const item = (await savedTemplates(ctx)).get(template)
        if (!item) throw new Error('Unknown reply template')
        const contact = await ctx.contact(number)
        const body = fillTemplate(item.body, contact)
        return ctx.draft(number, body)
      },
    },
  ],
  panels: [
    {
      slot: 'conversation',
      title: 'Saved replies',
      operations: ['apply'],
      async choiceLabels(ctx, number) {
        const contact = number ? await ctx.contact(number) : undefined
        return {
          template: Object.fromEntries(
            [...(await savedTemplates(ctx))].map(([id, item]) => [
              id,
              {
                label: item.name,
                description: contact
                  ? fillTemplate(item.body, contact)
                  : item.body,
              },
            ]),
          ),
        }
      },
      async choices(ctx) {
        return { template: [...(await savedTemplates(ctx)).keys()] }
      },
    },
  ],
} satisfies Extension
