CREATE TABLE project_labels (
 product TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 color INTEGER CHECK(color BETWEEN 0 AND 7),
 PRIMARY KEY(product,name)
);
INSERT INTO project_labels(product,name,color)
SELECT p.id,n.name,c.color FROM products p CROSS JOIN label_names n LEFT JOIN label_colors c ON c.name=n.name;
DROP TRIGGER register_assigned_label;
DROP TRIGGER rename_label;
DROP TRIGGER remove_label;
DROP TABLE label_names;
DROP TABLE label_colors;
CREATE TRIGGER register_assigned_project_label AFTER INSERT ON labels BEGIN
 INSERT OR IGNORE INTO project_labels(product,name) SELECT product,NEW.name FROM conversations WHERE number=NEW.number;
END;
CREATE TRIGGER register_moved_project_labels AFTER UPDATE OF product ON conversations BEGIN
 INSERT OR IGNORE INTO project_labels(product,name) SELECT NEW.product,name FROM labels WHERE number=NEW.number;
END;
CREATE TRIGGER rename_project_label AFTER UPDATE OF name ON project_labels BEGIN
 UPDATE labels SET name=NEW.name WHERE name=OLD.name AND number IN (SELECT number FROM conversations WHERE product=OLD.product);
END;
CREATE TRIGGER remove_project_label AFTER DELETE ON project_labels BEGIN
 DELETE FROM labels WHERE name=OLD.name AND number IN (SELECT number FROM conversations WHERE product=OLD.product);
END;
CREATE TABLE project_retention (
 product TEXT PRIMARY KEY NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 days INTEGER NOT NULL CHECK(days BETWEEN 0 AND 36500)
);
CREATE TRIGGER confirm_project_deletion BEFORE INSERT ON events
WHEN NEW.kind='project_deleted' AND NOT EXISTS (
 SELECT 1 FROM products p WHERE p.id=json_extract(NEW.payload,'$.product')
 AND p.name=json_extract(NEW.payload,'$.name')
 AND (SELECT count(*) FROM conversations WHERE product=p.id)=json_extract(NEW.payload,'$.conversations')
)
BEGIN
 SELECT RAISE(ABORT,'The project changed. Review its name and conversation count before deleting.');
END;
