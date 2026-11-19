CREATE TABLE label_names (name TEXT PRIMARY KEY NOT NULL);
INSERT INTO label_names SELECT name FROM labels UNION SELECT name FROM label_colors;
CREATE INDEX labels_by_name ON labels(name, number);
CREATE TRIGGER register_assigned_label AFTER INSERT ON labels BEGIN
  INSERT OR IGNORE INTO label_names(name) VALUES (NEW.name);
END;
CREATE TRIGGER rename_label AFTER UPDATE OF name ON label_names BEGIN
  UPDATE labels SET name=NEW.name WHERE name=OLD.name;
  UPDATE label_colors SET name=NEW.name WHERE name=OLD.name;
END;
CREATE TRIGGER remove_label AFTER DELETE ON label_names BEGIN
  DELETE FROM labels WHERE name=OLD.name;
  DELETE FROM label_colors WHERE name=OLD.name;
END;
