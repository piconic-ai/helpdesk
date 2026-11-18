ALTER TABLE events ADD COLUMN dedup_key TEXT;
CREATE UNIQUE INDEX event_dedup ON events(dedup_key) WHERE dedup_key IS NOT NULL;
ALTER TABLE extension_deliveries ADD COLUMN enqueued_until INTEGER NOT NULL DEFAULT 0;
