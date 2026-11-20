import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import { fillTemplate, savedTemplates, templateConfig } from './templates'
const input = z.object({
  number: z.coerce.number().int().positive(),
  template: z.string().min(1),
})
export const canned = {
  id: 'canned',
  icon: 'canned',
  permissions: ['read_body', 'external_fetch'],
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
        const contact = await ctx.contact(number)
        const item = (await savedTemplates(ctx, contact.product)).get(template)
        if (!item) throw new Error('Unknown reply template')
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
            [...(await savedTemplates(ctx, contact?.product))].map(
              ([id, item]) => [
                id,
                {
                  label: item.name,
                  description: contact
                    ? fillTemplate(item.body, contact)
                    : item.body,
                },
              ],
            ),
          ),
        }
      },
      async choices(ctx, number) {
        const contact = number ? await ctx.contact(number) : undefined
        return {
          template: [...(await savedTemplates(ctx, contact?.product)).keys()],
        }
      },
    },
  ],
} satisfies Extension
