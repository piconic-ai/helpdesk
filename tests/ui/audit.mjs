import { inspectComposition } from './composition-audit.mjs'
import { inspectDesign } from './design-audit.mjs'
import { expect } from '@playwright/test'
import axe from 'axe-core'

export async function installAudit(page) {
  await page.evaluate(axe.source)
  const design = [
    ...(await page.evaluate(inspectDesign)),
    ...(await page.evaluate(inspectComposition)),
  ]
  await page.evaluate((result) => {
    window.helpdeskDesignFindings = result
  }, design)
  await page.evaluate(() => {
    window.inspectHelpdesk = async () => {
      const result = await window.axe.run(document)
      const surface = document.querySelector('dialog:modal') ?? document
      const primaryGroups = new Map()
      for (const el of surface.querySelectorAll('.button-primary')) {
        if (!el.checkVisibility()) continue
        const group = el.closest('.draft-review') ?? surface
        primaryGroups.set(group, (primaryGroups.get(group) ?? 0) + 1)
      }
      return {
        design: window.helpdeskDesignFindings,
        issues: result.violations.map((rule) => ({
          rule: rule.id,
          elements: rule.nodes.map((node) => node.target),
        })),
        primary: Math.max(0, ...primaryGroups.values()),
        overflow: document.documentElement.scrollWidth > innerWidth,
      }
    }
  })
}

export function assertAudit(report, id) {
  expect.soft(report.design, id + ' design scale').toEqual([])
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
