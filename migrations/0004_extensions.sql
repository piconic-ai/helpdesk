CREATE TABLE extension_settings(id TEXT PRIMARY KEY NOT NULL, enabled INTEGER NOT NULL CHECK(enabled IN (0,1)), enabled_by TEXT NOT NULL REFERENCES operators(email));
CREATE TABLE extension_cursor(id TEXT PRIMARY KEY NOT NULL, last_event INTEGER NOT NULL);
CREATE TABLE extension_deliveries(extension TEXT NOT NULL,event INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,attempt INTEGER NOT NULL DEFAULT 0,
 phase TEXT NOT NULL DEFAULT 'ready' CHECK(phase IN ('ready','processing','failed','done')),next_at INTEGER NOT NULL DEFAULT 0,error TEXT,
 PRIMARY KEY(extension,event));
CREATE INDEX delivery_due ON extension_deliveries(phase,next_at);
CREATE TABLE form_data(key TEXT PRIMARY KEY NOT NULL,value TEXT NOT NULL CHECK(json_valid(value)));
CREATE TABLE canned_data(key TEXT PRIMARY KEY NOT NULL,value TEXT NOT NULL CHECK(json_valid(value)));
CREATE TABLE issues_data(key TEXT PRIMARY KEY NOT NULL,value TEXT NOT NULL CHECK(json_valid(value)));
CREATE TABLE extension_migrations(extension TEXT NOT NULL,version INTEGER NOT NULL,PRIMARY KEY(extension,version));
