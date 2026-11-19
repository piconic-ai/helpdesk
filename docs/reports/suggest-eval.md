# Japanese article suggestion evaluation

**Live results are pending a human-run Workers AI evaluation.** The local demo and automated tests use controlled model responses. Their passing scores describe application behavior. Japanese retrieval quality requires the live evaluation below.

The evaluation contains 36 original Japanese questions and six short public articles. Labels cover paraphrases, colloquial wording, typos, multiple intents, unrelated questions and cases needing a person with access to an account. Multiple article IDs mean each is relevant. An empty list means that the correct result is a handoff. [Labeled questions and article summaries](../../scripts/eval/japanese.examples.mjs)

## Run the measurement

Install the project's dependencies and export `CLOUDFLARE_ACCOUNT_ID` and a token with Workers AI access in `CLOUDFLARE_API_TOKEN`. The command makes one billable request per question. The default model is `clef-flash`. Set `HELPDESK_EVAL_MODEL=clef` for a second, separate comparison. Use a new output path for each run.

```sh
node scripts/eval/suggest-eval.mjs docs/reports/suggest-eval-flash-run.md
```

The report contains the model, time, labeled examples, returned probabilities and counts at thresholds 0.4 through 0.9. A probability must exceed the threshold. Up to three article IDs are shown. A mixed list containing an irrelevant article counts as an incorrect suggestion. When no question qualifies for a denominator, the report shows a dash. A request failure stops the run to prevent a partially evaluated corpus from appearing complete.

## Interpreting results

Examine the proportion of shown lists containing any irrelevant article, then read the false positives together with their questions. Compare this with the fraction of answerable questions receiving no relevant article. Favor fewer irrelevant suggestions when the trade-off is close. Check the separate human-routing column before adopting a threshold for the product. Record the run link, selected threshold and examples supporting that decision here after the live measurement.
