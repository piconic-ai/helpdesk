import { expect, test } from '@playwright/test'
import { startDemo } from './demo-scene.mjs'

test('30プロジェクトでも起票先の不足と最後の管理者を読み取れる', async ({
  page,
}, testInfo) => {
  const demo = await startDemo()
  try {
    await page.goto(demo.origin + '/extensions')
    const issue = page.locator('[data-extension="issues"]')
    await expect(issue).not.toContainText('起票先が未設定')
    await issue.getByRole('link', { name: '設定', exact: true }).click()
    const picker = page.locator('form[data-project-picker]')
    await picker
      .getByRole('button', { name: 'プロジェクト：プロジェクトを選択' })
      .click()
    const projects = picker.locator('[data-choice]:not([data-choice=""])')
    await expect(projects).toHaveCount(2)
    await expect(projects).toHaveText(['Desk', 'Slide'])
    await picker.getByRole('button', { name: 'Desk', exact: true }).click()
    await picker.getByRole('button', { name: '設定を開く' }).click()
    await expect(page.getByLabel('GitHub リポジトリ')).toHaveValue(
      'example/desk',
    )
    await page.goto(
      demo.origin + '/settings/projects/conference-2027/extensions',
    )
    const projectIssue = page
      .getByRole('heading', { name: 'GitHub Issue', exact: true })
      .locator('..')
    await projectIssue.getByRole('link', { name: '詳細' }).click()
    await expect(
      page.getByRole('heading', { name: 'GitHub Issueの詳細' }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: '設定を開く' })).toHaveCount(0)
    await page.getByRole('link', { name: 'プロジェクトの拡張に戻る' }).click()
    await projectIssue
      .getByRole('button', { name: '有効にする', exact: true })
      .click()
    await expect(
      projectIssue.getByRole('button', { name: '無効にする' }),
    ).toBeVisible()
    for (const width of [375, 800, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(demo.origin + '/extensions')
      await expect(issue).toContainText('起票先が未設定のプロジェクト 1件')
      await expect(issue).not.toContainText('開発者カンファレンス')
      await expect(issue.getByRole('link', { name: '詳細' })).toBeVisible()
      await testInfo.attach('issues-' + width, {
        body: await issue.screenshot(),
        contentType: 'image/png',
      })
      await issue.getByRole('link', { name: '起票先を設定' }).click()
      await expect(
        page.getByRole('heading', {
          name: '開発者カンファレンス 2027',
          exact: true,
        }),
      ).toBeVisible()
      await expect(page.getByLabel('GitHub リポジトリ')).toBeVisible()
      await page.getByRole('link', { name: '拡張の管理に戻る' }).click()
      await expect(issue).toBeVisible()
      await page.goto(
        demo.origin + '/settings/projects/conference-2027/members',
      )
      const card = page
        .getByRole('heading', { name: '所属するメンバー（1人）' })
        .locator('..')
      await expect(
        card.getByText('最後の管理者です。', { exact: false }),
      ).toBeVisible()
      for (const value of ['佐藤 優', 'sato@example.com']) {
        const lineCount = await card
          .getByText(value, { exact: true })
          .evaluate((el, value) => {
            const node = [...el.childNodes].find(
              (child) =>
                child.nodeType === Node.TEXT_NODE &&
                child.textContent.includes(value),
            )
            const range = document.createRange()
            range.selectNodeContents(node)
            return [...range.getClientRects()].filter((rect) => rect.width > 0)
              .length
          }, value)
        expect(lineCount, value + ' at ' + width + 'px').toBe(1)
      }
      await testInfo.attach('member-' + width, {
        body: await card.screenshot(),
        contentType: 'image/png',
      })
    }
    await page.goto(demo.origin + '/extensions')
    await issue.getByRole('link', { name: '起票先を設定' }).click()
    await page.getByLabel('GitHub リポジトリ').fill('demo/conference-2027')
    await page.getByRole('button', { name: '登録する' }).click()
    await expect(page.getByText('リポジトリを登録しました。')).toBeVisible()
    await page.getByRole('link', { name: '拡張の管理に戻る' }).click()
    await expect(issue).not.toContainText('起票先が未設定')
  } finally {
    await demo.stop()
  }
})
