CREATE VIRTUAL TABLE conversation_search USING fts5(
  subject, contact, tokenize='trigram case_sensitive 1', content='', contentless_delete=1
);
CREATE VIRTUAL TABLE message_search USING fts5(
  body, tokenize='trigram case_sensitive 1', content='', contentless_delete=1
);
INSERT INTO conversation_search(conversation_search,rank) VALUES('secure-delete',1);
INSERT INTO message_search(message_search,rank) VALUES('secure-delete',1);

-- Conversations have an integer primary key. Give each text-keyed message
-- a stable index identifier independent of its implicit SQLite rowid.
ALTER TABLE messages ADD COLUMN search_rowid INTEGER;
UPDATE messages SET search_rowid=rowid;
CREATE UNIQUE INDEX messages_search_rowid ON messages(search_rowid);
INSERT INTO conversation_search(rowid,subject,contact)
  SELECT number,lower(subject),lower(contact) FROM conversations;
INSERT INTO message_search(rowid,body)
  SELECT search_rowid,lower(body) FROM messages;

CREATE TRIGGER conversation_search_insert AFTER INSERT ON conversations BEGIN
  INSERT INTO conversation_search(rowid,subject,contact)
    VALUES(new.number,lower(new.subject),lower(new.contact));
END;
CREATE TRIGGER conversation_search_update AFTER UPDATE OF subject,contact ON conversations BEGIN
  UPDATE conversation_search SET subject=lower(new.subject),contact=lower(new.contact)
    WHERE rowid=old.number;
END;
CREATE TRIGGER conversation_search_delete AFTER DELETE ON conversations BEGIN
  DELETE FROM conversation_search WHERE rowid=old.number;
END;
CREATE TRIGGER message_search_insert AFTER INSERT ON messages BEGIN
  INSERT INTO message_search(body) VALUES(lower(new.body));
  UPDATE messages SET search_rowid=last_insert_rowid() WHERE id=new.id;
END;
CREATE TRIGGER message_search_update AFTER UPDATE OF body ON messages BEGIN
  UPDATE message_search SET body=lower(new.body) WHERE rowid=old.search_rowid;
END;
CREATE TRIGGER message_search_delete AFTER DELETE ON messages BEGIN
  DELETE FROM message_search WHERE rowid=old.search_rowid;
END;
