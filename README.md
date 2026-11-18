# helpdesk

A self-hosted email helpdesk for developers supporting several products. Read requests in one inbox, reply from each product’s own address, and keep the conversation on the customer’s existing email thread.

An operator can turn a conversation into a GitHub issue, publish help articles, or use the CLI and MCP server to find requests and prepare replies for approval. Install the Worker, D1, private R2 storage and Queues in your Cloudflare account.

Start with the local walkthrough, then follow the self-hosting guide to connect a domain and protect the operator inbox with Cloudflare Access. The setup and development guides are in Japanese.

To try the inbox with sample conversations, run `pnpm install --frozen-lockfile` and `pnpm dev:demo`, then open [the demo inbox](http://127.0.0.1:8788/). You can reply, leave an internal note, or ask a question in [the help chat](http://127.0.0.1:8788/help/chat/slide). Email delivery and article recommendations are simulated locally. The sample data resets when you restart the demo.

[Local walkthrough](docs/dev/development.md) · [Self-hosting](docs/dev/self-hosting.md) · [CLI and MCP](docs/dev/machine-access.md) · [Extension development](docs/dev/extensions.md) · [日本語](README.ja.md)
