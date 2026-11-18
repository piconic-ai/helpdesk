ALTER TABLE operator_profiles ADD COLUMN avatar_key TEXT;

CREATE TABLE product_senders (
  product TEXT PRIMARY KEY NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  show_operator INTEGER NOT NULL DEFAULT 0 CHECK (show_operator IN (0,1))
);

ALTER TABLE outbox ADD COLUMN sender_name TEXT;
ALTER TABLE outbox ADD COLUMN operator_name TEXT;
