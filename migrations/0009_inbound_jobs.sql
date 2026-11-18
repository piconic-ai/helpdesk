CREATE TABLE inbound_jobs (
  raw_key TEXT PRIMARY KEY NOT NULL,
  mailbox TEXT NOT NULL,
  sender TEXT NOT NULL COLLATE NOCASE,
  received_at INTEGER NOT NULL,
  retry_at INTEGER NOT NULL
);
CREATE INDEX inbound_jobs_retry ON inbound_jobs(retry_at);
