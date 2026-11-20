ALTER TABLE reply_holds ADD COLUMN restore_draft INTEGER NOT NULL DEFAULT 0 CHECK (restore_draft IN (0,1));
