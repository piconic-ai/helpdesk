CREATE TABLE standing_messages(
 message TEXT PRIMARY KEY NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
 operator_recipient TEXT REFERENCES operators(email)
);
