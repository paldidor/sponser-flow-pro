-- Phase 2.8: Add Reach Metric to Team Profiles
-- Reach = Digital Presence followers + Total Players (families)

-- Add reach column
ALTER TABLE team_profiles 
ADD COLUMN reach INTEGER;

-- Create function to calculate reach
CREATE OR REPLACE FUNCTION calculate_team_reach()
RETURNS TRIGGER AS $$
DECLARE
  total_followers INTEGER;
  player_count INTEGER;
BEGIN
  -- Sum all social media followers + email list
  total_followers := COALESCE(NEW.instagram_followers, 0) 
                   + COALESCE(NEW.facebook_followers, 0)
                   + COALESCE(NEW.twitter_followers, 0)
                   + COALESCE(NEW.linkedin_followers, 0)
                   + COALESCE(NEW.youtube_followers, 0)
                   + COALESCE(NEW.email_list_size, 0);
  
  -- Parse number_of_players (stored as text like "15-20", "30-40")
  -- Extract the upper bound or single value
  IF NEW.number_of_players IS NOT NULL THEN
    -- Handle ranges like "15-20" → take upper bound (20)
    -- Handle single values like "25" → take that value
    player_count := COALESCE(
      CAST(
        CASE 
          WHEN NEW.number_of_players ~ '^\d+$' THEN NEW.number_of_players
          WHEN NEW.number_of_players ~ '^\d+-\d+$' THEN 
            split_part(NEW.number_of_players, '-', 2)
          ELSE '0'
        END 
      AS INTEGER),
      0
    );
  ELSE
    player_count := 0;
  END IF;
  
  -- Reach = Digital Presence + Players (families)
  NEW.reach := total_followers + player_count;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate on INSERT/UPDATE
CREATE TRIGGER trg_calculate_reach
  BEFORE INSERT OR UPDATE ON team_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_team_reach();

-- Backfill existing records
UPDATE team_profiles SET updated_at = updated_at;