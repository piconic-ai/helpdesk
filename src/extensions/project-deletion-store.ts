// These keys belong to the bundled extensions. The core deletes its own rows
// in the same D1 batch after these statements have used the conversation ids.
const numbers = 'SELECT number FROM conversations WHERE product=?1'
const byProduct = "json_extract(value,'$.product')=?1"
const byConversation = "json_extract(value,'$.number') IN (" + numbers + ')'
const links =
  "SELECT key FROM issues_data WHERE key GLOB 'link/*' AND " + byConversation
const rules =
  "SELECT key FROM rules_data WHERE key GLOB 'rule/*' AND " + byProduct
const tokenKeys =
  "SELECT substr(key,7) FROM survey_data WHERE key GLOB 'token/*' AND " +
  byProduct

const cleanup: Record<string, string[]> = {
  articles_data: [
    'DELETE FROM articles_data WHERE ' +
      byProduct +
      " OR key IN (SELECT 'candidate-article/'||number FROM conversations WHERE product=?1)",
  ],
  canned_data: ['DELETE FROM canned_data WHERE ' + byProduct],
  chat_data: ["DELETE FROM chat_data WHERE key='recommendation/'||?2"],
  auto_ack_data: ["DELETE FROM auto_ack_data WHERE key='message/'||?1"],
  survey_data: [
    "DELETE FROM survey_data WHERE (key GLOB 'invite/*' AND json_extract(value,'$') IN (" +
      tokenKeys +
      ")) OR key IN (SELECT 'answer/'||token FROM (SELECT substr(key,7) AS token FROM survey_data WHERE key GLOB 'token/*' AND " +
      byProduct +
      '))',
    'DELETE FROM survey_data WHERE ' + byProduct + " OR key='message/'||?1",
  ],
  snooze_data: ['DELETE FROM snooze_data WHERE ' + byConversation],
  presence_data: [
    "DELETE FROM presence_data WHERE key GLOB 'view/*' AND CAST(substr(key,6) AS INTEGER) IN (" +
      numbers +
      ')',
  ],
  merge_data: [
    'UPDATE merge_data SET value=coalesce((SELECT json_group_object(e.key,e.value) FROM json_each(merge_data.value) e WHERE CAST(e.key AS INTEGER) NOT IN (' +
      numbers +
      ') AND e.value NOT IN (' +
      numbers +
      ")),'{}') WHERE key='aliases'",
  ],
  issues_data: [
    `DELETE FROM issues_data WHERE key IN (
      SELECT 'issue/'||lower(json_extract(value,'$.repository'))||'/'||json_extract(value,'$.issue') FROM issues_data WHERE key GLOB 'link/*'
      GROUP BY lower(json_extract(value,'$.repository')),json_extract(value,'$.issue')
      HAVING count(*)=sum(CASE WHEN ${byConversation} THEN 1 ELSE 0 END)
    )`,
    "DELETE FROM issues_data WHERE key IN (SELECT 'notified/'||key FROM (" +
      links +
      ")) OR key IN (SELECT 'claimed/'||substr(key,9) FROM issues_data WHERE key GLOB 'preview/*' AND " +
      byConversation +
      ')',
    "DELETE FROM issues_data WHERE key='repository/'||?1 OR " + byConversation,
  ],
  rules_data: [
    'UPDATE rules_data SET value=coalesce((SELECT json_group_array(e.value) FROM json_each(rules_data.value) e WHERE e.value NOT IN (' +
      rules +
      ")),'[]') WHERE key='order'",
    'DELETE FROM rules_data WHERE ' + byProduct,
  ],
}
export async function bundledProjectDeletion(db: D1Database, product: string) {
  const { results } = await db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN (SELECT value FROM json_each(?))",
    )
    .bind(JSON.stringify(Object.keys(cleanup)))
    .all<{ name: string }>()
  return results.flatMap(({ name }) =>
    cleanup[name].map((sql) =>
      db
        .prepare(sql)
        .bind(
          ...(sql.includes('?2')
            ? [product, encodeURIComponent(product)]
            : [product]),
        ),
    ),
  )
}
