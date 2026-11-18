import { capture, expect, test } from './harness.mjs'

const row = (page, number) =>
  page.locator('.inbox-item[data-number="' + number + '"] a.conversation-row')
const check = (page, number) =>
  page.getByRole('checkbox', { name: '#' + number + 'を選択', exact: true })
const choose = async (bar, name, option) => {
  await bar.getByRole('button', { name, exact: true }).click()
  await bar.getByRole('button', { name: option, exact: true }).click()
}

test('J13 選択した問い合わせをまとめて担当・分類・完了し、元に戻す', async ({
  page,
  scene,
}) => {
  for (const n of [1, 7]) await check(page, n).check()
  const bar = page.getByRole('region', { name: 'まとめて操作' })
  await expect(bar).toContainText('2件を選択')
  await choose(bar, '担当者を選ぶ', 'mori')
  await expect(
    row(page, 7).getByRole('img', { name: '担当者 mori' }),
  ).toBeVisible()
  await choose(bar, 'ラベルを付ける', '経理')
  await expect(row(page, 7)).toContainText('経理')
  await capture(page, 'J13', '01-selected', '2件の担当者とラベルを設定する')
  await bar.getByRole('button', { name: '完了にする' }).click()
  await expect(row(page, 1)).toHaveCount(0)
  await expect(row(page, 7)).toHaveCount(0)
  await capture(page, 'J13', '02-closed', '完了した2件が未対応から外れる')
  await page.getByRole('button', { name: '元に戻す' }).click()
  for (const n of [1, 7]) await expect(row(page, n)).toBeVisible()
  await expect(
    row(page, 7).getByRole('img', { name: '担当者 mori' }),
  ).toBeVisible()
  await capture(
    page,
    'J13',
    '03-restored',
    '直前の完了だけを取り消し、未対応に戻す',
  )
  for (const n of [1, 7]) await check(page, n).check()
  await bar.getByRole('button', { name: '迷惑メールにする' }).click()
  await expect(row(page, 7)).toHaveCount(0)
  await page.goto(scene.origin + '/?status=spam')
  await expect(row(page, 7)).toBeVisible()
})

test('一覧は最後の受信からの待ち時間で並び、種別と添付を区別し、戻ると同じページを表示する', async ({
  page,
  scene,
}) => {
  await scene.db
    .prepare(
      "UPDATE messages SET created_at=created_at-172800000 WHERE id='in-7'",
    )
    .run()
  await scene.db
    .prepare(
      "WITH RECURSIVE n(v) AS (VALUES(1) UNION ALL SELECT v+1 FROM n WHERE v<26) INSERT INTO conversations(product,mailbox,contact,subject,kind,status,created_at) SELECT 'slide','support@example.com','page@example.net','項目'||v,'inquiry','open',999999 FROM n",
    )
    .run()
  await page.reload()
  await expect(row(page, 3)).toContainText('Desk')
  await expect(
    row(page, 3).getByRole('img', { name: 'メモ', exact: true }),
  ).toBeVisible()
  await expect(
    row(page, 7).getByRole('img', { name: '添付あり' }),
  ).toBeVisible()
  await expect(row(page, 7).locator('.wait-overdue')).toBeVisible()
  await expect(row(page, 7).locator('time')).toContainText(/日/)
  await page.getByRole('combobox', { name: '並び順' }).selectOption('newest')
  await expect(page).toHaveURL(/sort=newest/)
  await page.getByRole('link', { name: '次のページ' }).click()
  const location = page.url()
  const first = page.locator('a.conversation-row').first()
  const title = await first.locator('.row-subject').innerText()
  await first.click()
  await page.goBack()
  await expect(page).toHaveURL(location)
  await expect(first.locator('.row-subject')).toHaveText(title)
  await first.click()
  const back = page.locator('.thread-header > a')
  await expect(back).toHaveAttribute(
    'href',
    new URL(location).pathname + new URL(location).search,
  )
  await back.click()
  await expect(page).toHaveURL(location)
  await first.click()
  await page.waitForURL(/conversation\//, { waitUntil: 'load' })
  await page.keyboard.press('u')
  await expect(page).toHaveURL(location)
  await page.goto(
    scene.origin + '/conversation/1?inbox=https%3A%2F%2Fexample.invalid',
  )
  await expect(back).toHaveAttribute('href', '/')
  await page.goto(scene.origin + '/?product=desk')
  await expect(row(page, 3)).not.toContainText('Desk')
})

test('一覧では文字入力中のショートカットを無効にし、キーボードで行を移動・担当・完了できる', async ({
  page,
}) => {
  const search = page.getByRole('searchbox')
  await search.fill('')
  await search.press('j')
  await expect(search).toHaveValue('j')
  await search.press('Tab')
  await page.keyboard.press('j')
  const links = page.locator('a.conversation-row')
  await expect(links.nth(0)).toBeFocused()
  await page.keyboard.press('j')
  await expect(links.nth(1)).toBeFocused()
  await page.keyboard.press('k')
  await expect(links.nth(0)).toBeFocused()
  const target = links.nth(0)
  const href = await target.getAttribute('href')
  await page.keyboard.press('a')
  await expect(
    page
      .locator('a.conversation-row[href="' + href + '"]')
      .getByRole('img', { name: '担当者 sato' }),
  ).toBeVisible()
  await expect(target).toBeFocused()
  await page.keyboard.press('e')
  await expect(
    page.locator('a.conversation-row[href="' + href + '"]'),
  ).toHaveCount(0)
})

test('長い件名、担当者、複数のラベル、3通のやりとりが各幅で2行に収まる', async ({
  page,
}) => {
  const target = row(page, 11)
  for (const width of [1440, 1024, 375]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(
      target.getByRole('img', { name: '3通のやりとり' }),
    ).toBeVisible()
    const geometry = await target.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const line = (selector) => {
        const r = el.querySelector(selector).getBoundingClientRect()
        return { top: r.top, bottom: r.bottom }
      }
      const clipped = [
        ...el.querySelectorAll(
          '.row-sender,.row-subject,.row-labels .label-chip',
        ),
      ].filter((t) => t.scrollWidth > t.clientWidth)
      const chips = [
        ...el.querySelectorAll('.label-chip,.status-badge'),
      ].filter((t) => t.checkVisibility())
      return {
        height: rect.height,
        top: line('.row-top'),
        bottom: line('.row-bottom'),
        clipTitles: clipped.every((t) => t.title === t.textContent),
        single: chips.every((t) => t.getBoundingClientRect().height <= 32),
        documentFits: document.documentElement.scrollWidth <= innerWidth,
        width: el.querySelector('.row-subject').getBoundingClientRect().width,
      }
    })
    expect(geometry.height, width + 'px row height').toBe(64)
    expect(geometry.top.bottom).toBeLessThanOrEqual(geometry.bottom.top)
    expect(geometry.clipTitles).toBe(true)
    expect(geometry.single).toBe(true)
    expect(geometry.documentFits).toBe(true)
    expect(geometry.width).toBeGreaterThan(0)
  }
})
