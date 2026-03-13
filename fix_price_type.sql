-- Migration to fix price column in services
ALTER TABLE services 
ALTER COLUMN price TYPE numeric(10,2) 
USING (NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric);
