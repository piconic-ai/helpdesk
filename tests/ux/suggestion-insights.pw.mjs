import { choose } from './choice.mjs'
import { test, expect } from './harness.mjs'
import { fixedTime } from '../ui/seed.mjs'

test.use({ extensions: ['articles', 'metrics'] })

test('記事ごとの提示・閲覧・解決を読み、記事が無かった質問から該当製品の下書きを始める', async ({
  page,
  scene,
}) => {
  const question = '印刷の倍率を固定したい'
  const insert = scene.db.prepare(
    'INSERT INTO suggestion_presentations(id,product,surface,question,articles,highest_score,at) VALUES(?,?,?,?,?,?,?)',
  )
  const open = scene.db.prepare(
    "INSERT INTO suggestion_reactions(presentation,action,article,at) VALUES(?,'opened','receipt',?)",
  )
  const ids = Array.from({ length: 5 }, () => crypto.randomUUID())
  await scene.db.batch([
    ...ids
      .slice(0, 3)
      .map((id) =>
        insert.bind(
          id,
          'slide',
          'chat',
          '領収書はどこですか',
          JSON.stringify([{ id: 'receipt', score: 0.84 }]),
          0.84,
          fixedTime,
        ),
      ),
    insert.bind(ids[3], 'slide', 'form', question, '[]', 0.31, fixedTime),
    insert.bind(ids[4], 'desk', 'chat', '別製品の質問', '[]', null, fixedTime),
    open.bind(ids[0], fixedTime + 1),
  ])
  await page.goto(scene.origin + '/articles')
  const row = page
    .locator('[data-ui="article-list-row"]')
    .filter({ hasText: '領収書を発行する' })
  await expect(row).toContainText('提示 3回')
  await expect(row).toContainText('閲覧 1回')
  await expect(row).toContainText('解決率 0%')
  await expect(row).toContainText('見直し候補')
  await page
    .getByRole('link', { name: '記事が無かった質問', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: '記事が無かった質問' }),
  ).toBeVisible()
  await choose(page, 'プロジェクト', 'slide')
  await expect(page.getByText('別製品の質問')).toHaveCount(0)
  await page
    .getByRole('link', { name: 'この質問から記事を書く：' + question })
    .click()
  await expect(page.getByLabel('題名')).toHaveValue(question)
  await expect(page.locator('select[name=product]')).toHaveValue('slide')
  await page
    .getByLabel('本文', { exact: true })
    .fill('印刷ダイアログで倍率を指定します。')
  await page.getByRole('button', { name: '下書きを保存' }).click()
  await expect(page.getByRole('heading', { name: '記事の編集' })).toBeVisible()
  await page.goto(scene.origin + '/metrics')
  const rate = page.locator('[data-ui=metric-card]').filter({
    has: page.getByRole('heading', { name: '待たずに解決できた割合' }),
  })
  await expect(rate).toContainText('0件 / 3件')
  await choose(page, 'プロジェクト', 'desk')
  await expect(rate).toContainText('データなし')
})
