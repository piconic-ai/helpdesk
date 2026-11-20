import { projectTerm } from './project-term'
export const projectPath = (id: string, section = '') =>
  '/settings/projects/' +
  encodeURIComponent(id) +
  (section ? '/' + section : '')
export const projectBack = (id: string) => ({
  href: projectPath(id),
  label: projectTerm + 'の設定に戻る',
})
