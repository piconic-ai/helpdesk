import { fixedTime } from './seed.mjs'

const missingId = '233b1729-7201-4ac3-a0e9-e5548a3fc6e8'
const missingQuestion = 'チームの利用履歴を月ごとに集計できますか？'
export const suggestionScenes = [
  ['suggest-settings', '推薦する条件と自動受付を設定する', '/extensions/chat'],
  ['suggest-form', '送信する前に記事を確認する', '/help/form/slide'],
  ['suggest-human', '個別調査が必要な質問をする', '/help/chat/slide'],
  ['suggest-composer', '返信に関連記事を添える', '/conversation/1'],
  ['suggest-composer-empty', '返信から記事の候補を作る', '/conversation/2'],
  ['suggest-library', '記事ごとの効果を見直す', '/articles'],
  ['suggest-questions', '記事が無かった質問を探す', '/articles/questions'],
  ['suggest-questions-empty', '質問がまだ無い一覧', '/articles/questions'],
  [
    'suggest-editor',
    '記事が無かった質問から書き始める',
    '/articles/new?question=' + missingId,
  ],
  ['suggest-metric', '記事で解決した割合を確かめる', '/metrics'],
].map(([id, label, url]) => ({
  id,
  label,
  url,
  group: '関連記事の推薦',
  extensions: ['chat', 'articles', 'form', 'metrics', 'auto-ack'],
}))

export async function seedSuggestionScene(db, id) {
  if (
    ![
      'suggest-library',
      'suggest-questions',
      'suggest-editor',
      'suggest-metric',
    ].includes(id)
  )
    return
  const write = (key, question, articles, score) =>
    db
      .prepare(
        'INSERT INTO suggestion_presentations(id,product,surface,question,articles,highest_score,at) VALUES(?,?,?,?,?,?,?)',
      )
      .bind(
        key,
        'slide',
        'chat',
        question,
        JSON.stringify(articles),
        score,
        fixedTime - 3600000,
      )
  const article = { id: 'receipt', score: 0.95 }
  const example = (i) => `2a4062f4-7ba0-4b20-94d1-00000000000${i}`
  const statements = [write(missingId, missingQuestion, [], 0.28)]
  for (let i = 0; i < 4; i++)
    statements.push(write(example(i), '領収書を発行したい', [article], 0.95))
  statements.push(
    db
      .prepare(
        'INSERT INTO suggestion_reactions(presentation,action,article,at) VALUES(?,?,?,?)',
      )
      .bind(example(0), 'opened', 'receipt', fixedTime - 3000000),
  )
  if (id === 'suggest-metric')
    statements.push(
      db
        .prepare(
          'INSERT INTO suggestion_reactions(presentation,action,article,at) VALUES(?,?,?,?)',
        )
        .bind(example(0), 'resolved', 'receipt', fixedTime - 2600000),
    )
  await db.batch(statements)
}

export async function exposeSuggestionScene(page, id) {
  if (id === 'suggest-settings') {
    const card = page.locator('section.settings-card').filter({
      has: page.getByRole('heading', { name: 'Slide', exact: true }),
    })
    const target = card.getByText('記事のおすすめを設定', { exact: true })
    await target.click()
    await target.scrollIntoViewIfNeeded()
  } else if (id === 'suggest-form') {
    await page.locator('input[name=subject]').fill('経費精算について')
    await page
      .locator('textarea[name=body]')
      .fill('先月の領収書を発行したいです。')
    await page.locator('input[name=email]').fill('reader@example.net')
    await page.getByRole('button', { name: '送信', exact: true }).click()
    await page
      .getByRole('heading', { name: 'この記事で解決しませんか' })
      .waitFor()
  } else if (id === 'suggest-human') {
    await page
      .getByLabel('質問', { exact: true })
      .fill('領収書の金額が違います。二重請求か調査してください。')
    await page.getByRole('button', { name: '質問する' }).click()
    await page.getByRole('button', { name: '担当者に問い合わせる' }).waitFor()
  } else if (id === 'suggest-composer') {
    await page.getByRole('button', { name: '記事を添える' }).click()
    await page.getByRole('searchbox', { name: '記事の題名で検索' }).waitFor()
  } else if (id === 'suggest-composer-empty') {
    await page
      .locator('.composer')
      .getByRole('button', { name: '記事の候補に追加', exact: true })
      .scrollIntoViewIfNeeded()
  } else if (id === 'suggest-metric') {
    await page
      .getByRole('heading', { name: '待たずに解決できた割合' })
      .scrollIntoViewIfNeeded()
  }
}
