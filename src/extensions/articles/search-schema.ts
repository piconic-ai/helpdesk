// Install the search index after the articles extension creates its source table.
export const articleSearchSchema = [
  `CREATE VIEW IF NOT EXISTS published_help_documents AS
  SELECT key,json_extract(value,'$.product') AS product,json_extract(value,'$.id') AS slug,
    json_extract(value,'$.title') AS title,json_extract(value,'$.body') AS body,
    coalesce(nullif(trim(json_extract(value,'$.summary')),''),substr(json_extract(value,'$.body'),1,200)) AS summary
  FROM articles_data WHERE key GLOB 'article/*' AND json_extract(value,'$.status')='published'`,
  `CREATE TABLE IF NOT EXISTS article_search_keys(id INTEGER PRIMARY KEY, key TEXT NOT NULL UNIQUE, product TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS article_search_product ON article_search_keys(product,key)`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS article_search USING fts5(
  title,summary,body,tokenize='trigram',content='',contentless_delete=1
)`,
  `INSERT INTO article_search(article_search,rank) VALUES('secure-delete',1)`,
  `CREATE TRIGGER IF NOT EXISTS article_index_add AFTER INSERT ON article_search_keys BEGIN
  INSERT INTO article_search(rowid,title,summary,body)
    SELECT new.id,title,summary,body FROM published_help_documents WHERE key=new.key;
END`,
  `CREATE TRIGGER IF NOT EXISTS article_index_remove AFTER DELETE ON article_search_keys BEGIN
  DELETE FROM article_search WHERE rowid=old.id;
END`,
  `INSERT OR IGNORE INTO article_search_keys(key,product) SELECT key,product FROM published_help_documents`,
  `CREATE TRIGGER IF NOT EXISTS article_data_add AFTER INSERT ON articles_data WHEN new.key GLOB 'article/*' BEGIN
  DELETE FROM article_search_keys WHERE key=new.key;
  INSERT OR IGNORE INTO article_search_keys(key,product) SELECT key,product FROM published_help_documents WHERE key=new.key;
END`,
  `CREATE TRIGGER IF NOT EXISTS article_data_edit AFTER UPDATE ON articles_data WHEN old.key GLOB 'article/*' OR new.key GLOB 'article/*' BEGIN
  DELETE FROM article_search_keys WHERE key IN (old.key,new.key);
  INSERT OR IGNORE INTO article_search_keys(key,product) SELECT key,product FROM published_help_documents WHERE key=new.key;
END`,
  `CREATE TRIGGER IF NOT EXISTS article_data_remove AFTER DELETE ON articles_data WHEN old.key GLOB 'article/*' BEGIN
  DELETE FROM article_search_keys WHERE key=old.key;
END`,
]
