import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { screens } from './screens.mjs'

const interim = process.argv.includes('--interim')
const dir = resolve('docs/reports/ui', interim ? 'interim' : '')
const cases = interim
  ? screens.filter((s) => ['inbox', 'thread-inbound'].includes(s.id))
  : screens
const before = interim ? '../before' : 'before'
const after = interim ? '.' : 'after'
const groups = [...new Set(cases.map((s) => s.group))]
const path = (dir, s, w) => dir + '/' + s.id + '-' + w + '.png'
const images = (s, width) =>
  `<figure><figcaption>${width}px</figcaption><div class="pair">${[
    [before, '変更前'],
    [after, interim ? '途中' : '変更後'],
  ]
    .map(
      ([dir, label]) =>
        `<a href="${path(dir, s, width)}"><span>${label}</span><img loading="lazy" width="${width}" height="${width === 375 ? 812 : 900}" src="${path(dir, s, width)}" alt="${s.label}・${label}・幅${width}px"></a>`,
    )
    .join('')}</div></figure>`
await mkdir(dir, { recursive: true })
await writeFile(
  resolve(dir, 'index.html'),
  `<!doctype html>
<html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${interim ? '途中の比較' : '画面レビュー'} · helpdesk</title>
<style>
*{box-sizing:border-box}body{font:16px/1.6 system-ui,sans-serif;color:#111;background:#fff;margin:auto;padding:24px;max-width:1600px}
h1,h2,h3{font-weight:600}header{padding-bottom:20px;border-bottom:1px solid #ddd}nav{display:flex;gap:16px;flex-wrap:wrap}a{color:#174ea6}section{margin-top:48px}article{margin:24px 0 44px}h3,p{margin:8px 0}figure{margin:16px 0}figcaption,span{font-size:14px;color:#374151}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.pair a{display:block;text-decoration:none}.pair span{display:block}.pair img{display:block;max-height:680px;width:100%;height:auto;object-fit:contain;object-position:left top;background:#f8f9fa;border:1px solid #ddd}figure:has(img[width="375"]){max-width:780px}@media(max-width:640px){body{padding:12px}.pair{gap:4px}}
</style>
<header><h1>${interim ? '受信箱と会話の途中比較' : 'Helpdesk 画面レビュー'}</h1><p>画像を選ぶと元の大きさで開きます。${interim ? '一覧とスレッドを実装した時点の記録です。' : '変更前は 0787488 の画面です。'}</p>
<nav>${groups.map((g, i) => `<a href="#g${i}">${g}</a>`).join('')}${interim ? '' : '<a href="interim/index.html">途中の比較</a>'}</nav></header>
<main>${groups
    .map(
      (g, i) =>
        `<section id="g${i}"><h2>${g}</h2>${cases
          .filter((s) => s.group === g)
          .map(
            (s) =>
              `<article id="${s.id}"><h3>${s.label}</h3><p>${s.change}</p>${[1440, ...(!interim && s.tablet ? [1024] : []), ...(!interim && s.mobile ? [375] : [])].map((w) => images(s, w)).join('')}</article>`,
          )
          .join('')}</section>`,
    )
    .join('')}</main></html>\n`,
)
