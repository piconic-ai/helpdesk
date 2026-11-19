import { choose } from './choice.mjs'
import { capture, editFiltersWhileLoading, expect, test } from './harness.mjs'

test.use({ extensions: ['feedback'] })

test('フィルターの読み込み中に選んだフィードバックの並び順も反映する', async ({
  page,
  scene,
}) => {
  const order = page.locator('select[name=sort]')
  await editFiltersWhileLoading(
    page,
    scene.origin + '/?view=feedback',
    async () => {
      await choose(page, '並び順', 'unreviewed')
    },
  )
  await expect(page).toHaveURL(/sort=unreviewed/)
  await expect(order).toHaveValue('unreviewed')
})

test('W2 連絡先を空にして意見を送り、一覧で確認・取り消し・並べ替えができる', async ({
  page,
  scene,
}) => {
  const body = '匿名で送った表示についての提案'
  await page.goto(scene.origin + '/help/feedback/slide')
  await page.getByLabel('ご意見・ご要望').fill(body)
  const email = page.getByRole('textbox', { name: /連絡先メールアドレス/ })
  await expect(email).toHaveAccessibleName(/任意/)
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(
    /フィードバックを受け付けました（#\d+）/,
  )
  await expect(
    page.getByText('フィードバックへの返信はありません。'),
  ).toBeVisible()
  await capture(
    page,
    'W2',
    '01-receipt',
    '連絡先を入力せずに受付番号を受け取る',
  )
  await page.goto(scene.origin + '/?view=feedback')
  const order = page.locator('select[name=sort]')
  await expect(order.locator('option')).toHaveText(['新しい順', '未確認を先に'])
  const row = page
    .getByRole('listitem')
    .filter({ has: page.getByRole('link', { name: new RegExp(body) }) })
  await expect(row).toContainText('匿名')
  await page.setViewportSize({ width: 375, height: 812 })
  const previousHeight = (await row.boundingBox()).height
  await row.getByRole('button', { name: '確認済みにする' }).click()
  await expect(page).toHaveURL(/\?view=feedback/)
  await expect(row).toContainText('確認済み')
  expect((await row.boundingBox()).height).toBe(previousHeight)
  await choose(page, '並び順', { label: '未確認を先に' })
  await expect(page.locator('a.conversation-row').first()).not.toContainText(
    body,
  )
  await choose(page, '並び順', { label: '新しい順' })
  await expect(page.locator('a.conversation-row').first()).toContainText(body)
  await row.getByRole('link').click()
  await expect(page.getByRole('heading', { name: body })).toBeVisible()
  await expect(page.getByText(/連絡先が登録されていない/)).toBeVisible()
  await expect(
    page.getByRole('textbox', { name: '返信', exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '問い合わせに変更' }),
  ).toBeDisabled()
  const number = Number(new URL(page.url()).pathname.split('/').pop())
  const convert = await page.request.post(
    scene.origin + '/actions/feedback.convert',
    {
      headers: { Origin: scene.origin, Accept: 'application/json' },
      form: { number: String(number) },
    },
  )
  expect(convert.status()).toBe(409)
  expect(
    await scene.db
      .prepare('SELECT kind FROM conversations WHERE number=?')
      .bind(number)
      .first('kind'),
  ).toBe('feedback')
  await page.goto(scene.origin + '/?view=feedback')
  const other = page.locator('li[data-number="10"]')
  await other.getByRole('button', { name: '確認済みにする' }).click()
  await page.getByRole('button', { name: '元に戻す' }).click()
  await expect(other).toContainText('受付済み')
  await other.getByRole('link').click()
  const heading = page.locator('.thread-toolbar')
  await expect(
    heading.getByRole('button', { name: '確認済みにする' }),
  ).toBeVisible()
  await expect(
    heading.getByRole('button', { name: '問い合わせに変更' }),
  ).toBeVisible()
  await capture(
    page,
    'W2',
    '02-heading',
    '会話の見出しで確認・問い合わせへの変更を選べる',
  )
})
