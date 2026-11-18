# 自分の Cloudflare アカウントで運営する

まずローカルで窓口を開設し、メールを 1 件受け取って書き出します。本番で必要になるのは、自分が管理する Cloudflare アカウント、Cloudflare が権威 DNS を提供するドメイン、Workers Paid、運営者の認証に使う Cloudflare Access です。

## 空のローカル環境で試す

Node.js 24、pnpm 12.16.1、Python 3、bash、curl を用意し、このリポジトリのルートに移動してください。以下は新しいチェックアウトと空の D1 を前提とします。Cloudflare へのログインは不要です。

**端末 1** で依存関係を導入します。Vite のビルドで画面を生成し、マイグレーションでテーブルを作ります。

<!-- verify:install -->
```sh
pnpm install --frozen-lockfile
pnpm build
pnpm exec wrangler d1 migrations apply DB --local --persist-to .wrangler/self-host
```

同じ端末でローカル Worker を起動します。固定の運営者を使うため、接続先をループバックに限定します。

<!-- verify:serve -->
```sh
pnpm exec wrangler dev --local --ip 127.0.0.1 --port "${HELPDESK_PORT:-8787}" --persist-to .wrangler/self-host --var ENVIRONMENT:local --var LOCAL_OPERATOR:operator@example.com --var SENDING_DOMAINS:example.com
```

**端末 2** を同じディレクトリで開きます。画面で操作する場合は `http://127.0.0.1:8787/settings` を開き、**Register mailbox** で製品と窓口を登録します。以下は同じフォームを curl で操作する例です。新しい環境で最初にアクセスした `operator@example.com` が管理者になります。API トークンは発行時だけ表示されるので、この端末の環境変数に受け取ります。

<!-- verify:configure -->
```sh
export HELPDESK_URL="http://127.0.0.1:${HELPDESK_PORT:-8787}"
curl -fsS -o /dev/null "$HELPDESK_URL/settings"
curl -fsS -o /dev/null -H "Origin: $HELPDESK_URL" \
  -d 'product=shop&name=Shop&address=support@example.com' "$HELPDESK_URL/actions/mailbox"
HELPDESK_TOKEN=$(curl -fsS -H "Origin: $HELPDESK_URL" -d 'label=self-host&access=read' "$HELPDESK_URL/tokens" \
  | python3 -c 'import re,sys; print(re.search(r"<code>(hd_[0-9a-f]{64})</code>", sys.stdin.read())[1])')
export HELPDESK_TOKEN
node cli/helpdesk.mjs --json doctor
curl -fsS -o /dev/null -H "Origin: $HELPDESK_URL" -d 'enabled=yes' "$HELPDESK_URL/extensions/export"
curl -fsS -o /dev/null --data-binary @tests/fixtures/mail-flow.eml \
  "$HELPDESK_URL/cdn-cgi/local/email?from=person@example.net&to=support@example.com"
```

診断結果の `ready` が `true` になり、キューが受信メールを取り込むと、Inbox に **Receipt download** が表示されます。画面で会話を開き、本文と添付を確認できます。CLI で会話、メッセージ、操作履歴を JSON Lines に書き出すには、取り込み後、端末 2 で次を実行してください。メールアドレスと連絡先名は既定で伏せられます。本文には問い合わせに含まれる情報が残るので、保存先へのアクセスを制限してください。

<!-- verify:export -->
```sh
node cli/helpdesk.mjs --json list '{}'
umask 077
node cli/helpdesk.mjs --json export.jsonl '{}' \
  | python3 -c 'import json,sys; sys.stdout.write(json.load(sys.stdin)["result"])' > helpdesk-export.jsonl
```

端末 1 で Ctrl-C を押すと Worker が終了します。ローカルの状態は `.wrangler/self-host` に残ります。同じ手順を自動で試す場合は、次のコマンドだけで、一時ディレクトリに環境を作成し、上の各コマンドを実行して JSONL の内容を検査できます。

```sh
python3 scripts/test-self-host.py
```

## 費用とドメインを決める

2026 年 11 月 18 日に確認した料金では、任意のお問い合わせ元に返信するには Workers Paid（月額最低 5 米ドル）が必要です。送信はアカウント全体で月 3,000 通まで含まれ、超過は 1,000 通あたり 0.35 米ドルです。Free でもアカウントで検証済みの宛先への送信はできます。受信ルーティングの通数は無制限で、メールを処理する Worker には Workers の料金が適用されます。[Email Service の料金](https://developers.cloudflare.com/email-service/platform/pricing/)・[Workers の料金](https://developers.cloudflare.com/workers/platform/pricing/)

会話と履歴には D1 の読み書き・保存容量、元メールと添付には R2 の容量・操作数、受信と送信のジョブには Queues の操作数がかかります。各プランの含有枠とアカウント全体の使用量を確認してください。R2 はアカウントで有効にします。[D1 の料金](https://developers.cloudflare.com/d1/platform/pricing/)・[R2 の料金](https://developers.cloudflare.com/r2/pricing/)・[Queues の料金](https://developers.cloudflare.com/queues/platform/pricing/)

既存のメールサーバーを使っている場合は、窓口専用のサブドメイン（例 `support@mail.example.com`）を選ぶと、既存のメール配送を維持できます。以下では運営画面を `desk.example.com`、送受信するドメインを `mail.example.com` とします。例を自分のドメインに置き換えてください。

## 本番用のリソースと Access を準備する

自分の fork をチェックアウトし、`origin` が自分のデプロイ用リポジトリを指すことを確認します。以下は導入先で実施する手順です。新規アカウントで、Wrangler が表示するアカウントを確かめてから実行してください。既存リソースを再利用する場合は、その名前と ID を設定します。

```sh
pnpm install --frozen-lockfile
pnpm exec wrangler login
pnpm exec wrangler whoami
pnpm exec wrangler d1 create helpdesk --no-update-config
pnpm exec wrangler r2 bucket create helpdesk-mail --no-update-config
pnpm exec wrangler queues create helpdesk-jobs
pnpm exec wrangler queues create helpdesk-dead-letters
```

`wrangler.jsonc` の既存の binding を次の対応に合わせます。D1 の `database_id` は作成時に表示された UUID に差し替えてください。

| binding | 接続先と役割 |
| --- | --- |
| `DB` | D1 `helpdesk`。マイグレーションは `migrations` |
| `RAW` | R2 `helpdesk-mail`。元メール・添付 |
| `JOBS` | Queues `helpdesk-jobs`。consumer の失敗が続いたジョブは `helpdesk-dead-letters` |
| `EMAIL` | `send_email` の送信 binding |
| `ASSETS` | `./public` の画面と静的ファイル。認証を通すため `run_worker_first` を有効にする |
| `AI` | チャット拡張を有効にする場合に Workers AI を接続 |

Zero Trust の Access で運営画面のホスト全体を対象に Self-hosted application を作り、初回セットアップ担当者だけを許可する Allow ポリシーを設定します。アプリの Application Audience (AUD) とチームのドメインを控えます。Worker はリクエストの JWT について署名、発行者と対象アプリを検証します。[Self-hosted application の設定](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)・[Access JWT の検証](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)

次は `wrangler.jsonc` のトップレベルに追加するキーの例です。実際のチーム名、AUD、DNS 名に置き換えてください。本番環境の設定から開発用の `LOCAL_OPERATOR` を取り除きます。`SENDING_DOMAINS` には送信を有効にした窓口のドメインをカンマ区切りで指定します。Cron と Queues の consumer は配布設定を引き継ぎます。

```json
{
  "routes": [{ "pattern": "desk.example.com", "custom_domain": true }],
  "workers_dev": false,
  "preview_urls": false,
  "vars": {
    "ENVIRONMENT": "production",
    "ACCESS_ISSUER": "https://your-team.cloudflareaccess.com",
    "ACCESS_AUDIENCE": "replace-with-your-application-aud",
    "SENDING_DOMAINS": "mail.example.com"
  }
}
```

CLI・MCP を使う場合は、`/api/*` と `/mcp` にパスを限定した Access アプリの Bypass ポリシーを作り、Worker の Bearer トークン認証へ通します。公開フォームやヘルプを提供する場合は、使う拡張の公開 URL だけを例外にします。運営画面・設定・トークン発行の URL は運営者だけに許可します。[CLI と MCP の認証](machine-access.md)・[Access のパスの優先順位](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/)

## 送受信を設定する

1. Cloudflare Dashboard の **Email Service** で窓口のドメインに Email Routing を設定し、対象ドメインについて表示された MX・TXT レコードを登録します。既存 MX がある場合は先に移行先と配信切替の時刻を確認します。[受信の初期設定](https://developers.cloudflare.com/email-service/get-started/route-emails/)
2. **Email Service → Email Sending → Onboard Domain** で同じドメインを選びます。バウンス用 MX と、SPF・DKIM・DMARC 用 TXT の名前・値を確認し、登録と検証が完了するまで待ちます。窓口の From アドレスがこのドメインに属することを確認します。[送信ドメインの設定](https://developers.cloudflare.com/email-service/get-started/send-emails/)
3. 下記のデプロイと窓口登録を終えた後に、Email Routing のカスタムアドレスで宛先（例 `support@mail.example.com`）、アクション **Send to a Worker**、今回デプロイした Worker を選択して有効にします。API から操作する場合は対象ゾーンの **Email Routing Rules Write** 権限を付与し、`POST /zones/{zone_id}/email/routing/rules` の `matchers` に宛先、`actions` に `worker` と Worker 名を指定します。[Email Routing ルール API](https://developers.cloudflare.com/api/resources/email_routing/subresources/rules/methods/create/)

## 承認済みのコミットから初回デプロイ・更新する

初回は自分の fork に設定をコミットします。更新時には upstream の変更・新しいマイグレーションを取り込み、変更した設定や拡張のコードもコミット対象に含めます。アップグレードの前に D1 の復旧点と R2 の保存状況を確認してください。JSONL は会話を持ち出すための書き出しです。検索に FTS5 の仮想テーブルを使うため、D1 の SQL ダンプを SQLite CLI 用に取得した場合、そのダンプを D1 に直接インポートすることはできません。D1 の復旧手順には Time Travel を使用してください。[D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)・[仮想テーブルを含む D1 のエクスポート](https://developers.cloudflare.com/changelog/post/2026-11-12-d1-export-virtual-tables/)

```sh
git remote get-url origin
git diff --check
git add wrangler.jsonc helpdesk.config.ts
git diff --cached
git commit -m "Configure helpdesk for our domain"
```

以下のブロックは bash で実行します。まず、対象のブランチと SHA を自分のリモートへ push し、その SHA を別ディレクトリにチェックアウトします。途中で失敗したら処理を中断してください。

```sh
set -eu
test -z "$(git status --porcelain)"
branch=$(git symbolic-ref --short HEAD)
release_sha=$(git rev-parse HEAD)
git push origin "HEAD:refs/heads/$branch"
test "$(git ls-remote origin "refs/heads/$branch" | cut -f1)" = "$release_sha"
release_dir=$(mktemp -d)
git worktree add --detach "$release_dir" "$release_sha"
cd "$release_dir"
test "$(git rev-parse HEAD)" = "$release_sha"
pnpm install --frozen-lockfile
pnpm build
test -z "$(git status --porcelain)"
printf 'Verified pushed commit %s\n' "$release_sha"
```

デプロイ担当者が SHA、対象アカウント、D1 のマイグレーション内容を確認し、本番反映を承認してから、**同じ端末・同じ worktree** で実行します。Wrangler が出力する Worker の URL と Version ID、push 結果、SHA、最後の作業ツリー状態を運用記録に残します。

```sh
test "$(git rev-parse HEAD)" = "$release_sha"
test -z "$(git status --porcelain)"
pnpm exec wrangler whoami
pnpm exec wrangler d1 migrations apply DB --remote
pnpm exec wrangler deploy
git rev-parse HEAD
git status --short --branch
```

## 最初の窓口を開設して確認する

1. 初回セットアップ担当者が Access を通って `https://desk.example.com/settings` にログインします。最初の運営者に管理権限が付いたことを確認してから Access の許可対象に他の担当者を加えます。2 人目以降の初期権限は agent です。
2. **Register mailbox** で製品 ID、表示名、窓口アドレスを登録します。登録時に画面に表示される自動送信の対象・条件を確認してください。必要に応じて **Extensions** で有効な送信拡張を調整します。Email Routing でこのアドレスを Worker に向けます。
3. **API tokens** で読み取り権限のトークンを発行し、端末で `HELPDESK_URL` に本番 URL、`HELPDESK_TOKEN` に表示された値を設定します。`node cli/helpdesk.mjs doctor` で窓口・送信ドメインの不足を確認し、表示された設定を修正します。Cloudflare 側も照合する場合は端末だけに `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ZONE_IDS`（対象ゾーン ID のカンマ区切り）を渡し、`node cli/helpdesk.mjs --live doctor` を実行します。通常の診断は宣言済みドメイン、実照合はゾーンの Email Sending API が返す有効なドメインを確認します。[送信ドメイン一覧 API](https://developers.cloudflare.com/api/resources/email_sending/subresources/subdomains/methods/list/)
4. 外部の検証用メールから窓口に送信し、Inbox に 1 件現れることを確認します。返信をプレビューして送信し、外部の受信箱で From、本文、スレッド表示を確認します。さらにその返信へ返事を送り、同じ会話に届くことを確認します。
5. 保存期間を **Settings** で設定します。必要な場合は **Extensions** で export を有効にし、ローカル例のエクスポートコマンドを本番 URL と読み取りトークンで実行します。サンプルのアドレスやメッセージを実際の値に置き換え、エクスポートに期待した履歴が含まれることを確認してください。
