import { choose } from './choice.mjs'
import { test, expect, capture } from './harness.mjs'
test.use({ extensions: ['articles', 'feedback', 'metrics'] })

test('A3 声を受付期間・プロダクト・ラベル別に集計し、同じ条件の問い合わせとフィードバックを開く', async ({
  page,
  scene,
}) => {
  const date = '2026-11-01'
  const set = scene.db.prepare(
    'UPDATE conversations SET created_at=? WHERE number=?',
  )
  const label = scene.db.prepare('INSERT INTO labels(number,name) VALUES(?,?)')
  const midnight = Date.parse(date + 'T00:00:00+09:00')
  await scene.db.batch([
    set.bind(midnight, 1),
    set.bind(midnight + 86000000, 10),
    set.bind(midnight - 1, 2),
    set.bind(midnight, 3),
    set.bind(midnight, 9),
    ...[1, 2, 3, 9, 10].map((number) => label.bind(number, '新しい受付')),
  ])
  await page.goto(scene.origin + '/voices')
  await choose(page, 'プロダクト', 'slide')
  await page.getByLabel('開始日').fill(date)
  await page.getByLabel('終了日').fill(date)
  await page.getByRole('button', { name: '集計する' }).click()
  const main = page.getByRole('main')
  await expect(main).toContainText('問い合わせとフィードバック 2件')
  await capture(
    page,
    'review-4-voices',
    '01-summary',
    '日本時間の期間内に届いた問い合わせとフィードバックを集計',
  )
  for (const [name, condition] of [
    ['新しい受付', 'label='],
    ['Slide', 'product=slide'],
    ['2026-11', 'month=2026-11'],
  ]) {
    const group = main.getByRole('link', { name, exact: true })
    await expect(group.locator('..')).toContainText('2件')
    await group.click()
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/voices/conversations' &&
        url.search.includes(condition),
    )
    await expect(main.getByRole('listitem')).toHaveCount(2)
    await expect(main.getByRole('link', { name: /^SLD-1 / })).toBeVisible()
    await expect(main.getByRole('link', { name: /^SLD-10 / })).toBeVisible()
    await expect(main).toContainText('フィードバック')
    await capture(
      page,
      'review-4-voices',
      '02-results',
      '集計行から、同じ条件に一致する2件を開く',
    )
    await page.goBack()
  }
  await main.getByRole('link', { name: '新しい受付', exact: true }).click()
  await main.getByRole('link', { name: /^SLD-10 / }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    '運営画面をキーボードで使っています',
  )
})

test('A4 元の会話を見ながら候補を記事にし、候補一覧から保存した下書きを再開する', async ({
  page,
  scene,
}) => {
  const topic = '領収書の宛名変更の手順'
  await page.goto(scene.origin + '/conversation/1')
  const panel = page.locator('[data-extension="articles"]')
  await panel
    .getByRole('button', { name: '記事候補を書く', exact: true })
    .click()
  await panel.getByLabel('記事にする内容').fill(topic)
  await panel
    .locator('form')
    .getByRole('button', { name: '記事の候補に追加', exact: true })
    .click()
  await page.getByRole('link', { name: 'ヘルプ記事', exact: true }).click()
  await page.getByRole('link', { name: /候補（1件）/ }).click()
  await expect(
    page.getByRole('link', { name: '元の会話 SLD-1', exact: true }),
  ).toHaveAttribute('href', '/conversation/1')
  await capture(
    page,
    'review-4-voices',
    '03-candidates',
    '候補の題と元の会話を確認',
  )
  await page.getByRole('link', { name: new RegExp(topic) }).click()
  await expect(page.getByLabel('題名')).toHaveValue(topic)
  await expect(page.getByRole('blockquote')).toContainText('経理に提出するため')
  const source = page.getByRole('link', { name: '元の会話 SLD-1 を開く' })
  const tab = page.waitForEvent('popup')
  await source.click()
  const original = await tab
  await expect(original.getByRole('heading', { level: 1 })).toContainText(
    '領収書の宛名を変更できますか',
  )
  await original.close()
  await page.getByLabel('本文').fill('注文履歴から変更できます。')
  await capture(
    page,
    'review-4-voices',
    '04-source-editor',
    '元の質問を参照しながら公開用の手順だけを書く',
  )
  await page.getByRole('button', { name: 'プレビュー' }).click()
  await expect(
    page.locator('[data-article-preview] article'),
  ).not.toContainText('経理に提出するため')
  await expect(page.getByRole('blockquote')).toBeVisible()
  await page.getByRole('button', { name: '下書きを保存' }).click()
  await expect(page.getByText('下書きを保存しました。')).toBeVisible()
  const saved = new URL(page.url())
  const id = saved.searchParams.get('id')
  expect(
    (
      await page.request.get(scene.origin + '/help/articles/slide/' + id)
    ).status(),
  ).toBe(404)
  await page.goto(scene.origin + '/articles/candidates')
  await expect(page.getByRole('main')).toContainText('着手済み')
  await page.getByRole('link', { name: new RegExp(topic) }).click()
  await expect(page.getByLabel('本文')).toHaveValue(
    '注文履歴から変更できます。',
  )
  expect(new URL(page.url()).searchParams.get('id')).toBe(id)
  await expect(source).toBeVisible()
})
