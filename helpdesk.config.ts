import { form } from './src/extensions/form/extension'
import { canned } from './src/extensions/canned/extension'
import { issues } from './src/extensions/issues/extension-usecase'
import type { Registration } from './src/core/extensions/registry'
import type { IntakePolicy } from './src/core/intakes/intake'

export const extensions: Registration[] = [
  { extension: form, enabled: false, settings: {} },
  { extension: canned, enabled: false, settings: {} },
  {
    extension: issues,
    enabled: false,
    settings: {
      repositories: {},
      helpdeskOrigin: 'https://helpdesk.example.com',
    },
  },
]
export const publicIntakes: Record<string, IntakePolicy> = {}
