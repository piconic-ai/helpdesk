import { extensionSettingsPath } from '../core/settings/project-setting-links'
import { Disclosure, SaveActions } from '../ui/admin'
import { Button, Input } from '../ui/controls'
import type { ChatWidget } from '../core/intakes/chat-widget'
export type PublicSettings = {
  widget?: ChatWidget
  responseTime: string
  inheritedSites: string[]
  sites: string[]
}
export function publicSettingsFields(
  id: string,
  product: string,
  settings: PublicSettings,
) {
  return (
    <>
      {id === 'chat' && (
        <section aria-label="チャットの埋め込み先">
          <p>
            埋め込み先：
            {new Set([...settings.inheritedSites, ...settings.sites]).size}件
          </p>
          <Disclosure title="埋め込み先を編集">
            {settings.inheritedSites.length > 0 && (
              <p>デプロイ時に登録済み: {settings.inheritedSites.join('、')}</p>
            )}
            {settings.sites
              .filter((site) => !settings.inheritedSites.includes(site))
              .map((site) => (
                <form method="post" action="/extensions/chat/embed-sites">
                  <input type="hidden" name="product" value={product} />
                  <input type="hidden" name="site" value={site} />
                  <span>{site}</span>
                  <Button
                    name="intent"
                    value="remove"
                    aria-label={site + ' を解除'}
                  >
                    解除
                  </Button>
                </form>
              ))}
            <form method="post" action="/extensions/chat/embed-sites">
              <input type="hidden" name="product" value={product} />
              <label>
                埋め込み先のサイト
                <Input
                  name="site"
                  type="url"
                  required
                  placeholder="https://support.example.com"
                />
              </label>
              <SaveActions
                verb="埋め込み先を登録"
                cancel={extensionSettingsPath('chat', product)}
              />
            </form>
          </Disclosure>
        </section>
      )}
      {(id === 'form' || id === 'chat') && (
        <section aria-label="返信の目安">
          <p>返信の目安：{settings.responseTime || '未設定'}</p>
          <Disclosure title="返信の目安を編集">
            <form
              method="post"
              action={'/extensions/' + id + '/public-settings'}
            >
              <input type="hidden" name="product" value={product} />
              <label>
                返信の目安
                <Input
                  name="responseTime"
                  value={settings.responseTime}
                  maxlength={160}
                  placeholder="例: 2営業日以内"
                />
              </label>
              <small>問い合わせを受け付けた後、利用者に表示します。</small>
              <SaveActions
                verb="返信の目安を保存"
                cancel={extensionSettingsPath(id, product)}
              />
            </form>
          </Disclosure>
        </section>
      )}
    </>
  )
}
