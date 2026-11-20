# helpdesk

複数のプロジェクトを運営する個人開発者向けのメールヘルプデスクです。ひとつの受信箱で問い合わせを読み、それぞれの窓口アドレスから返信します。相手は普段のメールでやりとりを続けられます。

会話から GitHub issue を起票したり、よくある質問をヘルプ記事にしたりできます。CLI と MCP からも同じ操作を呼べます。エージェントが書いた返信は、人が承認するまで送信されません。

まずローカルでサンプルメールを受信して返信を試してください。自分の Cloudflare アカウントで使う場合は、セルフホストの手順に沿って窓口のドメインと Access を設定します。

[ヘルプチャットの埋め込み](docs/dev/embedding.md) · [ローカル開発手順](docs/dev/development.md)・[セルフホスト](docs/dev/self-hosting.md)・[CLI と MCP](docs/dev/machine-access.md)・[拡張の作り方](docs/dev/extensions.md)・[English](README.md)

## ライセンス

Helpdesk のライセンスは [MIT](LICENSE) です。BarefootJS 由来の UI 部品には、[元の著作権表示とライセンス](src/ui/BAREFOOT-LICENSE)を同梱しています。
