CREATE TABLE outbox (
  message TEXT PRIMARY KEY NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  attempt TEXT NOT NULL UNIQUE,
  phase TEXT NOT NULL CHECK (phase IN ('ready','sending')),
  queued_at INTEGER NOT NULL,
  claimed_at INTEGER,
  CHECK ((phase='sending') = (claimed_at IS NOT NULL))
);
CREATE INDEX outbox_ready ON outbox(phase,queued_at);
