'use client'

// Adapted from BarefootJS UI (MIT). See src/ui/BAREFOOT-LICENSE.

import { createSignal } from '@barefootjs/client'
import type { HTMLBaseAttributes } from '@barefootjs/jsx'
import type { Child } from 'hono/jsx'

type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left'

interface TooltipProps extends HTMLBaseAttributes {
  content: string
  children?: Child
  placement?: TooltipPlacement
  delayDuration?: number
  closeDelay?: number
}

function Tooltip(props: TooltipProps) {
  const [open, setOpen] = createSignal(false)

  // Helper to get/set timer IDs on the DOM element
  const getTimer = (el: HTMLElement, key: string): number | undefined => {
    const val = el.dataset[key]
    return val ? Number(val) : undefined
  }
  const setTimer = (el: HTMLElement, key: string, id: number | undefined) => {
    el.dataset[key] = id !== undefined ? String(id) : ''
  }

  const handleMouseEnter = (e: MouseEvent) => {
    const el = (e.currentTarget ?? e.target) as HTMLElement
    const closeTimer = getTimer(el, 'closeTimer')
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer)
      setTimer(el, 'closeTimer', undefined)
    }

    if ((props.delayDuration ?? 0) > 0) {
      const timerId = setTimeout(() => {
        setOpen(true)
        setTimer(el, 'openTimer', undefined)
      }, props.delayDuration!) as unknown as number
      setTimer(el, 'openTimer', timerId)
    } else {
      setOpen(true)
    }
  }

  const handleMouseLeave = (e: MouseEvent) => {
    const el = (e.currentTarget ?? e.target) as HTMLElement
    const openTimer = getTimer(el, 'openTimer')
    if (openTimer !== undefined) {
      clearTimeout(openTimer)
      setTimer(el, 'openTimer', undefined)
    }

    if ((props.closeDelay ?? 0) > 0) {
      const timerId = setTimeout(() => {
        setOpen(false)
        setTimer(el, 'closeTimer', undefined)
      }, props.closeDelay!) as unknown as number
      setTimer(el, 'closeTimer', timerId)
    } else {
      setOpen(false)
    }
  }

  const handleFocus = () => setOpen(true)
  const handleBlur = () => setOpen(false)

  return (
    <span
      data-slot="tooltip"
      className={props.className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-describedby={props.id}
    >
      <span>{props.children}</span>
      <span
        data-slot="tooltip-content"
        data-state={open() ? 'open' : 'closed'}
        data-placement={props.placement ?? 'top'}
        role="tooltip"
        id={props.id}
      >
        {props.content}
      </span>
    </span>
  )
}

export { Tooltip }
export type { TooltipPlacement, TooltipProps }
