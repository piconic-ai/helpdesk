import { customerContact } from './customer.mjs'
import { createServer } from 'node:http'
import { test, expect, capture } from './harness.mjs'

test.use({
  channel: 'chromium',
  extensions: ['form', 'chat', 'articles', 'feedback'],
})

test('J12 チャットで読んだ記事で解決できない質問をそのまま運営へ送る', async ({
  page,
  scene,
}) => {
  const question = '領収書はどこから発行できますか？'
  await page.goto(scene.origin + '/help/chat/slide')
  await page.getByLabel('質問').fill(question)
  await page.getByRole('button', { name: '質問する' }).click()
  await expect(
    page.getByRole('link', { name: /領収書を発行する/ }),
  ).toBeVisible()
  await expect(page.getByText(question, { exact: true })).toBeVisible()
  await capture(page, 'J12', '01-articles', '元の質問と関連記事を読む')
  const article = page.getByRole('link', { name: '領収書を発行する' })
  await article.click()
  await expect(page.locator('#chat-reading article')).not.toBeEmpty()
  await page.getByRole('button', { name: 'やりとりに戻る' }).click()
  await expect(article).toBeFocused()
  await page.getByRole('button', { name: '解決しなかった' }).click()
  await customerContact(page)
  await capture(page, 'J12', '02-handoff', '質問を引き継いで返信先を入力する')
  await page.getByRole('button', { name: '送信', exact: true }).click()
  const receipt = page.getByRole('status')
  await expect(receipt).toContainText(
    /問い合わせを受け付けました（[A-Z]{2,5}-\d+）/,
  )
  await expect(page.getByText(question, { exact: true })).toBeVisible()
  await expect(
    page.getByText('reader@example.net', { exact: true }),
  ).toBeVisible()
  const number = (await receipt.innerText()).match(/[A-Z]{2,5}-\d+/)[0]
  await capture(
    page,
    'J12',
    '03-receipt',
    '問い合わせ番号・元の質問・返信先を確認する',
  )
  await page.goto(scene.origin)
  const row = page.getByRole('link', { name: new RegExp(question) })
  await expect(row).toContainText(number)
  await row.click()
  await expect(page.locator('article.message-inbound')).toContainText(question)
  await capture(
    page,
    'J12',
    '04-thread',
    '運営の会話で質問を読み、受付番号を照合する',
  )
})

test('記事の評価後や検索で記事が見つからない場合にも問い合わせへ進める', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/help/articles/slide/')
  await page.getByLabel('記事を検索').fill('一致しない質問')
  await expect(
    page.getByRole('button', { name: '検索', exact: true }),
  ).toHaveCount(0)
  await page.waitForURL((url) => url.searchParams.has('q'))
  await expect(page.getByText('該当する記事はありません。')).toBeVisible()
  await page.getByRole('link', { name: 'お問い合わせ' }).click()
  await expect(page.getByLabel('お問い合わせ内容')).toBeVisible()
  await page.goto(scene.origin + '/help/articles/slide/')
  await page.getByRole('link', { name: '領収書を発行する' }).click()
  await expect(page.getByRole('link', { name: 'お問い合わせ' })).toBeVisible()
  await page.getByRole('button', { name: 'いいえ' }).click()
  await expect(page.getByRole('status')).toContainText('評価')
  await page.getByRole('link', { name: 'お問い合わせ' }).click()
  await expect(page.getByLabel('お問い合わせ内容')).toBeVisible()
})

test('管理者が埋め込み先を追加すると、そのサイト内でチャットを開ける', async ({
  page,
  scene,
}) => {
  let snippet = ''
  const server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(
      '<!doctype html><html lang="ja"><body>' + snippet + '</body></html>',
    )
  })
  await new Promise((resolve, reject) =>
    server.once('error', reject).listen(0, '127.0.0.1', resolve),
  )
  try {
    const site = 'http://127.0.0.1:' + server.address().port
    await page.goto(scene.origin + '/extensions/chat')
    const slide = page.locator('section.settings-card').filter({
      has: page.getByRole('heading', { name: 'Slide', exact: true }),
    })
    const sites = slide.getByText('埋め込み先を編集', { exact: true })
    const responseTime = slide.getByText('返信の目安を編集', { exact: true })
    await expect(slide.getByLabel('埋め込み先のサイト')).toBeHidden()
    await sites.click()
    await slide.getByLabel('埋め込み先のサイト').fill(site)
    await slide.getByRole('button', { name: '埋め込み先を登録' }).click()
    await sites.click()
    await expect(slide.getByText(site, { exact: true })).toBeVisible()
    await responseTime.click()
    await slide
      .getByRole('textbox', { name: '返信の目安', exact: true })
      .fill('2営業日以内')
    await slide.getByRole('button', { name: '返信の目安を保存' }).click()
    await page.getByRole('button', { name: '元に戻す' }).click()
    await responseTime.click()
    await expect(
      slide.getByRole('textbox', { name: '返信の目安', exact: true }),
    ).toHaveValue('')
    await slide
      .getByRole('textbox', { name: '返信の目安', exact: true })
      .fill('2営業日以内')
    await slide.getByRole('button', { name: '返信の目安を保存' }).click()
    snippet = await slide.getByLabel('埋め込みコード').inputValue()
    await page.goto(site)
    await page.getByRole('button', { name: 'ヘルプ', exact: true }).click()
    const frame = page.frameLocator('iframe')
    await frame.getByLabel('質問').fill('契約について相談したいです')
    await frame.getByRole('button', { name: '質問する' }).click()
    await frame.getByLabel('連絡先メールアドレス').fill('reader@example.net')
    await frame.getByRole('button', { name: '送信', exact: true }).click()
    await expect(frame.getByRole('status')).toContainText(
      '問い合わせを受け付けました',
    )
    await expect(frame.getByText('2営業日以内')).toBeVisible()
    await page.goto(scene.origin + '/extensions/chat')
    await sites.click()
    await slide.getByRole('button', { name: site + ' を解除' }).click()
    const refusal = page.waitForEvent(
      'requestfailed',
      (req) => new URL(req.url()).pathname === '/help/chat/slide',
    )
    await page.goto(site)
    await page.getByRole('button', { name: 'ヘルプ', exact: true }).click()
    await refusal
    await expect(frame.getByRole('heading')).toHaveCount(0)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('公開ヘルプの入口でプロダクトをまたいで記事を検索し、問い合わせにも進める', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/help/')
  await page.getByLabel('すべてのヘルプ記事を検索').fill('領収書')
  await expect(
    page.getByRole('button', { name: '検索', exact: true }),
  ).toHaveCount(0)
  await page.waitForURL((url) => url.searchParams.has('q'))
  await page.getByRole('link', { name: '領収書を発行する' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '領収書を発行する',
  )
  await page.goto(scene.origin + '/help/?q=一致しない質問')
  await expect(page.getByText('該当する記事はありません。')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'お問い合わせ' }).first(),
  ).toBeVisible()
})

test('受付の確認が失敗しても、入力した件名・本文・宛先を保って再送できる', async ({
  page,
  scene,
}) => {
  const subject = '発送日について'
  const body = '配送予定を教えてください。'
  const email = 'retry@example.net'
  await page.goto(scene.origin + '/help/form/slide')
  await page.getByLabel('件名').fill(subject)
  await page.getByLabel('お問い合わせ内容').fill(body)
  await page.getByLabel('連絡先メールアドレス').fill(email)
  const position = () =>
    page
      .getByLabel('件名')
      .evaluate((node) => node.getBoundingClientRect().top + scrollY)
  const before = await position()
  await page.route(
    '**/help/form/slide',
    (route) => {
      const data = new URLSearchParams(route.request().postData())
      data.set('publicKey', 'expired-key')
      return route.continue({ postData: data.toString() })
    },
    { times: 1 },
  )
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('もう一度')
  expect(await position()).toBeCloseTo(before, 0)
  await page.getByRole('button', { name: '閉じる' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByLabel('件名')).toHaveValue(subject)
  await expect(page.getByLabel('お問い合わせ内容')).toHaveValue(body)
  await expect(page.getByLabel('連絡先メールアドレス')).toHaveValue(email)
  await page.getByRole('button', { name: '送信', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(
    /問い合わせを受け付けました（[A-Z]{2,5}-\d+）/,
  )
  await expect(page.getByText(email, { exact: true })).toBeVisible()
})

test('記事の評価期限を過ぎても選んだ回答を保って送り直せる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/help/articles/slide/receipt')
  const visit = await page.locator('input[name=visit]').inputValue()
  await scene.db
    .prepare(
      "UPDATE articles_data SET value=json_set(value,'$.at',0) WHERE key=?",
    )
    .bind('visit/' + visit)
    .run()
  await page.getByRole('button', { name: 'いいえ', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('もう一度')
  await page.getByRole('button', { name: '「いいえ」で送り直す' }).click()
  await expect(page.getByRole('status')).toContainText('評価を受け付けました')
  await expect(page.getByRole('link', { name: 'お問い合わせ' })).toBeVisible()
})
