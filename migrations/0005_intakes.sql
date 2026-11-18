ALTER TABLE conversations ADD COLUMN contact_name TEXT;
CREATE TABLE intake_windows (
  product TEXT NOT NULL,
  client TEXT NOT NULL,
  minute INTEGER NOT NULL,
  count INTEGER NOT NULL CHECK(count > 0),
  PRIMARY KEY(product,client)
);
CREATE INDEX intake_window_expiry ON intake_windows(minute);
