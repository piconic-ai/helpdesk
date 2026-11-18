"""文書リンク・機能の利用場面を確認する。"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
errors = []
features = sorted((DOCS / 'features').glob('*.md'))
required = ['利用場面', '得られる結果', '体験の流れ', '作る範囲', '作らないこと', '受け入れ条件', '未決事項']
for path in features:
    body = path.read_text()
    for heading in required:
        if f'## {heading}' not in body:
            errors.append(f'{path.relative_to(ROOT)}: 見出しがありません: {heading}')
    # Each acceptance criterion carries a permanent ID, such as F17-AC3, that
    # issues, pull requests and tests refer to.
    number = int(re.match(r'f(\d+)-', path.name).group(1))
    plain = re.sub(r'```.*?```', '', body, flags=re.S)
    criteria = re.search(r'^## 受け入れ条件\n(.*?)(?=^## |\Z)', plain, re.S | re.M)
    seen = set()
    for line in (criteria.group(1) if criteria else '').splitlines():
        if re.match(r'\s+([-*+] |\d+[.)] )', line):
            errors.append(f'{path.relative_to(ROOT)}: 受け入れ条件は字下げせず、1 行に 1 つ書いてください: {line[:40]}')
            continue
        if re.match(r'(\* |\+ |\d+[.)] )', line):
            errors.append(f'{path.relative_to(ROOT)}: 受け入れ条件は「- 」で始めてください: {line[:40]}')
            continue
        if not line.startswith('- '):
            continue
        tagged = re.match(r'- \*\*F(\d+)-AC(\d+)\*\* \S', line)
        if not tagged:
            errors.append(f'{path.relative_to(ROOT)}: 受け入れ条件に ID がありません: {line[:40]}')
        elif not re.match(r'- \*\*F\d{2}-AC[1-9]\d*\*\* ', line):
            errors.append(f'{path.relative_to(ROOT)}: ID は F17-AC3 の形で書いてください: {line[:40]}')
        elif int(tagged.group(1)) != number:
            errors.append(f'{path.relative_to(ROOT)}: ID の機能番号がファイルと違います: {line[:40]}')
        elif tagged.group(2) in seen:
            errors.append(f'{path.relative_to(ROOT)}: ID が重複しています: F{number:02d}-AC{tagged.group(2)}')
        else:
            seen.add(tagged.group(2))
    if not seen:
        errors.append(f'{path.relative_to(ROOT)}: 受け入れ条件がありません')
    if not re.search(r'[\u3040-\u30ff\u4e00-\u9fff]', body):
        errors.append(f'{path}: 日本語の説明がありません')

for path in [ROOT / 'README.md', ROOT / 'README.ja.md', *DOCS.rglob('*.md')]:
    body = path.read_text()
    if re.search(r'\[F\d+\]\(', body):
        errors.append(f'{path.relative_to(ROOT)}: 番号だけでなく機能名をリンクに使ってください')
    if body.count('```') % 2:
        errors.append(f'{path}: コードブロックが閉じていません')
    for block in re.findall(r'```json\n(.*?)\n```', body, re.S):
        json.loads(block)
    for target in re.findall(r'\]\(([^)]+)\)', body):
        if re.match(r'^[a-z]+:|^#', target):
            continue
        if not (path.parent / target.split('#')[0]).exists():
            errors.append(f'{path.relative_to(ROOT)}: リンク先がありません: {target}')

def check_self_hosting():
    guide = (DOCS / 'dev/self-hosting.md').read_text()
    source = (ROOT / 'wrangler.jsonc').read_text()
    config = json.loads(re.sub(r',\s*(?=[}\]])', '', source))
    env = (ROOT / 'src/core/settings/bindings.d.ts').read_text()
    d1, = config['d1_databases']
    bucket, = config['r2_buckets']
    producer, = config['queues']['producers']
    consumer, = config['queues']['consumers']
    sender, = config['send_email']
    documented = set(re.findall(r'^\| `(\w+)` \|', guide, re.M))
    required = {d1['binding'], bucket['binding'], producer['binding'], sender['name'],
                config['assets']['binding'], 'AI'}
    if documented != required:
        errors.append(f'self-hosting.md: Wrangler binding table differs: {documented ^ required}')
    production, = (json.loads(block) for block in re.findall(r'```json\n(.*?)\n```', guide, re.S))
    variables = set(production['vars']) | set(re.findall(r'--var (\w+):', guide))
    for variable in sorted(variables | documented):
        if not re.search(r'^\s+' + variable + r'\??:', env, re.M):
            errors.append(f'self-hosting.md: unknown Worker binding or variable: {variable}')
    commands = [
        f"wrangler d1 create {d1['database_name']} --no-update-config",
        f"wrangler r2 bucket create {bucket['bucket_name']} --no-update-config",
        f"wrangler queues create {producer['queue']}",
        f"wrangler queues create {consumer['dead_letter_queue']}",
        f"wrangler d1 migrations apply {d1['binding']} --local --persist-to .wrangler/self-host",
        f"wrangler d1 migrations apply {d1['binding']} --remote",
        'wrangler deploy',
    ]
    for command in commands:
        if f'\npnpm exec {command}\n' not in guide:
            errors.append(f'self-hosting.md: missing command for configured resource: {command}')
    local = re.findall(r'<!-- verify:(\w+) -->\n```sh', guide)
    if local != ['install', 'serve', 'configure', 'export']:
        errors.append('self-hosting.md: local commands expected in installation order')
    check_host_tools(guide)


def check_host_tools(guide):
    package = json.loads((ROOT / 'package.json').read_text())
    for name in re.findall(r'^pnpm ([\w:-]+)', guide, re.M):
        if name not in {'install', 'exec'} and name not in package['scripts']:
            errors.append(f'self-hosting.md: unknown package script: {name}')
    binaries = package['dependencies'] | package['devDependencies']
    for binary in re.findall(r'^pnpm exec ([\w-]+)', guide, re.M):
        if binary not in binaries:
            errors.append(f'self-hosting.md: unknown package executable: {binary}')
    for file in re.findall(r'(?:node|python3) ((?:cli|scripts)/[\w./-]+)', guide):
        if not (ROOT / file).is_file():
            errors.append(f'self-hosting.md: unknown script: {file}')


check_self_hosting()
if errors:
    raise SystemExit('\n'.join(errors))
print(f'機能 {len(features)} 件、Markdown リンク、JSON、セルフホスト手順と設定を確認しました。')
