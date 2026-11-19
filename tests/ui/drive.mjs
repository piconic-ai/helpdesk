import { installAudit, assertAudit } from './audit.mjs'
import assert from 'node:assert/strict'

const draft =
  'お問い合わせありがとうございます。領収書の宛名を確認し、再発行の手順をご案内します。'
const note = '次回の請求日までに経理担当へ確認する。'

async function reveal(target) {
  const folded = await target
    .locator('xpath=ancestor-or-self::details[not(@open)]')
    .all()
  for (const details of folded)
    await details.locator(':scope > summary').click()
  await target.scrollIntoViewIfNeeded()
  await target.evaluate((el) =>
    el.scrollIntoView({ block: 'center', behavior: 'instant' }),
  )
}

async function section(page, scene, before) {
  const selector = before ? scene.before : scene.after
  if (!selector) return
  let target = page.locator(selector)
  if (before)
    target = target.filter({
      has: page.getByRole('heading', {
        name: scene.beforeHeading,
        exact: true,
      }),
    })
  if (
    !before &&
    (await target
      .first()
      .locator('xpath=ancestor::*[@id="related-info"]')
      .count())
  ) {
    const opener = page.getByRole('button', { name: '関連情報', exact: true })
    if (await opener.isVisible()) await opener.click()
  }
  if (
    !before &&
    (await target
      .first()
      .locator('xpath=ancestor::*[@id="thread-actions"]')
      .count())
  ) {
    await page.getByRole('button', { name: 'その他の操作' }).click()
  }
  await reveal(target.first())
  if (!before) {
    const panel = target.first().locator('details:not([open])').first()
    if (await panel.count()) await panel.locator(':scope > summary').click()
    const trigger = target
      .first()
      .locator('[data-slot=popover-trigger]')
      .first()
    if (await trigger.count()) await trigger.click()
  }
}

async function compose(page, mode, before) {
  const form = page
    .locator(before ? 'form[action="/actions/reply"]' : '.composer')
    .first()
  await reveal(form)
  if (mode === 'empty') return
  if (mode === 'note') {
    if (before) {
      const previous = page.locator('form[action="/actions/note"]')
      await reveal(previous)
      await previous.locator('textarea').fill(note)
    } else {
      await form.locator('textarea:visible').fill(draft)
      const memoTab = form.getByRole('tab', {
        name: '内部メモ',
        exact: true,
      })
      await memoTab.click()
      assert.equal(await form.locator('textarea:visible').inputValue(), '')
      await form.locator('textarea:visible').fill(note)
      await form.getByRole('tab', { name: '返信', exact: true }).click()
      assert.equal(await form.locator('textarea:visible').inputValue(), draft)
      await memoTab.click()
      assert.equal(await form.locator('textarea:visible').inputValue(), note)
      await form.locator('textarea:visible').focus()
      assert.ok(
        await form
          .getByText('内部メモ（相手には送られません）', { exact: true })
          .isVisible(),
      )
    }
    return
  }
  await form.locator('textarea:visible').fill(draft)
  if (mode === 'typing') return
  const submit = before
    ? form.locator('button[type=submit]:visible').first()
    : form.getByRole('button', { name: '送信', exact: true })
  let resume
  const held = new Promise((resolve) => {
    resume = resolve
  })
  const pending = page.waitForRequest(
    (req) =>
      req.method() === 'POST' &&
      new URL(req.url()).pathname === '/actions/reply',
  )
  await page.route('**/actions/reply', async (route) => {
    if (mode === 'sending') {
      await held
      await route.abort('aborted')
      return
    }
    const rejected = await route.fetch({
      postData: new URLSearchParams({
        number: '99999',
        body: draft,
      }).toString(),
    })
    await route.fulfill({ response: rejected }).catch(() => {})
  })
  const click = submit.click({ noWaitAfter: true }).catch(() => {})
  await pending
  if (mode === 'sending') {
    if (!before) {
      const sending = page.getByRole('button', { name: '送信中…', exact: true })
      await sending.waitFor()
      assert.ok(await sending.isDisabled())
      // Chromium releases focus on the disabled submit button at the next paint.
      await page.waitForFunction(
        () => !document.activeElement?.matches(':disabled'),
      )
    }
    return async () => {
      resume()
      await page.unrouteAll({ behavior: 'wait' })
      await click
    }
  }
  await click
  if (!before) {
    await page.locator('[role=alert]:visible').waitFor()
    assert.equal(await form.locator('textarea:visible').inputValue(), draft)
    await reveal(form)
  } else await page.waitForURL('**/actions/reply')
}

async function postJsonPage(page, origin, kind, mode) {
  const path =
    '/public/' + kind + '/slide/' + (kind === 'chat' ? 'ask' : 'submit')
  const payload =
    kind === 'chat'
      ? {
          email: 'reader@example.net',
          question:
            mode === 'articles'
              ? '領収書はどこから発行できますか？'
              : '契約名義を変更できますか？',
        }
      : {
          email: 'reader@example.net',
          body: '設定画面の説明が分かりやすくなりました。',
        }
  const result = await page.request.post(origin + path, {
    data: payload,
    headers: { Origin: origin, 'X-Helpdesk-Key': 'visual-test' },
  })
  assert.equal(result.status(), 201, await result.text())
  // Display the original API response as a document, using the browser's JSON viewer.
  await page.route('**' + path, (route) => route.fulfill({ response: result }))
  const response = await page.goto(origin + path)
  assert.equal(response.status(), 201)
}

async function publicIntake(page, scene, origin, before) {
  const [kind, mode] = scene.action.split('-')
  if (mode === 'input') return
  if (before) return postJsonPage(page, origin, kind, mode)
  await page
    .locator('textarea')
    .fill(
      kind === 'chat'
        ? mode === 'articles'
          ? '領収書はどこから発行できますか？'
          : '契約名義を変更できますか？'
        : '設定画面の説明が分かりやすくなりました。',
    )
  const email = page.locator('input[name=email]')
  if (kind !== 'feedback' && (await email.isVisible()))
    await email.fill('reader@example.net')
  await page
    .locator('form button[type=submit],form button:not([type])')
    .last()
    .click()
  if (kind === 'chat' && mode === 'receipt') {
    await page.locator('input[name=email]').fill('reader@example.net')
    await page.getByRole('button', { name: '送信', exact: true }).click()
  }
  if (mode === 'articles')
    await page.locator('a[href*="/help/articles/slide/receipt"]').waitFor()
  else
    await page
      .getByText(/受け付け|受け取り|ありがとうございました|ありがとうございま/)
      .first()
      .waitFor()
}

async function prepareForget(page, before) {
  const form = page.locator('form[action="/actions/forget"]')
  await reveal(form)
  if (before) await form.locator('[name=contact]').fill('customer8@example.net')
  else
    await form.locator('[name=contact]').selectOption('customer8@example.net')
  if (!before) {
    await form.locator('button:visible').first().click()
    await page.getByRole('dialog').waitFor()
    assert.match(
      await page.getByRole('dialog').innerText(),
      /customer8@example.net/,
    )
  }
}
async function invalidMailbox(page, before) {
  const form = page.locator(
    before ? 'form[action="/actions/mailbox"]' : '#mailboxes form',
  )
  await reveal(form)
  if (before) await form.locator('[name=product]').fill('slide')
  await form.locator('[name=name]').fill('Slide')
  const address = form.locator(before ? '[name=address]' : '[name=local]')
  await address.fill(before ? 'example' : 'invalid address')
  await form.locator('button').click()
  if (!before) assert.equal(await address.getAttribute('aria-invalid'), 'true')
}
async function operationDocument(page, action) {
  const command =
    action === 'issue-preview' ? 'issues.preview' : 'metrics.report'
  const fields =
    action === 'issue-preview'
      ? {
          number: '1',
          title: '請求書の宛名を変更できるようにする',
          summary: '請求書の宛名を変更すると確認画面が開きません。',
        }
      : { product: 'slide', from: '1792281600000', to: '1794960000000' }
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith('/actions/' + command) &&
      r.request().method() === 'POST',
  )
  await page.evaluate(
    ({ command, fields }) => {
      const form = document.createElement('form')
      form.method = 'post'
      form.action = '/actions/' + command
      for (const [name, value] of Object.entries(fields)) {
        const field = document.createElement('input')
        Object.assign(field, { type: 'hidden', name, value })
        form.append(field)
      }
      document.body.append(form)
      form.submit()
    },
    { command, fields },
  )
  assert.equal((await response).status(), 200)
  await page.waitForURL('**/actions/' + command)
}

async function changeMetricPeriod(page, before) {
  const form = page.locator(
    before
      ? 'form[action="/actions/metrics.report"]'
      : 'form[action="/metrics"]',
  )
  await reveal(form)
  if (before) await form.locator('button').click()
  else {
    await form.locator('select[name=period]').selectOption('7')
    await page.waitForURL((url) => url.searchParams.get('period') === '7')
    await form.locator('select[name=period]').selectOption('30')
    await page.waitForURL((url) => url.searchParams.get('period') !== '7')
  }
}

async function takeAction(page, action, before) {
  if (action === 'issue-preview' || action === 'operation-result')
    await operationDocument(page, action)
  if (action === 'approve-dialog')
    await page
      .getByRole('button', { name: '承認して送信', exact: true })
      .click()
  if (action === 'context') {
    const opener = page.getByRole('button', { name: '関連情報', exact: true })
    if (await opener.isVisible()) await opener.click()
    await page.locator('#related-info').waitFor({ state: 'visible' })
  }
  if (action === 'article-preview')
    await page.getByRole('button', { name: 'プレビュー', exact: true }).click()
  if (action === 'invalid') await invalidMailbox(page, before)
  if (action === 'forget') await prepareForget(page, before)
  if (action === 'vote' || action === 'survey')
    await page.locator('button[value=yes]').click()
  if (action === 'result') await changeMetricPeriod(page, before)
}

async function observeLoading(page) {
  await installAudit(page)
  const seen = Promise.withResolvers()
  await page.exposeFunction('reportLoading', seen.resolve)
  // Once native navigation starts, browser automation waits for its commit.
  // Inspect the original document when its own indicator becomes visible.
  await page.evaluate(() => {
    const indicator = document.querySelector('[data-inbox-loading]')
    const observer = new MutationObserver(async () => {
      if (indicator.hidden) return
      observer.disconnect()
      window.reportLoading(await window.inspectHelpdesk())
    })
    observer.observe(indicator, {
      attributes: true,
      attributeFilter: ['hidden'],
    })
  })
  return seen
}

async function pendingSearch(page, before) {
  const held = Promise.withResolvers()
  const intercepted = Promise.withResolvers()
  await page.route('**/?*', async (route) => {
    intercepted.resolve()
    await held.promise
    await route.continue()
  })
  const seen = before ? undefined : await observeLoading(page)
  const field = page.locator('input[name=query]')
  await field.fill('領収書')
  const click = before
    ? page
        .locator('form.filters')
        .getByRole('button', { name: '検索', exact: true })
        .click({ noWaitAfter: true })
    : Promise.resolve()
  await intercepted.promise
  if (seen)
    assertAudit(
      await seen.promise,
      'search response pending at ' + page.viewportSize().width,
    )
  return async () => {
    const navigation = page.waitForURL(
      (url) => url.searchParams.get('query') === '領収書',
    )
    held.resolve()
    await Promise.all([navigation, click])
    if (!before)
      assert.equal(
        await page.locator('[data-inbox-loading]').isVisible(),
        false,
      )
  }
}

export async function prepare(page, scene, origin, before) {
  if (before && /^(chat|feedback)-(articles|receipt)$/.test(scene.action))
    return publicIntake(page, scene, origin, true)
  const response = await page.goto(
    origin + (before ? (scene.beforeUrl ?? scene.url) : scene.url),
  )
  assert.equal(
    response.status(),
    before && scene.beforeMissing ? 404 : (scene.status ?? 200),
    `Unexpected status at ${scene.url}`,
  )
  await page.evaluate(() => document.fonts.ready)
  if (scene.id === 'link-issue' && !before)
    await page.locator('[data-issue-picker] select:enabled').waitFor()
  if (scene.action === 'loading') return pendingSearch(page, before)
  if (scene.action?.startsWith('compose-'))
    return compose(page, scene.action.slice(8), before)
  if (
    scene.action?.startsWith('chat-') ||
    scene.action?.startsWith('feedback-')
  ) {
    await publicIntake(page, scene, origin, before)
    return
  }
  await section(page, scene, before)
  await takeAction(page, scene.action, before)
  if (scene.id === 'thread-note' && !before)
    assert.ok(
      await page
        .getByText('内部メモ（相手には送られません）', { exact: true })
        .first()
        .isVisible(),
    )
}

async function tabTo(page, locator) {
  await locator.waitFor({ state: 'attached' })
  for (let i = 0; i < 300; i++) {
    if (await locator.evaluate((el) => el === document.activeElement)) return
    await page.keyboard.press('Tab')
  }
  throw new Error('Keyboard could not reach ' + (await locator.textContent()))
}
export async function keyboardFlow(page, origin) {
  await page.goto(origin + '/')
  await tabTo(page, page.locator('a.conversation-row[href="/conversation/1"]'))
  await page.keyboard.press('Enter')
  await page.waitForURL('**/conversation/1')
  await tabTo(page, page.locator('.composer textarea:visible'))
  await page.keyboard.type('Keyboard-only reply.')
  await tabTo(
    page,
    page
      .locator('.composer')
      .getByRole('button', { name: '送信', exact: true }),
  )
  await page.keyboard.press('Enter')
  await page
    .locator('.message-outbound')
    .getByText('Keyboard-only reply.', { exact: true })
    .waitFor()
  await tabTo(
    page,
    page.getByRole('button', { name: '完了にする', exact: true }),
  )
  await page.keyboard.press('Enter')
  await page.locator('.status-closed').first().waitFor()
  await page.goto(origin + '/')
  assert.equal(
    await page.locator('a.conversation-row[href="/conversation/1"]').count(),
    0,
  )
}
