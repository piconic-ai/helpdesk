import { extensions } from '../helpdesk.config'
export function extensionModeSQL(mode: string | undefined, admin: string) {
  if (mode !== 'on' && mode !== 'off') return []
  if (!/^[a-z0-9]+@example\.(com|net|org)$/.test(admin))
    throw new Error('Expected test administrator')
  return [
    "INSERT OR IGNORE INTO operators VALUES('" + admin + "','admin')",
    ...extensions.map(
      ({ extension }) =>
        "INSERT OR REPLACE INTO extension_settings VALUES('" +
        extension.id +
        "'," +
        Number(mode === 'on') +
        ",'" +
        admin +
        "')",
    ),
  ]
}
