import { projectTerm } from './project-term'
export const projectPath = (id: string, section = '') =>
  '/settings/projects/' +
  encodeURIComponent(id) +
  (section ? '/' + section : '')
export const projectBack = (id: string) => ({
  href: projectPath(id),
  label: projectTerm + 'の設定に戻る',
})

export const extensionBack = (project?: string, from?: string) =>
  project && from !== 'extensions'
    ? projectBack(project)
    : { href: '/extensions', label: '拡張の管理に戻る' }

export function withProject(path: string, product?: string) {
  if (!product) return path
  const [pathname, search] = path.split('?')
  const params = new URLSearchParams(search)
  params.set('product', product)
  return pathname + '?' + params
}

export function extensionSettingsPath(
  extension: string,
  project?: string,
  fromCatalogue = false,
) {
  const path = '/extensions/' + encodeURIComponent(extension)
  if (!project) return path
  const query = new URLSearchParams({ product: project })
  if (fromCatalogue) query.set('from', 'extensions')
  return path + '?' + query
}
