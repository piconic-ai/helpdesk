import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import {
  identityColor,
  identityColorNames,
  identityPalette,
  initial,
} from '../src/ui/identity-color'
import { extensions } from '../helpdesk.config'

it('assigns stable colors and keeps a complete initial grapheme', () => {
  expect(identityColor(' Ana@Example.org ')).toBe(
    identityColor('ana@example.org'),
  )
  expect(identityColor('Café')).toBe(identityColor('Cafe\u0301'))
  expect(initial(' 👩🏽‍💻 Developer')).toBe('👩🏽‍💻')
  expect(initial(' ゆり')).toBe('ゆ')
  expect(initial('')).toBe('？')
})

it('uses eight distinct named identity swatches with legible white initials', () => {
  expect(new Set(identityPalette).size).toBe(8)
  expect(new Set(identityColorNames).size).toBe(8)
  const css = readFileSync('public/ui/tokens.css', 'utf8')
  const semanticColors = [
    ...css.matchAll(
      /--colors-(?:success|warning|error|note)(?:-soft)?: (#[\da-f]+);/g,
    ),
  ].map((m) => m[1])
  for (const [index, hex] of identityPalette.entries()) {
    expect(css).toContain('--identity-' + index + ': ' + hex)
    expect(semanticColors).not.toContain(hex)
    const [r, g, b] = hex
      .slice(1)
      .match(/../g)!
      .map((channel) => {
        const value = parseInt(channel, 16) / 255
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4
      })
    expect(
      1.05 / (0.05 + 0.2126 * r + 0.7152 * g + 0.0722 * b),
    ).toBeGreaterThanOrEqual(4.5)
  }
})

it('declares a recognizable symbol for each bundled extension', () => {
  const symbols = extensions.map(({ extension }) => extension.icon)
  expect(symbols.every(Boolean)).toBe(true)
  expect(new Set(symbols).size).toBe(symbols.length)
})
