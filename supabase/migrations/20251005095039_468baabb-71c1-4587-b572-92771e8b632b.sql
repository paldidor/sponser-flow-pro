-- Fix security warning: Add search_path to calculate_team_reach function
CREATE OR REPLACE FUNCTION calculate_team_reach()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
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
  IF NEW.number_of_players IS NOT NULL THEN
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
$$;