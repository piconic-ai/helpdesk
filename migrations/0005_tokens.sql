CREATE TABLE api_tokens (
  id TEXT PRIMARY KEY NOT NULL,
  digest TEXT UNIQUE NOT NULL CHECK(length(digest)=64),
  owner TEXT NOT NULL REFERENCES operators(email) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK(length(label) BETWEEN 1 AND 100),
  access TEXT NOT NULL CHECK(access IN ('read','draft','write')),
  created_at INTEGER NOT NULL
);
CREATE INDEX api_tokens_owner ON api_tokens(owner);
