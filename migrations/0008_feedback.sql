ALTER TABLE conversations ADD COLUMN reviewed_by TEXT CHECK(
  (kind='feedback' AND status='reviewed' AND reviewed_by IS NOT NULL)
  OR (status<>'reviewed' AND reviewed_by IS NULL)
);
