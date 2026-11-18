import { expect } from '@playwright/test'

// A newly displayed form may reach the renderer before Chromium's Autofill service has parsed it.
export async function customerContact(page) {
  const field = page.getByLabel('連絡先メールアドレス')
  const email = 'reader@example.net'
  const address = { fields: [{ name: 'EMAIL_ADDRESS', value: email }] }
  await page.bringToFront()
  await field.click()
  const cdp = await page.context().newCDPSession(page)
  try {
    await cdp.send('Autofill.enable')
    await cdp.send('Autofill.setAddresses', { addresses: [address] })
    await expect(async () => {
      const { root } = await cdp.send('DOM.getDocument')
      const { nodeId } = await cdp.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: 'input[autocomplete=email]:focus',
      })
      const { node } = await cdp.send('DOM.describeNode', { nodeId })
      const { frameTree } = await cdp.send('Page.getFrameTree')
      await cdp.send('Autofill.trigger', {
        fieldId: node.backendNodeId,
        frameId: frameTree.frame.id,
        address,
      })
      expect(await field.inputValue()).toBe(email)
      expect(await field.evaluate((input) => input.matches(':autofill'))).toBe(
        true,
      )
    }).toPass({ timeout: 10000, intervals: [100, 250, 500] })
  } finally {
    await cdp.detach()
  }
}
