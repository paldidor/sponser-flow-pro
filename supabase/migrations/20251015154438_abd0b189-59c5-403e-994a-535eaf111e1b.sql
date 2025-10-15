-- Drop the function with CASCADE to automatically drop dependent triggers
DROP FUNCTION IF EXISTS public.trg_insert_team_sponsorship_combined() CASCADE;

-- Add comment for documentation
COMMENT ON TABLE sponsorship_offers IS 'Use JOIN with team_profiles to get combined data. Legacy team_sponsorship_combined table removed.';