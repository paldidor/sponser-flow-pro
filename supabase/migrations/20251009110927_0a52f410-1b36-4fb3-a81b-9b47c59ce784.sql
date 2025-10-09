-- Add new columns to business_profiles table
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS main_values jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS company_bio text,
  ADD COLUMN IF NOT EXISTS number_of_employees text,
  ADD COLUMN IF NOT EXISTS markets_served text,
  ADD COLUMN IF NOT EXISTS instagram_link text,
  ADD COLUMN IF NOT EXISTS facebook_link text,
  ADD COLUMN IF NOT EXISTS linkedin_link text,
  ADD COLUMN IF NOT EXISTS youtube_link text,
  ADD COLUMN IF NOT EXISTS twitter_link text,
  ADD COLUMN IF NOT EXISTS sources jsonb DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.business_profiles.main_values IS 'Core values of the business (array)';
COMMENT ON COLUMN public.business_profiles.company_bio IS 'Detailed description of the business';
COMMENT ON COLUMN public.business_profiles.number_of_employees IS 'Employee count or range (e.g., "50-100")';
COMMENT ON COLUMN public.business_profiles.markets_served IS 'Geographic scope (e.g., "International", "Regional")';
COMMENT ON COLUMN public.business_profiles.sources IS 'JSON object tracking data source URLs for each field';