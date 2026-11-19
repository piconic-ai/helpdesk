import { suggestionScenes } from './suggestion-scenes.mjs'
import { widgetScenes, widgetSettingsScenes } from './widget-scenes.mjs'
import { trendScenes } from './trend-scenes.mjs'
import { identityScenes } from './identity-scenes.mjs'
import { readdir, writeFile, access } from 'node:fs/promises'
import { basename, relative, resolve } from 'node:path'
import { screens } from './screens.mjs'
import { dailyScreens } from './daily-screens.mjs'
import { compositionScreens } from './composition-screens.mjs'
import { reviewScreens } from './review-screens.mjs'
import { nextIssuesScenes } from './next-issues-scenes.mjs'

const [output, first, last] = process.argv.slice(2)
if (!last)
  throw Error('Usage: node tests/ui/compare-captures.mjs OUTPUT BEFORE AFTER')
const titles = new Map(
  [
    ...screens,
    ...dailyScreens,
    ...compositionScreens,
    ...reviewScreens,
    ...nextIssuesScenes,
    ...identityScenes,
    ...trendScenes,
    ...widgetScenes,
    ...suggestionScenes,
    ...widgetSettingsScenes,
  ]
    .map((s) => [s.id, s.group + ' · ' + s.label])
    .concat([
      ['gallery', '部品見本 · 全体'],
      ['candidates', '部品見本 · 担当者の候補'],
      ['confirmation', '部品見本 · 操作の確認'],
      ['states', '部品見本 · 状態の表示'],
    ]),
)
const files = (await readdir(last)).filter((name) => name.endsWith('.png'))
const safe = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
const names = [
  ...new Set(files.map((name) => name.replace(/-(375|1024|1440)\.png$/, ''))),
].sort()
const sections = []
for (const name of names) {
  const pairs = []
  for (const width of [375, 1024, 1440]) {
    const figures = []
    for (const [dir, label] of [
      [first, '変更前'],
      [last, '変更後'],
    ]) {
      const file = resolve(dir, name + '-' + width + '.png')
      await access(file)
      const href = safe(relative(output, file))
      const caption = safe((titles.get(name) || name) + ' · ' + label)
      figures.push(
        '<figure><figcaption>' +
          label +
          '</figcaption><a href="' +
          href +
          '"><img loading="lazy" src="' +
          href +
          '" alt="' +
          caption +
          '"></a></figure>',
      )
    }
    pairs.push(
      '<details><summary>' +
        width +
        'px</summary><div>' +
        figures.join('') +
        '</div></details>',
    )
  }
  sections.push(
    '<section id="' +
      safe(name) +
      '"><h2>' +
      safe(titles.get(name) || name) +
      '</h2>' +
      pairs.join('') +
      '</section>',
  )
}
await writeFile(
  resolve(output, 'index.html'),
  `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>画面の比較 · ${safe(basename(output))}</title><style>body{font:16px/1.65 system-ui,sans-serif;max-width:1200px;margin:auto;padding:24px;color:#202329}section{border-top:1px solid #ddd;padding:16px 0}h1,h2{line-height:1.4}h2{font-size:1.15em}summary{padding:8px;cursor:pointer}details div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}figure{margin:0}img{width:100%;height:auto;border:1px solid #ddd}figcaption{font-size:.85em}</style><h1>変更前後の画面</h1><p>${names.length}画面・状態を375・1024・1440pxで比較できます。画像を押すと原寸表示になります。</p>${sections.join('\n')}</html>`,
)
