import type { Child, JSX } from 'hono/jsx'

type Arrangement = {
  as?:
    | 'div'
    | 'section'
    | 'article'
    | 'header'
    | 'footer'
    | 'aside'
    | 'label'
    | 'main'
  gap?: 'xs' | 'sm' | 'md' | 'lg'
  children?: Child
} & Partial<
  Pick<JSX.IntrinsicElements['div'], 'id' | 'className' | 'aria-label'>
>

export function Stack({ as: Tag = 'div', gap = 'sm', ...props }: Arrangement) {
  return <Tag data-layout="stack" data-gap={gap} {...props} />
}

export function Cluster({
  as: Tag = 'div',
  gap = 'sm',
  ...props
}: Arrangement) {
  return <Tag data-layout="cluster" data-gap={gap} {...props} />
}

export function Grid({ as: Tag = 'div', gap = 'md', ...props }: Arrangement) {
  return <Tag data-layout="grid" data-gap={gap} {...props} />
}

export function PageBody({
  children,
  ...props
}: Omit<Arrangement, 'as' | 'gap'>) {
  return (
    <section data-layout="page" {...props}>
      {children}
    </section>
  )
}
