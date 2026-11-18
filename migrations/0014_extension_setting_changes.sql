CREATE TABLE extension_setting_changes (
  namespace TEXT NOT NULL,
  setting TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  operator TEXT NOT NULL REFERENCES operators(email),
  previous TEXT,
  current TEXT,
  PRIMARY KEY(namespace,setting)
);
