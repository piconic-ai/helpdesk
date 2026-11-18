'use client'

// Adapted from BarefootJS UI (MIT). See src/ui/BAREFOOT-LICENSE.

import type { HTMLBaseAttributes, ButtonHTMLAttributes } from '@barefootjs/jsx'

import type { Child } from 'hono/jsx'

interface TabsProps extends HTMLBaseAttributes {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: Child
}

function Tabs({
  className = '',
  value,
  defaultValue,
  children,
  ...props
}: TabsProps) {
  return (
    <div
      data-slot="tabs"
      data-value={value || defaultValue}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

interface TabsListProps extends HTMLBaseAttributes {
  children?: Child
}

function TabsList({ className = '', children, ...props }: TabsListProps) {
  return (
    <div data-slot="tabs-list" role="tablist" className={className} {...props}>
      {children}
    </div>
  )
}

interface TabsTriggerProps extends ButtonHTMLAttributes {
  value: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  children?: Child
}

function TabsTrigger(props: TabsTriggerProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.currentTarget as HTMLElement
    const tabList = target.closest('[role="tablist"]')
    if (!tabList) return

    const tabs = tabList.querySelectorAll('[role="tab"]:not([disabled])')
    const currentIndex = Array.from(tabs).indexOf(target)

    let nextIndex: number | null = null

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowLeft':
        e.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        break
      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break
      case 'End':
        e.preventDefault()
        nextIndex = tabs.length - 1
        break
    }

    if (nextIndex !== null && tabs[nextIndex]) {
      const nextTab = tabs[nextIndex] as HTMLElement
      nextTab.focus()
      nextTab.click()
    }
  }

  return (
    <button
      data-slot="tabs-trigger"
      type="button"
      role="tab"
      aria-selected={props.selected ?? false}
      disabled={props.disabled ?? false}
      data-state={(props.selected ?? false) ? 'active' : 'inactive'}
      data-value={props.value}
      tabindex={(props.selected ?? false) ? 0 : -1}
      id={props.id}
      className={props.className}
      onClick={props.onClick}
      onKeyDown={handleKeyDown}
    >
      {props.children}
    </button>
  )
}

interface TabsContentProps extends HTMLBaseAttributes {
  value: string
  selected?: boolean
  children?: Child
}

function TabsContent(props: TabsContentProps) {
  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      tabindex={0}
      data-state={(props.selected ?? false) ? 'active' : 'inactive'}
      data-value={props.value}
      id={props.id}
      className={props.className}
    >
      {props.children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps }
