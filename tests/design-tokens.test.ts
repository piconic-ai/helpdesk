import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import postcss from 'postcss'
import { expect, it } from 'vitest'

const file = (path: string) => readFileSync(path, 'utf8')
const tokenFile = 'public/ui/tokens.css'
const tokens = new Map<string, string>()
postcss.parse(file(tokenFile)).walkDecls((d) => {
  tokens.set(d.prop, d.value)
})

function walk(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const name = join(path, entry.name)
    return entry.isDirectory() ? walk(name) : [name]
  })
}

const styles = [
  'public/styles.css',
  ...walk('public/ui'),
  ...walk('public/extension-assets'),
].filter((p) => p.endsWith('.css') && p !== tokenFile)
const pages = [...walk('src'), ...walk('components')].filter(
  (p) =>
    /\.tsx?$/.test(p) &&
    !p.includes('.test.') &&
    (/(-pages?\.tsx?$|\.tsx$)/.test(p) ||
      /<(?:h1|main|section|form|article|!doctype html)\b/i.test(file(p))),
)
const literalColor =
  /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|(?:ok)?l(?:ab|ch)|color)\s*\(/i
const spacingProperty =
  /^(?:margin|padding|gap|row-gap|column-gap|border(?:-\w+)*-radius)(?:-|$)/
const rawLength =
  /(?:^|[^\w-])-?(?:\d*\.)?\d+(?:px|em|rem|pt|%|vw|vh|ch)(?![\w-])/i

it('publishes the exact tokens in the design specification', () => {
  expect(
    execFileSync('ruby', ['scripts/design-tokens.rb', '--check']).toString(),
  ).toBe('')
})

it('uses existing tokens for colors, spacing and rounded corners in every stylesheet and page', () => {
  const errors: string[] = []
  for (const path of styles) {
    postcss.parse(file(path)).walkDecls((d) => {
      for (const ref of d.value.matchAll(/var\((--[\w-]+)/g))
        if (!tokens.has(ref[1])) errors.push(path + ': unknown ' + ref[1])
      if (literalColor.test(d.value)) errors.push(path + ': ' + d.toString())
      if (spacingProperty.test(d.prop) && rawLength.test(d.value))
        errors.push(path + ': ' + d.toString())
      if (
        /^(?:font|font-size|font-weight|font-family|line-height)$/.test(
          d.prop,
        ) &&
        !/^(?:inherit|var\(--)/.test(d.value)
      )
        errors.push(path + ': ' + d.toString())
      if (
        /^(?:color|background(?:-color)?|border(?:-color)?)$/.test(d.prop) &&
        /\b(?:white|black|red|green|blue|gray|grey|yellow|orange|purple)\b/i.test(
          d.value,
        )
      )
        errors.push(path + ': ' + d.toString())
    })
  }
  for (const path of pages) {
    const source = file(path)
    if (literalColor.test(source)) errors.push(path + ': literal color')
    // Inline presentation would bypass the stylesheet and the scale checks above.
    if (/\bstyle\s*=|<style[\s>]/.test(source))
      errors.push(path + ': inline style')
    if (/\b(?:bg|text|rounded|[mp][xytrbl]?|gap)-\[[^\]]+\]/.test(source))
      errors.push(path + ': arbitrary utility')
  }
  expect(errors).toEqual([])
})

function luminance(token: string) {
  const hex = tokens.get('--colors-' + token)
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex))
    throw new Error('Invalid color ' + token)
  const channels = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

// Enabled text and its supported surfaces, including hover, selection and notes.
const pairs: Record<string, string[]> = {
  ink: [
    'canvas',
    'surface-soft',
    'surface-card',
    'surface-strong',
    'selected',
    'note-soft',
  ],
  body: [
    'canvas',
    'surface-soft',
    'surface-card',
    'surface-strong',
    'selected',
  ],
  muted: ['canvas', 'surface-soft', 'surface-card', 'note-soft', 'selected'],
  'on-primary': ['primary', 'primary-active'],
  link: ['canvas', 'surface-soft'],
  success: ['success-soft'],
  warning: ['warning-soft'],
  error: ['canvas', 'error-soft'],
  note: ['note-soft'],
}
it.each(Object.entries(pairs))(
  'keeps %s text at WCAG AA contrast on its backgrounds',
  (foreground, backgrounds) => {
    for (const background of backgrounds) {
      const a = luminance(foreground),
        b = luminance(background)
      expect(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        foreground + ' on ' + background,
      ).toBeGreaterThanOrEqual(4.5)
    }
  },
)
