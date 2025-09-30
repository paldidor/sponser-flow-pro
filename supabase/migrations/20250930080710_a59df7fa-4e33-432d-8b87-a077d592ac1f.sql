-- Add LinkedIn and YouTube follower count columns to team_profiles
ALTER TABLE team_profiles 
ADD COLUMN IF NOT EXISTS linkedin_followers integer,
ADD COLUMN IF NOT EXISTS youtube_followers integer;