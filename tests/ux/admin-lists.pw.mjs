import { test, expect, editFiltersWhileLoading } from './harness.mjs'

test.use({ extensions: ['articles', 'metrics'] })
test('検索の読み込み中に選び直した文字はそのまま置き換えられる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/settings')
  const search = page.getByRole('searchbox', { name: '設定項目を検索' })
  const loading = Promise.withResolvers()
  await page.route(
    '**/ui/live-filters.js',
    async (route) => {
      await loading.promise
      await route.continue()
    },
    { times: 1 },
  )
  try {
    await search.fill('削除')
    await page.waitForURL((url) => url.searchParams.get('q') === '削除', {
      waitUntil: 'commit',
    })
    await search.press('ControlOrMeta+a')
  } finally {
    loading.resolve()
  }
  await page.waitForLoadState('load')
  await page.keyboard.insertText('該当しない設定')
  await expect(search).toHaveValue('該当しない設定')
  await expect(
    page.getByRole('link', { name: '検索：該当しない設定 を解除' }),
  ).toBeVisible()
})
test('読み込み中に変更した検索と選択を一度に反映し、入力だけでも検索できる', async ({
  page,
  scene,
}) => {
  const requests = []
  page.on('request', (request) => {
    if (
      new URL(request.url()).pathname === '/extensions' &&
      request.method() === 'GET' &&
      request.frame() === page.mainFrame()
    )
      requests.push(new URL(request.url()).search)
  })
  await editFiltersWhileLoading(
    page,
    scene.origin + '/extensions',
    async () => {
      await page
        .getByRole('searchbox', { name: '拡張機能を検索' })
        .fill('articles')
      await page.getByLabel('提供状態').selectOption('enabled')
    },
  )
  await expect(page).toHaveURL(/q=articles&filter=enabled$/)
  await expect(page.locator('[data-extension]')).toHaveCount(1)
  expect(requests).toEqual(['', '?q=articles&filter=enabled'])

  const search = page.getByRole('searchbox', { name: '設定項目を検索' })
  await editFiltersWhileLoading(
    page,
    scene.origin + '/settings?q=削除',
    async () => {
      await search.fill('')
    },
  )
  await expect(page).toHaveURL(scene.origin + '/settings')
  await expect(
    page.getByRole('link', { name: /^プロジェクトの設定/ }),
  ).toBeVisible()
  await expect(search).toBeFocused()
})
test('記事の検索・公開状態・ページ送りを URL から復元し、更新日と評価を読む', async ({
  page,
  scene,
}) => {
  const articles = Array.from({ length: 23 }, (_, i) => {
    const id = 'guide-' + String(i).padStart(2, '0')
    const row = {
      id,
      product: 'slide',
      title: '操作ガイド ' + String(i).padStart(2, '0'),
      status: i === 22 ? 'draft' : 'published',
      updatedAt: Date.UTC(2026, 10, 16, 15),
      body: '手順',
    }
    return scene.db
      .prepare('INSERT INTO articles_data VALUES(?,?)')
      .bind('article/slide/' + id, JSON.stringify(row))
  })
  await scene.db.batch(articles)
  await page.goto(scene.origin + '/articles')
  const list = page.locator('[data-ui=row-list]').first()
  await expect(list.getByRole('listitem')).toHaveCount(20)
  await page.getByRole('link', { name: '次のページ' }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(list.getByRole('listitem')).toHaveCount(4)
  const input = page.getByRole('searchbox', { name: '記事を検索' })
  await input.fill('操作ガイド')
  await expect(page).not.toHaveURL(/page=2/)
  await expect(input).toBeFocused()
  await page.getByLabel('公開状態').selectOption('draft')
  await expect(list.getByRole('listitem')).toHaveCount(1)
  await expect(list).toContainText('操作ガイド 22')
  await expect(list).toContainText('更新 2026/11/17')
  await expect(list).toContainText('評価なし')
  await page.reload()
  await expect(list.getByRole('listitem')).toHaveCount(1)
  await page.getByRole('link', { name: '下書き を解除' }).click()
  await expect(list.getByRole('listitem')).toHaveCount(20)
})
test('設定項目の窓口数と保存期間が実際の変更後の値に変わる', async ({
  scene,
  page,
}) => {
  await page.goto(scene.origin + '/settings/global')
  const main = page.getByRole('main')
  await expect(
    main.getByRole('link', { name: /^プロジェクトと窓口/ }),
  ).toContainText('窓口 2件')
  await page.goto(scene.origin + '/settings/projects/slide')
  const retention = main.getByRole('link', { name: /^保存期間/ })
  await expect(retention).toContainText('無期限')
  await retention.click()
  await page.getByLabel('日数を指定').check()
  await page.getByRole('spinbutton').fill('15')
  await page.getByRole('button', { name: '保存期間を変更' }).click()
  await page.getByRole('link', { name: /設定に戻る/ }).click()
  await expect(retention).toContainText('15日')
})
test('拡張と設定の概要で検索条件を組み合わせ、解除できる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/extensions')
  const main = page.getByRole('main')
  await main.getByRole('searchbox', { name: '拡張機能を検索' }).fill('articles')
  const article = main.locator('[data-extension=articles]')
  await expect(main.locator('[data-extension]')).toHaveCount(1)
  await expect(article.getByRole('switch')).toBeChecked()
  await main.getByLabel('提供状態').selectOption('disabled')
  await expect(main).toContainText('条件に合う拡張機能はありません。')
  await page.reload()
  await main.getByRole('link', { name: '無効 を解除' }).click()
  await expect(article).toBeVisible()
  await main.getByRole('link', { name: '検索：articles を解除' }).click()
  await expect(main.getByRole('heading', { name: '受け付ける' })).toBeVisible()

  await page.goto(scene.origin + '/settings')
  const search = main.getByRole('searchbox', { name: '設定項目を検索' })
  await search.fill('窓口')
  await expect(
    main.getByRole('link', { name: /^プロジェクトの設定/ }),
  ).toBeVisible()
  await expect(main.getByRole('link', { name: /^全体の設定/ })).toHaveCount(0)
  await search.fill('該当しない設定')
  await expect(main).toContainText('条件に合う設定項目はありません。')
  await main.getByRole('link', { name: '検索：該当しない設定 を解除' }).click()
  await expect(main.getByRole('link', { name: /^全体の設定/ })).toBeVisible()
})
