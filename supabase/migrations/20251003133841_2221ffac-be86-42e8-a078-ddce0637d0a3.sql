-- Phase 4: Make team_profile_id NOT NULL in sponsorship_offers

-- Step 1: Update existing offers without team_profile_id
-- Link them to their user's team profile
UPDATE sponsorship_offers so
SET team_profile_id = tp.id
FROM team_profiles tp
WHERE so.user_id = tp.user_id
AND so.team_profile_id IS NULL;

-- Step 2: Delete any orphaned offers that still don't have a team_profile_id
-- (These are offers where the user's team profile was deleted or never existed)
DELETE FROM sponsorship_offers
WHERE team_profile_id IS NULL;

-- Step 3: Make the column NOT NULL
ALTER TABLE sponsorship_offers
ALTER COLUMN team_profile_id SET NOT NULL;

-- Step 4: Add foreign key constraint if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_sponsorship_offers_team_profile'
  ) THEN
    ALTER TABLE sponsorship_offers
    ADD CONSTRAINT fk_sponsorship_offers_team_profile
    FOREIGN KEY (team_profile_id)
    REFERENCES team_profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Step 5: Fix/Remove broken trigger
-- This trigger references NEW.team_id which doesn't exist
DROP TRIGGER IF EXISTS trg_insert_team_sponsorship_combined ON sponsorship_offers;

-- The trigger function is still referenced by other code, so we'll update it
-- to use the correct column name: team_profile_id instead of team_id
CREATE OR REPLACE FUNCTION public.trg_insert_team_sponsorship_combined()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO team_sponsorship_combined (
    sponsorship_offer_id, team_id, team_name, location, fundraising_goal
  )
  SELECT
    NEW.id,
    NEW.team_profile_id,  -- Use team_profile_id instead of team_id
    tp.team_name,
    tp.location,
    NEW.fundraising_goal
  FROM team_profiles tp
  WHERE tp.id = NEW.team_profile_id  -- Use team_profile_id
  ON CONFLICT (sponsorship_offer_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER trg_insert_team_sponsorship_combined
AFTER INSERT ON sponsorship_offers
FOR EACH ROW
EXECUTE FUNCTION public.trg_insert_team_sponsorship_combined();