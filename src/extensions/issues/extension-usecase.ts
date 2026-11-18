import { draftIssueNotices } from './board-usecase'
import { impactOperation } from './impact-usecase'
import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import {
  configSchema,
  issueRef,
  previewInput,
  preview,
  confirmInput,
  linked,
  linkInput,
  lookupInput,
} from './issues'
import {
  previewIssue,
  createIssue,
  linkIssue,
  issueLinks,
  panelLinks,
  pollIssues,
  configuredRepository,
} from './issues-usecase'

const noticesInput = issueRef.extend({ product: z.string().min(1) })
const withUrl = linked.extend({ url: z.url() })
export const issues: Extension = {
  id: 'issues',
  async configurationGaps(ctx, products) {
    const missing = await Promise.all(
      products.map(async (p) =>
        (await configuredRepository(ctx, p.id))
          ? null
          : p.name + ' のリポジトリ',
      ),
    )
    return missing.filter((name): name is string => name !== null)
  },
  secrets: ['GITHUB_TOKEN'],
  permissions: ['external_fetch'],
  config: configSchema,
  operations: [
    impactOperation,
    {
      name: 'draftNotices',
      description:
        'Prepare unsent closure notices for a product and issue. Delivery requires operator approval.',
      permission: 'draft',
      input: noticesInput,
      output: z.object({ ready: z.int().nonnegative() }),
      async run(ctx, args) {
        const { repository, issue, product } = noticesInput.parse(args)
        return {
          ready: await draftIssueNotices(ctx, repository, issue, product),
        }
      },
    },
    {
      name: 'preview',
      description:
        'Preview the exact GitHub post. Enter a public summary without customer details.',
      permission: 'write',
      humanOnly: true,
      input: previewInput,
      output: preview,
      run: previewIssue,
    },
    {
      name: 'create',
      description:
        'Create the reviewed GitHub issue using the confirmation from the preview.',
      permission: 'write',
      humanOnly: true,
      input: confirmInput,
      output: withUrl,
      run: createIssue,
    },
    {
      name: 'link',
      description:
        'Link this existing GitHub issue and post a backlink containing only the inquiry number.',
      humanOnly: true,
      permission: 'write',
      input: linkInput,
      output: withUrl,
      run: linkIssue,
    },
    {
      name: 'links',
      description: 'List the conversations linked to a GitHub issue.',
      permission: 'read',
      input: lookupInput,
      output: linked.array(),
      run: issueLinks,
    },
  ],
  panels: [
    {
      slot: 'conversation',
      title: 'GitHub issues',
      operations: ['preview', 'create', 'link', 'impact'],
      async available(ctx, number) {
        return (
          !!number &&
          !!ctx.secret('GITHUB_TOKEN') &&
          !!(await configuredRepository(
            ctx,
            (await ctx.contact(number)).product,
          ))
        )
      },
      links: panelLinks,
    },
    {
      slot: 'conversation',
      title: 'GitHub issues',
      operations: [],
      async available(ctx, number) {
        return (
          !!number &&
          (!ctx.secret('GITHUB_TOKEN') ||
            !(await configuredRepository(
              ctx,
              (await ctx.contact(number)).product,
            )))
        )
      },
      async content(ctx, number) {
        const repo = await configuredRepository(
          ctx,
          (await ctx.contact(number!)).product,
        )
        const missing = [
          !repo && 'このプロダクトのリポジトリ',
          !ctx.secret('GITHUB_TOKEN') && 'GITHUB_TOKEN',
        ].filter(Boolean)
        return (
          '起票には ' +
          missing.join('、') +
          ' の設定が必要です。管理者が拡張の設定で確認できます。'
        )
      },
      async links(ctx, number) {
        return [
          ...(await panelLinks(ctx, number)),
          { href: '/extensions/issues', label: 'GitHub Issue の設定を開く' },
        ]
      },
    },
  ],
  subscribers: [{ kind: 'scheduled', run: pollIssues }],
}
