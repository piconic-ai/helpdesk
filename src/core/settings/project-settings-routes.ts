import { Hono, type Context as HttpContext } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../operators/middleware'
import {
  projectMembers,
  searchProjectOperators,
  saveProjectMember,
  removeProjectMember,
} from '../operators/project-members-usecase'
import { context } from '../operations/operations-routes'
import { can } from '../operators/project-access'
import { PermissionDenied } from '../operations/catalog'
import { coreOperations } from '../operations/catalog-usecase'
import { consoleFrame } from '../conversations/console-usecase'
import { shell } from '../conversations/console-page'
import { mailboxPage, settingsNotice } from '../conversations/settings-page'
import { listTokens } from '../operators/tokens-usecase'
import { diagnose } from './doctor-usecase'
import {
  deleteProject,
  settingsProjects,
  requireSettings,
  settingsOperators,
  projectSettingValues,
  changeLifecycle,
  projectLabelCopy,
  prefixSuggestion,
} from './project-settings-usecase'
import {
  mailboxInput,
  changeLabel,
  changeTicketPrefix,
  settingsContacts,
  settingsLabels,
  sendingDomains,
} from './console-settings-usecase'
import {
  projectHome,
  settingsHome,
  projectPicker,
  globalSettings,
  projectsDirectory,
  projectOperators,
} from './projects-page'
import { projectPath } from './project-setting-links'
import { projectExtensionPage } from './project-extension-page'
import { saveProjectExtension } from '../extensions/project-extensions-usecase'
import { membersPage } from './project-members-page'
import { dataSectionPage, projectLabelsPage } from './project-section-page'
import { projectTerm } from './project-term'

type Request = HttpContext<AppEnv>
const sectionSchema = z.enum(['labels', 'retention', 'deletion'])
const memberSchema = z.object({
  email: z.email().toLowerCase(),
  role: z.enum(['admin', 'agent']),
})
const app = new Hono<AppEnv>()
function frame(c: Request, project?: string) {
  return consoleFrame(c.env, c.get('operator'), c.req.path, {
    ...c.req.query(),
    ...(project ? { product: project } : {}),
  })
}
app.get('/settings', async (c) => {
  const ctx = context(c)
  const projects = await settingsProjects(ctx)
  const global = can(ctx.operator, 'global').allowed
  if (!global && !projects.length)
    throw new PermissionDenied('Permission denied')
  const issues = global ? (await diagnose(c.env)).issues : []
  return c.render(settingsHome(await frame(c), projects, issues))
})
app.get('/settings/global', async (c) => {
  const ctx = context(c)
  requireSettings(ctx)
  const [state, projects, operators, tokens] = await Promise.all([
    frame(c),
    settingsProjects(ctx),
    settingsOperators(ctx),
    listTokens(c.env, ctx.operator.email),
  ])
  return c.render(
    globalSettings(state, projects, operators.length, tokens.length),
  )
})
app.get('/settings/projects', async (c) => {
  const ctx = context(c)
  const projects = await settingsProjects(ctx)
  if (c.req.query('product')) {
    const chosen = projects.find((p) => p.id === c.req.query('product'))
    if (!chosen) return c.notFound()
    return c.redirect(projectPath(chosen.id), 302)
  }
  return c.render(projectPicker(await frame(c), projects))
})
app.get('/settings/projects/:product', async (c) => {
  const product = c.req.param('product')
  const data = await projectSettingValues(context(c), product)
  if (!data) return c.notFound()
  return c.render(projectHome(await frame(c, product), data.project))
})
app.get('/settings/projects/:product/extensions', async (c) => {
  const product = c.req.param('product')
  const data = await projectSettingValues(context(c), product)
  if (!data) return c.notFound()
  return c.render(
    projectExtensionPage(
      await frame(c, product),
      data.project,
      c.env.EXTENSIONS?.all.filter((item) => item.enabled) ?? [],
    ),
  )
})
app.post('/settings/projects/:product/extensions/:extension', async (c) => {
  const product = c.req.param('product')
  const enabled = z.enum(['yes', 'no']).parse((await c.req.parseBody()).enabled)
  if (
    !(await saveProjectExtension(
      context(c),
      product,
      c.req.param('extension'),
      enabled === 'yes',
    ))
  )
    return c.notFound()
  return c.redirect(projectPath(product, 'extensions') + '?saved=yes', 303)
})
app.get('/settings/operators', async (c) => {
  const operators = await settingsOperators(context(c))
  if (
    c.req.query('edit') &&
    !operators.some((o) => o.email === c.req.query('edit'))
  )
    return c.notFound()
  return c.render(projectOperators(await frame(c), operators))
})
app.get('/settings/projects/:product/members', async (c) => {
  const ctx = context(c),
    product = c.req.param('product')
  const data = await projectSettingValues(ctx, product)
  if (!data) return c.notFound()
  const query = c.req.query('q')?.trim()
  const [members, candidates, state] = await Promise.all([
    projectMembers(ctx, product),
    query ? searchProjectOperators(ctx, product, query) : [],
    frame(c, product),
  ])
  return c.render(membersPage(state, data.project, members, candidates))
})
app.post('/settings/projects/:product/members', async (c) => {
  const product = c.req.param('product')
  await saveProjectMember(context(c), {
    product,
    ...memberSchema.parse(await c.req.parseBody()),
  })
  return c.redirect(projectPath(product, 'members') + '?saved=yes', 303)
})
app.post('/settings/projects/:product/members/remove', async (c) => {
  const product = c.req.param('product')
  const form = z
    .object({
      email: z.email().toLowerCase(),
      assigned: z.coerce.number().int().nonnegative(),
    })
    .parse(await c.req.parseBody())
  await removeProjectMember(context(c), {
    product,
    email: form.email,
    expectedAssigned: form.assigned,
  })
  return c.redirect(projectPath(product, 'members') + '?saved=yes', 303)
})
app.post('/settings/projects/:product/delete', async (c) => {
  const review = z
    .object({
      name: z.string().min(1),
      conversations: z.coerce.number().int().nonnegative(),
    })
    .parse(await c.req.parseBody())
  await deleteProject(context(c), {
    ...review,
    product: c.req.param('product'),
  })
  return c.redirect('/settings/mailboxes?saved=deleted', 303)
})
app.post('/settings/projects/:product/archive', async (c) => {
  const product = c.req.param('product')
  const state = z
    .enum(['archived', 'active'])
    .parse((await c.req.parseBody()).state)
  await changeLifecycle(context(c), product, {
    kind: 'archive',
    archived: state === 'archived',
  })
  return c.redirect(projectPath(product) + '?saved=yes', 303)
})
app.post('/settings/projects/:product/publication', async (c) => {
  const product = c.req.param('product')
  await changeLifecycle(context(c), product, {
    kind: 'publish',
    published: (await c.req.parseBody()).published === 'on',
  })
  return c.redirect(projectPath(product) + '?saved=yes', 303)
})
app.get('/settings/mailboxes', async (c) => {
  const ctx = context(c)
  const edit = c.req.query('edit')
  if (edit) return mailboxEditor(c, edit)
  requireSettings(ctx)
  const state = await frame(c)
  if (c.req.query('new') === 'yes')
    return c.render(
      shell(
        '新しい' + projectTerm + 'と窓口',
        mailboxPage(
          { mailboxes: [], retentionDays: 0 },
          sendingDomains(c.env.SENDING_DOMAINS),
          state,
          false,
        ),
        state,
      ),
    )
  return c.render(projectsDirectory(state, await settingsProjects(ctx)))
})
async function mailboxEditor(
  c: Request,
  product: string,
  error?: { input: string; message: string },
) {
  const data = await projectSettingValues(context(c), product)
  if (!data) return c.notFound()
  const state = await frame(c, product)
  state.query.edit = product
  return c.render(
    shell(
      data.project.name,
      mailboxPage(
        data,
        sendingDomains(c.env.SENDING_DOMAINS),
        state,
        settingsNotice('mailboxes', c.req.query('saved')),
        error,
      ),
      state,
    ),
  )
}
app.post('/settings/mailboxes', async (c) => {
  const ctx = context(c),
    form = await c.req.parseBody()
  const existing = z.string().min(1).optional().parse(form.product)
  requireSettings(ctx, existing)
  const mailboxes = existing
    ? (await projectSettingValues(ctx, existing))?.mailboxes
    : []
  if (!mailboxes) return c.notFound()
  const input = mailboxInput(ctx, form, mailboxes)
  await coreOperations.mailbox.execute(ctx, input)
  return c.redirect(
    '/settings/mailboxes?edit=' +
      encodeURIComponent(input.product) +
      '&saved=yes',
    303,
  )
})
app.post('/settings/ticket-prefix/:product', async (c) => {
  const ctx = context(c),
    product = c.req.param('product')
  requireSettings(ctx, product)
  const { prefix } = await c.req.parseBody()
  const result = await changeTicketPrefix(ctx, product, prefix)
  if (result === 'missing') return c.notFound()
  if (result === 'saved')
    return c.redirect(
      '/settings/mailboxes?edit=' +
        encodeURIComponent(product) +
        '&saved=prefix',
      303,
    )
  c.status(result === 'duplicate' ? 409 : 400)
  const suggestion =
    result === 'duplicate' ? await prefixSuggestion(ctx, prefix) : null
  return mailboxEditor(c, product, {
    input: String(prefix ?? '').slice(0, 5),
    message:
      result === 'duplicate'
        ? 'この接頭辞はすでに使用されています。' +
          (suggestion ? ' 利用できる候補：' + suggestion : '')
        : '問い合わせ番号の接頭辞は英大文字2〜5字で入力してください。',
  })
})
async function section(
  c: Request,
  product: string,
  section: z.infer<typeof sectionSchema>,
) {
  const ctx = context(c)
  const data = await projectSettingValues(ctx, product)
  if (!data) return c.notFound()
  const state = await frame(c, product)
  if (section === 'labels')
    return c.render(
      projectLabelsPage(
        state,
        data.project,
        await settingsLabels(ctx, product),
        state.labelColors,
      ),
    )
  return c.render(
    dataSectionPage(
      state,
      data,
      section,
      section === 'deletion' ? await settingsContacts(ctx, product) : [],
    ),
  )
}
app.get(
  '/settings/projects/:product/:section{labels|retention|deletion}',
  (c) =>
    section(
      c,
      c.req.param('product'),
      sectionSchema.parse(c.req.param('section')),
    ),
)
app.get('/settings/:section{labels|retention|deletion}', async (c) => {
  const ctx = context(c)
  const projects = await settingsProjects(ctx)
  const target = c.req.query('product') ?? projects.find((p) => !p.archived)?.id
  if (!target) {
    requireSettings(ctx)
    return c.redirect('/settings/projects', 302)
  }
  return section(c, target, sectionSchema.parse(c.req.param('section')))
})
app.post('/settings/projects/:product/labels', async (c) => {
  const product = c.req.param('product')
  const ctx = context(c)
  requireSettings(ctx, product)
  await changeLabel(ctx, product, await c.req.parseBody())
  return c.req.header('Accept') === 'application/json'
    ? c.json({ saved: true })
    : c.redirect(projectPath(product, 'labels') + '?saved=yes', 303)
})
app.post('/settings/projects/:product/labels/copy', async (c) => {
  const product = c.req.param('product')
  await projectLabelCopy(
    context(c),
    z
      .string()
      .min(1)
      .parse((await c.req.parseBody()).product),
    product,
  )
  return c.redirect(projectPath(product, 'labels') + '?saved=yes', 303)
})
export { app as projectSettingsRoutes }
