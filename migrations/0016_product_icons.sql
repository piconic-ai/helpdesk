CREATE TABLE product_icons (
  product TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  emoji TEXT,
  image_key TEXT,
  CHECK ((emoji IS NOT NULL) <> (image_key IS NOT NULL))
);
