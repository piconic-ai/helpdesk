"""Run the local commands from the self-hosting guide in a fresh checkout-shaped directory."""
import json
import os
from pathlib import Path
import re
import shutil
import signal
import socket
import subprocess
from tempfile import TemporaryDirectory
import time
from urllib.error import URLError
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / 'docs/dev/self-hosting.md'
SOURCES = ['cli', 'components', 'migrations', 'src', 'tests/fixtures', 'public',
           'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.json',
           'vite.config.ts', 'uno.config.ts', 'helpdesk.config.ts', 'worker.ts', 'wrangler.jsonc']


def copy_sources(dest):
    for name in SOURCES:
        src = ROOT / name
        if src.is_dir():
            ignore = shutil.ignore_patterns('components', 'uno.css') if name == 'public' else None
            shutil.copytree(src, dest / name, ignore=ignore)
        else:
            shutil.copy2(src, dest / name)


def wait_for_server(process, origin):
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline and process.poll() is None:
        try:
            with urlopen(origin + '/styles.css', timeout=2) as response:
                if response.status == 200:
                    return
        except (URLError, TimeoutError):
            time.sleep(0.2)
    raise RuntimeError('Local Wrangler did not start')


def verify_export(dest):
    data = (dest / 'helpdesk-export.jsonl').read_text()
    rows = [json.loads(line) for line in data.splitlines()]
    conversations = [row['data'] for row in rows if row['type'] == 'conversations']
    assert len(conversations) == 1 and conversations[0]['subject'] == 'Receipt download'
    assert conversations[0]['contact'] == '[address]'
    assert any(row['type'] == 'messages' and row['data']['kind'] == 'inbound' for row in rows)
    assert any(row['type'] == 'events' and row['data']['kind'] == 'mailbox_registered' for row in rows)


def run(dest):
    copy_sources(dest)
    blocks = dict(re.findall(r'<!-- verify:(\w+) -->\n```sh\n(.*?)\n```', GUIDE.read_text(), re.S))
    with socket.socket() as listener:
        listener.bind(('127.0.0.1', 0))
        port = listener.getsockname()[1]
    env = {key: value for key, value in os.environ.items()
           if not key.startswith(('CLOUDFLARE_', 'HELPDESK_', 'CF_API_'))}
    env.update(CI='true', HELPDESK_PORT=str(port), WRANGLER_SEND_METRICS='false',
               WRANGLER_LOG_PATH=str(dest / 'wrangler.log'))
    shell = ['bash', '-euo', 'pipefail', '-c']
    subprocess.run([*shell, blocks['install']], cwd=dest, env=env, check=True, timeout=300)
    with (dest / 'server.log').open('w+') as log:
        process = subprocess.Popen([*shell, blocks['serve']], cwd=dest, env=env,
                                   stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        try:
            wait_for_server(process, f'http://127.0.0.1:{port}')
            # An operator waits for the sample to appear in the inbox before exporting.
            wait = """
for i in {1..40}; do
  if node cli/helpdesk.mjs --json list '{}' | python3 -c 'import json,sys; sys.exit(not json.load(sys.stdin)["result"])'; then break; fi
  sleep 0.5
done
"""
            command = '\n'.join([blocks['configure'], wait, blocks['export']])
            result = subprocess.run([*shell, command], cwd=dest, env=env, check=True,
                                    timeout=90, stdout=subprocess.PIPE, text=True)
            report, inbox = [json.loads(line)['result'] for line in result.stdout.splitlines()]
            assert report['ready'] and report['domains'] == ['example.com']
            assert len(inbox) == 1 and inbox[0]['product'] == 'shop'
            verify_export(dest)
        except Exception:
            log.seek(0)
            print(log.read(), flush=True)
            raise
        finally:
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGTERM)
                process.wait(timeout=10)


if __name__ == '__main__':
    with TemporaryDirectory(prefix='helpdesk-self-host-') as temp:
        run(Path(temp))
    print('Verified first mailbox, doctor, inbound mail and masked JSONL export.')
