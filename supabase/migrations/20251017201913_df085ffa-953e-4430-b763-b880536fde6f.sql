-- Add duration-specific fields to sponsorship_offers table
ALTER TABLE sponsorship_offers 
ADD COLUMN season_start_date DATE,
ADD COLUMN season_end_date DATE,
ADD COLUMN duration_years INTEGER;

-- Add helpful comments
COMMENT ON COLUMN sponsorship_offers.season_start_date IS 'Start date for season-based sponsorships';
COMMENT ON COLUMN sponsorship_offers.season_end_date IS 'End date for season-based sponsorships';
COMMENT ON COLUMN sponsorship_offers.duration_years IS 'Number of years for multi-year sponsorships (e.g., 2, 3, 5)';