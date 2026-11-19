CREATE TABLE reply_holds (
  message TEXT PRIMARY KEY NOT NULL REFERENCES outbox(message) ON DELETE CASCADE,
  until_at INTEGER NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('pending','closed')),
  queued_event INTEGER NOT NULL
);
