// Walk the actual menu tree. New shared pickers automatically enter the coverage set.
import { expect } from '@playwright/test'
import { openReplyControls } from './drive.mjs'

const triggerSelector =
  '[popovertarget]:not([popovertargetaction=hide]):not(:disabled)'
const panelSelector =
  '[data-slot=popover-content],[data-slot=dropdown-menu-content]'
const items =
  'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary'

async function checkOptions(panel) {
  const options = panel.locator(items).filter({ visible: true })
  const first = options.first()
  if (await first.count()) {
    await first.focus()
    await first.press('ArrowDown')
    const next = options.nth((await options.count()) > 1 ? 1 : 0)
    await expect(next).toBeFocused()
    await next.press('ArrowUp')
    await expect(first).toBeFocused()
    const action = panel
      .locator('button:visible:not(:disabled),a[href]:visible')
      .first()
    if (await action.count()) {
      // Verify native Enter activation without committing a change to the shared fixture.
      await action.evaluate((el) =>
        el.addEventListener(
          'click',
          (event) => {
            event.preventDefault()
            event.stopImmediatePropagation()
            el.dataset.keyboardActivation = String(event.isTrusted)
          },
          { once: true, capture: true },
        ),
      )
      await action.press('Enter')
      await expect(action).toHaveAttribute('data-keyboard-activation', 'true')
    }
  }
  for (const marked of await panel
    .locator('[aria-pressed=true]:visible,[aria-current=true]:visible')
    .all()) {
    expect(
      await marked.evaluate((el) => getComputedStyle(el, '::before').content),
    ).toContain('✓')
  }
  for (const item of await panel
    .locator('a[href]:visible,button:visible')
    .all()) {
    expect(await item.evaluate((el) => getComputedStyle(el).textAlign)).toMatch(
      /^(start|left)$/,
    )
  }
}
async function explore(page, scope, seen, visit) {
  const triggers = await scope.locator(triggerSelector).all()
  for (const trigger of triggers) {
    const id = await trigger.getAttribute('popovertarget')
    if (seen.has(id)) continue
    if (['reply-templates', 'reply-articles'].includes(id))
      await openReplyControls(page)
    if (!(await trigger.isVisible())) continue
    const panel = page.locator('[id="' + id + '"]')
    if (
      !(await panel.evaluate(
        (el, selector) => el.matches(selector),
        panelSelector,
      ))
    )
      continue
    if (
      !(await trigger.evaluate(
        (el) =>
          el.checkVisibility({ visibilityProperty: true }) &&
          !el.closest('[inert]'),
      ))
    )
      continue
    seen.add(id)
    await trigger.scrollIntoViewIfNeeded()
    const background = () =>
      trigger.evaluate((el) => getComputedStyle(el).backgroundColor)
    const closed = await background()
    await trigger.focus()
    await trigger.press('Enter')
    await expect(panel).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect.poll(background).not.toBe(closed)
    await visit(id, panel)
    await checkOptions(panel)
    await explore(page, panel, seen, visit)
    if (!(await panel.evaluate((el) => el.matches(':popover-open')))) continue
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(trigger).toBeFocused()
  }
}

export async function inspectMenus(page, home, visit) {
  const seen = new Set()
  const main = page.locator('main').first()
  if (!(await main.count())) return
  // Open disclosures to reveal pickers that only exist inside an editor.
  for (const summary of await main
    .locator('details:not([open]) > summary')
    .all()) {
    const contains = await summary.evaluate(
      (el) => el.parentElement.querySelector('[popovertarget]') !== null,
    )
    if (contains && (await summary.isVisible())) await summary.click()
  }
  if (home) {
    const drawer = page.locator('[data-open-drawer]')
    if (await drawer.isVisible()) await drawer.click()
    await explore(page, page.locator('#navigation'), seen, visit)
    if (await page.locator('#nav-drawer:modal').count())
      await page.keyboard.press('Escape')
  }
  await explore(page, main, seen, visit)
  const related = main.locator(
    '[popovertarget="related-info"]:not([popovertargetaction=hide])',
  )
  if (await related.isVisible()) {
    await related.click()
    await explore(page, main.locator('#related-info'), seen, visit)
    await page.keyboard.press('Escape')
  }
  const all = main.locator('[data-select-all]')
  if (await all.isVisible()) {
    await all.check()
    await explore(page, main, seen, visit)
    await all.uncheck()
  }
}
