-- Phase 1: Add Analysis Status Tracking to business_profiles
ALTER TABLE business_profiles
ADD COLUMN analysis_status TEXT CHECK (analysis_status IN ('pending', 'completed', 'failed', 'timeout')),
ADD COLUMN analysis_started_at TIMESTAMPTZ,
ADD COLUMN analysis_error TEXT;

-- Phase 8: Reset zombie profiles (incomplete but marked complete)
UPDATE business_profiles
SET 
  onboarding_completed = false,
  current_onboarding_step = 'business_profile',
  analysis_status = 'failed',
  analysis_error = 'Profile was incomplete, requires re-onboarding'
WHERE 
  onboarding_completed = true 
  AND (
    business_name IS NULL OR business_name = '' OR
    industry IS NULL OR industry = '' OR
    city IS NULL OR city = '' OR
    state IS NULL OR state = ''
  );

-- Add helpful comment
COMMENT ON COLUMN business_profiles.analysis_status IS 'Tracks website analysis state: pending, completed, failed, timeout';
COMMENT ON COLUMN business_profiles.analysis_started_at IS 'When website analysis was initiated';
COMMENT ON COLUMN business_profiles.analysis_error IS 'Error message if analysis failed';