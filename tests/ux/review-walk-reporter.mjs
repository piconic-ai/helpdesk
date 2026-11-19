import { mkdirSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

// Map the documented end-to-end journeys to the operator and customer workflows.
const chapters = {
  W1: ['H01', 'H02', 'H03', 'H04', 'H05', 'J1', 'J2', 'J3', 'J4', 'J5', 'W1'],
  W2: ['H07', 'J7', 'W2'],
  W3: ['H06', 'H11', 'H12', 'J6', 'J12', 'W3'],
  W4: ['H08', 'H09', 'H12', 'J8', 'J10', 'A3', 'A4', 'W4'],
  W5: ['H10', 'J9', 'J11', 'J14', 'W5'],
}
const edit =
  /^(Click|Double click|Set input files|Upload files|Check|Uncheck|Select option|Fill|Press|Insert text|Type|Navigate|Go back|Reload|Tap)/i
const clean = (value) =>
  String(value)
    .replace(/((?:https?:\/\/)?(?:127\.0\.0\.1|localhost)):\d+/g, '$1')
    .replace(/\s+/g, ' ')
    .replaceAll('|', '\\|')
    .slice(0, 240)

function collectActions(steps) {
  const actions = []
  for (const step of steps.flatMap(flatten)) {
    const label = clean(
      step.title + ' ' + (step.subtitle || step.params?.selector || ''),
    )
    if (step.category === 'pw:api' && edit.test(step.title))
      actions.push({
        label,
        duration: step.duration,
        location:
          step.location &&
          relative(process.cwd(), step.location.file) +
            ':' +
            step.location.line,
      })
    if (
      step.duration >= 1000 &&
      (step.category === 'expect' ||
        (step.category === 'pw:api' && /^Wait/i.test(step.title)))
    )
      actions.push({ wait: true, label, duration: step.duration })
  }
  return actions
}

export default class WorkflowReporter {
  runs = []
  onTestEnd(test, result) {
    const testSteps = result.steps.filter(
      (s) => !['fixture', 'hook'].includes(s.category),
    )
    const named = test.title.startsWith('ハンズオンの例示データ')
      ? testSteps
          .filter((s) => s.category === 'test.step')
          .map((s) => ({ title: s.title, steps: s.steps }))
      : [{ title: test.title, steps: testSteps }]
    for (const { title, steps } of named) {
      const ids = [...title.matchAll(/(?:^| \/ )([HWJA]\d+)\b/g)].map(
        (m) => m[1],
      )
      const flows = Object.entries(chapters)
        .filter(([, all]) => ids.some((id) => all.includes(id)))
        .map(([name]) => name)
      if (!flows.length) continue
      const actions = collectActions(steps)
      this.runs.push({
        id: ids.join('/'),
        flows,
        title,
        status: result.status,
        actions,
      })
    }
  }
  onEnd() {
    const dir = resolve(process.env.HELPDESK_WALK_OUTPUT)
    mkdirSync(dir, { recursive: true })
    const lines = [
      '# ブラウザー操作の記録',
      '',
      '見本データを入れ直したブラウザーで実行した。表にはクリック、入力、選択、キー操作、画面遷移を1操作ずつ記録した。複数章をひと続きに通す H06/H07 は共同記録で、操作数の内訳は算出しない。秒数はテスト環境でブラウザー操作が完了するまでの実測値。1秒以上かかった表示待ちは別の行に記録する。',
      '',
    ]
    for (const flow of Object.keys(chapters)) {
      lines.push('## ' + flow, '')
      for (const run of this.runs
        .filter((r) => r.flows.includes(flow))
        .sort((a, b) =>
          a.id.localeCompare(b.id, undefined, { numeric: true }),
        )) {
        lines.push(
          '### ' + run.title,
          '',
          `${run.actions.filter((a) => !a.wait).length}操作。実行結果 ${run.status}。`,
          '',
          '| 順 | 操作・表示待ち | 秒 |',
          '| ---: | --- | ---: |',
        )
        let index = 0
        for (const a of run.actions)
          lines.push(
            `| ${a.wait ? '待ち' : ++index} | ${a.label} | ${(a.duration / 1000).toFixed(2)} |`,
          )
        lines.push('')
      }
    }
    writeFileSync(resolve(dir, 'walk.md'), lines.join('\n'))
    writeFileSync(
      resolve(dir, 'walk.json'),
      JSON.stringify(this.runs, null, 2) + '\n',
    )
  }
}
function flatten(step) {
  return ['fixture', 'hook'].includes(step.category)
    ? []
    : step.category === 'expect'
      ? [step]
      : [step, ...step.steps.flatMap(flatten)]
}
