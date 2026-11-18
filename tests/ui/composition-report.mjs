import { access, mkdir, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { screens } from './screens.mjs'
import { dailyScreens } from './daily-screens.mjs'
import { compositionScreens } from './composition-screens.mjs'

const root = resolve('docs/reports/ux-3')
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
async function picture(file, label) {
  await access(resolve(root, file))
  return `<figure><a href="${file}"><img loading="lazy" src="${file}" alt="${escape(label)}"></a><figcaption>${escape(label)}</figcaption></figure>`
}
const gallery = []
for (const file of (await readdir(resolve(root, 'gallery')))
  .filter((f) => f.endsWith('.png'))
  .sort()) {
  gallery.push(await picture('gallery/' + file, file.replace('.png', '')))
}
if (!gallery.length) throw new Error('Missing gallery screenshots')
const views = []
for (const scene of [...screens, ...dailyScreens, ...compositionScreens]) {
  const before = compositionScreens.includes(scene)
    ? 'before/'
    : '../ux-2/after/'
  const pairs = []
  for (const width of [1440, 1024, 375]) {
    const file = scene.id + '-' + width + '.png'
    pairs.push(
      `<h3>${width}px</h3><div class="pair">${await picture(before + file, '変更前')}${await picture('after/' + file, '変更後')}</div>`,
    )
  }
  views.push(
    `<details id="${scene.id}"><summary>${escape(scene.group)} ／ ${escape(scene.label)}</summary>${pairs.join('')}</details>`,
  )
}
await mkdir(root, { recursive: true })
await writeFile(
  resolve(root, 'index.html'),
  `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>部品の見本と全画面の比較 · Helpdesk</title><style>body{max-width:1440px;margin:auto;padding:1.5rem;font:1rem/1.6 system-ui;color:#171717}nav{display:flex;gap:1rem}details{border-top:1px solid #ccc;padding:.75rem 0}summary{cursor:pointer;font-weight:600}.pair,.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}figure{margin:0}img{max-width:100%;max-height:500px;border:1px solid #ddd}a{color:#154e96}@media(max-width:650px){.pair,.gallery{grid-template-columns:1fr}}</style></head><body><h1>部品の見本と全画面の比較</h1><nav><a href="#gallery">部品の見本</a><a href="#screens">画面の比較</a><a href="README.md">対応と検証</a></nav><h2 id="gallery">部品の見本</h2><div class="gallery">${gallery.join('')}</div><h2 id="screens">変更前と変更後</h2><p>変更前は e0725d0。画像を選ぶと等倍で開きます。</p>${views.join('')}</body></html>`,
)
