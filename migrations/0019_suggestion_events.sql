CREATE TABLE suggestion_presentations (
  id TEXT PRIMARY KEY NOT NULL,
  product TEXT NOT NULL REFERENCES products(id),
  surface TEXT NOT NULL CHECK (surface IN ('chat','form','ack','composer')),
  question TEXT NOT NULL,
  articles TEXT NOT NULL CHECK (json_valid(articles) AND json_type(articles)='array'),
  highest_score REAL CHECK (highest_score BETWEEN 0 AND 1),
  contact TEXT COLLATE NOCASE,
  number INTEGER REFERENCES conversations(number) ON DELETE CASCADE,
  stable_key TEXT,
  at INTEGER NOT NULL,
  UNIQUE(product,surface,stable_key)
);
CREATE INDEX suggestion_period ON suggestion_presentations(product,at);
CREATE INDEX suggestion_contact ON suggestion_presentations(contact);
CREATE INDEX suggestion_age ON suggestion_presentations(at);
CREATE TABLE suggestion_reactions (
  presentation TEXT NOT NULL REFERENCES suggestion_presentations(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('opened','resolved','unresolved','inquiry','attached')),
  article TEXT NOT NULL DEFAULT '',
  at INTEGER NOT NULL,
  PRIMARY KEY (presentation,action,article)
);
