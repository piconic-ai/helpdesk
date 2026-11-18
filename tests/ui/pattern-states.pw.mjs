import { test, expect } from '@playwright/test'
import { startScene } from './seed.mjs'

function appearance(locator) {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el)
    return {
      background: style.backgroundColor,
      color: style.color,
      outline: style.outlineStyle,
      cursor: style.cursor,
      opacity: style.opacity,
    }
  })
}
function animation(locator) {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el)
    return {
      name: style.animationName,
      duration: style.animationDuration,
      transition: style.transitionProperty,
      interval: style.transitionDuration,
      transform: style.transform,
    }
  })
}

test('common controls expose hover, keyboard focus, pressed and disabled states', async ({
  page,
}) => {
  const server = await startScene()
  try {
    await page.goto(server.origin + '/dev/ui')
    const button = page.locator('[data-gallery-toggle]').first()
    const normal = await appearance(button)
    await button.hover()
    await expect
      .poll(async () => (await appearance(button)).background)
      .not.toBe(normal.background)
    const hover = await appearance(button)
    await page.mouse.down()
    await expect
      .poll(async () => (await appearance(button)).background)
      .not.toBe(hover.background)
    await page.mouse.up()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(button).toBeFocused()
    expect((await appearance(button)).outline).toBe('solid')
    const disabled = page.getByRole('button', { name: '無効', exact: true })
    await expect(disabled).toBeDisabled()
    expect((await appearance(disabled)).color).not.toBe(normal.color)
    await page.getByRole('button', { name: 'その他の操作' }).focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('#sample-menu')).toBeVisible()
    await expect(page.locator('#sample-menu button').first()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('button', { name: 'その他の操作' }),
    ).toBeFocused()
  } finally {
    await server.stop()
  }
})
test('the page and popup fade opacity in place and honor reduced motion', async ({
  page,
}) => {
  const server = await startScene()
  try {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(server.origin + '/dev/ui')
    const layout = page.locator('[data-ui-page]').first()
    expect(await animation(layout)).toMatchObject({
      name: 'pattern-fade-in',
      duration: '0.15s',
      transform: 'none',
    })
    const trigger = page.getByRole('button', { name: '担当・佐藤 優' })
    const panel = page.locator('#sample-assignee')
    await trigger.click()
    await expect(panel).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const open = await animation(panel)
    expect(open.transition.split(', ')).toContain('opacity')
    expect(open.interval.split(', ')).toContain('0.15s')
    expect(open.transform).toBe('none')
    await expect.poll(async () => (await appearance(panel)).opacity).toBe('1')
    await trigger.click()
    await expect(panel).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect((await appearance(panel)).opacity).toBe('0')
    await page.goto(server.origin + '/account')
    const account = page.locator('[data-ui-page="edit"]')
    expect(await animation(account)).toMatchObject({
      name: 'pattern-fade-in',
      duration: '0.15s',
      transform: 'none',
    })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect((await animation(account)).name).toBe('none')
    await page.goto(server.origin + '/dev/ui')
    await trigger.click()
    expect((await animation(panel)).interval).toBe('0s')
  } finally {
    await server.stop()
  }
})
