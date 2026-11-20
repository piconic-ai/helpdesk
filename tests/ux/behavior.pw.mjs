import { expect, test } from './harness.mjs'
test.use({ demo: true })

const firstRow = (page) => page.locator('.inbox-item').first()
const box = async (locator) => {
  const rect = await locator.boundingBox()
  expect(rect).not.toBeNull()
  return [rect.x, rect.y, rect.width, rect.height].map(Math.round)
}
test('一括選択・範囲選択とメニュー、クイック操作、トーストが行を動かさない', async ({
  page,
}) => {
  for (const width of [375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const row = firstRow(page)
    const before = await box(row)
    const fields = page.locator('.row-select input')
    const all = page.getByRole('checkbox', { name: 'すべて選択' })
    await fields.first().check()
    await fields.nth(2).click({ modifiers: ['Shift'] })
    await expect(page.locator('[data-selected-count]')).toHaveText(
      '3件を選択中',
    )
    expect(await all.evaluate((el) => el.indeterminate)).toBe(true)
    expect(await box(row)).toEqual(before)
    await all.check()
    await expect(page.locator('.row-select input:not(:checked)')).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(all).not.toBeChecked()
    const trigger = page.getByRole('button', { name: '絞り込み', exact: true })
    await trigger.click()
    expect(await box(row)).toEqual(before)
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
    await row.hover()
    expect(await box(row)).toEqual(before)
    await row.getByRole('button', { name: '自分が担当する' }).click()
    const toast = page.locator('[data-change-notice]')
    await expect(toast).toContainText(/担当者|すでに/)
    expect(await box(row)).toEqual(before)
    const undo = toast.getByRole('button', { name: '元に戻す' })
    if (await undo.count()) {
      await undo.click()
      await expect(toast).toContainText('元に戻しました')
    }
  }
})
test('会話の操作帯は件名の長さとスクロールに依存せず、切り替えは150ms以内', async ({
  page,
  scene,
}) => {
  for (const width of [375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    let previous
    for (const id of [1, 11]) {
      await page.goto(scene.origin + '/conversation/' + id)
      const toolbar = page.getByRole('navigation', { name: '会話の操作' })
      const complete = toolbar.getByRole('button', { name: '完了にする' })
      const rect = await box(complete)
      if (previous) expect(rect).toEqual(previous)
      previous = rect
      const start = (await box(toolbar))[1]
      const scroll = await page.evaluate(() => {
        window.scrollTo({ top: 500, behavior: 'instant' })
        return scrollY
      })
      if (id === 11) expect(scroll).toBeGreaterThan(start)
      await expect
        .poll(async () => (await box(toolbar))[1])
        .toBeCloseTo(Math.max(0, start - scroll), 0)
      expect((await box(complete))[1]).toBeGreaterThanOrEqual(0)
    }
  }
  // Listen before navigation so even the initial paint transition is observed.
  await page.addInitScript(() => {
    window.pageTransitions = []
    document.addEventListener(
      'animationend',
      (event) => {
        if (event.target.matches('[data-ui-page]'))
          window.pageTransitions.push(event.elapsedTime * 1000)
      },
      true,
    )
  })
  for (const preference of ['no-preference', 'reduce']) {
    await page.emulateMedia({ reducedMotion: preference })
    await page.goto(scene.origin)
    if (preference === 'reduce') {
      expect(
        await page
          .locator('[data-ui-page]')
          .evaluate((el) => getComputedStyle(el).animationName),
      ).toBe('none')
      expect(await page.evaluate(() => window.pageTransitions)).toEqual([])
    } else {
      await expect
        .poll(() => page.evaluate(() => window.pageTransitions.length))
        .toBe(1)
      expect(
        await page.evaluate(() => window.pageTransitions[0]),
      ).toBeLessThanOrEqual(150.001)
    }
  }
})
test('ラベルの追加・名前変更・統合・削除で会話の件数と色を保つ', async ({
  scene,
  page,
}) => {
  await page.goto(scene.origin + '/settings/labels')
  const main = page.getByRole('main')
  const row = (name) =>
    main.getByRole('row').filter({
      has: page.getByRole('button', {
        name: name + 'の色を変更',
        exact: true,
      }),
    })
  await main.getByRole('button', { name: 'ラベルを追加' }).click()
  await page.getByLabel('ラベル名（20字まで）').fill('改善候補')
  await page.getByRole('button', { name: '追加する', exact: true }).click()
  await expect(row('改善候補')).toContainText('0件')
  await row('改善候補')
    .getByRole('button', { name: '改善候補の名前を変更' })
    .click()
  await row('改善候補').getByLabel('新しい名前（20字まで）').fill('経理の改善')
  await page.getByRole('button', { name: '名前を変更', exact: true }).click()
  await row('経理')
    .getByRole('button', { name: '操作：経理', exact: true })
    .click()
  await row('経理')
    .getByRole('combobox', { name: 'まとめる先', exact: true })
    .selectOption('経理の改善')
  await page.getByRole('button', { name: '別のラベルにまとめる' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('2件')
  await dialog.getByRole('button', { name: '別のラベルにまとめる' }).click()
  await expect(row('経理の改善')).toContainText('2件')
  await expect(row('経理')).toHaveCount(0)
  await row('経理の改善')
    .getByRole('button', { name: '操作：経理の改善' })
    .click()
  await page.getByRole('button', { name: '削除', exact: true }).click()
  await expect(dialog).toContainText('2件')
  await dialog.getByRole('button', { name: '削除', exact: true }).click()
  await expect(row('経理の改善')).toHaveCount(0)
})

test('候補が多いラベルを検索し、同じメニューで一括の付け外しを確認する', async ({
  page,
  scene,
}) => {
  const names = Array.from({ length: 10 }, (_, i) => '分類見本' + i)
  await scene.db.batch(
    names.map((name) =>
      scene.db.prepare('INSERT INTO label_names(name) VALUES(?)').bind(name),
    ),
  )
  await page.reload()
  for (const id of [1, 7])
    await page.getByRole('checkbox', { name: 'SLD-' + id + 'を選択' }).check()
  const trigger = page.getByRole('button', { name: 'ラベルを付ける' })
  await trigger.click()
  const menu = page.locator('#bulk-label')
  const search = menu.getByRole('searchbox')
  await search.fill('分類見本9')
  const choice = menu.getByRole('button', { name: '分類見本9', exact: true })
  await expect(menu.getByRole('button')).toHaveCount(1)
  await expect(menu.getByRole('link', { name: 'ラベルを管理' })).toBeVisible()
  for (const value of ['true', 'false']) {
    await choice.click()
    await expect(choice).toHaveAttribute('aria-pressed', value)
    await expect(search).toHaveValue('分類見本9')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  }
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('狭い一覧でも最新の文を読めて、行の操作が担当者と重ならない', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  const longRow = page.locator('.inbox-item[data-number="11"]')
  const subject = await longRow.locator('.row-subject').boundingBox()
  expect(subject.width).toBeGreaterThanOrEqual(300)
  expect((await longRow.boundingBox()).height).toBeLessThan(125)
  for (const row of await page.locator('.inbox-item:has(.row-actions)').all()) {
    await row.hover()
    const preview = await row.locator('.row-preview').boundingBox()
    const actions = await row.locator('.row-actions').boundingBox()
    expect(preview.width).toBeGreaterThanOrEqual(110)
    for (const part of await row
      .locator('.row-assignee:visible, .row-owner')
      .all()) {
      const metadata = await part.boundingBox()
      expect(
        actions.y >= metadata.y + metadata.height ||
          actions.x >= metadata.x + metadata.width,
      ).toBe(true)
    }
  }
})

test('単一の会話を選ぶと、一括担当メニューにも現在の担当者を表示する', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/?product=desk&assignee=sato%40example.com')
  await page.locator('.row-select input').check()
  await page.getByRole('button', { name: '担当者を選ぶ' }).click()
  await expect(
    page.locator('#bulk-assignee').getByRole('button', { name: '佐藤 優' }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test.describe('通常の受信箱', () => {
  test.use({ demo: false })
  test('すべての会話で待ち時間と状態を重ねずに表示する', async ({
    page,
    scene,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(scene.origin + '/?status=all')
    const row = page.locator('.inbox-item[data-number="4"]')
    const status = await row.locator('.status-badge').boundingBox()
    const time = await row.locator('.row-time:visible').boundingBox()
    expect(
      time.y + time.height <= status.y ||
        status.y + status.height <= time.y ||
        time.x + time.width <= status.x ||
        status.x + status.width <= time.x,
    ).toBe(true)
  })
})

test('畳んだナビでもプロダクト選択と自分のアカウントを絵で識別できる', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 812 })
  for (const selector of [
    '.app-sidebar .sidebar-account .avatar',
    '.app-sidebar button[popovertarget="product-switcher"] :is(svg,img)',
  ]) {
    const mark = page.locator(selector).first()
    await expect(mark).toBeVisible()
    expect((await mark.boundingBox()).width).toBeGreaterThanOrEqual(16)
    expect(
      await mark.evaluate((el) => {
        const r = el.getBoundingClientRect()
        const hit = document.elementFromPoint(
          r.x + r.width / 2,
          r.y + r.height / 2,
        )
        return !!hit && el.closest('a,button') === hit.closest('a,button')
      }),
    ).toBe(true)
  }
})

test('拡張の設定操作と保存期間の選択肢を横並びで読み取れる', async ({
  page,
  scene,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto(scene.origin + '/extensions')
  const offsets = await page
    .locator('[data-ui=extension-card]:has(footer a[href])')
    .evaluateAll((cards) => {
      const rows = new Map()
      for (const card of cards) {
        const top = Math.round(card.getBoundingClientRect().top)
        const entries = rows.get(top) || []
        entries.push(
          card.querySelector('footer a[href]').getBoundingClientRect().top,
        )
        rows.set(top, entries)
      }
      return [...rows.values()]
        .filter((group) => group.length > 1)
        .map((group) => Math.max(...group) - Math.min(...group))
    })
  expect(offsets.length).toBeGreaterThan(0)
  for (const offset of offsets) expect(offset).toBeLessThanOrEqual(1)
  for (const width of [375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 812 })
    await page.goto(scene.origin + '/settings/retention')
    for (const radio of await page.getByRole('radio').all()) {
      const aligned = await radio.evaluate((input) => {
        const label = input.labels[0]
        const text = document.createRange()
        text.selectNodeContents(label.lastChild)
        const caption = text.getBoundingClientRect()
        const circle = input.getBoundingClientRect()
        return (
          caption.left >= circle.right &&
          caption.top < circle.bottom &&
          caption.bottom > circle.top
        )
      })
      expect(aligned).toBe(true)
    }
  }
})

test('一覧の内部メモと、別の返信で起きた送信失敗を区別する', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/?product=desk&assignee=sato%40example.com')
  await expect(page.locator('[data-number="3"] .row-preview')).toContainText(
    '内部メモ · 経理チーム',
  )
  await page.goto(scene.origin)
  const row = page.locator('.inbox-item[data-number="4"]')
  await expect(row.locator('.row-preview')).toContainText('修正が完了')
  await expect(row).toContainText('別の返信で送信失敗')
  await page.goto(scene.origin + '/?label=請求')
  await expect(row.locator('.row-preview')).toContainText('修正が完了')
  await expect(row).toContainText('別の返信で送信失敗')
  await page.goto(scene.origin)
  const approval = page.locator('.inbox-item[data-number="5"]')
  await expect(approval).toContainText('別の返信が承認待ち')
  await page.setViewportSize({ width: 375, height: 812 })
  await approval.locator('a.conversation-row').click()
  await page.getByRole('link', { name: '承認待ちの返信へ' }).click()
  await expect(
    page
      .locator('article:has(:target)')
      .getByRole('button', { name: '承認して送信' }),
  ).toBeVisible()
})

test('短い会話の操作と担当表示が余分な段を作らず、混在するラベルの操作結果を説明する', async ({
  page,
}) => {
  for (const width of [375, 1024]) {
    await page.setViewportSize({ width, height: 812 })
    const row = page.locator('.inbox-item[data-number="7"]')
    expect((await row.boundingBox()).height).toBeLessThanOrEqual(
      width === 375 ? 68 : 65,
    )
    const wait = await row.locator('.row-time:visible').boundingBox()
    const avatar = await row.locator('.row-owner .avatar').boundingBox()
    if (width === 375) {
      expect(wait.x + wait.width).toBeLessThanOrEqual(avatar.x)
      expect(
        Math.abs(wait.y + wait.height / 2 - avatar.y - avatar.height / 2),
      ).toBeLessThan(2)
      expect(width - avatar.x - avatar.width).toBeLessThan(9)
    } else {
      expect(
        Math.abs(wait.x + wait.width - avatar.x - avatar.width),
      ).toBeLessThan(3)
    }
  }
  await page.locator('.row-select input').first().check()
  await page.locator('.row-select input').nth(1).check()
  await page.getByRole('button', { name: 'ラベルを付ける' }).click()
  await expect(
    page.locator('#bulk-label [aria-pressed=mixed]').first(),
  ).toBeVisible()
  await expect(page.locator('#bulk-label')).toContainText(
    '一部の会話に付いています',
  )
})

test('拡張からの返信には承認した人と承認前の区別がある', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/4')
  await expect(
    page.locator('article.message-outbound').filter({ hasText: '修正が完了' }),
  ).toContainText('佐藤 優が承認')
  await page.goto(scene.origin + '/conversation/2')
  await expect(
    page
      .locator('article.message-outbound')
      .filter({ hasText: 'GitHub Issue' })
      .first(),
  ).toContainText('拡張が作成')
})

test('起票欄の両端が揃い、公開チャットの送信失敗でも質問と操作位置が保たれる', async ({
  page,
  scene,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(scene.origin + '/issues/new')
  const form = page.locator('form.issue-section')
  expect((await form.boundingBox()).width).toBeLessThanOrEqual(560)
  const title = await form.getByLabel('タイトル').boundingBox()
  const summary = await form.getByLabel('公開する要約').boundingBox()
  expect(title.x).toBeCloseTo(summary.x, 0)
  expect(title.width).toBeCloseTo(summary.width, 0)
  await page.goto(scene.origin + '/help/chat/slide')
  const input = page.getByLabel('質問', { exact: true })
  await input.fill('明細の取得方法は？')
  const footer = page.locator('.chat-window footer')
  const before = await box(footer)
  await page.route(
    '**/help/chat/slide',
    (route) => route.fulfill({ status: 503, body: '' }),
    { times: 1 },
  )
  await page.getByRole('button', { name: '質問する' }).click()
  await expect(page.getByRole('alert')).toContainText('送信できませんでした')
  expect(await box(footer)).toEqual(before)
  await page.getByRole('button', { name: '閉じる' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(input).toHaveValue('明細の取得方法は？')
})

test('同じ位置に置き換わる知らせも、ポインターが離れてから消える', async ({
  page,
}) => {
  await page.clock.install()
  const notice = page.locator('[data-change-notice]')
  await page.evaluate(() => window.helpdeskToast('1件を保存しました'))
  const { x, y, width, height } = await notice.boundingBox()
  await page.mouse.move(x + width / 2, y + height / 2)
  await page.evaluate(() => window.helpdeskToast('2件を保存しました'))
  await page.clock.fastForward(5500)
  await expect(notice).toBeVisible()
  await page.mouse.move(1, 1)
  await page.clock.fastForward(5500)
  await expect(notice).toBeHidden()
})

test('質問を受け付けた後は入力の案内を消し、最初に受付番号を読める', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/help/chat/slide')
  await page.getByLabel('質問', { exact: true }).fill('配送が遅れています')
  await page.getByRole('button', { name: '質問する' }).click()
  const contact = page.getByRole('button', { name: '担当者に問い合わせる' })
  if (await contact.isVisible()) await contact.click()
  const unresolved = page.getByRole('button', { name: '解決しなかった' })
  if (await unresolved.isVisible()) await unresolved.click()
  await page.getByLabel('連絡先メールアドレス').fill('chat@example.test')
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(
    '問い合わせを受け付けました',
  )
  await expect(page.getByText(/困っていることを書いてください/)).toBeHidden()
  expect((await page.locator('.chat-receipt').boundingBox()).y).toBeLessThan(
    (await page.locator('#chat-turns').boundingBox()).y,
  )
})

test('会話の保存結果と取り消しは直近の本文・宛先・操作欄を隠さない', async ({
  page,
  scene,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(scene.origin + '/conversation/1?notice=note')
  const assertVisibleContent = async (toast) => {
    const notice = await toast.boundingBox()
    expect(notice).toBeTruthy()
    const composer = await page.locator('.composer').boundingBox()
    expect(notice.y).toBeGreaterThanOrEqual(composer.y)
    const address = await page.locator('.composer-addresses').boundingBox()
    expect(notice.y + notice.height).toBeLessThanOrEqual(address.y)
    const tabs = await page.locator('.composer-tabs').boundingBox()
    expect(notice.y).toBeGreaterThanOrEqual(tabs.y + tabs.height)
  }
  await assertVisibleContent(page.locator('[data-toast]:visible').first())
  await page
    .getByRole('textbox', { name: '返信', exact: true })
    .fill('明細を確認しました。')
  await page.getByRole('button', { name: '送信して完了' }).click()
  await assertVisibleContent(
    page.locator('[data-toast][data-undo-reply]:visible'),
  )
})

test('絞り込み中のラベルを外しても一覧を読み直さずに取り消せる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/?label=' + encodeURIComponent('請求'))
  const item = page.locator('.inbox-item').first()
  const number = await item.getAttribute('data-number')
  const row = page.locator('.inbox-item[data-number="' + number + '"]')
  const shell = await page.locator('#navigation').elementHandle()
  await row.locator('.row-select input').check()
  const bar = page.getByRole('region', { name: 'まとめて操作' })
  await expect(bar).toContainText('ラベル：請求')
  await bar.getByRole('button', { name: 'ラベルを付ける' }).click()
  await bar.getByRole('button', { name: '請求', exact: true }).click()
  await expect(row).toHaveCount(0)
  expect(await shell.evaluate((node) => node.isConnected)).toBe(true)
  await page.getByRole('button', { name: '元に戻す' }).click()
  await expect(row).toBeVisible()
})
