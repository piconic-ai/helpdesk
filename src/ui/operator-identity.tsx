import { glyph } from './glyph'
import { identityColor, initial } from './identity-color'
import { extensionLabel } from '../core/extensions/extension-labels'
import type { Actor, Approval } from '../core/conversations/state'
type Profile = {
  displayName: string
  email?: string
  avatarKey?: string | null
}
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
  return (
    <span
      className={'avatar' + (name ? '' : ' avatar-unassigned')}
      data-identity-color={
        name ? identityColor(email || profile?.email || name) : undefined
      }
      role="img"
      aria-label={label}
      title={name || '担当なし'}
    >
      <span
        className="avatar-letter"
        aria-hidden="true"
        data-initial={name && initial(name)}
      />
    </span>
  )
}
export function ContactAvatar({
  name,
  email,
}: {
  name?: string | null
  email?: string | null
}) {
  const label = name || email || '匿名'
  return (
    <span
      className="avatar contact-avatar"
      role="img"
      aria-label={'差出人 ' + label}
      title={label}
      data-identity-color={identityColor(email || label)}
    >
      <span
        className="avatar-letter"
        aria-hidden="true"
        data-initial={initial(label)}
      />
    </span>
  )
}
export function actorIdentity(
  actor: Actor,
  operators: readonly (Profile & { email: string })[],
  approval?: Approval | null,
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
  if (actor.kind === 'extension') {
    const by = approval?.kind === 'operator' ? approval.by : approval?.enabledBy
    const name = by && (lookup(by)?.displayName ?? by.split('@')[0])
    const source =
      approval?.kind === 'standing'
        ? name + 'が自動送信を承認'
        : name
          ? name + 'が承認'
          : '拡張が作成'
    return (
      <span className="actor-identity">
        {glyph('extension')}
        {extensionLabel(actor.id)}（{source}）
      </span>
    )
  }
  const label =
    actor.kind === 'system'
      ? 'システム'
      : 'エージェント ' +
        actor.id +
        '（' +
        (lookup(actor.onBehalfOf)?.displayName ??
          actor.onBehalfOf.split('@')[0]) +
        ' の代理）'
  return (
    <span className="actor-identity">
      {glyph(actor.kind)}
      {label}
    </span>
  )
}
