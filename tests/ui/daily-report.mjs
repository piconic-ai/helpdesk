import { readFile, readdir, writeFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { screens } from './screens.mjs'
import { dailyScreens } from './daily-screens.mjs'

const root = resolve('docs/reports/ux-2')
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
async function picture(path, caption) {
  await access(resolve(root, path))
  return (
    '<figure><figcaption>' +
    escape(caption) +
    '</figcaption><a href="' +
    path +
    '"><img loading="lazy" src="' +
    path +
    '" alt="' +
    escape(caption) +
    '"></a></figure>'
  )
}
const views = []
for (const scene of [...screens, ...dailyScreens]) {
  const pairs = []
  for (const width of [1440, 1024, 375]) {
    const image = scene.id + '-' + width + '.png'
    pairs.push(
      '<h4>' +
        width +
        'px</h4><div class="pair">' +
        (await picture('before/' + image, '変更前 · ' + scene.label)) +
        (await picture('after/' + image, '変更後 · ' + scene.label)) +
        '</div>',
    )
  }
  views.push(
    '<details id="view-' +
      scene.id +
      '"><summary>' +
      escape(scene.group + ' / ' + scene.label) +
      '</summary>' +
      pairs.join('') +
      '</details>',
  )
}
const walks = []
const ids = await readdir(resolve(root, 'steps'))
const journeyIds = Array.from({ length: 15 }, (_, n) => 'J' + (n + 1))
const extras = ids.filter((id) => id.startsWith('C-')).sort()
for (const id of [...journeyIds, ...extras]) {
  const directory = resolve(root, 'steps', id)
  const files = (await readdir(directory))
    .filter((f) => /^\d.*\.json$/.test(f))
    .sort()
  if (!files.length) throw new Error('Missing recorded steps: ' + id)
  const images = []
  for (const file of files) {
    const step = JSON.parse(await readFile(resolve(directory, file), 'utf8'))
    images.push(await picture('steps/' + id + '/' + step.name, step.caption))
  }
  const walk = journeyIds.includes(id)
    ? JSON.parse(await readFile(resolve(directory, 'walk.json'), 'utf8'))
    : null
  const heading =
    walk?.title ??
    JSON.parse(await readFile(resolve(directory, files[0]), 'utf8')).caption
  const counts = walk
    ? '<p>クリック ' +
      walk.clicks +
      ' 回、入力・選択 ' +
      walk.edits +
      ' 回、移動・決定キー ' +
      walk.keys +
      ' 回</p>'
    : ''
  walks.push(
    '<details id="' +
      escape(id) +
      '"><summary>' +
      escape(heading) +
      '</summary>' +
      counts +
      images.join('') +
      '</details>',
  )
}
await writeFile(
  resolve(root, 'index.html'),
  `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>運営画面の操作と画面比較 · Helpdesk</title>
<style>html{font:16px/1.6 system-ui;color:#171717}body{max-width:1440px;margin:auto;padding:1.5rem}details{border-top:1px solid #bbb;padding:.6rem 0}summary{cursor:pointer;font-weight:600}h4{margin:1.2rem 0 .3rem}figure{margin:.5rem 0 1.25rem}figcaption{font-size:.85rem}img{max-width:100%;max-height:700px;border:1px solid #ddd;vertical-align:top}.pair{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}.pair img{max-height:420px}a{color:#154e96}@media(max-width:600px){.pair{grid-template-columns:1fr}}</style>
<h1>運営画面の操作と画面比較</h1><nav><a href="#journeys">通しの操作</a> · <a href="#screens">変更前後の比較</a> · <a href="interactions.md">操作の対応表</a> · <a href="README.md">検証結果</a></nav>
<h2 id="journeys">通しの操作</h2>${walks.join('')}<h2 id="screens">画面ごとの変更前と変更後</h2><p>変更前はコミット 65112f2。アカウントの同じ URL は当時の404画面です。各画像を選ぶと原寸で表示します。</p>${views.join('')}</html>`,
)
