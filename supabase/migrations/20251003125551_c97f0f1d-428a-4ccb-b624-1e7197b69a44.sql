-- Create enum for onboarding steps
DO $$ BEGIN
  CREATE TYPE onboarding_step AS ENUM (
    'account_created',
    'team_profile',
    'website_analyzed',
    'packages',
    'review',
    'completed'
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Add column to track current onboarding step
ALTER TABLE team_profiles
ADD COLUMN IF NOT EXISTS current_onboarding_step onboarding_step 
DEFAULT 'account_created' NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN team_profiles.current_onboarding_step IS 
'Tracks the current step in the onboarding wizard. Used to prevent tab-switch redirect issues.';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_team_profiles_onboarding_step 
ON team_profiles(current_onboarding_step);

-- Backfill: Set existing profiles with onboarding_completed=true to 'completed' step
UPDATE team_profiles
SET current_onboarding_step = 'completed'
WHERE onboarding_completed = true 
  AND current_onboarding_step = 'account_created';