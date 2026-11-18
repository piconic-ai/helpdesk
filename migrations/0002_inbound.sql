CREATE TABLE inbound_receipts (
    raw_key TEXT PRIMARY KEY NOT NULL,
    message TEXT NOT NULL UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
    mailbox TEXT NOT NULL,
    sender TEXT NOT NULL,
    source_id TEXT NOT NULL,
    UNIQUE (mailbox, sender, source_id)
);
CREATE TABLE attachments (
    key TEXT PRIMARY KEY NOT NULL,
    message TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    mime TEXT NOT NULL
);
CREATE INDEX attachments_message ON attachments(message);
CREATE TABLE inbound_failures (
    raw_key TEXT PRIMARY KEY NOT NULL,
    mailbox TEXT NOT NULL,
    sender TEXT NOT NULL,
    reason TEXT NOT NULL,
    at INTEGER NOT NULL
);
