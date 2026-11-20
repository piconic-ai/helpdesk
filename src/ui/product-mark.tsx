import { projectTerm } from '../core/settings/project-term'
import { createElement } from 'hono/jsx'
import { Button, Field, NativeSelect } from './controls'
import { identityColor, identityPalette, initial } from './identity-color'

type Product = { id: string; name: string; archived?: boolean }

export const activeProjects = <T extends Product>(projects: T[]) =>
  projects.filter((p) => !p.archived)
export const productIconUrl = (id: string) =>
  '/help/product-icon/' + encodeURIComponent(id)

export function ProductMark({
  product,
  size = 'list',
  compact,
}: {
  product: Product
  size?: 'list' | 'heading' | 'public'
  compact?: boolean
}) {
  const pixels = { list: 16, heading: 20, public: 28 }[size]
  return (
    <span
      className="product-mark"
      data-compact={compact || undefined}
      title={product.name}
    >
      <img
        alt=""
        width={pixels}
        height={pixels}
        src={productIconUrl(product.id)}
      />
      <span className="product-mark-name">{product.name}</span>
    </span>
  )
}

export function productIconSvg(name: string, emoji: string | null) {
  return String(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      width="96"
      height="96"
    >
      {!emoji && (
        <rect
          width="96"
          height="96"
          rx="18"
          fill={identityPalette[identityColor(name)]}
        />
      )}
      <text
        x="48"
        y="49"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="system-ui,sans-serif"
        font-size={emoji ? 70 : 58}
        font-weight="600"
        fill="white"
      >
        {emoji || initial(name)}
      </text>
    </svg>,
  )
}

export function ProductSelect({
  products,
  selected,
  empty,
  label = projectTerm,
  required = !empty,
}: {
  products: Product[]
  selected?: string
  empty?: string
  label?: string
  required?: boolean
}) {
  return (
    <NativeSelect
      name="product"
      aria-label={label}
      required={required}
      data-product-select=""
    >
      <button type="button">{createElement('selectedcontent', {})}</button>
      {empty && (
        <option value="" selected={!selected}>
          {empty}
        </option>
      )}
      {activeProjects(products).map((p) => (
        <option value={p.id} selected={p.id === selected}>
          <ProductMark product={p} />
        </option>
      ))}
    </NativeSelect>
  )
}

export function ProjectPickerForm({
  action,
  products,
  selected,
  empty,
  submitLabel = '設定を開く',
}: {
  action: string
  products: Product[]
  selected?: string
  empty?: string
  submitLabel?: string
}) {
  return (
    <form
      action={action}
      method="get"
      data-layout="cluster"
      data-gap="sm"
      data-project-picker=""
    >
      <Field label={projectTerm}>
        <ProductSelect
          products={products}
          selected={selected}
          empty={empty}
          required
        />
      </Field>
      <Button type="submit">{submitLabel}</Button>
    </form>
  )
}
