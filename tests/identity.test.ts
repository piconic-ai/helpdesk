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

// Machado, Oliveira & Fernandes (2009), full severity in linear sRGB.
// https://doi.org/10.1109/TVCG.2009.113
const simulations = [
  [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
]
function lab(hex: string, matrix: number[][]) {
  const linear = hex
    .slice(1)
    .match(/../g)!
    .map((channel) => {
      const v = parseInt(channel, 16) / 255
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
  const [r, g, b] = matrix.map((row) =>
    Math.max(
      0,
      Math.min(
        1,
        row.reduce((sum, k, index) => sum + k * linear[index], 0),
      ),
    ),
  )
  const [x, y, z] = [
    (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047,
    r * 0.2126729 + g * 0.7151522 + b * 0.072175,
    (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883,
  ].map((v) => (v > 216 / 24389 ? Math.cbrt(v) : ((24389 / 27) * v + 16) / 116))
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}
const deltaE = (a: number[], b: number[]) =>
  Math.hypot(...a.map((v, k) => v - b[k]))
it('keeps identity dots separated in Lab and by lightness in simulated vision', () => {
  const css = readFileSync('public/ui/tokens.css', 'utf8')
  const status = [
    ...css.matchAll(/--colors-(?:success|warning|error|note): (#[\da-f]+);/g),
  ].map((match) => lab(match[1], simulations[0]))
  expect(status).toHaveLength(4)
  for (const [index, a] of identityPalette.entries()) {
    const normal = lab(a, simulations[0])
    for (const semantic of status)
      expect(deltaE(normal, semantic)).toBeGreaterThan(15)
    for (const b of identityPalette.slice(index + 1)) {
      expect(deltaE(normal, lab(b, simulations[0]))).toBeGreaterThan(15)
      for (const simulation of simulations) {
        const first = lab(a, simulation)
        const second = lab(b, simulation)
        expect(Math.abs(first[0] - second[0])).toBeGreaterThan(4)
        expect(deltaE(first, second)).toBeGreaterThan(11)
      }
    }
  }
})
