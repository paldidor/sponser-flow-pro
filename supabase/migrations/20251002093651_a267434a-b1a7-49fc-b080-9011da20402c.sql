-- Fix Data Consistency: Link orphaned sponsorship offers to team profiles

-- Step 1: Update all sponsorship offers that are missing team_profile_id
-- This links them to the user's team profile if it exists
UPDATE sponsorship_offers so
SET team_profile_id = tp.id
FROM team_profiles tp
WHERE so.team_profile_id IS NULL
  AND so.user_id = tp.user_id;

-- Step 2: For users who have offers but no team profile yet, 
-- we can't fix them automatically. They'll be fixed when the user creates their profile.

-- Step 3 (OPTIONAL - COMMENTED OUT FOR SAFETY): 
-- Add NOT NULL constraint to prevent future orphaned offers
-- Only uncomment this after verifying all existing offers are linked!
-- 
-- To verify before adding constraint, run:
-- SELECT COUNT(*) FROM sponsorship_offers WHERE team_profile_id IS NULL;
-- 
-- If the count is 0, you can safely add the constraint:
-- ALTER TABLE sponsorship_offers 
-- ALTER COLUMN team_profile_id SET NOT NULL;

-- Add a helpful comment on the column
COMMENT ON COLUMN sponsorship_offers.team_profile_id IS 'Links the offer to a team profile. Should not be null - users must create team profile before offers.';