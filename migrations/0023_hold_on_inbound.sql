-- A new human reply and a delivery claim serialize on the same outbox row.
CREATE TRIGGER stop_scheduled_reply_on_inbound AFTER INSERT ON events
WHEN NEW.kind = 'message_received' AND json_extract(NEW.payload, '$.category') = 'human'
BEGIN
  INSERT INTO events(number,kind,actor,payload,at)
    SELECT m.number,'reply_held',json_object('kind','system'),
           json_object('message',m.id,'by',json_extract(m.approval,'$.by'),'reason','customer_replied'),NEW.at
    FROM messages m JOIN reply_holds h ON h.message=m.id JOIN outbox o ON o.message=m.id
    WHERE m.number=NEW.number AND m.delivery='queued' AND o.phase='ready';
  UPDATE messages SET delivery='draft',approval=NULL
    WHERE number=NEW.number AND delivery='queued' AND id IN
      (SELECT h.message FROM reply_holds h JOIN outbox o USING(message) WHERE o.phase='ready');
  DELETE FROM outbox WHERE phase='ready' AND message IN
    (SELECT h.message FROM reply_holds h JOIN messages m ON m.id=h.message
     WHERE m.number=NEW.number AND m.delivery='draft');
END;
