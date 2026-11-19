import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'

const [source, output] = process.argv.slice(2)
if (!source || !output)
  throw Error(
    'Usage: node tests/ui/review-contact-sheet.mjs SCREENSHOTS OUTPUT.png',
  )
const dir = mkdtempSync(join(tmpdir(), 'helpdesk-contact-'))
function magick(args) {
  const result = spawnSync('magick', args, { encoding: 'utf8' })
  if (result.status !== 0) throw Error(result.stderr || result.error)
}
const names = readdirSync(source)
  .filter((f) => f.endsWith('-1440.png'))
  .map((f) => f.slice(0, -9))
  .sort()
const cards = []
try {
  for (const [i, name] of names.entries()) {
    const card = join(dir, String(i) + '.png')
    const frames = []
    for (const width of [375, 1024, 1440])
      frames.push(
        '(',
        resolve(source, `${name}-${width}.png`),
        '-thumbnail',
        '153x112',
        '-gravity',
        'north',
        '-background',
        'white',
        '-extent',
        '153x112',
        ')',
      )
    magick([
      ...frames,
      '+append',
      '-background',
      'white',
      '-gravity',
      'south',
      '-splice',
      '0x18',
      '-font',
      'Helvetica',
      '-pointsize',
      '12',
      '-fill',
      '#222222',
      '-annotate',
      '+0+1',
      name,
      card,
    ])
    cards.push(card)
  }
  magick([
    'montage',
    ...cards,
    '-tile',
    '4x',
    '-geometry',
    '+6+6',
    '-background',
    '#e4e7e9',
    output,
  ])
} finally {
  rmSync(dir, { recursive: true, force: true })
}
