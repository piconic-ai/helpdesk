CREATE TABLE project_extension_settings (
  product TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  extension TEXT NOT NULL,
  enabled INTEGER NOT NULL CHECK(enabled IN (0,1)),
  enabled_by TEXT REFERENCES operators(email),
  after_event INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(product,extension)
);
