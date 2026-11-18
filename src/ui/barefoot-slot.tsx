// BarefootJS UI Slot, specialized to the Hono JSX renderer (MIT).
import { cloneElement, isValidElement, type Child } from 'hono/jsx'

export function Slot({
  children,
  className,
  ...props
}: {
  children?: Child
  className?: string
  [key: string]: unknown
}) {
  if (!isValidElement(children)) return <>{children}</>
  const childClass = children.props.className
  const mergedClass = [className, childClass].filter(Boolean).join(' ')
  return (
    <>
      {cloneElement(children, {
        ...props,
        className: mergedClass || undefined,
      })}
    </>
  )
}
