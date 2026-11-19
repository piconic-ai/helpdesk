import { createElement } from 'hono/jsx'
import { NativeSelect } from './controls'
import { identityColor, identityPalette, initial } from './identity-color'

type Product = { id: string; name: string }
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
  label = 'プロダクト',
}: {
  products: Product[]
  selected?: string
  empty?: string
  label?: string
}) {
  return (
    <NativeSelect
      name="product"
      aria-label={label}
      required={!empty}
      data-product-select=""
    >
      <button type="button">{createElement('selectedcontent', {})}</button>
      {empty && (
        <option value="" selected={!selected}>
          {empty}
        </option>
      )}
      {products.map((p) => (
        <option value={p.id} selected={p.id === selected}>
          <ProductMark product={p} />
        </option>
      ))}
    </NativeSelect>
  )
}
