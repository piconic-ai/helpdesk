import { extensionSettingsPath } from '../core/settings/project-setting-links'
import { projectTerm } from '../core/settings/project-term'
import { DetailPage } from '../ui/patterns'
import { html } from 'hono/html'
import { Button, Input, Textarea, NativeSelect } from '../ui/controls'
import { Disclosure, SaveActions } from '../ui/admin'
import { Stack } from '../ui/layout'
import type { ChatWidget } from '../core/intakes/chat-widget'

function widgetScript(
  origin: string,
  product: string,
  options: Pick<ChatWidget, 'position' | 'label'>,
) {
  return (
    <script
      src={origin + '/widget.js'}
      data-product={product}
      data-position={
        options.position === 'bottom-right' ? undefined : options.position
      }
      data-label={options.label === 'ヘルプ' ? undefined : options.label}
      referrerpolicy="no-referrer"
      async
    ></script>
  )
}

export function widgetPreviewPage(
  origin: string,
  product: { id: string; name: string },
  options: Pick<ChatWidget, 'position' | 'label'>,
) {
  return html`<!doctype html>${(
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>{product.name} のチャットの見本</title>
          <link rel="stylesheet" href="/styles.css" />
          <link rel="stylesheet" href="/ui/widget-settings.css" />
          <link rel="stylesheet" href="/ui/layout.css" />
        </head>
        <body data-widget-preview="">
          <main>
            <DetailPage title={product.name}>
              <p>ヘルプボタンを押して、チャットの見え方を確認できます。</p>
            </DetailPage>
          </main>
          {widgetScript(origin, product.id, options)}
        </body>
      </html>
    )}`
}

export function WidgetSettings({
  product,
  url,
  options,
  local,
}: {
  product: { id: string; name: string }
  url: string
  local: boolean
  options: ChatWidget
}) {
  const origin = new URL(url).origin
  const previewPath =
    '/extensions/chat/preview/' + encodeURIComponent(product.id)
  return (
    <section
      data-copy-block=""
      data-widget-settings=""
      data-origin={origin}
      data-product={product.id}
    >
      <Stack gap="md">
        <h3>
          {local
            ? 'この端末で試す埋め込みコード'
            : `${projectTerm}への埋め込み`}
        </h3>
        <label>
          埋め込みコード
          <Textarea data-snippet="" readonly rows={3}>
            {String(widgetScript(origin, product.id, options))}
          </Textarea>
        </label>
        <div>
          <Button type="button" data-copy-snippet="">
            コードをコピー
          </Button>
        </div>
        <Disclosure title="ボタンと最初の説明文を編集">
          <form
            method="post"
            action="/extensions/chat/widget-settings"
            data-widget-options=""
          >
            <input type="hidden" name="product" value={product.id} />
            <label>
              ボタンの位置
              <NativeSelect name="position">
                <option
                  value="bottom-right"
                  selected={options.position === 'bottom-right'}
                >
                  右下
                </option>
                <option
                  value="bottom-left"
                  selected={options.position === 'bottom-left'}
                >
                  左下
                </option>
              </NativeSelect>
            </label>
            <label>
              ボタンの文言
              <Input
                required
                name="label"
                maxlength={60}
                value={options.label}
              />
            </label>
            <label>
              最初の説明文
              <Textarea
                name="introduction"
                rows={3}
                maxlength={500}
                placeholder={`この${projectTerm}で案内できる内容など`}
              >
                {options.introduction}
              </Textarea>
            </label>
            <Button type="button" data-show-widget-preview="">
              変更したボタンを見本で確認
            </Button>
            <p>位置・文言を変えた場合はコードを貼り直してください。</p>
            <SaveActions
              verb="チャットの表示を保存"
              cancel={extensionSettingsPath('chat', product.id)}
            />
          </form>
        </Disclosure>
        <Disclosure title="埋め込みの見本を開く">
          <iframe
            data-preview-path={previewPath}
            loading="lazy"
            title={product.name + ' の埋め込みの見本'}
            src={previewPath}
            referrerpolicy="no-referrer"
          />
        </Disclosure>
        <Disclosure title="CSP の設定を確認">
          <p>
            埋め込み先のサイトで Content-Security-Policy を更新します。{' '}
            <code>script-src</code> と <code>frame-src</code> の両方に{' '}
            <code>{origin}</code> （ヘルプデスクのオリジン）を追加してください。
          </p>
        </Disclosure>
      </Stack>
    </section>
  )
}
