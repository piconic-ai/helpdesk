import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve('docs/reports/ux')
const dir = resolve(root, 'steps')
const journeys = Array.from({ length: 11 }, (_, i) => 'J' + (i + 1))
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
const other = (await readdir(dir)).filter((id) => id.startsWith('C-')).sort()
const labels = {
  'C-extensions': '7つの拡張を有効にして案内をたどる',
  'C-machine': 'API トークンを発行して CLI・MCP を利用する',
  'C-mobile': '375px でキーボードだけで返信・完了する',
  'C-routing': 'メールの振り分け・通知・隔離を確認する',
  'C-panels': '定型返信・スヌーズ・統合を組み合わせる',
  'C-settings': '権限の変更と入力エラーを確認する',
}
const sections = []
const links = []
for (const id of [...journeys, ...other]) {
  const entries = await readdir(resolve(dir, id))
  const names = entries.filter((n) => /^\d.*\.json$/.test(n)).sort()
  if (!names.length) throw new Error('No screenshots for ' + id)
  let heading = labels[id] ?? id,
    actions = ''
  if (journeys.includes(id)) {
    const walk = JSON.parse(
      await readFile(resolve(dir, id, 'walk.json'), 'utf8'),
    )
    heading = walk.title
    actions =
      'クリック ' +
      walk.clicks +
      ' 回、入力・選択の確定 ' +
      walk.edits +
      ' 回、移動・決定キー ' +
      walk.keys +
      ' 回'
  }
  const pictures = []
  for (const name of names) {
    const { name: file, caption } = JSON.parse(
      await readFile(resolve(dir, id, name), 'utf8'),
    )
    if (!entries.includes(file)) throw new Error('Missing image ' + file)
    const img = 'steps/' + id + '/' + escape(file)
    pictures.push(
      '<figure><figcaption>' +
        escape(caption) +
        '</figcaption><a href="' +
        img +
        '"><img src="' +
        img +
        '" alt="' +
        escape(caption) +
        '" loading="lazy"></a></figure>',
    )
  }
  links.push('<a href="#' + id + '">' + id + '</a>')
  sections.push(
    '<section id="' +
      id +
      '"><h2>' +
      escape(heading) +
      '</h2><p>' +
      actions +
      '</p>' +
      pictures.join('\n') +
      '</section>',
  )
}
await writeFile(
  resolve(root, 'index.html'),
  `<!doctype html>
<html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Helpdesk 操作レビュー</title>
<style>html{font:16px/1.65 system-ui,sans-serif;color:#191919;background:white}body{max-width:1024px;margin:auto;padding:1.25rem}nav{display:flex;flex-wrap:wrap;gap:.8rem}section{border-top:1px solid #bbb;margin-top:2rem}figure{margin:1.5rem 0}figcaption{font-weight:600}img{width:auto;max-width:100%;max-height:42rem;border:1px solid #ddd}a{color:#154e96}</style>
<header><h1>Helpdesk 操作レビュー</h1><p>場面ごとの画面を、実際に操作した順に並べました。画像を選ぶと原寸で開けます。</p><nav>${links.join(' ')}</nav></header><main>${sections.join('\n')}</main></html>
`,
)
