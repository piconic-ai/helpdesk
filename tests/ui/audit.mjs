import { expect } from '@playwright/test'
import axe from 'axe-core'

export async function installAudit(page) {
  await page.evaluate(axe.source)
  await page.evaluate(() => {
    window.inspectHelpdesk = async () => {
      const result = await window.axe.run(document)
      return {
        issues: result.violations.map((rule) => ({
          rule: rule.id,
          elements: rule.nodes.map((node) => node.target),
        })),
        primary: [...document.querySelectorAll('.button-primary')].filter(
          (el) => el.checkVisibility(),
        ).length,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }
    }
  })
}

export function assertAudit(report, id) {
  expect.soft(report.issues, id + ' axe').toEqual([])
  expect.soft(report.primary, id + ' primary actions').toBeLessThanOrEqual(1)
  expect.soft(report.overflow, id + ' viewport').toBe(false)
}

export async function audit(page, id, width) {
  await installAudit(page)
  assertAudit(
    await page.evaluate(() => window.inspectHelpdesk()),
    id + ' at ' + width,
  )
}
