import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { expect, test } from 'vitest'

function presentation(source, path) {
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true)
  const findings = []
  function flag(node) {
    const line = tree.getLineAndCharacterOfPosition(node.getStart()).line + 1
    findings.push(path + ':' + line)
  }
  function checkElement(node) {
    const name = node.tagName.getText()
    const hiddenInput =
      name === 'input' &&
      node.attributes.properties.some(
        (attr) =>
          ts.isJsxAttribute(attr) &&
          attr.name.getText() === 'type' &&
          attr.initializer &&
          ts.isStringLiteral(attr.initializer) &&
          attr.initializer.text === 'hidden',
      )
    if (
      ['style', 'input', 'select', 'textarea', 'button', 'dialog'].includes(
        name,
      ) &&
      !hiddenInput
    )
      flag(node)
    if (/^[a-z]/.test(name)) {
      for (const attr of node.attributes.properties) {
        if (
          ts.isJsxAttribute(attr) &&
          /^(class|className|style)$/.test(attr.name.getText())
        )
          flag(attr)
      }
    }
  }
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      checkElement(node)
    const markup = ts.isTemplateExpression(node)
      ? node.head.text +
        node.templateSpans.map((span) => 'VALUE' + span.literal.text).join('')
      : ts.isStringLiteralLike(node)
        ? node.text
        : ''
    if (
      /<(?:style|select|textarea|button|dialog)\b|<[a-z][^<>]*?\s(?:class|style)\s*=/is.test(
        markup,
      )
    )
      flag(node)
    for (const [input] of markup.matchAll(/<input\b[^>]*>/gi)) {
      if (!/\btype\s*=\s*["']hidden["']/i.test(input)) flag(node)
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
  return findings
}

function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (path === 'src/ui') return []
    if (entry.isDirectory()) return sources(path)
    return /\.tsx?$/.test(path) && !/\.(?:test|examples)\.tsx?$/.test(path)
      ? [path]
      : []
  })
}

test('page composition rejects intrinsic styling in JSX and embedded HTML', () => {
  for (const source of [
    '<a className="button">Open</a>',
    '<div style={{color:"red"}}/>',
    'html`<section\n class="panel"></section>`',
    '\'<div style="padding:1px"></div>\'',
    '<style>{css}</style>',
    '<button>Open</button>',
    '<select />',
    'html`<a href=${url} class="link">Open</a>`',
    'html`<button name="save">Save</button>`',
  ])
    expect(presentation(source, 'example.tsx')).not.toEqual([])
  expect(
    presentation(
      '<ListPage title="記事"><p>説明</p></ListPage>',
      'example.tsx',
    ),
  ).toEqual([])
})

test('screens use presentation components for styling', () => {
  const findings = [...sources('src'), 'worker.ts'].flatMap((path) =>
    presentation(readFileSync(path, 'utf8'), path),
  )
  expect(findings).toEqual([])
})

test('layout owns exterior spacing for every screen and component', async () => {
  const { default: postcss } = await import('postcss')
  const files = [
    'public/styles.css',
    ...readdirSync('public/ui')
      .filter((n) => n.endsWith('.css') && n !== 'layout.css')
      .map((n) => join('public/ui', n)),
  ]
  for (const file of files) {
    const root = postcss.parse(readFileSync(file, 'utf8'))
    const declarations = []
    root.walkDecls(/^margin(?:-|$)/, (decl) =>
      declarations.push(decl.toString()),
    )
    expect(declarations, file).toEqual([])
  }
})
