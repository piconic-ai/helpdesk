CREATE TABLE operator_profiles (
  email TEXT PRIMARY KEY NOT NULL REFERENCES operators(email) ON DELETE CASCADE,
  display_name TEXT NOT NULL
);

CREATE TABLE hosted_intakes (
  product TEXT PRIMARY KEY NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  public_key TEXT NOT NULL
);
