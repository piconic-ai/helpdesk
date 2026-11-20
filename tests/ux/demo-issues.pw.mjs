import { startDemo } from '../ui/demo-scene.mjs'
import { test as base, expect } from '@playwright/test'

const test = base.extend({
  demo: async ({}, use) => {
    const scene = await startDemo()
    try {
      await use(scene)
    } finally {
      await scene.stop()
    }
  },
})

test('W4 デモで声を起票し、同じ課題の2人に承認して知らせ、改善率を確認する', async ({
  page,
  demo,
}) => {
  const title = '領収書を注文番号で検索する'
  const summary = '請求履歴に注文番号の検索欄を追加する。'
  const external = []
  await page.context().route('**/*', (route) => {
    if (new URL(route.request().url()).origin === demo.origin)
      return route.continue()
    external.push(route.request().url())
    return route.abort()
  })
  await page.goto(demo.origin + '/extensions/issues')
  await expect(page.getByRole('main')).toContainText('デモ用の模擬 GitHub')
  for (const [product, repo] of [
    ['Slide', 'example/helpdesk'],
    ['Desk', 'example/desk'],
  ]) {
    await expect(
      page
        .locator('[data-ui=form-section]')
        .filter({
          has: page.getByRole('heading', { name: product, exact: true }),
        })
        .getByLabel('GitHub リポジトリ'),
    ).toHaveValue(repo)
  }
  const board = () => page.goto(demo.origin + '/issues')
  await board()
  const main = page.getByRole('main')
  const pending = main.getByRole('region', { name: /知らせる待ち/ })
  const open = main.getByRole('table', { name: '開いている', exact: true })
  const closed = main.getByRole('table', { name: '直した', exact: true })
  await expect(
    open.getByRole('row').filter({ hasText: '領収書の一括ダウンロード' }),
  ).toContainText('3件')
  await expect(pending).toContainText('2件の声のうち1件')
  const finished = closed
    .getByRole('row')
    .filter({ hasText: '請求明細のダウンロードを改善する' })
  await expect(finished).toContainText('2 / 2')
  await finished.getByRole('link').click()
  for (const label of [/直す前 30日/, /直した後/]) {
    await expect(
      main
        .locator('.issue-impact > div')
        .filter({ hasText: label })
        .locator('strong'),
    ).toHaveText('1件')
  }
  await board()
  await main.getByRole('link', { name: '課題を追加' }).click()
  const choices = main.locator('select[name=number]')
  await expect(
    choices.locator('option').filter({ hasText: 'Desk' }).first(),
  ).toBeAttached()
  await expect(
    choices.locator('option').filter({ hasText: 'Slide' }).first(),
  ).toBeAttached()

  // Use the same entry points an operator has, including the contextual drawer.
  await page.setViewportSize({ width: 1024, height: 900 })
  async function related(number) {
    await page.goto(demo.origin + '/conversation/' + number)
    await page.getByRole('button', { name: '関連情報', exact: true }).click()
    return page.locator('[data-extension=issues]')
  }
  const panel = await related(1)
  await panel.getByText('課題を起票する', { exact: true }).click()
  await panel.getByLabel('タイトル').fill(title)
  await panel.getByLabel('公開する要約').fill(summary)
  await panel.getByRole('button', { name: '入力を閉じる' }).click()
  await expect(panel.getByLabel('公開する要約')).toBeHidden()
  expect(demo.github.created).toEqual([])
  await panel.getByText('課題を起票する', { exact: true }).click()
  await expect(panel.getByLabel('公開する要約')).toHaveValue(summary)
  await panel.getByRole('button', { name: '起票内容を確認' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText(summary)
  await expect(dialog).toContainText('example/helpdesk')
  await expect(dialog).not.toContainText(
    /山田 花|customer1@example.net|経理に提出/,
  )
  expect(demo.github.created).toEqual([])
  await dialog.getByRole('button', { name: '入力内容を修正する' }).click()
  await expect(panel.getByLabel('公開する要約')).toHaveValue(summary)
  await panel.getByRole('button', { name: '起票内容を確認' }).click()
  await dialog.getByRole('button', { name: '確認した内容で起票' }).click()
  await expect
    .poll(() => demo.github.created)
    .toEqual([
      { title, body: summary + '\n\n[#1](' + demo.origin + '/conversation/1)' },
    ])
  await board()
  await expect(open.getByRole('row').filter({ hasText: title })).toContainText(
    '1件',
  )

  const second = await related(6)
  await second.getByText('既存の課題を選ぶ', { exact: true }).click()
  await second.getByLabel('題で探す').fill(title)
  await expect(
    second
      .getByRole('combobox', { name: '課題', exact: true })
      .locator('option'),
  ).toHaveText([new RegExp(title)])
  const linkButton = second.getByRole('button', {
    name: '既存の課題と紐づける',
  })
  const drawer = page.locator('#related-info')
  await linkButton.click()
  await expect(dialog).toBeVisible()
  await expect(drawer).toBeVisible()
  await dialog.getByRole('button', { name: 'キャンセル' }).click()
  await expect(linkButton).toBeFocused()
  await expect(second.getByLabel('題で探す')).toHaveValue(title)
  await linkButton.click()
  await dialog.getByRole('button', { name: '既存の課題と紐づける' }).click()
  await expect
    .poll(() => demo.github.comments)
    .toEqual([{ body: '[#6](' + demo.origin + '/conversation/6)' }])
  await board()
  const row = open.getByRole('row').filter({ hasText: title })
  await expect(row).toContainText('2件')
  await row.getByRole('link').click()
  await expect(
    main.getByRole('heading', { name: '紐づく声 2件' }),
  ).toBeVisible()
  await main.getByRole('button', { name: '課題を閉じる（デモ用）' }).click()
  const waiting = pending.getByRole('listitem').filter({ hasText: title })
  await expect(waiting).toContainText('2件の声のうち2件')
  await waiting.getByRole('button', { name: '下書きを作る' }).click()
  await expect(main.getByRole('status')).toContainText(
    '知らせの下書きを用意しました',
  )
  const voices = main.getByRole('region', { name: /紐づく声/ })
  await expect(voices.getByRole('link', { name: /承認待ち/ })).toHaveCount(2)

  async function rate(expected) {
    await page.goto(demo.origin + '/metrics')
    const metric = main.locator('[data-ui=metric-card]').filter({
      has: page.getByRole('heading', {
        name: '声が改善に届いた割合',
        exact: true,
      }),
    })
    await expect(metric.locator('strong')).toHaveText(expected)
  }
  await rate('30%')
  for (const [index, number] of [1, 6].entries()) {
    await board()
    await expect(
      waiting.getByRole('button', { name: '下書きを作る' }),
    ).toHaveCount(0)
    await waiting
      .getByRole('link', { name: '承認待ち ' + (2 - index) + '件を確認する' })
      .click()
    await voices
      .getByRole('link', { name: new RegExp('#' + number + ' .*承認待ち') })
      .click()
    await expect(page).toHaveURL(
      new RegExp('/conversation/' + number + '(?:\\?|$)'),
    )
    const subject = await page.getByRole('heading', { level: 1 }).innerText()
    const draft = page
      .locator('article.message-outbound')
      .filter({ hasText: title })
    const wording = await draft
      .getByRole('textbox', { name: '下書きの本文' })
      .inputValue({ timeout: 5000 })
    expect(wording).toContain(subject)
    expect(wording).toContain(title)
    await draft.getByRole('button', { name: '承認して送信' }).click()
    await dialog.getByRole('button', { name: '承認して送信' }).click()
    await expect(async () => {
      await page.reload()
      await expect(draft).toContainText('送信済み', { timeout: 1000 })
    }).toPass({ timeout: 16000 })
    await board()
    await expect(
      closed.getByRole('row').filter({ hasText: title }),
    ).toContainText(index + 1 + ' / 2')
    if (index === 0) await expect(waiting).toContainText('2件の声のうち1件')
  }
  await expect(waiting).toHaveCount(0)
  await rate('50%')
  expect(external).toEqual([])
})

test('デモの確認ページで公開する要約を修正し、確認後の内容だけを起票する', async ({
  browser,
  demo,
}) => {
  const page = await browser.newPage({ javaScriptEnabled: false })
  try {
    await page.goto(demo.origin + '/issues/new')
    await page.locator('select[name=number]').selectOption('3')
    await page.getByLabel('タイトル').fill('Desk の一覧を改善する')
    await page.getByLabel('公開する要約').fill('変更前の要約')
    await page.getByRole('button', { name: '起票内容を確認' }).click()
    await page.getByText('入力内容を修正する', { exact: true }).click()
    await expect(page.getByLabel('公開する要約')).toHaveValue('変更前の要約')
    await page.getByLabel('公開する要約').fill('公開する要約を修正しました。')
    await page.getByRole('button', { name: '起票内容を確認' }).click()
    await expect(page.locator('[data-public-target]')).toContainText(
      'example/desk',
    )
    expect(demo.github.created).toHaveLength(0)
    await page.getByRole('button', { name: '確認した内容で起票' }).click()
    await expect
      .poll(() => demo.github.created)
      .toEqual([
        {
          title: 'Desk の一覧を改善する',
          body:
            '公開する要約を修正しました。\n\n[#3](' +
            demo.origin +
            '/conversation/3)',
        },
      ])
  } finally {
    await page.close()
  }
})

test('課題の詳細で宛先と文面を読んだ下書きだけをまとめて承認する', async ({
  page,
  demo,
}) => {
  const detail = demo.origin + '/issues/example/helpdesk/42'
  await page.goto(detail)
  await page.getByRole('button', { name: '課題を閉じる（デモ用）' }).click()
  const pending = page.getByRole('region', { name: /知らせる待ち/ })
  await pending.getByRole('button', { name: '下書きを作る' }).click()
  const form = page.getByRole('form', { name: '知らせの下書きを承認' })
  const submit = form.getByRole('button', {
    name: '選んだ下書きを承認して送信',
  })
  await expect(form.getByRole('checkbox')).toHaveCount(3)
  const selected = []
  for (const n of [4, 7]) {
    const checkbox = form.getByRole('checkbox', {
      name: new RegExp('customer' + n + '@example.net'),
    })
    await expect(checkbox).not.toBeChecked()
    await expect(
      form
        .getByRole('group')
        .filter({ hasText: 'customer' + n + '@example.net' }),
    ).toContainText('への対応が完了しました。')
    selected.push(await checkbox.getAttribute('value'))
    await checkbox.check()
  }
  const post = async (values) => {
    const data = new FormData()
    for (const value of values) data.append('notice', value)
    return page.request.post(detail + '/approve', {
      multipart: data,
      headers: { Origin: demo.origin },
      maxRedirects: 0,
    })
  }
  expect((await post([selected[0], 'outside-this-issue'])).status()).toBe(409)
  await submit.click()
  await expect(form.getByRole('checkbox')).toHaveCount(1)
  await expect(form.getByRole('checkbox')).toHaveAccessibleName(
    /customer11@example.net/,
  )
  expect((await post(selected)).status()).toBe(409)
  await expect
    .poll(
      async () =>
        (
          await demo.db
            .prepare(
              "SELECT DISTINCT number FROM messages WHERE number IN (4,7,11) AND delivery='sent' AND body LIKE '%への対応が完了しました。' ORDER BY number",
            )
            .all()
        ).results.map((row) => row.number),
      { timeout: 24000 },
    )
    .toEqual([4, 7])
})

test('承認した返信を取り消し、同じ下書きから編集を再開できる', async ({
  page,
  demo,
}) => {
  await page.goto(demo.origin + '/account')
  await page
    .getByLabel('返信を取り消せる時間', { exact: true })
    .selectOption('300')
  await page.getByRole('button', { name: 'アカウントを保存' }).click()
  await page.goto(demo.origin + '/conversation/5')
  const editor = page.getByRole('textbox', { name: '下書きの本文' })
  const revised = '契約の更新日まで変更できます。'
  await editor.fill(revised)
  await page.getByRole('button', { name: '承認して送信' }).click()
  const confirmation = page.getByRole('dialog')
  await expect(confirmation).toContainText(revised)
  await confirmation.getByRole('button', { name: '承認して送信' }).click()
  await page
    .getByRole('form', { name: 'この返信の送信予定' })
    .getByRole('button', { name: '取り消す' })
    .click()
  await expect(editor).toHaveValue(revised)
  await expect(editor).toBeFocused()
  await expect(page.getByRole('button', { name: '承認して送信' })).toBeVisible()
  expect(
    await demo.db
      .prepare("SELECT delivery FROM messages WHERE id='reply-5'")
      .first('delivery'),
  ).toBe('awaiting_approval')
})

test('関連情報を開く前に会話に合う課題を1件示し、確認した課題にだけ紐づける', async ({
  page,
  demo,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(demo.origin + '/conversation/1')
  const candidate = page.getByRole('button', {
    name: /関連しそうな課題：領収書の宛名を変更できるようにする/,
  })
  await expect(candidate).toBeVisible()
  await expect(
    page.getByRole('button', { name: /^関連しそうな課題：/ }),
  ).toHaveCount(1)
  await expect(page.locator('#related-info')).toBeHidden()
  await candidate.click()
  const picker = page.locator('[data-issue-picker]')
  await expect(picker.locator('select')).toHaveValue('43')
  await picker.getByRole('button', { name: '既存の課題と紐づける' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '既存の課題と紐づける' })
    .click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goto(demo.origin + '/issues/example/helpdesk/43')
  const voices = page.getByRole('region', { name: /紐づく声/ })
  await expect(voices.locator('a[href="/conversation/1"]')).toBeVisible()
  await page.goto(demo.origin + '/conversation/1')
  await expect(
    page.locator('[data-issue-picker] select option').first(),
  ).toBeAttached()
  await expect(candidate).toHaveCount(0)
})
