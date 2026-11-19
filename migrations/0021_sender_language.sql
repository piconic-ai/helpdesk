ALTER TABLE product_senders ADD COLUMN language TEXT NOT NULL DEFAULT 'ja'
  CHECK (language IN ('ja', 'en'));
