ALTER TABLE extension_setting_changes ADD COLUMN product TEXT REFERENCES products(id) ON DELETE CASCADE;
