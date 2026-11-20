-- A GitHub issue can be linked to conversations in several projects. The
-- closure event belongs to each project with a link, including historical links.
CREATE INDEX issue_link_events_by_reference ON events(
  lower(json_extract(payload,'$.repository')), json_extract(payload,'$.issue'), number
) WHERE kind='issues.linked';

CREATE VIEW shared_event_projects AS
SELECT closed.id AS event, conversation.product
FROM events closed
JOIN events link
  ON link.kind='issues.linked'
 AND lower(json_extract(link.payload,'$.repository'))=lower(json_extract(closed.payload,'$.repository'))
 AND json_extract(link.payload,'$.issue')=json_extract(closed.payload,'$.issue')
JOIN conversations conversation ON conversation.number=link.number
WHERE closed.kind='issues.closed' AND closed.number IS NULL;
