CREATE TABLE product_members (
  product TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL REFERENCES operators(email) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('admin','agent')),
  PRIMARY KEY(product,email)
);
CREATE INDEX product_members_operator ON product_members(email,product);

CREATE TABLE product_invitations (
  product TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','agent')),
  PRIMARY KEY(product,email)
);
CREATE INDEX product_invitations_email ON product_invitations(email);

CREATE TABLE product_lifecycle (
  product TEXT PRIMARY KEY NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  archived_at INTEGER,
  public_help INTEGER NOT NULL DEFAULT 0 CHECK(public_help IN (0,1))
);

INSERT INTO product_members(product,email,role)
SELECT p.id,o.email,o.role FROM products p CROSS JOIN operators o;
INSERT INTO product_lifecycle(product,public_help)
SELECT p.id,EXISTS(SELECT 1 FROM hosted_intakes h WHERE h.product=p.id) FROM products p;
CREATE TRIGGER prevent_archived_project_intake BEFORE INSERT ON conversations
WHEN EXISTS(SELECT 1 FROM product_lifecycle WHERE product=NEW.product AND archived_at IS NOT NULL)
BEGIN
  SELECT RAISE(ABORT,'Project is archived');
END;

CREATE TRIGGER product_add_members AFTER INSERT ON products BEGIN
  INSERT INTO product_lifecycle(product) VALUES(NEW.id);
  INSERT INTO product_members(product,email,role)
  SELECT NEW.id,email,'admin' FROM operators WHERE role='admin';
END;

CREATE TRIGGER bootstrap_project_admin AFTER INSERT ON operators WHEN NEW.role='admin' BEGIN
  INSERT INTO product_members(product,email,role) SELECT id,NEW.email,'admin' FROM products;
END;

CREATE TRIGGER preserve_project_admin BEFORE DELETE ON product_members
WHEN OLD.role='admin' AND EXISTS(SELECT 1 FROM products WHERE id=OLD.product)
  AND NOT EXISTS(SELECT 1 FROM product_members WHERE product=OLD.product AND role='admin' AND email<>OLD.email)
BEGIN
  SELECT RAISE(ABORT,'Last project administrator');
END;
CREATE TRIGGER preserve_project_admin_role BEFORE UPDATE OF role ON product_members
WHEN OLD.role='admin' AND NEW.role<>'admin'
  AND NOT EXISTS(SELECT 1 FROM product_members WHERE product=OLD.product AND role='admin' AND email<>OLD.email)
BEGIN
  SELECT RAISE(ABORT,'Last project administrator');
END;

CREATE TRIGGER release_project_assignments AFTER DELETE ON product_members BEGIN
  UPDATE conversations SET assignee=NULL WHERE product=OLD.product AND assignee=OLD.email;
END;
CREATE TRIGGER assign_project_member BEFORE UPDATE OF product,assignee ON conversations
WHEN NEW.assignee IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM product_members WHERE product=NEW.product AND email=NEW.assignee
) BEGIN
  SELECT RAISE(ABORT,'Assignee is not a project member');
END;
CREATE TRIGGER insert_assigned_member BEFORE INSERT ON conversations
WHEN NEW.assignee IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM product_members WHERE product=NEW.product AND email=NEW.assignee
) BEGIN
  SELECT RAISE(ABORT,'Assignee is not a project member');
END;

ALTER TABLE api_tokens ADD COLUMN products TEXT
  CHECK(products IS NULL OR (json_valid(products) AND json_type(products)='array'));

CREATE TRIGGER preserve_global_admin_role BEFORE UPDATE OF role ON operators
WHEN OLD.role='admin' AND NEW.role<>'admin'
  AND NOT EXISTS(SELECT 1 FROM operators WHERE role='admin' AND email<>OLD.email)
BEGIN
  SELECT RAISE(ABORT,'Last global administrator');
END;
CREATE TRIGGER preserve_global_admin BEFORE DELETE ON operators
WHEN OLD.role='admin' AND NOT EXISTS(SELECT 1 FROM operators WHERE role='admin' AND email<>OLD.email)
BEGIN
  SELECT RAISE(ABORT,'Last global administrator');
END;
