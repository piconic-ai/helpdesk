import { expect, test } from './harness.mjs'

test.use({ extensions: ['articles', 'chat', 'form', 'auto-ack'] })

async function reactions(scene, presentation) {
  const { results } = await scene.db
    .prepare(
      'SELECT action FROM suggestion_reactions WHERE presentation=? ORDER BY action',
    )
    .bind(presentation)
    .all()
  return results.map((row) => row.action)
}

async function receive(scene, subject, body, label) {
  const id = `<${label}@example.net>`
  await scene.receive({ subject, body, messageId: id })
  return scene.db
    .prepare('SELECT number FROM messages WHERE message_id=?')
    .bind(id)
    .first('number')
}

test('公開フォームでは送信前に記事を読み、そのまま送ると同じ受付番号を返す', async ({
  page,
  scene,
}) => {
  const url = scene.origin + '/help/form/slide'
  await page.goto(url)
  const subject = '前月の領収書について'
  await page.getByLabel('件名').fill(subject)
  await page
    .getByLabel('お問い合わせ内容')
    .fill('領収書の確認を担当者に依頼します。')
  await page.getByLabel('連絡先メールアドレス').fill('form-reader@example.net')
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'この記事で解決しませんか' }),
  ).toBeVisible()
  const send = page.getByRole('button', { name: 'このまま送る' })
  await expect(send).toHaveClass(/button-primary/)
  const count = () =>
    scene.db
      .prepare('SELECT COUNT(*) AS n FROM conversations WHERE subject=?')
      .bind(subject)
      .first('n')
  expect(await count()).toBe(0)
  const link = page.getByRole('link', { name: /領収書を発行する/ })
  const tracked = new URL(await link.getAttribute('href'), scene.origin)
  const presentation = tracked.searchParams.get('suggestion')
  const [article] = await Promise.all([
    page.waitForEvent('popup'),
    link.click(),
  ])
  await expect(
    article.getByRole('heading', { name: '領収書を発行する' }),
  ).toBeVisible()
  await article.getByRole('button', { name: 'いいえ', exact: true }).click()
  await article.close()
  const form = await send.evaluate((el) =>
    Object.fromEntries(new FormData(el.form)),
  )
  // A retry can reach the Worker before the original response reaches the browser.
  const [retry] = await Promise.all([
    page.request.post(url, { headers: { origin: scene.origin }, form }),
    send.click(),
  ])
  const receipt = await page.getByRole('status').innerText()
  expect(receipt).toMatch(/問い合わせを受け付けました（#\d+）/)
  expect(await retry.text()).toContain(receipt)
  expect(await count()).toBe(1)
  expect(await reactions(scene, presentation)).toEqual([
    'inquiry',
    'opened',
    'unresolved',
  ])
})

test('運営の返信には関連する記事を先頭に添え、記事がない質問からは候補を作る', async ({
  page,
  scene,
}) => {
  await scene.db
    .prepare('INSERT INTO articles_data(key,value) VALUES(?,?)')
    .bind(
      'article/slide/aaa',
      JSON.stringify({
        id: 'aaa',
        product: 'slide',
        title: 'チームに招待する',
        body: 'メンバーを招待できます。',
        status: 'published',
      }),
    )
    .run()
  const number = await receive(
    scene,
    '経費の書類',
    '領収書のダウンロードを教えてください',
    'ranked-choice',
  )
  const other = await receive(
    scene,
    '字幕を同期する方法',
    'ビデオの字幕の同期を依頼します',
    'missing-choice',
  )
  await page.goto(scene.origin + '/conversation/' + number)
  await page.getByRole('button', { name: '記事を添える', exact: true }).click()
  const candidate = page
    .locator('#reply-articles li')
    .first()
    .getByRole('button')
  await expect(candidate).toHaveText('領収書を発行する')
  const link = new URL(await candidate.getAttribute('data-url'))
  const presentation = link.searchParams.get('suggestion')
  expect(presentation).toBeTruthy()
  const endpoint =
    scene.origin + '/conversation/' + number + '/article-selection'
  expect(
    (
      await page.request.post(endpoint, {
        headers: { origin: 'https://elsewhere.example' },
        form: { article: 'receipt', presentation },
      })
    ).status(),
  ).toBe(403)
  expect(
    (
      await page.request.post(endpoint, {
        headers: { origin: scene.origin },
        form: { article: 'aaa', presentation },
      })
    ).status(),
  ).toBe(404)
  await candidate.click()
  await expect(
    page.getByRole('textbox', { name: '返信', exact: true }),
  ).toHaveValue(new RegExp(presentation))
  await expect.poll(() => reactions(scene, presentation)).toEqual(['attached'])
  await page.getByRole('button', { name: 'プレビュー', exact: true }).click()
  await expect(
    page.getByRole('region', { name: '返信のプレビュー' }),
  ).toContainText(link.href)
  await page.getByRole('button', { name: '送信', exact: true }).click()
  const sentBody = () =>
    scene.db
      .prepare(
        "SELECT body FROM messages WHERE number=? AND delivery='sent' AND instr(body,?)>0",
      )
      .bind(number, presentation)
      .first('body')
  await expect
    .poll(
      async () => {
        await scene.scheduled()
        return sentBody()
      },
      { timeout: 15000 },
    )
    .toContain(link.href)
  expect(await reactions(scene, presentation)).toEqual(['attached'])
  const sentLink = new URL((await sentBody()).match(/https?:\/\/\S+/)[0])
  const recipient = await page.context().browser().newPage()
  await recipient.goto(scene.origin + sentLink.pathname + sentLink.search)
  await expect(
    recipient.getByRole('heading', { name: '領収書を発行する' }),
  ).toBeVisible()
  expect(await reactions(scene, presentation)).toEqual(['attached', 'opened'])
  await recipient.getByRole('button', { name: 'はい', exact: true }).click()
  await expect
    .poll(() => reactions(scene, presentation))
    .toEqual(['attached', 'opened', 'resolved'])
  await recipient.close()
  await page.reload()
  expect(
    await scene.db
      .prepare(
        "SELECT COUNT(*) AS n FROM suggestion_presentations WHERE surface='composer' AND number=?",
      )
      .bind(number)
      .first('n'),
  ).toBe(1)
  await page.goto(scene.origin + '/conversation/' + other)
  const add = page.locator('button[form="reply-article-candidate"]')
  await expect(add).toHaveText('記事の候補に追加')
  await add.click()
  await expect(page.getByText('記事の候補を保存しました。')).toBeVisible()
  expect(
    await scene.db
      .prepare(
        "SELECT json_extract(value,'$.topic') AS title FROM articles_data WHERE key=?",
      )
      .bind('candidate/' + other)
      .first('title'),
  ).toBe('字幕を同期する方法')
})

test('受付返信は製品で有効にしたときだけ、自動で選んだ記事を含む', async ({
  page,
  scene,
}) => {
  const first = await receive(
    scene,
    '最初の経費精算',
    '領収書の場所を探しています',
    'disabled-receipt',
  )
  await scene.scheduled()
  const message = (number) =>
    scene.db
      .prepare(
        "SELECT body FROM messages WHERE number=? AND kind='outbound' ORDER BY created_at DESC LIMIT 1",
      )
      .bind(number)
      .first('body')
  await expect.poll(() => message(first)).toContain('automated acknowledgment')
  expect(await message(first)).not.toContain('関連しそうな記事')
  await scene.db
    .prepare(
      "INSERT INTO chat_data(key,value) VALUES('recommendation/slide',?)",
    )
    .bind(JSON.stringify({ autoAck: true }))
    .run()
  const second = await receive(
    scene,
    '次の経費精算',
    '領収書の場所を探しています',
    'enabled-receipt',
  )
  await scene.scheduled()
  await expect
    .poll(() => message(second))
    .toContain('関連しそうな記事（お問い合わせ内容から自動で選びました）')
  const doc = await message(second)
  const tracked = new URL(doc.match(/https?:\/\/\S+\/help\/articles\/\S+/)[0])
  const presentation = tracked.searchParams.get('suggestion')
  await page.goto(scene.origin + tracked.pathname + tracked.search)
  await expect(page.getByText('この記事で解決しましたか？')).toBeVisible()
  const visit = await page.locator('input[name=visit]').inputValue()
  await scene.db
    .prepare(
      "UPDATE articles_data SET value=json_set(value,'$.at',0) WHERE key=?",
    )
    .bind('visit/' + visit)
    .run()
  await page.getByRole('button', { name: 'はい', exact: true }).click()
  await page.getByRole('button', { name: '「はい」で送り直す' }).click()
  expect(await reactions(scene, presentation)).toEqual(['opened', 'resolved'])
  expect(
    await scene.db
      .prepare(
        "SELECT number FROM suggestion_presentations WHERE id=? AND surface='ack'",
      )
      .bind(presentation)
      .first('number'),
  ).toBe(second)
})

test('個別の調査が必要な質問は担当者への入口が記事より先に表示される', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/help/chat/slide')
  await page
    .getByLabel('質問', { exact: true })
    .fill('領収書の二重請求を調査してください')
  await page.getByRole('button', { name: '質問する' }).click()
  const human = page.getByRole('button', { name: '担当者に問い合わせる' })
  await expect(human).toBeFocused()
  const area = page.locator('.chat-answer')
  expect(await area.locator('button,a').first().innerText()).toBe(
    '担当者に問い合わせる',
  )
  await human.click()
  await expect(page.getByLabel('連絡先メールアドレス')).toBeFocused()
})

test('反応だけを記録できない場合も担当者へ送信できる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/help/chat/slide')
  await page
    .getByLabel('質問', { exact: true })
    .fill('領収書を再発行したいです。')
  await page.getByRole('button', { name: '質問する' }).click()
  await expect(
    page.getByRole('link', { name: '領収書を発行する' }),
  ).toBeVisible()
  await page.route('**/help/chat/slide', (route) =>
    route.request().postData()?.includes('unresolved')
      ? route.fulfill({ status: 503, body: 'temporarily unavailable' })
      : route.continue(),
  )
  await page.getByRole('button', { name: '解決しなかった' }).click()
  await page.getByLabel('連絡先メールアドレス').fill('fallback@example.net')
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(
    '問い合わせを受け付けました',
  )
})
