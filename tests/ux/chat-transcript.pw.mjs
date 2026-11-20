import { test, expect } from './harness.mjs'

test.use({ extensions: ['articles', 'chat'] })

test('解決した記事を記録し、問い合わせは本人が送るまで作成しない', async ({
  page,
  scene,
}) => {
  const count = () =>
    scene.db
      .prepare("SELECT COUNT(*) AS n FROM conversations WHERE origin='chat'")
      .first('n')
  const before = await count()
  const url = scene.origin + '/help/chat/slide?lang=en'
  await page.goto(url)
  const question = page.getByLabel('Question', { exact: true })
  const ask = page.getByRole('button', { name: 'Ask', exact: true })
  await question.fill('領収書を発行できますか？')
  await ask.click()
  const article = page.getByRole('link', { name: '領収書を発行する' })
  await expect(article).toBeVisible()
  await expect(
    page.getByText('購入履歴から、支払いごとに領収書を発行できます。', {
      exact: true,
    }),
  ).toBeVisible()
  expect(
    await question.evaluate((input) => input.matches(':user-invalid')),
  ).toBe(false)
  await article.click()
  await expect(page.locator('#chat-reading article')).toContainText('領収書')
  await page.getByRole('button', { name: 'Back to conversation' }).click()
  await expect(article).toBeFocused()
  const [resolution] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'POST' && req.url().endsWith('/help/chat/slide'),
    ),
    page.getByRole('button', { name: 'Solved', exact: true }).click(),
  ])
  await expect(page.getByRole('status')).toHaveText(
    'Recorded that the article helped you resolve your question.',
  )
  const replay = await page.request.post(resolution.url(), {
    data: resolution.postDataBuffer(),
    headers: {
      Origin: scene.origin,
      Accept: 'application/json',
      'Content-Type': (await resolution.allHeaders())['content-type'],
    },
  })
  expect(replay.status()).toBe(200)
  expect(await replay.json()).toEqual({ kind: 'resolved' })
  const event = await scene.db
    .prepare("SELECT number, payload FROM events WHERE kind='chat.resolved'")
    .all()
  expect(event.results).toHaveLength(1)
  expect(event.results[0].number).toBeNull()
  expect(JSON.parse(event.results[0].payload)).toEqual({
    product: 'slide',
    article: 'receipt',
  })
  const next = 'カタログの印刷について教えてください'
  await question.fill(next)
  await ask.click()
  await expect(page.getByLabel('Contact email')).toBeVisible()
  expect(await count()).toBe(before)
  await expect(page.getByRole('link', { name: 'Contact form' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Leave feedback' })).toHaveCount(
    0,
  )
  await page.reload()
  await expect(question).toHaveValue('')
  await expect(page.getByText(next, { exact: true })).toHaveCount(0)
  expect(await count()).toBe(before)
})

test('初期値は登録した親ウィンドウから受け取り、訪問者の編集を優先する', async ({
  page,
  scene,
}) => {
  const host = scene.origin + '/chat-test-host'
  const sibling = scene.origin + '/chat-test-sibling'
  const other = 'http://other.example.test/chat-test-sibling'
  const url =
    scene.origin +
    '/help/chat/slide?embed=1&parent=' +
    encodeURIComponent(scene.origin)
  const doc = (body) => ({ contentType: 'text/html', body })
  await page.route(host, (route) =>
    route.fulfill(
      doc(
        '<iframe name="chat" src="' +
          url +
          '"></iframe><iframe name="same" src="' +
          sibling +
          '"></iframe><iframe name="other" src="' +
          other +
          '"></iframe>',
      ),
    ),
  )
  await page.route(sibling, (route) => route.fulfill(doc('Sibling')))
  await page.route(other, (route) => route.fulfill(doc('Other origin')))
  await page.goto(host)
  const chat = page.frame({ name: 'chat' })
  await chat.getByLabel('質問').fill('カタログの印刷について教えてください')
  await chat.getByRole('button', { name: '質問する' }).click()
  const email = chat.getByLabel('連絡先メールアドレス')
  await expect(email).toBeVisible()

  // Observe delivery independently of whether the chat accepts or rejects it.
  await chat.evaluate(() => {
    window.delivered = []
    addEventListener('message', (event) => {
      if (event.data.type === 'helpdesk:prefill')
        window.delivered.push(event.origin)
    })
  })
  const defaults = {
    type: 'helpdesk:prefill',
    email: 'reader@example.test',
    name: 'Reader',
  }
  for (const name of ['same', 'other']) {
    await page.frame({ name }).evaluate(
      ({ origin, defaults }) => {
        window.parent.frames[0].postMessage(defaults, origin)
      },
      { origin: scene.origin, defaults },
    )
  }
  await expect.poll(() => chat.evaluate(() => window.delivered.length)).toBe(2)
  expect(await email.inputValue()).toBe('')
  const prefill = (data) =>
    page.evaluate(
      ({ origin, data }) => {
        window.frames[0].postMessage(data, origin)
      },
      { origin: scene.origin, data },
    )
  await prefill(defaults)
  await expect(email).toHaveValue(defaults.email)
  await email.fill('edited@example.test')
  await prefill({ ...defaults, email: 'late@example.test', name: 'Updated' })
  await expect(chat.getByLabel('お名前（任意）')).toHaveValue('Updated')
  await expect(email).toHaveValue('edited@example.test')
})

test.describe('ネイティブフォーム', () => {
  test.use({ javaScriptEnabled: false })
  test('JavaScriptを無効にした単独ページでも質問から受付に進める', async ({
    page,
    scene,
  }) => {
    await page.goto(scene.origin + '/help/chat/slide')
    await page.getByLabel('質問').fill('カタログの印刷について相談したいです')
    await page.getByRole('button', { name: '質問する' }).click()
    await page.getByLabel('連絡先メールアドレス').fill('reader@example.test')
    await page.getByRole('button', { name: '送信', exact: true }).click()
    await expect(page.getByRole('status')).toContainText(
      '問い合わせを受け付けました',
    )
  })
})
