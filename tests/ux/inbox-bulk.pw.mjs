import { choose } from './choice.mjs'
import { capture, expect, test } from './harness.mjs'

const row = (page, number) =>
  page.locator('.inbox-item[data-number="' + number + '"] a.conversation-row')
const check = (page, number) =>
  page.getByRole('checkbox', { name: 'SLD-' + number + 'を選択', exact: true })
const bulkChoice = async (bar, name, option) => {
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
  await bulkChoice(bar, '担当者を選ぶ', '森 直子')
  await expect(
    row(page, 7).getByRole('img', { name: '担当者 森 直子' }),
  ).toBeVisible()
  await bulkChoice(bar, 'ラベルを付ける', '経理')
  await expect(row(page, 7)).toContainText('経理')
  await capture(page, 'J13', '01-selected', '2件の担当者とラベルを設定する')
  await bar.getByRole('button', { name: '完了にする' }).click()
  await expect(row(page, 1)).toHaveCount(0)
  await expect(row(page, 7)).toHaveCount(0)
  await capture(page, 'J13', '02-closed', '完了した2件が未対応から外れる')
  await page.getByRole('button', { name: '元に戻す' }).click()
  for (const n of [1, 7]) await expect(row(page, n)).toBeVisible()
  await expect(
    row(page, 7).getByRole('img', { name: '担当者 森 直子' }),
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

test('一括操作は画面幅に合わせて1行に収まり、その他から操作できる', async ({
  page,
}) => {
  const bar = page.getByRole('region', { name: 'まとめて操作' })
  const clear = bar.getByRole('button', { name: '選択を解除' })
  const more = bar.getByRole('button', { name: 'その他', exact: true })
  const assign = bar.getByRole('button', { name: '担当者を選ぶ' })
  const label = bar.getByRole('button', { name: 'ラベルを付ける' })
  const close = bar.getByRole('button', { name: '完了にする' })
  const spam = bar.getByRole('button', { name: '迷惑メールにする' })
  await check(page, 7).check()

  for (const width of [320, 375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const count = await bar.getByText('1件を選択中').boundingBox()
    const bounds = await bar.boundingBox()
    for (const button of await bar.getByRole('button').all()) {
      const box = await button.boundingBox()
      expect(box.y + box.height / 2).toBeCloseTo(count.y + count.height / 2, 0)
      expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1)
    }
    if (width <= 375) {
      await expect(more).toBeVisible()
      await expect(spam).toBeHidden()
    }
    if (width === 1440) {
      await expect(more).toBeHidden()
      for (const action of [assign, label, close, spam])
        await expect(action).toBeVisible()
    }
  }

  await page.setViewportSize({ width: 320, height: 900 })
  await clear.focus()
  await page.keyboard.press('Tab')
  await expect(more).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(assign).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(label).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(bar.getByRole('button', { name: '経理' })).toBeVisible()
  await expect(page.locator('#bulk-label :focus')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(label).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(more).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(assign).toBeFocused()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(more).toBeHidden()
  await expect(assign).toBeFocused()
  await page.setViewportSize({ width: 320, height: 900 })
  await expect(more).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(assign).toBeFocused()
  await page.keyboard.press('End')
  await expect(spam).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(row(page, 7)).toHaveCount(0)
  await page.getByRole('button', { name: '元に戻す' }).click()
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
  await choose(page, '並び順', 'newest')
  await expect(page).toHaveURL(/sort=newest/)
  await page.getByRole('link', { name: '次のページ' }).click()
  await expect(page).toHaveURL((url) => url.searchParams.get('page') === '2')
  const location = page.url()
  const first = page.locator('a.conversation-row').first()
  const title = await first.locator('.row-subject').innerText()
  const destination = await first.getAttribute('href')
  await first.click()
  await expect(page).toHaveURL(new URL(destination, location).href)
  await page.goBack()
  await expect(page).toHaveURL(location)
  await expect(first.locator('.row-subject')).toHaveText(title)
  await first.click()
  const back = page.locator('.thread-toolbar > a')
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
  await expect(row(page, 3).locator('.row-product')).toContainText('Desk')
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
      .getByRole('img', { name: '担当者 佐藤 優' }),
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
    expect(geometry.height, width + 'px row height').toBeGreaterThanOrEqual(64)
    expect(
      await target
        .locator('.row-sender')
        .evaluate((e) => e.scrollWidth <= e.clientWidth),
    ).toBe(true)
    expect(geometry.top.bottom).toBeLessThanOrEqual(geometry.bottom.top)
    expect(geometry.clipTitles).toBe(true)
    expect(geometry.single).toBe(true)
    expect(geometry.documentFits, width + 'px document width').toBe(true)
    expect(geometry.width).toBeGreaterThan(70)
  }
})
