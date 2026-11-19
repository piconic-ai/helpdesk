import { extensionLabel } from '../core/extensions/extension-labels'
import type { Actor } from '../core/conversations/state'
type Profile = { displayName: string; avatarKey?: string | null }
export function operatorAvatar(profile?: Profile, email?: string) {
  const name = profile?.displayName || email?.split('@')[0]
  const label = name ? '担当者 ' + name : '担当なし'
  if (profile?.avatarKey)
    return (
      <img
        className="avatar"
        src={'/account/avatar/' + profile.avatarKey}
        alt={label}
        title={name}
        width={24}
        height={24}
      />
    )
  const initial =
    name &&
    Array.from(
      new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(name),
    )[0]?.segment
  return (
    <span
      className={'avatar' + (name ? '' : ' avatar-unassigned')}
      role="img"
      aria-label={label}
      title={name || '担当なし'}
    >
      <span
        className="avatar-letter"
        aria-hidden="true"
        data-initial={initial}
      />
    </span>
  )
}
const icons = {
  agent: 'M4 6h12v9H4z M10 6V3 M7 9v2 M13 9v2 M7 13h6',
  extension: 'M4 4h5a2 2 0 1 1 4 0h3v5a2 2 0 1 0 0 4v3H4z',
  system: 'M3 4h14v10H3z M7 17h6 M10 14v3',
}
export function actorIdentity(
  actor: Actor,
  operators: readonly (Profile & { email: string })[],
) {
  const lookup = (id: string) => operators.find((o) => o.email === id)
  if (actor.kind === 'operator') {
    const profile = lookup(actor.id)
    return (
      <span className="actor-identity">
        {operatorAvatar(profile, actor.id)}
        {profile?.displayName ?? actor.id.split('@')[0]}
      </span>
    )
  }
  const label =
    actor.kind === 'system'
      ? 'システム'
      : actor.kind === 'extension'
        ? extensionLabel(actor.id)
        : 'エージェント ' +
          actor.id +
          '（' +
          (lookup(actor.onBehalfOf)?.displayName ??
            actor.onBehalfOf.split('@')[0]) +
          ' の代理）'
  return (
    <span className="actor-identity">
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d={icons[actor.kind]} />
      </svg>
      {label}
    </span>
  )
}
