-- Keep the primary key for relationships, permalinks and legacy [#N] mail.
ALTER TABLE conversations ADD COLUMN ticket_number INTEGER NOT NULL DEFAULT 0 CHECK(ticket_number>=0);
UPDATE conversations SET ticket_number=number;

CREATE TABLE project_ticket_counters (
 product TEXT PRIMARY KEY NOT NULL,
 last_number INTEGER NOT NULL CHECK(last_number>=0)
);
-- Deleted legacy tickets cannot be attributed to a project. Reserve the old
-- global high-water mark once, then let each project advance independently.
INSERT INTO project_ticket_counters(product,last_number)
SELECT id,coalesce((SELECT seq FROM sqlite_sequence WHERE name='conversations'),0) FROM products;

-- Each issued reference names just one conversation. Keep the reservation on
-- deletion so neither an erased ticket nor a retired prefix can be reassigned.
CREATE TABLE ticket_references (
 prefix TEXT NOT NULL,
 serial INTEGER NOT NULL CHECK(serial>0),
 product TEXT NOT NULL,
 conversation INTEGER REFERENCES conversations(number) ON DELETE SET NULL,
 PRIMARY KEY(prefix,serial)
);
CREATE INDEX ticket_reference_conversation ON ticket_references(conversation);
INSERT INTO ticket_references SELECT '#',number,product,number FROM conversations;
INSERT INTO ticket_references
SELECT p.prefix,c.number,c.product,c.number FROM conversations c JOIN product_ticket_prefixes p ON p.product=c.product;
INSERT OR IGNORE INTO ticket_references
SELECT json_extract(e.payload,'$.prefix'),c.number,c.product,c.number
FROM events e JOIN conversations c ON c.product=json_extract(e.payload,'$.product')
WHERE e.kind='ticket_prefix_changed' AND json_type(e.payload,'$.prefix')='text';

CREATE VIEW reserved_ticket_prefixes AS
 SELECT product,prefix FROM product_ticket_prefixes
 UNION ALL SELECT product,prefix FROM ticket_references WHERE prefix!='#';

DROP TRIGGER product_allocate_ticket_prefix;
CREATE TRIGGER product_allocate_ticket_prefix AFTER INSERT ON products BEGIN
 INSERT INTO product_ticket_prefixes(product,prefix)
 SELECT NEW.id,prefix FROM (
   WITH RECURSIVE candidates(n,prefix) AS (
     SELECT 0,'AAAAA'
     UNION ALL
     SELECT n+1,char(65+(n+1)/456976,65+(n+1)/17576%26,65+(n+1)/676%26,65+(n+1)/26%26,65+(n+1)%26)
     FROM candidates
     WHERE n<11881375 AND EXISTS(SELECT 1 FROM reserved_ticket_prefixes p WHERE p.prefix=candidates.prefix)
   )
   SELECT prefix FROM candidates ORDER BY n DESC LIMIT 1
 );
END;
CREATE TRIGGER remember_changed_ticket_prefix AFTER UPDATE OF prefix ON product_ticket_prefixes
WHEN NEW.prefix!=OLD.prefix BEGIN
 SELECT RAISE(ABORT,'ticket prefix already issued') WHERE EXISTS(
  SELECT 1 FROM ticket_references WHERE prefix=NEW.prefix AND product!=NEW.product
 );
 INSERT OR IGNORE INTO ticket_references(prefix,serial,product,conversation)
 SELECT NEW.prefix,ticket_number,product,number FROM conversations WHERE product=NEW.product;
END;

CREATE TRIGGER assign_project_ticket AFTER INSERT ON conversations BEGIN
 INSERT INTO project_ticket_counters(product,last_number) VALUES(NEW.product,1)
 ON CONFLICT(product) DO UPDATE SET last_number=last_number+1;
 UPDATE conversations SET ticket_number=(SELECT last_number FROM project_ticket_counters WHERE product=NEW.product)
 WHERE number=NEW.number;
END;
CREATE TRIGGER move_project_ticket AFTER UPDATE OF product ON conversations WHEN NEW.product!=OLD.product BEGIN
 INSERT INTO project_ticket_counters(product,last_number) VALUES(NEW.product,1)
 ON CONFLICT(product) DO UPDATE SET last_number=last_number+1;
 UPDATE conversations SET ticket_number=(SELECT last_number FROM project_ticket_counters WHERE product=NEW.product)
 WHERE number=NEW.number;
END;
CREATE TRIGGER record_project_ticket AFTER UPDATE OF ticket_number ON conversations BEGIN
 INSERT INTO ticket_references(prefix,serial,product,conversation)
 SELECT prefix,NEW.ticket_number,NEW.product,NEW.number FROM product_ticket_prefixes WHERE product=NEW.product;
END;

CREATE VIEW referenced_conversations AS
 SELECT c.*, p.prefix || '-' || c.ticket_number AS reference
 FROM conversations c JOIN product_ticket_prefixes p ON p.product=c.product;
