import {
  Button,
  Field,
  Input,
  ImageFileInput,
  NativeSelect,
} from '../../ui/controls'
import { ProductMark } from '../../ui/product-mark'
import { EditPage, Notice } from '../../ui/patterns'
import { shell } from '../../ui/console-shell'
import type { ConsoleFrame } from '../conversations/console-usecase'

type Product = ConsoleFrame['products'][number]
export function ProductIconForm({
  product,
  mode,
  emoji,
}: {
  product: Product
  mode?: string
  emoji?: string
}) {
  const selected =
    mode ??
    (product.hasIconImage ? 'image' : product.emoji ? 'emoji' : 'initial')
  return (
    <form
      method="post"
      enctype="multipart/form-data"
      data-product-icon-form=""
      action={'/settings/product-icon/' + encodeURIComponent(product.id)}
    >
      <Field label="アイコンの種類">
        <NativeSelect name="mode">
          <option value="initial" selected={selected === 'initial'}>
            名前の頭文字
          </option>
          <option value="emoji" selected={selected === 'emoji'}>
            絵文字
          </option>
          <option value="image" selected={selected === 'image'}>
            画像
          </option>
        </NativeSelect>
      </Field>
      <Field
        label="絵文字"
        description="プロダクトを表す絵文字を1つ入力してください。"
      >
        <Input type="text" name="emoji" value={emoji ?? product.emoji ?? ''} />
      </Field>
      <Field
        label="アイコン画像"
        description="JPEG・PNG（非インターレース）、2 MB・200万画素まで。中央を正方形に切り抜きます。"
      >
        <ImageFileInput name="image" accept="image/jpeg,image/png" />
      </Field>
      <Button>アイコンを保存</Button>
    </form>
  )
}
export function productIconErrorPage(
  frame: ConsoleFrame,
  product: Product,
  mode: string,
  emoji: string,
  error: string,
) {
  return shell(
    'プロダクトのアイコン',
    <EditPage
      title={
        <>
          <ProductMark product={product} size="heading" /> のアイコン
        </>
      }
      back={{ href: '/settings/mailboxes', label: 'プロダクトと窓口に戻る' }}
    >
      <Notice kind="error">{error}</Notice>
      <ProductIconForm product={product} mode={mode} emoji={emoji} />
    </EditPage>,
    frame,
  )
}
