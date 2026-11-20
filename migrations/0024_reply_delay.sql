ALTER TABLE operator_profiles ADD COLUMN reply_delay INTEGER NOT NULL DEFAULT 10
  CHECK (reply_delay IN (10, 30, 60, 300));
ALTER TABLE product_senders ADD COLUMN minimum_reply_delay INTEGER NOT NULL DEFAULT 10
  CHECK (minimum_reply_delay IN (10, 30, 60, 300));
