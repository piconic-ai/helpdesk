# Choosing related help articles

Helpdesk asks a decision model whether each published article can answer a question. The visitor reads the article written by the product team. Clef supplies probabilities. Its output contains no answer text for the customer.

## What goes into a decision

Helpdesk considers published articles for one product. With up to 20 articles, all are eligible. Larger libraries use D1 full-text search to shortlist up to 20. In one Workers AI request, Helpdesk sends the question text, the candidate titles and their short summaries. An article without a summary uses the opening of its body. A separate yes/no question asks whether a person needs to inspect the customer's account or data. Human routing preserves the option of reading relevant articles.

The model receives no conversation transcript, contact profile, attachments or credentials. Operators should keep personal information out of public article titles and summaries. Helpdesk removes known contact details before inference. The input and response are bounded, and a failed model call takes the customer to the normal inquiry flow. Retention and contact deletion also apply to the stored question used to review recommendations.

## Models and cost

The default for a chat or form is `@cf/cloudflare/clef-flash`, with a 24,576-token context window. For automatic acknowledgments and the operator composer the default is `@cf/cloudflare/clef`, with a 65,536-token window. Both accept up to 64 typed questions. Helpdesk uses at most 21 and reserves at least half of the context window. The `noul` answer for each question has a number between zero and one in `answers[key].noul`. [Clef Flash model and schema](https://developers.cloudflare.com/workers-ai/models/clef-flash/) · [Clef model and schema](https://developers.cloudflare.com/workers-ai/models/clef/)

On November 19, 2026 the listed prices per million input tokens were USD 0.038 for Flash and USD 0.240 for Clef. For illustration, 1,000 requests averaging 2,000 input tokens each use two million input tokens, priced at USD 0.076 or USD 0.48 respectively, before account allowances and other services. The provider charges these two models for input tokens only. Actual usage depends on the questions, summaries and number of candidates in each request. [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)

## Choose a threshold

At the default threshold of 0.6, an article with probability 0.60 is omitted and a 0.61 is eligible. The three highest eligible results are shown. Compare thresholds using labeled examples before changing the value for a product. Inspect false positives first. An irrelevant article can delay a customer who already needs an operator. Measure unanswered questions as well, then follow the article's opened and resolved rates after deployment. [Japanese evaluation procedure and results](../reports/suggest-eval.md)

## Read the results in the operator console

Open **拡張の管理 → ヘルプチャット → 記事のおすすめを設定** under the product name to change the percentage, either model, or whether automatic acknowledgments include suggestions. New products start with suggestions in acknowledgment mail turned off. The automatic acknowledgment extension must also be enabled for the product to send a receipt. For delivery links, configure the public article origin in the Articles extension.

In **対応状況**, the self-resolution rate counts chat and form presentations that showed at least one article in the selected period. The numerator counts presentations that ended as resolved with no recorded inquiry by the end of that period. The article list includes all four surfaces when counting presentations and opens. An article shown at least three times with zero resolutions receives a review label. **記事が無かった質問** lets an operator start an article from an unanswered question for the selected product.
