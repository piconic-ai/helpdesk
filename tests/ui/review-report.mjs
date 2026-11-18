import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { screens } from './screens.mjs'
import { dailyScreens } from './daily-screens.mjs'
import { compositionScreens } from './composition-screens.mjs'
import { reviewScreens } from './review-screens.mjs'

const root = resolve('docs/reports/review-4')
const escaped = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
const picture = (path, caption) =>
  `<figure><a href="${escaped(path)}"><img loading="lazy" src="${escaped(path)}" alt="${escaped(caption)}"></a><figcaption>${escaped(caption)}</figcaption></figure>`
const sceneList = [
  ...screens,
  ...dailyScreens,
  ...compositionScreens,
  ...reviewScreens,
]
const pairs = sceneList.map((scene) => {
  const prior = reviewScreens.includes(scene) ? 'before' : '../ux-3/after'
  const widths = [375, 1024, 1440].map((w) => {
    const file = scene.id + '-' + w + '.png'
    return `<details><summary>${w}px</summary><div class="pair">${picture(prior + '/' + file, scene.label + '・変更前')}${picture('after/' + file, scene.label + '・変更後')}</div></details>`
  })
  return `<section id="screen-${scene.id}"><h3>${escaped(scene.group)} · ${escaped(scene.label)}</h3>${widths.join('')}</section>`
})
const walks = []
const walkDirs = (await readdir(resolve(root, 'walk'), { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name, 'ja', { numeric: true }))
for (const folder of walkDirs) {
  const directory = resolve(root, 'walk', folder.name)
  const items = []
  for (const file of (await readdir(directory))
    .filter((f) => f.endsWith('.json') && f !== 'walk.json')
    .sort()) {
    const step = JSON.parse(await readFile(resolve(directory, file), 'utf8'))
    items.push(picture('walk/' + folder.name + '/' + step.name, step.caption))
  }
  if (items.length)
    walks.push(
      `<details id="walk-${escaped(folder.name)}"><summary>${escaped(folder.name)}（${items.length}場面）</summary><div class="pair">${items.join('')}</div></details>`,
    )
}
const gallery = []
for (const [id, label] of Object.entries({
  gallery: '部品見本',
  candidates: '候補を選ぶ',
  confirmation: '確認ダイアログ',
  states: 'フォーカスとツールチップ',
})) {
  for (const width of [375, 1024, 1440])
    gallery.push(
      picture(
        'gallery/' + id + '-' + width + '.png',
        label + ' ' + width + 'px',
      ),
    )
}
await writeFile(
  resolve(root, 'index.html'),
  `<!doctype html>
<html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>指針レビューの変更前後</title>
<style>body{color:#171717;background:white;font:16px/1.6 system-ui,sans-serif;margin:1.5rem auto;padding:0 1rem;max-width:90rem}h1{font-size:1.6rem}h2{margin-top:2rem}h3{font-size:1rem;margin:0 0 .5rem}a{color:#164b88}section,details{padding:.4rem 0}section{border-top:1px solid #ddd}summary{cursor:pointer}figure{margin:.5rem 0;min-width:0}img{max-width:100%;max-height:480px;border:1px solid #ddd}figcaption{font-size:.85rem}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}nav{display:flex;flex-wrap:wrap;gap:1rem}@media(max-width:650px){.pair{grid-template-columns:1fr}}</style>
<h1>指針レビューの変更前後</h1><nav><a href="README.md">対応一覧</a><a href="#walk">ブラウザの操作記録</a><a href="#screens">全画面の比較</a><a href="#gallery">部品の見本</a></nav>
<h2 id="walk">ブラウザの操作記録</h2><p>ローカルの問い合わせと模擬配送を使用しました。各場面を選ぶと原寸で開けます。</p>${walks.join('')}
<h2 id="screens">全画面の比較</h2><p>${sceneList.length}画面・状態。それぞれ375・1024・1440pxで確認できます。変更前の基準は b293ae9 です。</p>${pairs.join('')}
<h2 id="gallery">開発用の部品見本</h2><div class="pair">${gallery.join('')}</div></html>\n`,
)
