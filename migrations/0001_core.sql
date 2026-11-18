CREATE TABLE operators (
 email TEXT PRIMARY KEY NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('admin','agent'))
);
CREATE TABLE products (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL);
CREATE TABLE mailboxes (address TEXT PRIMARY KEY NOT NULL COLLATE NOCASE, product TEXT NOT NULL REFERENCES products(id));
CREATE TABLE conversations (
 number INTEGER PRIMARY KEY AUTOINCREMENT,
 product TEXT NOT NULL REFERENCES products(id),
 mailbox TEXT NOT NULL REFERENCES mailboxes(address),
 contact TEXT NOT NULL, subject TEXT NOT NULL,
 kind TEXT NOT NULL DEFAULT 'inquiry', origin TEXT NOT NULL DEFAULT 'email' CHECK(origin IN ('email','chat','form')),
 status TEXT NOT NULL, closed_at INTEGER, assignee TEXT REFERENCES operators(email), created_at INTEGER NOT NULL,
 CHECK ((kind='inquiry' AND status IN ('open','pending','closed','spam')) OR
        (kind='feedback' AND status IN ('received','reviewed','spam') AND assignee IS NULL)),
 CHECK ((status='closed') = (closed_at IS NOT NULL))
);
CREATE INDEX conversation_filter ON conversations(status, product, number);
CREATE INDEX conversation_contact ON conversations(contact);
CREATE TABLE messages (
 id TEXT PRIMARY KEY NOT NULL, number INTEGER NOT NULL REFERENCES conversations(number) ON DELETE CASCADE,
 kind TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', html TEXT, raw_key TEXT, message_id TEXT,
 in_reply_to TEXT, refs TEXT, delivery TEXT, approval TEXT CHECK(approval IS NULL OR json_valid(approval)),
 actor TEXT CHECK(actor IS NULL OR json_valid(actor)), reason TEXT, provider_id TEXT, sent_at INTEGER, created_at INTEGER NOT NULL CHECK(created_at>=0),
 CHECK(kind='inbound' OR actor IS NOT NULL),
 CHECK(actor IS NULL OR coalesce(
       json_extract(actor,'$.kind')='system'
       OR (json_extract(actor,'$.kind') IN ('operator','extension','agent')
          AND json_type(actor,'$.id')='text' AND length(json_extract(actor,'$.id'))>0
          AND (json_extract(actor,'$.kind')!='agent' OR
             (json_type(actor,'$.onBehalfOf')='text' AND length(json_extract(actor,'$.onBehalfOf'))>0))),0)),
 CHECK(approval IS NULL OR coalesce(
       (json_extract(approval,'$.kind')='operator' AND json_type(approval,'$.by')='text' AND length(json_extract(approval,'$.by'))>0) OR
       (json_extract(approval,'$.kind')='standing' AND json_type(approval,'$.policy')='text' AND length(json_extract(approval,'$.policy'))>0
          AND json_type(approval,'$.enabledBy')='text' AND length(json_extract(approval,'$.enabledBy'))>0),0)),
 CHECK((kind IN ('inbound','note') AND delivery IS NULL AND approval IS NULL)
    OR (kind='outbound' AND delivery IS NOT NULL AND
       ((delivery IN ('draft','awaiting_approval') AND approval IS NULL) OR
        (delivery IN ('queued','sent','failed') AND approval IS NOT NULL)))),
 CHECK(delivery IS NOT 'sent' OR (provider_id IS NOT NULL AND length(provider_id)>0 AND sent_at IS NOT NULL)),
 CHECK((provider_id IS NULL) = (sent_at IS NULL)),
 CHECK(sent_at IS NULL OR (sent_at >= 0 AND delivery IN ('sent','failed') AND kind='outbound')),
 CHECK((delivery IS 'failed') = (reason IS NOT NULL)),
 CHECK(reason IS NULL OR length(reason)>0)
);
CREATE INDEX message_conversation ON messages(number,created_at);
CREATE INDEX message_thread ON messages(message_id);
CREATE TABLE labels (number INTEGER NOT NULL REFERENCES conversations(number) ON DELETE CASCADE, name TEXT NOT NULL, PRIMARY KEY(number,name));
CREATE TABLE events (
 id INTEGER PRIMARY KEY, number INTEGER REFERENCES conversations(number) ON DELETE CASCADE,
 kind TEXT NOT NULL, actor TEXT NOT NULL CHECK(json_valid(actor)), payload TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(payload)), at INTEGER NOT NULL
);
CREATE TABLE settings (name TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
CREATE TABLE pending_deletions (key TEXT PRIMARY KEY NOT NULL);
