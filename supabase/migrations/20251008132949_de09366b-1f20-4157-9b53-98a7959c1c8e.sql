-- Add logo column to team_profiles table
ALTER TABLE team_profiles 
ADD COLUMN logo text;

COMMENT ON COLUMN team_profiles.logo IS 'Team logo URL for header and marketplace display';