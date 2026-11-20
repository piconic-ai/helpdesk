import { expect, test } from './harness.mjs'

test('狭い会話画面では最新の対応と未達の返信へ先頭から移動できる', async ({
  page,
  scene,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  for (const [number, name] of [
    [2, '送信済みの返信へ'],
    [3, '内部メモへ'],
    [4, '送信失敗の返信へ'],
  ]) {
    await page.goto(scene.origin + '/conversation/' + number)
    const link = page.getByRole('link', { name, exact: true })
    await expect(link).toBeInViewport()
    await link.click()
    const target = page.locator(':target')
    await expect(target).toBeInViewport()
    expect(
      await target.evaluate((el) => {
        const rect = el.getBoundingClientRect()
        return el.contains(
          document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          ),
        )
      }),
    ).toBe(true)
    if (number === 4)
      await expect(
        page.getByRole('button', { name: '再送', exact: true }),
      ).toBeInViewport()
  }
})

test('W1 送信して完了を取り消すと本文と状態を復元し、相手への配送も発生しない', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/1')
  const body = '取り消してから宛先を確認します。'
  const textarea = page.getByRole('textbox', { name: '返信', exact: true })
  await textarea.fill(body)
  await page.getByRole('button', { name: '送信して完了' }).click()
  const undo = page
    .getByRole('form', { name: '送信予定の通知' })
    .getByRole('button', { name: '取り消す' })
  await expect(undo).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.reload()
  await undo.click()
  await expect(textarea).toHaveValue(body)
  await expect(page.locator('[data-ui=attributes]')).toContainText('未対応')
  await expect(page.locator('article').filter({ hasText: body })).toHaveCount(0)
  await scene.scheduled()
  expect(
    await scene.db
      .prepare(
        "SELECT count(*) n FROM events WHERE number=1 AND kind IN ('reply_sent','status_changed') AND at>=(SELECT at FROM events WHERE kind='reply_undone' AND number=1)",
      )
      .first('n'),
  ).toBe(0)
})

test('W1 長い差出人でも製品名が読め、最後の担当変更と拡張の表示名が分かる', async ({
  page,
  scene,
}) => {
  const contact =
    '株式会社サンプル経理部門 カスタマーサポート窓口担当 関西支社法人契約グループ運営管理チーム 山田 花'
  await scene.db
    .prepare('UPDATE conversations SET contact_name=? WHERE number=11')
    .bind(contact)
    .run()
  await page.reload()
  const row = page
    .locator('a.conversation-row')
    .filter({ has: page.getByText('SLD-11', { exact: true }) })
  for (const width of [375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const sender = row.locator('.row-sender')
    const fullName = await sender.textContent()
    await expect(sender).toHaveAttribute('title', fullName)
    await expect(row).toHaveAccessibleName(new RegExp(fullName))
    const lines = await sender.evaluate(
      (el) =>
        el.getBoundingClientRect().height /
        parseFloat(getComputedStyle(el).lineHeight),
    )
    expect(lines).toBeLessThanOrEqual(2.05)
    const product = row.locator('.row-product')
    await expect(product).toContainText('Slide')
    const fits = await product.evaluate(
      (el) => el.scrollWidth <= el.clientWidth,
    )
    expect(fits).toBe(true)
  }
  const actor = JSON.stringify({ kind: 'operator', id: 'sato@example.com' })
  const at = Date.UTC(2026, 10, 18, 5)
  const assignments = ['mori@example.com', null, 'sato@example.com']
  await scene.db.batch([
    ...assignments.map((to, i) =>
      scene.db
        .prepare(
          "INSERT INTO events(number,kind,actor,at,payload) VALUES(1,'assigned',?,?,?)",
        )
        .bind(actor, at + i * 1000, JSON.stringify({ to })),
    ),
    scene.db
      .prepare(
        "INSERT INTO messages(id,number,kind,body,actor,created_at,delivery) VALUES('w1-extension',1,'outbound','修正のお知らせ',?,?,'awaiting_approval')",
      )
      .bind(JSON.stringify({ kind: 'extension', id: 'issues' }), at + 10000),
  ])
  await page.goto(scene.origin + '/conversation/1')
  const changes = page
    .locator('.timeline-entry')
    .filter({ hasText: '担当者を変更' })
  await expect(changes).toHaveCount(1)
  await expect(changes).toContainText('佐藤 優')
  await expect(page.locator('.message-outbound .message-author')).toContainText(
    'GitHub Issue',
  )
  await page.getByLabel('出来事を隠す').check()
  await expect(changes).toBeHidden()
  await page.getByLabel('出来事を隠す').uncheck()
  await expect(changes).toBeVisible()
})

test('送信結果が分からない時は別タブで最新の会話を開き、元の下書きを保持する', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/1')
  const body = page.getByRole('textbox', { name: '返信', exact: true })
  await body.fill('注文履歴から領収書を発行できます。')
  await page.route('**/actions/reply', async (route) => {
    const committed = await route.fetch()
    expect(committed.ok()).toBe(true)
    await route.abort()
  })
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(
    '送信結果を確認できませんでした',
  )
  const send = page.getByRole('button', { name: '送信', exact: true })
  await expect(send).toBeHidden()
  await expect(page.getByRole('button', { name: '送信して完了' })).toBeHidden()
  await page.getByRole('tab', { name: '内部メモ' }).click()
  await page.getByRole('tab', { name: '返信', exact: true }).click()
  await expect(send).toBeHidden()
  await expect(
    page.getByRole('button', { name: '最新の会話を読み直す' }),
  ).toBeVisible()
  const link = page.getByRole('link', { name: '別のタブで送信結果を確認' })
  const [fresh] = await Promise.all([page.waitForEvent('popup'), link.click()])
  await expect(fresh).toHaveURL(
    scene.origin + '/conversation/1#thread-messages',
  )
  await expect(fresh.getByRole('region', { name: 'メッセージ' })).toContainText(
    '注文履歴から領収書を発行できます。',
  )
  await fresh.close()
  await expect(body).toHaveValue('注文履歴から領収書を発行できます。')
  await page.getByRole('button', { name: '最新の会話を読み直す' }).click()
  await expect(
    page
      .locator('.message-outbound')
      .filter({ hasText: '注文履歴から領収書を発行できます。' }),
  ).toHaveCount(1)
  await expect(body).toHaveValue('注文履歴から領収書を発行できます。')
  await expect(send).toBeEnabled()
})

test('入力を検証して返信が拒否された時は理由を示し、下書きを残す', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/1')
  const body = page.getByRole('textbox', { name: '返信', exact: true })
  await body.fill('請求先を確認しました。')
  await page.route('**/actions/reply', async (route) => {
    const rejected = await route.fetch({
      postData: new URLSearchParams({ number: '1', body: '' }).toString(),
    })
    expect(rejected.status()).toBe(400)
    await route.fulfill({ response: rejected })
  })
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(
    '送信内容を確認してください',
  )
  await expect(
    page.getByRole('link', { name: '別のタブで送信結果を確認' }),
  ).toBeHidden()
  await expect(body).toHaveValue('請求先を確認しました。')
})

test('3幅で返信本文にフォーカスが見え、処理中の送信ボタンは同じ位置に残る', async ({
  page,
  scene,
}) => {
  for (const width of [375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(scene.origin + '/conversation/1')
    const body = page.getByRole('textbox', { name: '返信', exact: true })
    await body.fill('ご確認ください。')
    const outlines = await body.evaluate((el) =>
      [el, el.closest('form')].map(
        (element) => getComputedStyle(element).outlineStyle,
      ),
    )
    expect(outlines, String(width)).toEqual(['solid', 'none'])
    const send = page.getByRole('button', { name: '送信', exact: true })
    const position = (el) => {
      const button = el.getBoundingClientRect()
      const footer = el.closest('.composer-footer').getBoundingClientRect()
      return { x: button.left - footer.left, y: button.top - footer.top }
    }
    const start = await send.evaluate(position)
    const pending = new Promise((resolve) =>
      page.route('**/actions/reply', resolve, { times: 1 }),
    )
    await send.click()
    const request = await pending
    const sending = page.getByRole('button', { name: '送信中…' })
    try {
      await expect(sending).toBeDisabled()
      expect(await sending.evaluate(position), String(width)).toEqual(start)
    } finally {
      await request.abort()
    }
  }
})

test('空欄の返信は送信操作を淡く表示し、本文を入力すると送信できる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/conversation/1')
  const body = page.getByRole('textbox', { name: '返信', exact: true })
  const send = page.getByRole('button', { name: '送信', exact: true })
  const color = (el) => getComputedStyle(el).backgroundColor
  const empty = await send.evaluate(color)
  await send.click()
  await expect(body).toBeFocused()
  await expect(body).toHaveValue('')
  await body.fill('領収書を確認しました。')
  await page.mouse.move(0, 0)
  expect(await send.evaluate(color)).not.toBe(empty)
})

test('375pxの空の返信欄から添付の依頼を読み、入力すると返信操作を使える', async ({
  page,
  scene,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(scene.origin + '/conversation/7')
  const composer = page.locator('.composer')
  expect((await composer.boundingBox()).height).toBeLessThan(180)
  const first = page.locator('.message-inbound .message-body').first()
  expect((await first.boundingBox()).y).toBeLessThan(
    (await composer.boundingBox()).y,
  )
  const body = page.getByRole('textbox', { name: '返信', exact: true })
  await body.fill('添付の明細を確認しました。')
  await expect(
    composer.getByRole('button', { name: '送信して完了' }),
  ).toBeVisible()
  await expect(composer.locator('.composer-addresses')).toBeVisible()
})

test('375pxで短い返信は冒頭まで見え、長い返信は欄内で読み直せる', async ({
  page,
  scene,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(scene.origin + '/conversation/1')
  const field = page.getByRole('textbox', { name: '返信', exact: true })
  const sentence =
    'お問い合わせありがとうございます。領収書の宛名を確認し、再発行の手順をご案内します。'
  await field.fill(sentence)
  await field.press('End')
  expect(
    await field.evaluate((el) => el.scrollHeight - el.clientHeight),
  ).toBeLessThanOrEqual(1)
  await field.fill(Array(16).fill(sentence).join('\n'))
  await field.press('End')
  expect(await field.evaluate((el) => el.scrollHeight)).toBeGreaterThan(
    await field.evaluate((el) => el.clientHeight),
  )
  await field.press(
    process.platform === 'darwin' ? 'Meta+ArrowUp' : 'Control+Home',
  )
  await expect.poll(() => field.evaluate((el) => el.selectionStart)).toBe(0)
  await expect
    .poll(() =>
      field.evaluate(
        (el) => el.scrollTop <= parseFloat(getComputedStyle(el).paddingTop),
      ),
    )
    .toBe(true)
})

test('375pxでプレビューから本文の編集に戻れる', async ({ page, scene }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(scene.origin + '/conversation/1')
  const reply = page.getByRole('textbox', { name: '返信', exact: true })
  await reply.fill('領収書は購入履歴から再発行できます。')
  await page.getByRole('button', { name: 'プレビュー', exact: true }).click()
  const preview = page.getByRole('region', { name: '返信のプレビュー' })
  await expect(preview).toContainText('購入履歴')
  const edit = preview.getByRole('button', { name: '編集に戻る' })
  await expect(edit).toBeInViewport()
  await edit.click()
  await expect(reply).toBeFocused()
  await expect(reply).toHaveValue('領収書は購入履歴から再発行できます。')
})

test('送信予定を一覧で確認し、トーストを閉じた後も会話から今すぐ送れる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/account')
  await page
    .getByLabel('返信を取り消せる時間', { exact: true })
    .selectOption('300')
  await page.getByRole('button', { name: 'アカウントを保存' }).click()
  await page.goto(scene.origin + '/conversation/1')
  const body = '今回はすぐにお返事します。'
  await page.getByRole('textbox', { name: '返信', exact: true }).fill(body)
  await page.getByRole('button', { name: '送信', exact: true }).click()
  const toast = page.locator('form[data-toast][data-undo-reply]')
  await expect(toast).toContainText(/送信予定.*[0-5]:\d{2}/)
  await toast.getByRole('button', { name: '閉じる' }).click()
  await expect(toast).toBeHidden()
  await page.goto(scene.origin)
  const row = page.locator('.inbox-item[data-number="1"]')
  await expect(row).toContainText('送信予定')
  await row.locator('a.conversation-row').click()
  const message = page
    .locator('article.message-outbound')
    .filter({ hasText: body })
  await expect(message.getByRole('button', { name: '取り消す' })).toBeVisible()
  await message.getByRole('button', { name: '今すぐ送る' }).click()
  await expect(message).toContainText('送信済み', { timeout: 15000 })
  await expect(message.getByRole('button', { name: '取り消す' })).toHaveCount(0)
})

test('長い会話を時刻順にたどり、途中を開き、出来事を隠して次の操作へ進める', async ({
  page,
  scene,
}) => {
  const at = Date.now() - 600000
  await scene.db.batch(
    Array.from({ length: 10 }, (_, i) =>
      scene.db
        .prepare(
          "INSERT INTO messages(id,number,kind,body,created_at) VALUES(?,1,'inbound',?,?)",
        )
        .bind('timeline-extra-' + i, '追加の質問 ' + i, at + i * 1000),
    ),
  )
  await scene.db
    .prepare(
      "INSERT INTO events(number,kind,at,actor,payload) VALUES(1,'issues.linked',?,?,'{}')",
    )
    .bind(at + 2100, JSON.stringify({ kind: 'system' }))
    .run()
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(scene.origin + '/conversation/1')
  const line = page.locator('#thread-messages')
  const middle = line.locator('details').filter({ hasText: '5件のやりとり' })
  await expect(middle.locator('summary')).toBeVisible()
  await expect(line.getByText('追加の質問 1', { exact: true })).toBeHidden()
  await middle.locator('summary').click()
  await expect(line.getByText('追加の質問 1', { exact: true })).toBeVisible()
  const event = line.getByText('課題に紐づけ', { exact: true })
  await expect(event).toBeVisible()
  await page.getByLabel('出来事を隠す').check()
  await expect(event).toBeHidden()
  await expect(line.getByText('追加の質問 1', { exact: true })).toBeVisible()
  await expect(page.locator('#reply-area')).toContainText(/返信する（\d+[分時]/)
})
