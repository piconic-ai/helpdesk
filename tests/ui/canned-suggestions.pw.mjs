import { test, expect } from '@playwright/test'
import { openReplyControls } from './drive.mjs'
import { startScene, fixedTime } from './seed.mjs'

test('suggests scoped templates alongside articles and inserts them into an editable reply', async ({
  page,
}) => {
  const scene = await startScene(['chat', 'articles', 'canned'])
  const saved = (id, name, product) =>
    scene.db
      .prepare('INSERT INTO canned_data(key,value) VALUES(?,?)')
      .bind(
        'template/' + id,
        JSON.stringify({
          name,
          body: '{{name}} 様、{{product}}です。',
          product,
        }),
      )
      .run()
  try {
    await saved('slide-receipt', '領収書の案内', 'slide')
    await saved('slide-billing', '請求先の案内', 'slide')
    await saved('desk-receipt', '領収書の別窓口', 'desk')
    await page.goto(scene.origin + '/conversation/1')
    await openReplyControls(page)
    const strip = page.getByRole('region', { name: '返信の候補' })
    const template = strip.getByRole('button', { name: '領収書の案内' })
    await expect(template).toBeVisible()
    await expect(strip.getByText('記事', { exact: true })).toBeVisible()
    await expect(strip.getByText('定型文', { exact: true })).toBeVisible()
    await expect(
      strip.getByRole('button', { name: '領収書の別窓口' }),
    ).toHaveCount(0)
    const editor = page.getByLabel('返信', { exact: true })
    await editor.fill('前文。後文。')
    await editor.evaluate((field) => field.setSelectionRange(3, 3))
    await template.click()
    await expect(editor).toHaveValue('前文。山田 花 様、Slideです。後文。')
    await expect(editor).toBeFocused()
    expect(
      await scene.db
        .prepare(
          "SELECT count(*) AS n FROM messages WHERE number=1 AND kind='outbound'",
        )
        .first('n'),
    ).toBe(0)

    await editor.fill('前文。山田 花 様、Slideサポートです。後文。')
    await page.reload()
    await openReplyControls(page)
    await expect(editor).toHaveValue(
      '前文。山田 花 様、Slideサポートです。後文。',
    )
    const registered = page.waitForResponse(
      (response) =>
        response.url().endsWith('/canned-selection') &&
        response.request().postData()?.includes('action=edited'),
    )
    await page.getByRole('button', { name: '送信', exact: true }).click()
    expect((await registered).status()).toBe(204)

    await saved('late-receipt', '領収書の追加案内', 'slide')
    await page.reload()
    await openReplyControls(page)
    await expect(template).toBeVisible()
    await expect(
      strip.getByRole('button', { name: '領収書の追加案内' }),
    ).toHaveCount(0)
    expect(
      await scene.db
        .prepare(
          'SELECT count(*) AS n FROM canned_presentations WHERE number=1',
        )
        .first('n'),
    ).toBe(1)

    await scene.db
      .prepare(
        "INSERT INTO messages(id,number,kind,body,created_at) VALUES('new-inbound',1,'inbound','請求先を変更しました',?)",
      )
      .bind(fixedTime + 1)
      .run()
    await page.reload()
    await openReplyControls(page)
    await expect(
      strip.getByRole('button', { name: '請求先の案内' }),
    ).toBeVisible()
    await expect(template).toHaveCount(0)

    const selected = page.waitForResponse(
      (response) =>
        response.url().endsWith('/canned-selection') &&
        response.request().postData()?.includes('action=selected'),
    )
    await strip.getByRole('button', { name: '請求先の案内' }).click()
    expect((await selected).status()).toBe(204)
    await expect(editor).toHaveValue('山田 花 様、Slideです。')
    await editor.evaluate((field) => field.form.reset())
    await expect(editor).toHaveValue('')
    await page.reload()
    await openReplyControls(page)
    await expect(editor).toHaveValue('')
    await editor.fill('この返信は手入力です。')
    await page.getByRole('button', { name: '送信', exact: true }).click()
    await expect(editor).toHaveValue('')
    expect(
      await scene.db
        .prepare(
          "SELECT edited FROM canned_uses WHERE template='slide-billing'",
        )
        .first('edited'),
    ).toBeNull()

    await page.goto(scene.origin + '/extensions/canned')
    const row = page.getByRole('listitem').filter({ hasText: '領収書の案内' })
    await expect(row).toContainText('提示 1 回・使用 1 回・編集 100%')
  } finally {
    await scene.stop()
  }
})

test('falls back to the subject and labels when Clef is unavailable', async ({
  page,
}) => {
  const scene = await startScene(['canned'])
  try {
    const template = (id, title) =>
      scene.db.prepare('INSERT INTO canned_data(key,value) VALUES(?,?)').bind(
        'template/' + id,
        JSON.stringify({
          name: title,
          body: 'ご案内します。',
          product: 'slide',
        }),
      )
    await scene.db.batch([
      template('subject-match', '領収書'),
      template('label-match', '請求変更'),
      template('ignored', '招待メール'),
      scene.db.prepare("DELETE FROM labels WHERE number=1 AND name='領収書'"),
      scene.db.prepare("INSERT INTO labels(number,name) VALUES(1,'請求変更')"),
      scene.db.prepare(
        "UPDATE messages SET body='Clef unavailable fixture' WHERE id='in-1'",
      ),
    ])
    await page.goto(scene.origin + '/conversation/1')
    await openReplyControls(page)
    const strip = page.getByRole('region', { name: '返信の候補' })
    await expect(strip.getByRole('button')).toHaveText(['請求変更', '領収書'])
    await expect(strip.getByText('記事', { exact: true })).toBeHidden()
    await page.goto(scene.origin + '/conversation/3')
    await expect(strip).toBeHidden()
  } finally {
    await scene.stop()
  }
})
