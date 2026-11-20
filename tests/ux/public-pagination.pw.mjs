import { expect, test } from './harness.mjs'

test.use({ extensions: ['articles', 'form'] })

test('公開記事を20件ずつ読み進め、検索語とプロジェクトの窓口を保持する', async ({
  page,
  scene,
}) => {
  const articles = Array.from({ length: 29 }, (_, i) => {
    const id = 'reference-' + String(i + 1).padStart(2, '0')
    const product = i < 25 || i === 28 ? 'slide' : 'desk'
    const article = {
      product,
      id,
      title: '導入手順 ' + id,
      body: '操作の手順を説明します。',
      status: i === 28 ? 'draft' : 'published',
    }
    return scene.db
      .prepare('INSERT INTO articles_data VALUES(?,?)')
      .bind('article/' + product + '/' + id, JSON.stringify(article))
  })
  await scene.db.batch([
    ...articles,
    scene.db.prepare(
      "UPDATE product_lifecycle SET public_help=1 WHERE product='desk'",
    ),
  ])
  const registration = await page.request.post(
    scene.origin + '/settings/public-intakes/desk',
    {
      form: { returnTo: '/extensions/form' },
      headers: { Origin: scene.origin },
      maxRedirects: 0,
    },
  )
  expect(registration.status()).toBe(303)
  for (const [path, total] of [
    ['/help/articles/slide/', 25],
    ['/help/', 28],
  ]) {
    await page.goto(scene.origin + path)
    await page.getByRole('searchbox').fill('導入手順')
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('q') === '導入手順',
    )
    const results = page.getByRole('link', { name: /^導入手順 reference-/ })
    await expect(results).toHaveCount(20)
    const before = await results.allTextContents()
    await page.getByRole('link', { name: '次のページ' }).click()
    await expect(page).toHaveURL(
      (url) =>
        url.searchParams.get('q') === '導入手順' &&
        url.searchParams.get('page') === '2',
    )
    await expect(results).toHaveCount(total - 20)
    const combined = [...before, ...(await results.allTextContents())]
    expect(new Set(combined).size).toBe(total)
    expect(combined.join(' ')).not.toContain('reference-29')
    if (path === '/help/') {
      await expect(page.locator('a[href="/help/form/slide"]')).toBeVisible()
      expect(combined.some((title) => title.includes('reference-26'))).toBe(
        true,
      )
    } else {
      await expect(
        page.getByRole('link', { name: 'お問い合わせ', exact: true }),
      ).toBeVisible()
      expect(combined.every((title) => !title.includes('reference-26'))).toBe(
        true,
      )
    }
    await page.getByRole('link', { name: '前のページ' }).click()
    await expect(results).toHaveCount(20)
    expect(await results.allTextContents()).toEqual(before)
  }
})
