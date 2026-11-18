CREATE TABLE public_help_settings (
  product TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  setting TEXT NOT NULL,
  value TEXT NOT NULL,
  previous TEXT NOT NULL DEFAULT '',
  change_id TEXT UNIQUE,
  actor TEXT NOT NULL,
  PRIMARY KEY (product, setting)
);
