import { expect, test } from './harness.mjs'
import { seedReviewIssues } from '../ui/review-issue-seed.mjs'

test.use({ extensions: ['issues'] })

test('W4 課題の優先順位・詳細・検索の境界と既存の題の同期', async ({
  page,
  scene,
}) => {
  await seedReviewIssues(scene.db)
  await page.goto(scene.origin + '/issues')
  const main = page.getByRole('main')
  const pending = main.getByRole('region', { name: /知らせる待ち/ })
  await expect(pending).toContainText('2件の声のうち1件')
  await expect(
    pending.getByRole('link', { name: '承認待ち 1件を確認する' }),
  ).toBeVisible()
  await expect(main.getByRole('table')).toHaveCount(2)
  await expect(main.getByRole('searchbox')).toHaveCount(0)
  await expect(page.locator('nav a[href="/issues"]')).toContainText('1')
  const open = main.getByRole('table', { name: '開いている' })
  await expect(open).toContainText('領収書の一括ダウンロード')
  const resolved = main.getByRole('table', { name: '直した' })
  const align = async (table) =>
    table
      .locator('thead th')
      .evaluateAll((cells) =>
        cells
          .slice(0, 3)
          .map((cell) => Math.round(cell.getBoundingClientRect().right)),
      )
  expect(await align(open)).toEqual(await align(resolved))
  await resolved
    .getByRole('link', { name: '領収書の宛名を変更できるようにする' })
    .click()
  await expect(main).toContainText('知らせた')
  await expect(main).toContainText('山田 花')
  await expect(main).toContainText('領収書の宛名を変更できますか')
  await expect(
    main.getByRole('link', { name: 'GitHub で開く' }),
  ).toHaveAttribute('href', /issues\/43$/)
  await expect(main.getByRole('button', { name: /デモ用/ })).toHaveCount(0)
  const blocked = await page.request.post(
    scene.origin + '/issues/example/helpdesk/42/demo-close',
    { headers: { Origin: scene.origin } },
  )
  expect(blocked.status()).toBe(404)
  await expect(main).toContainText('直す前')
  await expect(main).toContainText('直した後')
  await expect(main).toContainText('1日ぶん')
  await page.getByRole('link', { name: '課題の一覧に戻る' }).click()
  const write = scene.db.prepare(
    'INSERT INTO issues_data(key,value) VALUES(?,?)',
  )
  for (let n = 1; n <= 19; n++) {
    const issue = 100 + n
    await scene.db.batch([
      write.bind(
        'issue/example/helpdesk/' + issue,
        JSON.stringify({
          title: '追加課題' + n,
          state: 'open',
          closedAt: null,
        }),
      ),
      write.bind(
        'link/example/helpdesk/' + issue + '/1',
        JSON.stringify({ repository: 'example/helpdesk', issue, number: 1 }),
      ),
    ])
    if (n === 18) {
      await page.reload()
      await expect(main.getByRole('searchbox')).toHaveCount(0)
    }
  }
  await page.reload()
  await main.getByRole('searchbox').fill('追加課題19')
  await expect(
    main.getByRole('link', { name: '追加課題19', exact: true }),
  ).toBeVisible()
  await expect(
    main.getByRole('link', { name: '追加課題18', exact: true }),
  ).toHaveCount(0)
})
