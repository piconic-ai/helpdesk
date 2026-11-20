import { afterAll, beforeAll, expect, it } from 'vitest'
import {
  permissionCases,
  actions,
} from '../src/core/operators/project-access.examples'
import { applyMigrations, testPlatform } from './platform'
import { registerOperator } from '../src/core/operators/operators-store'
import { can, visibleProductIds } from '../src/core/operators/project-access'
import {
  projectMembers,
  searchProjectOperators,
  saveProjectMember,
  removeProjectMember,
} from '../src/core/operators/project-members-usecase'
import {
  issueToken,
  listTokens,
  machineIdentity,
} from '../src/core/operators/tokens-usecase'
import type { Bindings } from '../src/core/settings/bindings'
import type { Context } from '../src/core/operations/catalog-usecase'

it.each(permissionCases)(
  'checks all actions for global %s, project %s, member %s',
  (role, projectRole, member, answers) => {
    const actor: Parameters<typeof can>[0] = {
      role,
      memberships: member ? { slide: projectRole } : {},
    }
    const answersAndReasons = actions.map((a) => can(actor, a, 'slide'))
    expect(answersAndReasons.map((d) => d.allowed)).toEqual(answers)
    expect(answersAndReasons.every((d) => d.reason.length > 0)).toBe(true)
  },
)
it('denies an unscoped project action, inherited property names and global operations on scoped admin tokens', () => {
  const actor = { role: 'agent' as const, memberships: {} }
  expect(can(actor, 'manage', 'constructor').allowed).toBe(false)
  expect(can(actor, 'read').allowed).toBe(false)
  expect(
    can({ role: 'admin', tokenProducts: ['desk'] }, 'global').allowed,
  ).toBe(false)
})

const admin = 'owner@example.com'
const agent = 'staff@example.com'
const invited = 'guest@example.com'
let p: Awaited<ReturnType<typeof testPlatform>>
let env: Bindings
let owner: Context
async function ctx(email: string): Promise<Context> {
  return {
    env,
    operator: await registerOperator(p.DB, email),
    actor: { kind: 'operator', id: email },
    now: 10,
    uuid: () => crypto.randomUUID(),
  }
}
beforeAll(async () => {
  p = await testPlatform((f) => !f.startsWith('0028'))
  const db = p.DB
  await db.batch([
    db
      .prepare("INSERT INTO operators VALUES(?, 'admin'),(?, 'agent')")
      .bind(admin, agent),
    db.prepare("INSERT INTO products VALUES('slide','Slide'),('desk','Desk')"),
    db.prepare(
      "INSERT INTO hosted_intakes(product,origin,public_key) VALUES('slide','https://site.example.com','key')",
    ),
    db.prepare("INSERT INTO mailboxes VALUES('slide@example.com','slide')"),
  ])
  await applyMigrations(db, (f) => f.startsWith('0028'))
  env = { ...p, AI: undefined, ENVIRONMENT: 'local' }
  owner = await ctx(admin)
  await p.DB.prepare("INSERT INTO products VALUES('new','New')").run()
})
afterAll(() => p?.dispose())

it('preserves existing staff assignments, global admins and previously published projects on upgrade', async () => {
  expect((await ctx(agent)).operator.memberships).toEqual({
    slide: 'agent',
    desk: 'agent',
  })
  expect(owner.operator.memberships).toEqual({ slide: 'admin', desk: 'admin' })
  expect(visibleProductIds(owner.operator)).toBe(null)
  expect(
    (
      await p.DB.prepare(
        'SELECT product,public_help FROM product_lifecycle ORDER BY product',
      ).all()
    ).results,
  ).toEqual([
    { product: 'desk', public_help: 0 },
    { product: 'new', public_help: 0 },
    { product: 'slide', public_help: 1 },
  ])
  expect((await ctx(admin)).operator.memberships?.new).toBe('admin')
  expect((await ctx(agent)).operator.memberships?.new).toBeUndefined()
})
it('accepts a project invitation on first login, audits membership transitions, counts and releases assignments', async () => {
  const member = { product: 'slide', email: invited }
  await saveProjectMember(owner, { ...member, role: 'agent' })
  expect(await projectMembers(owner, 'slide')).toContainEqual(
    expect.objectContaining({ email: invited, invited: true, assigned: 0 }),
  )
  const guest = await ctx(invited)
  expect(visibleProductIds(guest.operator)).toEqual(['slide'])
  expect(await projectMembers(owner, 'slide')).toContainEqual(
    expect.objectContaining({ email: invited, invited: false, assigned: 0 }),
  )
  await expect(
    saveProjectMember(guest, { product: 'desk', email: agent, role: 'admin' }),
  ).rejects.toThrow('Permission denied')
  await expect(projectMembers(guest, 'slide')).rejects.toThrow(
    'Permission denied',
  )
  expect(await searchProjectOperators(owner, 'desk', 'guest')).toContainEqual(
    expect.objectContaining({ email: invited }),
  )
  await saveProjectMember(owner, { ...member, role: 'admin' })
  await saveProjectMember(owner, { ...member, role: 'admin' })
  await p.DB.prepare(
    "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at,assignee) VALUES('slide','slide@example.com','r@example.com','A','open',1,?)",
  )
    .bind(invited)
    .run()
  expect(await projectMembers(await ctx(invited), 'slide')).toContainEqual(
    expect.objectContaining({ email: invited, assigned: 1, role: 'admin' }),
  )
  await expect(
    removeProjectMember(owner, { ...member, expectedAssigned: 0 }),
  ).rejects.toThrow()
  await removeProjectMember(owner, { ...member, expectedAssigned: 1 })
  expect(
    await p.DB.prepare(
      "SELECT assignee FROM conversations WHERE subject='A'",
    ).first('assignee'),
  ).toBe(null)
  expect(visibleProductIds((await ctx(invited)).operator)).toEqual([])
  await expect(
    p.DB.prepare('UPDATE conversations SET assignee=?').bind(invited).run(),
  ).rejects.toThrow()
  const changes = await p.DB.prepare(
    "SELECT kind FROM events WHERE json_extract(payload,'$.email')=? ORDER BY id",
  )
    .bind(invited)
    .all()
  expect(changes.results.map((r) => r.kind)).toEqual([
    'project_member_invited',
    'project_member_added',
    'project_member_role_changed',
    'project_member_removed',
  ])
  await saveProjectMember(owner, {
    product: 'desk',
    email: invited,
    role: 'agent',
  })
  expect((await ctx(invited)).operator.memberships).toEqual({ desk: 'agent' })
})
it('keeps the final administrator, including when an admin invitation is pending', async () => {
  const member = { product: 'new', email: admin }
  await saveProjectMember(owner, {
    product: 'new',
    email: 'pending@example.com',
    role: 'admin',
  })
  await expect(removeProjectMember(owner, member)).rejects.toThrow()
  await expect(
    saveProjectMember(owner, { ...member, role: 'agent' }),
  ).rejects.toThrow()
  await expect(
    p.DB.prepare("UPDATE operators SET role='agent' WHERE email=?")
      .bind(admin)
      .run(),
  ).rejects.toThrow()
  await removeProjectMember(owner, {
    product: 'new',
    email: 'pending@example.com',
  })
  expect(await projectMembers(owner, 'new')).toHaveLength(1)
})
it('restricts token issuance and recomputes its intersection with the owner memberships on every authentication', async () => {
  const request = { label: 'desk reader', access: 'read', products: ['desk'] }
  await expect(
    issueToken(env, agent, { ...request, products: ['new'] }, 10),
  ).rejects.toThrow('Project scope')
  const token = await issueToken(env, agent, request, 11)
  expect(await listTokens(env, agent)).toContainEqual(
    expect.objectContaining(request),
  )
  const identity = async () =>
    (await machineIdentity(env, 'Bearer ' + token))?.ctx.operator
  expect(visibleProductIds((await identity())!)).toEqual(['desk'])
  await removeProjectMember(owner, { product: 'desk', email: agent })
  expect(visibleProductIds((await identity())!)).toEqual([])
  const adminToken = await issueToken(env, admin, request, 12)
  const machine = (await machineIdentity(env, 'Bearer ' + adminToken))!
  expect(visibleProductIds(machine.ctx.operator)).toEqual(['desk'])
  expect(can(machine.ctx.operator, 'global').allowed).toBe(false)
  await p.DB.prepare(
    "UPDATE product_lifecycle SET archived_at=20 WHERE product='desk'",
  ).run()
  await expect(issueToken(env, admin, request, 21)).rejects.toThrow(
    'Project scope',
  )
  const retained = await machineIdentity(env, 'Bearer ' + adminToken)
  expect(visibleProductIds(retained!.ctx.operator)).toEqual(['desk'])
})
it('rejects new conversations in an archived project at the write boundary', async () => {
  await p.DB.prepare(
    "UPDATE product_lifecycle SET archived_at=10 WHERE product='slide'",
  ).run()
  await expect(
    p.DB.prepare(
      "INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES('slide','slide@example.com','r@example.com','B','open',1)",
    ).run(),
  ).rejects.toThrow()
})
