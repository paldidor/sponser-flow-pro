-- Add tiktok_link column to business_profiles table for business onboarding refactor
ALTER TABLE business_profiles
ADD COLUMN tiktok_link TEXT;

COMMENT ON COLUMN business_profiles.tiktok_link IS 'TikTok profile URL for the business';