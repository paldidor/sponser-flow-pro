-- Add onboarding_completed field to team_profiles table
ALTER TABLE public.team_profiles 
ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Add comment explaining the field
COMMENT ON COLUMN public.team_profiles.onboarding_completed IS 'Tracks whether user has completed the full onboarding flow';

-- Create index for faster queries
CREATE INDEX idx_team_profiles_onboarding_completed ON public.team_profiles(onboarding_completed);
