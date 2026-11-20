# Embed the help chat

A deployment administrator enables Help Chat and Help Articles in **拡張の管理**. As a project administrator, open **設定 → プロジェクトの設定**, choose the project, and open **ヘルプチャット** under **拡張の設定**. Start its public intake if needed and register the origin that will host the button, including its scheme and non-default port. For example, register `https://app.example.com` to open the chat on `https://app.example.com/billing`. The standalone chat is available at `/help/chat/<product>`.

Copy the project's script tag and add it to the host page.

```html
<script src="https://help.example.com/widget.js" data-product="slide" referrerpolicy="no-referrer" async></script>
```

The address stays the same when the Worker is updated. The browser loads the launcher first and fetches the conversation frame when someone opens it. The chat keeps questions and unfinished input in memory while the host document stays open. Reloading the host document starts a fresh chat.

| Attribute | Use |
| --- | --- |
| `data-product` | Required project ID. Copy it from that project's settings. |
| `data-position` | Set `bottom-left` or use the default `bottom-right`. |
| `data-label` | Set the text on the launcher. The default Japanese label is ヘルプ. |
| `data-launcher` | Set `none` when the host supplies its own button. |
| `data-lang` | Override the host document's language for the widget. |

## Use an existing button

Place `data-helpdesk-open` on a button to open the panel. Once the async script loads, the host can also open or close the panel and prefill contact details.

```html
<button type="button" data-helpdesk-open>お問い合わせ</button>
```

```js
window.Helpdesk.prefill({ email: 'reader@example.com' })
window.Helpdesk.open()
window.Helpdesk.close()
```

The customer can edit the prefilled address before submitting. Prefilling provides a suggested contact address. Anyone running code on the host page can choose the value, so authentication must use separate credentials.

## Configure the origins

Allow the helpdesk origin in the host's `script-src` and `frame-src` CSP directives. Add the origin alongside the sources already required by the host. Keep the operator interface behind its normal access controls. For an externally facing installation, visitors need to be able to load the launcher, public help pages and their assets. An installation that protects the whole helpdesk hostname with Cloudflare Access also requires these visitors to sign in.

The chat response restricts framing with `frame-ancestors`. Register each embedding origin on the corresponding project. On the public form, the Worker checks the intake key, rate limit and any configured Turnstile requirement. Parent and frame messages check the sender's window and origin.

The host sends its origin and pathname when the panel opens. A submitted conversation displays them under **関連情報 → チャットを開いたページ**. The integration strips the query and fragment. Keep private information out of application path segments. The host does not receive the questions, suggested articles or contact form contents. Setting `referrerpolicy="no-referrer"` on the script also protects the referrer on the initial script request.

## Try the two-origin example

From a checkout with dependencies installed, run `pnpm dev:widget`. Open the example billing page at [localhost port 4173](http://127.0.0.1:4173/billing/receipts). Its script loads the local helpdesk at [port 8788](http://127.0.0.1:8788/). Set `HELPDESK_PRODUCT_PORT` and `HELPDESK_DEMO_PORT` before starting to choose other ports. The demo registers its local origin and seeds a receipt article. Email delivery and article matching use local fixtures.

Ask about a receipt, read the suggested article and return to the chat. Choose **解決しなかった**, enter an address and send. Open the returned number in the operator inbox to see the original question and embedding page.
