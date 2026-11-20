CREATE TABLE canned_presentations (
  id TEXT PRIMARY KEY NOT NULL,
  number INTEGER NOT NULL REFERENCES conversations(number) ON DELETE CASCADE,
  inbound TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  claimed_at INTEGER NOT NULL,
  ready INTEGER NOT NULL DEFAULT 0 CHECK (ready IN (0,1)),
  UNIQUE(number,inbound)
);
CREATE TABLE canned_impressions (
  presentation TEXT NOT NULL REFERENCES canned_presentations(id) ON DELETE CASCADE,
  template TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY(presentation,template)
);
CREATE INDEX canned_impressions_template ON canned_impressions(template);
CREATE TABLE canned_uses (
  id TEXT PRIMARY KEY NOT NULL,
  presentation TEXT NOT NULL,
  template TEXT NOT NULL,
  operator TEXT NOT NULL,
  edited INTEGER CHECK (edited IN (0,1)),
  FOREIGN KEY(presentation,template) REFERENCES canned_impressions(presentation,template) ON DELETE CASCADE
);
CREATE INDEX canned_uses_impression ON canned_uses(presentation,template);
