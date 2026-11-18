import { z } from 'zod'
import type { Extension } from '../../core/extensions/extension'
import {
  configSchema,
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
} from './issues-usecase'

const withUrl = linked.extend({ url: z.url() })
export const issues: Extension = {
  id: 'issues',
  permissions: ['external_fetch'],
  config: configSchema,
  operations: [
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
      operations: ['preview', 'create', 'link'],
      links: panelLinks,
    },
  ],
  subscribers: [{ kind: 'scheduled', run: pollIssues }],
}
