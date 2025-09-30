-- Phase 6: Fix RLS policies for custom placement creation
-- Allow authenticated users to create custom placement options

-- Enable authenticated users to insert custom placements
CREATE POLICY "Authenticated users can create custom placements"
ON placement_options
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add updated_at trigger for placement_options
DROP TRIGGER IF EXISTS update_placement_options_updated_at ON placement_options;
CREATE TRIGGER update_placement_options_updated_at
  BEFORE UPDATE ON placement_options
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Add index for faster placement searches (used in PackageBuilderStep)
CREATE INDEX IF NOT EXISTS idx_placement_options_category ON placement_options(category);
CREATE INDEX IF NOT EXISTS idx_placement_options_name ON placement_options(name);
CREATE INDEX IF NOT EXISTS idx_placement_options_is_popular ON placement_options(is_popular) WHERE is_popular = true;

-- Add draft_data column to sponsorship_offers if not exists (for progressive saving)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sponsorship_offers' 
    AND column_name = 'draft_data'
  ) THEN
    ALTER TABLE sponsorship_offers 
    ADD COLUMN draft_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create index for draft offers (performance optimization)
CREATE INDEX IF NOT EXISTS idx_sponsorship_offers_status_user 
ON sponsorship_offers(user_id, status) 
WHERE status = 'draft';

COMMENT ON POLICY "Authenticated users can create custom placements" ON placement_options IS 
'Allows users to create custom placement options through the PackageBuilderStep';

COMMENT ON INDEX idx_placement_options_category IS 
'Optimizes placement filtering by category in PackageBuilderStep';

COMMENT ON INDEX idx_sponsorship_offers_status_user IS 
'Optimizes draft offer retrieval for progressive saving';