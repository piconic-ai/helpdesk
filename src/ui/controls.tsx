// Adapted from BarefootJS UI. The helpdesk theme replaces utility classes.
import type { Child } from 'hono/jsx'
import { Slot } from './barefoot-slot'
import type { JSX } from '@barefootjs/jsx/jsx-runtime'

type Native = JSX.IntrinsicElements
type Variant = 'default' | 'outline' | 'ghost' | 'destructive'
const variants = {
  default: 'button-primary',
  outline: 'button-secondary',
  ghost: 'button-quiet',
  destructive: 'button-danger',
}
type ButtonProps = Omit<Native['button'], 'children'> & {
  children?: Child
  asChild?: boolean
  variant?: Variant
  command?: string
  commandfor?: string
}
export function Button({
  variant = 'outline',
  children,
  className,
  asChild = false,
  ...props
}: ButtonProps) {
  const classes = [variants[variant], className].filter(Boolean).join(' ')
  if (asChild)
    return (
      <Slot data-slot="button" className={classes} {...props}>
        {children}
      </Slot>
    )
  return (
    <button data-slot="button" className={classes} {...props}>
      {children}
    </button>
  )
}
export function ActionLink({
  variant = 'outline',
  children,
  ...props
}: Native['a'] & { variant?: Variant }) {
  return (
    <Button variant={variant} asChild>
      <a {...props}>{children}</a>
    </Button>
  )
}
export function Input({ type, ...props }: Native['input']) {
  return <input type={type} data-slot="input" {...props} />
}
export function ImageFileInput(props: Native['input']) {
  return (
    <span className="image-file-picker">
      <Input {...props} type="file" aria-label="アイコン画像" />
      <span data-file-presentation="" hidden aria-hidden="true">
        <span className="button-secondary">ファイルを選ぶ</span>
        <span data-file-name="">未選択</span>
      </span>
    </span>
  )
}
export function Textarea({ children, ...props }: Native['textarea']) {
  return (
    <textarea data-slot="textarea" {...props}>
      {children}
    </textarea>
  )
}
export function NativeSelect({ children, ...props }: Native['select']) {
  return (
    <span data-slot="native-select-wrapper">
      <select data-slot="native-select" {...props}>
        {children}
      </select>
      <svg
        data-slot="native-select-icon"
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  )
}
export function Field({
  label,
  description,
  children,
}: {
  label: Child
  description?: Child
  children?: Child
}) {
  return (
    <label data-slot="field">
      <span data-slot="field-label">{label}</span>
      {children}
      {description && (
        <small data-slot="field-description">{description}</small>
      )}
    </label>
  )
}

type Overlay = {
  id: string
  accessibleName?: string
  label: Child
  children?: Child
  disabled?: boolean
  variant?: Variant
}
function Popup({
  id,
  accessibleName,
  label,
  children,
  disabled,
  variant = 'ghost',
  menu,
}: Overlay & { menu?: boolean }) {
  const name = menu ? 'dropdown-menu' : 'popover'
  return (
    <span data-slot={name}>
      <Button
        variant={variant}
        type="button"
        disabled={disabled}
        popovertarget={id}
        aria-label={accessibleName}
        aria-controls={id}
        aria-expanded="false"
        aria-haspopup={menu ? 'menu' : undefined}
        data-slot={name + '-trigger'}
      >
        {label}
      </Button>
      <div id={id} data-slot={name + '-content'} popover="auto">
        {children}
      </div>
    </span>
  )
}
export const Popover = (props: Overlay) => <Popup {...props} />
export const ActionMenu = (props: Overlay) => <Popup {...props} menu />
export function Dialog({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: Child
  description?: Child
  children?: Child
}) {
  return (
    <dialog
      data-slot="dialog-content"
      className="confirm-dialog"
      id={id}
      aria-labelledby={id + '-title'}
    >
      <div data-slot="dialog-header">
        <h2 data-slot="dialog-title" id={id + '-title'}>
          {title}
        </h2>
        {description && <p data-slot="dialog-description">{description}</p>}
      </div>
      <div data-slot="dialog-footer">{children}</div>
    </dialog>
  )
}

export const SwitchTrack = () => (
  <span className="switch-track" aria-hidden="true">
    <i />
  </span>
)
