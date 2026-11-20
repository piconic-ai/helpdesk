export const actions = ['read', 'work', 'manage', 'global'] as const
export const permissionCases = [
  ['admin', 'admin', true, [true, true, true, true]],
  ['admin', 'admin', false, [true, true, true, true]],
  ['agent', 'admin', true, [true, true, true, false]],
  ['agent', 'admin', false, [false, false, false, false]],
  ['agent', 'agent', true, [true, true, false, false]],
  ['agent', 'agent', false, [false, false, false, false]],
] as const
