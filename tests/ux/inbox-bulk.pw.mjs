import { choose } from './choice.mjs'
import { capture, expect, test } from './harness.mjs'

const row = (page, number) =>
  page.locator('.inbox-item[data-number="' + number + '"] a.conversation-row')
const check = (page, number) =>
  page
    .locator('.inbox-item[data-number="' + number + '"]')
    .getByRole('checkbox')
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
    await expect(async () => {
      const layout = await bar.evaluate((el) => {
        const count = el
          .querySelector('[data-selected-count]')
          .getBoundingClientRect()
        const buttons = [...el.querySelectorAll('button')]
          .filter((button) =>
            button.checkVisibility({ visibilityProperty: true }),
          )
          .map((button) => {
            const rect = button.getBoundingClientRect()
            return { center: rect.y + rect.height / 2, right: rect.right }
          })
        return {
          center: count.y + count.height / 2,
          right: el.getBoundingClientRect().right,
          buttons,
        }
      })
      expect(layout.buttons.length).toBeGreaterThan(0)
      for (const button of layout.buttons) {
        expect(button.center).toBeCloseTo(layout.center, 0)
        expect(button.right).toBeLessThanOrEqual(layout.right + 1)
      }
    }).toPass({ timeout: 5000 })
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
  await expect(
    page.getByRole('heading', { name: '検索結果', exact: true }),
  ).toBeVisible()
  await search.fill('')
  await expect(page).toHaveURL((url) => !url.searchParams.has('q'))
  await expect(row(page, 11)).toBeVisible()
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

test('選択と絞り込みを維持し、操作した行と件数だけを更新する', async ({
  page,
  scene,
}) => {
  const destination = scene.origin + '/?product=slide'
  const delayed = Promise.withResolvers()
  const release = Promise.withResolvers()
  await page.route('**/components/local-requests.js', async (route) => {
    delayed.resolve()
    await release.promise
    await route.continue()
  })
  await page.goto(destination)
  const unchanged = await row(page, 1).elementHandle()
  const filters = await page.locator('[data-live-filters]').elementHandle()
  const count = page.locator('[data-inbox-count]')
  const before = parseInt(await count.textContent())
  const sidebar = page.locator(
    '.sidebar-views a[aria-current=page] .sidebar-count',
  )
  const beforeSidebar = Number(await sidebar.textContent())
  await check(page, 1).check()
  let posts = 0
  page.on('request', (r) => {
    if (new URL(r.url()).pathname === '/inbox/change') posts++
  })
  const close = page.locator(
    '.inbox-item[data-number="7"] [data-quick="closed"]',
  )
  await close.focus()
  await page.keyboard.press('Enter')
  try {
    await delayed.promise
    await page.keyboard.press('Enter')
    await expect(row(page, 7)).toBeVisible()
    expect(posts).toBe(0)
  } finally {
    release.resolve()
  }
  await expect(row(page, 7)).toHaveCount(0)
  await expect(count).toHaveText(before - 1 + ' 件')
  await expect(sidebar).toHaveText(String(beforeSidebar - 1))
  await expect(check(page, 1)).toBeChecked()
  expect(await unchanged.evaluate((node) => node.isConnected)).toBe(true)
  expect(await filters.evaluate((node) => node.isConnected)).toBe(true)
  expect(posts).toBe(1)
  await expect(page).toHaveURL(destination)
  await page.getByRole('button', { name: '元に戻す' }).click()
  await expect(row(page, 7)).toBeFocused()
  await expect(count).toHaveText(before + ' 件')
  await expect(sidebar).toHaveText(String(beforeSidebar))
  await expect(check(page, 1)).toBeChecked()
})

test('保存後に取得が失敗しても、再表示では操作を重ねない', async ({ page }) => {
  let writes = 0
  let rejected = false
  page.on('request', (r) => {
    if (new URL(r.url()).pathname === '/inbox/change') writes++
  })
  await page.route(
    (url) => url.pathname === '/',
    async (route) => {
      if (
        !rejected &&
        route.request().headers()['x-helpdesk-view'] === 'page'
      ) {
        rejected = true
        return route.fulfill({ status: 503, body: 'Unavailable' })
      }
      await route.continue()
    },
  )
  await row(page, 7).focus()
  await page.keyboard.press('e')
  const notice = page
    .getByRole('alert')
    .filter({ hasText: '一覧を更新できませんでした。' })
  await expect(notice).toContainText('完了にしました。')
  await expect(row(page, 7)).toBeVisible()
  await notice.getByRole('button', { name: '一覧を更新' }).click()
  await expect(row(page, 7)).toHaveCount(0)
  expect(writes).toBe(1)
  await page.getByRole('button', { name: '元に戻す' }).click()
  await expect(row(page, 7)).toBeVisible()
})

test.describe('フィードバックの行操作', () => {
  test.use({ extensions: ['feedback'] })
  test('確認と取り消しは現在の状態の絞り込みに反映される', async ({
    page,
    scene,
  }) => {
    const destination = scene.origin + '/?view=feedback&status=received'
    await page.goto(destination)
    const form = await page.locator('[data-live-filters]').elementHandle()
    const review = page
      .locator('.inbox-item[data-number="10"]')
      .getByRole('button', { name: '確認済みにする' })
    await review.focus()
    await review.click()
    await expect(row(page, 10)).toHaveCount(0)
    await expect(
      page
        .getByRole('status')
        .filter({ hasText: 'フィードバックを確認済みにしました。' }),
    ).toBeVisible()
    await page.getByRole('button', { name: '元に戻す' }).click()
    await expect(row(page, 10)).toBeVisible()
    await expect(
      page
        .locator('.inbox-item[data-number="10"]')
        .getByRole('button', { name: '確認済みにする' }),
    ).toBeAttached()
    await expect(page).toHaveURL(destination)
    expect(await form.evaluate((el) => el.isConnected)).toBe(true)
    await check(page, 10).check()
    await expect(
      page.getByRole('region', { name: 'まとめて操作' }),
    ).toContainText('1件を選択中')
  })
})

test('完了した行を次ページから補い、元に戻すとページ送りが復元する', async ({
  page,
  scene,
}) => {
  await scene.db
    .prepare(
      "WITH RECURSIVE n(v) AS (VALUES(1) UNION ALL SELECT v+1 FROM n WHERE v<21) INSERT INTO conversations(product,mailbox,contact,subject,kind,status,created_at) SELECT 'slide','support@example.com','page@example.net','ページ境界 '||v,'inquiry','open',999999+v FROM n",
    )
    .run()
  await page.setViewportSize({ width: 1024, height: 400 })
  const url = new URL('/', scene.origin)
  url.search = new URLSearchParams({
    query: 'ページ境界',
    status: 'open',
    product: 'slide',
  }).toString()
  await page.goto(url.href)
  const rows = page.locator('.inbox-item')
  const pager = page.getByRole('navigation', { name: 'ページ送り' })
  await expect(rows).toHaveCount(20)
  await expect(pager).toContainText('1 / 2')
  const ids = await rows.evaluateAll((items) =>
    items.map((item) => item.dataset.number),
  )
  const active = rows.nth(12).locator('.conversation-row')
  await active.focus()
  const at = await page.evaluate(() => scrollY)
  expect(at).toBeGreaterThan(0)
  await page.keyboard.press('e')
  await expect(row(page, ids[12])).toHaveCount(0)
  await expect(rows).toHaveCount(20)
  await expect(pager).toHaveCount(0)
  expect(ids).not.toContain(await rows.last().getAttribute('data-number'))
  await expect(row(page, ids[13])).toBeFocused()
  expect(await page.evaluate(() => scrollY)).toBe(at)
  await page.getByRole('button', { name: '元に戻す' }).click()
  await expect(pager).toContainText('1 / 2')
  expect(
    await rows.evaluateAll((items) => items.map((item) => item.dataset.number)),
  ).toEqual(ids)
  await expect(page).toHaveURL(url.href)
})

test('リクエスト処理の読み込み中に画面を移っても、確定済みの操作だけ送信する', async ({
  page,
  scene,
}) => {
  const requested = Promise.withResolvers()
  const release = Promise.withResolvers()
  await page.route('**/components/local-requests.js', async (route) => {
    requested.resolve()
    await release.promise
    await route.continue()
  })
  await page.reload()
  const posted = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/inbox/change',
  )
  await row(page, 7).focus()
  await page.keyboard.press('e')
  try {
    await requested.promise
    await page.locator('.sidebar-item[href="/account"]').click()
    await expect(page).toHaveURL(scene.origin + '/account')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'アカウント',
    )
  } finally {
    release.resolve()
  }
  expect((await posted).ok()).toBe(true)
  expect(
    await scene.db
      .prepare('SELECT status FROM conversations WHERE number=7')
      .first('status'),
  ).toBe('closed')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('アカウント')
  await expect(page.getByRole('button', { name: '元に戻す' })).toHaveCount(0)
})
