import { surveyId } from '../ui/seed.mjs'
import { expect, test } from './harness.mjs'
import { registerProduct, serveProduct } from '../../examples/widget/server.mjs'

test.use({ extensions: ['articles', 'chat', 'form', 'metrics'] })

test('W3 公開ヘルプで探した記事を読み、評価後に同じ製品の窓口へ進む', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/help/articles/slide/')
  await test.step('記事を検索し、見つかった手順を読む', async () => {
    await page.getByLabel('記事を検索').fill('領収書')
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('q') === '領収書',
    )
    await page.getByRole('link', { name: '領収書を発行する' }).click()
    await expect(page.getByRole('article')).toContainText('購入履歴')
  })
  await test.step('記事を評価して、製品の窓口を開く', async () => {
    await page.getByRole('button', { name: 'いいえ' }).click()
    await expect(page.getByRole('status')).toContainText('評価')
    const back = page.getByRole('link', {
      name: '領収書を発行する',
      exact: true,
    })
    await expect(back).toHaveAttribute('href', /\/help\/articles\/slide\//)
    await page.getByRole('link', { name: 'お問い合わせ' }).click()
    await expect(page).toHaveURL(scene.origin + '/help/form/slide')
    await expect(page.getByLabel('お問い合わせ内容')).toBeVisible()
  })
})

test('W3 製品内で記事を読んで解決を伝え、受信箱に問い合わせが増えていないことを確かめる', async ({
  page,
  scene,
}) => {
  const product = await serveProduct(scene.origin)
  const customer = await page.context().newPage()
  const inbox = page.locator('a.conversation-row')
  const originalCount = await inbox.count()
  try {
    await registerProduct(scene.origin, product.origin)
    await customer.goto(product.origin + '/billing/receipts')
    const chat = customer.frameLocator('iframe')
    await test.step('製品のヘルプで質問して記事を読む', async () => {
      await customer
        .getByRole('button', { name: 'ヘルプ', exact: true })
        .click()
      await chat
        .getByRole('textbox', { name: '質問', exact: true })
        .fill('領収書を発行したい')
      await chat.getByRole('button', { name: '質問する' }).click()
      await chat.getByRole('link', { name: '領収書を発行する' }).click()
      await expect(chat.locator('#chat-reading article')).toContainText(
        '購入履歴',
      )
    })
    await test.step('製品内で解決を記録し、運営の受信箱を確かめる', async () => {
      await chat.getByRole('button', { name: 'やりとりに戻る' }).click()
      await chat.getByRole('button', { name: '解決した', exact: true }).click()
      await expect(chat.getByRole('status')).toContainText('解決')
      await page.reload()
      await expect(inbox).toHaveCount(originalCount)
    })
  } finally {
    await customer.close()
    await product.stop()
  }
})

test('W4 声の内訳から開いた会話を記事候補にして、同じ声の本文を編集画面で確かめる', async ({
  page,
}) => {
  const topic = '発行済みの領収書の宛名を変える手順'
  await test.step('製品別の内訳から元の問い合わせを開く', async () => {
    await page.getByRole('link', { name: '声の集計', exact: true }).click()
    await page
      .getByRole('main')
      .getByRole('link', { name: 'Slide', exact: true })
      .click()
    await page.getByRole('link', { name: /^#1 / }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      '領収書の宛名を変更できますか',
    )
  })
  await test.step('元の会話から候補を登録して記事の編集に進む', async () => {
    const panel = page.locator('[data-extension="articles"]')
    const add = { name: '記事の候補に追加', exact: true }
    await panel.getByRole('button', add).click()
    await panel.getByLabel('記事にする内容').fill(topic)
    await panel.locator('form').getByRole('button', add).click()
    await page.getByRole('link', { name: 'ヘルプ記事', exact: true }).click()
    await page.getByRole('link', { name: /候補（1件）/ }).click()
    await page.getByRole('link', { name: topic }).click()
    await expect(page.getByLabel('題名')).toHaveValue(topic)
    await expect(page.getByRole('blockquote')).toContainText(
      '経理に提出するため',
    )
    await expect(
      page.getByRole('link', { name: '元の会話 #1 を開く' }),
    ).toHaveAttribute('href', '/conversation/1')
  })
})

test.describe('公開受付の案内', () => {
  test.use({ extensions: ['articles', 'chat', 'survey'] })
  test('チャットだけを有効にした窓口でも、記事を探す前に担当者へ連絡できる', async ({
    page,
    scene,
  }) => {
    await page.goto(scene.origin + '/help/chat/slide')
    await expect(
      page.getByRole('link', { name: 'メールで問い合わせる' }),
    ).toHaveAttribute('href', /^mailto:/)
  })
  test('アンケートに回答する前後で、同じ問い合わせ番号を確かめられる', async ({
    page,
    scene,
  }) => {
    await page.goto(scene.origin + '/help/survey/slide/' + surveyId)
    await expect(page.getByText('問い合わせ #8', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'はい', exact: true }).click()
    await expect(page.getByText('問い合わせ #8', { exact: true })).toBeVisible()
  })
})
