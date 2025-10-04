-- Make fundraising_goal nullable to allow AI to return null when not explicitly stated
-- The edge function will calculate intelligent defaults when needed
ALTER TABLE sponsorship_offers 
ALTER COLUMN fundraising_goal DROP NOT NULL;