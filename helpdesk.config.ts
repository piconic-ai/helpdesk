import { presence } from './src/extensions/presence/extension'
import { rules } from './src/extensions/rules/extension'
import { merge } from './src/extensions/merge/extension'
import { snooze } from './src/extensions/snooze/extension'
import { exportExtension } from './src/extensions/export/extension'
import { survey } from './src/extensions/survey/extension-routes'
import { chat } from './src/extensions/chat/extension'
import { articles } from './src/extensions/articles/extension-routes'
import { feedback } from './src/extensions/feedback/extension'
import { metrics } from './src/extensions/metrics/extension'
import { autoAck } from './src/extensions/auto-ack/extension'
import { notify } from './src/extensions/notify/extension'
import { spam } from './src/extensions/spam/extension'
import { form } from './src/extensions/form/extension'
import { canned } from './src/extensions/canned/extension'
import { issues } from './src/extensions/issues/extension-usecase'
import type { Registration } from './src/core/extensions/registry'
import type { IntakePolicy } from './src/core/intakes/intake'

export const extensions: Registration[] = [
  { extension: spam, enabled: true, settings: {} },
  { extension: notify, enabled: true, settings: {} },
  { extension: autoAck, enabled: true, settings: {} },
  { extension: metrics, enabled: true, settings: {} },
  { extension: feedback, enabled: false, settings: {} },
  {
    extension: articles,
    enabled: false,
    settings: { helpdeskOrigin: 'https://helpdesk.example.com' },
  },
  { extension: chat, enabled: false, settings: {} },
  {
    extension: survey,
    enabled: false,
    settings: { helpdeskOrigin: 'https://helpdesk.example.com' },
  },
  { extension: exportExtension, enabled: false, settings: {} },
  { extension: snooze, enabled: false, settings: {} },
  { extension: merge, enabled: false, settings: {} },
  { extension: rules, enabled: false, settings: {} },
  { extension: presence, enabled: false, settings: {} },

  { extension: form, enabled: false, settings: {} },
  { extension: canned, enabled: false, settings: {} },
  {
    extension: issues,
    enabled: false,
    settings: {
      repositories: {},
    },
  },
]
export const publicIntakes: Record<string, IntakePolicy> = {}
