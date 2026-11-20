CREATE TABLE product_ticket_prefixes (
 product TEXT PRIMARY KEY NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 prefix TEXT NOT NULL UNIQUE CHECK(length(prefix) BETWEEN 2 AND 5 AND prefix NOT GLOB '*[^A-Z]*')
);

INSERT INTO product_ticket_prefixes(product,prefix)
SELECT id,char(65+n/456976,65+n/17576%26,65+n/676%26,65+n/26%26,65+n%26)
FROM (SELECT id,row_number() OVER (ORDER BY id)-1 AS n FROM products);

CREATE TRIGGER product_allocate_ticket_prefix AFTER INSERT ON products BEGIN
 INSERT INTO product_ticket_prefixes(product,prefix)
 SELECT NEW.id, prefix FROM (
   WITH RECURSIVE candidates(n,prefix) AS (
     SELECT 0,'AAAAA'
     UNION ALL
     SELECT n+1,char(65+(n+1)/456976,65+(n+1)/17576%26,65+(n+1)/676%26,65+(n+1)/26%26,65+(n+1)%26)
     FROM candidates
     WHERE n<11881375 AND EXISTS (SELECT 1 FROM product_ticket_prefixes WHERE product_ticket_prefixes.prefix=candidates.prefix)
   )
   SELECT prefix FROM candidates ORDER BY n DESC LIMIT 1
 );
END;
