export type PublicSettings = {
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
          <h3>チャットの埋め込み先</h3>
          {settings.inheritedSites.length > 0 && (
            <p>デプロイ時に登録済み: {settings.inheritedSites.join('、')}</p>
          )}
          {settings.sites
            .filter((site) => !settings.inheritedSites.includes(site))
            .map((site) => (
              <form
                className="public-actions"
                method="post"
                action="/extensions/chat/embed-sites"
              >
                <input type="hidden" name="product" value={product} />
                <input type="hidden" name="site" value={site} />
                <span>{site}</span>
                <button
                  name="intent"
                  value="remove"
                  aria-label={site + ' を解除'}
                >
                  解除
                </button>
              </form>
            ))}
          <form method="post" action="/extensions/chat/embed-sites">
            <input type="hidden" name="product" value={product} />
            <label>
              埋め込み先のサイト
              <input
                name="site"
                type="url"
                required
                placeholder="https://support.example.com"
              />
            </label>
            <button>埋め込み先を登録</button>
          </form>
        </section>
      )}
      {(id === 'form' || id === 'chat') && (
        <form method="post" action={'/extensions/' + id + '/public-settings'}>
          <input type="hidden" name="product" value={product} />
          <label>
            返信の目安
            <input
              name="responseTime"
              value={settings.responseTime}
              maxlength={160}
              placeholder="例: 2営業日以内"
            />
          </label>
          <button>返信の目安を保存</button>
        </form>
      )}
    </>
  )
}
