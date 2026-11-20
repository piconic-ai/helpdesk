import { test, expect } from './harness.mjs'

test.use({ extensions: ['chat', 'articles', 'auto-ack'] })

test('製品別に記事の提示基準と自動受付を設定し、以前の値に戻せる', async ({
  page,
  scene,
}) => {
  await page.goto(scene.origin + '/extensions/chat?product=slide')
  const product = (tab, name) =>
    tab
      .locator('section.settings-card')
      .filter({ has: tab.getByRole('heading', { name, exact: true }) })
  const slide = product(page, 'Slide')
  const disclose = async (card) =>
    card.getByText('記事のおすすめを設定', { exact: true }).click()
  await disclose(slide)
  await expect(slide.getByRole('spinbutton')).toHaveValue('60')
  await expect(slide.getByRole('checkbox')).not.toBeChecked()
  await slide.getByRole('spinbutton').fill('96')
  await slide.getByLabel('チャット・フォームのモデル').selectOption('clef')
  await slide
    .getByLabel('受付返信・運営画面のモデル')
    .selectOption('clef-flash')
  await slide.getByRole('checkbox').check()
  await slide.getByRole('button', { name: '記事のおすすめ設定を保存' }).click()
  await expect(
    page.getByText('記事のおすすめ設定を保存しました。'),
  ).toBeVisible()
  await disclose(slide)
  await expect(slide.getByRole('spinbutton')).toHaveValue('96')
  await expect(slide.getByRole('checkbox')).toBeChecked()
  const deskPage = await page.context().newPage()
  await deskPage.goto(scene.origin + '/extensions/chat?product=desk')
  const desk = product(deskPage, 'Desk')
  await disclose(desk)
  await expect(desk.getByRole('spinbutton')).toHaveValue('60')
  await expect(desk.getByRole('checkbox')).not.toBeChecked()
  await deskPage.close()
  const chat = await page.context().newPage()
  await chat.goto(scene.origin + '/help/chat/slide')
  await chat.getByLabel('質問', { exact: true }).fill('領収書を発行したい')
  await chat.getByRole('button', { name: '質問する' }).click()
  await expect(chat.getByText(/質問に合う記事は見つかりません/)).toBeVisible()
  await chat.close()
  const response = await page.request.post(
    scene.origin + '/extensions/chat/recommendations',
    {
      headers: { Origin: scene.origin },
      form: {
        revision: '',
        product: 'slide',
        threshold: '30',
        interactiveModel: 'clef',
        backgroundModel: 'clef',
      },
    },
  )
  expect(response.url()).toContain('publicSettings=conflict')
  await page.getByRole('button', { name: '元に戻す' }).click()
  await disclose(slide)
  await expect(slide.getByRole('spinbutton')).toHaveValue('60')
  await expect(slide.getByRole('checkbox')).not.toBeChecked()
})
